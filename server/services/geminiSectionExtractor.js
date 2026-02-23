/**
 * Resume section extractor using Mistral AI chat completions.
 * Sends all classified sections in a single API call to stay within rate limits.
 * Falls back gracefully if Mistral is unavailable.
 */

const MISTRAL_CHAT_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_MODEL = 'mistral-small-latest';
const TIMEOUT_MS = 60_000;

function getApiKey() {
  return process.env.MISTRAL_API_KEY;
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

// ── Build combined prompt ─────────────────────────────────────────────────────

function buildCombinedPrompt(sections) {
  const sectionBlocks = sections
    .filter(s => s.type !== 'unknown')
    .map(s => `=== SECTION: ${s.type} ===\n${s.rawText}`)
    .join('\n\n');

  return `You are a resume parser. Extract ALL structured data from the resume sections below.
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
      "location": "string (extract from 'date | location' format if present — the part AFTER the pipe)",
      "dates": "string (the date range only, e.g. 'Jan 2020 - Present', NOT including the location after '|')",
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
      "details": ["string — include ALL sub-details: GPA (e.g. 'Cum. cGPA: 8.2/10.0'), honors (e.g. 'Dean's List (All Semesters)'), coursework, and any other details listed under the degree"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string (brief description)",
      "bullets": ["string — PRESERVE DUPLICATES exactly as written"],
      "tech": ["string"],
      "link": "string",
      "role": "string (extract from 'date | role' metadata line if present — the part AFTER the pipe, e.g. 'Solo Developer')",
      "dates": "string (extract from metadata line before the '|', e.g. 'Sep 2025 - Present')",
      "location": "string"
    }
  ],
  "skills": [
    {
      "name": "string (category name like Languages, Frameworks, Tools — use original label from resume)",
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
- DATE | LOCATION lines: if a line has format "Jan 2023 – Nov 2024 | Remote", put "Jan 2023 – Nov 2024" in dates and "Remote" in location.
- PROJECT METADATA lines: if a project has a line like "Sep 2025 – Present | Solo Developer", put "Sep 2025 – Present" in dates and "Solo Developer" in role.
- EDUCATION DETAILS: include ALL lines under a degree in details[] — GPA, honors (Dean's List), awards, location. Do NOT discard them.
- VOLUNTEER / ORGANIZATIONS: Any section titled "Organizations", "Volunteer", "Community", "Activities", "Extracurricular" must go in volunteer[]. Do NOT put volunteer work in projects[].
- EXTRA SECTIONS: Any section that does NOT fit into experience, education, projects, skills, certifications, volunteer, achievements, or coursework must go into extraSections[]. Examples: Interests, Hobbies, Languages, Publications, References, Awards (non-numeric), Leadership, Memberships. Use the exact section title as "title" and each item as a string in "items".
- SKILLS — "Name: Description" format: When a skill is written as "Skill Name: Description or explanation of skill", extract ONLY the skill name (the part BEFORE the first colon) as the item. Do NOT include the description after the colon.
- SKILLS — simple list format: When skills are a comma-separated or plain list, extract each individual skill as a separate item.
- SKILLS — category format: When skills are grouped under a category label (e.g. "Languages: Python, Java"), use the category as "name" and extract individual skills as "items".
- For skills, preserve the original category labels from the resume exactly as written.
- Extract ALL links (GitHub, LinkedIn, portfolio, personal website).

RESUME SECTIONS:
${sectionBlocks}`;
}

// ── Mistral API call ──────────────────────────────────────────────────────────

async function callMistral(prompt) {
  const apiKey = getApiKey();
  if (!apiKey || !apiKey.trim()) {
    throw new Error('MISTRAL_API_KEY is not configured');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(MISTRAL_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Mistral API ${response.status}: ${errText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Mistral returned empty content');
    }

    return content;
  } finally {
    clearTimeout(timer);
  }
}

// ── Main extraction function ──────────────────────────────────────────────────

/**
 * Extract all sections in a single Mistral call and return a sanitized ResumeJSON.
 * @param {Array<{type: string, rawText: string}>} sections
 * @returns {Promise<object>} Merged ResumeJSON
 */
export async function extractSectionsWithGemini(sections) {
  const emptyResult = {
    basics: { name: '', title: '', email: '', phone: '', location: '', summary: '', links: [] },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    volunteer: [],
    achievements: [],
    coursework: [],
    extraSections: [],
  };

  const relevantSections = sections.filter(s => s.type !== 'unknown');
  if (relevantSections.length === 0) return emptyResult;

  const prompt = buildCombinedPrompt(relevantSections);

  try {
    console.log('[MistralExtractor] Calling Mistral API with', relevantSections.length, 'sections...');
    const rawText = await callMistral(prompt);
    const parsed = safeParse(rawText);

    if (!parsed) {
      console.warn('[MistralExtractor] Failed to parse Mistral response');
      return emptyResult;
    }

    console.log('[MistralExtractor] Successfully parsed structured resume data');

    // Sanitize all fields
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
  } catch (error) {
    console.warn('[MistralExtractor] Mistral call failed:', error.message);
    return emptyResult;
  }
}
