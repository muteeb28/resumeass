import { guessJobType } from '../classifier.js';
import { INTENTS, cutoffFromHours } from '../intentTemplates.js';

export const name = 'ActiveJobsDB';
export const sourceKey = 'activejobsdb';

const BASE_URL = 'https://active-jobs-db.p.rapidapi.com/active-ats-1h';
const HOST = 'active-jobs-db.p.rapidapi.com';
// Read at import time so tests can override via env before the module loads.
const CALL_DELAY_MS = parseInt(process.env.ACTIVEJOBS_CALL_DELAY_MS ?? '300', 10);

const cache = new Map();

let _dailyCount = 0;
let _dailyCountDate = '';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getDailyBudget() {
  return parseInt(process.env.ACTIVEJOBS_MAX_CALLS_PER_DAY ?? '10', 10);
}

function getCacheTTLMs() {
  const hours = parseFloat(process.env.ACTIVEJOBS_CACHE_TTL_HOURS ?? '12');
  return hours * 60 * 60 * 1000;
}

function getFreshnessHours() {
  return parseInt(process.env.JOB_SEARCH_FRESHNESS_HOURS ?? '48', 10);
}

// Returns null when no location is configured — caller omits the param entirely.
function buildLocationFilter() {
  const location = (process.env.JOB_SEARCH_LOCATION ?? '').trim();
  if (!location) return null;
  const remote = process.env.JOB_SEARCH_REMOTE !== 'false';
  return remote ? `"${location}" OR "Remote"` : `"${location}"`;
}

function checkAndIncrementBudget() {
  const today = new Date().toISOString().slice(0, 10);
  if (_dailyCountDate !== today) {
    _dailyCount = 0;
    _dailyCountDate = today;
  }
  if (_dailyCount >= getDailyBudget()) return false;
  _dailyCount += 1;
  return true;
}

function extractItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.jobs)) return data.jobs;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function extractPostedAt(item) {
  const raw = item.date_posted ?? item.posted_date ?? item.posted_at ?? item.created ?? item.datePosted;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeItem(item) {
  const title = String(item.title ?? item.job_title ?? '').trim();
  const url = String(item.url ?? item.job_url ?? item.apply_url ?? '').trim();
  if (!title || !url) return null;

  const company = String(
    item.organization ?? item.company_name ?? item.employer_name ?? ''
  ).trim() || 'Unknown';

  const location = String(item.location ?? item.job_location ?? 'Remote').trim();
  const rawDesc = item.text ?? item.description ?? item.job_description ?? '';
  const description = rawDesc ? String(rawDesc).slice(0, 500) : undefined;
  const id = String(item.id ?? item.job_id ?? url).trim();
  const isRemote =
    process.env.JOB_SEARCH_REMOTE !== 'false' || /remote/i.test(location);

  return {
    sourceId: `${sourceKey}-${id}`,
    title,
    company,
    location,
    url,
    description,
    jobType: guessJobType(title),
    remote: isRemote,
    source: sourceKey,
    sourceLabel: name,
    sourcePostedAt: extractPostedAt(item),
  };
}

export async function fetch() {
  const apiKey = process.env.ACTIVEJOBS_API_KEY;
  if (!apiKey) {
    console.warn('[ActiveJobsDB] ACTIVEJOBS_API_KEY not set — skipping');
    return [];
  }

  const freshnessHours = getFreshnessHours();
  const cutoff = cutoffFromHours(freshnessHours);
  const locationFilter = buildLocationFilter();
  const cacheTTLMs = getCacheTTLMs();

  if (locationFilter) {
    console.log(`[ActiveJobsDB] location filter: ${locationFilter}`);
  } else {
    console.log('[ActiveJobsDB] no location filter — searching all locations');
  }

  const allQueries = [...INTENTS.APM_48H.queries, ...INTENTS.PM_48H.queries];
  const seen = new Set();
  const jobs = [];
  let rateLimited = false;

  for (const query of allQueries) {
    if (rateLimited) break;

    const cacheKey = `${query}::${locationFilter ?? 'global'}`;
    const cached = cache.get(cacheKey);

    if (cached && cached.expiry > Date.now()) {
      console.log(`[ActiveJobsDB] cache hit — "${query}"`);
      for (const job of cached.data) {
        if (!seen.has(job.sourceId)) {
          seen.add(job.sourceId);
          jobs.push(job);
        }
      }
      continue;
    }

    if (!checkAndIncrementBudget()) {
      console.warn(
        `[ActiveJobsDB] daily budget (${getDailyBudget()}) exhausted — stopping at "${query}"`
      );
      break;
    }

    console.log(
      `[ActiveJobsDB] API call #${_dailyCount}/${getDailyBudget()} — query="${query}"`
    );

    try {
      const paramObj = {
        offset: '0',
        title_filter: `"${query}"`,
        description_type: 'text',
      };
      if (locationFilter) paramObj.location_filter = locationFilter;

      const params = new URLSearchParams(paramObj);
      const url = `${BASE_URL}?${params}`;
      const res = await globalThis.fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': HOST,
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 429) {
        console.warn(`[ActiveJobsDB] 429 rate-limited — stopping early, ${getDailyBudget() - _dailyCount} budget remaining`);
        rateLimited = true;
        continue;
      }

      if (!res.ok) {
        console.error(`[ActiveJobsDB] HTTP ${res.status} for "${query}"`);
        continue;
      }

      const data = await res.json();
      const items = extractItems(data);

      console.log(`[ActiveJobsDB] "${query}" → raw items: ${items.length}`);

      const queryJobs = [];

      for (const item of items) {
        const postedAt = extractPostedAt(item);

        // active-ats-1h guarantees the job is currently live in an ATS system.
        // date_posted reflects the original posting date, which is often older
        // than the freshness window. Null it out so the orchestrator treats it
        // as UNKNOWN_DATE (passes through) rather than STALE (dropped).
        const effectivePostedAt = (postedAt && postedAt.getTime() >= cutoff) ? postedAt : null;

        const job = normalizeItem(item);
        if (!job) continue;
        job.sourcePostedAt = effectivePostedAt;

        if (seen.has(job.sourceId)) continue;
        seen.add(job.sourceId);

        queryJobs.push(job);
        jobs.push(job);
      }

      cache.set(cacheKey, { data: queryJobs, expiry: Date.now() + cacheTTLMs });
    } catch (err) {
      console.error(`[ActiveJobsDB] error for "${query}":`, err.message);
    }

    await sleep(CALL_DELAY_MS);
  }

  console.log(`[ActiveJobsDB] returned=${jobs.length}`);
  return jobs;
}
