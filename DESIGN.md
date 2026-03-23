# ResumeBot — Design Document

## 1. System Overview

ResumeBot is a three-tier application:

| Tier | Technology | Port |
|---|---|---|
| Frontend | Next.js 16 App Router (Turbopack) | 3000 |
| Backend | Express.js | 3007 |
| PDF Service | FastAPI (Python) | 8100 |

---

## 2. Frontend Routes

| Route | Component | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Homepage |
| `/create` | `CreateResumeSimple` | Upload resume → ATS optimize → download PDF/DOCX |
| `/portfolio` | `CreatePortfolioPage` | Upload resume → generate portfolio → publish |
| `/p/[username]` | `PortfolioPage` | Public portfolio viewer |
| `/ats-optimize` | — | ATS score checker |
| `/optimize` | — | Resume optimizer |
| `/build/[templateId]` | — | Template builder |
| `/live-builder/[templateId]` | — | Live template editor |
| `/templates` | — | Template gallery |
| `/job-tracker` | — | Job application tracker |
| `/profile` | — | User profile / account settings |
| `/login` / `/signup` | — | Auth pages |
| `/blog` / `/blog/[slug]` | — | Blog |
| `/contact-us` | — | Contact form |

---

## 3. Backend API Routes

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/user/create` | Sign up |
| POST | `/api/user/login` | Login |
| POST | `/api/user/logout` | Logout |
| GET | `/api/user/profile` | Get logged-in user profile |
| GET | `/api/user/account` | Get full account data |
| PUT | `/api/user/account/basic` | Update basic info |
| PUT | `/api/user/account/career` | Update career details |
| PUT | `/api/user/account/password` | Change password |

### Resume Extraction & Optimization
| Method | Route | Description |
|---|---|---|
| POST | `/api/extract-resume` | PDF upload → structured JSON (Gemini Vision) |
| POST | `/api/parse-resume-text` | Raw text → structured JSON |
| POST | `/api/generate-resume` | Generate optimized resume from JSON + JD |
| POST | `/api/generate-job-resume` | Job-specific resume generation |
| POST | `/api/optimize-resume` | Full resume optimization |
| POST | `/api/optimize-resume-stream` | Streaming resume optimization |
| POST | `/api/ats-optimize` | ATS score + keyword analysis |
| POST | `/api/polish-resume-text` | Polish resume text |

### Output Generation
| Method | Route | Description |
|---|---|---|
| POST | `/api/generate-pdf` | Generate PDF from resume JSON |
| POST | `/api/generate-docx` | Generate DOCX from resume JSON |

### Portfolio
| Method | Route | Description |
|---|---|---|
| POST | `/api/portfolio` | Save/publish portfolio |
| GET | `/api/portfolio/:username` | Fetch published portfolio |
| DELETE | `/api/portfolio/:slug` | Delete portfolio |

### Jobs
| Method | Route | Description |
|---|---|---|
| POST | `/api/job/applications` | Add job application |
| GET | `/api/job/applications` | List job applications |
| PUT | `/api/job/applications/:jobId` | Edit application |
| PUT | `/api/job/application/status/update/:jobId` | Update status |
| POST | `/api/job/application/delete` | Delete application |

### Payments
| Method | Route | Description |
|---|---|---|
| GET | `/api/payment/charge` | Create payment order (Cashfree) |
| POST | `/api/payment/verify` | Verify payment |
| POST | `/api/initiate-payment` | Initiate payment flow |

### Other
| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/contact-us` | Contact form submission |
| GET | `/api/blog/posts` | Blog posts |
| GET | `/api/target-roles` | Target role suggestions |
| GET | `/api/hr/list/demo` | HR contact demo list |

---

## 4. AI / API Usage

### Active Flows

| Flow | Service File | API | Model | Env Key |
|---|---|---|---|---|
| PDF extraction (resume + portfolio upload) | `geminiPDFExtractor.js` | Google Gemini Vision | `gemini-2.5-flash` | `GEMINI_API_KEY` |
| ATS optimization | `atsResumeOptimizer.js` | Google Gemini | `GEMINI_ATS_MODEL` (env) | `GEMINI_API_KEY` |
| Resume optimization (enhanced) | `enhancedResumeOptimizer.js` | Google Gemini | `GEMINI_MODEL` (env) | `GEMINI_API_KEY` |
| Resume optimization (standard) | `resumeOptimizer.js` | Google Gemini | `GEMINI_MODEL` (env) | `GEMINI_API_KEY` |
| Resume polisher | `kimiResumePolisher.js` | Google Gemini | `GEMINI_POLISH_MODEL` (env, default `gemini-1.5-pro`) | `GEMINI_POLISH_API_KEY` |
| Job-specific resume | `jobResumeGenerator.js` | Google Gemini | — | `GEMINI_API_KEY` |

### Inactive / Unused

| Service File | API | Key | Notes |
|---|---|---|---|
| `geminiSectionExtractor.js` | Cohere | `COHERE_API_KEY` | Rewritten, not wired to any route |
| `mistralOcrClient.js` | Mistral | `MISTRAL_API_KEY` | Not wired to any active route |

---

## 5. Extraction Pipeline (Current — Gemini Vision)

```
Browser uploads PDF
        │
        ▼
POST /api/extract-resume
        │
        ▼
geminiPDFExtractor.js
  → Reads PDF as base64
  → Sends to Gemini Vision (gemini-2.5-flash)
  → Returns structured JSON
        │
        ▼
normalizeParserResponse()   ← cleans up dates, maps fields
        │
        ▼
postProcessResumeData()     ← deduplication, formatting
        │
        ▼
{ success: true, data: { basics, experience, education, skills, projects, ... } }
        │
        ▼
Frontend: extractResumeData()
  → parserToV2()            ← normalizes to ResumeJSONv2
  → convertToPortfoliolyFormat()  ← maps to portfolio schema (portfolio flow only)
```

---

## 6. Python PDF Service

- **Framework**: FastAPI
- **Port**: 8100
- **Library**: PyMuPDF (`pymupdf4llm`) — requires PyMuPDF >= 1.26.6
- **Start command**: `cd pdf-service && uvicorn main:app --port 8100 --reload`
- **Endpoints**:
  - `GET /health` — health check
  - `POST /extract` — extracts raw text + page count from PDF
- **Current usage**: Not used in the active extraction pipeline (Gemini Vision reads PDFs directly). Available as fallback.

---

## 7. Environment Variables

| Variable | Used By | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | `geminiPDFExtractor.js`, `atsResumeOptimizer.js`, `enhancedResumeOptimizer.js`, `resumeOptimizer.js` | Primary Gemini API key |
| `GEMINI_MODEL` | `enhancedResumeOptimizer.js`, `resumeOptimizer.js` | Gemini model name (e.g. `gemini-2.5-flash`) |
| `GEMINI_POLISH_API_KEY` | `kimiResumePolisher.js` | Separate key for resume polishing |
| `GEMINI_POLISH_MODEL` | `kimiResumePolisher.js` | Polisher model (default `gemini-1.5-pro`) |
| `MISTRAL_API_KEY` | `mistralOcrClient.js` (unused) | Mistral API key |
| `COHERE_API_KEY` | `geminiSectionExtractor.js` (unused) | Cohere API key |
| `OPENAI_API_KEY` | Unused | Was ModelsLab key, out of credits |
| `JSEARCH_API_KEY` | Job board | RapidAPI JSearch |
| `DATABASE_URL` | MongoDB | MongoDB Atlas connection string |
| `JWT_SECRET` / `ACCESS_TOKEN_SECRET` | Auth | JWT signing |
| `PYTHON_PDF_SERVICE_URL` | `pythonParserClient.js` | Python service base URL (default `http://localhost:8100`) |
| `NEXT_PUBLIC_API_URL` | Frontend | Backend base URL for client-side calls |
| `SEND_GRID_API_KEY` | Email | SendGrid email delivery |

---

## 8. Data Flow — /create (ATS Resume Flow)

```
/create page (CreateResumeSimple)
  1. Upload PDF  → POST /api/extract-resume  → Gemini Vision → structured JSON
  2. Paste text  → POST /api/parse-resume-text → structured JSON
  3. Enter JD    → POST /api/generate-resume  → Gemini → optimized resume JSON
  4. Download    → POST /api/generate-pdf / /api/generate-docx
  5. Portfolio   → custom mapping → POST /api/portfolio → saved to MongoDB
```

## 9. Data Flow — /portfolio (Portfolio Flow)

```
/portfolio page (CreatePortfolioPage)
  1. Upload PDF  → POST /api/extract-resume  → Gemini Vision → structured JSON
  2. parserToV2() → convertToPortfoliolyFormat() → ResumeData schema
  3. Edit in ResumeDataEditor / Preview in PortfolioPreview / Raw JSON view
  4. Publish     → POST /api/portfolio → saved to MongoDB
  5. Public URL  → GET /p/:username → PortfolioPage
```

---

## 10. Key Frontend Services & Types

| File | Purpose |
|---|---|
| `src/services/resumeOptimizerApi.ts` | All API calls to backend (extractResumeData, buildApiUrl, etc.) |
| `src/types/resume.ts` | All TypeScript types + `parserToV2()` normalizer |
| `src/utils/resume-converter.ts` | `convertToPortfoliolyFormat()` — maps v2 to portfolio schema |
| `src/components/create-resume-simple.tsx` | `/create` page — full ATS resume flow |
| `src/components/create-portfolio-page.tsx` | `/portfolio` page — portfolio creation flow |
| `src/components/portfolio-preview.tsx` | Renders the portfolio UI |
| `src/components/edit/ResumeDataEditor.tsx` | Form editor for resume data |




How it works: Uses mistral-ocr-latest which is a purpose-built document OCR model. Unlike Gemini      
  Vision (general multimodal), Mistral OCR is specifically trained for PDF layout understanding. It does
   both OCR and structured extraction in a single call using JSON schema enforcement, then patches gaps 
  using the raw markdown fallback (patchFromMarkdown).

  Why it could be better than Gemini for these specific issues:
  - Mistral OCR is purpose-built for documents — less likely to misread phone digits or skip locations  
  - JSON schema enforcement means the output structure is guaranteed
  - Already has markdown patching logic for phone, email, education GPA, experience location, project   
  dates

  What it still won't fix automatically:
  - Text normalization (A/B Testing, BLoC, TensorFlow, 3D Printing, etc.) — the annotation prompt       
  doesn't have those rules yet
  - Those would need to be added to ANNOTATION_PROMPT in mistralOcrClient.js

  To switch: Just update the import and route in server.js — normalizeParserResponse() already handles  
  the portfolioly schema that Mistral returns (work_experiences, personal_info, etc.).

  My take: Worth trying. Mistral OCR was built specifically for this problem. The phone digit issue and 
  location misses are exactly the kind of things a purpose-built OCR model handles better than a general
   vision model.