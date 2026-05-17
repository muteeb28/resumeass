// Tier 0: intent-driven aggregator APIs
import * as jsearch from './jsearch.js';
import * as activeJobsDb from './activeJobsDb.js';
import * as adzuna from './adzuna.js';
import * as themuse from './themuse.js';

// Tier 1: public JSON APIs (most reliable, all provide postedAt)
import * as remotive from './remotive.js';
import * as remoteOk from './remoteOk.js';
import * as himalayas from './himalayas.js';
import * as workingNomads from './workingNomads.js';
import * as jobicy from './jobicy.js';

// Tier 2: RSS feeds (reliable, pubDate always present)
import * as weWorkRemotely from './weWorkRemotely.js';
import * as jobspresso from './jobspresso.js';
import * as authenticjobs from './authenticjobs.js';
import * as dynamitejobs from './dynamitejobs.js';
import * as skipthedrive from './skipthedrive.js';

// Tier 3: HTML/JSON scrapers and ATS connectors
import * as arcdev from './arcdev.js';
import * as greenhouse from './greenhouse.js';
import * as lever from './lever.js';

// Disabled sources (see individual files for reasons):
//   nodesk          — no reliable postedAt; zero PM/APM yield
//   jobgether       — React SPA, no SSR data; zero fresh jobs
//   builtin         — React SPA, HTML scraper unstable; no postedAt
//   dice            — private API (x-api-key 403); covered by JSearch/Adzuna
//   stillhiring     — no reliable postedAt; near-zero PM/APM yield
//   vibehackers     — no reliable postedAt; near-zero PM/APM yield
//   contra          — freelance platform; wrong job category
//   remote100k      — salary-filtered niche; no postedAt; React SPA
//   virtualvocations — HTML scraper; no postedAt; stale data
//   skillsire       — obscure board; no postedAt; near-zero yield
//   remoteweek      — aggregator; no public API; HTML scraper unreliable
//   instahyre       — India-only; no postedAt; outside product scope
//   remoteimpact    — mission-driven niche; no postedAt; near-zero PM yield
//   wellfound       — anti-bot; no public API; React SPA
//   remoterocketship — Cloudflare WAF 403 on all endpoints
//   echojobs        — Cloudflare WAF 403 on all endpoints
//   powertofly      — requires per-job detail page requests for dates; not stable enough
//   justremote      — HTML scraper; no postedAt; no PM/APM filter

export const ALL_SOURCES = [
  // Tier 0: aggregators (cover LinkedIn, Dice, Indeed, Glassdoor ecosystem)
  jsearch,
  activeJobsDb,
  adzuna,
  themuse,
  // Tier 1: public APIs
  remotive,
  remoteOk,
  himalayas,
  workingNomads,
  jobicy,
  // Tier 2: RSS feeds
  weWorkRemotely,
  jobspresso,
  authenticjobs,
  dynamitejobs,
  skipthedrive,
  // Tier 3: HTML/ATS
  arcdev,
  greenhouse,
  lever,
];
