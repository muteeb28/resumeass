/**
 * Talentd scraper test script.
 *
 * Usage:
 *   node server/services/jobPipeline/test-talentd.mjs
 *   node server/services/jobPipeline/test-talentd.mjs Fresher
 *   TALENTD_MAX_PAGES_PER_CATEGORY=5 node server/services/jobPipeline/test-talentd.mjs
 *
 * Pass a category name as first arg to test only that category.
 * Use env vars to control pagination for this test run:
 *   TALENTD_MAX_PAGES_PER_CATEGORY=5  (default: 5 in test mode)
 *   TALENTD_CATEGORY_CONCURRENCY=3
 *   TALENTD_PAGE_CONCURRENCY=5
 */

// Use a lower default in test mode so tests finish quickly
if (!process.env.TALENTD_MAX_PAGES_PER_CATEGORY) {
  process.env.TALENTD_MAX_PAGES_PER_CATEGORY = '5';
}

import {
  TALENTD_CATEGORIES,
  categorySlug,
  buildPageUrl,
  parseListingJobs,
  parseRelativeTimestamp,
  parseTotalPages,
  sourceKey,
} from './sources/talentd.js';

// ─── ANSI ─────────────────────────────────────────────────────────────────────
const GREEN  = s => `\x1b[32m${s}\x1b[0m`;
const RED    = s => `\x1b[31m${s}\x1b[0m`;
const YELLOW = s => `\x1b[33m${s}\x1b[0m`;
const BOLD   = s => `\x1b[1m${s}\x1b[0m`;

// ─── Unit tests (no network) ──────────────────────────────────────────────────
function runUnitTests() {
  console.log(BOLD('\n=== UNIT TESTS ===\n'));
  let pass = 0, fail = 0;

  function assert(name, condition, detail = '') {
    if (condition) { console.log(`  ${GREEN('PASS')} ${name}`); pass++; }
    else { console.log(`  ${RED('FAIL')} ${name}${detail ? ` — ${detail}` : ''}`); fail++; }
  }

  // ── Source mode filtering logic ─────────────────────────────────────────────
  const fakeSources = [
    { sourceKey: 'talentd',     name: 'Talentd' },
    { sourceKey: 'remotive',    name: 'Remotive' },
    { sourceKey: 'arcdev',      name: 'Arc.dev' },
    { sourceKey: 'greenhouse',  name: 'Greenhouse' },
    { sourceKey: 'dynamitejobs',name: 'Dynamite Jobs' },
    { sourceKey: 'themuse',     name: 'The Muse' },
  ];
  const talentdOnly = fakeSources.filter(s => s.sourceKey === 'talentd');
  assert('JOB_SOURCE_MODE=talentd_only yields 1 source',     talentdOnly.length === 1);
  assert('JOB_SOURCE_MODE=talentd_only keeps talentd',        talentdOnly[0]?.sourceKey === 'talentd');
  assert('JOB_SOURCE_MODE=talentd_only excludes Arc.dev',     !talentdOnly.find(s => s.sourceKey === 'arcdev'));
  assert('JOB_SOURCE_MODE=talentd_only excludes Greenhouse',  !talentdOnly.find(s => s.sourceKey === 'greenhouse'));
  assert('JOB_SOURCE_MODE=talentd_only excludes Dynamite',    !talentdOnly.find(s => s.sourceKey === 'dynamitejobs'));
  assert('JOB_SOURCE_MODE=talentd_only excludes TheMuse',     !talentdOnly.find(s => s.sourceKey === 'themuse'));

  // ── Legacy cleanup guard ────────────────────────────────────────────────────
  const cleanupEnabled = process.env.JOB_LEGACY_CLEANUP_ENABLED === 'true';
  assert('JOB_LEGACY_CLEANUP_ENABLED is not "true" in this test env', !cleanupEnabled);

  // ── Category list ───────────────────────────────────────────────────────────
  assert('TALENTD_CATEGORIES has exactly 10 entries', TALENTD_CATEGORIES.length === 10);

  const expectedNames = [
    'Fresher', 'Internship', 'Remote', 'IT/Software', 'Core Engineering',
    'Batch 2026', 'Batch 2025', 'Full Time', 'Design', 'Sales & Marketing',
  ];
  expectedNames.forEach(n => {
    assert(`Category "${n}" present`, TALENTD_CATEGORIES.some(c => c.name === n));
  });

  const bannedNames = ['APM', 'PM', 'Intern'];
  bannedNames.forEach(n => {
    assert(`Category "${n}" is NOT present`, !TALENTD_CATEGORIES.some(c => c.name === n));
  });

  // ── categorySlug ───────────────────────────────────────────────────────────
  const slugCases = [
    ['Fresher',           'fresher'],
    ['Internship',        'internship'],
    ['Remote',            'remote'],
    ['IT/Software',       'it-software'],
    ['Core Engineering',  'core-engineering'],
    ['Batch 2026',        'batch-2026'],
    ['Batch 2025',        'batch-2025'],
    ['Full Time',         'full-time'],
    ['Design',            'design'],
    ['Sales & Marketing', 'sales-marketing'],
  ];
  slugCases.forEach(([input, expected]) => {
    const got = categorySlug(input);
    assert(`categorySlug("${input}") = "${expected}"`, got === expected, `got "${got}"`);
  });

  // ── buildPageUrl ───────────────────────────────────────────────────────────
  const urlCases = [
    { cat: { name: 'Fresher',    baseUrl: 'https://www.talentd.in/jobs/freshers' },
      page: 1, expected: 'https://www.talentd.in/jobs/freshers' },
    { cat: { name: 'Fresher',    baseUrl: 'https://www.talentd.in/jobs/freshers' },
      page: 2, expected: 'https://www.talentd.in/jobs/freshers?page=2' },
    { cat: { name: 'Remote',     baseUrl: 'https://www.talentd.in/jobs', params: { employment_type: 'remote' } },
      page: 1, expected: 'https://www.talentd.in/jobs?employment_type=remote' },
    { cat: { name: 'Remote',     baseUrl: 'https://www.talentd.in/jobs', params: { employment_type: 'remote' } },
      page: 3, expected: 'https://www.talentd.in/jobs?employment_type=remote&page=3' },
    { cat: { name: 'Batch 2026', baseUrl: 'https://www.talentd.in/jobs', params: { batch: '2026' } },
      page: 1, expected: 'https://www.talentd.in/jobs?batch=2026' },
    { cat: { name: 'Full Time',  baseUrl: 'https://www.talentd.in/jobs', params: { employment_type: 'full-time' } },
      page: 2, expected: 'https://www.talentd.in/jobs?employment_type=full-time&page=2' },
    { cat: { name: 'IT/Software',      baseUrl: 'https://www.talentd.in/jobs/it-software-jobs' },
      page: 1, expected: 'https://www.talentd.in/jobs/it-software-jobs' },
    { cat: { name: 'Core Engineering', baseUrl: 'https://www.talentd.in/jobs/core-engineering-jobs' },
      page: 5, expected: 'https://www.talentd.in/jobs/core-engineering-jobs?page=5' },
    { cat: { name: 'Sales & Marketing', baseUrl: 'https://www.talentd.in/jobs/sales-marketing-jobs' },
      page: 1, expected: 'https://www.talentd.in/jobs/sales-marketing-jobs' },
  ];
  urlCases.forEach(({ cat, page, expected }) => {
    const got = buildPageUrl(cat, page);
    assert(`buildPageUrl("${cat.name}", ${page})`, got === expected,
      `\n      got:      ${got}\n      expected: ${expected}`);
  });

  // ── sourceKey ──────────────────────────────────────────────────────────────
  assert('sourceKey === "talentd"', sourceKey === 'talentd');

  // ── Max pages env var ──────────────────────────────────────────────────────
  const maxPages = parseInt(process.env.TALENTD_MAX_PAGES_PER_CATEGORY ?? '50');
  assert('TALENTD_MAX_PAGES_PER_CATEGORY is a positive integer', maxPages > 0,
    `got ${maxPages}`);

  // ── UI branding checks (string constants) ──────────────────────────────────
  // These verify the copy values the UI is supposed to show
  const BADGE_TEXT_TEMPLATE  = '{count} Jobs';    // no "Talentd" word
  const SUBTITLE_TEXT        = 'Latest listings updated regularly.';
  assert('Badge template contains no "Talentd"',
    !BADGE_TEXT_TEMPLATE.toLowerCase().includes('talentd'));
  assert('Subtitle contains no "Talentd"',
    !SUBTITLE_TEXT.toLowerCase().includes('talentd'));

  console.log(`\n  ${BOLD(`Unit: ${pass} passed, ${fail} failed`)}\n`);
  return fail === 0;
}

// ─── Normalization validator ───────────────────────────────────────────────────
function validateJob(job, categoryName) {
  const errors = [];
  if (!job.title || job.title.trim() === '')          errors.push('missing title');
  if (!job.url  || !job.url.startsWith('http'))       errors.push(`invalid url: ${job.url}`);
  if (job.source      !== 'talentd')                  errors.push(`source="${job.source}" expected "talentd"`);
  if (job.sourceLabel !== 'Talentd')                  errors.push(`sourceLabel="${job.sourceLabel}" expected "Talentd"`);
  if (job.category    !== categoryName)               errors.push(`category="${job.category}" expected "${categoryName}"`);
  if (!job.sourceId?.startsWith('talentd-'))          errors.push(`invalid sourceId: ${job.sourceId}`);
  if (!job.rawPostedText)
    errors.push('rawPostedText is missing — timestamp extraction may be broken');
  if (job.sourcePostedAt === null || !(job.sourcePostedAt instanceof Date))
    errors.push(`sourcePostedAt should be a Date, got ${job.sourcePostedAt}`);
  return errors;
}

// ─── Live fetch one page ──────────────────────────────────────────────────────
async function fetchOnePage(cat, page) {
  try {
    const url = buildPageUrl(cat, page);
    const res = await globalThis.fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html,application/xhtml+xml' },
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return { status: res.status, html: null };
    return { status: res.status, html: await res.text() };
  } catch (err) {
    return { status: 'ERR', html: null, error: err.message };
  }
}

// ─── Test one category live ───────────────────────────────────────────────────
async function testCategory(cat, maxPagesToTest) {
  const catSlug         = categorySlug(cat.name);
  const scrapeStartedAt = new Date();
  const seen            = new Set();
  const jobs            = [];
  let totalPages       = null;
  let pagesChecked     = 0;
  let validationErrors = [];

  function buildJob(raw) {
    return {
      sourceId:       `talentd-${catSlug}-${raw.slug}`,
      title:          raw.title,
      company:        raw.company,
      url:            raw.jobUrl,
      remote:         cat.name === 'Remote',
      category:       cat.name,
      source:         'talentd',
      sourceLabel:    'Talentd',
      rawPostedText:  raw.rawPostedText ?? null,
      sourcePostedAt: raw.rawPostedText
        ? parseRelativeTimestamp(raw.rawPostedText, scrapeStartedAt)
        : null,
    };
  }

  function collect(pageJobs) {
    for (const raw of pageJobs) {
      if (seen.has(raw.slug)) continue;
      seen.add(raw.slug);
      jobs.push(buildJob(raw));
    }
  }

  // Always fetch page 1
  const { status, html } = await fetchOnePage(cat, 1);
  const httpStatus = String(status);

  if (!html) {
    return { cat, httpStatus, totalPages, pagesChecked, rawJobs: 0, jobs, validationErrors: ['page 1 failed'] };
  }

  totalPages   = parseTotalPages(html);
  pagesChecked = 1;
  collect(parseListingJobs(html));

  // Fetch additional pages up to maxPagesToTest
  const limit = totalPages ? Math.min(maxPagesToTest, totalPages) : maxPagesToTest;
  for (let page = 2; page <= limit; page++) {
    const { html: ph } = await fetchOnePage(cat, page);
    if (!ph) break;
    const pageJobs = parseListingJobs(ph);
    if (pageJobs.length === 0) break;
    pagesChecked = page;
    collect(pageJobs);
  }

  // Validate first job
  if (jobs.length > 0) validationErrors = validateJob(jobs[0], cat.name);

  return { cat, httpStatus, totalPages, pagesChecked, rawJobs: jobs.length, jobs, validationErrors };
}

// ─── Filter/logic tests ───────────────────────────────────────────────────────
function runFilterTests(results) {
  console.log(BOLD('\n=== FILTER & NORMALIZATION TESTS ===\n'));
  let pass = 0, fail = 0;

  function assert(name, condition, detail = '') {
    if (condition) { console.log(`  ${GREEN('PASS')} ${name}`); pass++; }
    else { console.log(`  ${RED('FAIL')} ${name}${detail ? ` — ${detail}` : ''}`); fail++; }
  }

  const tested = results.map(r => r.cat.name);
  ['Fresher','Internship','Remote','IT/Software','Core Engineering',
   'Batch 2026','Batch 2025','Full Time','Design','Sales & Marketing']
    .forEach(n => assert(`Category "${n}" tested`, tested.includes(n)));

  ['APM','PM','Intern'].forEach(n =>
    assert(`Category "${n}" NOT present`, !tested.includes(n)));

  results.forEach(r => {
    if (!r.jobs.length) return;
    const j = r.jobs[0];
    assert(`"${r.cat.name}" sample — source = "talentd"`,      j.source === 'talentd');
    assert(`"${r.cat.name}" sample — sourceLabel = "Talentd"`, j.sourceLabel === 'Talentd');
    assert(`"${r.cat.name}" sample — category correct`,        j.category === r.cat.name);
    assert(`"${r.cat.name}" sample — rawPostedText non-empty`, typeof j.rawPostedText === 'string' && j.rawPostedText.length > 0);
    assert(`"${r.cat.name}" sample — sourcePostedAt is Date`,  j.sourcePostedAt instanceof Date);
    assert(`"${r.cat.name}" sample — sourcePostedAt < 48h`,    j.sourcePostedAt instanceof Date && (Date.now() - j.sourcePostedAt.getTime()) < 48 * 60 * 60 * 1000);
    assert(`"${r.cat.name}" sample — url starts with http`,    j.url?.startsWith('http'));
    assert(`"${r.cat.name}" sample — title non-empty`,         j.title?.trim().length > 0);
    assert(`"${r.cat.name}" sample — no validation errors`,    r.validationErrors.length === 0,
      r.validationErrors.join(', '));
  });

  // Pagination depth test: categories with >3 pages should be scraped past page 3
  const deepCats = results.filter(r => r.totalPages && r.totalPages > 5);
  deepCats.forEach(r => {
    const maxPages = parseInt(process.env.TALENTD_MAX_PAGES_PER_CATEGORY ?? '5');
    assert(
      `"${r.cat.name}" pages checked (${r.pagesChecked}) > 3`,
      r.pagesChecked > 3,
      `totalPages=${r.totalPages}, maxPages=${maxPages}`
    );
  });

  console.log(`\n  ${BOLD(`Filter tests: ${pass} passed, ${fail} failed`)}\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const filterArg    = process.argv[2];
  const maxPagesTest = parseInt(process.env.TALENTD_MAX_PAGES_PER_CATEGORY ?? '5');
  const catsToTest   = filterArg
    ? TALENTD_CATEGORIES.filter(c => c.name.toLowerCase() === filterArg.toLowerCase())
    : TALENTD_CATEGORIES;

  if (filterArg && catsToTest.length === 0) {
    console.error(RED(`\nUnknown category: "${filterArg}"`));
    console.error(`Available: ${TALENTD_CATEGORIES.map(c => c.name).join(', ')}\n`);
    process.exit(1);
  }

  const unitOk = runUnitTests();

  console.log(BOLD(`=== LIVE SCRAPE TESTS (${catsToTest.length} categories, max ${maxPagesTest} pages each) ===\n`));

  const results = [];
  for (const cat of catsToTest) {
    process.stdout.write(`  Fetching "${cat.name}" ... `);
    const start = Date.now();
    const r = await testCategory(cat, maxPagesTest);
    console.log(`${Date.now() - start}ms — ${r.pagesChecked} pages, ${r.rawJobs} unique jobs`);
    results.push(r);
  }

  if (!filterArg) runFilterTests(results);

  // ── Category scrape table ──────────────────────────────────────────────────
  console.log(BOLD('\n=== CATEGORY SCRAPE TABLE ===\n'));
  console.log(
    'Category'.padEnd(22) + 'HTTP'.padEnd(6) + 'Talentd total'.padEnd(16) +
    'Pages avail'.padEnd(14) + 'Pages scraped'.padEnd(16) + 'Unique jobs'.padEnd(14) + 'Valid?'
  );
  console.log('-'.repeat(100));

  let allOk = true;
  for (const r of results) {
    const valid = r.validationErrors.length === 0 && r.rawJobs > 0;
    if (!valid) allOk = false;
    const totalJobs = r.totalPages ? `~${r.totalPages * 10}` : '?';
    const row = [
      r.cat.name.padEnd(22),
      r.httpStatus.padEnd(6),
      totalJobs.padEnd(16),
      String(r.totalPages ?? '?').padEnd(14),
      String(r.pagesChecked).padEnd(16),
      String(r.rawJobs).padEnd(14),
      valid ? GREEN('OK') : RED(`FAIL: ${r.validationErrors[0] ?? '0 jobs'}`),
    ].join('');
    console.log(row);
  }

  // ── Sample job objects ─────────────────────────────────────────────────────
  console.log(BOLD('\n=== SAMPLE JOB OBJECTS (1 per category) ===\n'));
  for (const r of results) {
    if (!r.jobs.length) {
      console.log(`${YELLOW(r.cat.name)}: no jobs — HTTP ${r.httpStatus}`);
      continue;
    }
    const j = r.jobs[0];
    console.log(`${GREEN(r.cat.name)}: ${j.title} @ ${j.company}`);
    console.log(`  sourceId:       ${j.sourceId}`);
    console.log(`  url:            ${j.url.slice(0, 80)}...`);
    console.log(`  rawPostedText:  ${j.rawPostedText ?? '(none)'}`);
    console.log(`  sourcePostedAt: ${j.sourcePostedAt?.toISOString() ?? '(none)'}`);
    console.log(`  category: ${j.category} | source: ${j.source} | sourceLabel: ${j.sourceLabel}`);
    if (r.jobs.length > 1) {
      console.log(`  more:     ${r.jobs.slice(1, 4).map(j => `"${j.title}"`).join(', ')}`);
    }
    console.log('');
  }

  // ── Source mode summary ───────────────────────────────────────────────────
  console.log(BOLD('=== SOURCE MODE VERIFICATION ===\n'));
  const jSourceMode = process.env.JOB_SOURCE_MODE ?? '(not set)';
  const cleanupMode = process.env.JOB_LEGACY_CLEANUP_ENABLED ?? '(not set)';
  console.log(`  JOB_SOURCE_MODE              = ${jSourceMode}`);
  console.log(`  JOB_LEGACY_CLEANUP_ENABLED   = ${cleanupMode}`);
  console.log(`  TALENTD_MAX_PAGES_PER_CATEGORY = ${process.env.TALENTD_MAX_PAGES_PER_CATEGORY ?? '50 (default)'}`);
  console.log(`  TALENTD_CATEGORY_CONCURRENCY   = ${process.env.TALENTD_CATEGORY_CONCURRENCY ?? '3 (default)'}`);
  console.log(`  TALENTD_PAGE_CONCURRENCY       = ${process.env.TALENTD_PAGE_CONCURRENCY ?? '5 (default)'}`);
  console.log('');

  const modeOk   = jSourceMode === 'talentd_only';
  const cleanOk  = cleanupMode !== 'true';
  if (modeOk)  console.log(GREEN('  JOB_SOURCE_MODE=talentd_only confirmed'));
  else         console.log(YELLOW('  JOB_SOURCE_MODE is not talentd_only — other sources would also run'));
  if (cleanOk) console.log(GREEN('  Legacy cleanup disabled'));
  else         console.log(RED(  '  Legacy cleanup is ENABLED — deleteMany would run on ingestion'));

  const allPassed = unitOk && allOk;
  console.log(allPassed
    ? GREEN(BOLD('\nAll tests passed.'))
    : RED(BOLD('\nSome tests failed — see table above.')));

  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error(RED('\nFatal:'), err);
  process.exit(1);
});
