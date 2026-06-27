# Interview Questions — Backend Import Handoff

**Date:** 2026-06-27  
**Source scraped:** getsdeready.com  
**Prepared by:** scraper pipeline (no frontend/backend files touched)

---

## 1. Data Files

| File | Size | Description |
|------|------|-------------|
| `data/interview-questions.scraped.json` | 948 KB | Primary import file — 20 companies, 1,187 questions |
| `data/interview-questions.scrape-report.json` | 4 KB | Run metadata, per-company counts, validation summary |

Both files are relative to the `resumeassist/` project root.

---

## 2. JSON Schema

### Top-level envelope

```json
{
  "generatedAt": "2026-06-27T17:53:52.579320+00:00",
  "source": "getsdeready",
  "sourceRoot": "https://getsdeready.com",
  "companies": [ /* array of company objects */ ]
}
```

### Company object

```json
{
  "company":       "Google",
  "slug":          "google",
  "sourceUrl":     "https://getsdeready.com/interview/google/",
  "questionCount": 25,
  "questions":     [ /* array of question objects */ ]
}
```

### Question object

```json
{
  "title":      "Given an array of integers, find the length of the longest consecutive elements sequence?",
  "question":   "Given an array of integers, find the length of the longest consecutive elements sequence running in O(n) time. Example 1: Input: nums = [100,4,200,1,3,2] Output: 4 ...",
  "topic":      "dsa",
  "difficulty": null,
  "answer":     null
}
```

---

## 3. Total Companies & Questions

| Company | Questions |
|---------|----------:|
| LinkedIn | 174 |
| Uber | 149 |
| Atlassian | 124 |
| Expedia | 108 |
| Databricks | 99 |
| Amazon | 97 |
| Swiggy | 93 |
| Flipkart | 92 |
| Wayfair | 39 |
| Google | 25 |
| Zoho | 25 |
| Intuit | 23 |
| Jiohotstar | 23 |
| PhonePe | 21 |
| Salesforce | 20 |
| Adobe | 19 |
| Microsoft | 18 |
| Meta | 16 |
| Stripe | 13 |
| Rippling | 9 |
| **Total** | **1,187** |

---

## 4. Known Null Fields

| Field | Value | Reason |
|-------|-------|--------|
| `difficulty` | `null` | getsdeready.com does not tag difficulty on question pages. Do not infer — leave for manual curation or future enrichment pass. |
| `answer` | `null` | Answer content is not publicly available on getsdeready.com without authentication. |

These fields are intentional nulls, not missing data. The import script and MongoDB model should accept them.

---

## 5. Topic Inference Rules

Topic was inferred from question text using keyword matching. First match wins; unmatched questions have `topic: null`.

```
"dsa"           keywords: array, string, tree, graph, dynamic programming, dp,
                           linked list, stack, queue, heap, hash, sort, binary search,
                           recursion, backtrack, greedy, sliding window, two pointer,
                           trie, bit manipulation, divide and conquer

"system-design" keywords: design a, system design, distributed system, scalab,
                           microservice, load balancer, url shortener, rate limit,
                           chat system, notification system, pub-sub, message queue,
                           cdn, consistent hashing

"lld"           keywords: low level design, lld, class diagram, design pattern,
                           factory pattern, singleton, observer pattern, solid principle,
                           parking lot, elevator, chess, library management

"behavioral"    keywords: tell me about yourself, describe a time, your greatest strength,
                           your greatest weakness, why do you want, conflict with,
                           leadership example

null            no keyword matched
```

Topic inference is a first-pass heuristic. Override individually as content is reviewed.

---

## 6. Suggested MongoDB Model

```js
// models/InterviewQuestion.js

const questionSchema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  question:   { type: String, required: true },
  topic:      { type: String, enum: ['dsa', 'system-design', 'lld', 'behavioral', null], default: null },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard', null], default: null },
  answer:     { type: String, default: null },
}, { _id: true });

const companySchema = new mongoose.Schema({
  company:       { type: String, required: true },
  slug:          { type: String, required: true, unique: true, index: true },
  sourceUrl:     { type: String, required: true },
  questionCount: { type: Number, default: 0 },
  questions:     [questionSchema],
  source:        { type: String, default: 'getsdeready' },
  importedAt:    { type: Date,   default: Date.now },
}, {
  collection: 'interview_companies',
  timestamps: true,
});

// Index for company-level lookups and question search
companySchema.index({ slug: 1 });
companySchema.index({ 'questions.topic': 1 });
companySchema.index(
  { company: 'text', 'questions.title': 'text', 'questions.question': 'text' },
  { name: 'full_text_search' }
);

module.exports = mongoose.model('InterviewCompany', companySchema);
```

> **Note:** If question volume grows significantly (10k+), consider splitting `questions` into a separate `InterviewQuestion` collection with a `companySlug` foreign key. At 1,187 questions across 20 companies (~60 avg per company), embedding is fine.

---

## 7. Suggested Import Script

```js
// scripts/import-interview-questions.js
// Run once: node scripts/import-interview-questions.js

const mongoose = require('mongoose');
const fs       = require('fs');
const path     = require('path');

const DATA_FILE = path.join(__dirname, '../data/interview-questions.scraped.json');

async function importQuestions() {
  await mongoose.connect(process.env.MONGODB_URI);

  const raw  = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  const { companies } = raw;

  let inserted = 0, skipped = 0;

  for (const co of companies) {
    const exists = await InterviewCompany.findOne({ slug: co.slug });
    if (exists) {
      console.log(`SKIP (already exists): ${co.company}`);
      skipped++;
      continue;
    }
    await InterviewCompany.create({
      company:       co.company,
      slug:          co.slug,
      sourceUrl:     co.sourceUrl,
      questionCount: co.questionCount,
      questions:     co.questions,
      source:        'getsdeready',
    });
    console.log(`INSERTED: ${co.company} (${co.questionCount} questions)`);
    inserted++;
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

importQuestions().catch(console.error);
```

Run with: `node scripts/import-interview-questions.js`  
Safe to rerun — skips companies that already exist by slug.

---

## 8. Suggested API Endpoints

All endpoints return JSON. Authentication requirements are at the backend team's discretion.

### `GET /api/interview-questions/companies`
Returns the list of all companies with counts. No question text.

```json
{
  "companies": [
    { "company": "Google", "slug": "google", "questionCount": 25 },
    ...
  ],
  "total": 20
}
```

### `GET /api/interview-questions/company/:slug`
Returns a single company record including all questions.

```json
{
  "company": "Google",
  "slug": "google",
  "sourceUrl": "https://getsdeready.com/interview/google/",
  "questionCount": 25,
  "questions": [ ... ]
}
```

### `GET /api/interview-questions/company/:slug/questions`
Returns only the questions array for a company. Supports optional `?topic=dsa` filter.

```json
{
  "company": "Google",
  "slug": "google",
  "questions": [ ... ]
}
```

### `GET /api/interview-questions/search?q=<term>`
Full-text search across all question titles and text. Requires MongoDB text index (defined above).

```json
{
  "results": [
    {
      "company": "Google",
      "slug": "google",
      "question": { "title": "...", "question": "...", "topic": "dsa" }
    }
  ],
  "count": 7,
  "query": "binary tree"
}
```

---

## 9. Frontend Consumption Note

**The frontend must NOT read `data/interview-questions.scraped.json` directly.**

The scraped JSON is a one-time import artifact. Once the data is in MongoDB:
- Frontend fetches from the backend API endpoints above
- Backend owns pagination, filtering, and auth gating
- The `data/` directory is a staging area, not a served asset

---

## 10. Validation Summary

| Check | Result |
|-------|--------|
| Valid JSON | PASS |
| Top-level `companies` array present | PASS |
| No empty `question` fields | PASS |
| No garbage records (nav chrome, promo text) | PASS |
| All records have `company`, `slug`, `sourceUrl` | PASS |
| Companies scraped successfully | 20 / 20 |
| Companies failed | 0 |
| Companies empty | 0 |
| Frontend files touched | NONE |
| Backend files touched | NONE |
| package.json modified | NO |
| Old scraper modified | NO |
| `public/data/interview-questions.json` modified | NO |

---

## 11. Files Created by This Pipeline

```
scripts/scrape-getsdeready-full.py          Full production scraper
scripts/scrape-getsdeready-sample.py        3-company validation sample
scripts/inspect-getsdeready.py              DOM inspection tool (one-time)
scripts/inspect-getsdeready2.py             DOM inspection tool v2 (one-time)
data/interview-questions.scraped.json       PRIMARY IMPORT FILE
data/interview-questions.scrape-report.json Run metadata and stats
docs/superpowers/specs/2026-06-26-interview-questions-scraper-v2-design.md
docs/superpowers/plans/2026-06-26-interview-questions-scraper-v2.md
docs/superpowers/handoffs/interview-questions-backend-handoff.md
```

Files NOT modified: any file under `src/`, `app/`, `prisma/`, `public/`,
`package.json`, `package-lock.json`, `scripts/scrape-interview-questions.py`.
