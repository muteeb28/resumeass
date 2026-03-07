/**
 * Resume extractor using Cohere.
 * Sends full resume text in a single API call and returns structured JSON.
 */

const COHERE_URL = 'https://api.cohere.com/v2/chat';
const MODEL = 'command-a-03-2025';
const TIMEOUT_MS = 60_000;

function getApiKey() {
  return process.env.COHERE_API_KEY;
}

// ── JSON cleanup helpers ──────────────────────────────────────────────────────

function cleanJsonString(raw) {
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  s = s.replace(/,\s*([}\]])/g, '$1');
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    s = s.slice(start, end + 1);
  }
  return s;
}

function safeParse(raw) {
  try {
    return JSON.parse(cleanJsonString(raw));
  } catch {
    return null;
  }
}

// ── Data sanitisation ─────────────────────────────────────────────────────────

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
    role: str(p?.role),
    dates: str(p?.dates),
    location: str(p?.location),
  }));
}

function sanitizeSkills(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(s => ({
    name: str(s?.name),
    items: strArr(s?.items),
  }));
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
    .map(s => ({
      title: str(s.title),
      items: strArr(s.items),
    }));
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt(rawText) {
  return `You are a resume parser. Extract ALL structured data from the resume text below.
Return ONLY valid JSON matching this exact schema — no extra text, no markdown fences:
{
  "basics": {
    "name": "string",
    "title": "string (job title or headline)",
    "email": "string",
    "phone": "string",
    "location": "string",
    "summary": "string",
    "links": ["string (URLs, GitHub, LinkedIn, portfolio links)"]
  },
  "experience": [
    {
      "company": "string",
      "role": "string",
      "location": "string",
      "dates": "string (date range, e.g. 'Jan 2020 - Present')",
      "bullets": ["string (each bullet point as a separate string — PRESERVE DUPLICATES exactly as written)"],
      "tech": ["string (technologies mentioned)"]
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "location": "string (city/state/country if present)",
      "dates": "string (graduation year or date range)",
      "details": ["string — include ALL sub-details: GPA, honors, coursework, and any other details listed under the degree"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string (brief description)",
      "bullets": ["string — PRESERVE DUPLICATES exactly as written"],
      "tech": ["string"],
      "link": "string",
      "role": "string",
      "dates": "string",
      "location": "string"
    }
  ],
  "skills": [
    {
      "name": "string (category name — use original label from resume)",
      "items": ["string (ONLY the skill/tool name — NOT descriptions or explanations)"]
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string"
    }
  ],
  "volunteer": [
    {
      "organization": "string",
      "role": "string",
      "location": "string",
      "dates": "string",
      "bullets": ["string"]
    }
  ],
  "achievements": ["string"],
  "coursework": ["string"],
  "extraSections": [
    {
      "title": "string (section heading exactly as written in resume)",
      "items": ["string (each item as a clean single line)"]
    }
  ]
}

Rules:
- Extract EVERYTHING. Do not skip any data that is present in the resume.
- Do NOT invent or hallucinate data. Only extract what is explicitly written.
- If a section is missing from the resume, use empty string or empty array.
- All values MUST be strings or arrays of strings. Never use objects for any field.
- For experience/project bullets, extract EVERY bullet point as a SEPARATE string. PRESERVE EXACT DUPLICATES — do NOT remove them.
- CONTACT INFO: Scan the entire text for email (contains @), phone (digits + dashes/spaces/+), and URLs. Icon/emoji characters before contact info should be ignored — extract the value after them. Phone numbers may start with + or a country code.
- COMPANY NAMES with pipe: "Company A | Company B" is a single company name — do NOT treat it as a date|location separator. The pipe only separates date from location when the left side is a date (contains month names or year digits like "Jan 2023", "2022-2024").
- DATES: Look for date patterns like "Month Year - Month Year", "Month Year - Present", "Year - Year". The dates line is usually on its own line below the job title.
- EDUCATION DETAILS: include ALL lines under a degree in details[] — GPA, honors (Dean's List), awards, location. Do NOT discard them.
- VOLUNTEER / ORGANIZATIONS: Any section titled "Organizations", "Volunteer", "Community", "Activities", "Extracurricular" must go in volunteer[]. Do NOT put volunteer work in projects[].
- EXTRA SECTIONS: Any section that does NOT fit into experience, education, projects, skills, certifications, volunteer, achievements, or coursework must go into extraSections[]. Examples: Interests, Hobbies, Languages, Publications, References, Leadership, Memberships. Use the exact section title as "title" and each item as a string in "items".
- SKILLS — category headings without colons: When the resume has a standalone word or phrase as a category heading (e.g. "Expert", "Senior", "High Knowledge", "Tinkering", "Languages", "Frameworks") followed by a list of skills, use that heading as the category "name" and the skills beneath it as "items".
- SKILLS — "Name: Description" format: extract ONLY the skill name (before the colon) as the item.
- SKILLS — simple or comma-separated list: extract each individual skill as a separate item.
- SKILLS — "Category: skill1, skill2" format: use the category label as "name" and each skill as an item.
- Preserve original category labels exactly as written.
- Extract ALL links (GitHub, LinkedIn, portfolio, personal website).

RESUME TEXT:
${rawText}`;
}

// ── Cohere API call ───────────────────────────────────────────────────────────

async function callCohere(prompt) {
  const apiKey = getApiKey();
  if (!apiKey || !apiKey.trim()) {
    throw new Error('COHERE_API_KEY is not configured');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(COHERE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Cohere API ${response.status}: ${errText}`);
    }

    const result = await response.json();
    const content = result.message?.content?.[0]?.text;
    if (!content) {
      throw new Error('Cohere returned empty content');
    }

    return content;
  } finally {
    clearTimeout(timer);
  }
}

// ── Main extraction function ──────────────────────────────────────────────────

/**
 * Extract structured resume data from raw text in a single Mistral call.
 * @param {string} rawText - Full resume text (markdown or plain)
 * @returns {Promise<object>} Structured ResumeJSON
 */
export async function extractFromRawText(rawText) {
  const prompt = buildPrompt(rawText);

  console.log('[CohereExtractor] Calling Cohere with full resume text...');
  const responseText = await callCohere(prompt);
  const parsed = safeParse(responseText);

  if (!parsed) {
    throw new Error('Cohere returned unparseable JSON');
  }

  console.log('[CohereExtractor] Successfully parsed structured resume data');

  const basics = parsed.basics || {};
  return {
    basics: {
      name: str(basics.name),
      title: str(basics.title),
      email: str(basics.email),
      phone: str(basics.phone),
      location: str(basics.location),
      summary: str(basics.summary),
      links: strArr(basics.links),
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
