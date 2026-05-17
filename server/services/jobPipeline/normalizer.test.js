import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { normalizeJob } from './normalizer.js';

const NOW_MS = new Date('2026-05-14T10:00:00.000Z').getTime();
const H48_MS = 48 * 60 * 60 * 1000;

function makeTalentdRaw(overrides = {}) {
  return {
    sourceId:       'talentd-fresher-some-job',
    title:          'Software Engineer',
    company:        'Acme',
    location:       'Bengaluru, India',
    url:            'https://talentd.in/jobs/some-job',
    remote:         false,
    source:         'talentd',
    sourceLabel:    'Talentd',
    category:       'Fresher',
    rawPostedText:  '3 hours ago',
    sourcePostedAt: new Date(NOW_MS - 3 * 60 * 60 * 1000),
    ...overrides,
  };
}

describe('normalizeJob — Talentd freshness gate', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts a fresh Talentd job (3 hours old)', () => {
    expect(normalizeJob(makeTalentdRaw())).not.toBeNull();
  });

  it('accepts a Talentd job 1 ms before the 48h boundary', () => {
    const raw = makeTalentdRaw({ sourcePostedAt: new Date(NOW_MS - H48_MS + 1) });
    expect(normalizeJob(raw)).not.toBeNull();
  });

  it('rejects a Talentd job exactly at the 48h boundary', () => {
    const raw = makeTalentdRaw({ sourcePostedAt: new Date(NOW_MS - H48_MS) });
    expect(normalizeJob(raw)).toBeNull();
  });

  it('rejects a Talentd job 1 ms past the 48h boundary', () => {
    const raw = makeTalentdRaw({ sourcePostedAt: new Date(NOW_MS - H48_MS - 1) });
    expect(normalizeJob(raw)).toBeNull();
  });

  it('rejects a Talentd job with null sourcePostedAt', () => {
    const raw = makeTalentdRaw({ sourcePostedAt: null, rawPostedText: null });
    expect(normalizeJob(raw)).toBeNull();
  });

  it('passes rawPostedText through to the normalized job', () => {
    const result = normalizeJob(makeTalentdRaw({ rawPostedText: '5 hours ago' }));
    expect(result?.rawPostedText).toBe('5 hours ago');
  });

  it('does not apply the freshness gate to non-Talentd (PM) jobs with no postedAt', () => {
    const raw = {
      sourceId:       'remotive-001',
      title:          'Associate Product Manager',
      company:        'Acme',
      location:       'Remote',
      url:            'https://example.com/job/001',
      remote:         true,
      source:         'remotive',
      sourceLabel:    'Remotive',
      sourcePostedAt: null,
    };
    // Non-Talentd jobs with no date are allowed (UNKNOWN_DATE behavior).
    expect(normalizeJob(raw)).not.toBeNull();
  });
});

// ─── normalizeJob — India-mode sources (remoteok-india) ───────────────────────

function makeRemoteOkIndiaRaw(overrides = {}) {
  return {
    sourceId:      'remoteok-india-12345',
    title:         'Backend Developer',
    company:       'Acme',
    location:      'Remote',
    url:           'https://remoteok.com/remote-jobs/12345',
    remote:        true,
    tags:          ['backend', 'node'],
    jobType:       'Full-time',
    source:        'remoteok-india',
    sourceLabel:   'RemoteOK',
    sourcePostedAt: new Date(NOW_MS - 3 * 60 * 60 * 1000), // 3 hours ago
    ...overrides,
  };
}

describe('normalizeJob — remoteok-india freshness gate', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('accepts a remoteok-india job with a fresh timestamp (3 hours old)', () => {
    expect(normalizeJob(makeRemoteOkIndiaRaw())).not.toBeNull();
  });

  it('rejects a remoteok-india job with null sourcePostedAt', () => {
    expect(normalizeJob(makeRemoteOkIndiaRaw({ sourcePostedAt: null }))).toBeNull();
  });

  it('rejects a remoteok-india job exactly at the 48h boundary', () => {
    const raw = makeRemoteOkIndiaRaw({ sourcePostedAt: new Date(NOW_MS - H48_MS) });
    expect(normalizeJob(raw)).toBeNull();
  });

  it('rejects a remoteok-india job 49 hours old', () => {
    const raw = makeRemoteOkIndiaRaw({ sourcePostedAt: new Date(NOW_MS - 49 * 60 * 60 * 1000) });
    expect(normalizeJob(raw)).toBeNull();
  });

  it('rejects a remoteok-india job with a future timestamp', () => {
    const raw = makeRemoteOkIndiaRaw({ sourcePostedAt: new Date(NOW_MS + 60 * 60 * 1000) });
    expect(normalizeJob(raw)).toBeNull();
  });

  it('drops a remoteok-india job restricted to "US Only" (not India-accessible)', () => {
    const raw = makeRemoteOkIndiaRaw({ location: 'US Only', remote: false });
    expect(normalizeJob(raw)).toBeNull();
  });

  it('keeps a remoteok-india job with location "Remote"', () => {
    expect(normalizeJob(makeRemoteOkIndiaRaw({ location: 'Remote' }))).not.toBeNull();
  });

  it('keeps a remoteok-india job with location "India"', () => {
    expect(normalizeJob(makeRemoteOkIndiaRaw({ location: 'India', remote: false }))).not.toBeNull();
  });
});

describe('normalizeJob — remoteok-india category mapping', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('derives categories[] via mapToCategories for a fresh remoteok-india job', () => {
    const raw = makeRemoteOkIndiaRaw({
      title:   'Software Engineer Intern',
      tags:    ['backend', 'python'],
      jobType: 'Internship',
      remote:  true,
    });
    const result = normalizeJob(raw);
    expect(result).not.toBeNull();
    expect(result.categories).toContain('Internship');
    expect(result.categories).toContain('IT/Software');
    expect(result.categories).toContain('Remote');
  });

  it('sets categories[] to the mapped values (not empty)', () => {
    const raw = makeRemoteOkIndiaRaw({ title: 'DevOps Engineer', tags: ['devops', 'kubernetes'], remote: true });
    const result = normalizeJob(raw);
    expect(result).not.toBeNull();
    expect(result.categories).toContain('IT/Software');
    expect(result.categories).toContain('Remote');
  });

  it('does NOT set categories[] for a PM/non-India source (remotive)', () => {
    const raw = {
      sourceId:       'remotive-001',
      title:          'Associate Product Manager',
      company:        'Acme',
      location:       'Remote',
      url:            'https://example.com/job/001',
      remote:         true,
      source:         'remotive',
      sourceLabel:    'Remotive',
      sourcePostedAt: new Date(NOW_MS - 3 * 60 * 60 * 1000),
    };
    const result = normalizeJob(raw);
    expect(result).not.toBeNull();
    // PM sources don't get India categories[]
    expect(result.categories).toBeUndefined();
  });
});
