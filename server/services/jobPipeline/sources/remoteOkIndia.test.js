import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const NOW_MS    = new Date('2026-05-14T10:00:00.000Z').getTime();
const NOW_S     = Math.floor(NOW_MS / 1000);
const H48_MS    = 48 * 60 * 60 * 1000;

// RemoteOK epoch field is Unix seconds
function epochSecondsFor(offsetMs) {
  return Math.floor((NOW_MS + offsetMs) / 1000);
}

function makeItem(overrides = {}) {
  return {
    id:       12345,
    position: 'Backend Developer',
    company:  'Acme',
    location: 'Remote',
    tags:     ['backend', 'node'],
    epoch:    epochSecondsFor(-3 * 60 * 60 * 1000), // 3 hours ago
    date:     new Date(NOW_MS - 3 * 60 * 60 * 1000).toISOString(),
    url:      'https://remoteok.com/remote-jobs/12345',
    slug:     'remote-backend-developer-acme-12345',
    salary_min: null,
    salary_max: null,
    ...overrides,
  };
}

// Build a minimal RemoteOK API response (first element is a legend/header, rest are jobs)
function makeApiResponse(items) {
  return [{ legal: 'RemoteOK' }, ...items];
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function mockFetch(body) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok:   true,
    json: () => Promise.resolve(body),
  });
}

function mockFetchFail(status = 500) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status });
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('remoteOkIndia — fetch', () => {
  let fetchJobs;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
    vi.resetModules();
    const mod = await import('./remoteOkIndia.js');
    fetchJobs = mod.fetch;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // ─── meta ──────────────────────────────────────────────────────────────────

  it('exports sourceKey "remoteok-india"', async () => {
    const mod = await import('./remoteOkIndia.js');
    expect(mod.sourceKey).toBe('remoteok-india');
  });

  it('exports name "RemoteOK India"', async () => {
    const mod = await import('./remoteOkIndia.js');
    expect(mod.name).toBe('RemoteOK India');
  });

  // ─── epoch → sourcePostedAt ────────────────────────────────────────────────

  it('converts epoch (Unix seconds) to a Date for sourcePostedAt', async () => {
    const item = makeItem({ epoch: epochSecondsFor(-2 * 60 * 60 * 1000) }); // 2 hours ago
    mockFetch(makeApiResponse([item]));

    const jobs = await fetchJobs();

    expect(jobs).toHaveLength(1);
    expect(jobs[0].sourcePostedAt).toBeInstanceOf(Date);
    expect(jobs[0].sourcePostedAt.getTime()).toBe(item.epoch * 1000);
  });

  it('sets sourcePostedAt to undefined when epoch is missing', async () => {
    const item = makeItem({ epoch: undefined });
    mockFetch(makeApiResponse([item]));

    const jobs = await fetchJobs();

    expect(jobs).toHaveLength(1);
    expect(jobs[0].sourcePostedAt).toBeUndefined();
  });

  it('sets sourcePostedAt to undefined when epoch is null', async () => {
    const item = makeItem({ epoch: null });
    mockFetch(makeApiResponse([item]));

    const jobs = await fetchJobs();
    expect(jobs[0].sourcePostedAt).toBeUndefined();
  });

  // ─── sourceId / sourceKey ─────────────────────────────────────────────────

  it('builds sourceId as "remoteok-india-{id}"', async () => {
    const item = makeItem({ id: 99001 });
    mockFetch(makeApiResponse([item]));

    const jobs = await fetchJobs();
    expect(jobs[0].sourceId).toBe('remoteok-india-99001');
  });

  it('sets source to "remoteok-india"', async () => {
    mockFetch(makeApiResponse([makeItem()]));
    const jobs = await fetchJobs();
    expect(jobs[0].source).toBe('remoteok-india');
  });

  // ─── title / company / tags ───────────────────────────────────────────────

  it('maps position to title', async () => {
    const item = makeItem({ position: 'Senior DevOps Engineer' });
    mockFetch(makeApiResponse([item]));
    const jobs = await fetchJobs();
    expect(jobs[0].title).toBe('Senior DevOps Engineer');
  });

  it('passes tags array through', async () => {
    const item = makeItem({ tags: ['react', 'typescript', 'frontend'] });
    mockFetch(makeApiResponse([item]));
    const jobs = await fetchJobs();
    expect(jobs[0].tags).toEqual(['react', 'typescript', 'frontend']);
  });

  // ─── deduplication within one response ───────────────────────────────────

  it('deduplicates items with the same id', async () => {
    const item = makeItem({ id: 42 });
    mockFetch(makeApiResponse([item, item])); // same id twice
    const jobs = await fetchJobs();
    expect(jobs).toHaveLength(1);
  });

  // ─── API failure ──────────────────────────────────────────────────────────

  it('returns empty array when RemoteOK API returns a non-ok response', async () => {
    mockFetchFail(403);
    const jobs = await fetchJobs();
    expect(jobs).toEqual([]);
  });

  it('returns empty array when fetch throws (network error)', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'));
    const jobs = await fetchJobs();
    expect(jobs).toEqual([]);
  });

  // ─── skips items without id or position ──────────────────────────────────

  it('skips API items that have no id', async () => {
    const bad = { position: 'Engineer', epoch: epochSecondsFor(-1 * 60 * 60 * 1000), url: 'https://x.com' };
    mockFetch(makeApiResponse([bad, makeItem({ id: 55 })]));
    const jobs = await fetchJobs();
    expect(jobs).toHaveLength(1);
    expect(jobs[0].sourceId).toBe('remoteok-india-55');
  });

  it('skips API items that have no position', async () => {
    const bad = { id: 9, epoch: epochSecondsFor(-1 * 60 * 60 * 1000), url: 'https://x.com' };
    mockFetch(makeApiResponse([bad, makeItem({ id: 56 })]));
    const jobs = await fetchJobs();
    expect(jobs).toHaveLength(1);
  });

  // ─── remote flag ──────────────────────────────────────────────────────────

  it('sets remote=true for all RemoteOK jobs', async () => {
    mockFetch(makeApiResponse([makeItem({ location: 'India' })]));
    const jobs = await fetchJobs();
    expect(jobs[0].remote).toBe(true);
  });
});
