import { guessJobType } from '../classifier.js';

export const name = 'Talentd';
export const sourceKey = 'talentd';

const HOUR_MS   = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const MAX_HOURS = 48; // strict: 48h+ is rejected, not just at the boundary

/**
 * Parse a Talentd visible relative timestamp into an absolute Date.
 * Returns null for any input that cannot be confidently placed within 48 hours.
 * The caller is responsible for the freshness gate (< 48h check).
 */
export function parseRelativeTimestamp(rawText, scrapeStartedAt) {
  if (!rawText || typeof rawText !== 'string') return null;
  const text = rawText.trim().toLowerCase();
  const startMs = scrapeStartedAt.getTime();

  const mins = text.match(/^(\d+)\s*minutes?\s*ago$/);
  if (mins) return new Date(startMs - parseInt(mins[1], 10) * MINUTE_MS);

  const hours = text.match(/^(\d+)\s*hours?\s*ago$/);
  if (hours) {
    const h = parseInt(hours[1], 10);
    if (h >= MAX_HOURS) return null;
    return new Date(startMs - h * HOUR_MS);
  }

  const days = text.match(/^(\d+)\s*days?\s*ago$/);
  if (days) {
    if (parseInt(days[1], 10) >= 2) return null;
    return new Date(startMs - 24 * HOUR_MS); // exactly "1 day ago"
  }

  return null;
}

/**
 * Returns an AbortSignal that fires when either the global ingestion signal fires
 * or the per-request timeout elapses — whichever comes first.
 *
 * Fallback for environments without AbortSignal.any enforces both independently.
 */
export function combineSignals(globalSignal, timeoutMs) {
  if (!globalSignal) return AbortSignal.timeout(timeoutMs);
  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any([globalSignal, AbortSignal.timeout(timeoutMs)]);
  }
  // Manual fallback: enforce both the global ingestion abort and the per-request timeout.
  const controller = new AbortController();
  let timer;
  const onGlobalAbort = () => {
    clearTimeout(timer);
    controller.abort(globalSignal.reason);
  };
  timer = setTimeout(
    () => controller.abort(new DOMException('The operation timed out.', 'TimeoutError')),
    timeoutMs,
  );
  globalSignal.addEventListener('abort', onGlobalAbort, { once: true });
  return controller.signal;
}

// 999 = effectively unlimited — real stop condition is dry-page detection
const MAX_PAGES_DEFAULT        = 999;
const CAT_CONCURRENCY_DEFAULT  = 3;
const PAGE_CONCURRENCY_DEFAULT = 10;

export const TALENTD_CATEGORIES = [
  { name: 'Fresher',           baseUrl: 'https://www.talentd.in/jobs/freshers' },
  { name: 'Internship',        baseUrl: 'https://www.talentd.in/jobs/internships' },
  { name: 'Remote',            baseUrl: 'https://www.talentd.in/jobs',                     params: { employment_type: 'remote' } },
  { name: 'IT/Software',       baseUrl: 'https://www.talentd.in/jobs/it-software-jobs' },
  { name: 'Core Engineering',  baseUrl: 'https://www.talentd.in/jobs/core-engineering-jobs' },
  { name: 'Batch 2026',        baseUrl: 'https://www.talentd.in/jobs',                     params: { batch: '2026' } },
  { name: 'Batch 2025',        baseUrl: 'https://www.talentd.in/jobs',                     params: { batch: '2025' } },
  { name: 'Full Time',         baseUrl: 'https://www.talentd.in/jobs',                     params: { employment_type: 'full-time' } },
  { name: 'Design',            baseUrl: 'https://www.talentd.in/jobs/design-jobs' },
  { name: 'Sales & Marketing', baseUrl: 'https://www.talentd.in/jobs/sales-marketing-jobs' },
];

// Priority order for choosing the primary display category when a job appears
// in multiple Talentd category pages.  Lower index = higher priority.
export const CATEGORY_PRIORITY = [
  'Internship',
  'Fresher',
  'Design',
  'IT/Software',
  'Core Engineering',
  'Sales & Marketing',
  'Batch 2026',
  'Batch 2025',
  'Remote',
  'Full Time',
];

const CITY_MAP = {
  hyderabad: 'Hyderabad', bengaluru: 'Bengaluru', bangalore: 'Bengaluru',
  mumbai: 'Mumbai', chennai: 'Chennai', pune: 'Pune',
  delhi: 'New Delhi', noida: 'Noida', gurgaon: 'Gurugram',
  gurugram: 'Gurugram', kolkata: 'Kolkata', ahmedabad: 'Ahmedabad',
};

function deriveLocation(slug) {
  const s = slug.toLowerCase();
  for (const [key, city] of Object.entries(CITY_MAP)) {
    if (s.includes(key)) return `${city}, India`;
  }
  return 'India';
}

function decode(str) {
  return str
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\\u0026/g, '&');
}

function parseRsc(html) {
  const pushRe = /self\.__next_f\.push\(\[1,"((?:[^"\\]|\\.)*)"\]\)/gs;
  const parts = [];
  let m;
  while ((m = pushRe.exec(html)) !== null) parts.push(m[1]);
  return parts.join('').replace(/\\"/g, '"').replace(/\\n/g, '');
}

const BACKWARD_WINDOW = 600; // chars; Structure A gap is ~130, between-card distance ~1200
const DETAIL_CONCURRENCY_DEFAULT = 5;

// Fetches the Talentd detail page for a job slug and extracts the datePosted
// ISO string from the schema.org JobPosting RSC block.  Returns a Date or null.
export async function fetchDetailTimestamp(slug, signal) {
  try {
    const res = await globalThis.fetch(`https://www.talentd.in/jobs/${slug}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html,application/xhtml+xml' },
      signal: combineSignals(signal, 20000),
    });
    if (!res.ok) return null;
    const rsc   = parseRsc(await res.text());
    const match = rsc.match(/"datePosted"\s*:\s*"([^"]+)"/);
    if (!match) return null;
    const d = new Date(match[1]);
    if (isNaN(d.getTime())) return null;
    // Reject implausible future dates (more than 1 minute ahead).
    if (d.getTime() > Date.now() + 60_000) return null;
    return d;
  } catch {
    return null;
  }
}

// For each Structure X job (rawPostedText === null), fetch the detail page and
// attach detailSourcePostedAt + metadata.  Mutates pageJobs in place.
async function enrichWithDetailTimestamps(pageJobs, signal) {
  const parsed     = parseInt(process.env.TALENTD_DETAIL_CONCURRENCY ?? '', 10);
  const DETAIL_CONC = Number.isFinite(parsed) && parsed > 0 ? parsed : DETAIL_CONCURRENCY_DEFAULT;

  for (const job of pageJobs) {
    if (job.rawPostedText !== null) job.timestampSource = 'listing';
  }

  const structureX = pageJobs.filter(j => j.rawPostedText === null);
  for (let i = 0; i < structureX.length; i += DETAIL_CONC) {
    const batch   = structureX.slice(i, i + DETAIL_CONC);
    const results = await Promise.allSettled(batch.map(j => fetchDetailTimestamp(j.slug, signal)));
    if (signal?.aborted) throw signal.reason;
    for (let k = 0; k < batch.length; k++) {
      const r = results[k];
      if (r.status === 'fulfilled' && r.value instanceof Date) {
        batch[k].detailSourcePostedAt = r.value;
        batch[k].sourceDatePostedRaw  = r.value.toISOString();
        batch[k].timestampSource      = 'detail';
      }
    }
  }
}

// Returns true if any job on the page has a trusted timestamp within 48 h of scrapeStartedAt.
// Checks both listing-paired (rawPostedText) and detail-fallback (detailSourcePostedAt) sources.
// Used for early-stop: a page is "dry" only when this returns false.
function hasFreshJob(pageJobs, scrapeStartedAt) {
  const cutoff = scrapeStartedAt.getTime() - 48 * HOUR_MS;
  for (const job of pageJobs) {
    const ts = job.detailSourcePostedAt instanceof Date
      ? job.detailSourcePostedAt
      : parseRelativeTimestamp(job.rawPostedText, scrapeStartedAt);
    if (ts !== null && ts.getTime() >= cutoff) return true;
  }
  return false;
}

export function parseListingJobs(html, logPrefix = '[Talentd]') {
  const rsc = parseRsc(html);
  const tsRe = /\],"(\d+\s*(?:minutes?|hours?|days?)\s*ago)"\]/gi;

  const cardRe = /"jobSlug":"([^"]+)","jobTitle":"([^"]+)","companyName":"([^"]+)","jobUrl":"([^"]+)","variant":"card"/g;
  const jobs = [];
  let j;
  while ((j = cardRe.exec(rsc)) !== null) {
    const [, slug, title, company, jobUrl] = j;
    // Per-job: scan the 600 chars immediately before this slug for the nearest timestamp.
    // Structure A gap is ~130 chars; between-card distance is ~1200 chars, so neighboring
    // cards' timestamps are safely outside this window.
    const window = rsc.slice(Math.max(0, j.index - BACKWARD_WINDOW), j.index);
    const matches = [...window.matchAll(tsRe)];
    const rawPostedText = matches.length > 0 ? matches[matches.length - 1][1] : null;
    jobs.push({ slug, title: decode(title), company: decode(company), jobUrl, rawPostedText });
  }

  if (jobs.length > 0) {
    const paired   = jobs.filter(jb => jb.rawPostedText !== null).length;
    const unpaired = jobs.length - paired;
    console.log(`${logPrefix}: ${jobs.length} listings, ${paired} timestamp-paired, ${unpaired} rejected-unpaired`);
  }

  return jobs;
}

export function parseTotalPages(html) {
  const rsc = parseRsc(html);
  for (const re of [/"totalPages"\s*:\s*(\d+)/, /"total_pages"\s*:\s*(\d+)/, /"pageCount"\s*:\s*(\d+)/]) {
    const m = rsc.match(re);
    if (m) return parseInt(m[1], 10);
  }
  const m2 = html.match(/Page\s+\d+\s+of\s+(\d+)/i);
  if (m2) return parseInt(m2[1], 10);
  return null;
}

// Extracts the "1763 jobs found" total count Talentd displays
export function parseTotalJobCount(html) {
  const rsc = parseRsc(html);
  for (const re of [/"jobsCount"\s*:\s*(\d+)/, /"totalCount"\s*:\s*(\d+)/, /"count"\s*:\s*(\d+)/]) {
    const m = rsc.match(re);
    if (m) return parseInt(m[1], 10);
  }
  const m2 = html.match(/(\d[\d,]+)\s+(?:fresher\s+)?jobs?\s+found/i);
  if (m2) return parseInt(m2[1].replace(/,/g, ''), 10);
  const m3 = html.match(/(\d[\d,]+)\s+active\s+job\s+openings/i);
  if (m3) return parseInt(m3[1].replace(/,/g, ''), 10);
  return null;
}

export function categorySlug(catName) {
  return catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
}

export function buildPageUrl(cat, page) {
  const url = new URL(cat.baseUrl);
  if (cat.params) {
    for (const [k, v] of Object.entries(cat.params)) url.searchParams.set(k, v);
  }
  if (page > 1) url.searchParams.set('page', String(page));
  return url.toString();
}

async function fetchListingHtml(cat, page, signal) {
  try {
    const res = await globalThis.fetch(buildPageUrl(cat, page), {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html,application/xhtml+xml' },
      signal: combineSignals(signal, 20000),
    });
    if (!res.ok) {
      console.error(`[Talentd/${cat.name}] HTTP ${res.status} page ${page}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    if (err.name === 'AbortError') {
      if (signal?.aborted) throw err; // global ingestion abort: propagate to stop the category
      return null;              // per-request timeout only: silently skip this page
    }
    console.error(`[Talentd/${cat.name}] page ${page} error: ${err.message}`);
    return null;
  }
}

// Returns the highest-priority Talentd display category from the merged set.
export function primaryCategory(categories) {
  for (const cat of CATEGORY_PRIORITY) {
    if (categories.includes(cat)) return cat;
  }
  return categories[0] ?? 'Other';
}

// Derives the stored jobType from the merged category set and job title.
// Talentd's Internship category is editorially curated and reliable, so it wins
// over all other signals.  'Full Time' is a browsing bucket (not a type
// declaration) and never overrides a more specific signal.  For every other
// case the title is the ground truth.
function mergedJobType(categories, title) {
  if (categories.includes('Internship')) return 'Internship';
  return guessJobType(title);
}

/**
 * After all category pages are scraped, group raw job objects by sourceId
 * (which is now slug-based, not category-based) and merge them into one
 * document per real job.  Exported for unit testing.
 */
export function mergeBySlug(jobs) {
  const bySlug = new Map();

  for (const job of jobs) {
    const existing = bySlug.get(job.sourceId);
    if (!existing) {
      bySlug.set(job.sourceId, { ...job });
      continue;
    }
    // Accumulate every category the slug appeared in (no duplicates)
    for (const cat of job.categories) {
      if (!existing.categories.includes(cat)) existing.categories.push(cat);
    }
    // remote=true if any category source reported it as remote
    if (job.remote) existing.remote = true;
    // Timestamp preference: detail > listing (absolute beats relative).
    // Within the same source kind, keep the most-recent reading.
    const upgradeToDetail =
      job.timestampSource === 'detail' && existing.timestampSource !== 'detail';
    const sameSourceMoreRecent =
      job.timestampSource === existing.timestampSource &&
      job.sourcePostedAt instanceof Date &&
      existing.sourcePostedAt instanceof Date &&
      job.sourcePostedAt > existing.sourcePostedAt;
    if (upgradeToDetail || sameSourceMoreRecent) {
      existing.sourcePostedAt  = job.sourcePostedAt;
      existing.rawPostedText   = job.rawPostedText;
      existing.timestampSource = job.timestampSource;
      if (job.sourceDatePostedRaw != null) existing.sourceDatePostedRaw = job.sourceDatePostedRaw;
    }
  }

  // Finalise: set category (priority-picked display label) and jobType on each merged entry.
  return Array.from(bySlug.values()).map(job => ({
    ...job,
    category: primaryCategory(job.categories),
    jobType:  mergedJobType(job.categories, job.title),
  }));
}

function buildJob(cat, raw, scrapeStartedAt) {
  // Identity is slug-only so the same real job from different category pages
  // maps to the same MongoDB document after mergeBySlug.
  const sourcePostedAt = raw.detailSourcePostedAt instanceof Date
    ? raw.detailSourcePostedAt
    : (raw.rawPostedText ? parseRelativeTimestamp(raw.rawPostedText, scrapeStartedAt) : null);
  return {
    sourceId:      `talentd-${raw.slug}`,
    title:         raw.title,
    company:       raw.company,
    location:      deriveLocation(raw.slug),
    url:           raw.jobUrl,
    remote:        cat.name === 'Remote',
    // category and jobType are set by mergeBySlug after all categories are collected
    categories:    [cat.name],
    source:        sourceKey,
    sourceLabel:   'Talentd',
    rawPostedText: raw.rawPostedText ?? null,
    sourcePostedAt,
    ...(raw.sourceDatePostedRaw != null ? { sourceDatePostedRaw: raw.sourceDatePostedRaw } : {}),
    ...(raw.timestampSource     != null ? { timestampSource:     raw.timestampSource     } : {}),
  };
}

// Stop a category after this many consecutive pages with zero recoverable fresh jobs.
// A page is fresh if at least one job has a trusted sourcePostedAt within 48 h,
// via listing timestamp OR detail-page datePosted fallback.
const DRY_PAGE_LIMIT = 3;

async function fetchCategory(cat, signal) {
  if (signal?.aborted) throw signal.reason;

  const MAX_PAGES = parseInt(process.env.TALENTD_MAX_PAGES_PER_CATEGORY ?? String(MAX_PAGES_DEFAULT), 10);
  const PAGE_CONC = parseInt(process.env.TALENTD_PAGE_CONCURRENCY       ?? String(PAGE_CONCURRENCY_DEFAULT), 10);
  const scrapeStartedAt = new Date(); // fixed reference for all relative timestamps this run
  const seen            = new Set();
  const jobs            = [];

  function collect(pageJobs) {
    for (const raw of pageJobs) {
      if (seen.has(raw.slug)) continue;
      seen.add(raw.slug);
      jobs.push(buildJob(cat, raw, scrapeStartedAt));
    }
  }

  // ── Page 1: discover total pages + total job count ─────────────────────────
  const page1Html = await fetchListingHtml(cat, 1, signal);
  if (!page1Html) {
    console.log(`[Talentd/${cat.name}] skipped — page 1 failed`);
    return jobs;
  }

  const totalPages    = parseTotalPages(page1Html);
  const totalOnSource = parseTotalJobCount(page1Html);
  const page1Jobs     = parseListingJobs(page1Html, `[Talentd/${cat.name}] page 1`);
  const pagesToScrape = totalPages ? Math.min(MAX_PAGES, totalPages) : MAX_PAGES;

  console.log(
    `[Talentd/${cat.name}] page 1 → ${page1Jobs.length} listings` +
    (totalOnSource ? ` | total on Talentd: ${totalOnSource}` : '') +
    (totalPages ? ` | pages available: ${totalPages} | scraping up to: ${pagesToScrape}` : '')
  );

  await enrichWithDetailTimestamps(page1Jobs, signal);
  collect(page1Jobs);

  // ── Pages 2..N: parallel page batches with early-stop ──────────────────────
  // dryPageCount tracks consecutive pages with zero recoverable fresh jobs.
  // A page resets the counter if hasFreshJob() returns true after detail fallback.
  let dryPageCount = 0;

  for (let batchStart = 2; batchStart <= pagesToScrape && dryPageCount < DRY_PAGE_LIMIT; batchStart += PAGE_CONC) {
    if (signal?.aborted) throw signal.reason;

    const batchEnd  = Math.min(batchStart + PAGE_CONC - 1, pagesToScrape);
    const pageNums  = Array.from({ length: batchEnd - batchStart + 1 }, (_, i) => batchStart + i);
    const htmlBatch = await Promise.allSettled(pageNums.map(n => fetchListingHtml(cat, n, signal)));
    if (signal?.aborted) throw signal.reason;

    for (let ri = 0; ri < htmlBatch.length && dryPageCount < DRY_PAGE_LIMIT; ri++) {
      const r = htmlBatch[ri];
      if (r.status !== 'fulfilled' || !r.value) continue; // fetch failure: skip, don't affect dry count
      const pageJobs = parseListingJobs(r.value, `[Talentd/${cat.name}] page ${pageNums[ri]}`);
      if (pageJobs.length === 0) {
        dryPageCount++;
        continue;
      }
      await enrichWithDetailTimestamps(pageJobs, signal);
      if (signal?.aborted) throw signal.reason;
      if (hasFreshJob(pageJobs, scrapeStartedAt)) {
        dryPageCount = 0;
      } else {
        dryPageCount++;
      }
      collect(pageJobs);
    }
  }

  const suffix = totalOnSource ? ` (Talentd shows ${totalOnSource} total)` : '';
  console.log(`[Talentd/${cat.name}] unique scraped: ${jobs.length}${suffix}`);

  return jobs;
}

export async function fetch(signal) {
  const CAT_CONC = parseInt(process.env.TALENTD_CATEGORY_CONCURRENCY ?? String(CAT_CONCURRENCY_DEFAULT), 10);
  const allJobs  = [];

  for (let i = 0; i < TALENTD_CATEGORIES.length; i += CAT_CONC) {
    if (signal?.aborted) break;
    const batch   = TALENTD_CATEGORIES.slice(i, i + CAT_CONC);
    const results = await Promise.allSettled(batch.map(cat => fetchCategory(cat, signal)));

    for (let j = 0; j < batch.length; j++) {
      const r = results[j];
      if (r.status === 'fulfilled') {
        allJobs.push(...r.value);
      } else {
        // Suppress expected AbortError noise after global cancellation; log real failures.
        const isAbort = r.reason?.name === 'AbortError' || signal?.aborted;
        if (!isAbort) {
          console.error(`[Talentd] "${batch[j].name}" failed: ${r.reason?.message}`);
        }
      }
    }
  }

  // Merge same-slug jobs from different category pages into one document each.
  const merged = mergeBySlug(allJobs);
  console.log(`[Talentd] ── total ${merged.length} jobs across all categories (${allJobs.length} raw) ──`);
  return merged;
}
