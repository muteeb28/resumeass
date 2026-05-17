import fs from 'fs';
import OpenAI from 'openai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const TIMEOUT_MS = 90_000;
const MODEL = process.env.NVIDIA_MODEL || 'openai/gpt-oss-20b';

function getOpenAI() {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_API_KEY is not configured');
  return new OpenAI({ apiKey, baseURL: 'https://integrate.api.nvidia.com/v1' });
}

function withTimeout(promise, ms = TIMEOUT_MS) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('NVIDIA optimizer timeout')), ms)
    ),
  ]);
}

async function withRetry(fn, retries = 3, delayMs = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRetriable =
        err?.status === 429 ||
        err?.status >= 500 ||
        err?.message?.includes('timeout') ||
        err?.code === 'ECONNRESET' ||
        err?.cause?.code === 'ECONNRESET' ||
        err?.cause?.cause?.code === 'ECONNRESET' ||
        err?.message?.includes('terminated');
      if (isRetriable && attempt < retries) {
        console.warn(`[NVIDIA] Error ${err?.status || err?.code || err?.message} on attempt ${attempt}/${retries}, retrying in ${delayMs}ms...`);
        await new Promise(res => setTimeout(res, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
}

async function callOpenAI(prompt, timeoutMs = TIMEOUT_MS) {
  return withRetry(async () => {
    const openai = getOpenAI();

    const result = await new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('NVIDIA optimizer timeout')), timeoutMs);
      try {
        const stream = await openai.chat.completions.create({
          model: MODEL,
          temperature: 0,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          stream: true,
        });
        let accumulated = '';
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) accumulated += text;
        }
        clearTimeout(timer);
        if (!accumulated) reject(new Error('NVIDIA returned empty response'));
        else resolve(accumulated);
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });

    return JSON.parse(result);
  });
}

// ── Public functions ──────────────────────────────────────────────────────────

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

  return callOpenAI(prompt);
}

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

  return callOpenAI(prompt);
}

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

  return callOpenAI(prompt);
}

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

  return callOpenAI(prompt);
}

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

  return callOpenAI(prompt);
}

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

  return callOpenAI(prompt);
}

export async function analyzeResumeForATS(resumeText, jobDescription) {
  const jd = jobDescription && jobDescription.trim()
    ? jobDescription
    : "No job description provided. Analyze for general ATS best practices for the candidate's field.";

  const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume.

Return JSON with exactly these fields:
- ats_score_before: integer 0-100 reflecting current ATS compatibility
- current_keywords: array of up to 20 ATS keywords already present in the resume (short strings like "Python", "REST API", "Docker")
- weak_sections: array of 3 to 5 SECTION NAMES that need improvement, chosen from: "Summary", "Experience bullets", "Skills", "Education", "Projects", "Certifications", "Contact". Do NOT list keywords here — only section names.

RESUME:
${resumeText}

JOB DESCRIPTION OR CONTEXT:
${jd}`;

  return callOpenAI(prompt);
}

export async function analyzeResumeForATSStream(resumeText, jobDescription, onChunk) {
  const jd = jobDescription && jobDescription.trim()
    ? jobDescription
    : "No job description provided. Analyze for general ATS best practices for the candidate's field.";

  const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume.

Return JSON with exactly these fields:
- ats_score_before: integer 0-100 reflecting current ATS compatibility
- current_keywords: array of up to 20 ATS keywords already present in the resume (short strings like "Python", "REST API", "Docker")
- weak_sections: array of 3 to 5 SECTION NAMES that need improvement, chosen from: "Summary", "Experience bullets", "Skills", "Education", "Projects", "Certifications", "Contact". Do NOT list keywords here — only section names.

RESUME:
${resumeText}

JOB DESCRIPTION OR CONTEXT:
${jd}`;

  return withRetry(async () => {
    const openai = getOpenAI();

    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('NVIDIA optimizer timeout')), 120_000);
      try {
        const stream = await openai.chat.completions.create({
          model: MODEL,
          temperature: 0,
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          stream: true,
        });
        let accumulated = '';
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || '';
          if (text) {
            accumulated += text;
            onChunk(text);
          }
        }
        clearTimeout(timer);
        if (!accumulated) reject(new Error('NVIDIA returned empty response'));
        else resolve(JSON.parse(accumulated));
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });
  });
}

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

Return ONLY a raw JSON object (no markdown, no code blocks) with EXACTLY this structure:
{
  "optimized_resume": {
    "name": "string",
    "contact": { "email": "string", "phone": "string", "linkedin": "string", "location": "string" },
    "summary": "string",
    "experience": [{ "company": "string", "title": "string", "dates": "string", "bullets": ["string"] }],
    "education": [{ "institution": "string", "degree": "string", "dates": "string" }],
    "skills": ["string"],
    "projects": [{ "name": "string", "description": "string", "bullets": ["string"], "link": "string", "github": "string", "tech": ["string"] }]
  },
  "changelog": {
    "ats_score_after": 0,
    "keywords_added": ["string"],
    "keywords_missing": ["string"],
    "sections_modified": ["string"],
    "top_changes": ["string"],
    "bullet_changes": [{ "section": "string", "original": "string", "improved": "string" }]
  }
}

RESUME:
${resumeText}

JOB DESCRIPTION (may be empty):
${jd}`;

  return callOpenAI(prompt, 180_000);
}

export async function extractResumeFromPDF(filePath) {
  const pdfBuffer = fs.readFileSync(filePath);
  
  console.log(`[OptimizerExtract] Sending PDF (${Math.round(pdfBuffer.length / 1024)}KB) to pdf-parse...`);
  const pdfData = await pdfParse(pdfBuffer);
  const pdfText = pdfData.text;

  const prompt = `You are a resume parser. Extract ALL structured data from this resume text.
Extract basics (name, title, email, phone, location, summary, links), experience, education,
projects, skills, certifications, and achievements. Do NOT invent data — only extract what is visible.
For dates always include both start and end. For experience extract all bullet points exactly as written.

RESUME TEXT:
${pdfText}`;

  return withRetry(async () => {
    const openai = getOpenAI();
    const result = await withTimeout(
      openai.chat.completions.create({
        model: MODEL,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      }),
      120_000
    );

    const content = result.choices[0]?.message?.content;
    if (!content) throw new Error('NVIDIA returned empty response');
    const resumeJson = JSON.parse(content);
    console.log('[OptimizerExtract] NVIDIA extraction complete');

    const resumeTextSerialized = serializeResumeJsonToText(resumeJson);
    return { resumeJson, resumeText: resumeTextSerialized };
  });
}

function serializeResumeJsonToText(r) {
  const lines = [];
  const b = r.basics || {};
  if (b.name)     lines.push(b.name);
  if (b.title)    lines.push(b.title);
  if (b.email)    lines.push(b.email);
  if (b.phone)    lines.push(b.phone);
  if (b.location) lines.push(b.location);
  if (b.summary)  lines.push(`\\nSummary\\n${b.summary}`);

  if (r.experience?.length) {
    lines.push('\\nExperience');
    r.experience.forEach(exp => {
      lines.push(`${exp.role || ''} at ${exp.company || ''} (${exp.dates || ''})`);
      if (exp.location) lines.push(exp.location);
      (exp.bullets || []).forEach(b => lines.push(`- ${b}`));
    });
  }
  if (r.education?.length) {
    lines.push('\\nEducation');
    r.education.forEach(edu => {
      lines.push(`${edu.degree || ''} — ${edu.school || ''} (${edu.dates || ''})`);
      (edu.details || []).forEach(d => lines.push(d));
    });
  }
  if (r.skills?.length) {
    lines.push('\\nSkills');
    r.skills.forEach(cat => lines.push(`${cat.name}: ${(cat.items || []).join(', ')}`));
  }
  if (r.projects?.length) {
    lines.push('\\nProjects');
    r.projects.forEach(p => {
      lines.push(`${p.name || ''}: ${p.description || ''}`);
      (p.bullets || []).forEach(b => lines.push(`- ${b}`));
      if (p.tech?.length) lines.push(`Tech: ${p.tech.join(', ')}`);
    });
  }
  if (r.certifications?.length) {
    lines.push('\\nCertifications');
    r.certifications.forEach(c => lines.push(`${c.name} — ${c.issuer || ''} (${c.date || ''})`));
  }
  if (r.achievements?.length) {
    lines.push('\\nAchievements');
    r.achievements.forEach(a => lines.push(`- ${a}`));
  }
  return lines.join('\\n');
}
