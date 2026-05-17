// Quick live verification for LinkedIn India source
import * as linkedinIndia from './sources/linkedinIndia.js';
import { normalizeJob } from './normalizer.js';

const start = Date.now();
console.log('[LinkedIn India Test] Starting live fetch...\n');

let raw = [];
try {
  raw = await linkedinIndia.fetch();
} catch (err) {
  console.error('[LinkedIn India Test] fetch() threw:', err.message);
  process.exit(1);
}

const normalized = raw.map(normalizeJob).filter(Boolean);
const rejected   = raw.length - normalized.length;

const byCategory = {};
for (const j of normalized) {
  const cats = j.categories ?? ['(no category)'];
  for (const c of cats) byCategory[c] = (byCategory[c] ?? 0) + 1;
}

const durationS = ((Date.now() - start) / 1000).toFixed(1);
const uniqueIds = new Set(raw.map(j => j.sourceJobId));
const hasDups   = uniqueIds.size < raw.length;

console.log('═══ LinkedIn India Live Verification ═══');
console.log(`Raw fetched:    ${raw.length}`);
console.log(`Accepted <48h:  ${normalized.length}`);
console.log(`Rejected:       ${rejected}`);
console.log(`Duration:       ${durationS}s`);
console.log(`Duplicate IDs:  ${hasDups ? 'YES (investigate!)' : 'none'}`);

if (Object.keys(byCategory).length > 0) {
  console.log('\nJobs by category:');
  for (const [cat, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat}: ${count}`);
  }
}

if (normalized.length > 0) {
  console.log('\nSample jobs (first 3):');
  for (const j of normalized.slice(0, 3)) {
    console.log(`  title:      ${j.title}`);
    console.log(`  company:    ${j.company}`);
    console.log(`  location:   ${j.location}`);
    console.log(`  url:        ${j.url}`);
    console.log(`  postedAt:   ${j.postedAt?.toISOString()}`);
    console.log(`  categories: ${(j.categories ?? []).join(', ')}`);
    console.log('  ---');
  }
}

if (raw.length === 0) {
  console.log('\nWARNING: 0 raw jobs fetched — LinkedIn may have blocked or rate-limited.');
}

if (rejected > 0) {
  const reasons = {};
  for (const r of raw) {
    const n = normalizeJob(r);
    if (!n) {
      const age = r.sourcePostedAt ? Math.round((Date.now() - r.sourcePostedAt.getTime()) / 3_600_000) : null;
      const reason = !r.sourcePostedAt ? 'null timestamp' : age >= 48 ? `stale (${age}h old)` : 'other';
      reasons[reason] = (reasons[reason] ?? 0) + 1;
    }
  }
  console.log('\nRejection breakdown:');
  for (const [reason, count] of Object.entries(reasons)) {
    console.log(`  ${reason}: ${count}`);
  }
}
