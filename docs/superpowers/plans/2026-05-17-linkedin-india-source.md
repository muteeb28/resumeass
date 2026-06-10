# LinkedIn India Job Source Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add LinkedIn India as a third India-board source using the LinkedIn public guest jobs endpoint with Cheerio HTML parsing, strict 48h timestamp enforcement, and the existing category system — no new categories, no browser automation, no auth.

**Architecture:** `linkedinIndia.js` follows the same `{ name, sourceKey, fetch(signal) }` interface as `remoteOkIndia.js`. The LinkedIn guest endpoint is called for 12 conservative search terms sequentially with polite inter-request delays. Only cards with a valid `time[datetime]` ISO timestamp in the past 48 hours are accepted. `INDIA_SOURCES` in `normalizer.js` is extended to `'linkedin-india'`; categories are mapped by the existing `mapToCategories()`. The ingestion passes an AbortController signal to LinkedIn India (same pattern as Talentd). LinkedIn failure does NOT abort the ingestion run.

**Tech Stack:** Node.js ESM, Cheerio 1.2.0 (already installed), Vitest, AbortController/AbortSignal

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `server/services/jobPipeline/sources/linkedinIndia.js` | **Create** | Source: fetch LinkedIn guest API, parse HTML, reject bad timestamps |
| `server/services/jobPipeline/sources/linkedinIndia.test.js` | **Create** | Unit tests for all parser + fetch behaviours |
| `server/services/jobPipeline/normalizer.js` | **Modify** line 9 | Add `'linkedin-india'` to `INDIA_SOURCES` Set |
| `server/services/jobPipeline/ingestion.js` | **Modify** lines 19, 25, 96–103 | Import `linkedinIndia`, add to `ALL_SOURCES`, pass AbortSignal |
| `server/services/jobPipeline/ingestion.test.js` | **Modify** | Add LinkedIn India mock + India mode tests |

---

### Task 1: Write failing parser tests

**Files:**
- Create: `server/services/jobPipeline/sources/linkedinIndia.test.js`

- [ ] **Step 1: Write the test file**

```js
// server/services/jobPipeline/sources/linkedinIndia.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const NOW_MS = new Date('2026-05-17T10:00:00.000Z').getTime();
const H48_MS = 48 * 60 * 60 * 1000;

// ─── HTML fixture helpers ─────────────────────────────────────────────────────

function makeCardHtml({ title, company, location, href, datetime } = {}) {
  return `
    <li>
      <a class="base-card__full-link" href="${href ?? 'https://www.linkedin.com/jobs/view/3987654321?trk=xyz'}"></a>
      <h3 class="base-search-card__title">${title ?? 'Software Engineer'}</h3>
      <h4 class="base-search-card__subtitle">${company ?? 'Acme Corp'}</h4>
      <span class="job-search-card__location">${location ?? 'Bengaluru, Karnataka, India'}</span>
      <time datetime="${datetime ?? '2026-05-17T08:00:00.000Z'}">2 hours ago</time>
    </li>`;
}

function makePageHtml(cards) {
  return `<ul>${cards.map(makeCardHtml).join('')}</ul>`;
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('linkedinIndia — extractJobId', () => {
  let extractJobId;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./linkedinIndia.js');
    extractJobId = mod.extractJobId;
  });

  it('extracts numeric job id from full LinkedIn URL', () => {
    expect(extractJobId('https://www.linkedin.com/jobs/view/3987654321?trk=xyz')).toBe('3987654321');
  });

  it('extracts job id from canonical URL without query params', () => {
    expect(extractJobId('https://www.linkedin.com/jobs/view/1234567890')).toBe('1234567890');
  });

  it('returns null for non-LinkedIn URLs', () => {
    expect(extractJobId('https://example.com/jobs/123')).toBe(null);
  });

  it('returns null for null input', () => {
    expect(extractJobId(null)).toBe(null);
  });

  it('returns null for empty string', () => {
    expect(extractJobId('')).toBe(null);
  });
});

describe('linkedinIndia — canonicalizeUrl', () => {
  let canonicalizeUrl;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./linkedinIndia.js');
    canonicalizeUrl = mod.canonicalizeUrl;
  });

  it('strips tracking params and returns canonical URL', () => {
    expect(canonicalizeUrl('https://www.linkedin.com/jobs/view/3987654321?trk=xyz&refId=abc'))
      .toBe('https://www.linkedin.com/jobs/view/3987654321');
  });

  it('returns canonical URL unchanged when already canonical', () => {
    expect(canonicalizeUrl('https://www.linkedin.com/jobs/view/3987654321'))
      .toBe('https://www.linkedin.com/jobs/view/3987654321');
  });

  it('returns null when URL has no recognisable job id', () => {
    expect(canonicalizeUrl('https://www.linkedin.com/jobs/search')).toBe(null);
  });
});

describe('linkedinIndia — parseListingHtml', () => {
  let parseListingHtml;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
    vi.resetModules();
    const mod = await import('./linkedinIndia.js');
    parseListingHtml = mod.parseListingHtml;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ─── field extraction ───────────────────────────────────────────────────────

  it('extracts title from .base-search-card__title', () => {
    const html = makePageHtml([{ title: 'Frontend Developer' }]);
    const jobs = parseListingHtml(html);
    expect(jobs[0].title).toBe('Frontend Developer');
  });

  it('extracts company from .base-search-card__subtitle', () => {
    const html = makePageHtml([{ company: 'Google India' }]);
    const jobs = parseListingHtml(html);
    expect(jobs[0].company).toBe('Google India');
  });

  it('extracts location from .job-search-card__location', () => {
    const html = makePageHtml([{ location: 'Mumbai, Maharashtra, India' }]);
    const jobs = parseListingHtml(html);
    expect(jobs[0].location).toBe('Mumbai, Maharashtra, India');
  });

  it('extracts canonical URL from a.base-card__full-link — strips tracking params', () => {
    const html = makePageHtml([{ href: 'https://www.linkedin.com/jobs/view/9876543210?trk=abc&refId=xyz' }]);
    const jobs = parseListingHtml(html);
    expect(jobs[0].url).toBe('https://www.linkedin.com/jobs/view/9876543210');
  });

  it('extracts sourcePostedAt from time[datetime]', () => {
    const dt = '2026-05-17T07:00:00.000Z';
    const html = makePageHtml([{ datetime: dt }]);
    const jobs = parseListingHtml(html);
    expect(jobs[0].sourcePostedAt).toBeInstanceOf(Date);
    expect(jobs[0].sourcePostedAt.toISOString()).toBe(dt);
  });

  it('sets sourceId as "linkedin-india-{jobId}"', () => {
    const html = makePageHtml([{ href: 'https://www.linkedin.com/jobs/view/3987654321' }]);
    const jobs = parseListingHtml(html);
    expect(jobs[0].sourceId).toBe('linkedin-india-3987654321');
  });

  it('sets sourceJobId to the extracted job id string', () => {
    const html = makePageHtml([{ href: 'https://www.linkedin.com/jobs/view/3987654321' }]);
    const jobs = parseListingHtml(html);
    expect(jobs[0].sourceJobId).toBe('3987654321');
  });

  it('sets source to "linkedin-india"', () => {
    const html = makePageHtml([{}]);
    const jobs = parseListingHtml(html);
    expect(jobs[0].source).toBe('linkedin-india');
  });

  it('sets sourceLabel to "LinkedIn India"', () => {
    const html = makePageHtml([{}]);
    const jobs = parseListingHtml(html);
    expect(jobs[0].sourceLabel).toBe('LinkedIn India');
  });

  // ─── timestamp rejection ────────────────────────────────────────────────────

  it('rejects a card with no time[datetime]', () => {
    const html = `
      <ul><li>
        <a class="base-card__full-link" href="https://www.linkedin.com/jobs/view/111"></a>
        <h3 class="base-search-card__title">Engineer</h3>
        <h4 class="base-search-card__subtitle">Acme</h4>
        <span class="job-search-card__location">India</span>
      </li></ul>`;
    const jobs = parseListingHtml(html);
    expect(jobs).toHaveLength(0);
  });

  it('rejects a card whose time[datetime] is not a valid ISO date', () => {
    const html = makePageHtml([{ datetime: 'not-a-date' }]);
    const jobs = parseListingHtml(html);
    expect(jobs).toHaveLength(0);
  });

  it('rejects a card whose time[datetime] is in the future (> 60s ahead)', () => {
    const futureIso = new Date(NOW_MS + 120_000).toISOString(); // 2 min ahead
    const html = makePageHtml([{ datetime: futureIso }]);
    const jobs = parseListingHtml(html);
    expect(jobs).toHaveLength(0);
  });

  it('accepts a card whose time[datetime] is 47 hours ago (within 48h gate)', () => {
    const dt = new Date(NOW_MS - 47 * 60 * 60 * 1000).toISOString();
    const html = makePageHtml([{ datetime: dt }]);
    const jobs = parseListingHtml(html);
    expect(jobs).toHaveLength(1);
  });

  // The normalizer enforces the 48h gate; the parser accepts if datetime is valid and not future.
  // A 49h-old job will be accepted by the parser but rejected by the normalizer.
  it('accepts a card whose time[datetime] is 49 hours ago (normalizer rejects it later)', () => {
    const dt = new Date(NOW_MS - 49 * 60 * 60 * 1000).toISOString();
    const html = makePageHtml([{ datetime: dt }]);
    const jobs = parseListingHtml(html);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].sourcePostedAt.getTime()).toBe(NOW_MS - 49 * 60 * 60 * 1000);
  });

  // ─── dedup / multi-card ────────────────────────────────────────────────────

  it('returns multiple jobs when the page has multiple valid cards', () => {
    const html = makePageHtml([
      { title: 'Job A', href: 'https://www.linkedin.com/jobs/view/111' },
      { title: 'Job B', href: 'https://www.linkedin.com/jobs/view/222' },
    ]);
    const jobs = parseListingHtml(html);
    expect(jobs).toHaveLength(2);
  });

  // ─── block-page / empty ────────────────────────────────────────────────────

  it('returns empty array for empty string input', () => {
    expect(parseListingHtml('')).toEqual([]);
  });

  it('returns empty array for null input', () => {
    expect(parseListingHtml(null)).toEqual([]);
  });

  it('returns empty array for short captcha/auth page', () => {
    const blockHtml = '<html><body>Please sign in to view this page. authwall challenge</body></html>';
    expect(parseListingHtml(blockHtml)).toEqual([]);
  });

  // ─── remote flag ──────────────────────────────────────────────────────────

  it('sets remote=true when location contains "Remote"', () => {
    const html = makePageHtml([{ location: 'Remote (India)' }]);
    const jobs = parseListingHtml(html);
    expect(jobs[0].remote).toBe(true);
  });

  it('sets remote=false when location is a city', () => {
    const html = makePageHtml([{ location: 'Bengaluru, Karnataka, India' }]);
    const jobs = parseListingHtml(html);
    expect(jobs[0].remote).toBe(false);
  });
});

// ─── category mapping (via normalizer) ───────────────────────────────────────

describe('linkedinIndia — category mapping via mapToCategories', () => {
  let mapToCategories;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../categoryMapper.js');
    mapToCategories = mod.mapToCategories;
  });

  it('maps "Software Engineer" title to IT/Software', () => {
    const cats = mapToCategories({ title: 'Software Engineer', tags: [], location: 'India', remote: false, jobType: '' });
    expect(cats).toContain('IT/Software');
  });

  it('maps "Software Engineer Intern" to Internship and IT/Software', () => {
    const cats = mapToCategories({ title: 'Software Engineer Intern', tags: [], location: 'India', remote: false, jobType: '' });
    expect(cats).toContain('Internship');
    expect(cats).toContain('IT/Software');
  });

  it('maps "Entry Level Software Engineer" to Fresher and IT/Software', () => {
    const cats = mapToCategories({ title: 'Entry Level Software Engineer', tags: [], location: 'India', remote: false, jobType: '' });
    expect(cats).toContain('Fresher');
    expect(cats).toContain('IT/Software');
  });

  it('does not infer Batch 2025 without explicit batch/year text', () => {
    const cats = mapToCategories({ title: 'Software Engineer', tags: [], location: 'India', remote: false, jobType: '' });
    expect(cats).not.toContain('Batch 2025');
  });

  it('does not infer Batch 2026 without explicit batch/year text', () => {
    const cats = mapToCategories({ title: 'Graduate Engineer', tags: [], location: 'India', remote: false, jobType: '' });
    expect(cats).not.toContain('Batch 2026');
  });

  it('maps title with "Batch 2026" explicitly to Batch 2026', () => {
    const cats = mapToCategories({ title: 'Software Engineer Batch 2026', tags: [], location: 'India', remote: false, jobType: '' });
    expect(cats).toContain('Batch 2026');
  });
});

// ─── fetch (mocked network) ───────────────────────────────────────────────────

describe('linkedinIndia — fetch', () => {
  let fetchJobs;

  const RECENT_ISO = new Date(NOW_MS - 3 * 60 * 60 * 1000).toISOString(); // 3h ago

  function makeLinkedInPage(jobs = [{ title: 'Software Engineer', href: 'https://www.linkedin.com/jobs/view/1000000001', datetime: RECENT_ISO }]) {
    return makePageHtml(jobs);
  }

  function mockFetchOk(html) {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok:   true,
      status: 200,
      text: () => Promise.resolve(html),
    });
  }

  function mockFetchStatus(status) {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status });
  }

  function mockFetchThrow(err) {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(err);
  }

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
    vi.resetModules();
    const mod = await import('./linkedinIndia.js');
    fetchJobs = mod.fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns jobs when LinkedIn guest endpoint responds with valid HTML', async () => {
    mockFetchOk(makeLinkedInPage());
    const jobs = await fetchJobs();
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
  });

  it('returns empty array on HTTP 403 (rate-limit/block)', async () => {
    mockFetchStatus(403);
    const jobs = await fetchJobs();
    expect(jobs).toEqual([]);
  });

  it('returns empty array on HTTP 999 (LinkedIn anti-bot status)', async () => {
    mockFetchStatus(999);
    const jobs = await fetchJobs();
    expect(jobs).toEqual([]);
  });

  it('returns empty array on HTTP 429 (too many requests)', async () => {
    mockFetchStatus(429);
    const jobs = await fetchJobs();
    expect(jobs).toEqual([]);
  });

  it('returns empty array when fetch throws a network error', async () => {
    mockFetchThrow(new TypeError('Failed to fetch'));
    const jobs = await fetchJobs();
    expect(jobs).toEqual([]);
  });

  it('returns empty array when LinkedIn returns empty HTML', async () => {
    mockFetchOk('');
    const jobs = await fetchJobs();
    expect(jobs).toEqual([]);
  });

  it('deduplicates jobs with the same LinkedIn job id across different search terms', async () => {
    // Same job id in all responses
    const sameHtml = makePageHtml([{
      title: 'Software Engineer',
      href:  'https://www.linkedin.com/jobs/view/1234567890',
      datetime: RECENT_ISO,
    }]);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, status: 200, text: () => Promise.resolve(sameHtml),
    });
    const jobs = await fetchJobs();
    const ids = jobs.map(j => j.sourceJobId);
    expect(new Set(ids).size).toBe(ids.length); // no duplicate ids
  });

  it('stops fetching when global AbortSignal fires', async () => {
    const controller = new AbortController();
    controller.abort();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, status: 200, text: () => Promise.resolve(makeLinkedInPage()),
    });
    // Should return quickly (aborted), not hang
    const jobs = await fetchJobs(controller.signal);
    expect(Array.isArray(jobs)).toBe(true);
  });

  it('passes an AbortSignal to globalThis.fetch for timeout enforcement', async () => {
    let capturedSignal;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, opts) => {
      capturedSignal = opts?.signal;
      return { ok: true, status: 200, text: () => Promise.resolve(makeLinkedInPage()) };
    });
    await fetchJobs();
    expect(capturedSignal).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```
npx vitest run server/services/jobPipeline/sources/linkedinIndia.test.js
```

Expected: FAIL — `Cannot find module './linkedinIndia.js'`

---

### Task 2: Create stub + implement parser functions

**Files:**
- Create: `server/services/jobPipeline/sources/linkedinIndia.js`

- [ ] **Step 1: Create the source file with all exported functions**

```js
// server/services/jobPipeline/sources/linkedinIndia.js
import * as cheerio from 'cheerio';

export const name      = 'LinkedIn India';
export const sourceKey = 'linkedin-india';

const LINKEDIN_GUEST_API      = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
const GEO_ID                  = '102713980'; // India
const REQUEST_TIMEOUT_MS      = 15_000;
const INTER_REQUEST_DELAY_MS  = 600;
const MAX_PAGES_PER_TERM      = 2;

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
 * Returns null when no job id can be extracted.
 */
export function canonicalizeUrl(url) {
  const id = extractJobId(url);
  return id ? `https://www.linkedin.com/jobs/view/${id}` : null;
}

/**
 * Parse the HTML response from the LinkedIn guest jobs endpoint.
 * Returns an array of raw job objects. Cards with missing or invalid
 * time[datetime] are silently dropped. The normalizer's 48h gate is
 * the final freshness authority.
 */
export function parseListingHtml(html) {
  if (!html || typeof html !== 'string') return [];

  // Block page / CAPTCHA / authwall detection (short page with auth keywords)
  if (html.length < 5000 && /challenge|captcha|authwall|sign.?in/i.test(html)) return [];

  const $    = cheerio.load(html);
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

    // Reject if datetime is missing
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
  url.searchParams.set('f_TPR',    'r172800'); // prefer last 48h
  url.searchParams.set('start',    String(start));
  return url.toString();
}

/**
 * Fetches one LinkedIn page. Returns:
 *   { html: string, blocked: false }  — success
 *   { html: null,   blocked: false }  — network error / timeout (continue to next term)
 *   { html: null,   blocked: true  }  — 403/429/999 (stop crawl)
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
      console.warn(`[LinkedIn India] HTTP ${res.status} for "${keyword}" start=${start} — stopping`);
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
 * Runs search terms sequentially with polite delays.
 * Deduplicates by LinkedIn job ID across all terms.
 * Gracefully returns partial results if rate-limited.
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

      if (allJobs.length > 0 || page > 0) {
        await delay(INTER_REQUEST_DELAY_MS);
      }

      let result;
      try {
        result = await fetchPage(keyword, start, signal);
      } catch (err) {
        if (signal?.aborted) break; // global abort: stop all
        console.warn(`[LinkedIn India] Unexpected error for "${keyword}": ${err.message}`);
        break;
      }

      if (result.blocked) {
        blocked = true;
        break;
      }

      if (!result.html) break; // timeout / network error: skip remaining pages for this term

      const pageJobs = parseListingHtml(result.html);

      if (pageJobs.length === 0) break; // no jobs: no more pages for this term

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
```

- [ ] **Step 2: Run tests — parser tests should now pass**

```
npx vitest run server/services/jobPipeline/sources/linkedinIndia.test.js
```

Expected: All parser tests PASS. Fetch tests may need mock adjustments — check output.

- [ ] **Step 3: Fix any remaining test failures from output above**

If any test fails, fix the implementation code (not the tests) to match.

- [ ] **Step 4: Run full test suite to ensure nothing broke**

```
npx vitest run
```

Expected: All existing tests still PASS.

- [ ] **Step 5: Commit**

```
git add server/services/jobPipeline/sources/linkedinIndia.js server/services/jobPipeline/sources/linkedinIndia.test.js
git commit -m "feat: add LinkedIn India source with Cheerio HTML parser and 48h timestamp gate"
```

---

### Task 3: Add linkedin-india to INDIA_SOURCES and register in ingestion

**Files:**
- Modify: `server/services/jobPipeline/normalizer.js` line 9
- Modify: `server/services/jobPipeline/ingestion.js` lines 19, 25, 96–103

- [ ] **Step 1: Write the failing test for india mode to include LinkedIn India**

Add a new `describe` block to the **bottom** of `server/services/jobPipeline/ingestion.test.js`:

```js
// ─── LinkedIn India mode ─────────────────────────────────────────────────────
// Add at top of file alongside other mock fn declarations:
// const mockLinkedInIndiaFetch = vi.fn();
// vi.mock('./sources/linkedinIndia.js', () => ({ fetch: mockLinkedInIndiaFetch, name: 'LinkedIn India', sourceKey: 'linkedin-india' }));

const FRESH_3H_LINKEDIN = NOW_MS - 3 * 60 * 60 * 1000;

function makeLinkedInIndiaRawJob(overrides = {}) {
  return {
    sourceId:       'linkedin-india-9876543210',
    sourceJobId:    '9876543210',
    title:          'Software Engineer',
    company:        'Google India',
    location:       'Bengaluru, Karnataka, India',
    url:            'https://www.linkedin.com/jobs/view/9876543210',
    remote:         false,
    tags:           [],
    source:         'linkedin-india',
    sourceLabel:    'LinkedIn India',
    sourcePostedAt: new Date(FRESH_3H_LINKEDIN),
    ...overrides,
  };
}

describe('LinkedIn India mode ingestion', () => {
  let modLinkedIn;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
    vi.resetModules();

    mockUpdateMany.mockResolvedValue({ modifiedCount: 0 });

    vi.mock('../../models/Job.model.js', () => ({
      default: { bulkWrite: mockBulkWrite, updateMany: mockUpdateMany },
    }));
    vi.mock('./sources/remotive.js',       () => ({ fetch: mockRemotiveFetch,       name: 'Remotive',        sourceKey: 'remotive' }));
    vi.mock('./sources/remoteOk.js',       () => ({ fetch: mockRemoteOkFetch,        name: 'RemoteOK',        sourceKey: 'remoteok' }));
    vi.mock('./sources/himalayas.js',      () => ({ fetch: mockHimalayasFetch,       name: 'Himalayas',       sourceKey: 'himalayas' }));
    vi.mock('./sources/workingNomads.js',  () => ({ fetch: mockWorkingNomadsFetch,   name: 'Working Nomads',  sourceKey: 'workingnomads' }));
    vi.mock('./sources/jobicy.js',         () => ({ fetch: mockJobicyFetch,          name: 'Jobicy',          sourceKey: 'jobicy' }));
    vi.mock('./sources/weWorkRemotely.js', () => ({ fetch: mockWeWorkFetch,          name: 'We Work Remotely', sourceKey: 'weworkremotely' }));
    vi.mock('./sources/jobspresso.js',     () => ({ fetch: mockJobspressoFetch,      name: 'Jobspresso',      sourceKey: 'jobspresso' }));
    vi.mock('./sources/authenticjobs.js',  () => ({ fetch: mockAuthenticFetch,       name: 'Authentic Jobs',  sourceKey: 'authenticjobs' }));
    vi.mock('./sources/dynamitejobs.js',   () => ({ fetch: mockDynamiteFetch,        name: 'Dynamite Jobs',   sourceKey: 'dynamitejobs' }));
    vi.mock('./sources/themuse.js',        () => ({ fetch: mockTheMuseFetch,         name: 'The Muse',        sourceKey: 'themuse' }));
    vi.mock('./sources/greenhouse.js',     () => ({ fetch: mockGreenhouseFetch,      name: 'Greenhouse',      sourceKey: 'greenhouse' }));
    vi.mock('./sources/lever.js',          () => ({ fetch: mockLeverFetch,           name: 'Lever',           sourceKey: 'lever' }));
    vi.mock('./sources/arcdev.js',         () => ({ fetch: mockArcdevFetch,          name: 'Arc.dev',         sourceKey: 'arcdev' }));
    vi.mock('./sources/talentd.js',        () => ({ fetch: mockTalentdFetch,         name: 'Talentd',         sourceKey: 'talentd' }));
    vi.mock('./sources/remoteOkIndia.js',  () => ({ fetch: mockRemoteOkIndiaFetch,   name: 'RemoteOK India',  sourceKey: 'remoteok-india' }));
    vi.mock('./sources/linkedinIndia.js',  () => ({ fetch: mockLinkedInIndiaFetch,   name: 'LinkedIn India',  sourceKey: 'linkedin-india' }));

    [mockRemotiveFetch, mockRemoteOkFetch, mockHimalayasFetch, mockWorkingNomadsFetch,
     mockJobicyFetch, mockWeWorkFetch, mockJobspressoFetch, mockAuthenticFetch,
     mockDynamiteFetch, mockTheMuseFetch, mockGreenhouseFetch, mockLeverFetch,
     mockArcdevFetch, mockRemoteOkIndiaFetch, mockLinkedInIndiaFetch].forEach(m => m.mockResolvedValue([]));

    mockBulkWrite.mockResolvedValue({ upsertedCount: 0, modifiedCount: 0 });
    process.env.JOB_SOURCE_MODE = 'india';
    modLinkedIn = await import('./ingestion.js');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete process.env.JOB_SOURCE_MODE;
  });

  it('JOB_SOURCE_MODE=india runs talentd, remoteok-india, and linkedin-india', async () => {
    mockTalentdFetch.mockResolvedValue([]);
    mockRemoteOkIndiaFetch.mockResolvedValue([]);
    mockLinkedInIndiaFetch.mockResolvedValue([makeLinkedInIndiaRawJob()]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    const stats = await modLinkedIn.runIngestion();

    expect(mockTalentdFetch).toHaveBeenCalled();
    expect(mockRemoteOkIndiaFetch).toHaveBeenCalled();
    expect(mockLinkedInIndiaFetch).toHaveBeenCalled();
    expect(mockRemotiveFetch).not.toHaveBeenCalled();
    expect(stats.total).toBe(1);
  });

  it('saves a fresh LinkedIn India job', async () => {
    mockTalentdFetch.mockResolvedValue([]);
    mockRemoteOkIndiaFetch.mockResolvedValue([]);
    mockLinkedInIndiaFetch.mockResolvedValue([makeLinkedInIndiaRawJob()]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    const stats = await modLinkedIn.runIngestion();
    expect(stats.total).toBe(1);
  });

  it('rejects a LinkedIn India job with null sourcePostedAt', async () => {
    mockTalentdFetch.mockResolvedValue([]);
    mockRemoteOkIndiaFetch.mockResolvedValue([]);
    mockLinkedInIndiaFetch.mockResolvedValue([
      makeLinkedInIndiaRawJob({ sourcePostedAt: null }),
    ]);

    const stats = await modLinkedIn.runIngestion();
    expect(stats.total).toBe(0);
    expect(mockBulkWrite).not.toHaveBeenCalled();
  });

  it('rejects a LinkedIn India job older than 48h', async () => {
    const stale = new Date(NOW_MS - 49 * 60 * 60 * 1000);
    mockTalentdFetch.mockResolvedValue([]);
    mockRemoteOkIndiaFetch.mockResolvedValue([]);
    mockLinkedInIndiaFetch.mockResolvedValue([
      makeLinkedInIndiaRawJob({ sourcePostedAt: stale }),
    ]);

    const stats = await modLinkedIn.runIngestion();
    expect(stats.total).toBe(0);
    expect(mockBulkWrite).not.toHaveBeenCalled();
  });

  it('LinkedIn India failure does NOT abort the india mode run', async () => {
    mockTalentdFetch.mockResolvedValue([]);
    mockRemoteOkIndiaFetch.mockResolvedValue([makeRemoteOkIndiaRawJob()]);
    mockLinkedInIndiaFetch.mockRejectedValue(new Error('LinkedIn network error'));
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    const stats = await modLinkedIn.runIngestion();
    // RemoteOK India job still saved; LinkedIn failure is non-fatal
    expect(stats.total).toBe(1);
  });

  it('passes an AbortSignal to linkedinIndia.fetch', async () => {
    let receivedSignal;
    mockLinkedInIndiaFetch.mockImplementation(async (signal) => {
      receivedSignal = signal;
      return [];
    });
    mockTalentdFetch.mockResolvedValue([]);
    mockRemoteOkIndiaFetch.mockResolvedValue([]);
    mockUpdateMany.mockResolvedValue({ modifiedCount: 0 });

    await modLinkedIn.runIngestion();

    expect(receivedSignal).toBeInstanceOf(AbortSignal);
  });

  it('does not mark linkedin-india jobs inactive (they age out via 48h filter)', async () => {
    mockTalentdFetch.mockResolvedValue([]);
    mockRemoteOkIndiaFetch.mockResolvedValue([]);
    mockLinkedInIndiaFetch.mockResolvedValue([makeLinkedInIndiaRawJob()]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });
    mockUpdateMany.mockResolvedValue({ modifiedCount: 0 });

    await modLinkedIn.runIngestion();

    // updateMany is only called for talentd — never for linkedin-india
    const calls = mockUpdateMany.mock.calls;
    for (const [filter] of calls) {
      expect(filter.source).not.toBe('linkedin-india');
    }
  });
});
```

- [ ] **Step 2: Run only the new tests to verify they fail**

```
npx vitest run server/services/jobPipeline/ingestion.test.js --reporter=verbose 2>&1 | tail -30
```

Expected: New `LinkedIn India mode ingestion` tests FAIL — `linkedin-india` not in `INDIA_SOURCES`

- [ ] **Step 3: Update existing India mode test — add LinkedIn India**

In `ingestion.test.js`, find the test `'runs talentd and remoteok-india — not other sources'` and update it:

```js
// BEFORE:
it('runs talentd and remoteok-india — not other sources', async () => {
  mockTalentdFetch.mockResolvedValue([makeTalentdRawJob()]);
  mockRemoteOkIndiaFetch.mockResolvedValue([makeRemoteOkIndiaRawJob()]);
  mockBulkWrite.mockResolvedValue({ upsertedCount: 2, modifiedCount: 0 });

  const stats = await modIndia.runIngestion();

  expect(mockTalentdFetch).toHaveBeenCalled();
  expect(mockRemoteOkIndiaFetch).toHaveBeenCalled();
  expect(mockRemotiveFetch).not.toHaveBeenCalled();
  expect(stats.total).toBe(2);
});

// AFTER (add linkedin-india mock to beforeEach and update assertion):
// In the 'India mode ingestion' beforeEach, add:
//   vi.mock('./sources/linkedinIndia.js', () => ({ fetch: mockLinkedInIndiaFetch, name: 'LinkedIn India', sourceKey: 'linkedin-india' }));
//   mockLinkedInIndiaFetch.mockResolvedValue([]);  // added to defaults

it('runs talentd, remoteok-india, and linkedin-india — not other sources', async () => {
  mockTalentdFetch.mockResolvedValue([makeTalentdRawJob()]);
  mockRemoteOkIndiaFetch.mockResolvedValue([makeRemoteOkIndiaRawJob()]);
  mockLinkedInIndiaFetch.mockResolvedValue([]);
  mockBulkWrite.mockResolvedValue({ upsertedCount: 2, modifiedCount: 0 });

  const stats = await modIndia.runIngestion();

  expect(mockTalentdFetch).toHaveBeenCalled();
  expect(mockRemoteOkIndiaFetch).toHaveBeenCalled();
  expect(mockLinkedInIndiaFetch).toHaveBeenCalled();
  expect(mockRemotiveFetch).not.toHaveBeenCalled();
  expect(stats.total).toBe(2);
});
```

- [ ] **Step 4: Add linkedin-india to INDIA_SOURCES in normalizer.js**

Edit line 9 of `server/services/jobPipeline/normalizer.js`:

```js
// BEFORE:
export const INDIA_SOURCES = new Set(['talentd', 'remoteok-india']);

// AFTER:
export const INDIA_SOURCES = new Set(['talentd', 'remoteok-india', 'linkedin-india']);
```

- [ ] **Step 5: Import linkedinIndia and add to ALL_SOURCES in ingestion.js**

Add import after line 19:
```js
import * as linkedinIndia  from './sources/linkedinIndia.js';
```

Update `ALL_SOURCES` array (line 21-26) to include `linkedinIndia`:
```js
const ALL_SOURCES = [
  remotive, remoteOk, himalayas, workingNomads, jobicy,
  weWorkRemotely, jobspresso, authenticjobs, dynamitejobs,
  themuse, greenhouse, lever, arcdev,
  talentd, remoteOkIndia, linkedinIndia,
];
```

- [ ] **Step 6: Pass AbortSignal to linkedinIndia in ingestion.js**

Update the fetch dispatch block in `runIngestion()` to add an AbortController for LinkedIn India (same pattern as Talentd):

```js
// BEFORE:
const talentdController = new AbortController();

const results = await Promise.allSettled(
  activeSources.map((s) => {
    if (s.sourceKey === 'talentd') {
      return withTimeout(s.fetch(talentdController.signal), s.name, SOURCE_TIMEOUT_MS, talentdController);
    }
    return withTimeout(s.fetch(), s.name, SOURCE_TIMEOUT_MS);
  })
);

// AFTER:
const talentdController      = new AbortController();
const linkedinIndiaController = new AbortController();

const results = await Promise.allSettled(
  activeSources.map((s) => {
    if (s.sourceKey === 'talentd') {
      return withTimeout(s.fetch(talentdController.signal), s.name, SOURCE_TIMEOUT_MS, talentdController);
    }
    if (s.sourceKey === 'linkedin-india') {
      return withTimeout(s.fetch(linkedinIndiaController.signal), s.name, SOURCE_TIMEOUT_MS, linkedinIndiaController);
    }
    return withTimeout(s.fetch(), s.name, SOURCE_TIMEOUT_MS);
  })
);
```

- [ ] **Step 7: Add mockLinkedInIndiaFetch to all existing beforeEach blocks in ingestion.test.js**

Every `describe` block in `ingestion.test.js` has a `beforeEach` that calls `vi.mock(...)` for all sources. Add this to ALL of them:

```js
vi.mock('./sources/linkedinIndia.js', () => ({ fetch: mockLinkedInIndiaFetch, name: 'LinkedIn India', sourceKey: 'linkedin-india' }));
```

And add `mockLinkedInIndiaFetch` to the default "return []" arrays:
```js
// e.g.:
[mockRemotiveFetch, ..., mockRemoteOkIndiaFetch, mockLinkedInIndiaFetch].forEach(m => m.mockResolvedValue([]));
```

Also add the mock function declaration at the top of the file (with the other mock fn declarations):
```js
const mockLinkedInIndiaFetch = vi.fn();
```

- [ ] **Step 8: Run all tests**

```
npx vitest run
```

Expected: ALL tests PASS — including all existing Talentd, RemoteOK India, ingestion, normalizer, and categoryMapper tests.

- [ ] **Step 9: Commit**

```
git add server/services/jobPipeline/normalizer.js server/services/jobPipeline/ingestion.js server/services/jobPipeline/ingestion.test.js
git commit -m "feat: register LinkedIn India in INDIA_SOURCES and ingestion pipeline"
```

---

### Task 4: Live verification

- [ ] **Step 1: Run all tests one final time**

```
npx vitest run
```

Expected: ALL tests PASS.

- [ ] **Step 2: Verify LinkedIn source fetches live jobs in isolation**

Create a quick manual smoke-test script `server/services/jobPipeline/test-linkedin-india.mjs`:

```js
import * as linkedinIndia from './sources/linkedinIndia.js';
import { normalizeJob } from './normalizer.js';

const start = Date.now();
console.log('[LinkedIn India Test] Starting live fetch...');

const raw = await linkedinIndia.fetch();

const normalized = raw.map(normalizeJob).filter(Boolean);
const rejected   = raw.length - normalized.length;
const byCategory = {};
for (const j of normalized) {
  const cats = j.categories ?? ['(no category)'];
  for (const c of cats) byCategory[c] = (byCategory[c] ?? 0) + 1;
}

const durationS = ((Date.now() - start) / 1000).toFixed(1);

console.log('');
console.log('═══ LinkedIn India Live Verification ═══');
console.log(`Raw fetched:    ${raw.length}`);
console.log(`Accepted <48h:  ${normalized.length}`);
console.log(`Rejected:       ${rejected}`);
console.log(`Duration:       ${durationS}s`);
console.log('');
console.log('Jobs by category:');
for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`);
}

if (normalized.length > 0) {
  console.log('');
  console.log('Sample job:');
  const s = normalized[0];
  console.log(`  Title:      ${s.title}`);
  console.log(`  Company:    ${s.company}`);
  console.log(`  Location:   ${s.location}`);
  console.log(`  URL:        ${s.url}`);
  console.log(`  postedAt:   ${s.postedAt?.toISOString()}`);
  console.log(`  categories: ${(s.categories ?? []).join(', ')}`);
}

const uniqueIds = new Set(raw.map(j => j.sourceJobId));
const hasDups   = uniqueIds.size < raw.length;
console.log('');
console.log(`Duplicate LinkedIn job IDs: ${hasDups ? 'YES (investigate!)' : 'none'}`);
```

Run:
```
node --input-type=module < server/services/jobPipeline/test-linkedin-india.mjs
```

Or:
```
node server/services/jobPipeline/test-linkedin-india.mjs
```

- [ ] **Step 3: Report findings**

After running the smoke test, report:
- How many LinkedIn jobs were raw-fetched
- How many were accepted (within 48h)
- How many were rejected and why
- Whether LinkedIn returned 403/429/999 (blocked)
- Sample job fields
- Category distribution
- Whether it is safe to keep
- Recommended ingestion frequency

---

## Self-Review Checklist

**Spec coverage:**

| Requirement | Covered by |
|-------------|-----------|
| LinkedIn guest endpoint + Cheerio (no auth, no Playwright) | Task 2 `linkedinIndia.js` |
| `source=linkedin-india`, `sourceLabel=LinkedIn India` | Task 2 source constants |
| `geoId=102713980`, `sortBy=DD`, `f_TPR=r172800` | Task 2 `buildUrl()` |
| Reject missing `time[datetime]` | Task 2 `parseListingHtml()` |
| Reject invalid `time[datetime]` | Task 2 `parseListingHtml()` |
| Reject future timestamp | Task 2 `parseListingHtml()` |
| 48h gate enforcement | normalizer.js (existing) + Task 3 |
| Stable job ID from URL | Task 2 `extractJobId()` |
| Canonical URL (no tracking params) | Task 2 `canonicalizeUrl()` |
| AbortController / timeout | Task 2 `fetchPage()` |
| Graceful failure on 403/999/captcha | Task 2 `fetchPage()` + `parseListingHtml()` |
| Polite delays | Task 2 `delay()` between requests |
| Source-level dedup by job ID | Task 2 `seen` Set in `fetch()` |
| Categories via existing `mapToCategories()` | normalizer.js (existing, unchanged) |
| No new categories | No changes to `categoryMapper.js` |
| `INDIA_SOURCES` updated | Task 3 `normalizer.js` |
| Registered in ingestion pipeline | Task 3 `ingestion.js` |
| `JOB_SOURCE_MODE=india` includes LinkedIn | Task 3 `ingestion.js` filter |
| LinkedIn failure non-fatal to india run | Task 3 `ingestion.js` (no abort on LI fail) |
| No mark-inactive for LinkedIn | Task 3 `ingestion.js` (updateMany only targets talentd) |
| TDD (tests before implementation) | Task 1 → Task 2 order |
| All 24+ test cases from spec | Task 1 test file |
| Existing Talentd/RemoteOK tests unbroken | Task 2 + 3 (no changes to those files) |

**Type consistency:** `sourceJobId` is always a string (LinkedIn numeric ID). `sourcePostedAt` is always a `Date`. `url` is always the canonical string from `canonicalizeUrl()`.

**No placeholders:** All steps contain actual code.
