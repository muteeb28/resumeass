import * as cheerio from 'cheerio';

export const name      = 'LinkedIn India';
export const sourceKey = 'linkedin-india';

const LINKEDIN_GUEST_API = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
const GEO_ID             = '102713980'; // India
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_PAGES_PER_TERM = 2;

// Configurable via env so tests can set it to 0 (module is re-evaluated after vi.resetModules())
const INTER_REQUEST_DELAY_MS = parseInt(process.env.LINKEDIN_INDIA_DELAY_MS ?? '600', 10);

const SEARCH_TERMS = [
  'software engineer',
  'frontend developer',
  'backend developer',
  'full stack developer',
  'data analyst',
  'data engineer',
  'software intern',
  'graduate engineer',
  'entry level developer',
  'fresher developer',
  'react developer',
  'node.js developer',
];

/**
 * Extracts the LinkedIn numeric job ID from a job URL.
 * e.g. https://www.linkedin.com/jobs/view/3987654321?trk=xyz → '3987654321'
 */
export function extractJobId(url) {
  if (!url || typeof url !== 'string') return null;
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/jobs\/view\/(\d+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * Returns the canonical LinkedIn job URL by stripping all tracking params.
 * Returns null when no job ID can be extracted.
 */
export function canonicalizeUrl(url) {
  const id = extractJobId(url);
  return id ? `https://www.linkedin.com/jobs/view/${id}` : null;
}

/**
 * Parses the HTML response from the LinkedIn guest jobs endpoint.
 * Cards with missing, invalid, or future time[datetime] are silently dropped.
 * The normalizer's 48h gate is the final freshness authority.
 */
export function parseListingHtml(html) {
  if (!html || typeof html !== 'string') return [];

  // Block page / CAPTCHA / authwall detection — short page with auth keywords
  if (html.length < 5000 && /challenge|captcha|authwall|sign.?in/i.test(html)) return [];

  const $ = cheerio.load(html);
  const jobs = [];
  const now  = Date.now();

  $('li').each((_, el) => {
    const $el = $(el);

    const title    = $el.find('.base-search-card__title').text().trim();
    const company  = $el.find('.base-search-card__subtitle').text().trim();
    const location = $el.find('.job-search-card__location').text().trim();
    const rawUrl   = $el.find('a.base-card__full-link').attr('href') || '';
    const datetime = $el.find('time').attr('datetime') || '';

    if (!title || !company || !rawUrl) return;

    const jobId = extractJobId(rawUrl);
    if (!jobId) return;

    // Reject cards with no datetime — trusted timestamp is mandatory
    if (!datetime) return;

    const ts = new Date(datetime);
    if (isNaN(ts.getTime())) return;

    // Reject implausible future timestamps (> 60s ahead of now)
    if (ts.getTime() > now + 60_000) return;

    jobs.push({
      sourceId:      `linkedin-india-${jobId}`,
      sourceJobId:   jobId,
      title,
      company,
      location:      location || 'India',
      url:           canonicalizeUrl(rawUrl),
      source:        sourceKey,
      sourceLabel:   name,
      sourcePostedAt: ts,
      remote:        /remote/i.test(location),
      tags:          [],
    });
  });

  return jobs;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function buildUrl(keyword, start) {
  const url = new URL(LINKEDIN_GUEST_API);
  url.searchParams.set('keywords', keyword);
  url.searchParams.set('geoId',    GEO_ID);
  url.searchParams.set('sortBy',   'DD');
  url.searchParams.set('f_TPR',    'r172800'); // 48h window
  url.searchParams.set('start',    String(start));
  return url.toString();
}

/**
 * Fetches one LinkedIn guest page.
 * Returns: { html: string, blocked: false }  — success
 *          { html: null,   blocked: false }  — network/timeout error (skip page)
 *          { html: null,   blocked: true  }  — 403/429/999 (stop crawl)
 */
async function fetchPage(keyword, start, signal) {
  let timeoutSignal;
  if (typeof AbortSignal.timeout === 'function') {
    timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  } else {
    const tc = new AbortController();
    setTimeout(() => tc.abort(new DOMException('Timeout', 'TimeoutError')), REQUEST_TIMEOUT_MS);
    timeoutSignal = tc.signal;
  }

  let fetchSignal = timeoutSignal;
  if (signal && typeof AbortSignal.any === 'function') {
    fetchSignal = AbortSignal.any([signal, timeoutSignal]);
  }

  try {
    const res = await globalThis.fetch(buildUrl(keyword, start), {
      headers: {
        'User-Agent':      'Mozilla/5.0 (compatible; ResumeBot/1.0)',
        'Accept':          'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: fetchSignal,
    });

    if (res.status === 403 || res.status === 429 || res.status === 999) {
      console.warn(`[LinkedIn India] HTTP ${res.status} for "${keyword}" start=${start} — stopping crawl`);
      return { html: null, blocked: true };
    }

    if (!res.ok) {
      console.warn(`[LinkedIn India] HTTP ${res.status} for "${keyword}" start=${start}`);
      return { html: null, blocked: false };
    }

    return { html: await res.text(), blocked: false };
  } catch (err) {
    if (signal?.aborted) throw err; // propagate global ingestion abort
    const n = err?.name;
    if (n === 'AbortError' || n === 'TimeoutError') {
      console.warn(`[LinkedIn India] Timeout for "${keyword}" start=${start}`);
      return { html: null, blocked: false };
    }
    console.warn(`[LinkedIn India] Fetch error for "${keyword}" start=${start}: ${err.message}`);
    return { html: null, blocked: false };
  }
}

/**
 * Fetches LinkedIn India jobs for all search terms.
 * Runs terms sequentially with polite inter-request delays.
 * Deduplicates by LinkedIn job ID. Returns partial results on block/rate-limit.
 */
export async function fetch(signal) {
  const seen    = new Set();
  const allJobs = [];
  let   blocked = false;

  for (const keyword of SEARCH_TERMS) {
    if (signal?.aborted) break;
    if (blocked) break;

    for (let page = 0; page < MAX_PAGES_PER_TERM; page++) {
      if (signal?.aborted) break;

      const start = page * 25;

      // Polite delay: skip on first request of first term to avoid unnecessary wait
      if (allJobs.length > 0 || page > 0) {
        await delay(INTER_REQUEST_DELAY_MS);
      }

      let result;
      try {
        result = await fetchPage(keyword, start, signal);
      } catch (err) {
        if (signal?.aborted) break;
        console.warn(`[LinkedIn India] Unexpected error for "${keyword}": ${err.message}`);
        break;
      }

      if (result.blocked) {
        blocked = true;
        break;
      }

      if (!result.html) break; // timeout/error: skip remaining pages for this term

      const pageJobs = parseListingHtml(result.html);

      if (pageJobs.length === 0) break; // no results: no more pages for this term

      for (const job of pageJobs) {
        if (!seen.has(job.sourceJobId)) {
          seen.add(job.sourceJobId);
          allJobs.push(job);
        }
      }
    }
  }

  if (blocked) {
    console.warn('[LinkedIn India] Rate-limited or blocked — partial results returned');
  }

  console.log(`[LinkedIn India] Total unique jobs fetched: ${allJobs.length}`);
  return allJobs;
}
