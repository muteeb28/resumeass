import Job from '../../models/Job.model.js';
import { normalizeJob, INDIA_SOURCES } from './normalizer.js';

// ─── All source modules (imported at module level; only executed when .fetch() is called) ──
import * as remotive       from './sources/remotive.js';
import * as remoteOk       from './sources/remoteOk.js';
import * as himalayas      from './sources/himalayas.js';
import * as workingNomads  from './sources/workingNomads.js';
import * as jobicy         from './sources/jobicy.js';
import * as weWorkRemotely from './sources/weWorkRemotely.js';
import * as jobspresso     from './sources/jobspresso.js';
import * as authenticjobs  from './sources/authenticjobs.js';
import * as dynamitejobs   from './sources/dynamitejobs.js';
import * as themuse        from './sources/themuse.js';
import * as greenhouse     from './sources/greenhouse.js';
import * as lever          from './sources/lever.js';
import * as arcdev         from './sources/arcdev.js';
import * as talentd        from './sources/talentd.js';
import * as remoteOkIndia  from './sources/remoteOkIndia.js';
import * as linkedinIndia  from './sources/linkedinIndia.js';

const ALL_SOURCES = [
  remotive, remoteOk, himalayas, workingNomads, jobicy,
  weWorkRemotely, jobspresso, authenticjobs, dynamitejobs,
  themuse, greenhouse, lever, arcdev,
  talentd, remoteOkIndia, linkedinIndia,
];

// INDIA_SOURCE_KEYS is imported from normalizer.js (INDIA_SOURCES) — single source of truth

// ─── NOTE: JOB_SOURCE_MODE is intentionally NOT read at module level.
// Module-level code runs before dotenv configures process.env.
// Reading it inside runIngestion() ensures the value is correct at call time.

const TTL_MS            = 48 * 60 * 60 * 1000;
// 600s: full Talentd crawl (12k+ jobs, 10 categories, all pages) takes ~200-220s
const SOURCE_TIMEOUT_MS = 600 * 1000;

let lastIngestionAt    = null;
let lastIngestionStats = null;
let _cleanedLegacy     = false;

function withTimeout(promise, label, ms, abortController) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      abortController?.abort(new Error(`${label} timed out after ${ms}ms`));
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

export function getIngestionMeta() {
  return { lastIngestionAt, stats: lastIngestionStats };
}

export async function runIngestion() {
  const start = Date.now();
  const now   = new Date();

  // ── Source mode: read at CALL TIME so dotenv has already run ─────────────────
  // Default is talentd_only. Set JOB_SOURCE_MODE=all to enable all sources.
  const rawMode = (process.env.JOB_SOURCE_MODE || 'talentd_only').toLowerCase().trim();
  let activeSources;
  if (rawMode === 'talentd_only') {
    activeSources = ALL_SOURCES.filter(s => s.sourceKey === 'talentd');
  } else if (rawMode === 'india') {
    activeSources = ALL_SOURCES.filter(s => INDIA_SOURCES.has(s.sourceKey));
  } else if (rawMode === 'all') {
    activeSources = ALL_SOURCES;
  } else {
    console.warn(`[Ingestion] Unknown JOB_SOURCE_MODE="${rawMode}", defaulting to talentd_only`);
    activeSources = ALL_SOURCES.filter(s => s.sourceKey === 'talentd');
  }

  console.log(`\n[Ingestion] ═══ Started ${now.toISOString()} — ${activeSources.length} source(s) [mode: ${rawMode}] ═══`);
  console.log(`[Ingestion] Active sources: ${activeSources.map(s => s.name).join(', ')}`);

  // ── Legacy cleanup (opt-in only) ─────────────────────────────────────────────
  if (process.env.JOB_LEGACY_CLEANUP_ENABLED === 'true' && !_cleanedLegacy) {
    _cleanedLegacy = true;
    try {
      const { deletedCount } = await Job.deleteMany({ source: 'jsearch' });
      if (deletedCount > 0) console.log(`[Ingestion] Cleaned up ${deletedCount} legacy JSearch jobs`);
    } catch (e) {
      console.warn('[Ingestion] Legacy cleanup failed (non-fatal):', e.message);
    }
  }

  // ── Fetch all active sources in parallel ────────────────────────────────────
  // Talentd gets its own AbortController so the ingestion timeout can cancel
  // in-flight network requests inside the scraper, not just reject the promise.
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

  const rawJobs = [];
  for (let i = 0; i < activeSources.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      const count = Array.isArray(r.value) ? r.value.length : 0;
      console.log(`[Ingestion] ${activeSources[i].name} → ${count} raw`);
      if (count > 0) rawJobs.push(...r.value);
    } else {
      console.error(`[Ingestion] ${activeSources[i].name} failed: ${r.reason?.message}`);
    }
  }

  console.log(`[Ingestion] Total raw: ${rawJobs.length}`);

  // ── Abort if Talentd failed in talentd_only mode ─────────────────────────────
  // A timeout or error must not overwrite previous good stats with total:0,
  // and must not trigger mark-inactive on an incomplete scrape.
  const talentdIdx    = activeSources.findIndex(s => s.sourceKey === 'talentd');
  const talentdFailed = talentdIdx >= 0 && results[talentdIdx].status === 'rejected';

  if ((rawMode === 'talentd_only' || rawMode === 'india') && talentdFailed) {
    const reason = results[talentdIdx].reason?.message ?? 'unknown';
    console.error(
      `[Ingestion] Talentd failed (${reason}) — preserving previous stats, skipping mark-inactive`,
    );
    return { error: true, reason };
  }

  // ── Normalize + cross-source dedup ──────────────────────────────────────────
  const normalized = rawJobs.map(normalizeJob).filter(Boolean);

  const seenKeys = new Set();
  const deduped  = normalized.filter((job) => {
    const key = `${job.source}::${job.sourceJobId}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  const talentdCount = deduped.filter(j => j.source === 'talentd').length;
  console.log(
    `[Ingestion] After normalize+dedup: ${deduped.length}` +
    (talentdCount > 0 ? ` (Talentd: ${talentdCount})` : '')
  );

  if (deduped.length === 0) {
    lastIngestionAt    = now;
    lastIngestionStats = { newJobs: 0, updatedJobs: 0, markedInactive: 0, total: 0, sources: activeSources.length, durationMs: Date.now() - start };
    return lastIngestionStats;
  }

  // ── Upsert to MongoDB ────────────────────────────────────────────────────────
  const expireAt = new Date(now.getTime() + TTL_MS);

  const ops = deduped.map((job) => ({
    updateOne: {
      filter: { source: job.source, sourceJobId: job.sourceJobId },
      update: {
        $setOnInsert: { firstDiscoveredAt: now },
        $set: {
          ...job,
          discoveredAt: now,
          lastSeenAt:   now,
          isActive:     true,
          expireAt,
        },
      },
      upsert: true,
    },
  }));

  let newJobs      = 0;
  let updatedJobs  = 0;
  let dupSkipped   = 0;
  let writeErrors  = 0;

  try {
    const result = await Job.bulkWrite(ops, { ordered: false });
    newJobs     = result.upsertedCount  ?? 0;
    updatedJobs = result.modifiedCount  ?? 0;
    // ordered:false collects write errors without aborting
    if (result.hasWriteErrors?.()) {
      const errs = result.getWriteErrors?.() ?? [];
      writeErrors = errs.length;
      dupSkipped  = errs.filter(e => e.code === 11000).length;
      if (dupSkipped > 0) {
        console.warn(`[Ingestion] bulkWrite: ${dupSkipped} duplicate-key conflicts skipped (legacy url_1 index? run migration if not done)`);
      }
      if (writeErrors - dupSkipped > 0) {
        console.error(`[Ingestion] bulkWrite: ${writeErrors - dupSkipped} other write errors`);
      }
    }
  } catch (err) {
    // BulkWriteError is thrown when ordered:true — shouldn't happen here, but handle defensively
    if (err.name === 'BulkWriteError' || err.code === 11000) {
      newJobs     = err.result?.nUpserted  ?? 0;
      updatedJobs = err.result?.nModified  ?? 0;
      dupSkipped  = (err.writeErrors ?? []).filter(e => e.code === 11000).length;
      writeErrors = (err.writeErrors ?? []).length;
      console.warn(`[Ingestion] bulkWrite completed with errors — inserted=${newJobs}, updated=${updatedJobs}, dupSkipped=${dupSkipped}, otherErrors=${writeErrors - dupSkipped}`);
    } else {
      console.error('[Ingestion] bulkWrite fatal error:', err.message);
      // Continue to report partial stats rather than crashing
    }
  }

  // ── Mark removed Talentd jobs inactive ──────────────────────────────────────
  // Jobs with lastSeenAt older than (run_start - 30s) were not scraped this run.
  // The 30s buffer prevents a race condition where a concurrent ingestion run's
  // inactive marking could incorrectly deactivate jobs just upserted by this run.
  let markedInactive = 0;
  // Mark Talentd jobs inactive in both talentd_only and india modes.
  // RemoteOK India jobs naturally age out via the 48h postedAt filter — no mark-inactive needed.
  if (rawMode === 'talentd_only' || rawMode === 'india') {
    try {
      const staleCutoff = new Date(now.getTime() - 30000); // 30s before this run started
      const stale = await Job.updateMany(
        { source: 'talentd', isActive: true, lastSeenAt: { $lt: staleCutoff } },
        { $set: { isActive: false } }
      );
      markedInactive = stale.modifiedCount ?? 0;
      if (markedInactive > 0) {
        console.log(`[Ingestion/Talentd] Marked ${markedInactive} removed jobs inactive`);
      }
    } catch (e) {
      console.warn('[Ingestion/Talentd] Inactive marking failed (non-fatal):', e.message);
    }
  }

  const durationMs = Date.now() - start;

  lastIngestionAt    = now;
  lastIngestionStats = {
    newJobs,
    updatedJobs,
    markedInactive,
    dupSkipped,
    writeErrors,
    total:    deduped.length,
    sources:  activeSources.length,
    durationMs,
  };

  console.log(
    `[Ingestion] Done in ${(durationMs / 1000).toFixed(1)}s — ` +
    `new=${newJobs}, updated=${updatedJobs}, markedInactive=${markedInactive}` +
    (dupSkipped > 0 ? `, dupSkipped=${dupSkipped}` : '') +
    `, total=${deduped.length}`
  );
  return lastIngestionStats;
}
