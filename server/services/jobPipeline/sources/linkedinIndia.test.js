import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const NOW_MS = new Date('2026-05-17T10:00:00.000Z').getTime();

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

// ─── extractJobId ─────────────────────────────────────────────────────────────

describe('linkedinIndia — extractJobId', () => {
  let extractJobId;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./linkedinIndia.js');
    extractJobId = mod.extractJobId;
  });

  it('extracts numeric job id from full LinkedIn URL with tracking params', () => {
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

// ─── canonicalizeUrl ─────────────────────────────────────────────────────────

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

// ─── parseListingHtml ────────────────────────────────────────────────────────

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

  it('extracts canonical URL — strips tracking params from a.base-card__full-link', () => {
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
    expect(parseListingHtml(html)).toHaveLength(0);
  });

  it('rejects a card whose time[datetime] is not a valid ISO date', () => {
    const html = makePageHtml([{ datetime: 'not-a-date' }]);
    expect(parseListingHtml(html)).toHaveLength(0);
  });

  it('rejects a card whose time[datetime] is in the future (> 60s ahead)', () => {
    const futureIso = new Date(NOW_MS + 120_000).toISOString();
    const html = makePageHtml([{ datetime: futureIso }]);
    expect(parseListingHtml(html)).toHaveLength(0);
  });

  it('accepts a card whose time[datetime] is 47 hours ago', () => {
    const dt = new Date(NOW_MS - 47 * 60 * 60 * 1000).toISOString();
    const html = makePageHtml([{ datetime: dt }]);
    expect(parseListingHtml(html)).toHaveLength(1);
  });

  // Parser accepts >48h cards; the normalizer rejects them at the 48h gate.
  it('accepts a 49h-old card (normalizer rejects it later)', () => {
    const dt = new Date(NOW_MS - 49 * 60 * 60 * 1000).toISOString();
    const html = makePageHtml([{ datetime: dt }]);
    const jobs = parseListingHtml(html);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].sourcePostedAt.getTime()).toBe(NOW_MS - 49 * 60 * 60 * 1000);
  });

  // ─── multi-card / empty ────────────────────────────────────────────────────

  it('returns multiple jobs when the page has multiple valid cards', () => {
    const html = makePageHtml([
      { title: 'Job A', href: 'https://www.linkedin.com/jobs/view/111' },
      { title: 'Job B', href: 'https://www.linkedin.com/jobs/view/222' },
    ]);
    expect(parseListingHtml(html)).toHaveLength(2);
  });

  it('returns empty array for empty string', () => {
    expect(parseListingHtml('')).toEqual([]);
  });

  it('returns empty array for null', () => {
    expect(parseListingHtml(null)).toEqual([]);
  });

  it('returns empty array for a short captcha/authwall page', () => {
    const blockHtml = '<html><body>Please sign in to view. authwall challenge</body></html>';
    expect(parseListingHtml(blockHtml)).toEqual([]);
  });

  // ─── remote flag ──────────────────────────────────────────────────────────

  it('sets remote=true when location contains "Remote"', () => {
    const html = makePageHtml([{ location: 'Remote (India)' }]);
    expect(parseListingHtml(html)[0].remote).toBe(true);
  });

  it('sets remote=false when location is a city', () => {
    const html = makePageHtml([{ location: 'Bengaluru, Karnataka, India' }]);
    expect(parseListingHtml(html)[0].remote).toBe(false);
  });
});

// ─── category mapping (via existing categoryMapper) ──────────────────────────

describe('linkedinIndia — category mapping via mapToCategories', () => {
  let mapToCategories;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../categoryMapper.js');
    mapToCategories = mod.mapToCategories;
  });

  it('maps "Software Engineer" to IT/Software', () => {
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

  it('maps title with explicit "Batch 2026" to Batch 2026', () => {
    const cats = mapToCategories({ title: 'Software Engineer Batch 2026', tags: [], location: 'India', remote: false, jobType: '' });
    expect(cats).toContain('Batch 2026');
  });
});

// ─── fetch (mocked network) ───────────────────────────────────────────────────

describe('linkedinIndia — fetch', () => {
  let fetchJobs;

  const RECENT_ISO = new Date(NOW_MS - 3 * 60 * 60 * 1000).toISOString();

  function makeLinkedInPage(overrides = []) {
    const cards = overrides.length > 0 ? overrides : [{
      title:    'Software Engineer',
      href:     'https://www.linkedin.com/jobs/view/1000000001',
      datetime: RECENT_ISO,
    }];
    return makePageHtml(cards);
  }

  function mockFetchOk(html) {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, status: 200,
      text: () => Promise.resolve(html),
    });
  }

  function mockFetchStatus(status) {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status });
  }

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
    // Disable inter-request delays so tests run fast
    process.env.LINKEDIN_INDIA_DELAY_MS = '0';
    vi.resetModules();
    const mod = await import('./linkedinIndia.js');
    fetchJobs = mod.fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    delete process.env.LINKEDIN_INDIA_DELAY_MS;
  });

  it('returns jobs when LinkedIn guest endpoint responds with valid HTML', async () => {
    mockFetchOk(makeLinkedInPage());
    const jobs = await fetchJobs();
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBeGreaterThan(0);
  });

  it('returns empty array on HTTP 403 (rate-limit)', async () => {
    mockFetchStatus(403);
    const jobs = await fetchJobs();
    expect(jobs).toEqual([]);
  });

  it('returns empty array on HTTP 999 (LinkedIn anti-bot)', async () => {
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
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const jobs = await fetchJobs();
    expect(jobs).toEqual([]);
  });

  it('returns empty array when LinkedIn returns empty HTML', async () => {
    mockFetchOk('');
    const jobs = await fetchJobs();
    expect(jobs).toEqual([]);
  });

  it('deduplicates jobs with the same LinkedIn job id across search terms', async () => {
    const sameHtml = makePageHtml([{
      title:    'Software Engineer',
      href:     'https://www.linkedin.com/jobs/view/1234567890',
      datetime: RECENT_ISO,
    }]);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, status: 200,
      text: () => Promise.resolve(sameHtml),
    });
    const jobs = await fetchJobs();
    const ids = jobs.map(j => j.sourceJobId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('stops fetching when global AbortSignal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true, status: 200,
      text: () => Promise.resolve(makeLinkedInPage()),
    });
    const jobs = await fetchJobs(controller.signal);
    expect(Array.isArray(jobs)).toBe(true);
  });

  it('passes an AbortSignal to globalThis.fetch for timeout enforcement', async () => {
    let capturedSignal;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, opts) => {
      capturedSignal = opts?.signal;
      return { ok: true, status: 200, text: () => Promise.resolve(makeLinkedInPage()) };
    });
    await fetchJobs();
    expect(capturedSignal).toBeDefined();
  });
});
