# Current State — AI Handoff

_Last updated: 2026-05-18 (session 2). Update this file at the end of each session._

---

## 1. Active Backend

| | |
|---|---|
| **Path** | `external/jobflix-backend-js` |
| **Branch** | `main` (HEAD: `27041be`) |
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
- 48-hour freshness gate is enforced at the normalizer. Do not weaken it.
- No "Recently" labels. No 2d+ stale jobs.
- `categories[]` (array) is persisted on every Job document and drives all filters.
- Category filters use MongoDB array containment: `filter.categories = category`.

Key routes (clean backend):
```
GET  /api/jobs?source=india[&category=X][&searchText=Y][&page=N][&limit=N]
GET  /api/jobs/meta
POST /api/jobs/ingest   — triggers background ingestion, returns immediately
```

---

## 4. Current Categories

`All`, `Fresher`, `Internship`, `Remote`, `IT/Software`, `Core Engineering`,
`DevOps`, `PM`, `APM`, `Batch 2026`, `Batch 2025`, `Full Time`, `Design`, `Sales & Marketing`

Rules:
- Batch 2025/2026 require **explicit** year + batch language in title/tags. Never inferred.
- Categories come from `categoryMapper.js` — evidence-based only. No faking.
- **DevOps** is additive with IT/Software (a DevOps Engineer gets both).
- **APM** = Associate/Assistant Product Manager roles only. "APM" alone is not matched (too ambiguous). APM and PM are mutually exclusive — APM takes precedence.
- **PM** = Product Manager, Product Owner, Product Lead, Product Strategy Manager. Does NOT match Project Manager, Program Manager, or Product Marketing Manager.
- `DEVOPS_RE`, `APM_RE`, `PM_RE` are all in `categoryMapper.js`.

---

## 5. Recent LinkedIn Work — DevOps/APM/PM categories (session 2, 2026-05-18)

LinkedIn India `SEARCH_GROUPS` expanded from 8 groups (30 terms) to **11 groups** (43 terms):

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
| **DevOps** | **devops engineer, site reliability engineer, cloud engineer, platform engineer, infrastructure engineer, kubernetes engineer** |
| **APM** | **associate product manager, assistant product manager, product management intern** |
| **PM** | **product manager, technical product manager, growth product manager, product owner** |

`categoryMapper.js` additions:
- `DEVOPS_RE`: devops, site reliability engineer, sre, cloud/platform/infrastructure/kubernetes engineer, CI/CD engineer, release/build engineer
- `APM_RE`: associate/assistant product manager, apm intern/trainee/fellow, product management intern/trainee/associate
- `PM_RE`: product manager/owner/lead, product strategy manager/lead/director

Frontend: `src/components/job-board.tsx` — `CategoryValue` type and `TALENTD_CATEGORIES` array updated.

Test suite: **324 tests passing** across 6 files. Run with:
```
cd external/jobflix-backend-js && LINKEDIN_INDIA_DELAY_MS=0 npx vitest run
```

---

## 6. Next Intended Task

No next task defined. Ask the user.

---

## 7. Rules for This Project

- **Do not touch `server/` or old backend** unless explicitly asked.
- **Do not run `npm run dev:server`** — that starts the old backend on port 3007.
- **Do not weaken the 48h freshness rule.**
- **Do not fake categories** or assign jobs to categories without title/tag evidence.
- **Do not scrape on page load.** Ingestion is background only.
- **Always use TDD** for category mapper changes.
- Keep all job sources under `source=india`.
- Use focused file reads. Do not scan the whole project blindly.
- Ask before any broad refactor.

---

## 8. Smoke Tests

```bash
curl http://localhost:9001/api/health
curl "http://localhost:9001/api/jobs?source=india&page=1&limit=10"
curl "http://localhost:9001/api/jobs/meta"
curl "http://localhost:9001/api/jobs?source=india&category=IT%2FSoftware&limit=5"
curl "http://localhost:9001/api/jobs?source=india&category=Internship&limit=5"
curl "http://localhost:9001/api/jobs?source=india&category=Fresher&limit=5"
```

Expected: all return 200, `jobs` array non-empty, `postedDate` values are `Xh ago` or `Xm ago` — never `Recently` or `Xd ago` ≥ 2.
