/**
 * Resume extractor using Gemini Vision — sends the PDF directly as inline data.
 * Bypasses text extraction entirely, so multi-column layouts, special fonts,
 * and sidebar designs all work correctly.
 */

import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const TIMEOUT_MS = 90_000;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  return new GoogleGenerativeAI(apiKey);
}

function buildPrompt() {
  return `You are a resume parser. Extract ALL structured data from this resume PDF.

OUTPUT STRUCTURE — return a single JSON object with exactly these top-level fields:
  basics, experience[], projects[], education[], skills[], certifications[], volunteer[], achievements[], coursework[], extraSections[]

GENERAL RULES:
- Read the PDF visually — do not be misled by multi-column layouts or sidebar designs.
- Extract EVERYTHING visible. Do not skip any data.
- Do NOT invent data. Only extract what is explicitly written.
- Phone: read each digit individually — never drop, transpose, or merge digits (e.g. "+91-7878415078" must stay exactly that).
- basics.title and basics.summary must come from the header/profile section only — never infer from bullets or experience.

SECTION DETECTION — map these common heading variations:
- experience[]:  "Experience", "Work Experience", "Professional Experience", "Employment History", "Career History"
- projects[]:    "Projects", "Personal Projects", "Side Projects", "Notable Projects", "Key Projects"
- education[]:   "Education", "Academic Background", "Academic Qualifications"
- skills[]:      "Skills", "Technical Skills", "Tech Stack", "Core Competencies", "Technologies"
- volunteer[]:   "Organizations", "Volunteer", "Community", "Activities", "Extracurricular"
- extraSections[]: anything not matching the above

PROJECTS — boundary and metadata rules:
- Every project is a SEPARATE entry. NEVER merge two projects into one entry.
- A project title is a short phrase (1–5 words) inside the Projects section, NOT a section header (Skills, Experience, Education, etc.) and NOT a job title.
- Each project must have its own name, description, bullets[], and tech[].
- dates: use the date range of the associated company if the project is inside a company block (e.g. Bijak Mandi → "July 2020 - Present").
- link: website, App Store, Play Store, or product URL — any URL that is NOT a GitHub/GitLab/Bitbucket repo. Bare domains count (e.g. "cointopper.com"). If the label says "Link:", "Website:", or "URL:" followed by an actual URL, extract the URL — not the label word.
- github: GitHub, GitLab, or Bitbucket repository URL only. Leave empty if no repo URL is present.
- role: "Professional" if inside a company block, "Personal" for side projects.
- Preserve impact metrics (downloads, users, revenue) in bullets[] exactly as written.

SKILLS — format each category as { "name": "...", "items": ["...", "..."] }:
- name: the category heading exactly as written (e.g. "Expert", "Senior", "High Knowledge", "Tinkering", "Languages").
- items[]: individual skill names only, one per entry.
- Apply all text normalisation below to every item.

DATES — always capture full date ranges:
- Always include BOTH start and end (e.g. "July 2020 - Present", "2010 - 2014"). Never output a date without a year.
- Education: if only graduation year shown and it is a 4-year degree, subtract 4 for start year (e.g. 2014 → "2010 - 2014").
- GPA/CGPA: look anywhere in the education block. Preserve label exactly (e.g. "CGPA: 7.69") and put in details[].

LOCATION — for every experience entry:
- Location may appear: next to the company name, next to the job title, at the end of the line, or in parentheses (e.g. "(Remote)").
- Common formats: "Gurugram, India", "Ahmedabad, India", "Remote", "Gurugram, India (Remote)".
- Never leave location empty if it is visible anywhere in that job block.

TEXT NORMALISATION — apply every correction below without exception:
- "Al" (A + lowercase l) → "AI" for Artificial Intelligence; "Gen Al" → "Gen AI"; "Al Enthusiast" → "AI Enthusiast"
- "A, B Testing" → "A/B Testing"  ← this exact string must become "A/B Testing"
- "Neo-6,000,000 GPS" → "Neo-6M GPS"  ← strip thousand-separator commas from part numbers
- "Tail scale" or "tail scale" → "Tailscale"
- "3d Printing" → "3D Printing"
- "go" as a standalone skill → "Go" (programming language)
- "Rest API" → "REST API"; "GIT" → "Git"; "fine tuning" → "Fine-tuning"
- "BLOC" → "BLoC"; "tensorflow" → "TensorFlow"; "Chat GPT" → "ChatGPT"
- "Koltin" → "Kotlin"; "Olama" → "Ollama"; "Riverpods" → "Riverpod"; "Thinkwlk" → "Thinkwik"
- "AWS lambda" → "AWS Lambda"; "Github" → "GitHub"
- Trailing punctuation on tech names → remove (e.g. "Websockets." → "Websockets")

- Company names with pipe (e.g. "Company A | Company B") — keep as-is.`;
}

// ── Sanitisation helpers ──────────────────────────────────────────────────────

function str(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

function strArr(v) {
  if (!Array.isArray(v)) return [];
  return v.map(str).filter(Boolean);
}

// Guaranteed code-level normalisation — runs after Gemini extraction
// Handles cases where the model ignores prompt instructions
const SKILL_NORMALIZATIONS = [
  [/\bA,\s*B\s+Testing\b/gi,           'A/B Testing'],
  [/\bNeo-6[,\d]+\s*GPS\b/gi,          'Neo-6M GPS'],
  [/\bTail\s*scale\b/gi,               'Tailscale'],
  [/\b3[Dd]\s+[Pp]rinting\b/g,         '3D Printing'],
  [/\btensorflow\b/gi,                  'TensorFlow'],
  [/\bGIT\b/g,                          'Git'],
  [/\bRest\s+API\b/gi,                  'REST API'],
  [/\bfine[\s-]tuning\b/gi,             'Fine-tuning'],
  [/\bBLOC\b/g,                         'BLoC'],
  [/\bChat\s*GPT\b/gi,                  'ChatGPT'],
  [/\bKoltin\b/gi,                      'Kotlin'],
  [/\bOlama\b/gi,                       'Ollama'],
  [/\bRiverpods\b/gi,                   'Riverpod'],
  [/\bThinkwlk\b/gi,                    'Thinkwik'],
  [/\bGithub\b/g,                       'GitHub'],
  [/\bAWS\s+[Ll]ambda\b/g,             'AWS Lambda'],
  [/\b([Gg]en)\s+[Aa][Ll]\b/g,         'Gen AI'],
  [/\b([Aa])\s*[Ll]\s+([Ee]nthusiast)\b/g, 'AI Enthusiast'],
];

function normalizeSkillName(s) {
  let result = s;
  for (const [pattern, replacement] of SKILL_NORMALIZATIONS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

// Filter basics.links — remove label-only values like "Link", "Website", "URL"
// and keep only actual URLs or domain-like strings
const LINK_LABEL_RE = /^(link|website|url|portfolio|github|linkedin|twitter|email|phone|contact)$/i;
function filterLinks(links) {
  if (!Array.isArray(links)) return [];
  return links
    .map(str)
    .filter(v => v && !LINK_LABEL_RE.test(v.trim()))
    .filter(Boolean);
}

function sanitizeExperience(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(e => ({
    company: str(e?.company),
    role: str(e?.role),
    location: str(e?.location),
    dates: str(e?.dates),
    bullets: strArr(e?.bullets),
    tech: strArr(e?.tech),
  }));
}

function sanitizeEducation(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(e => ({
    school: str(e?.school),
    degree: str(e?.degree),
    location: str(e?.location),
    dates: str(e?.dates),
    details: strArr(e?.details),
  }));
}

function sanitizeProjects(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(p => ({
    name: str(p?.name),
    description: str(p?.description),
    bullets: strArr(p?.bullets),
    tech: strArr(p?.tech),
    link: str(p?.link),
    github: str(p?.github),
    role: str(p?.role),
    dates: str(p?.dates),
    location: str(p?.location),
  }));
}

function sanitizeSkills(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(s => {
    const raw = strArr(s?.items).map(normalizeSkillName);
    // Merge split "A/B"-style items: Gemini may split "A, B Testing" → ["A", "B Testing"]
    const items = [];
    for (let i = 0; i < raw.length; i++) {
      if (raw[i] === 'A' && raw[i + 1] === 'B Testing') {
        items.push('A/B Testing');
        i++;
      } else {
        items.push(raw[i]);
      }
    }
    return { name: str(s?.name), items };
  });
}

function sanitizeCertifications(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(c => ({
    name: str(c?.name),
    issuer: str(c?.issuer),
    date: str(c?.date),
  }));
}

function sanitizeVolunteer(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(v => ({
    organization: str(v?.organization),
    role: str(v?.role),
    location: str(v?.location),
    dates: str(v?.dates),
    bullets: strArr(v?.bullets),
  }));
}

function sanitizeExtraSections(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(s => s?.title && Array.isArray(s?.items) && s.items.length > 0)
    .map(s => ({ title: str(s.title), items: strArr(s.items) }));
}

// ── Main extraction function ──────────────────────────────────────────────────

/**
 * Extract structured resume data from a PDF file using Gemini Vision.
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<object>} Structured ResumeJSON
 */
export async function extractFromPDF(filePath) {
  const pdfBuffer = fs.readFileSync(filePath);
  const base64Data = pdfBuffer.toString('base64');

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: PORTFOLIO_RESUME_SCHEMA,
    },
  });

  const prompt = buildPrompt();

  console.log(`[GeminiPDF] Sending PDF (${Math.round(pdfBuffer.length / 1024)}KB) to Gemini ${MODEL}...`);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Gemini PDF extraction timeout')), TIMEOUT_MS)
  );

  const result = await Promise.race([
    model.generateContent([
      { inlineData: { mimeType: 'application/pdf', data: base64Data } },
      { text: prompt },
    ]),
    timeoutPromise,
  ]);

  const content = result.response.text();
  if (!content) throw new Error('Gemini returned empty response');

  const parsed = JSON.parse(content);
  console.log('[GeminiPDF] Successfully extracted structured resume data');

  const basics = parsed.basics || {};
  return {
    basics: {
      name: str(basics.name),
      title: str(basics.title),
      email: str(basics.email),
      phone: str(basics.phone),
      location: str(basics.location),
      summary: str(basics.summary),
      links: filterLinks(basics.links),
    },
    experience: sanitizeExperience(parsed.experience),
    education: sanitizeEducation(parsed.education),
    projects: sanitizeProjects(parsed.projects),
    skills: sanitizeSkills(parsed.skills),
    certifications: sanitizeCertifications(parsed.certifications),
    volunteer: sanitizeVolunteer(parsed.volunteer),
    achievements: strArr(parsed.achievements),
    coursework: strArr(parsed.coursework),
    extraSections: sanitizeExtraSections(parsed.extraSections),
  };
}

// ── Portfolio text-mode extraction (Mistral OCR markdown → Gemini structured output) ──

// Gemini response schema — enforces valid JSON, no hallucinations
const PORTFOLIO_RESUME_SCHEMA = {
  type: 'object',
  properties: {
    basics: {
      type: 'object',
      properties: {
        name:     { type: 'string' },
        title:    { type: 'string' },
        email:    { type: 'string' },
        phone:    { type: 'string' },
        location: { type: 'string' },
        summary:  { type: 'string' },
        links:    { type: 'array', items: { type: 'string' } },
      },
    },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          company:  { type: 'string' },
          role:     { type: 'string' },
          location: { type: 'string' },
          dates:    { type: 'string' },
          bullets:  { type: 'array', items: { type: 'string' } },
          tech:     { type: 'array', items: { type: 'string' } },
        },
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          school:   { type: 'string' },
          degree:   { type: 'string' },
          location: { type: 'string' },
          dates:    { type: 'string' },
          details:  { type: 'array', items: { type: 'string' } },
        },
      },
    },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name:        { type: 'string' },
          description: { type: 'string' },
          bullets:     { type: 'array', items: { type: 'string' } },
          tech:        { type: 'array', items: { type: 'string' } },
          link:        { type: 'string' },
          github:      { type: 'string' },
          role:        { type: 'string' },
          dates:       { type: 'string' },
          location:    { type: 'string' },
        },
      },
    },
    skills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name:  { type: 'string' },
          items: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    certifications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name:   { type: 'string' },
          issuer: { type: 'string' },
          date:   { type: 'string' },
        },
      },
    },
    volunteer: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          organization: { type: 'string' },
          role:         { type: 'string' },
          location:     { type: 'string' },
          dates:        { type: 'string' },
          bullets:      { type: 'array', items: { type: 'string' } },
        },
      },
    },
    achievements:  { type: 'array', items: { type: 'string' } },
    coursework:    { type: 'array', items: { type: 'string' } },
    extraSections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          items: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  },
};

function buildPortfolioPrompt() {
  return `You are a resume parser for a portfolio generator. Extract ALL structured data from the resume text below.

EXTRACTION RULES:
- Extract ONLY information present in the source — never invent data.
- basics.title: if not explicitly stated, generate a short professional headline from the most recent job title (e.g. "Engineering Manager at Bijak").
- basics.summary: if not present, generate a concise 2-3 sentence summary from the work experience.
- Phone: read each digit individually — never drop, transpose, or merge digits.
- Dates: always include BOTH start and end (e.g. "July 2020 - Present", "2010 - 2014"). For education, if only graduation year shown and it is a 4-year degree, subtract 4 for start year.
- CGPA/GPA: look anywhere in the education block, preserve label exactly (e.g. "CGPA: 7.69") and include in details[].
- Location: scan the ENTIRE job block for any city/country/Remote indicator — never leave empty if visible.
- Projects.link: website, App Store, Play Store, or product URL — any URL that is NOT a GitHub/GitLab/Bitbucket repo. Bare domains count (e.g. "cointopper.com"). If the label says "Link:", "Website:", or "URL:" followed by an actual URL, extract the URL value — not the label word.
- Projects.github: GitHub, GitLab, or Bitbucket repository URL only. Leave empty if no repo URL is present.
- Projects.dates: if project is inside a company experience block, use that company's date range.
- Projects.role: "Professional" if inside a company block, "Personal" for side projects, "Open Source" otherwise.
- Skills: preserve category headings exactly as written (Expert, Senior, High Knowledge, Tinkering, etc.).
- Sections titled Organizations/Volunteer/Community/Activities go in volunteer[].
- Anything not fitting standard sections goes in extraSections[].

TEXT NORMALISATION — apply these corrections automatically:
- "Al" (A + lowercase l) → "AI" for Artificial Intelligence; "Gen Al" → "Gen AI"
- "A, B Testing" → "A/B Testing"
- "Neo-6,000,000 GPS" → "Neo-6M GPS"
- "3d Printing" → "3D Printing"
- "go" as a standalone skill → "Go" (programming language)
- "Rest API" → "REST API"; "GIT" → "Git"; "fine tuning" → "Fine-tuning"
- "BLOC" → "BLoC"; "tensorflow" → "TensorFlow"; "Chat GPT" → "ChatGPT"
- "Koltin" → "Kotlin"; "Olama" → "Ollama"; "Riverpods" → "Riverpod"; "Thinkwlk" → "Thinkwik"
- "AWS lambda" → "AWS Lambda"; "Github" → "GitHub"; "Tail scale" → "Tailscale"
- Trailing punctuation on tech names (e.g. "Websockets." → "Websockets")`;
}

/**
 * Extract structured resume data from pre-extracted markdown text using Gemini (text mode).
 * Uses responseSchema for guaranteed valid JSON — same approach as Portfolioly.
 * @param {string} markdownText - Raw markdown from Mistral OCR
 * @returns {Promise<object>} Structured ResumeJSON
 */
export async function extractFromMarkdown(markdownText) {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: PORTFOLIO_RESUME_SCHEMA,
      thinkingConfig: { thinkingBudget: 0 },
    },
  });

  const prompt = buildPortfolioPrompt();
  const fullPrompt = `${prompt}\n\n---\n\n${markdownText}`;

  console.log(`[GeminiText] Sending markdown (${Math.round(markdownText.length / 1024)}KB) to Gemini ${MODEL} with schema enforcement...`);

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Gemini text extraction timeout')), 120_000)
  );

  const result = await Promise.race([
    model.generateContent(fullPrompt),
    timeoutPromise,
  ]);

  // With responseSchema, Gemini guarantees valid JSON — no manual parsing needed
  const content = result.response.text();
  if (!content) throw new Error('Gemini returned empty response');

  const parsed = JSON.parse(content);
  console.log('[GeminiText] Successfully extracted structured resume data');

  const basics = parsed.basics || {};
  return {
    basics: {
      name:     str(basics.name),
      title:    str(basics.title),
      email:    str(basics.email),
      phone:    str(basics.phone),
      location: str(basics.location),
      summary:  str(basics.summary),
      links:    filterLinks(basics.links),
    },
    experience:     sanitizeExperience(parsed.experience),
    education:      sanitizeEducation(parsed.education),
    projects:       sanitizeProjects(parsed.projects),
    skills:         sanitizeSkills(parsed.skills),
    certifications: sanitizeCertifications(parsed.certifications),
    volunteer:      sanitizeVolunteer(parsed.volunteer),
    achievements:   strArr(parsed.achievements),
    coursework:     strArr(parsed.coursework),
    extraSections:  sanitizeExtraSections(parsed.extraSections),
  };
}
