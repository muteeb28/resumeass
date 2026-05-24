# Current State — AI Handoff

_Last updated: 2026-05-24 (session 5, loop/request-spam diagnosis + jobs-empty root cause + ingestion trigger). Update this file at the end of each session._

---

## 1. Active Backend

| | |
|---|---|
| **Path** | `external/jobflix-backend-js` |
| **Branch** | `main` (HEAD: `1cf7e0c`) |
| **Port** | `9001` |
| **Start** | `cd external/jobflix-backend-js && npx nodemon server.js` |
| **DB** | MongoDB Atlas — same cluster as old backend |

Old backend at `server/server.js` (port 3007) is **rollback only**.
Do **not** run `npm run dev:server` unless an explicit rollback is needed.

---

## 2. Frontend

| | |
|---|---|
| **Start** | `npm run dev` (from repo root) |
| **URL** | `http://localhost:3002` (dev script uses `-p 3002`) |
| **Local env** | `.env.local` (gitignored, do not commit) |

`.env.local` **must** contain (see `.env.example` for a full template):
```
NEXT_PUBLIC_API_URL=http://localhost:9001/api
```
`app/api/jobs/route.ts` throws at module init if this is missing — you will see a clear error
in the terminal instead of silently serving zero jobs. There is no fallback.

`/api/jobs` requests go through `app/api/jobs/route.ts` (Next.js route handler)
which reads `NEXT_PUBLIC_API_URL`. All other `/api/*` calls go through the
fallback rewrite in `next.config.ts` which reads `NEXT_PUBLIC_BACKEND_URL`.

---

## 3. Job Board Architecture

- Active source mode: `source=india`
- Sources: **Talentd**, **RemoteOK India**, **LinkedIn India**
- Ingestion is background-only (scheduler + manual trigger). Never on page load.
- 48-hour freshness gate is enforced at the normalizer (`normalizer.js:92`). Do not weaken it.
- No "Recently" labels. No 2d+ stale jobs.
- `categories[]` (array) is persisted on every Job document and drives all filters.
- Category filters use MongoDB array containment: `filter.categories = category`.

Key routes (clean backend):
```
GET  /api/jobs?source=india[&category=X][&searchText=Y][&page=N][&limit=N]
GET  /api/jobs/meta
POST /api/jobs/ingest   — triggers background ingestion, returns immediately
```

### Pipeline execution order
1. `linkedinIndia.fetch()` → raw jobs from LinkedIn guest API (no categories yet)
2. `ingestion.js:runIngestion()` → `rawJobs.map(normalizeJob).filter(Boolean)` (line 140)
3. `normalizer.js:normalizeJob()`:
   - 48h gate at line 92 — hard cutoff, do not weaken
   - `mapToCategories()` called at line 103 for all non-Talentd India sources
   - Talentd supplies its own `categories[]` from the scraper (lines 98–100)
4. `Job.bulkWrite()` upserts with `categories[]` field (line 188)
5. `jobsRead.controller.js:getJobs()` filters with `filter.categories = category` (line 74)
6. `job-board.tsx` `TALENTD_CATEGORIES` drives the chip UI

---

## 4. Current Categories

`All`, `Fresher`, `Internship`, `Remote`, `IT/Software`, `Core Engineering`,
`DevOps`, `PM`, `APM`, `Batch 2026`, `Batch 2025`, `Full Time`, `Design`, `Sales & Marketing`

Rules:
- Batch 2025/2026 require **explicit** year + batch language in title/tags. Never inferred.
- Categories come from `categoryMapper.js` — evidence-based only. No faking.
- **DevOps** is additive with IT/Software (a DevOps Engineer gets both).
- **APM** = entry-level product manager roles. "APM" alone is not matched (too ambiguous). APM and PM are mutually exclusive — APM takes precedence.
  - Covered: associate/assistant/junior/graduate/rotational product manager, associate pm, apm intern/trainee/fellow, product management intern/trainee/fellow(ship)/associate, product manager I (level-1 Roman numeral).
  - Guard: "Senior/Lead/Staff Product Manager" → PM, not APM. "Product Manager II" → PM.
  - Known edge case: "Senior Product Manager I" (Sumo Logic's internal levelling) → classified APM due to trailing "I". Acceptable at current volume; add negative lookbehind if false-positive rate grows.
  - Deliberately excluded from search terms: `pm intern` (noisy), `product strategy intern` (out of scope).
- **PM** = Product Manager, Product Owner, Product Lead, Product Strategy Manager. Does NOT match Project Manager, Program Manager, or Product Marketing Manager.
- `DEVOPS_RE`, `APM_RE`, `PM_RE` are all in `categoryMapper.js`.

---

## 5. LinkedIn India SEARCH_GROUPS — current state

**11 groups, 54 terms total.**

| Group | Terms |
|---|---|
| IT/Software | software engineer, frontend developer, backend developer, full stack developer, data analyst, devops engineer |
| Design | ui ux designer, product designer, graphic designer, ux researcher |
| Sales & Marketing | digital marketing, marketing executive, sales executive, business development executive, seo specialist |
| Core Engineering | mechanical engineer, electrical engineer, embedded engineer, vlsi engineer |
| Remote | remote software engineer, remote frontend developer, remote data analyst, remote internship |
| Internship | software intern, frontend intern, data analyst intern, engineering intern |
| Fresher | fresher developer, entry level developer, graduate software engineer, associate software engineer |
| Full Time | full time software engineer, full time developer, full time data analyst |
| DevOps | devops engineer, site reliability engineer, cloud engineer, platform engineer, infrastructure engineer, kubernetes engineer |
| APM | associate product manager, assistant product manager, junior product manager, graduate product manager, rotational product manager, associate pm, product management intern, product management trainee, product management fellowship, product manager i, apm program |
| PM | product manager, technical product manager, growth product manager, product owner |

`LINKEDIN_INDIA_MAX_TERMS` env var caps terms per group (useful for tests).
Implementation: `services/jobPipeline/sources/linkedinIndia.js` (export: `SEARCH_GROUPS`).

### categoryMapper.js — current regex inventory
- `DEVOPS_RE`: devops, site reliability engineer, sre, cloud/platform/infrastructure/kubernetes engineer, CI/CD engineer, release/build engineer
- `APM_RE`: associate/assistant/junior/graduate/rotational product manager, associate pm, apm intern/trainee/fellow, product management intern/trainee/fellow(ship)/associate, product manager I
- `PM_RE`: product manager/owner/lead, product strategy manager/lead/director

### Live counts after last ingestion (2026-05-19)
| Category | Count |
|---|---|
| IT/Software | 362 |
| Internship | 190 |
| Sales & Marketing | 113 |
| PM | 81 |
| Fresher | 84 |
| Design | 64 |
| DevOps | 60 |
| APM | 9 |
| Core Engineering | 8 |

Test suite: **338 tests passing** across 6 files. Run with:
```
cd external/jobflix-backend-js && LINKEDIN_INDIA_DELAY_MS=0 npx vitest run
```

### Commit history (clean backend)
| Commit | Description |
|---|---|
| `1cf7e0c` | feat: expand APM regex — junior, graduate, rotational, associate pm, fellowship |
| `95cef0e` | feat: expand APM coverage — Product Manager I, more search terms |
| `4586829` | feat: add DevOps, APM, PM categories with TDD |
| `27041be` | fix: Fresher regex, env var validation, else-if clarity |
| `64f8536` | feat: expand LinkedIn India to 8 category-specific search groups |

---

## 6. Future Architecture Note (do not implement yet)

A **weighted scoring system** would improve APM precision without reducing recall:
- Layer 1 (retrieval): broad LinkedIn search terms, maximize recall
- Layer 2 (scorer): evidence-weighted score per job → threshold controls precision
- Key signals: `associate/junior/graduate` +0.5, `senior/lead/staff` -0.4, `entry/early career` +0.2
- Migration: dual-write regex + scorer for 2 weeks, compare false-positive rates, then flip

The 48h freshness gate and normalizer are never touched. The scorer only assigns labels.

---

## 7. Merge History — 2026-05-19

### Remote auth/backend refactor (merged into local main)

**Diverge point:** `0eab872`
**Merge commit:** `7b5cebc` (pushed to origin/main)

**What the remote's 11 commits introduced:**
| Commit | Change |
|---|---|
| `4ed18c0` | `refactor: backend` — deleted ALL of `server/` (Express backend removed) |
| `39258af` | `feat: authentication cookie based` — `AuthProvider.tsx`, `src/lib/axios.ts`, `useUserStore.ts` rewritten for cookie auth |
| `6185431` | `refactor: api url` — `next.config.ts` rewrites updated, `sidebar-demo.tsx` updated |
| `0b9a834`–`f0723cb` | axios polishing, optimize-resume route switched to axios |
| `c6ee031` | login/signup pages removed (`app/login/page.tsx`, `app/signup/page.tsx` deleted) |
| `776cecd`–`e730585` | logout redirect, premium HR emails |

**Architectural change to understand:** The old Express backend (`server/server.js` on port 3007) is **gone from the repo**. All non-job-board API routes now go through a different backend (not in this repo). The job board routes go through `app/api/jobs/route.ts` → `external/jobflix-backend-js` port 9001.

**Conflicts resolved:**
- `server/server.js` — accepted remote deletion (job board logic already in `external/jobflix-backend-js`)
- `server/services/resumeGenerator.js` — accepted remote deletion
- `server/services/resumeOptimizerService.js` — accepted remote deletion

**Pre-merge commit added:** `cbb8b86` — replaced old scraper-based `app/api/jobs/route.ts` with a 20-line clean backend proxy. Old file was a 500+ line Cheerio scraper; new file just forwards `?source=india` requests to `NEXT_PUBLIC_API_URL`.

---

## 8. Jobs Hub UI System (added 2026-05-24)

The `/job-tracker` route is the unified hub page. All work lives under `src/components/jobs-hub/` and `app/job-tracker/page.tsx`.

### Design system — Direction 1 Sharp
- Token namespace: `hub-*` (defined in `src/index.css` under `@theme {}`)
- Base: cool slate (`oklch(…/hue 260)`), accent: vibrant indigo (`oklch(0.56 0.22 278)`)
- Font: Plus Jakarta Sans via `--font-hub`
- Motion constants in `src/lib/motion.ts`: `TAB_INDICATOR`, `TAB_DOT`, `TAB_PANEL`, `PRESS`, `STAGGER_*`, `TABLE_ROW*`

### Tab structure (`src/components/jobs-hub/tabs.config.ts`)
| Tab ID | Component | Status |
|---|---|---|
| `jobs` | `JobBoard` | Live |
| `tracker` | `SidebarDemo` | Live (backend optional) |
| `emails` | `HrEmailsTable` | Live |
| `dubai-hr` | `HrEmailsTable` | Live |
| `gulf-jobs` | `RegionalEmptyState` | Coming soon |
| `au-nz` | `RegionalEmptyState` | Coming soon |

### Key layout rules
- Fixed navbar is 64px (`h-16`). Page wrapper must have `pt-16`.
- `JobsHubNav` is `sticky top-16` — sits directly below the fixed navbar.
- Content area: `max-w-[940px] mx-auto px-5 pt-7 pb-20`.

### Job board fetch pattern (`src/components/job-board.tsx`)
- Single `fetchJobs` useCallback, single `useEffect([fetchJobs])` trigger.
- Page reset (`setPage(1)`) is batched **into** event handlers and the debounce setTimeout — never in a separate effect. Prevents double-fetch.
- AbortController: local `controller` variable (not just ref) so `controller.signal.aborted` check in `finally` is scoped to the current invocation.
- `res.ok` checked before `res.json()` — non-200 responses set empty state instead of crashing.
- `canHover` ref (`window.matchMedia('(hover: hover) and (pointer: fine)')`) guards all `onMouseEnter/Leave` handlers — no hover JS fires on touch devices.
- Category chips: inactive = ghost (`bg-transparent border-transparent`). Active chip inline styles are cleared in `onClick` before Tailwind active class takes over.

### Sidebar backend (port 7005)
- `SidebarDemo` fetches `${NEXT_PUBLIC_JOBFILX_APIURL}/job/applications` — port 7005 backend, **not in this repo**.
- Port 7005 being down renders an empty tracker table; it does not break the page.
- AbortController added to `getJobApplications` (2026-05-24) — StrictMode double-mount no longer logs duplicate fetch errors.

---

## 9. Session 5 Findings — 2026-05-24

### Issue 1: Loop / Request Spam

**Verdict: No actual React state loop. Dev-only noise.**

Execution chain traced:

- `job-board.tsx` — `fetchJobs` useCallback deps `[category, searchQuery, page, disabled]` are all stable
  primitives. No state mutated inside `fetchJobs` is in its dep array. No loop.
- `sidebar-demo.tsx` — `getJobApplications` has `[]` deps; reference is stable; effect fires once.
  AbortController correctly handles StrictMode double-mount. No loop.
- `framer-motion` vs `motion/react` (page.tsx uses `framer-motion`, job-board.tsx uses `motion/react`):
  both packages at v12 are the same underlying code — `framer-motion@12` re-exports from `motion`.
  No duplicate React context. Not a loop cause.

**Observed symptoms explained:**
- `[Fast Refresh] rebuilding` / `done` repeating → webpack watcher reacts to AI tooling file writes
  (`.superpowers/`, `.claude/`, `skills-lock.json`, etc. written during dev sessions). NOT React code.
- Duplicate fetches in console → React StrictMode double-mount. AbortController fix (session 4) correctly
  aborts the first mount's in-flight request; only one fetch completes per interaction.
- Effect replay noise → expected dev-only StrictMode behavior.

**Fix applied — `next.config.ts`:**
Added AI tooling directories to `webpack watchOptions.ignored` so the watcher no longer triggers Fast
Refresh when these files change:
```
.superpowers/  .claude/  skills-lock.json  .agents/  .cursor/
.gemini/  .kiro/  .pi/  .qoder/  .playwright-mcp/
```
Restart the dev server (`npm run dev`) for the new ignore rules to take effect.

---

### Issue 2: Jobs Not Appearing

**Root cause: Empty database + scheduler never wired into server.js.**

Evidence chain:
- `GET http://localhost:9001/api/health` → 200 (backend alive)
- `GET http://localhost:9001/api/jobs?source=india` → `{"jobs":[],"total":0,"lastIngested":null}`
- `GET http://localhost:9001/api/jobs/meta` → `{"total":0,"bySource":[],"lastIngested":null}`
- Frontend `job-board.tsx` payload handling is correct — shows empty state, no crash
- Proxy `app/api/jobs/route.ts` is clean, `res.ok` check is in place

The code had no bug. This was a pure operations failure: no ingestion had run since before 2026-05-19.
The 48h freshness gate at `normalizer.js:92` discarded all stale jobs. DB was empty.

**Why no automatic ingestion ran:**
`services/jobPipeline/scheduler.js` (`startJobScheduler`) exists and is correctly implemented
(10s delay, then every 12h via `setInterval`). But it was **never imported or called** in `server.js`.
The scheduler was dead code.

**Fixes applied:**

1. Manually triggered: `POST http://localhost:9001/api/jobs/ingest`
   → Completed: 299 jobs (248 LinkedIn India, 37 RemoteOK India, 14 Talentd), `durationMs: 127455`

2. `external/jobflix-backend-js/server.js` — wired up scheduler:
   - Added `import { startJobScheduler } from './services/jobPipeline/scheduler.js';`
   - Added `startJobScheduler()` call inside `app.listen` callback after `connectDB()`
   - Scheduler now runs: first ingestion 10s after server start, then every 12h automatically

**Backend restart:** nodemon auto-restarted on the server.js file save. The scheduler fired 10s after
restart and ran a second ingestion (newJobs: 14, updatedJobs: 281 — dedup correctly handled repeats).

**UI verification (Playwright accessibility snapshot, 2026-05-24):**
- `/job-tracker?tab=jobs` loads correctly
- "313 fresh jobs" count displayed
- 9 job cards on page 1 — real titles, companies, locations, `7h ago` timestamps
- Pagination: Page 1 of 35
- All 14 category chips rendered
- Search box and refresh button present and functional
- Zero JS errors in console at steady state

**Affected files:**
- `external/jobflix-backend-js/server.js` — scheduler wired in
- `next.config.ts` — AI tooling dirs added to webpack ignored list

---

## 10. Next Intended Task

No next task defined. Ask the user.

---

## 11. Rules for This Project

- **Do not touch `server/` or old backend** unless explicitly asked.
- **Do not run `npm run dev:server`** — that starts the old backend on port 3007.
- **Do not weaken the 48h freshness rule.** Expanding `f_TPR` on the LinkedIn URL is pointless — the normalizer gate at `normalizer.js:92` is the authority and will reject the older jobs anyway.
- **Do not fake categories** or assign jobs to categories without title/tag evidence.
- **Do not scrape on page load.** Ingestion is background only.
- **Always use TDD** for category mapper changes. Write failing tests before production code.
- **Do not broaden APM into generic PM roles.** Precision over volume.
- Keep all job sources under `source=india`.
- Use focused file reads. Do not scan the whole project blindly.
- Ask before any broad refactor.

---

## 12. Smoke Tests

```bash
curl http://localhost:9001/api/health
curl "http://localhost:9001/api/jobs?source=india&page=1&limit=10"
curl "http://localhost:9001/api/jobs/meta"
curl "http://localhost:9001/api/jobs?source=india&category=IT%2FSoftware&limit=5"
curl "http://localhost:9001/api/jobs?source=india&category=Internship&limit=5"
curl "http://localhost:9001/api/jobs?source=india&category=Fresher&limit=5"
curl "http://localhost:9001/api/jobs?source=india&category=DevOps&limit=5"
curl "http://localhost:9001/api/jobs?source=india&category=PM&limit=5"
curl "http://localhost:9001/api/jobs?source=india&category=APM&limit=5"
```

Expected: all return 200, `jobs` array non-empty (APM may be low-volume — market supply constraint, not a bug), `postedDate` values are `Xh ago` or `Xm ago` — never `Recently` or `Xd ago` ≥ 2.
