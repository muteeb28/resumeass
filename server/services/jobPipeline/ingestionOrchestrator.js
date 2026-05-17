import Job from '../../models/Job.model.js';
import { ALL_SOURCES } from './sources/index.js';
import { computeDedupHash } from './deduplicator.js';
import {
  FRESHNESS_STATUS,
  INGESTION_WINDOW_HOURS,
  PM_KEYWORDS,
  PM_REJECT_KEYWORDS,
  ROLE_TYPE,
  SOURCE_STATUS,
} from './constants.js';
import { normalizeText, classifyRoleType } from './classifier.js';

const BATCH_SIZE = 1;
const BATCH_DELAY_MS = 800;
const SOURCE_TIMEOUT_MS = 120000;
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 1200;
const MIN_VALID_POST_DATE = new Date('2020-01-01').getTime();

let lastIngestionAt = null;
let lastIngestionStats = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function withTimeout(promise, label, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out (${ms}ms)`)), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

function sanitizePostDate(d) {
  if (!d) return null;
  const ms = new Date(d).getTime();
  if (isNaN(ms) || ms <= 0 || ms < MIN_VALID_POST_DATE) return null;
  return new Date(ms);
}


const FRESHNESS_THRESHOLD_MS = 48 * 60 * 60 * 1000; // 48h — what shows in the UI

function computeFreshnessStatus(postedAt, nowMs) {
  if (!postedAt) return FRESHNESS_STATUS.UNKNOWN_DATE;
  const postedMs = new Date(postedAt).getTime();
  if (isNaN(postedMs)) return FRESHNESS_STATUS.UNKNOWN_DATE;
  return (nowMs - postedMs) <= FRESHNESS_THRESHOLD_MS
    ? FRESHNESS_STATUS.FRESH
    : FRESHNESS_STATUS.STALE;
}

function toNormalizedJob(raw, now) {
  const title = String(raw.title ?? '').trim();
  const company = String(raw.company ?? '').trim() || 'Unknown';
  const url = String(raw.url ?? '').trim();
  if (!title || !url) return null;

  const source = raw.source ?? raw.sourceKey ?? 'unknown';
  const sourceJobId = String(raw.sourceJobId ?? raw.sourceId ?? '').trim()
    || Buffer.from(`${source}:${url}`).toString('base64').slice(0, 32);
  const postedAt = sanitizePostDate(raw.postedAt ?? raw.sourcePostedAt);
  const roleType = classifyRoleType(title, raw.description ?? '');
  if (!roleType) return null;

  const freshnessStatus = computeFreshnessStatus(postedAt, now.getTime());

  return {
    source,
    sourceLabel: raw.sourceLabel ?? raw.source ?? source,
    sourceJobId,
    title,
    normalizedTitle: normalizeText(title),
    company,
    location: String(raw.location ?? 'Remote').trim() || 'Remote',
    url,
    description: raw.description ? String(raw.description) : undefined,
    postedAt,
    discoveredAt: now,
    roleType,
    freshnessStatus,
    dateConfidence: postedAt ? 'exact' : 'inferred',
    remote: raw.remote ?? true,
    jobType: raw.jobType ?? 'Full-time',
    salary: raw.salary,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  };
}

function createFetchTelemetry() {
  return {
    requestCount: 0,
    responseBytes: 0,
    statuses: [],
    okCount: 0,
    htmlCount: 0,
    jsonCount: 0,
    blockedSignal: false,
  };
}

function buildMonitoredFetch(telemetry, originalFetch) {
  return async (input, init) => {
    telemetry.requestCount += 1;
    const res = await originalFetch(input, init);
    telemetry.statuses.push(res.status);
    if (res.ok) telemetry.okCount += 1;
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    if (ct.includes('text/html')) telemetry.htmlCount += 1;
    if (ct.includes('application/json')) telemetry.jsonCount += 1;

    const clone = res.clone();
    const body = await clone.text();
    telemetry.responseBytes += body.length;
    if (res.status === 403 || res.status === 429 || /cloudflare|captcha|access denied|bot/i.test(body)) {
      telemetry.blockedSignal = true;
    }
    return res;
  };
}

function classifySourceOutcome(outcome) {
  const { ok, error, rawCount, jobs, telemetry } = outcome;
  if (!ok) {
    if ((error || '').includes('UNSUPPORTED')) {
      return { status: SOURCE_STATUS.UNSUPPORTED, reason: error };
    }
    if (telemetry.blockedSignal) {
      return { status: SOURCE_STATUS.BLOCKED, reason: error || 'Blocked by anti-bot protections or 403/429 responses' };
    }
    return { status: SOURCE_STATUS.BROKEN_API, reason: error || 'Source request failed' };
  }

  if (rawCount === 0) {
    if (telemetry.requestCount === 0) {
      return { status: SOURCE_STATUS.PLACEHOLDER, reason: 'Source returned no jobs without making requests (placeholder integration)' };
    }
    if (telemetry.blockedSignal) {
      return { status: SOURCE_STATUS.BLOCKED, reason: 'Source appears blocked by anti-bot protection' };
    }
    if (telemetry.okCount === 0) {
      return { status: SOURCE_STATUS.BROKEN_API, reason: `No successful responses. HTTP statuses: ${telemetry.statuses.join(', ') || 'none'}` };
    }
    if (telemetry.htmlCount > 0) {
      return { status: SOURCE_STATUS.BROKEN_HTML_PARSER, reason: 'Successful HTML response but parser returned 0 jobs' };
    }
    return { status: SOURCE_STATUS.BROKEN_API, reason: 'Successful response but no parseable jobs found' };
  }

  const hasDate = jobs.some((j) => Boolean(j.postedAt));
  if (hasDate) {
    return { status: SOURCE_STATUS.WORKING_WITH_FRESH_DATE, reason: 'Parsed jobs with posted dates' };
  }
  return { status: SOURCE_STATUS.WORKING_NO_DATE_AVAILABLE, reason: 'Parsed jobs but no postedAt available' };
}

async function fetchWithRetry(source) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt += 1) {
    const telemetry = createFetchTelemetry();
    const originalFetch = globalThis.fetch;
    const monitoredFetch = buildMonitoredFetch(telemetry, originalFetch);
    try {
      globalThis.fetch = monitoredFetch;
      const jobs = await withTimeout(source.fetch(), source.name, SOURCE_TIMEOUT_MS);
      return { jobs: Array.isArray(jobs) ? jobs : [], attempts: attempt, telemetry };
    } catch (err) {
      lastErr = err;
      if ((err?.message || '').includes('UNSUPPORTED')) break;
      if (attempt <= MAX_RETRIES) {
        const delay = RETRY_BASE_MS * attempt;
        console.warn(`[JobPipeline]   ${source.name} attempt ${attempt} failed: ${err.message} — retrying in ${delay}ms`);
        await sleep(delay);
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  }
  throw lastErr;
}

export function getIngestionMeta() {
  return { lastIngestionAt, stats: lastIngestionStats };
}

export async function runIngestion() {
  const start = Date.now();
  const now = new Date();
  const cutoff = new Date(now.getTime() - (INGESTION_WINDOW_HOURS * 60 * 60 * 1000));
  console.log(`\n[JobPipeline] ═══ Ingestion started ${now.toISOString()} ═══`);
  console.log(`[JobPipeline] ${ALL_SOURCES.length} sources, freshness window=${INGESTION_WINDOW_HOURS}h`);

  const outcomes = [];
  for (let i = 0; i < ALL_SOURCES.length; i += BATCH_SIZE) {
    const wave = ALL_SOURCES.slice(i, i + BATCH_SIZE);
    const waveNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalWaves = Math.ceil(ALL_SOURCES.length / BATCH_SIZE);
    console.log(`[JobPipeline] Wave ${waveNum}/${totalWaves}: ${wave.map((s) => s.name).join(', ')}`);
    const results = await Promise.allSettled(wave.map((s) => fetchWithRetry(s)));

    for (let j = 0; j < wave.length; j += 1) {
      const result = results[j];
      const source = wave[j];
      if (result.status === 'fulfilled') {
        outcomes.push({
          source,
          ok: true,
          jobs: result.value.jobs,
          attempts: result.value.attempts,
          telemetry: result.value.telemetry,
        });
      } else {
        const errorMessage = result.reason?.message ?? String(result.reason);
        outcomes.push({
          source,
          ok: false,
          jobs: [],
          attempts: errorMessage.includes('UNSUPPORTED') ? 1 : MAX_RETRIES + 1,
          error: errorMessage,
          telemetry: createFetchTelemetry(),
        });
      }
    }
    if (i + BATCH_SIZE < ALL_SOURCES.length) await sleep(BATCH_DELAY_MS);
  }

  const sourceSummaries = [];
  const normalizedCandidates = [];
  for (const outcome of outcomes) {
    const rawJobs = outcome.jobs;
    const afterRole = rawJobs.map((j) => toNormalizedJob(j, now)).filter(Boolean);
    const fresh = afterRole.filter((j) => 
      j.freshnessStatus === FRESHNESS_STATUS.FRESH || 
      j.freshnessStatus === FRESHNESS_STATUS.UNKNOWN_DATE
    );

    console.log('[Pre-freshness]', {
      source: outcome.source.name,
      roleMatched: afterRole.length,
      withDate: afterRole.filter(j => j.postedAt).length,
      withoutDate: afterRole.filter(j => !j.postedAt).length,
    });


    console.log('[Filter Debug]', JSON.stringify({
      source: outcome.source.name,
      beforeFilter: rawJobs.length,
      afterRoleFilter: afterRole.length,
      afterDateFilter: fresh.length,
      sampleDates: rawJobs.slice(0, 5).map(j => ({ 
        title: j.title, 
        postedAt: j.postedAt || j.sourcePostedAt,
        rawDate: j.postedAt ?? j.sourcePostedAt ?? j.rawDate
      }))
    }, null, 2));

    const normalizedJobs = afterRole;
    const pmMatched = normalizedJobs.length;
    const classification = classifySourceOutcome({
      ...outcome,
      rawCount: outcome.jobs.length,
      jobs: normalizedJobs,
    });

    sourceSummaries.push({
      source: outcome.source.name,
      status: classification.status,
      raw: outcome.jobs.length,
      fresh: fresh.length,
      pmMatched,
      saved: 0,
      attempts: outcome.attempts,
      requestCount: outcome.telemetry.requestCount,
      responseSize: outcome.telemetry.responseBytes,
      httpStatuses: outcome.telemetry.statuses,
      error: outcome.ok ? undefined : outcome.error,
      reason: classification.reason,
    });
    normalizedCandidates.push(...fresh);
  }

  const incomingSeen = new Set();
  const dedupedIncoming = [];
  for (const job of normalizedCandidates) {
    const fallbackKey = `${job.normalizedTitle}|${normalizeText(job.company)}|${job.url.toLowerCase()}`;
    const primaryKey = `${job.source}|${job.sourceJobId}`;
    if (incomingSeen.has(primaryKey) || incomingSeen.has(fallbackKey)) continue;
    incomingSeen.add(primaryKey);
    incomingSeen.add(fallbackKey);
    dedupedIncoming.push({ ...job, fallbackKey });
  }

  const ops = dedupedIncoming.map((job) => ({
    updateOne: {
      filter: { source: job.source, sourceJobId: job.sourceJobId },
      update: {
        $setOnInsert: {
          firstDiscoveredAt: now,
          discoveredAt: now,
        },
        $set: {
          sourceId: `${job.source}-${job.sourceJobId}`,
          source: job.source,
          sourceLabel: job.sourceLabel,
          sourceJobId: job.sourceJobId,
          title: job.title,
          normalizedTitle: job.normalizedTitle,
          company: job.company,
          location: job.location,
          url: job.url,
          description: job.description,
          postedAt: job.postedAt,
          sourcePostedAt: job.postedAt,
          freshnessStatus: job.freshnessStatus,
          dateConfidence: job.dateConfidence,
          roleType: job.roleType,
          remote: job.remote,
          jobType: job.jobType,
          salary: job.salary,
          tags: job.tags,
          dedupHash: computeDedupHash(job.title, job.company),
          dedupFallbackKey: job.fallbackKey,
          isActive: true,
          lastSeenAt: now,
          expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days TTL
        },
      },
      upsert: true,
    },
  }));

  let upsertedCount = 0;
  let modifiedCount = 0;
  if (ops.length > 0) {
    console.log(`[JobPipeline] Attempting bulkWrite with ${ops.length} operations...`);
    const result = await Job.bulkWrite(ops, { ordered: false });
    upsertedCount = result.upsertedCount ?? 0;
    modifiedCount = result.modifiedCount ?? 0;
    console.log(`[JobPipeline] bulkWrite success: upserted=${upsertedCount}, modified=${modifiedCount}`);
  } else {
    console.log('[JobPipeline] No operations to perform.');
  }

  // CLEANUP: We no longer deactivate everything globally. 
  // TTL index on 'expireAt' handles old jobs automatically.
  // We only deactivate jobs from the CURRENTLY ACTIVE SOURCES that weren't seen in this run.
  const activeSourceKeys = outcomes.filter(o => o.ok && o.jobs.length > 0).map(o => o.source.sourceKey);
  if (activeSourceKeys.length > 0) {
    await Job.updateMany(
      { 
        source: { $in: activeSourceKeys }, 
        lastSeenAt: { $lt: now },
        isActive: true 
      },
      { $set: { isActive: false } }
    );
  }

  const savedBySource = new Map();
  for (const job of dedupedIncoming) {
    savedBySource.set(job.sourceLabel, (savedBySource.get(job.sourceLabel) ?? 0) + 1);
  }
  for (const summary of sourceSummaries) {
    summary.saved = savedBySource.get(summary.source) ?? 0;
    console.log(`[JobPipeline][SourceSummary] ${JSON.stringify(summary)}`);
  }

  const elapsed = Date.now() - start;
  lastIngestionAt = now;
  lastIngestionStats = {
    totalSources: ALL_SOURCES.length,
    totalRaw: outcomes.reduce((n, o) => n + o.jobs.length, 0),
    freshCandidates: normalizedCandidates.length,
    saved: dedupedIncoming.length,
    newJobs: upsertedCount,
    updatedJobs: modifiedCount,
    durationMs: elapsed,
    sourceSummaries,
  };

  console.log(`[JobPipeline] Done in ${elapsed}ms — raw=${lastIngestionStats.totalRaw}, fresh=${normalizedCandidates.length}, saved=${dedupedIncoming.length}\n`);
  return lastIngestionStats;
}
