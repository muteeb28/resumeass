/**
 * Resume Optimizer Service — 6 Gemini AI functions for the 5-tool coaching workspace.
 * All functions use responseSchema for guaranteed valid JSON.
 * Model: gemini-2.5-flash, temperature: 0, thinkingBudget: 0.
 */

import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const TIMEOUT_MS = 90_000;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function getGenAI() {
  const apiKey = process.env.OPTI_API_KEY;
  if (!apiKey) throw new Error('OPTI_API_KEY is not configured');
  return new GoogleGenerativeAI(apiKey);
}

function withTimeout(promise, ms = TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini optimizer timeout')), ms)
    ),
  ]);
}

async function withRetry(fn, retries = 3, delayMs = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const is503 = err?.message?.includes('503') || err?.message?.includes('Service Unavailable') || err?.message?.includes('high demand');
      if (is503 && attempt < retries) {
        console.warn(`[Gemini] 503 on attempt ${attempt}/${retries}, retrying in ${delayMs}ms...`);
        await new Promise(res => setTimeout(res, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
}

async function callGemini(schema, prompt, timeoutMs = TIMEOUT_MS) {
  return withRetry(async () => {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    const result = await withTimeout(model.generateContent(prompt), timeoutMs);
    const content = result.response.text();
    if (!content) throw new Error('Gemini returned empty response');
    return JSON.parse(content);
  });
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const WEAK_BULLETS_SCHEMA = {
  type: 'object',
  properties: {
    weak_bullets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id:               { type: 'string' },
          original:         { type: 'string' },
          section:          { type: 'string' },
          weakness_reason:  { type: 'string' },
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id:          { type: 'string' },
                question:    { type: 'string' },
                placeholder: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
};

const REWRITE_BULLET_SCHEMA = {
  type: 'object',
  properties: {
    rewritten:   { type: 'string' },
    explanation: { type: 'string' },
  },
};

const KEYWORDS_SCHEMA = {
  type: 'object',
  properties: {
    ats_score_before:  { type: 'number' },
    matched_keywords:  { type: 'array', items: { type: 'string' } },
    missing_keywords: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          keyword:         { type: 'string' },
          importance:      { type: 'string' },
          target_bullet:   { type: 'string' },
          rewritten_bullet: { type: 'string' },
          reason:          { type: 'string' },
        },
      },
    },
  },
};

const SKILLS_GAP_SCHEMA = {
  type: 'object',
  properties: {
    skills_you_have: { type: 'array', items: { type: 'string' } },
    buried_skills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          skill:      { type: 'string' },
          found_in:   { type: 'string' },
          suggestion: { type: 'string' },
        },
      },
    },
    missing_skills: { type: 'array', items: { type: 'string' } },
  },
};

const SUMMARY_SCHEMA = {
  type: 'object',
  properties: {
    rewritten_summary: { type: 'string' },
    formula_used:      { type: 'string' },
  },
};

const REPORT_SCHEMA = {
  type: 'object',
  properties: {
    ats_score_after: { type: 'number' },
    changes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          section:  { type: 'string' },
          original: { type: 'string' },
          improved: { type: 'string' },
          tool:     { type: 'string' },
          reason:   { type: 'string' },
        },
      },
    },
  },
};

// Pre-analysis schema for new optimizer flow
const PRE_ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    ats_score_before: { type: 'number' },
    current_keywords: {
      type: 'array',
      items: { type: 'string' },
    },
    weak_sections: {
      type: 'array',
      items: { type: 'string' },
    },
  },
};

// Optimization schema for new optimizer flow
const SIMPLE_OPTIMIZE_SCHEMA = {
  type: 'object',
  properties: {
    optimized_resume: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        contact: {
          type: 'object',
          properties: {
            email:    { type: 'string' },
            phone:    { type: 'string' },
            linkedin: { type: 'string' },
            location: { type: 'string' },
          },
        },
        summary: { type: 'string' },
        experience: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              company: { type: 'string' },
              title:   { type: 'string' },
              dates:   { type: 'string' },
              bullets: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
        education: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              institution: { type: 'string' },
              degree:      { type: 'string' },
              dates:       { type: 'string' },
            },
          },
        },
        skills: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
    changelog: {
      type: 'object',
      properties: {
        ats_score_after: { type: 'number' },
        keywords_added: {
          type: 'array',
          items: { type: 'string' },
        },
        keywords_missing: {
          type: 'array',
          items: { type: 'string' },
        },
        sections_modified: {
          type: 'array',
          items: { type: 'string' },
        },
        top_changes: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  },
};

// ── Public functions ──────────────────────────────────────────────────────────

/**
 * Find 3–5 bullets that describe responsibilities not achievements.
 * For each, generate 2–3 targeted questions to extract metrics/outcomes.
 */
export async function analyzeWeakBullets(resumeText, jobDescription) {
  const prompt = `You are a senior resume coach. Analyze this resume and job description.

Find 3 to 5 bullets that describe responsibilities or duties rather than measurable achievements.
For each weak bullet, generate 2-3 short targeted questions that will help the candidate provide
metrics, outcomes, or impact to strengthen the bullet. Only include bullets that can be meaningfully
improved (skip already strong achievement-oriented bullets).

Assign each bullet a unique id like "b1", "b2", etc.
For each question, assign id like "b1q1", "b1q2", etc.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  return callGemini(WEAK_BULLETS_SCHEMA, prompt);
}

/**
 * Using the candidate's answers, rewrite a single bullet as an achievement.
 */
export async function rewriteBullet(original, answers, jobDescription) {
  const answersText = Object.entries(answers)
    .map(([q, a]) => `Q: ${q}\nA: ${a}`)
    .join('\n\n');

  const prompt = `You are a senior resume coach. Rewrite this bullet point as a strong achievement statement.

Use the "achieved X by doing Y, resulting in Z" format where possible.
Naturally incorporate relevant keywords from the job description.
Keep it to one concise sentence (max 25 words). Do not invent data — only use what the user provided.

ORIGINAL BULLET:
${original}

CANDIDATE'S ANSWERS:
${answersText}

JOB DESCRIPTION KEYWORDS (incorporate naturally):
${jobDescription.slice(0, 800)}`;

  return callGemini(REWRITE_BULLET_SCHEMA, prompt);
}

/**
 * Analyze ATS keyword gap between resume and job description.
 */
export async function analyzeKeywords(resumeText, jobDescription) {
  const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze the resume against the job description.

1. Calculate an ATS score (0–100) based on keyword match percentage.
2. List all keywords from the JD that already appear in the resume as matched_keywords.
3. For each missing keyword, provide:
   - importance: "critical" (in job title/requirements), "important" (mentioned 2+ times), or "nice-to-have"
   - target_bullet: an existing bullet from the resume where this keyword could be added
   - rewritten_bullet: that bullet rewritten to naturally include the keyword
   - reason: one sentence why this keyword matters for the role

Focus on skills, tools, methodologies, and domain terms. Ignore generic words.
Return at most 10 missing_keywords, prioritized by importance.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  return callGemini(KEYWORDS_SCHEMA, prompt);
}

/**
 * Analyze skills gap between resume and job description.
 */
export async function analyzeSkillsGap(resumeText, jobDescription) {
  const prompt = `You are a technical recruiter. Analyze the skills in this resume against the job description.

Categorize into three buckets:

1. skills_you_have: Skills explicitly listed in the resume that are relevant to the job. List the skill names only.

2. buried_skills: Skills that appear in the resume bullets/descriptions but are NOT in the skills section.
   For each: the skill name, where it was found (e.g. "bullet in Company X role"), and a suggestion
   for where/how to surface it in the skills section.

3. missing_skills: Skills the job description requires that are completely absent from the resume.
   List skill names only. Do not include skills the candidate clearly has.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  return callGemini(SKILLS_GAP_SCHEMA, prompt);
}

/**
 * Rewrite the candidate's professional summary for the target role.
 */
export async function rewriteSummary(resumeText, jobDescription) {
  const prompt = `You are a professional resume writer. Rewrite this candidate's professional summary
to be highly targeted for the job description below.

Always follow this formula:
"[Title] with X years driving [outcome] | Expertise in [3 JD skills] | Track record of [result]"

Requirements:
- 2-3 sentences maximum
- Use specific numbers and outcomes from the resume
- Include the top 3 skills from the job description naturally
- Do not use empty buzzwords like "dynamic" or "passionate"
- Write in third-person present tense without "I"

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  return callGemini(SUMMARY_SCHEMA, prompt);
}

/**
 * Generate a before/after report with ATS score improvement.
 */
export async function generateReport(originalResume, currentResume, jobDescription, toolChanges) {
  const changesText = Array.isArray(toolChanges) && toolChanges.length > 0
    ? toolChanges.map(c => `[${c.tool}] ${c.section}: "${c.original}" → "${c.improved}"`).join('\n')
    : 'No changes recorded';

  const prompt = `You are an ATS expert. Evaluate this optimized resume against the job description.

Calculate an ATS score after optimization (0–100). Compare the original and optimized resumes.
For each change the user accepted, document it in the changes array with:
- section: which section was changed
- original: the original text
- improved: the new text
- tool: which tool made the change ("bullets", "keywords", "skills", or "summary")
- reason: one sentence why this improves the resume

ORIGINAL RESUME:
${originalResume}

OPTIMIZED RESUME:
${currentResume}

JOB DESCRIPTION:
${jobDescription}

CHANGES MADE:
${changesText}`;

  return callGemini(REPORT_SCHEMA, prompt);
}

/**
 * New pre-analysis call for the simplified optimizer flow.
 * JD is optional; when missing, optimize for general ATS best practices.
 */
export async function analyzeResumeForATS(resumeText, jobDescription) {
  const jd = jobDescription && jobDescription.trim()
    ? jobDescription
    : "No job description provided. Analyze for general ATS best practices for the candidate's field.";

  const prompt = `You are an ATS (Applicant Tracking System) expert.

Analyze this resume for ATS compatibility against the job description (or general best practices if none).
Return ONLY valid JSON with:
- ats_score_before: integer 0-100
- current_keywords: array of unique, important ATS keywords you detect in the resume
- weak_sections: array of section names that need the most improvement (e.g., "summary", "experience", "skills").

RESUME:
${resumeText}

JOB DESCRIPTION OR CONTEXT:
${jd}`;

  return callGemini(PRE_ANALYSIS_SCHEMA, prompt);
}

export async function analyzeResumeForATSStream(resumeText, jobDescription, onChunk) {
  const jd = jobDescription && jobDescription.trim()
    ? jobDescription
    : "No job description provided. Analyze for general ATS best practices for the candidate's field.";

  const prompt = `You are an ATS (Applicant Tracking System) expert.

Analyze this resume for ATS compatibility against the job description (or general best practices if none).
Return ONLY valid JSON with:
- ats_score_before: integer 0-100
- current_keywords: array of unique, important ATS keywords you detect in the resume
- weak_sections: array of section names that need the most improvement (e.g., "summary", "experience", "skills").

RESUME:
${resumeText}

JOB DESCRIPTION OR CONTEXT:
${jd}`;

  return withRetry(async () => {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: PRE_ANALYSIS_SCHEMA,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const streamResult = await withTimeout(model.generateContentStream(prompt), 120_000);
    let accumulated = '';
    for await (const chunk of streamResult.stream) {
      const text = chunk.text();
      if (text) {
        accumulated += text;
        onChunk(text);
      }
    }
    if (!accumulated) throw new Error('Gemini returned empty response');
    return JSON.parse(accumulated);
  });
}

/**
 * New single-call optimizer for the simplified optimizer flow.
 * Follows the "MASTER PROMPT FOR CALL 2" specification.
 */
export async function optimizeResumeSimple(resumeText, jobDescription) {
  const hasJD = !!(jobDescription && jobDescription.trim());
  const jd = hasJD
    ? jobDescription
    : "No job description provided. Optimize for general ATS best practices for the candidate's field.";

  const prompt = `You are an expert ATS resume optimizer.

Rules:
- Rewrite every bullet as: [Action Verb] + [Task] + [Quantified Result]
- Embed top 25 ATS keywords from the job description naturally into bullets and summary
- If no job description is provided, use industry best practices for the candidate's field
- Summary: 3 sentences, third person, aligned to the job description or the candidate's field
- Skills: extracted from the job description or inferred from experience — no fabrication
- Projects: preserve all projects from the resume; rewrite bullets as achievements; keep original name, description, link, github, and tech stack intact

Return ONLY valid JSON exactly matching this schema:
{
  "optimized_resume": {
    "name": "",
    "contact": { "email": "", "phone": "", "linkedin": "", "location": "" },
    "summary": "",
    "experience": [
      { "company": "", "title": "", "dates": "", "bullets": [] }
    ],
    "education": [
      { "institution": "", "degree": "", "dates": "" }
    ],
    "skills": [],
    "projects": [
      { "name": "", "description": "", "bullets": [], "link": "", "github": "", "tech": [] }
    ]
  },
  "changelog": {
    "ats_score_after": 0-100,
    "keywords_added": [],
    "keywords_missing": [],
    "sections_modified": [],
    "top_changes": [],
    "bullet_changes": [
      { "section": "Company name or section label", "original": "original bullet text", "improved": "rewritten bullet text" }
    ]
  }
}

- bullet_changes: include one entry per bullet that was meaningfully rewritten (max 10). "section" is the company name or section it belongs to.
Do not include any markdown or explanation text.

RESUME:
${resumeText}

JOB DESCRIPTION (may be empty):
${jd}`;

  // Use JSON mode without responseSchema — schema enforcement causes slow response for large outputs
  return withRetry(async () => {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
      },
    });
    const result = await withTimeout(model.generateContent(prompt), 180_000);
    const content = result.response.text();
    if (!content) throw new Error('Gemini returned empty response');
    return JSON.parse(content);
  }, 3, 8000);
}

// ── PDF extraction via Gemini Vision (uses OPTI_API_KEY) ──────────────────────

const PDF_RESUME_SCHEMA = {
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
    achievements: { type: 'array', items: { type: 'string' } },
  },
};

/**
 * Extract structured resume data from a PDF using Gemini Vision (OPTI_API_KEY).
 * Returns { resumeJson, resumeText } where resumeText is a plain-text serialization
 * suitable for passing to the AI optimizer tools.
 */
export async function extractResumeFromPDF(filePath) {
  const pdfBuffer = fs.readFileSync(filePath);
  const base64Data = pdfBuffer.toString('base64');

  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: PDF_RESUME_SCHEMA,
    },
  });

  const prompt = `You are a resume parser. Extract ALL structured data from this resume PDF.
Extract basics (name, title, email, phone, location, summary, links), experience, education,
projects, skills, certifications, and achievements. Do NOT invent data — only extract what is visible.
For dates always include both start and end. For experience extract all bullet points exactly as written.`;

  console.log(`[OptimizerExtract] Sending PDF (${Math.round(pdfBuffer.length / 1024)}KB) to Gemini Vision...`);

  const result = await withTimeout(
    model.generateContent([
      { inlineData: { mimeType: 'application/pdf', data: base64Data } },
      { text: prompt },
    ]),
    120_000
  );

  const content = result.response.text();
  if (!content) throw new Error('Gemini Vision returned empty response');

  const resumeJson = JSON.parse(content);
  console.log('[OptimizerExtract] Gemini Vision extraction complete');

  // Serialize to plain text for AI tools
  const resumeText = serializeResumeJsonToText(resumeJson);

  return { resumeJson, resumeText };
}

function serializeResumeJsonToText(r) {
  const lines = [];
  const b = r.basics || {};
  if (b.name)     lines.push(b.name);
  if (b.title)    lines.push(b.title);
  if (b.email)    lines.push(b.email);
  if (b.phone)    lines.push(b.phone);
  if (b.location) lines.push(b.location);
  if (b.summary)  lines.push(`\nSummary\n${b.summary}`);

  if (r.experience?.length) {
    lines.push('\nExperience');
    r.experience.forEach(exp => {
      lines.push(`${exp.role || ''} at ${exp.company || ''} (${exp.dates || ''})`);
      if (exp.location) lines.push(exp.location);
      (exp.bullets || []).forEach(b => lines.push(`- ${b}`));
    });
  }
  if (r.education?.length) {
    lines.push('\nEducation');
    r.education.forEach(edu => {
      lines.push(`${edu.degree || ''} — ${edu.school || ''} (${edu.dates || ''})`);
      (edu.details || []).forEach(d => lines.push(d));
    });
  }
  if (r.skills?.length) {
    lines.push('\nSkills');
    r.skills.forEach(cat => lines.push(`${cat.name}: ${(cat.items || []).join(', ')}`));
  }
  if (r.projects?.length) {
    lines.push('\nProjects');
    r.projects.forEach(p => {
      lines.push(`${p.name || ''}: ${p.description || ''}`);
      (p.bullets || []).forEach(b => lines.push(`- ${b}`));
      if (p.tech?.length) lines.push(`Tech: ${p.tech.join(', ')}`);
    });
  }
  if (r.certifications?.length) {
    lines.push('\nCertifications');
    r.certifications.forEach(c => lines.push(`${c.name} — ${c.issuer || ''} (${c.date || ''})`));
  }
  if (r.achievements?.length) {
    lines.push('\nAchievements');
    r.achievements.forEach(a => lines.push(`- ${a}`));
  }
  return lines.join('\n');
}
