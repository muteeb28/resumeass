import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  parseRelativeTimestamp, parseListingJobs, fetchDetailTimestamp,
  combineSignals, mergeBySlug,
  fetch as talentdFetch,
} from './talentd.js';

const T0 = new Date('2026-05-14T10:00:00.000Z');
const T0_MS = T0.getTime();

// Build minimal valid RSC HTML embedding the given RSC content string.
function makeRscHtml(rscContent) {
  const escaped = rscContent.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `<script>self.__next_f.push([1,"${escaped}"])</script>`;
}

// Build the RSC chunk for one job card:
// mobile timestamp fragment (],"X ago"]) immediately before the card props object.
function makeJobChunk(slug, title, company, url, timestamp) {
  const tsFragment = timestamp ? `],"${timestamp}"]` : '';
  return (
    `${tsFragment}` +
    `["$","$L65",null,{"jobSlug":"${slug}","jobTitle":"${title}",` +
    `"companyName":"${company}","jobUrl":"${url}","variant":"card"}]`
  );
}

// ─── parseRelativeTimestamp ───────────────────────────────────────────────────

describe('parseRelativeTimestamp', () => {
  describe('accepted inputs', () => {
    it('parses "30 minutes ago"', () => {
      expect(parseRelativeTimestamp('30 minutes ago', T0))
        .toEqual(new Date(T0_MS - 30 * 60_000));
    });

    it('parses "1 minute ago" (singular)', () => {
      expect(parseRelativeTimestamp('1 minute ago', T0))
        .toEqual(new Date(T0_MS - 60_000));
    });

    it('parses "3 hours ago"', () => {
      expect(parseRelativeTimestamp('3 hours ago', T0))
        .toEqual(new Date(T0_MS - 3 * 3_600_000));
    });

    it('parses "21 hours ago"', () => {
      expect(parseRelativeTimestamp('21 hours ago', T0))
        .toEqual(new Date(T0_MS - 21 * 3_600_000));
    });

    it('parses "47 hours ago" (last accepted hour count)', () => {
      expect(parseRelativeTimestamp('47 hours ago', T0))
        .toEqual(new Date(T0_MS - 47 * 3_600_000));
    });

    it('parses "1 hour ago" (singular)', () => {
      expect(parseRelativeTimestamp('1 hour ago', T0))
        .toEqual(new Date(T0_MS - 3_600_000));
    });

    it('parses "1 day ago"', () => {
      expect(parseRelativeTimestamp('1 day ago', T0))
        .toEqual(new Date(T0_MS - 24 * 3_600_000));
    });
  });

  describe('rejected inputs — returns null', () => {
    it.each([
      ['null',            null],
      ['empty string',    ''],
      ['whitespace only', '   '],
      ['"recently"',      'recently'],
      ['"just now"',      'just now'],
      ['arbitrary text',  'some random text'],
      ['"2 weeks ago"',   '2 weeks ago'],
      ['"2 days ago"',    '2 days ago'],
      ['"3 days ago"',    '3 days ago'],
      ['"48 hours ago"',  '48 hours ago'],
      ['"100 hours ago"', '100 hours ago'],
    ])('rejects %s', (_, input) => {
      expect(parseRelativeTimestamp(input, T0)).toBeNull();
    });
  });
});

// ─── parseListingJobs ─────────────────────────────────────────────────────────

describe('parseListingJobs', () => {
  it('extracts rawPostedText when timestamp count matches slug count', () => {
    const html = makeRscHtml(
      makeJobChunk('slug-1', 'Job One', 'Acme', 'https://a.com/1', '3 hours ago') +
      makeJobChunk('slug-2', 'Job Two', 'Corp', 'https://a.com/2', '21 hours ago'),
    );
    const jobs = parseListingJobs(html);
    expect(jobs).toHaveLength(2);
    expect(jobs[0].rawPostedText).toBe('3 hours ago');
    expect(jobs[1].rawPostedText).toBe('21 hours ago');
  });

  it('pairs jobs individually — count mismatch does not clear paired jobs', () => {
    // One timestamp before slug-1 (paired), no timestamp before slug-2 (unpaired).
    // The old global-count strategy would clear both; per-job must leave slug-1 paired.
    const CARD_GAP = ' '.repeat(700);
    const rsc =
      `],"3 hours ago"]` +
      `["$","$L65",null,{"jobSlug":"slug-1","jobTitle":"Job One","companyName":"Acme",` +
      `"jobUrl":"https://a.com/1","variant":"card"}]` +
      CARD_GAP +
      `["$","$L65",null,{"jobSlug":"slug-2","jobTitle":"Job Two","companyName":"Corp",` +
      `"jobUrl":"https://a.com/2","variant":"card"}]`;
    const jobs = parseListingJobs(makeRscHtml(rsc));
    expect(jobs).toHaveLength(2);
    expect(jobs[0].rawPostedText).toBe('3 hours ago');
    expect(jobs[1].rawPostedText).toBeNull();
  });

  it('sets rawPostedText to null when a job has no associated timestamp', () => {
    // Slug with no preceding timestamp fragment → 0 timestamps, 1 slug → mismatch
    const rsc =
      `["$","$L65",null,{"jobSlug":"no-ts","jobTitle":"No TS","companyName":"X",` +
      `"jobUrl":"https://a.com","variant":"card"}]`;
    const [job] = parseListingJobs(makeRscHtml(rsc));
    expect(job.rawPostedText).toBeNull();
  });

  it('returns empty array when RSC has no jobs', () => {
    expect(parseListingJobs(makeRscHtml(''))).toEqual([]);
  });

  it('preserves slug, title, company, and url fields', () => {
    const html = makeRscHtml(
      makeJobChunk('my-slug', 'My Job', 'My Co', 'https://example.com/job', '5 hours ago'),
    );
    const [job] = parseListingJobs(html);
    expect(job).toMatchObject({
      slug:         'my-slug',
      title:        'My Job',
      company:      'My Co',
      jobUrl:       'https://example.com/job',
      rawPostedText: '5 hours ago',
    });
  });

  it('pairs "1 day ago" when it appears in the backward window', () => {
    const html = makeRscHtml(
      makeJobChunk('day-slug', 'Day Job', 'Corp', 'https://a.com/d', '1 day ago'),
    );
    const [job] = parseListingJobs(html);
    expect(job.rawPostedText).toBe('1 day ago');
  });

  it('ignores timestamps more than 600 chars before the slug (Structure C / stale)', () => {
    // Timestamp is >600 chars before the slug — outside the backward window.
    const FAR_GAP = ' '.repeat(700);
    const rsc =
      `],"2 hours ago"]` +
      FAR_GAP +
      `["$","$L65",null,{"jobSlug":"far-slug","jobTitle":"Far Job","companyName":"X",` +
      `"jobUrl":"https://a.com","variant":"card"}]`;
    const [job] = parseListingJobs(makeRscHtml(rsc));
    expect(job.rawPostedText).toBeNull();
  });

  it('does not cross-contaminate: card without a timestamp does not get its neighbor\'s timestamp', () => {
    // job1 has NO timestamp; job2 has its own timestamp.
    // job1 must remain null even though job2's timestamp exists somewhere in the RSC.
    const CARD_GAP = ' '.repeat(700);
    const rsc =
      `["$","$L65",null,{"jobSlug":"no-ts-slug","jobTitle":"No TS","companyName":"A",` +
      `"jobUrl":"https://a.com/1","variant":"card"}]` +
      CARD_GAP +
      makeJobChunk('has-ts-slug', 'Has TS', 'B', 'https://a.com/2', '4 hours ago');
    const jobs = parseListingJobs(makeRscHtml(rsc));
    expect(jobs[0].rawPostedText).toBeNull();
    expect(jobs[1].rawPostedText).toBe('4 hours ago');
  });

  it('assigns each job the timestamp nearest to its own slug', () => {
    const CARD_GAP = ' '.repeat(700);
    const html = makeRscHtml(
      makeJobChunk('slug-a', 'Job A', 'Co A', 'https://a.com/a', '5 hours ago') +
      CARD_GAP +
      makeJobChunk('slug-b', 'Job B', 'Co B', 'https://a.com/b', '2 hours ago'),
    );
    const jobs = parseListingJobs(html);
    expect(jobs[0].rawPostedText).toBe('5 hours ago');
    expect(jobs[1].rawPostedText).toBe('2 hours ago');
  });

  it('logs per-page diagnostic with the provided logPrefix', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const CARD_GAP = ' '.repeat(700);
    const rsc =
      makeJobChunk('slug-p', 'Job P', 'Co', 'https://a.com/p', '3 hours ago') +
      CARD_GAP +
      `["$","$L65",null,{"jobSlug":"slug-q","jobTitle":"Job Q","companyName":"Co",` +
      `"jobUrl":"https://a.com/q","variant":"card"}]`;
    parseListingJobs(makeRscHtml(rsc), '[Talentd/Fresher] page 2');
    expect(spy).toHaveBeenCalledWith(
      '[Talentd/Fresher] page 2: 2 listings, 1 timestamp-paired, 1 rejected-unpaired',
    );
    spy.mockRestore();
  });
});

// ─── fetchDetailTimestamp ─────────────────────────────────────────────────────

// Build minimal detail-page RSC HTML containing (or omitting) a datePosted field.
function makeDetailHtml(datePostedIso) {
  const rscContent = datePostedIso
    ? `"datePosted":"${datePostedIso}","validThrough":"2099-01-01T00:00:00.000Z"`
    : `"title":"job without date"`;
  const escaped = rscContent.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `<script>self.__next_f.push([1,"${escaped}"])</script>`;
}

describe('fetchDetailTimestamp', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('fetches the correct detail URL and returns a Date from datePosted', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      text: async () => makeDetailHtml('2026-05-14T10:32:58.000Z'),
    });
    const result = await fetchDetailTimestamp('capco-hiring-sap-intern-erp-support-in-bengaluru');
    expect(spy).toHaveBeenCalledWith(
      'https://www.talentd.in/jobs/capco-hiring-sap-intern-erp-support-in-bengaluru',
      expect.any(Object),
    );
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2026-05-14T10:32:58.000Z');
  });

  it('returns null on a non-200 HTTP response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({ ok: false, status: 404 });
    expect(await fetchDetailTimestamp('gone-slug')).toBeNull();
  });

  it('returns null when datePosted is absent from the detail RSC', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      text: async () => makeDetailHtml(null),
    });
    expect(await fetchDetailTimestamp('no-date-slug')).toBeNull();
  });

  it('returns null when datePosted is not a valid ISO string', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      text: async () => makeDetailHtml('not-a-valid-date'),
    });
    expect(await fetchDetailTimestamp('bad-date-slug')).toBeNull();
  });

  it('returns null on network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('connect ETIMEDOUT'));
    expect(await fetchDetailTimestamp('timeout-slug')).toBeNull();
  });

  it('returns null when datePosted is a future date', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      text: async () => makeDetailHtml('2099-01-01T00:00:00.000Z'),
    });
    expect(await fetchDetailTimestamp('future-slug')).toBeNull();
  });
});

// ─── enrichWithDetailTimestamps / buildJob — orchestration ───────────────────

describe('fetchCategory enrichment via fetch()', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.TALENTD_MAX_PAGES_PER_CATEGORY;
  });

  it('tags Structure A jobs as timestampSource:listing and never fetches their detail page', async () => {
    process.env.TALENTD_MAX_PAGES_PER_CATEGORY = '1';
    const CARD_GAP    = ' '.repeat(700);
    // One Structure A (has listing timestamp) + one Structure X (no listing timestamp)
    const listingHtml = makeRscHtml(
      makeJobChunk('struct-a-slug', 'Job A', 'Co A', 'https://a.com/a', '3 hours ago') +
      CARD_GAP +
      `["$","$L65",null,{"jobSlug":"struct-x-slug","jobTitle":"Job X","companyName":"Co X",` +
      `"jobUrl":"https://a.com/x","variant":"card"}]`,
    );
    const detailHtml  = makeDetailHtml('2026-05-14T08:00:00.000Z');
    const emptyHtml   = makeRscHtml('');

    const spy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (url.includes('/jobs/freshers'))    return { ok: true, text: async () => listingHtml };
      if (url.includes('/struct-x-slug'))    return { ok: true, text: async () => detailHtml };
      return { ok: true, text: async () => emptyHtml };
    });

    const jobs = await talentdFetch();

    const aJob = jobs.find(j => j.sourceId?.includes('struct-a-slug'));
    const xJob = jobs.find(j => j.sourceId?.includes('struct-x-slug'));

    // Structure A: listing timestamp used, no detail fetch
    expect(aJob).toBeDefined();
    expect(aJob.timestampSource).toBe('listing');
    expect(aJob.rawPostedText).toBe('3 hours ago');
    const detailFetchUrls = spy.mock.calls.map(c => String(c[0]));
    expect(detailFetchUrls.some(u => u.includes('struct-a-slug'))).toBe(false);

    // Structure X: detail timestamp used, rawPostedText stays null
    expect(xJob).toBeDefined();
    expect(xJob.timestampSource).toBe('detail');
    expect(xJob.rawPostedText).toBeNull();
    expect(xJob.sourcePostedAt).toBeInstanceOf(Date);
    expect(xJob.sourceDatePostedRaw).toBe('2026-05-14T08:00:00.000Z');
    expect(detailFetchUrls.some(u => u.includes('struct-x-slug'))).toBe(true);
  });

  it('leaves sourcePostedAt null when the detail fetch fails for a Structure X job', async () => {
    process.env.TALENTD_MAX_PAGES_PER_CATEGORY = '1';
    const listingHtml = makeRscHtml(
      `["$","$L65",null,{"jobSlug":"fail-x-slug","jobTitle":"Fail Job","companyName":"Corp",` +
      `"jobUrl":"https://a.com/f","variant":"card"}]`,
    );
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      if (url.includes('/jobs/freshers'))  return { ok: true, text: async () => listingHtml };
      if (url.includes('/fail-x-slug'))    return { ok: false, status: 404 };
      return { ok: true, text: async () => makeRscHtml('') };
    });

    const jobs = await talentdFetch();
    const failJob = jobs.find(j => j.sourceId?.includes('fail-x-slug'));
    expect(failJob).toBeDefined();
    expect(failJob.sourcePostedAt).toBeNull();
    expect(failJob.rawPostedText).toBeNull();
  });
});

// ─── combineSignals ───────────────────────────────────────────────────────────

describe('combineSignals', () => {
  it('aborts the returned signal when the global signal fires', () => {
    const controller = new AbortController();
    const combined = combineSignals(controller.signal, 60_000);
    expect(combined.aborted).toBe(false);
    controller.abort();
    expect(combined.aborted).toBe(true);
  });

  it('aborts the returned signal after the per-request timeout, independent of global signal', async () => {
    const neverAborts = new AbortController().signal;
    const combined = combineSignals(neverAborts, 20); // 20 ms per-request timeout
    expect(combined.aborted).toBe(false);
    await new Promise(r => setTimeout(r, 80));
    expect(combined.aborted).toBe(true);
  });

  it('fallback path: enforces global abort when AbortSignal.any is unavailable', () => {
    const origDescriptor = Object.getOwnPropertyDescriptor(AbortSignal, 'any');
    Object.defineProperty(AbortSignal, 'any', { value: undefined, configurable: true });
    try {
      const controller = new AbortController();
      const combined = combineSignals(controller.signal, 60_000);
      expect(combined.aborted).toBe(false);
      controller.abort();
      expect(combined.aborted).toBe(true);
    } finally {
      Object.defineProperty(AbortSignal, 'any', origDescriptor);
    }
  });

  it('fallback path: enforces per-request timeout when AbortSignal.any is unavailable', async () => {
    const origDescriptor = Object.getOwnPropertyDescriptor(AbortSignal, 'any');
    Object.defineProperty(AbortSignal, 'any', { value: undefined, configurable: true });
    try {
      const neverAborts = new AbortController().signal;
      const combined = combineSignals(neverAborts, 20);
      expect(combined.aborted).toBe(false);
      await new Promise(r => setTimeout(r, 80));
      expect(combined.aborted).toBe(true);
    } finally {
      Object.defineProperty(AbortSignal, 'any', origDescriptor);
    }
  });

  it('returns immediately aborted signal when global signal is already aborted', () => {
    const controller = new AbortController();
    controller.abort(new Error('pre-aborted'));
    const combined = combineSignals(controller.signal, 60_000);
    expect(combined.aborted).toBe(true);
  });

  it('returns a timeout signal when no global signal is provided', async () => {
    const combined = combineSignals(null, 20);
    await new Promise(r => setTimeout(r, 80));
    expect(combined.aborted).toBe(true);
  });
});

// ─── early-stop after consecutive dry pages ───────────────────────────────────

describe('early-stop after consecutive dry pages', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.TALENTD_MAX_PAGES_PER_CATEGORY;
    delete process.env.TALENTD_PAGE_CONCURRENCY;
    delete process.env.TALENTD_CATEGORY_CONCURRENCY;
  });

  const freshHtml = () =>
    makeRscHtml(makeJobChunk('fresh-job', 'Fresh Job', 'Co', 'https://t.in/j/fresh-job', '3 hours ago'));
  const emptyHtml = () => makeRscHtml('');

  function mockFresherFetch({ page2Plus }) {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = String(url);
      if (u === 'https://www.talentd.in/jobs/freshers')
        return { ok: true, text: async () => freshHtml() };
      if (u.startsWith('https://www.talentd.in/jobs/freshers?page='))
        return { ok: true, text: async () => page2Plus(u) };
      return { ok: true, text: async () => emptyHtml() };
    });
  }

  it('stops a category after exactly 3 consecutive dry pages', async () => {
    process.env.TALENTD_MAX_PAGES_PER_CATEGORY = '20';
    process.env.TALENTD_PAGE_CONCURRENCY = '1';
    process.env.TALENTD_CATEGORY_CONCURRENCY = '1';

    let count = 0;
    mockFresherFetch({ page2Plus: () => { count++; return emptyHtml(); } });

    await talentdFetch();
    expect(count).toBe(3);
  });

  it('does not stop after only 1 or 2 dry pages', async () => {
    process.env.TALENTD_MAX_PAGES_PER_CATEGORY = '5';
    process.env.TALENTD_PAGE_CONCURRENCY = '1';
    process.env.TALENTD_CATEGORY_CONCURRENCY = '1';

    let count = 0;
    mockFresherFetch({
      page2Plus: () => {
        count++;
        // dry, fresh, dry → never reaches 3 consecutive
        return count % 2 === 0 ? freshHtml() : emptyHtml();
      },
    });

    await talentdFetch();
    expect(count).toBeGreaterThan(2);
  });

  it('resets the consecutive dry counter when a fresh page is encountered', async () => {
    process.env.TALENTD_MAX_PAGES_PER_CATEGORY = '20';
    process.env.TALENTD_PAGE_CONCURRENCY = '1';
    process.env.TALENTD_CATEGORY_CONCURRENCY = '1';

    let count = 0;
    mockFresherFetch({
      page2Plus: () => {
        count++;
        // pages 2,3 dry; page 4 fresh (resets counter); pages 5,6,7 dry → stop
        return count === 3 ? freshHtml() : emptyHtml();
      },
    });

    await talentdFetch();
    // 2 dry + 1 fresh (reset) + 3 dry = 6 total page 2+ fetches
    expect(count).toBe(6);
  });

  it('a Structure X page whose detail datePosted is within 48 h is not counted as dry', async () => {
    process.env.TALENTD_MAX_PAGES_PER_CATEGORY = '5';
    process.env.TALENTD_PAGE_CONCURRENCY = '1';
    process.env.TALENTD_CATEGORY_CONCURRENCY = '1';

    // page 2: one Structure X job (no listing timestamp); detail page returns fresh date
    const structXHtml = makeRscHtml(
      `["$","$L65",null,{"jobSlug":"struct-x","jobTitle":"X Job","companyName":"Co",` +
      `"jobUrl":"https://t.in/j/struct-x","variant":"card"}]`,
    );
    const freshDetailHtml = makeDetailHtml(
      new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 h ago
    );

    let fresherCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = String(url);
      if (u === 'https://www.talentd.in/jobs/freshers')
        return { ok: true, text: async () => freshHtml() };
      if (u.includes('/jobs/struct-x'))
        return { ok: true, text: async () => freshDetailHtml };
      if (u.startsWith('https://www.talentd.in/jobs/freshers?page=')) {
        fresherCount++;
        return { ok: true, text: async () => fresherCount === 1 ? structXHtml : emptyHtml() };
      }
      return { ok: true, text: async () => emptyHtml() };
    });

    await talentdFetch();
    // page 2 → struct X → detail fresh → NOT dry (fresherCount=1, dryPageCount stays 0)
    // pages 3,4,5 → empty → dryPageCount 1,2,3 → stops
    expect(fresherCount).toBe(4); // pages 2,3,4,5
  });
});

// ─── mergeBySlug ─────────────────────────────────────────────────────────────

function makeRawBuiltJob(overrides = {}) {
  return {
    sourceId:      'talentd-test-slug',
    title:         'Test Job',
    company:       'Acme',
    location:      'India',
    url:           'https://t.in/j/test-slug',
    source:        'talentd',
    sourceLabel:   'Talentd',
    remote:        false,
    categories:    ['Fresher'],
    rawPostedText: '3 hours ago',
    sourcePostedAt: new Date('2026-05-14T07:00:00.000Z'),
    timestampSource: 'listing',
    ...overrides,
  };
}

describe('mergeBySlug', () => {
  it('returns one job when the same slug appears in multiple categories', () => {
    const jobs = [
      makeRawBuiltJob({ categories: ['Internship'] }),
      makeRawBuiltJob({ categories: ['IT/Software'] }),
      makeRawBuiltJob({ categories: ['Batch 2026'] }),
    ];
    expect(mergeBySlug(jobs)).toHaveLength(1);
  });

  it('merges categories from all source categories into one array', () => {
    const jobs = [
      makeRawBuiltJob({ categories: ['Internship'] }),
      makeRawBuiltJob({ categories: ['IT/Software'] }),
      makeRawBuiltJob({ categories: ['Batch 2026'] }),
    ];
    const [merged] = mergeBySlug(jobs);
    expect(merged.categories).toContain('Internship');
    expect(merged.categories).toContain('IT/Software');
    expect(merged.categories).toContain('Batch 2026');
    expect(merged.categories).toHaveLength(3);
  });

  it('does not duplicate categories when the same slug appears with the same category twice', () => {
    const jobs = [
      makeRawBuiltJob({ categories: ['Internship'] }),
      makeRawBuiltJob({ categories: ['Internship'] }),
    ];
    const [merged] = mergeBySlug(jobs);
    expect(merged.categories).toEqual(['Internship']);
  });

  it('sets primary category to Internship even when Full Time appears first', () => {
    const jobs = [
      makeRawBuiltJob({ categories: ['Full Time'] }),
      makeRawBuiltJob({ categories: ['Internship'] }),
    ];
    const [merged] = mergeBySlug(jobs);
    expect(merged.category).toBe('Internship');
  });

  it('sets jobType to Internship when categories includes Internship', () => {
    const jobs = [
      makeRawBuiltJob({ title: 'SAP Intern', categories: ['Full Time'] }),
      makeRawBuiltJob({ title: 'SAP Intern', categories: ['Internship'] }),
    ];
    const [merged] = mergeBySlug(jobs);
    expect(merged.jobType).toBe('Internship');
  });

  it('does not set jobType to Full-time for SAP Intern even if Full Time is the only category source', () => {
    const jobs = [makeRawBuiltJob({ title: 'SAP Intern', categories: ['Full Time'] })];
    const [merged] = mergeBySlug(jobs);
    // guessJobType('SAP Intern') should return Internship; at minimum must NOT be 'Full-time'
    expect(merged.jobType).not.toBe('Full-time');
  });

  it('sets remote=true when any source entry has the Remote category', () => {
    const jobs = [
      makeRawBuiltJob({ categories: ['Internship'], remote: false }),
      makeRawBuiltJob({ categories: ['Remote'],     remote: true }),
    ];
    const [merged] = mergeBySlug(jobs);
    expect(merged.remote).toBe(true);
  });

  it('prefers detail timestampSource over listing when merging', () => {
    const detailDate = new Date('2026-05-14T10:00:00.000Z');
    const jobs = [
      makeRawBuiltJob({
        categories:      ['Internship'],
        sourcePostedAt:  new Date('2026-05-14T09:00:00.000Z'),
        timestampSource: 'listing',
        rawPostedText:   '1 hour ago',
      }),
      makeRawBuiltJob({
        categories:           ['IT/Software'],
        sourcePostedAt:       detailDate,
        timestampSource:      'detail',
        sourceDatePostedRaw:  detailDate.toISOString(),
        rawPostedText:        null,
      }),
    ];
    const [merged] = mergeBySlug(jobs);
    expect(merged.timestampSource).toBe('detail');
    expect(merged.sourcePostedAt).toEqual(detailDate);
  });

  it('keeps the most-recent sourcePostedAt when both sides are listing-sourced', () => {
    const older  = new Date('2026-05-14T06:00:00.000Z');
    const newer  = new Date('2026-05-14T09:00:00.000Z');
    const jobs = [
      makeRawBuiltJob({ categories: ['Internship'], sourcePostedAt: older,  timestampSource: 'listing', rawPostedText: '4 hours ago' }),
      makeRawBuiltJob({ categories: ['IT/Software'], sourcePostedAt: newer, timestampSource: 'listing', rawPostedText: '1 hour ago' }),
    ];
    const [merged] = mergeBySlug(jobs);
    expect(merged.sourcePostedAt).toEqual(newer);
    expect(merged.rawPostedText).toBe('1 hour ago');
  });

  it('returns separate entries for genuinely different slugs', () => {
    const jobs = [
      makeRawBuiltJob({ sourceId: 'talentd-slug-a', categories: ['Internship'] }),
      makeRawBuiltJob({ sourceId: 'talentd-slug-b', categories: ['IT/Software'] }),
    ];
    expect(mergeBySlug(jobs)).toHaveLength(2);
  });
});

// ─── fetch — cross-category dedup ────────────────────────────────────────────

describe('fetch — cross-category dedup via mergeBySlug', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.TALENTD_MAX_PAGES_PER_CATEGORY;
    delete process.env.TALENTD_CATEGORY_CONCURRENCY;
  });

  function listingWithSlug(slug, title = 'SAP Intern', ts = '3 hours ago') {
    return makeRscHtml(makeJobChunk(slug, title, 'Capco', `https://t.in/j/${slug}`, ts));
  }

  it('returns one job when the same slug appears in two category pages', async () => {
    process.env.TALENTD_MAX_PAGES_PER_CATEGORY = '1';
    process.env.TALENTD_CATEGORY_CONCURRENCY  = '10';

    const slug = 'capco-sap-intern';
    const html = listingWithSlug(slug);

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = String(url);
      if (u === 'https://www.talentd.in/jobs/freshers' ||
          u === 'https://www.talentd.in/jobs/internships')
        return { ok: true, text: async () => html };
      return { ok: true, text: async () => makeRscHtml('') };
    });

    const jobs = await talentdFetch();
    expect(jobs.filter(j => j.sourceId === `talentd-${slug}`)).toHaveLength(1);
  });

  it('merged job has categories[] from all matching category pages', async () => {
    process.env.TALENTD_MAX_PAGES_PER_CATEGORY = '1';
    process.env.TALENTD_CATEGORY_CONCURRENCY  = '10';

    const slug = 'capco-sap-intern';
    const html = listingWithSlug(slug);

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = String(url);
      if (u === 'https://www.talentd.in/jobs/freshers' ||
          u === 'https://www.talentd.in/jobs/internships')
        return { ok: true, text: async () => html };
      return { ok: true, text: async () => makeRscHtml('') };
    });

    const jobs = await talentdFetch();
    const merged = jobs.find(j => j.sourceId === `talentd-${slug}`);
    expect(merged).toBeDefined();
    expect(merged.categories).toContain('Fresher');
    expect(merged.categories).toContain('Internship');
  });

  it('sourceId does not contain the category slug', async () => {
    process.env.TALENTD_MAX_PAGES_PER_CATEGORY = '1';
    process.env.TALENTD_CATEGORY_CONCURRENCY  = '1';

    const slug = 'test-job-slug';
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) =>
      String(url) === 'https://www.talentd.in/jobs/freshers'
        ? { ok: true, text: async () => listingWithSlug(slug, 'Test Job') }
        : { ok: true, text: async () => makeRscHtml('') },
    );

    const jobs = await talentdFetch();
    const job = jobs.find(j => j.sourceId === `talentd-${slug}`);
    expect(job).toBeDefined();
    expect(job.sourceId).not.toMatch(/fresher/);
    expect(job.sourceId).not.toMatch(/internship/);
  });

  it('jobType is Internship for intern job that also appears under Full Time', async () => {
    process.env.TALENTD_MAX_PAGES_PER_CATEGORY = '1';
    process.env.TALENTD_CATEGORY_CONCURRENCY  = '10';

    const slug = 'sap-intern-capco';
    const html = listingWithSlug(slug, 'SAP Intern', '2 hours ago');

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = String(url);
      if (u === 'https://www.talentd.in/jobs/internships' ||
          u.includes('employment_type=full-time'))
        return { ok: true, text: async () => html };
      return { ok: true, text: async () => makeRscHtml('') };
    });

    const jobs = await talentdFetch();
    const job = jobs.find(j => j.sourceId === `talentd-${slug}`);
    expect(job).toBeDefined();
    expect(job.jobType).toBe('Internship');
    expect(job.categories).toContain('Internship');
    expect(job.categories).toContain('Full Time');
  });

  it('category field reflects highest-priority category (Internship over Full Time)', async () => {
    process.env.TALENTD_MAX_PAGES_PER_CATEGORY = '1';
    process.env.TALENTD_CATEGORY_CONCURRENCY  = '10';

    const slug = 'priority-test-job';
    const html = listingWithSlug(slug, 'Intern Developer', '4 hours ago');

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = String(url);
      if (u === 'https://www.talentd.in/jobs/internships' ||
          u.includes('employment_type=full-time'))
        return { ok: true, text: async () => html };
      return { ok: true, text: async () => makeRscHtml('') };
    });

    const jobs = await talentdFetch();
    const job = jobs.find(j => j.sourceId === `talentd-${slug}`);
    expect(job?.category).toBe('Internship');
  });
});
