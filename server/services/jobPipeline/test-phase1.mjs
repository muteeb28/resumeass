/**
 * Phase 1 Diagnostic Script
 * Tests every active source individually without needing MongoDB.
 *
 * Run from the project root:
 *   node server/services/jobPipeline/test-phase1.mjs
 *
 * NOTE: JSearch and Adzuna will consume real API call budget if keys are set.
 * Set JSEARCH_MAX_CALLS_PER_DAY=2 to cap JSearch calls during this test.
 *
 * Required env vars (copy from your .env before running):
 *   JSEARCH_API_KEY=...
 *   ADZUNA_APP_ID=...
 *   ADZUNA_APP_KEY=...
 *   THEMUSE_API_KEY=... (optional)
 */

import { classifyRoleType } from './classifier.js';
import { cutoffFromHours } from './intentTemplates.js';

// Active sources only
import * as jsearch      from './sources/jsearch.js';
import * as adzuna       from './sources/adzuna.js';
import * as themuse      from './sources/themuse.js';
import * as remotive     from './sources/remotive.js';
import * as remoteOk     from './sources/remoteOk.js';
import * as himalayas    from './sources/himalayas.js';
import * as workingNomads from './sources/workingNomads.js';
import * as jobicy       from './sources/jobicy.js';
import * as weWorkRemotely from './sources/weWorkRemotely.js';
import * as jobspresso   from './sources/jobspresso.js';
import * as authenticjobs from './sources/authenticjobs.js';
import * as dynamitejobs from './sources/dynamitejobs.js';
import * as skipthedrive from './sources/skipthedrive.js';
import * as arcdev       from './sources/arcdev.js';
import * as greenhouse   from './sources/greenhouse.js';
import * as lever        from './sources/lever.js';

// Disabled sources (just checking their status)
import * as nodesk         from './sources/nodesk.js';
import * as jobgether      from './sources/jobgether.js';
import * as builtin        from './sources/builtin.js';
import * as dice           from './sources/dice.js';
import * as stillhiring    from './sources/stillhiring.js';
import * as vibehackers    from './sources/vibehackers.js';
import * as contra         from './sources/contra.js';
import * as remote100k     from './sources/remote100k.js';
import * as virtualvocations from './sources/virtualvocations.js';
import * as skillsire      from './sources/skillsire.js';
import * as remoteweek     from './sources/remoteweek.js';
import * as instahyre      from './sources/instahyre.js';
import * as remoteimpact   from './sources/remoteimpact.js';
import * as wellfound      from './sources/wellfound.js';
import * as remoteRocketship from './sources/remoteRocketship.js';
import * as echojobs       from './sources/echojobs.js';

const CUTOFF_48H = cutoffFromHours(48);

// ─── API key check ───────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════════════');
console.log(' PHASE 1 DIAGNOSTIC');
console.log('═══════════════════════════════════════════════════════');

console.log('\n─── API KEY STATUS ─────────────────────────────────────');
const keyStatus = {
  JSEARCH_API_KEY:  process.env.JSEARCH_API_KEY    ? '✓ PRESENT' : '✗ MISSING — JSearch will be skipped',
  ADZUNA_APP_ID:    process.env.ADZUNA_APP_ID      ? '✓ PRESENT' : '✗ MISSING — Adzuna will be skipped',
  ADZUNA_APP_KEY:   process.env.ADZUNA_APP_KEY     ? '✓ PRESENT' : '✗ MISSING — Adzuna will be skipped',
  THEMUSE_API_KEY:  process.env.THEMUSE_API_KEY    ? '✓ PRESENT (optional)' : '  not set (optional — runs unauthenticated)',
};
for (const [k, v] of Object.entries(keyStatus)) {
  console.log(`  ${k.padEnd(20)} ${v}`);
}

// ─── Disabled source table ────────────────────────────────────────────────

const disabledSources = [
  nodesk, jobgether, builtin, dice, stillhiring, vibehackers,
  contra, remote100k, virtualvocations, skillsire, remoteweek,
  instahyre, remoteimpact, wellfound, remoteRocketship, echojobs,
];

console.log('\n─── DISABLED SOURCES ────────────────────────────────────');
for (const s of disabledSources) {
  const flag = s.disabled ? '✗ DISABLED' : '? (missing disabled flag)';
  console.log(`  ${flag.padEnd(12)} ${s.name.padEnd(20)} ${s.disabledReason ?? s.name}`);
}

// ─── Active source test ───────────────────────────────────────────────────

const activeSources = [
  jsearch, adzuna, themuse,
  remotive, remoteOk, himalayas, workingNomads, jobicy,
  weWorkRemotely, jobspresso, authenticjobs, dynamitejobs, skipthedrive,
  arcdev, greenhouse, lever,
];

console.log('\n─── ACTIVE SOURCE RESULTS ───────────────────────────────');

const summaryRows = [];

for (const source of activeSources) {
  const name = source.name;
  const start = Date.now();

  try {
    const raw = await source.fetch();
    const elapsed = Date.now() - start;

    const withValidDate = raw.filter(j => {
      if (!j.sourcePostedAt) return false;
      const ms = new Date(j.sourcePostedAt).getTime();
      return !isNaN(ms) && ms > 0 && ms > new Date('2020-01-01').getTime();
    });

    const fresh = withValidDate.filter(j => new Date(j.sourcePostedAt).getTime() >= CUTOFF_48H);

    const pmFresh  = fresh.filter(j => classifyRoleType(j.title, j.description ?? '') === 'PM');
    const apmFresh = fresh.filter(j => classifyRoleType(j.title, j.description ?? '') === 'APM');

    summaryRows.push({
      name,
      raw: raw.length,
      withDate: withValidDate.length,
      fresh: fresh.length,
      pm: pmFresh.length,
      apm: apmFresh.length,
      ms: elapsed,
      ok: true,
    });

    console.log(`\n[${name}]`);
    console.log(`  raw=${raw.length} | withValidDate=${withValidDate.length} | fresh(48h)=${fresh.length} | PM=${pmFresh.length} | APM=${apmFresh.length} | ${elapsed}ms`);

    if (fresh.length > 0) {
      const sampleFresh = [...pmFresh, ...apmFresh].slice(0, 5);
      console.log(`  Sample titles (PM/APM fresh): ${sampleFresh.map(j => `"${j.title}"`).join(', ')}`);
      const sampleJob = sampleFresh[0] ?? fresh[0];
      if (sampleJob) {
        const { description: _d, ...display } = sampleJob;
        console.log(`  Sample normalized job:\n${JSON.stringify(display, null, 4).split('\n').map(l => '    ' + l).join('\n')}`);
      }
    } else if (raw.length > 0) {
      const sample = raw[0];
      console.log(`  No fresh 48h PM/APM jobs. Sample raw: "${sample.title}" | sourcePostedAt=${sample.sourcePostedAt ?? 'null'}`);
    } else {
      console.log(`  No jobs returned.`);
    }
  } catch (err) {
    const elapsed = Date.now() - start;
    summaryRows.push({ name, raw: 0, withDate: 0, fresh: 0, pm: 0, apm: 0, ms: elapsed, ok: false, error: err.message });
    console.log(`\n[${name}] ERROR (${elapsed}ms): ${err.message}`);
  }
}

// ─── Summary table ────────────────────────────────────────────────────────

console.log('\n═══════════════════════════════════════════════════════');
console.log(' SUMMARY TABLE');
console.log('═══════════════════════════════════════════════════════');
console.log('Source               | raw  | dated | fresh | PM  | APM | ms');
console.log('---------------------|------|-------|-------|-----|-----|------');
for (const r of summaryRows) {
  if (!r.ok) {
    console.log(`${r.name.padEnd(20)} | ERR  | ERR   | ERR   | ERR | ERR | ${r.ms}`);
    console.log(`  ERROR: ${r.error}`);
  } else {
    const row = [
      r.name.padEnd(20),
      String(r.raw).padStart(4),
      String(r.withDate).padStart(5),
      String(r.fresh).padStart(5),
      String(r.pm).padStart(3),
      String(r.apm).padStart(3),
      String(r.ms).padStart(6),
    ].join(' | ');
    console.log(row);
  }
}

const totalFresh = summaryRows.filter(r => r.ok).reduce((n, r) => n + r.fresh, 0);
const totalPM    = summaryRows.filter(r => r.ok).reduce((n, r) => n + r.pm, 0);
const totalAPM   = summaryRows.filter(r => r.ok).reduce((n, r) => n + r.apm, 0);
console.log(`\nTotal fresh(48h): ${totalFresh} | PM: ${totalPM} | APM: ${totalAPM}`);
console.log(`Disabled sources: ${disabledSources.length} | Active sources tested: ${activeSources.length}`);
