import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const NOW_MS = new Date('2026-05-14T10:00:00.000Z').getTime();
const CUTOFF_48H = new Date(NOW_MS - 48 * 60 * 60 * 1000);

// ─── mocks ────────────────────────────────────────────────────────────────────

const mockFind         = vi.fn();
const mockCountDocuments = vi.fn();

vi.mock('../models/Job.model.js', () => ({
  default: { find: mockFind, countDocuments: mockCountDocuments },
}));

vi.mock('../services/jobPipeline/ingestion.js', () => ({
  getIngestionMeta: () => ({ lastIngestionAt: null, stats: null }),
  runIngestion:     vi.fn(),
}));

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeChainedFind(rows = []) {
  const chain = { lean: vi.fn().mockResolvedValue(rows) };
  chain.limit  = vi.fn().mockReturnValue(chain);
  chain.skip   = vi.fn().mockReturnValue(chain);
  chain.sort   = vi.fn().mockReturnValue(chain);
  return chain;
}

function makeReq(query = {}) {
  return { query };
}

function makeRes() {
  return { json: vi.fn(), status: vi.fn().mockReturnThis() };
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('getJobs — Talentd postedAt freshness filter', () => {
  let getJobs;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);

    process.env.JOB_DISCOVERY_ENABLED = 'true';

    mockFind.mockReturnValue(makeChainedFind());
    mockCountDocuments.mockResolvedValue(0);

    vi.resetModules();
    vi.mock('../models/Job.model.js', () => ({
      default: { find: mockFind, countDocuments: mockCountDocuments },
    }));
    vi.mock('../services/jobPipeline/ingestion.js', () => ({
      getIngestionMeta: () => ({ lastIngestionAt: null, stats: null }),
      runIngestion:     vi.fn(),
    }));

    const mod = await import('./jobsRead.controller.js');
    getJobs = mod.getJobs;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete process.env.JOB_DISCOVERY_ENABLED;
  });

  it('includes postedAt >= now-48h in the Talentd query filter', async () => {
    const req = makeReq({ source: 'talentd', page: '1', limit: '9' });
    const res = makeRes();

    await getJobs(req, res);

    const [filter] = mockFind.mock.calls[0];
    expect(filter.source).toBe('talentd');
    expect(filter.isActive).toBe(true);
    expect(filter.postedAt).toEqual({ $gte: CUTOFF_48H });
  });

  it('does not add a postedAt filter for non-Talentd (PM role) queries', async () => {
    const req = makeReq({ role: 'pm', page: '1', limit: '9' });
    const res = makeRes();

    await getJobs(req, res);

    const [filter] = mockFind.mock.calls[0];
    expect(filter.postedAt).toBeUndefined();
  });

  it('returns disabled response when JOB_DISCOVERY_ENABLED is not true', async () => {
    delete process.env.JOB_DISCOVERY_ENABLED;
    const req = makeReq({ source: 'talentd' });
    const res = makeRes();

    await getJobs(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
    expect(mockFind).not.toHaveBeenCalled();
  });

  it('filters by categories[] array when category param is provided', async () => {
    const req = makeReq({ source: 'talentd', category: 'Internship' });
    const res = makeRes();

    await getJobs(req, res);

    const [filter] = mockFind.mock.calls[0];
    // Must use array-containment query so one multi-category document matches
    expect(filter.categories).toBe('Internship');
    expect(filter.category).toBeUndefined();
  });

  it('includes categories[] in every job in the API response', async () => {
    const jobDoc = {
      sourceId:    'talentd-sap-slug',
      title:       'SAP Intern',
      company:     'Capco',
      location:    'Bengaluru, India',
      sourceLabel: 'Talentd',
      jobType:     'Internship',
      url:         'https://t.in/j/sap-slug',
      source:      'talentd',
      category:    'Internship',
      categories:  ['Internship', 'IT/Software', 'Batch 2026'],
      postedAt:    new Date(NOW_MS - 3 * 60 * 60 * 1000),
    };
    mockFind.mockReturnValue(makeChainedFind([jobDoc]));
    mockCountDocuments.mockResolvedValue(1);

    const req = makeReq({ source: 'talentd' });
    const res = makeRes();

    await getJobs(req, res);

    const [response] = res.json.mock.calls;
    expect(response[0].jobs[0].categories).toEqual(['Internship', 'IT/Software', 'Batch 2026']);
  });

  it('broad Talentd query does not filter by category', async () => {
    const req = makeReq({ source: 'talentd', page: '1', limit: '20' });
    const res = makeRes();

    await getJobs(req, res);

    const [filter] = mockFind.mock.calls[0];
    expect(filter.categories).toBeUndefined();
    expect(filter.category).toBeUndefined();
  });

  it('excludes all India-board sources from the legacy role=intern query', async () => {
    // India sources (talentd, remoteok-india) are stored as roleType=INTERN.
    // Without an explicit exclusion, stale India jobs would leak through this
    // path with no freshness filter.
    const req = makeReq({ role: 'intern', page: '1', limit: '9' });
    const res = makeRes();

    await getJobs(req, res);

    const [filter] = mockFind.mock.calls[0];
    expect(filter.roleType).toBe('INTERN');
    expect(filter.source).toEqual({ $nin: ['talentd', 'remoteok-india'] });
  });
});

// ─── getJobs — source=india ───────────────────────────────────────────────────

describe('getJobs — source=india', () => {
  let getJobs;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);

    process.env.JOB_DISCOVERY_ENABLED = 'true';

    mockFind.mockReturnValue(makeChainedFind());
    mockCountDocuments.mockResolvedValue(0);

    vi.resetModules();
    vi.mock('../models/Job.model.js', () => ({
      default: { find: mockFind, countDocuments: mockCountDocuments },
    }));
    vi.mock('../services/jobPipeline/ingestion.js', () => ({
      getIngestionMeta: () => ({ lastIngestionAt: null, stats: null }),
      runIngestion:     vi.fn(),
    }));

    const mod = await import('./jobsRead.controller.js');
    getJobs = mod.getJobs;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete process.env.JOB_DISCOVERY_ENABLED;
  });

  it('queries both talentd and remoteok-india when source=india', async () => {
    const req = makeReq({ source: 'india', page: '1', limit: '50' });
    const res = makeRes();

    await getJobs(req, res);

    const [filter] = mockFind.mock.calls[0];
    expect(filter.source).toEqual({ $in: ['talentd', 'remoteok-india'] });
    expect(filter.isActive).toBe(true);
    expect(filter.postedAt).toEqual({ $gte: CUTOFF_48H });
  });

  it('applies category filter across all India sources when category param is present', async () => {
    const req = makeReq({ source: 'india', category: 'Remote', page: '1', limit: '50' });
    const res = makeRes();

    await getJobs(req, res);

    const [filter] = mockFind.mock.calls[0];
    expect(filter.categories).toBe('Remote');
    expect(filter.source).toEqual({ $in: ['talentd', 'remoteok-india'] });
  });

  it('applies search across title and company for india source', async () => {
    const req = makeReq({ source: 'india', searchText: 'PayU', page: '1', limit: '20' });
    const res = makeRes();

    await getJobs(req, res);

    const [filter] = mockFind.mock.calls[0];
    expect(filter.$or).toEqual([
      { title:   { $regex: 'PayU', $options: 'i' } },
      { company: { $regex: 'PayU', $options: 'i' } },
    ]);
    expect(filter.source).toEqual({ $in: ['talentd', 'remoteok-india'] });
  });

  it('does not add category filter when category param is absent', async () => {
    const req = makeReq({ source: 'india', page: '1', limit: '50' });
    const res = makeRes();

    await getJobs(req, res);

    const [filter] = mockFind.mock.calls[0];
    expect(filter.categories).toBeUndefined();
  });

  it('source=talentd still queries only talentd (unchanged)', async () => {
    const req = makeReq({ source: 'talentd', page: '1', limit: '9' });
    const res = makeRes();

    await getJobs(req, res);

    const [filter] = mockFind.mock.calls[0];
    expect(filter.source).toBe('talentd');
    expect(filter.postedAt).toEqual({ $gte: CUTOFF_48H });
  });

  it('returns combined categories[] from jobs of multiple sources in the response', async () => {
    const talentdJob = {
      sourceId:    'talentd-payu-slug',
      title:       'Software Engineer',
      company:     'PayU',
      location:    'Bangalore, India',
      sourceLabel: 'Talentd',
      jobType:     'Full-time',
      url:         'https://t.in/j/payu-slug',
      source:      'talentd',
      categories:  ['Fresher', 'IT/Software'],
      postedAt:    new Date(NOW_MS - 2 * 60 * 60 * 1000),
    };
    const remoteOkJob = {
      sourceId:    'remoteok-india-99001',
      title:       'Backend Developer',
      company:     'Acme',
      location:    'Remote',
      sourceLabel: 'RemoteOK',
      jobType:     'Full-time',
      url:         'https://remoteok.com/99001',
      source:      'remoteok-india',
      categories:  ['Remote', 'IT/Software', 'Full Time'],
      postedAt:    new Date(NOW_MS - 4 * 60 * 60 * 1000),
    };
    mockFind.mockReturnValue(makeChainedFind([talentdJob, remoteOkJob]));
    mockCountDocuments.mockResolvedValue(2);

    const req = makeReq({ source: 'india', page: '1', limit: '50' });
    const res = makeRes();

    await getJobs(req, res);

    const [response] = res.json.mock.calls;
    expect(response[0].total).toBe(2);
    const titles = response[0].jobs.map(j => j.title);
    expect(titles).toContain('Software Engineer');
    expect(titles).toContain('Backend Developer');
  });
});
