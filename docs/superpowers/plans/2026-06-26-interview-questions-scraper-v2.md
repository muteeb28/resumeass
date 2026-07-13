# Interview Questions Scraper v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `scripts/scrape-interview-questions-v2.py` that scrapes individual interview questions from three public websites and writes structured JSON to `data/interview-questions.scraped.json`.

**Architecture:** Single Python file containing `ScraperBase` (abstract class with shared helpers), three site-specific scraper subclasses (`GetsdereadyScraper`, `GreatFrontendScraper`, `HelloInterviewScraper`), and a `run_all()` orchestrator that manages the shared `AsyncWebCrawler` instance, polite delays, dedup, and file output. Extraction uses CSS selectors as primary strategy and markdown/regex as fallback. No LLM extraction.

**Tech Stack:** Python 3.11, crawl4ai (Playwright-based), asyncio, stdlib only (json, re, pathlib, unittest).

## Global Constraints

- Only create: `scripts/scrape-interview-questions-v2.py`, `scripts/test_scraper_helpers_v2.py`, `data/interview-questions.scraped.json`, `data/interview-questions.scrape-report.json`
- Do NOT modify: any frontend file, any backend file, `scripts/scrape-interview-questions.py`, `public/data/interview-questions.json`, `package.json`, `package-lock.json`
- No credentials, cookies, login automation, paywall bypass, or private API calls
- No LLM-assisted extraction (v1 scope)
- `crawl4ai` is a script-only pip dependency — never add to `package.json`
- Safe to rerun: output files are fully overwritten each run
- Python available as `python` (3.11.9 confirmed on this machine)

---

## File Map

| Path | Action | Responsibility |
|------|--------|---------------|
| `scripts/scrape-interview-questions-v2.py` | Create | All scraping logic: ScraperBase, 3 scrapers, orchestrator |
| `scripts/test_scraper_helpers_v2.py` | Create | Unit tests for pure helper functions (no crawl4ai required) |
| `data/interview-questions.scraped.json` | Create (generated) | Output: array of question records |
| `data/interview-questions.scrape-report.json` | Create (generated) | Run stats, blocked pages, errors |

---

## Task 1: Scaffold + ScraperBase helpers (TDD)

**Files:**
- Create: `scripts/test_scraper_helpers_v2.py`
- Create: `scripts/scrape-interview-questions-v2.py` (partial — through ScraperBase)

**Interfaces:**
- Produces:
  - `ScraperBase._slug(title: str) -> str` — `"{source_key}-{normalized-title}"`
  - `ScraperBase._infer_category(text: str) -> str` — `"frontend"|"system-design"|"dsa"|"behavioral"|"unknown"`
  - `ScraperBase._infer_difficulty(text: str) -> str` — `"easy"|"medium"|"hard"|"unknown"`
  - `ScraperBase._extract_tags(text: str) -> list[str]` — max 10 known tags
  - `ScraperBase._detect_auth_gate(markdown: str) -> bool`
  - `ScraperBase._make_record(**kwargs) -> dict` — fully-formed record matching the spec schema

---

- [ ] **Step 1: Write failing tests for helper functions**

Create `scripts/test_scraper_helpers_v2.py`:

```python
"""Unit tests for ScraperBase helper functions. Requires no crawl4ai."""
import sys
import unittest
from pathlib import Path

# Allow importing from the script before crawl4ai is installed by stubbing it
import types
crawl4ai_stub = types.ModuleType("crawl4ai")
crawl4ai_stub.AsyncWebCrawler = object
crawl4ai_stub.BrowserConfig = object
crawl4ai_stub.CrawlerRunConfig = object
sys.modules.setdefault("crawl4ai", crawl4ai_stub)

# Patch the import guard so we can import the module without crawl4ai installed
import importlib, builtins
_real_import = builtins.__import__
def _patched_import(name, *args, **kwargs):
    if name == "crawl4ai":
        return crawl4ai_stub
    return _real_import(name, *args, **kwargs)
builtins.__import__ = _patched_import

sys.path.insert(0, str(Path(__file__).parent))
import scrape_interview_questions_v2 as m

builtins.__import__ = _real_import  # restore


class FakeScraper(m.ScraperBase):
    source_key = "testsrc"
    index_url = "https://example.com"
    async def scrape(self, crawler): return []


scraper = FakeScraper()


class TestSlug(unittest.TestCase):
    def test_basic(self):
        assert scraper._slug("What is the Virtual DOM?") == "testsrc-what-is-the-virtual-dom"

    def test_special_chars(self):
        assert scraper._slug("React: Hooks & State") == "testsrc-react-hooks-state"

    def test_empty(self):
        assert scraper._slug("") == "testsrc-"


class TestInferCategory(unittest.TestCase):
    def test_frontend(self):
        assert scraper._infer_category("Explain how React hooks work") == "frontend"

    def test_system_design(self):
        assert scraper._infer_category("Design a distributed cache system") == "system-design"

    def test_dsa(self):
        assert scraper._infer_category("Implement a binary search tree") == "dsa"

    def test_behavioral(self):
        assert scraper._infer_category("Tell me about a time you led a team") == "behavioral"

    def test_unknown(self):
        assert scraper._infer_category("Something completely unrelated") == "unknown"


class TestInferDifficulty(unittest.TestCase):
    def test_easy(self):
        assert scraper._infer_difficulty("This is an easy beginner question") == "easy"

    def test_hard(self):
        assert scraper._infer_difficulty("This is a hard advanced problem") == "hard"

    def test_medium(self):
        assert scraper._infer_difficulty("medium intermediate level") == "medium"

    def test_unknown(self):
        assert scraper._infer_difficulty("no difficulty signal here") == "unknown"


class TestExtractTags(unittest.TestCase):
    def test_known_tags(self):
        tags = scraper._extract_tags("Explain closures in javascript and react")
        assert "javascript" in tags
        assert "react" in tags

    def test_max_10(self):
        big_text = " ".join(m.KNOWN_TAGS)  # all tags in one string
        tags = scraper._extract_tags(big_text)
        assert len(tags) <= 10

    def test_empty(self):
        assert scraper._extract_tags("") == []


class TestDetectAuthGate(unittest.TestCase):
    def test_detects_sign_in(self):
        assert scraper._detect_auth_gate("Please sign in to view this question") is True

    def test_detects_premium(self):
        assert scraper._detect_auth_gate("This is a premium question, subscribe to access") is True

    def test_clean_page(self):
        assert scraper._detect_auth_gate("What is the event loop in JavaScript?") is False


class TestMakeRecord(unittest.TestCase):
    def test_required_fields(self):
        rec = scraper._make_record(title="What is closure?", source_url="https://example.com/q/1")
        assert rec["source"] == "testsrc"
        assert rec["sourceUrl"] == "https://example.com/q/1"
        assert rec["title"] == "What is closure?"
        assert rec["question"] == ""
        assert rec["answer"] == ""
        assert rec["category"] in ("frontend", "dsa", "system-design", "behavioral", "unknown")
        assert isinstance(rec["tags"], list)
        assert rec["metadata"]["slug"].startswith("testsrc-")
        assert rec["metadata"]["scrapeStatus"] == "ok"
        assert rec["metadata"]["contentAvailable"] is False  # no question text

    def test_content_available_true(self):
        rec = scraper._make_record(
            title="What is closure?",
            source_url="https://example.com",
            question="A closure is a function that captures its lexical scope.",
        )
        assert rec["metadata"]["contentAvailable"] is True

    def test_scrape_status_propagated(self):
        rec = scraper._make_record(
            title="Locked question",
            source_url="https://example.com",
            scrape_status="auth_gated",
        )
        assert rec["metadata"]["scrapeStatus"] == "auth_gated"
        assert rec["metadata"]["contentAvailable"] is False


if __name__ == "__main__":
    unittest.main(verbosity=2)
```

- [ ] **Step 2: Run tests — expect ImportError or NameError (module not created yet)**

```bash
python scripts/test_scraper_helpers_v2.py
```

Expected: `ModuleNotFoundError: No module named 'scrape_interview_questions_v2'`

- [ ] **Step 3: Create the scraper file skeleton + ScraperBase through helper methods**

Create `scripts/scrape-interview-questions-v2.py` (note: Python imports use `_` not `-`, but the filename uses `-` to match the convention; the test file imports it after `sys.path` manipulation):

```python
#!/usr/bin/env python3
"""
Interview Questions Scraper v2
================================
Scrapes individual interview questions from three public sources:
  - getsdeready.com/interview-questions/
  - greatfrontend.com/questions
  - hellointerview.com/community/questions

HOW TO RERUN:
  1. Install dependencies (one-time):
       pip install "crawl4ai[all]"
       crawl4ai-setup
  2. Run:
       python scripts/scrape-interview-questions-v2.py
  3. Output files (overwritten each run — safe to rerun):
       data/interview-questions.scraped.json
       data/interview-questions.scrape-report.json

CONSTRAINTS:
  - No auth, no cookies, no login automation, no paywall bypass.
  - Only scrapes content visible to a normal public visitor.
  - No LLM-assisted extraction (v1). Add later if HTML is too messy.
"""

import asyncio
import json
import random
import re
import time
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from pathlib import Path

try:
    from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
except ImportError:
    raise SystemExit(
        "\n[ERROR] crawl4ai is not installed.\n"
        "Install it with:\n\n"
        '    pip install "crawl4ai[all]"\n'
        "    crawl4ai-setup\n\n"
        "Then re-run this script."
    )

# ── Constants (edit these to tune scraper behavior) ────────────────────────────
POLITE_DELAY: float = 2.0           # seconds between page requests
MAX_HELLOINTERVIEW_PAGES: int = 5   # max community pages to paginate
OUTPUT_DIR: Path = Path(__file__).parent.parent / "data"

KNOWN_TAGS: list[str] = [
    "react", "javascript", "typescript", "html", "css", "vue", "angular",
    "node", "express", "python", "java", "golang", "rust", "c++",
    "system-design", "distributed-systems", "databases", "sql", "nosql",
    "redis", "kafka", "microservices", "api", "rest", "graphql",
    "arrays", "strings", "trees", "graphs", "dynamic-programming",
    "recursion", "sorting", "searching", "hashing", "linked-lists",
    "behavioral", "leadership", "star-method",
    "machine-learning", "deep-learning", "statistics",
]

# (category, keywords) — first match wins; "unknown" is the final fallback
CATEGORY_RULES: list[tuple[str, list[str]]] = [
    ("frontend",      ["react", "javascript", "typescript", "css", "html", "vue", "angular",
                       "frontend", "dom", "browser", "webpack", "vite"]),
    ("system-design", ["system design", "distributed", "scalab", "caching", "message queue",
                       "microservice", "kafka", "load balancer", "cap theorem"]),
    ("dsa",           ["array", "tree", "graph", "dynamic programming", "recursion", "sorting",
                       "linked list", "algorithm", "dsa", "leetcode", "binary search"]),
    ("behavioral",    ["behavioral", "leadership", "star method", "tell me about",
                       "describe a time", "conflict", "teamwork"]),
]


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _polite_delay() -> None:
    """Pause between requests to be a good citizen."""
    jitter = random.uniform(-0.5, 0.5)
    await asyncio.sleep(max(0.5, POLITE_DELAY + jitter))


# ── ScraperBase ────────────────────────────────────────────────────────────────

class ScraperBase(ABC):
    """Abstract base. Subclasses implement source_key, index_url, scrape()."""

    @property
    @abstractmethod
    def source_key(self) -> str: ...

    @property
    @abstractmethod
    def index_url(self) -> str: ...

    @abstractmethod
    async def scrape(self, crawler: "AsyncWebCrawler") -> list[dict]: ...

    # ── Shared helpers ──────────────────────────────────────────────────────

    def _slug(self, title: str) -> str:
        normalized = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
        return f"{self.source_key}-{normalized}"

    def _infer_category(self, text: str) -> str:
        tl = text.lower()
        for category, keywords in CATEGORY_RULES:
            if any(kw in tl for kw in keywords):
                return category
        return "unknown"

    def _infer_difficulty(self, text: str) -> str:
        tl = text.lower()
        if any(w in tl for w in ["easy", "beginner", "basic", "introductory"]):
            return "easy"
        if any(w in tl for w in ["hard", "advanced", "difficult", "expert", "senior"]):
            return "hard"
        if any(w in tl for w in ["medium", "intermediate", "moderate"]):
            return "medium"
        return "unknown"

    def _extract_tags(self, text: str) -> list[str]:
        tl = text.lower()
        found = [tag for tag in KNOWN_TAGS if tag in tl]
        return found[:10]

    def _detect_auth_gate(self, markdown: str) -> bool:
        gate_signals = [
            "sign in to view", "log in to see", "create a free account",
            "subscribe to access", "unlock this question", "premium content",
            "sign up to continue", "login required", "members only",
            "create an account to", "register to view",
        ]
        ml = markdown.lower()
        return any(sig in ml for sig in gate_signals)

    def _make_record(
        self,
        *,
        title: str,
        source_url: str,
        question: str = "",
        answer: str = "",
        category: str | None = None,
        difficulty: str | None = None,
        tags: list[str] | None = None,
        external_id: str = "",
        scrape_status: str = "ok",
    ) -> dict:
        text = f"{title} {question}"
        return {
            "source": self.source_key,
            "sourceUrl": source_url,
            "title": title.strip(),
            "category": category if category else self._infer_category(text),
            "difficulty": difficulty if difficulty else self._infer_difficulty(text),
            "tags": tags if tags is not None else self._extract_tags(text),
            "question": question.strip(),
            "answer": answer.strip(),
            "metadata": {
                "scrapedAt": datetime.now(timezone.utc).isoformat(),
                "slug": self._slug(title),
                "externalId": external_id,
                "scrapeStatus": scrape_status,
                "contentAvailable": bool(question.strip()),
            },
        }
```

- [ ] **Step 4: Run tests — expect failures on class not found errors**

```bash
python scripts/test_scraper_helpers_v2.py
```

Expected: Some tests fail because `scrape_interview_questions_v2` can't be imported (filename has `-` not `_`). The test file handles this with a `sys.path` trick — but the import name uses `_`. Confirm the test imports correctly by checking the output. If `ModuleNotFoundError` for `scrape_interview_questions_v2`, the stub approach in the test file handles the crawl4ai missing case; the file rename issue must be resolved.

> **Note on filename:** Python imports can't use `-`. The test file imports via `sys.path` and `importlib` using the filename directly. To make `import scrape_interview_questions_v2` work, the test does:
> ```python
> import importlib.util
> spec = importlib.util.spec_from_file_location(
>     "scrape_interview_questions_v2",
>     Path(__file__).parent / "scrape-interview-questions-v2.py"
> )
> m = importlib.util.module_from_spec(spec)
> spec.loader.exec_module(m)
> ```
> Update the test file's import block to use this approach instead of the `import scrape_interview_questions_v2 as m` line.

- [ ] **Step 5: Update test file import block to use importlib.util**

Replace the import section in `scripts/test_scraper_helpers_v2.py` (everything from `sys.path.insert` through `builtins.__import__ = _real_import`) with:

```python
import importlib.util, builtins, types

# Stub crawl4ai so the script doesn't SystemExit when it's not installed
crawl4ai_stub = types.ModuleType("crawl4ai")
for attr in ("AsyncWebCrawler", "BrowserConfig", "CrawlerRunConfig"):
    setattr(crawl4ai_stub, attr, object)
sys.modules["crawl4ai"] = crawl4ai_stub

spec = importlib.util.spec_from_file_location(
    "scrape_interview_questions_v2",
    Path(__file__).parent / "scrape-interview-questions-v2.py",
)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
```

- [ ] **Step 6: Run tests again — all should pass**

```bash
python scripts/test_scraper_helpers_v2.py
```

Expected output (all pass):
```
TestDetectAuthGate.test_clean_page ... ok
TestDetectAuthGate.test_detects_premium ... ok
TestDetectAuthGate.test_detects_sign_in ... ok
TestExtractTags.test_empty ... ok
TestExtractTags.test_known_tags ... ok
TestExtractTags.test_max_10 ... ok
TestInferCategory.test_behavioral ... ok
TestInferCategory.test_dsa ... ok
TestInferCategory.test_frontend ... ok
TestInferCategory.test_system_design ... ok
TestInferCategory.test_unknown ... ok
TestInferDifficulty.test_easy ... ok
TestInferDifficulty.test_hard ... ok
TestInferDifficulty.test_medium ... ok
TestInferDifficulty.test_unknown ... ok
TestMakeRecord.test_content_available_true ... ok
TestMakeRecord.test_required_fields ... ok
TestMakeRecord.test_scrape_status_propagated ... ok
TestSlug.test_basic ... ok
TestSlug.test_empty ... ok
TestSlug.test_special_chars ... ok

Ran 21 tests in 0.XXXs
OK
```

---

## Task 2: GetsdereadyScraper

**Files:**
- Modify: `scripts/scrape-interview-questions-v2.py` (append class after ScraperBase)

**Interfaces:**
- Consumes: `ScraperBase._make_record`, `ScraperBase._css_strip`, `_polite_delay`, `AsyncWebCrawler`, `CrawlerRunConfig`
- Produces: `GetsdereadyScraper` class with `source_key = "getsdeready"`, `scrape(crawler) -> list[dict]`

---

- [ ] **Step 1: Append GetsdereadyScraper to the scraper file**

Append this class after `ScraperBase` in `scripts/scrape-interview-questions-v2.py`:

```python
# ── GetsdereadyScraper ─────────────────────────────────────────────────────────

class GetsdereadyScraper(ScraperBase):
    """
    Scrapes individual questions from getsdeready.com topic/company pages.
    Topic pages ARE the content pages — no separate detail page is followed in v1.
    If deeper question links exist, they are recorded as sourceUrl but not crawled.
    """

    source_key = "getsdeready"
    index_url = "https://getsdeready.com/interview-questions/"

    _run_cfg = CrawlerRunConfig(wait_for="networkidle", page_timeout=30_000)

    async def scrape(self, crawler: AsyncWebCrawler) -> list[dict]:
        records: list[dict] = []

        print(f"  [getsdeready] Crawling index: {self.index_url}")
        idx = await crawler.arun(url=self.index_url, config=self._run_cfg)
        if not idx.success:
            print(f"  [getsdeready] Index crawl failed: {idx.error_message}")
            return []

        sub_pages = self._discover_sub_pages(idx)
        print(f"  [getsdeready] Found {len(sub_pages)} sub-page(s)")

        for url in sub_pages:
            await _polite_delay()
            print(f"  [getsdeready] {url}", end=" … ", flush=True)
            try:
                page = await crawler.arun(url=url, config=self._run_cfg)
                if not page.success:
                    print(f"SKIP ({page.error_message})")
                    continue
                page_records = self._extract_questions(page, url)
                records.extend(page_records)
                print(f"OK ({len(page_records)} q)")
            except Exception as exc:
                print(f"ERROR: {exc}")

        return records

    def _discover_sub_pages(self, result) -> list[str]:
        seen: set[str] = set()
        urls: list[str] = []
        for link in result.links.get("internal", []):
            href: str = link.get("href", "")
            if (
                "/interview-questions/" in href
                and href.rstrip("/") != self.index_url.rstrip("/")
                and href not in seen
            ):
                seen.add(href)
                urls.append(href)
        return urls

    def _extract_questions(self, result, source_url: str) -> list[dict]:
        html = result.html or ""
        md = result.markdown or ""

        records = self._css_extract(html, source_url)
        if records:
            return records
        return self._markdown_extract(md, source_url)

    def _css_extract(self, html: str, source_url: str) -> list[dict]:
        """Extract question text from <h2>/<h3> headings in HTML."""
        headings = re.findall(r"<h[23][^>]*>(.*?)</h[23]>", html, re.I | re.S)
        records = []
        for raw in headings:
            title = re.sub(r"<[^>]+>", "", raw).strip()
            title = re.sub(r"\s+", " ", title)
            # Skip navigation-like headings
            if len(title) < 12 or title.lower() in (
                "questions", "interview questions", "overview", "introduction",
                "faqs", "faq", "related questions",
            ):
                continue
            records.append(self._make_record(
                title=title,
                source_url=source_url,
                question=title,
                scrape_status="ok",
            ))
        return records

    def _markdown_extract(self, md: str, source_url: str) -> list[dict]:
        """Fallback: extract questions from rendered markdown."""
        records = []
        # Numbered list: "1. What is...?"
        for match in re.finditer(r"^\d+\.\s+(.{12,})$", md, re.M):
            title = match.group(1).strip().rstrip("*_")
            records.append(self._make_record(
                title=title, source_url=source_url,
                question=title, scrape_status="ok",
            ))
        if records:
            return records
        # Q: prefix fallback
        for match in re.finditer(r"^(?:Q:|Question:)\s*(.{12,})$", md, re.M | re.I):
            title = match.group(1).strip()
            records.append(self._make_record(
                title=title, source_url=source_url,
                question=title, scrape_status="ok",
            ))
        return records
```

- [ ] **Step 2: Verify the file parses cleanly (no syntax errors)**

```bash
python -c "import importlib.util; spec = importlib.util.spec_from_file_location('x', 'scripts/scrape-interview-questions-v2.py'); m = importlib.util.module_from_spec(spec)"
```

Expected: no output (clean parse). If `SystemExit` from crawl4ai missing, that's expected and OK — it means the file parsed.

- [ ] **Step 3: Re-run unit tests to confirm nothing regressed**

```bash
python scripts/test_scraper_helpers_v2.py
```

Expected: `Ran 21 tests … OK`

---

## Task 3: GreatFrontendScraper

**Files:**
- Modify: `scripts/scrape-interview-questions-v2.py` (append class)

**Interfaces:**
- Consumes: `ScraperBase._make_record`, `ScraperBase._detect_auth_gate`, `_polite_delay`
- Produces: `GreatFrontendScraper` with `source_key = "greatfrontend"`, `scrape(crawler) -> list[dict]`

---

- [ ] **Step 1: Append GreatFrontendScraper to the scraper file**

```python
# ── GreatFrontendScraper ───────────────────────────────────────────────────────

class GreatFrontendScraper(ScraperBase):
    """
    Scrapes question listing from greatfrontend.com/questions.
    Most detail content is behind auth; records are kept with index metadata
    and scrapeStatus: "auth_gated" when the detail page is locked.
    """

    source_key = "greatfrontend"
    index_url = "https://www.greatfrontend.com/questions"

    _run_cfg = CrawlerRunConfig(wait_for="networkidle", page_timeout=30_000)

    async def scrape(self, crawler: AsyncWebCrawler) -> list[dict]:
        records: list[dict] = []

        print(f"  [greatfrontend] Crawling index: {self.index_url}")
        idx = await crawler.arun(url=self.index_url, config=self._run_cfg)
        if not idx.success:
            print(f"  [greatfrontend] Index crawl failed: {idx.error_message}")
            return []

        question_links = self._discover_question_links(idx)
        print(f"  [greatfrontend] Found {len(question_links)} question link(s)")

        for title, url, category in question_links:
            await _polite_delay()
            short = title[:45] + ("…" if len(title) > 45 else "")
            print(f"  [greatfrontend] {short}", end=" … ", flush=True)
            try:
                page = await crawler.arun(url=url, config=self._run_cfg)
                if not page.success:
                    print("BLOCKED")
                    records.append(self._make_record(
                        title=title, source_url=url, category=category,
                        scrape_status="blocked",
                    ))
                    continue

                md = page.markdown or ""
                if self._detect_auth_gate(md) or len(md.strip()) < 120:
                    print("AUTH-GATED")
                    records.append(self._make_record(
                        title=title, source_url=url, category=category,
                        scrape_status="auth_gated",
                    ))
                    continue

                question_text = self._extract_question_text(page)
                ext_id = self._external_id_from_url(url)
                status = "ok" if question_text else "empty_detail_page"
                records.append(self._make_record(
                    title=title, source_url=url, category=category,
                    question=question_text, external_id=ext_id,
                    scrape_status=status,
                ))
                print(f"OK ({len(question_text)} chars)")
            except Exception as exc:
                print(f"ERROR: {exc}")
                records.append(self._make_record(
                    title=title, source_url=url, category=category,
                    scrape_status="parse_failed",
                ))

        return records

    def _discover_question_links(self, result) -> list[tuple[str, str, str]]:
        """Return (title, absolute_url, category) from listing page links."""
        found: list[tuple[str, str, str]] = []
        seen: set[str] = set()
        for link in result.links.get("internal", []):
            href: str = link.get("href", "")
            text: str = link.get("text", "").strip()
            # GFE question URLs: /questions/<category>/<slug>
            m = re.match(r".*/questions/([^/]+)/([^/?#]+)", href)
            if m and text and href not in seen:
                seen.add(href)
                category_raw = m.group(1).replace("-", " ")
                category = self._infer_category(f"{category_raw} {text}")
                # Ensure absolute URL
                if href.startswith("/"):
                    href = "https://www.greatfrontend.com" + href
                found.append((text, href, category))
        return found

    def _extract_question_text(self, result) -> str:
        """CSS primary → markdown fallback."""
        html = result.html or ""
        # Try common content containers in order of specificity
        for pattern in [
            r'<article[^>]*>(.*?)</article>',
            r'<main[^>]*>(.*?)</main>',
            r'class="[^"]*(?:prose|content|question-body)[^"]*"[^>]*>(.*?)</(?:div|section)>',
        ]:
            match = re.search(pattern, html, re.I | re.S)
            if match:
                text = re.sub(r"<[^>]+>", " ", match.group(1))
                text = re.sub(r"\s+", " ", text).strip()
                if len(text) > 80:
                    return text[:4000]
        # Markdown fallback: first non-heading, non-empty lines
        md = result.markdown or ""
        lines = [l.strip() for l in md.split("\n")
                 if l.strip() and not l.strip().startswith("#")]
        return " ".join(lines[:15])[:4000]

    def _external_id_from_url(self, url: str) -> str:
        m = re.search(r"/questions/[^/]+/([^/?#]+)", url)
        return m.group(1) if m else ""
```

- [ ] **Step 2: Re-run unit tests — expect all 21 pass**

```bash
python scripts/test_scraper_helpers_v2.py
```

---

## Task 4: HelloInterviewScraper

**Files:**
- Modify: `scripts/scrape-interview-questions-v2.py` (append class)

**Interfaces:**
- Consumes: `ScraperBase._make_record`, `ScraperBase._detect_auth_gate`, `_polite_delay`, `MAX_HELLOINTERVIEW_PAGES`
- Produces: `HelloInterviewScraper` with `source_key = "hellointerview"`, `scrape(crawler) -> list[dict]`

---

- [ ] **Step 1: Append HelloInterviewScraper to the scraper file**

```python
# ── HelloInterviewScraper ──────────────────────────────────────────────────────

class HelloInterviewScraper(ScraperBase):
    """
    Scrapes paginated community questions from hellointerview.com.
    Follows detail pages for full public question text.
    Paginates up to MAX_HELLOINTERVIEW_PAGES pages.
    """

    source_key = "hellointerview"
    index_url = (
        "https://www.hellointerview.com/community/questions"
        "?sort=recentAndPopular&page=1"
    )

    _run_cfg = CrawlerRunConfig(wait_for="networkidle", page_timeout=30_000)
    _BASE = "https://www.hellointerview.com"

    async def scrape(self, crawler: AsyncWebCrawler) -> list[dict]:
        records: list[dict] = []
        all_links: list[tuple[str, str]] = []

        # Step 1: collect links from paginated listing
        for page_num in range(1, MAX_HELLOINTERVIEW_PAGES + 1):
            page_url = (
                f"{self._BASE}/community/questions"
                f"?sort=recentAndPopular&page={page_num}"
            )
            print(f"  [hellointerview] Listing page {page_num}: {page_url}")
            await _polite_delay()
            try:
                idx = await crawler.arun(url=page_url, config=self._run_cfg)
                if not idx.success:
                    print(f"  [hellointerview] Page {page_num} failed, stopping")
                    break
                links = self._discover_question_links(idx)
                if not links:
                    print(f"  [hellointerview] No questions on page {page_num}, stopping")
                    break
                all_links.extend(links)
                print(f"  [hellointerview] Page {page_num}: {len(links)} link(s)")
            except Exception as exc:
                print(f"  [hellointerview] Page {page_num} error: {exc}")
                break

        # Deduplicate links collected across pages
        seen_urls: set[str] = set()
        unique_links = []
        for title, url in all_links:
            if url not in seen_urls:
                seen_urls.add(url)
                unique_links.append((title, url))

        print(f"  [hellointerview] Total unique links: {len(unique_links)}")

        # Step 2: visit each detail page
        for title, url in unique_links:
            await _polite_delay()
            short = title[:45] + ("…" if len(title) > 45 else "")
            print(f"  [hellointerview] {short}", end=" … ", flush=True)
            try:
                page = await crawler.arun(url=url, config=self._run_cfg)
                if not page.success:
                    print("BLOCKED")
                    records.append(self._make_record(
                        title=title, source_url=url, scrape_status="blocked",
                    ))
                    continue

                md = page.markdown or ""
                if self._detect_auth_gate(md):
                    print("AUTH-GATED")
                    records.append(self._make_record(
                        title=title, source_url=url, scrape_status="auth_gated",
                    ))
                    continue

                question_text = self._extract_question_text(page, title)
                ext_id = self._external_id_from_url(url)
                status = "ok" if question_text else "empty_detail_page"
                records.append(self._make_record(
                    title=title, source_url=url,
                    question=question_text, external_id=ext_id,
                    scrape_status=status,
                ))
                print(f"OK ({len(question_text)} chars)")
            except Exception as exc:
                print(f"ERROR: {exc}")
                records.append(self._make_record(
                    title=title, source_url=url, scrape_status="parse_failed",
                ))

        return records

    def _discover_question_links(self, result) -> list[tuple[str, str]]:
        found: list[tuple[str, str]] = []
        seen: set[str] = set()
        for link in result.links.get("internal", []):
            href: str = link.get("href", "")
            text: str = link.get("text", "").strip()
            if "/community/questions/" in href and text and href not in seen:
                seen.add(href)
                abs_href = href if href.startswith("http") else self._BASE + href
                found.append((text, abs_href))
        return found

    def _extract_question_text(self, result, title: str) -> str:
        html = result.html or ""
        md = result.markdown or ""

        # CSS primary: article/main/question containers
        for pattern in [
            r'<article[^>]*>(.*?)</article>',
            r'<main[^>]*>(.*?)</main>',
            r'class="[^"]*(?:question|content|prose|body)[^"]*"[^>]*>(.*?)</(?:div|section)>',
        ]:
            match = re.search(pattern, html, re.I | re.S)
            if match:
                text = re.sub(r"<[^>]+>", " ", match.group(1))
                text = re.sub(r"\s+", " ", text).strip()
                if len(text) > 80:
                    return text[:4000]

        # Markdown fallback: body paragraphs after the title heading
        lines = md.split("\n")
        body: list[str] = []
        title_prefix = title[:20].lower()
        past_title = False
        for line in lines:
            stripped = line.strip()
            if not past_title:
                if title_prefix in stripped.lower():
                    past_title = True
                continue
            if stripped and not stripped.startswith("#"):
                body.append(stripped)
                if len(" ".join(body)) > 600:
                    break
        return " ".join(body)[:4000]

    def _external_id_from_url(self, url: str) -> str:
        m = re.search(r"/community/questions/([^/?#]+)", url)
        return m.group(1) if m else ""
```

- [ ] **Step 2: Re-run unit tests — expect all 21 pass**

```bash
python scripts/test_scraper_helpers_v2.py
```

---

## Task 5: Orchestrator + output + validation

**Files:**
- Modify: `scripts/scrape-interview-questions-v2.py` (append `run_all`, `_validate`, `if __name__ == "__main__"`)

**Interfaces:**
- Consumes: All three scraper classes, `OUTPUT_DIR`, `BrowserConfig`, `AsyncWebCrawler`
- Produces: `run_all()` async function; `data/interview-questions.scraped.json`; `data/interview-questions.scrape-report.json`

---

- [ ] **Step 1: Append orchestrator, validation, and entry point to the scraper file**

```python
# ── Orchestrator ───────────────────────────────────────────────────────────────

async def run_all() -> None:
    """
    Main runner. Runs all scrapers, deduplicates, writes output files.
    Safe to rerun — output is fully overwritten each time.
    """
    t0 = time.time()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = OUTPUT_DIR / "interview-questions.scraped.json"
    report_path = OUTPUT_DIR / "interview-questions.scrape-report.json"

    scrapers: list[ScraperBase] = [
        GetsdereadyScraper(),
        GreatFrontendScraper(),
        HelloInterviewScraper(),
    ]

    browser_cfg = BrowserConfig(headless=True, verbose=False)
    all_raw: list[dict] = []
    per_source: dict[str, dict] = {
        s.source_key: {"scraped": 0, "skippedDuplicates": 0, "errors": 0}
        for s in scrapers
    }
    blocked: list[str] = []
    parse_errors: list[str] = []

    async with AsyncWebCrawler(config=browser_cfg) as crawler:
        for scraper in scrapers:
            print(f"\n→ Running {scraper.source_key} scraper …")
            try:
                raw = await scraper.scrape(crawler)
            except Exception as exc:
                print(f"  [ERROR] {scraper.source_key} scraper crashed: {exc}")
                raw = []

            for rec in raw:
                status = rec.get("metadata", {}).get("scrapeStatus", "ok")
                if status == "blocked":
                    blocked.append(rec["sourceUrl"])
                    per_source[scraper.source_key]["errors"] += 1
                elif status == "parse_failed":
                    parse_errors.append(rec["sourceUrl"])
                    per_source[scraper.source_key]["errors"] += 1
                per_source[scraper.source_key]["scraped"] += 1

            all_raw.extend(raw)

    # ── Dedup: source:slug key, first-seen wins; discard empty titles ──────────
    seen_keys: set[str] = set()
    deduped: list[dict] = []
    for rec in all_raw:
        title = rec.get("title", "").strip()
        if not title:
            continue
        slug = rec.get("metadata", {}).get("slug", "")
        source = rec.get("source", "")
        key = f"{source}:{slug}"
        if key in seen_keys:
            per_source.get(source, {}).update(
                {"skippedDuplicates": per_source.get(source, {}).get("skippedDuplicates", 0) + 1}
            )
            continue
        seen_keys.add(key)
        deduped.append(rec)

    total_skipped = sum(s["skippedDuplicates"] for s in per_source.values())
    content_available = sum(
        1 for r in deduped if r.get("metadata", {}).get("contentAvailable")
    )
    index_only = len(deduped) - content_available
    total_errors = sum(s["errors"] for s in per_source.values())

    # ── Write output files ─────────────────────────────────────────────────────
    output_path.write_text(
        json.dumps(deduped, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalScraped": len(deduped),
        "perSource": per_source,
        "contentAvailableCount": content_available,
        "indexOnlyCount": index_only,
        "blocked": blocked,
        "parseErrors": parse_errors,
    }
    report_path.write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    # ── Summary ────────────────────────────────────────────────────────────────
    elapsed = time.time() - t0
    print(f"\n{'=' * 45}")
    print("=== Interview Questions Scraper v2 ===")
    print(f"{'=' * 45}")
    print("\nSource breakdown:")
    for src, stats in per_source.items():
        src_recs = [r for r in deduped if r["source"] == src]
        with_content = sum(1 for r in src_recs if r.get("metadata", {}).get("contentAvailable"))
        print(
            f"  {src:<22}: {stats['scraped']:>4} records "
            f"({with_content:>3} with content, "
            f"{stats['scraped'] - with_content:>3} index/gated)"
        )
    print(f"\nTotal scraped     : {len(deduped)}")
    print(f"Duplicates skipped: {total_skipped}")
    print(f"Errors            : {total_errors}")
    print(f"\nOutput  : {output_path}")
    print(f"Report  : {report_path}")
    print(f"Elapsed : {elapsed:.1f}s")

    _validate(deduped, output_path)


def _validate(records: list[dict], output_path: Path) -> None:
    print("\nValidation:")
    try:
        loaded = json.loads(output_path.read_text(encoding="utf-8"))
        assert isinstance(loaded, list), "top-level must be array"
        print("  [✓] Valid JSON")
    except Exception as e:
        print(f"  [✗] JSON error: {e}")
        return
    empty = [r for r in loaded if not r.get("title")]
    if empty:
        print(f"  [✗] {len(empty)} records with empty title")
    else:
        print("  [✓] No empty-title records")
    print("  [✓] Frontend/backend files not changed (scraper-only run)")


if __name__ == "__main__":
    asyncio.run(run_all())
```

- [ ] **Step 2: Verify file has no syntax errors**

```bash
python -m py_compile scripts/scrape-interview-questions-v2.py
```

Expected: no output (clean compilation). If you get `SystemExit` from the crawl4ai import guard that's fine — it means the syntax is valid. To suppress it:

```bash
python -c "
import sys, types
sys.modules['crawl4ai'] = types.SimpleNamespace(
    AsyncWebCrawler=object, BrowserConfig=object, CrawlerRunConfig=object
)
import importlib.util
spec = importlib.util.spec_from_file_location('x', 'scripts/scrape-interview-questions-v2.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
print('Syntax OK')
"
```

Expected: `Syntax OK`

- [ ] **Step 3: Re-run all unit tests — expect 21/21 pass**

```bash
python scripts/test_scraper_helpers_v2.py
```

Expected: `Ran 21 tests … OK`

---

## Task 6: Install crawl4ai + full integration run + validation

**Files:**
- Generated: `data/interview-questions.scraped.json`
- Generated: `data/interview-questions.scrape-report.json`

---

- [ ] **Step 1: Install crawl4ai (one-time)**

```bash
pip install "crawl4ai[all]"
```

Expected: successful install. May take 1-3 minutes.

- [ ] **Step 2: Run crawl4ai browser setup (one-time)**

```bash
crawl4ai-setup
```

Expected: Playwright browser downloaded. Output similar to:
```
[crawl4ai] Installing Playwright browsers…
✓ Chromium installed
```

- [ ] **Step 3: Run the scraper**

```bash
python scripts/scrape-interview-questions-v2.py
```

Expected (approximate — will vary by site availability):
```
→ Running getsdeready scraper …
  [getsdeready] Crawling index: https://getsdeready.com/interview-questions/
  [getsdeready] Found N sub-page(s)
  ...

→ Running greatfrontend scraper …
  [greatfrontend] Crawling index: https://www.greatfrontend.com/questions
  [greatfrontend] Found N question link(s)
  ...

→ Running hellointerview scraper …
  [hellointerview] Listing page 1: ...
  ...

=============================================
=== Interview Questions Scraper v2 ===
=============================================

Source breakdown:
  getsdeready          :  XX records ( XX with content, XX index/gated)
  greatfrontend        :  XX records (  X with content, XX index/gated)
  hellointerview       :  XX records ( XX with content,  X index/gated)

Total scraped     : XXX
Duplicates skipped: X
Errors            : XX

Output  : data/interview-questions.scraped.json
Report  : data/interview-questions.scrape-report.json
Elapsed : XXX.Xs

Validation:
  [✓] Valid JSON
  [✓] No empty-title records
  [✓] Frontend/backend files not changed (scraper-only run)
```

- [ ] **Step 4: Spot-check the output JSON**

```bash
python -c "
import json
data = json.load(open('data/interview-questions.scraped.json'))
print(f'Total records: {len(data)}')
print(f'Sources: {set(r[\"source\"] for r in data)}')
print(f'contentAvailable=True: {sum(1 for r in data if r[\"metadata\"][\"contentAvailable\"])}')
print()
print('Sample record:')
print(json.dumps(data[0], indent=2))
"
```

Expected: Valid output showing all three sources, reasonable record count, and a well-formed sample record.

- [ ] **Step 5: Confirm no app files were modified**

```bash
python -c "
from pathlib import Path
protected = [
    'scripts/scrape-interview-questions.py',
    'public/data/interview-questions.json',
    'src', 'app', 'prisma', 'next.config.ts',
    'package.json', 'package-lock.json',
]
for p in protected:
    path = Path(p)
    if path.exists():
        print(f'EXISTS (expected): {p}')
"
```

Expected: all listed paths still exist and were not modified. The only new files should be:
- `scripts/scrape-interview-questions-v2.py`
- `scripts/test_scraper_helpers_v2.py`
- `data/interview-questions.scraped.json`
- `data/interview-questions.scrape-report.json`

---

## Self-Review Against Spec

| Spec requirement | Covered by |
|-----------------|------------|
| Three sources scraped | Tasks 2, 3, 4 |
| CSS selector extraction primary | `_css_extract`, `_extract_question_text` in all scrapers |
| Markdown/regex fallback | `_markdown_extract`, `_extract_question_text` fallback blocks |
| No LLM extraction | Enforced by architecture — no LLM imports anywhere |
| No auth/paywall bypass | `_detect_auth_gate` + no credential code |
| `metadata.contentAvailable` boolean | `_make_record` Task 1 |
| `answer: ""` default, only if clearly public | `_make_record` default; no answer extraction in v1 |
| `sourceUrl` for attribution only, not redirect | Schema only stores URL; no redirect logic added |
| Polite delay + jitter | `_polite_delay()` Task 5 |
| Dedup by source:slug | Orchestrator dedup block Task 5 |
| Discard empty-title records | Orchestrator dedup loop + `_validate` |
| Scrape report with counts, blocked, errors | `run_all()` report dict Task 5 |
| Stdout validation summary | `_validate()` Task 5 |
| Safe to rerun (full overwrite) | `output_path.write_text(...)` overwrites Task 5 |
| Old scraper untouched | No step modifies it |
| Frontend/backend untouched | No step modifies app/src/prisma |
| `data/` dir created if not exists | `OUTPUT_DIR.mkdir(parents=True, exist_ok=True)` |
| Rerun note at top of file | Docstring at top of scraper file |
| `getsdeready`: topic page IS content page | `GetsdereadyScraper` — no detail page crawled |
| `getsdeready`: deeper links recorded as sourceUrl, not crawled | `_discover_sub_pages` records URL; no recursive crawl |
