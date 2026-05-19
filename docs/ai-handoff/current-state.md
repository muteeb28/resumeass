# Current State — AI Handoff

_Last updated: 2026-05-19 (session 3). Update this file at the end of each session._

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
| **URL** | `http://localhost:3001` |
| **Local env** | `.env.local` (gitignored, do not commit) |

`.env.local` overrides `.env` with:
```
NEXT_PUBLIC_API_URL=http://localhost:9001/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:9001/api
NEXT_PUBLIC_AUTH_URL=http://localhost:9001/api
```
Delete `.env.local` to revert to old backend instantly.

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

## 7. Next Intended Task

No next task defined. Ask the user.

---

## 8. Rules for This Project

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

## 9. Smoke Tests

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
