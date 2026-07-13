# Interview Questions Scraper v2 — Design Spec

**Date:** 2026-06-26  
**Status:** Approved  
**Scope:** New scraper only. Does not touch frontend, backend, old scraper, or `public/data/interview-questions.json`.

---

## 1. Problem Statement

The existing `scripts/scrape-interview-questions.py` scrapes **company metadata** (e.g., "Google has 120 DSA questions") into `public/data/interview-questions.json`. It does not capture individual question records.

This spec defines a new, parallel scraper that collects **individual interview questions** from three public sources and stores them in a format ready for later backend import. Questions will eventually be rendered natively on the ResumeAssist/JobFlix website — `sourceUrl` is for attribution/debugging, not as a redirect target.

---

## 2. Files Created

| File | Purpose |
|------|---------|
| `scripts/scrape-interview-questions-v2.py` | New scraper (this spec) |
| `data/interview-questions.scraped.json` | Output: array of question records |
| `data/interview-questions.scrape-report.json` | Run statistics, errors, blocked pages |

**Files NOT modified:** `scripts/scrape-interview-questions.py`, `public/data/interview-questions.json`, any frontend file, any backend file.

---

## 3. Target Sources

| Source key | Index URL | Notes |
|------------|-----------|-------|
| `getsdeready` | `https://getsdeready.com/interview-questions/` | Topic sub-pages; full question text likely public |
| `greatfrontend` | `https://www.greatfrontend.com/questions` | Question grid; most detail content auth-gated |
| `hellointerview` | `https://www.hellointerview.com/community/questions?sort=recentAndPopular&page=1` | Paginated community questions; detail content likely public |

---

## 4. Data Schema

Each element of `data/interview-questions.scraped.json`:

```json
{
  "source": "getsdeready | greatfrontend | hellointerview",
  "sourceUrl": "https://...",
  "title": "What is the virtual DOM?",
  "category": "frontend | system-design | dsa | behavioral | unknown",
  "difficulty": "easy | medium | hard | unknown",
  "tags": ["react", "javascript"],
  "question": "Full question text, or empty string if unavailable.",
  "answer": "",
  "metadata": {
    "scrapedAt": "2026-06-26T10:00:00Z",
    "slug": "getsdeready-what-is-the-virtual-dom",
    "externalId": "",
    "scrapeStatus": "ok | auth_gated | empty_detail_page | blocked | parse_failed | index_only",
    "contentAvailable": true
  }
}
```

### Field rules

- `source`: one of the three source keys above; never free-text
- `sourceUrl`: the original page URL for attribution and debugging; not used for redirects
- `title`: required; records with empty title are discarded
- `category`: inferred from tags/content using keyword rules; defaults to `"unknown"`
- `difficulty`: inferred from page content; defaults to `"unknown"`
- `tags`: array of strings; deduplicated; max 10 per record
- `question`: full public question text if extractable; `""` otherwise
- `answer`: `""` by default; only populated if answer text is clearly public and unambiguously the answer to this question; never bypass auth/paywalls to obtain
- `metadata.scrapedAt`: ISO 8601 UTC timestamp of when this record was scraped
- `metadata.slug`: `"{source}-{slugified-title}"` — stable across reruns for the same title+source
- `metadata.externalId`: extracted from URL slug if present (e.g., `react-closures`); `""` if not available
- `metadata.scrapeStatus`: describes extraction outcome (see values above)
- `metadata.contentAvailable`: `true` if `question` field contains actual text; `false` for auth-gated, blocked, empty, or index-only records

---

## 5. Architecture

Single file `scripts/scrape-interview-questions-v2.py` containing five logical units:

```
ScraperBase              ← abstract base class; shared helpers (slug, category inference,
                           difficulty inference, tag extraction, scrapeStatus logic)

GetsdereadyScraper       ← site-specific extraction for getsdeready.com
GreatFrontendScraper     ← site-specific extraction for greatfrontend.com
HelloInterviewScraper    ← site-specific extraction for hellointerview.com

run_all()                ← orchestrator: shared browser, polite delays, dedup, file output
```

### ScraperBase

Abstract base. Subclasses implement:

```python
@property
def source_key(self) -> str: ...          # "getsdeready" | "greatfrontend" | "hellointerview"

@property  
def index_url(self) -> str: ...           # listing page URL

async def scrape(self, crawler) -> list[dict]: ...  # returns raw records
```

Shared helpers on base class:
- `_slug(source_key, title)` — stable slug
- `_infer_category(text)` — keyword-based category inference
- `_infer_difficulty(text)` — keyword-based difficulty inference
- `_extract_tags(text)` — known-tag list scanning
- `_make_record(...)` — builds a well-formed record dict with all required fields

### GetsdereadyScraper

1. Crawl index `https://getsdeready.com/interview-questions/` → discover sub-page links (paths containing `/interview-questions/`)
2. For each sub-page, render with Crawl4AI
3. **CSS primary:** `h2`, `h3`, `li` inside `.faq`, `.accordion`, `.questions-list`, `.entry-content`
4. **Markdown fallback:** regex on `## `, `**Q:**`, numbered list patterns in rendered markdown
5. Full question text typically available on topic page — no separate detail page needed
6. `scrapeStatus: "ok"` if text extracted; `"parse_failed"` if selectors + fallback both yield nothing

### GreatFrontendScraper

1. Crawl `https://www.greatfrontend.com/questions`
2. **CSS primary:** anchor elements with `href` matching `/questions/[category]/[slug]`; extract title, category, difficulty from card markup
3. For each question link, crawl detail page
4. **CSS primary on detail:** main content area (`article`, `main`, `[class*="content"]`, `[class*="question"]`)
5. If detail page is auth-gated (login wall detected in rendered markdown, or content is empty/minimal):
   - Keep record with title + metadata from listing page
   - Set `question: ""`, `scrapeStatus: "auth_gated"`, `contentAvailable: false`
6. `externalId` = slug from URL path (e.g., `/questions/javascript/closures` → `javascript-closures`)

### HelloInterviewScraper

1. Crawl pages 1–N (default max 5; configurable `MAX_PAGES` constant) of `https://www.hellointerview.com/community/questions?sort=recentAndPopular&page={n}`
2. Stop paginating when a page returns no new question links
3. **CSS primary:** question title links, category/tag chips, difficulty badges
4. Crawl each detail URL for full question text
5. **CSS primary on detail:** `article`, `main`, `[class*="question"]`, `[class*="content"]`
6. **Markdown fallback:** first substantial paragraph after the title heading
7. `externalId` = slug from URL if present

---

## 6. Orchestrator (`run_all`)

```
1. Create data/ directory if not exists
2. Init AsyncWebCrawler(BrowserConfig(headless=True, verbose=False))
3. Run GetsdereadyScraper, GreatFrontendScraper, HelloInterviewScraper in sequence
4. After each page request: sleep POLITE_DELAY + random.uniform(-0.5, 0.5) seconds
5. Retry once on timeout/network error with 3s backoff; no retry on 403/blocked
6. Deduplicate: key = f"{source_key}:{slug_of_title}"; first-seen wins
7. Discard records with empty title
8. Write data/interview-questions.scraped.json (full overwrite)
9. Write data/interview-questions.scrape-report.json (full overwrite)
10. Print validation summary to stdout
```

### Constants (top of file, easy to adjust)

```python
POLITE_DELAY = 2.0        # seconds between requests
MAX_HELLOINTERVIEW_PAGES = 5
OUTPUT_DIR = Path(__file__).parent.parent / "data"
```

---

## 7. Scrape Report Schema

`data/interview-questions.scrape-report.json`:

```json
{
  "generatedAt": "2026-06-26T10:00:00Z",
  "totalScraped": 142,
  "perSource": {
    "getsdeready":    { "scraped": 87, "skippedDuplicates": 3, "errors": 1 },
    "greatfrontend":  { "scraped": 40, "skippedDuplicates": 0, "errors": 12 },
    "hellointerview": { "scraped": 15, "skippedDuplicates": 0, "errors": 0 }
  },
  "contentAvailableCount": 102,
  "indexOnlyCount": 40,
  "blocked": ["https://greatfrontend.com/questions/javascript/closures"],
  "parseErrors": ["https://getsdeready.com/interview-questions/amazon/"]
}
```

---

## 8. Stdout Validation Summary (printed after each run)

```
=== Interview Questions Scraper v2 ===

Source breakdown:
  getsdeready    : 87 records (84 with content, 3 index-only)
  greatfrontend  : 40 records ( 3 with content, 37 auth-gated)
  hellointerview : 15 records (15 with content,  0 index-only)

Total scraped    : 142
Duplicates skipped: 3
Errors           : 13

Output           : data/interview-questions.scraped.json
Report           : data/interview-questions.scrape-report.json

Validation:
  [✓] Valid JSON
  [✓] No empty-title records
  [✓] No frontend/backend files changed
```

---

## 9. Constraints

- **No credentials, cookies, login automation, paywall bypass, or private API calls**
- **No LLM-assisted extraction in v1** (adds cost/latency/nondeterminism; add later if needed)
- **No modifications to:** frontend, backend routes/controllers/models, old scraper, `public/data/interview-questions.json`
- Scraper is safe to rerun: deterministic output, full overwrite on each run
- `crawl4ai` is a dev/script-only dependency; do not add to `package.json`

---

## 10. Prerequisites to Run

```bash
pip install "crawl4ai[all]"
crawl4ai-setup          # downloads Playwright browser (one-time)
python scripts/scrape-interview-questions-v2.py
```
