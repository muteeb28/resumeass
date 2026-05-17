import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const NOW_MS = new Date('2026-05-05T10:00:00Z').getTime();
const TTL_48H_MS = 48 * 60 * 60 * 1000;

// ─── mock Job model ───────────────────────────────────────────────────────────
const mockBulkWrite  = vi.fn();
const mockUpdateMany = vi.fn();
vi.mock('../../models/Job.model.js', () => ({
  default: { bulkWrite: mockBulkWrite, updateMany: mockUpdateMany },
}));

// ─── mock sources ─────────────────────────────────────────────────────────────
const mockRemotiveFetch      = vi.fn();
const mockRemoteOkFetch      = vi.fn();
const mockHimalayasFetch     = vi.fn();
const mockWorkingNomadsFetch = vi.fn();
const mockJobicyFetch        = vi.fn();
const mockWeWorkFetch        = vi.fn();
const mockJobspressoFetch    = vi.fn();
const mockAuthenticFetch     = vi.fn();
const mockDynamiteFetch      = vi.fn();
const mockTheMuseFetch       = vi.fn();
const mockGreenhouseFetch    = vi.fn();
const mockLeverFetch         = vi.fn();
const mockArcdevFetch        = vi.fn();
const mockTalentdFetch       = vi.fn();
const mockRemoteOkIndiaFetch = vi.fn();

vi.mock('./sources/remotive.js',        () => ({ fetch: mockRemotiveFetch,      name: 'Remotive',        sourceKey: 'remotive' }));
vi.mock('./sources/remoteOk.js',        () => ({ fetch: mockRemoteOkFetch,      name: 'RemoteOK',        sourceKey: 'remoteok' }));
vi.mock('./sources/himalayas.js',       () => ({ fetch: mockHimalayasFetch,     name: 'Himalayas',       sourceKey: 'himalayas' }));
vi.mock('./sources/workingNomads.js',   () => ({ fetch: mockWorkingNomadsFetch, name: 'Working Nomads',  sourceKey: 'workingnomads' }));
vi.mock('./sources/jobicy.js',          () => ({ fetch: mockJobicyFetch,        name: 'Jobicy',          sourceKey: 'jobicy' }));
vi.mock('./sources/weWorkRemotely.js',  () => ({ fetch: mockWeWorkFetch,        name: 'We Work Remotely', sourceKey: 'weworkremotely' }));
vi.mock('./sources/jobspresso.js',      () => ({ fetch: mockJobspressoFetch,    name: 'Jobspresso',      sourceKey: 'jobspresso' }));
vi.mock('./sources/authenticjobs.js',   () => ({ fetch: mockAuthenticFetch,     name: 'Authentic Jobs',  sourceKey: 'authenticjobs' }));
vi.mock('./sources/dynamitejobs.js',    () => ({ fetch: mockDynamiteFetch,      name: 'Dynamite Jobs',   sourceKey: 'dynamitejobs' }));
vi.mock('./sources/themuse.js',         () => ({ fetch: mockTheMuseFetch,       name: 'The Muse',        sourceKey: 'themuse' }));
vi.mock('./sources/greenhouse.js',      () => ({ fetch: mockGreenhouseFetch,    name: 'Greenhouse',      sourceKey: 'greenhouse' }));
vi.mock('./sources/lever.js',           () => ({ fetch: mockLeverFetch,         name: 'Lever',           sourceKey: 'lever' }));
vi.mock('./sources/arcdev.js',          () => ({ fetch: mockArcdevFetch,        name: 'Arc.dev',         sourceKey: 'arcdev' }));
vi.mock('./sources/talentd.js',         () => ({ fetch: mockTalentdFetch,       name: 'Talentd',         sourceKey: 'talentd' }));
vi.mock('./sources/remoteOkIndia.js',   () => ({ fetch: mockRemoteOkIndiaFetch, name: 'RemoteOK',        sourceKey: 'remoteok-india' }));

function makeRawJob(overrides = {}) {
  return {
    sourceId: 'remotive-001',
    title: 'Associate Product Manager',
    company: 'Acme',
    location: 'Remote',
    url: 'https://example.com/job/001',
    remote: true,
    source: 'remotive',
    sourceLabel: 'Remotive',
    sourcePostedAt: new Date('2026-05-05T08:00:00Z'),
    ...overrides,
  };
}

describe('ingestion (multi-source)', () => {
  let mod;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
    vi.resetModules();

    vi.mock('../../models/Job.model.js', () => ({ default: { bulkWrite: mockBulkWrite, updateMany: mockUpdateMany } }));
    vi.mock('./sources/remotive.js',       () => ({ fetch: mockRemotiveFetch,       name: 'Remotive',        sourceKey: 'remotive' }));
    vi.mock('./sources/remoteOk.js',       () => ({ fetch: mockRemoteOkFetch,       name: 'RemoteOK',        sourceKey: 'remoteok' }));
    vi.mock('./sources/himalayas.js',      () => ({ fetch: mockHimalayasFetch,      name: 'Himalayas',       sourceKey: 'himalayas' }));
    vi.mock('./sources/workingNomads.js',  () => ({ fetch: mockWorkingNomadsFetch,  name: 'Working Nomads',  sourceKey: 'workingnomads' }));
    vi.mock('./sources/jobicy.js',         () => ({ fetch: mockJobicyFetch,         name: 'Jobicy',          sourceKey: 'jobicy' }));
    vi.mock('./sources/weWorkRemotely.js', () => ({ fetch: mockWeWorkFetch,         name: 'We Work Remotely', sourceKey: 'weworkremotely' }));
    vi.mock('./sources/jobspresso.js',     () => ({ fetch: mockJobspressoFetch,     name: 'Jobspresso',      sourceKey: 'jobspresso' }));
    vi.mock('./sources/authenticjobs.js',  () => ({ fetch: mockAuthenticFetch,      name: 'Authentic Jobs',  sourceKey: 'authenticjobs' }));
    vi.mock('./sources/dynamitejobs.js',   () => ({ fetch: mockDynamiteFetch,       name: 'Dynamite Jobs',   sourceKey: 'dynamitejobs' }));
    vi.mock('./sources/themuse.js',        () => ({ fetch: mockTheMuseFetch,        name: 'The Muse',        sourceKey: 'themuse' }));
    vi.mock('./sources/greenhouse.js',     () => ({ fetch: mockGreenhouseFetch,     name: 'Greenhouse',      sourceKey: 'greenhouse' }));
    vi.mock('./sources/lever.js',          () => ({ fetch: mockLeverFetch,          name: 'Lever',           sourceKey: 'lever' }));
    vi.mock('./sources/arcdev.js',         () => ({ fetch: mockArcdevFetch,         name: 'Arc.dev',         sourceKey: 'arcdev' }));
    vi.mock('./sources/talentd.js',        () => ({ fetch: mockTalentdFetch,        name: 'Talentd',         sourceKey: 'talentd' }));
    vi.mock('./sources/remoteOkIndia.js',  () => ({ fetch: mockRemoteOkIndiaFetch,  name: 'RemoteOK India',  sourceKey: 'remoteok-india' }));

    // Default: all sources return empty
    [mockRemotiveFetch, mockRemoteOkFetch, mockHimalayasFetch, mockWorkingNomadsFetch,
     mockJobicyFetch, mockWeWorkFetch, mockJobspressoFetch, mockAuthenticFetch,
     mockDynamiteFetch, mockTheMuseFetch, mockGreenhouseFetch, mockLeverFetch,
     mockArcdevFetch, mockTalentdFetch, mockRemoteOkIndiaFetch].forEach(m => m.mockResolvedValue([]));

    mockBulkWrite.mockResolvedValue({ upsertedCount: 0, modifiedCount: 0 });

    // The existing suite tests multi-source behaviour — run all sources.
    process.env.JOB_SOURCE_MODE = 'all';

    mod = await import('./ingestion.js');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete process.env.JOB_SOURCE_MODE;
  });

  // ─── metadata ───────────────────────────────────────────────────────────────

  describe('getIngestionMeta', () => {
    it('returns null before first run', () => {
      const { lastIngestionAt, stats } = mod.getIngestionMeta();
      expect(lastIngestionAt).toBeNull();
      expect(stats).toBeNull();
    });

    it('returns populated stats after a run', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob()]);
      mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

      await mod.runIngestion();
      const { lastIngestionAt, stats } = mod.getIngestionMeta();
      expect(lastIngestionAt).toBeInstanceOf(Date);
      expect(stats.newJobs).toBe(1);
    });
  });

  // ─── source aggregation ──────────────────────────────────────────────────────

  describe('source aggregation', () => {
    it('collects jobs from multiple sources in one run', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob({ sourceId: 'remotive-1', source: 'remotive' })]);
      mockHimalayasFetch.mockResolvedValue([makeRawJob({ sourceId: 'himalayas-1', source: 'himalayas' })]);
      mockBulkWrite.mockResolvedValue({ upsertedCount: 2, modifiedCount: 0 });

      const stats = await mod.runIngestion();
      expect(stats.total).toBe(2);
    });

    it('continues when one source throws — other sources still run', async () => {
      mockRemotiveFetch.mockRejectedValue(new Error('network error'));
      mockHimalayasFetch.mockResolvedValue([makeRawJob({ sourceId: 'himalayas-1', source: 'himalayas' })]);
      mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

      const stats = await mod.runIngestion();
      expect(stats.total).toBeGreaterThan(0);
    });

    it('returns zero stats when all sources return empty', async () => {
      const stats = await mod.runIngestion();
      expect(stats.total).toBe(0);
      expect(mockBulkWrite).not.toHaveBeenCalled();
    });
  });

  // ─── role filtering ──────────────────────────────────────────────────────────

  describe('role filtering', () => {
    it('keeps APM jobs', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob({ title: 'Associate Product Manager' })]);
      mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

      const stats = await mod.runIngestion();
      expect(stats.total).toBe(1);
    });

    it('keeps PM jobs', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob({ title: 'Senior Product Manager', sourceId: 'remotive-pm1' })]);
      mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

      const stats = await mod.runIngestion();
      expect(stats.total).toBe(1);
    });

    it('drops non-PM/APM jobs', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob({ title: 'Software Engineer', sourceId: 'remotive-se1' })]);

      const stats = await mod.runIngestion();
      expect(stats.total).toBe(0);
      expect(mockBulkWrite).not.toHaveBeenCalled();
    });
  });

  // ─── location filtering ──────────────────────────────────────────────────────

  describe('location filtering', () => {
    it('keeps remote jobs', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob({ remote: true, location: 'Worldwide' })]);
      mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

      const stats = await mod.runIngestion();
      expect(stats.total).toBe(1);
    });

    it('keeps India location jobs even if remote=false', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob({ remote: false, location: 'Mumbai, India' })]);
      mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

      const stats = await mod.runIngestion();
      expect(stats.total).toBe(1);
    });

    it('drops jobs restricted to non-India regions even if remote=true', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob({ remote: true, location: 'USA Only' })]);

      const stats = await mod.runIngestion();
      expect(stats.total).toBe(0);
    });

    it('keeps jobs with Worldwide location', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob({ remote: true, location: 'Worldwide' })]);
      mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

      const stats = await mod.runIngestion();
      expect(stats.total).toBe(1);
    });
  });

  // ─── deduplication ───────────────────────────────────────────────────────────

  describe('deduplication', () => {
    it('deduplicates jobs with the same source + sourceId across sources', async () => {
      const job = makeRawJob({ sourceId: 'remotive-001', source: 'remotive' });
      mockRemotiveFetch.mockResolvedValue([job, job]); // same job twice
      mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

      const stats = await mod.runIngestion();
      expect(stats.total).toBe(1);
    });
  });

  // ─── MongoDB upsert ──────────────────────────────────────────────────────────

  describe('MongoDB upsert', () => {
    it('sets expireAt to now + 48h on every job', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob()]);
      mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

      await mod.runIngestion();

      const op = mockBulkWrite.mock.calls[0][0][0];
      expect(op.updateOne.update.$set.expireAt.getTime()).toBe(NOW_MS + TTL_48H_MS);
    });

    it('uses source + sourceJobId as the upsert filter', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob()]);
      mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

      await mod.runIngestion();

      const filter = mockBulkWrite.mock.calls[0][0][0].updateOne.filter;
      expect(filter.source).toBe('remotive');
      expect(typeof filter.sourceJobId).toBe('string');
    });

    it('sets upsert: true', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob()]);
      mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

      await mod.runIngestion();

      expect(mockBulkWrite.mock.calls[0][0][0].updateOne.upsert).toBe(true);
    });

    it('reports correct newJobs and updatedJobs from bulkWrite', async () => {
      mockRemotiveFetch.mockResolvedValue([makeRawJob(), makeRawJob({ sourceId: 'remotive-002' })]);
      mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 1 });

      const stats = await mod.runIngestion();
      expect(stats.newJobs).toBe(1);
      expect(stats.updatedJobs).toBe(1);
    });
  });
});

// ─── Talentd freshness gate ───────────────────────────────────────────────────

const FRESH_3H_MS   = NOW_MS - 3  * 60 * 60 * 1000;
const STALE_49H_MS  = NOW_MS - 49 * 60 * 60 * 1000;

function makeTalentdRawJob(overrides = {}) {
  return {
    sourceId:       'talentd-fresher-test-job',
    title:          'Software Engineer',
    company:        'Test Corp',
    location:       'Bengaluru, India',
    url:            'https://talentd.in/jobs/test-job',
    remote:         false,
    jobType:        'Full-time',
    category:       'Fresher',
    source:         'talentd',
    sourceLabel:    'Talentd',
    rawPostedText:  '3 hours ago',
    sourcePostedAt: new Date(FRESH_3H_MS),
    ...overrides,
  };
}

describe('Talentd freshness gate', () => {
  let mod2;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
    vi.resetModules();

    vi.mock('../../models/Job.model.js', () => ({ default: { bulkWrite: mockBulkWrite, updateMany: vi.fn().mockResolvedValue({ modifiedCount: 0 }) } }));
    vi.mock('./sources/remotive.js',       () => ({ fetch: mockRemotiveFetch,       name: 'Remotive',        sourceKey: 'remotive' }));
    vi.mock('./sources/remoteOk.js',       () => ({ fetch: mockRemoteOkFetch,       name: 'RemoteOK',        sourceKey: 'remoteok' }));
    vi.mock('./sources/himalayas.js',      () => ({ fetch: mockHimalayasFetch,      name: 'Himalayas',       sourceKey: 'himalayas' }));
    vi.mock('./sources/workingNomads.js',  () => ({ fetch: mockWorkingNomadsFetch,  name: 'Working Nomads',  sourceKey: 'workingnomads' }));
    vi.mock('./sources/jobicy.js',         () => ({ fetch: mockJobicyFetch,         name: 'Jobicy',          sourceKey: 'jobicy' }));
    vi.mock('./sources/weWorkRemotely.js', () => ({ fetch: mockWeWorkFetch,         name: 'We Work Remotely', sourceKey: 'weworkremotely' }));
    vi.mock('./sources/jobspresso.js',     () => ({ fetch: mockJobspressoFetch,     name: 'Jobspresso',      sourceKey: 'jobspresso' }));
    vi.mock('./sources/authenticjobs.js',  () => ({ fetch: mockAuthenticFetch,      name: 'Authentic Jobs',  sourceKey: 'authenticjobs' }));
    vi.mock('./sources/dynamitejobs.js',   () => ({ fetch: mockDynamiteFetch,       name: 'Dynamite Jobs',   sourceKey: 'dynamitejobs' }));
    vi.mock('./sources/themuse.js',        () => ({ fetch: mockTheMuseFetch,        name: 'The Muse',        sourceKey: 'themuse' }));
    vi.mock('./sources/greenhouse.js',     () => ({ fetch: mockGreenhouseFetch,     name: 'Greenhouse',      sourceKey: 'greenhouse' }));
    vi.mock('./sources/lever.js',          () => ({ fetch: mockLeverFetch,          name: 'Lever',           sourceKey: 'lever' }));
    vi.mock('./sources/arcdev.js',         () => ({ fetch: mockArcdevFetch,         name: 'Arc.dev',         sourceKey: 'arcdev' }));
    vi.mock('./sources/talentd.js',        () => ({ fetch: mockTalentdFetch,        name: 'Talentd',         sourceKey: 'talentd' }));
    vi.mock('./sources/remoteOkIndia.js',  () => ({ fetch: mockRemoteOkIndiaFetch,  name: 'RemoteOK India',  sourceKey: 'remoteok-india' }));

    [mockRemotiveFetch, mockRemoteOkFetch, mockHimalayasFetch, mockWorkingNomadsFetch,
     mockJobicyFetch, mockWeWorkFetch, mockJobspressoFetch, mockAuthenticFetch,
     mockDynamiteFetch, mockTheMuseFetch, mockGreenhouseFetch, mockLeverFetch,
     mockArcdevFetch, mockRemoteOkIndiaFetch].forEach(m => m.mockResolvedValue([]));

    mockBulkWrite.mockResolvedValue({ upsertedCount: 0, modifiedCount: 0 });

    // Only run Talentd so these tests are isolated.
    process.env.JOB_SOURCE_MODE = 'talentd_only';

    mod2 = await import('./ingestion.js');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete process.env.JOB_SOURCE_MODE;
  });

  it('saves a Talentd job with a fresh timestamp (3 hours ago)', async () => {
    mockTalentdFetch.mockResolvedValue([makeTalentdRawJob()]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    const stats = await mod2.runIngestion();

    expect(stats.total).toBe(1);
    expect(mockBulkWrite).toHaveBeenCalled();
  });

  it('stores rawPostedText on the saved Talentd job', async () => {
    mockTalentdFetch.mockResolvedValue([makeTalentdRawJob({ rawPostedText: '5 hours ago' })]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    await mod2.runIngestion();

    const op = mockBulkWrite.mock.calls[0][0][0];
    expect(op.updateOne.update.$set.rawPostedText).toBe('5 hours ago');
  });

  it('rejects a Talentd job with a null timestamp before DB write', async () => {
    mockTalentdFetch.mockResolvedValue([
      makeTalentdRawJob({ rawPostedText: null, sourcePostedAt: null }),
    ]);

    const stats = await mod2.runIngestion();

    expect(stats.total).toBe(0);
    expect(mockBulkWrite).not.toHaveBeenCalled();
  });

  it('rejects a Talentd job with an invalid timestamp before DB write', async () => {
    mockTalentdFetch.mockResolvedValue([
      makeTalentdRawJob({ rawPostedText: 'xyz garbage', sourcePostedAt: null }),
    ]);

    const stats = await mod2.runIngestion();

    expect(stats.total).toBe(0);
    expect(mockBulkWrite).not.toHaveBeenCalled();
  });

  it('rejects a Talentd job that is 49 hours old before DB write', async () => {
    mockTalentdFetch.mockResolvedValue([
      makeTalentdRawJob({
        rawPostedText:  '49 hours ago',
        sourcePostedAt: new Date(STALE_49H_MS),
      }),
    ]);

    const stats = await mod2.runIngestion();

    expect(stats.total).toBe(0);
    expect(mockBulkWrite).not.toHaveBeenCalled();
  });

  it('rejects a Talentd job with "2 days ago" (= 48h boundary) before DB write', async () => {
    // parseRelativeTimestamp returns null for "2 days ago" per policy,
    // so sourcePostedAt is null — the normalizer rejects on missing timestamp.
    mockTalentdFetch.mockResolvedValue([
      makeTalentdRawJob({ rawPostedText: '2 days ago', sourcePostedAt: null }),
    ]);

    const stats = await mod2.runIngestion();

    expect(stats.total).toBe(0);
    expect(mockBulkWrite).not.toHaveBeenCalled();
  });
});

// ─── Talentd update-sync ──────────────────────────────────────────────────────

describe('Talentd update-sync', () => {
  let mod3;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
    vi.resetModules();

    mockUpdateMany.mockResolvedValue({ modifiedCount: 0 });

    vi.mock('../../models/Job.model.js', () => ({
      default: { bulkWrite: mockBulkWrite, updateMany: mockUpdateMany },
    }));
    vi.mock('./sources/remotive.js',       () => ({ fetch: mockRemotiveFetch,       name: 'Remotive',        sourceKey: 'remotive' }));
    vi.mock('./sources/remoteOk.js',       () => ({ fetch: mockRemoteOkFetch,       name: 'RemoteOK',        sourceKey: 'remoteok' }));
    vi.mock('./sources/himalayas.js',      () => ({ fetch: mockHimalayasFetch,      name: 'Himalayas',       sourceKey: 'himalayas' }));
    vi.mock('./sources/workingNomads.js',  () => ({ fetch: mockWorkingNomadsFetch,  name: 'Working Nomads',  sourceKey: 'workingnomads' }));
    vi.mock('./sources/jobicy.js',         () => ({ fetch: mockJobicyFetch,         name: 'Jobicy',          sourceKey: 'jobicy' }));
    vi.mock('./sources/weWorkRemotely.js', () => ({ fetch: mockWeWorkFetch,         name: 'We Work Remotely', sourceKey: 'weworkremotely' }));
    vi.mock('./sources/jobspresso.js',     () => ({ fetch: mockJobspressoFetch,     name: 'Jobspresso',      sourceKey: 'jobspresso' }));
    vi.mock('./sources/authenticjobs.js',  () => ({ fetch: mockAuthenticFetch,      name: 'Authentic Jobs',  sourceKey: 'authenticjobs' }));
    vi.mock('./sources/dynamitejobs.js',   () => ({ fetch: mockDynamiteFetch,       name: 'Dynamite Jobs',   sourceKey: 'dynamitejobs' }));
    vi.mock('./sources/themuse.js',        () => ({ fetch: mockTheMuseFetch,        name: 'The Muse',        sourceKey: 'themuse' }));
    vi.mock('./sources/greenhouse.js',     () => ({ fetch: mockGreenhouseFetch,     name: 'Greenhouse',      sourceKey: 'greenhouse' }));
    vi.mock('./sources/lever.js',          () => ({ fetch: mockLeverFetch,          name: 'Lever',           sourceKey: 'lever' }));
    vi.mock('./sources/arcdev.js',         () => ({ fetch: mockArcdevFetch,         name: 'Arc.dev',         sourceKey: 'arcdev' }));
    vi.mock('./sources/talentd.js',        () => ({ fetch: mockTalentdFetch,        name: 'Talentd',         sourceKey: 'talentd' }));
    vi.mock('./sources/remoteOkIndia.js',  () => ({ fetch: mockRemoteOkIndiaFetch,  name: 'RemoteOK India',  sourceKey: 'remoteok-india' }));

    [mockRemotiveFetch, mockRemoteOkFetch, mockHimalayasFetch, mockWorkingNomadsFetch,
     mockJobicyFetch, mockWeWorkFetch, mockJobspressoFetch, mockAuthenticFetch,
     mockDynamiteFetch, mockTheMuseFetch, mockGreenhouseFetch, mockLeverFetch,
     mockArcdevFetch, mockRemoteOkIndiaFetch].forEach(m => m.mockResolvedValue([]));

    mockBulkWrite.mockResolvedValue({ upsertedCount: 0, modifiedCount: 0 });

    process.env.JOB_SOURCE_MODE = 'talentd_only';

    mod3 = await import('./ingestion.js');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete process.env.JOB_SOURCE_MODE;
  });

  it('puts firstDiscoveredAt in $setOnInsert only — not overwritten on re-scrape', async () => {
    mockTalentdFetch.mockResolvedValue([makeTalentdRawJob()]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    await mod3.runIngestion();

    const { update } = mockBulkWrite.mock.calls[0][0][0].updateOne;
    expect(update.$setOnInsert.firstDiscoveredAt).toEqual(new Date(NOW_MS));
    expect(update.$set).not.toHaveProperty('firstDiscoveredAt');
  });

  it('calls updateMany to mark absent Talentd jobs inactive with the correct filter', async () => {
    mockTalentdFetch.mockResolvedValue([makeTalentdRawJob()]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    await mod3.runIngestion();

    expect(mockUpdateMany).toHaveBeenCalledWith(
      { source: 'talentd', isActive: true, lastSeenAt: { $lt: new Date(NOW_MS - 30_000) } },
      { $set: { isActive: false } },
    );
  });

  it('always sets isActive: true in $set on upsert, restoring a previously inactive job', async () => {
    mockTalentdFetch.mockResolvedValue([makeTalentdRawJob()]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 0, modifiedCount: 1 });

    await mod3.runIngestion();

    const { $set } = mockBulkWrite.mock.calls[0][0][0].updateOne.update;
    expect($set.isActive).toBe(true);
  });

  it('overwrites rawPostedText, postedAt, and sourcePostedAt with the latest scraped values', async () => {
    const freshDate = new Date(NOW_MS - 7 * 60 * 60 * 1000);
    mockTalentdFetch.mockResolvedValue([
      makeTalentdRawJob({ rawPostedText: '7 hours ago', sourcePostedAt: freshDate }),
    ]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 0, modifiedCount: 1 });

    await mod3.runIngestion();

    const { $set } = mockBulkWrite.mock.calls[0][0][0].updateOne.update;
    expect($set.rawPostedText).toBe('7 hours ago');
    expect($set.postedAt).toEqual(freshDate);
    expect($set.sourcePostedAt).toEqual(freshDate);
  });

  it('refreshes expireAt to now + 48h for jobs that pass the freshness gate', async () => {
    mockTalentdFetch.mockResolvedValue([makeTalentdRawJob()]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    await mod3.runIngestion();

    const { $set } = mockBulkWrite.mock.calls[0][0][0].updateOne.update;
    expect($set.expireAt.getTime()).toBe(NOW_MS + TTL_48H_MS);
  });

  it('does not call bulkWrite — and so does not update expireAt — for a job that fails the freshness gate', async () => {
    mockTalentdFetch.mockResolvedValue([
      makeTalentdRawJob({ rawPostedText: null, sourcePostedAt: null }),
    ]);

    await mod3.runIngestion();

    expect(mockBulkWrite).not.toHaveBeenCalled();
  });
});

// ─── Talentd timeout / failure isolation ─────────────────────────────────────

describe('Talentd timeout/failure isolation', () => {
  let mod5;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
    vi.resetModules();

    mockUpdateMany.mockResolvedValue({ modifiedCount: 0 });

    vi.mock('../../models/Job.model.js', () => ({
      default: { bulkWrite: mockBulkWrite, updateMany: mockUpdateMany },
    }));
    vi.mock('./sources/remotive.js',       () => ({ fetch: mockRemotiveFetch,       name: 'Remotive',        sourceKey: 'remotive' }));
    vi.mock('./sources/remoteOk.js',       () => ({ fetch: mockRemoteOkFetch,       name: 'RemoteOK',        sourceKey: 'remoteok' }));
    vi.mock('./sources/himalayas.js',      () => ({ fetch: mockHimalayasFetch,      name: 'Himalayas',       sourceKey: 'himalayas' }));
    vi.mock('./sources/workingNomads.js',  () => ({ fetch: mockWorkingNomadsFetch,  name: 'Working Nomads',  sourceKey: 'workingnomads' }));
    vi.mock('./sources/jobicy.js',         () => ({ fetch: mockJobicyFetch,         name: 'Jobicy',          sourceKey: 'jobicy' }));
    vi.mock('./sources/weWorkRemotely.js', () => ({ fetch: mockWeWorkFetch,         name: 'We Work Remotely', sourceKey: 'weworkremotely' }));
    vi.mock('./sources/jobspresso.js',     () => ({ fetch: mockJobspressoFetch,     name: 'Jobspresso',      sourceKey: 'jobspresso' }));
    vi.mock('./sources/authenticjobs.js',  () => ({ fetch: mockAuthenticFetch,      name: 'Authentic Jobs',  sourceKey: 'authenticjobs' }));
    vi.mock('./sources/dynamitejobs.js',   () => ({ fetch: mockDynamiteFetch,       name: 'Dynamite Jobs',   sourceKey: 'dynamitejobs' }));
    vi.mock('./sources/themuse.js',        () => ({ fetch: mockTheMuseFetch,        name: 'The Muse',        sourceKey: 'themuse' }));
    vi.mock('./sources/greenhouse.js',     () => ({ fetch: mockGreenhouseFetch,     name: 'Greenhouse',      sourceKey: 'greenhouse' }));
    vi.mock('./sources/lever.js',          () => ({ fetch: mockLeverFetch,          name: 'Lever',           sourceKey: 'lever' }));
    vi.mock('./sources/arcdev.js',         () => ({ fetch: mockArcdevFetch,         name: 'Arc.dev',         sourceKey: 'arcdev' }));
    vi.mock('./sources/talentd.js',        () => ({ fetch: mockTalentdFetch,        name: 'Talentd',         sourceKey: 'talentd' }));
    vi.mock('./sources/remoteOkIndia.js',  () => ({ fetch: mockRemoteOkIndiaFetch,  name: 'RemoteOK India',  sourceKey: 'remoteok-india' }));

    [mockRemotiveFetch, mockRemoteOkFetch, mockHimalayasFetch, mockWorkingNomadsFetch,
     mockJobicyFetch, mockWeWorkFetch, mockJobspressoFetch, mockAuthenticFetch,
     mockDynamiteFetch, mockTheMuseFetch, mockGreenhouseFetch, mockLeverFetch,
     mockArcdevFetch, mockRemoteOkIndiaFetch].forEach(m => m.mockResolvedValue([]));

    mockBulkWrite.mockResolvedValue({ upsertedCount: 0, modifiedCount: 0 });
    process.env.JOB_SOURCE_MODE = 'talentd_only';
    mod5 = await import('./ingestion.js');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete process.env.JOB_SOURCE_MODE;
  });

  it('does not update lastIngestionAt or stats when Talentd fails', async () => {
    mockTalentdFetch.mockRejectedValue(new Error('Talentd timed out after 600000ms'));

    await mod5.runIngestion();

    const { lastIngestionAt, stats } = mod5.getIngestionMeta();
    expect(lastIngestionAt).toBeNull();
    expect(stats).toBeNull();
  });

  it('preserves previous good stats when Talentd subsequently fails', async () => {
    mockTalentdFetch.mockResolvedValueOnce([makeTalentdRawJob()]);
    mockBulkWrite.mockResolvedValueOnce({ upsertedCount: 1, modifiedCount: 0 });

    await mod5.runIngestion();
    const { stats: first } = mod5.getIngestionMeta();
    expect(first.total).toBe(1);

    mockTalentdFetch.mockRejectedValue(new Error('timeout'));
    await mod5.runIngestion();

    const { stats: second } = mod5.getIngestionMeta();
    expect(second.total).toBe(1); // preserved from first run
  });

  it('does not call mark-inactive (updateMany) when Talentd fails', async () => {
    mockTalentdFetch.mockRejectedValue(new Error('timeout'));

    await mod5.runIngestion();

    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it('passes an AbortSignal to talentd.fetch so in-flight requests can be cancelled', async () => {
    let receivedSignal;
    mockTalentdFetch.mockImplementation(async (signal) => {
      receivedSignal = signal;
      return [];
    });
    mockUpdateMany.mockResolvedValue({ modifiedCount: 0 });

    await mod5.runIngestion();

    expect(receivedSignal).toBeInstanceOf(AbortSignal);
  });
});

// ─── Talentd detail fallback ──────────────────────────────────────────────────

describe('Talentd detail fallback', () => {
  let mod4;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
    vi.resetModules();

    mockUpdateMany.mockResolvedValue({ modifiedCount: 0 });

    vi.mock('../../models/Job.model.js', () => ({
      default: { bulkWrite: mockBulkWrite, updateMany: mockUpdateMany },
    }));
    vi.mock('./sources/remotive.js',       () => ({ fetch: mockRemotiveFetch,       name: 'Remotive',        sourceKey: 'remotive' }));
    vi.mock('./sources/remoteOk.js',       () => ({ fetch: mockRemoteOkFetch,       name: 'RemoteOK',        sourceKey: 'remoteok' }));
    vi.mock('./sources/himalayas.js',      () => ({ fetch: mockHimalayasFetch,      name: 'Himalayas',       sourceKey: 'himalayas' }));
    vi.mock('./sources/workingNomads.js',  () => ({ fetch: mockWorkingNomadsFetch,  name: 'Working Nomads',  sourceKey: 'workingnomads' }));
    vi.mock('./sources/jobicy.js',         () => ({ fetch: mockJobicyFetch,         name: 'Jobicy',          sourceKey: 'jobicy' }));
    vi.mock('./sources/weWorkRemotely.js', () => ({ fetch: mockWeWorkFetch,         name: 'We Work Remotely', sourceKey: 'weworkremotely' }));
    vi.mock('./sources/jobspresso.js',     () => ({ fetch: mockJobspressoFetch,     name: 'Jobspresso',      sourceKey: 'jobspresso' }));
    vi.mock('./sources/authenticjobs.js',  () => ({ fetch: mockAuthenticFetch,      name: 'Authentic Jobs',  sourceKey: 'authenticjobs' }));
    vi.mock('./sources/dynamitejobs.js',   () => ({ fetch: mockDynamiteFetch,       name: 'Dynamite Jobs',   sourceKey: 'dynamitejobs' }));
    vi.mock('./sources/themuse.js',        () => ({ fetch: mockTheMuseFetch,        name: 'The Muse',        sourceKey: 'themuse' }));
    vi.mock('./sources/greenhouse.js',     () => ({ fetch: mockGreenhouseFetch,     name: 'Greenhouse',      sourceKey: 'greenhouse' }));
    vi.mock('./sources/lever.js',          () => ({ fetch: mockLeverFetch,          name: 'Lever',           sourceKey: 'lever' }));
    vi.mock('./sources/arcdev.js',         () => ({ fetch: mockArcdevFetch,         name: 'Arc.dev',         sourceKey: 'arcdev' }));
    vi.mock('./sources/talentd.js',        () => ({ fetch: mockTalentdFetch,        name: 'Talentd',         sourceKey: 'talentd' }));
    vi.mock('./sources/remoteOkIndia.js',  () => ({ fetch: mockRemoteOkIndiaFetch,  name: 'RemoteOK India',  sourceKey: 'remoteok-india' }));

    [mockRemotiveFetch, mockRemoteOkFetch, mockHimalayasFetch, mockWorkingNomadsFetch,
     mockJobicyFetch, mockWeWorkFetch, mockJobspressoFetch, mockAuthenticFetch,
     mockDynamiteFetch, mockTheMuseFetch, mockGreenhouseFetch, mockLeverFetch,
     mockArcdevFetch, mockRemoteOkIndiaFetch].forEach(m => m.mockResolvedValue([]));

    mockBulkWrite.mockResolvedValue({ upsertedCount: 0, modifiedCount: 0 });
    process.env.JOB_SOURCE_MODE = 'talentd_only';
    mod4 = await import('./ingestion.js');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete process.env.JOB_SOURCE_MODE;
  });

  it('saves a Structure X job whose sourcePostedAt comes from the detail page (within 48h)', async () => {
    const detailDate = new Date(NOW_MS - 19 * 60 * 60 * 1000); // 19 hours ago
    mockTalentdFetch.mockResolvedValue([
      makeTalentdRawJob({
        rawPostedText:      null,
        sourcePostedAt:     detailDate,
        sourceDatePostedRaw: detailDate.toISOString(),
        timestampSource:    'detail',
      }),
    ]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    const stats = await mod4.runIngestion();

    expect(stats.total).toBe(1);
    expect(mockBulkWrite).toHaveBeenCalled();
  });

  it('rejects a Structure X job whose detail sourcePostedAt is older than 48h', async () => {
    const staleDate = new Date(NOW_MS - 50 * 60 * 60 * 1000); // 50 hours ago
    mockTalentdFetch.mockResolvedValue([
      makeTalentdRawJob({
        rawPostedText:      null,
        sourcePostedAt:     staleDate,
        sourceDatePostedRaw: staleDate.toISOString(),
        timestampSource:    'detail',
      }),
    ]);

    const stats = await mod4.runIngestion();

    expect(stats.total).toBe(0);
    expect(mockBulkWrite).not.toHaveBeenCalled();
  });

  it('stores timestampSource and sourceDatePostedRaw from detail fallback in the upsert', async () => {
    const detailDate    = new Date(NOW_MS - 19 * 60 * 60 * 1000);
    const detailDateIso = detailDate.toISOString();
    mockTalentdFetch.mockResolvedValue([
      makeTalentdRawJob({
        rawPostedText:      null,
        sourcePostedAt:     detailDate,
        sourceDatePostedRaw: detailDateIso,
        timestampSource:    'detail',
      }),
    ]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    await mod4.runIngestion();

    const { $set } = mockBulkWrite.mock.calls[0][0][0].updateOne.update;
    expect($set.timestampSource).toBe('detail');
    expect($set.sourceDatePostedRaw).toBe(detailDateIso);
  });
});

// ─── India mode ───────────────────────────────────────────────────────────────

const FRESH_3H_INDIA  = NOW_MS - 3  * 60 * 60 * 1000;
const STALE_49H_INDIA = NOW_MS - 49 * 60 * 60 * 1000;

function makeRemoteOkIndiaRawJob(overrides = {}) {
  return {
    sourceId:       'remoteok-india-99001',
    title:          'Backend Developer',
    company:        'Acme Remote',
    location:       'Remote',
    url:            'https://remoteok.com/remote-jobs/99001',
    remote:         true,
    tags:           ['backend', 'node'],
    jobType:        'Full-time',
    source:         'remoteok-india',
    sourceLabel:    'RemoteOK',
    sourcePostedAt: new Date(FRESH_3H_INDIA),
    ...overrides,
  };
}

describe('India mode ingestion', () => {
  let modIndia;

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
    vi.mock('./sources/remoteOkIndia.js',  () => ({ fetch: mockRemoteOkIndiaFetch,   name: 'RemoteOK',        sourceKey: 'remoteok-india' }));

    [mockRemotiveFetch, mockRemoteOkFetch, mockHimalayasFetch, mockWorkingNomadsFetch,
     mockJobicyFetch, mockWeWorkFetch, mockJobspressoFetch, mockAuthenticFetch,
     mockDynamiteFetch, mockTheMuseFetch, mockGreenhouseFetch, mockLeverFetch,
     mockArcdevFetch, mockRemoteOkIndiaFetch].forEach(m => m.mockResolvedValue([]));

    mockBulkWrite.mockResolvedValue({ upsertedCount: 0, modifiedCount: 0 });
    process.env.JOB_SOURCE_MODE = 'india';
    modIndia = await import('./ingestion.js');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    delete process.env.JOB_SOURCE_MODE;
  });

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

  it('saves a fresh remoteok-india job', async () => {
    mockTalentdFetch.mockResolvedValue([]);
    mockRemoteOkIndiaFetch.mockResolvedValue([makeRemoteOkIndiaRawJob()]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    const stats = await modIndia.runIngestion();
    expect(stats.total).toBe(1);
  });

  it('rejects a remoteok-india job with null timestamp', async () => {
    mockTalentdFetch.mockResolvedValue([]);
    mockRemoteOkIndiaFetch.mockResolvedValue([
      makeRemoteOkIndiaRawJob({ sourcePostedAt: null }),
    ]);

    const stats = await modIndia.runIngestion();
    expect(stats.total).toBe(0);
    expect(mockBulkWrite).not.toHaveBeenCalled();
  });

  it('rejects a remoteok-india job older than 48h', async () => {
    mockTalentdFetch.mockResolvedValue([]);
    mockRemoteOkIndiaFetch.mockResolvedValue([
      makeRemoteOkIndiaRawJob({ sourcePostedAt: new Date(STALE_49H_INDIA) }),
    ]);

    const stats = await modIndia.runIngestion();
    expect(stats.total).toBe(0);
    expect(mockBulkWrite).not.toHaveBeenCalled();
  });

  it('still marks Talentd jobs inactive in india mode', async () => {
    mockTalentdFetch.mockResolvedValue([makeTalentdRawJob()]);
    mockRemoteOkIndiaFetch.mockResolvedValue([]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    await modIndia.runIngestion();

    expect(mockUpdateMany).toHaveBeenCalledWith(
      { source: 'talentd', isActive: true, lastSeenAt: { $lt: new Date(NOW_MS - 30_000) } },
      { $set: { isActive: false } },
    );
  });

  it('aborts india mode when Talentd fails — does not call mark-inactive', async () => {
    mockTalentdFetch.mockRejectedValue(new Error('Talentd network error'));
    mockRemoteOkIndiaFetch.mockResolvedValue([makeRemoteOkIndiaRawJob()]);

    await modIndia.runIngestion();

    expect(mockUpdateMany).not.toHaveBeenCalled();
    expect(mockBulkWrite).not.toHaveBeenCalled();
  });

  it('deduplicates jobs with the same source + sourceId across both sources', async () => {
    const dup = makeRemoteOkIndiaRawJob({ sourceId: 'remoteok-india-99001' });
    mockTalentdFetch.mockResolvedValue([]);
    mockRemoteOkIndiaFetch.mockResolvedValue([dup, dup]);
    mockBulkWrite.mockResolvedValue({ upsertedCount: 1, modifiedCount: 0 });

    const stats = await modIndia.runIngestion();
    expect(stats.total).toBe(1);
  });
});
