import { classifyRoleType, guessJobType, normalizeText } from './classifier.js';
import { mapToCategories } from './categoryMapper.js';
import { createHash } from 'crypto';

const TALENTD_FRESHNESS_MS = 48 * 60 * 60 * 1000;

// Sources that serve the India job board — bypass PM/APM classifier,
// get the strict 48h freshness gate, and have categories[] mapped.
export const INDIA_SOURCES = new Set(['talentd', 'remoteok-india']);

function sanitizeDate(val) {
  if (!val) return null;
  const d = val instanceof Date ? val : new Date(val);
  const ms = d.getTime();
  if (isNaN(ms) || ms <= 0 || ms < new Date('2020-01-01').getTime()) return null;
  return d;
}

function deriveSourceJobId(raw) {
  const explicit = String(raw.sourceJobId ?? '').trim();
  if (explicit) return explicit;
  const sid = String(raw.sourceId ?? '').trim();
  if (sid) return sid;
  // last resort: hash of source + url
  return createHash('md5')
    .update(`${raw.source ?? ''}:${raw.url ?? ''}`)
    .digest('hex')
    .slice(0, 24);
}

// Regions that restrict to non-India geography — drop only if EXPLICITLY restricted
const REGION_BLOCKED = /\b(usa?\s+only|united states only|us only|europe only|eu only|uk only|canada only|australia only|latin america only)\b/i;

// Locations that mean "open to everyone" or accessible from India
const GLOBALLY_OPEN = /remote|worldwide|anywhere|global|distributed|all locations|no location|asia|apac|india/i;

/**
 * Returns true if the job is accessible from India:
 *   - location mentions India or Asia/APAC, OR
 *   - location is globally open (Remote, Worldwide, Anywhere, etc.), OR
 *   - job has remote: true and location is not explicitly restricted to another region, OR
 *   - location is blank/unknown
 */
function isIndiaOrGlobalRemote(location, remoteFlag) {
  if (/india/i.test(location)) return true;
  if (REGION_BLOCKED.test(location)) return false;
  if (GLOBALLY_OPEN.test(location)) return true;
  if (remoteFlag) return true; // remote job with no explicit restriction → assume globally open
  return false;
}

/**
 * Takes a raw job object returned by any source and returns a
 * MongoDB-ready normalized job, or null if it should be dropped.
 *
 * Drop criteria:
 *   - missing title or url
 *   - role is not APM or PM
 *   - not accessible from India (not global-remote, not India-located)
 */
export function normalizeJob(raw) {
  const title = String(raw.title ?? '').trim();
  const url   = String(raw.url   ?? '').trim();
  if (!title || !url) return null;

  const source = String(raw.source ?? raw.sourceKey ?? 'unknown');
  const isIndiaSource = INDIA_SOURCES.has(source);

  // India-board sources bypass the PM/APM classifier (stored as INTERN stub).
  // All other sources must classify as PM, APM, or INTERN to pass.
  const roleType = isIndiaSource
    ? 'INTERN'
    : classifyRoleType(title, raw.description ?? '');
  if (!roleType) return null;

  const location = String(raw.location ?? '').trim();
  const isRemote = raw.remote === true || /remote/i.test(location);

  // Location filter — Talentd jobs are always India-based (bypass).
  // All other sources (India or PM) must pass the India/global-remote check.
  if (source !== 'talentd' && !isIndiaOrGlobalRemote(location, isRemote)) return null;

  const sourceLabel = String(raw.sourceLabel ?? source);
  const sourceJobId = deriveSourceJobId(raw);
  const postedAt    = sanitizeDate(raw.postedAt ?? raw.sourcePostedAt);

  // All India-board sources must have a trusted timestamp within the last 48 hours.
  // Missing, future, or stale timestamps are rejected before any DB write.
  if (isIndiaSource) {
    if (!postedAt) return null;
    const ageMs = Date.now() - postedAt.getTime();
    if (ageMs <= 0 || ageMs >= TALENTD_FRESHNESS_MS) return null;
  }

  // Categories: Talentd supplies its own categories[] from the scraper.
  // Other India sources get categories derived from the unified mapper.
  let resolvedCategories;
  if (source === 'talentd') {
    resolvedCategories =
      Array.isArray(raw.categories) && raw.categories.length ? raw.categories : undefined;
  } else if (isIndiaSource) {
    const jobType  = raw.jobType || guessJobType(title);
    const mapped   = mapToCategories({ title, tags: raw.tags, location, remote: isRemote, jobType, description: raw.description });
    resolvedCategories = mapped.length > 0 ? mapped : undefined;
  }

  return {
    sourceId:        raw.sourceId ?? `${source}-${sourceJobId}`,
    sourceJobId,
    title,
    normalizedTitle: normalizeText(title),
    company:         String(raw.company ?? '').trim() || 'Unknown',
    location,
    url,
    description:     raw.description ? String(raw.description).slice(0, 600) : undefined,
    salary:          raw.salary ?? undefined,
    jobType:         raw.jobType || guessJobType(title),
    tags:            Array.isArray(raw.tags) ? raw.tags : [],
    remote:          isRemote,
    source,
    sourceLabel,
    roleType,
    postedAt,
    sourcePostedAt:  postedAt,
    ...(raw.rawPostedText       != null ? { rawPostedText:       raw.rawPostedText       } : {}),
    ...(raw.sourceDatePostedRaw != null ? { sourceDatePostedRaw: raw.sourceDatePostedRaw } : {}),
    ...(raw.timestampSource     != null ? { timestampSource:     raw.timestampSource     } : {}),
    ...(raw.category                    ? { category:            raw.category            } : {}),
    ...(resolvedCategories              ? { categories:          resolvedCategories       } : {}),
  };
}
