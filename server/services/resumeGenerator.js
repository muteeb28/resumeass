import { GoogleGenerativeAI } from '@google/generative-ai';

const TIMEOUT_MS = 120_000;

function getGenAI() {
  const apiKey = process.env.CREATE_API_KEY;
  if (!apiKey) throw new Error('CREATE_API_KEY is not configured');
  return new GoogleGenerativeAI(apiKey);
}

function getModel() {
  return process.env.CREATE_MODEL || 'gemini-2.5-flash';
}

async function withRetry(fn, retries = 3, delayMs = 4000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRetriable =
        err?.status === 429 ||
        err?.status >= 500 ||
        err?.message?.includes('timeout') ||
        err?.message?.includes('ECONNRESET') ||
        err?.message?.includes('terminated');
      if (isRetriable && attempt < retries) {
        console.warn(`[CREATE] Attempt ${attempt}/${retries} failed (${err?.status || err?.message}), retrying in ${delayMs * attempt}ms...`);
        await new Promise(res => setTimeout(res, delayMs * attempt));
        continue;
      }
      throw err;
    }
  }
}

async function callGemini(prompt) {
  return withRetry(async () => {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({
      model: getModel(),
      generationConfig: { responseMimeType: 'application/json' },
    });

    return new Promise(async (resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('CREATE timeout')), TIMEOUT_MS);
      try {
        const result = await model.generateContent(prompt);
        clearTimeout(timer);
        const text = result.response.text();
        if (!text) reject(new Error('Gemini returned empty response'));
        else resolve(text);
      } catch (err) {
        clearTimeout(timer);
        reject(err);
      }
    });
  });
}

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const buildResumePrompt = (jobDescription, templateId, userData) => {
  const hasUserData = userData && userData.personalDetails;

  const userSection = hasUserData ? `
USER'S CURRENT INFORMATION:
Name: ${normalizeString(userData.personalDetails.fullName)}
Email: ${normalizeString(userData.personalDetails.email)}
Phone: ${normalizeString(userData.personalDetails.phone)}
Location: ${normalizeString(userData.personalDetails.location)}
LinkedIn: ${normalizeString(userData.personalDetails.linkedin)}
Website: ${normalizeString(userData.personalDetails.website)}
Summary: ${normalizeString(userData.personalDetails.summary)}

Work Experience:
${(userData.experiences || []).map((exp, i) => `${i + 1}. ${normalizeString(exp.jobTitle)} at ${normalizeString(exp.company)} (${normalizeString(exp.startDate)} - ${exp.current ? 'Present' : normalizeString(exp.endDate)})
   Location: ${normalizeString(exp.location)}
   Description: ${normalizeString(exp.description)}`).join('\n')}

Education:
${(userData.education || []).map((edu, i) => `${i + 1}. ${normalizeString(edu.degree)} from ${normalizeString(edu.school)} (${normalizeString(edu.graduationDate)})`).join('\n')}

Skills: ${normalizeString(userData.skills)}

INSTRUCTIONS: Rewrite the user's content to match the job description. Enhance bullets with quantified achievements, embed JD keywords naturally, and rewrite the summary to mirror the role.
` : `
INSTRUCTIONS: No user data provided. Create a professional resume perfectly tailored to the job description with realistic fictional details.
`;

  return `You are an expert ATS resume writer. Analyze the job description and produce a resume optimized for it.

TARGET JOB DESCRIPTION:
${jobDescription}

Template Style: ${templateId}
${userSection}

Rules:
- Rewrite every bullet as: [Action Verb] + [Task] + [Quantified Result]
- Embed the top keywords from the job description naturally
- Summary: 2-3 sentences, third person, mirroring the JD
- Do not fabricate companies, schools, or dates if user data is provided
- Keep all factual information accurate

Return a JSON object with EXACTLY this structure:
{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedIn": "string",
    "portfolio": "string"
  },
  "summary": "string",
  "experience": [
    {
      "company": "string",
      "position": "string",
      "duration": "string",
      "description": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "graduation": "string",
      "gpa": "string"
    }
  ],
  "skills": {
    "technical": ["string"],
    "soft": ["string"]
  },
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"]
    }
  ],
  "certifications": ["string"]
}`.trim();
};

const parseResumeResult = (raw) => {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No valid JSON found in AI response');
  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.personalInfo || !parsed.summary || !parsed.experience) {
    throw new Error('Invalid resume structure in AI response');
  }
  return parsed;
};

const createUserBasedFallback = (userData) => {
  if (userData && userData.personalDetails) {
    return {
      personalInfo: {
        name: normalizeString(userData.personalDetails.fullName) || '',
        email: normalizeString(userData.personalDetails.email) || '',
        phone: normalizeString(userData.personalDetails.phone) || '',
        location: normalizeString(userData.personalDetails.location) || '',
        linkedIn: normalizeString(userData.personalDetails.linkedin) || '',
        portfolio: normalizeString(userData.personalDetails.website) || '',
      },
      summary: normalizeString(userData.personalDetails.summary) || '',
      experience: (userData.experiences || [])
        .filter((exp) => exp.jobTitle && exp.company)
        .map((exp) => ({
          company: normalizeString(exp.company),
          position: normalizeString(exp.jobTitle),
          duration: `${normalizeString(exp.startDate)} - ${exp.current ? 'Present' : normalizeString(exp.endDate)}`,
          description: exp.description
            ? exp.description.split(/\n(?=[-•*]\s)/).filter(Boolean).map((l) => {
                const c = l.trim().replace(/^[-•*]\s*/, '');
                return c.startsWith('-') ? c : `- ${c}`;
              })
            : [`- Responsibilities at ${normalizeString(exp.company)}`],
        })),
      education: (userData.education || [])
        .filter((edu) => edu.degree && edu.school)
        .map((edu) => ({
          institution: normalizeString(edu.school),
          degree: normalizeString(edu.degree),
          graduation: normalizeString(edu.graduationDate),
          gpa: normalizeString(edu.gpa) || undefined,
        })),
      skills: { technical: [], soft: [] },
      projects: [],
      certifications: [],
    };
  }
  return {
    personalInfo: { name: '', email: '', phone: '', location: '', linkedIn: '', portfolio: '' },
    summary: '',
    experience: [],
    education: [],
    skills: { technical: [], soft: [] },
    projects: [],
    certifications: [],
  };
};

export const generateResume = async ({ jobDescription, templateId, userData }) => {
  const trimmedDescription = normalizeString(jobDescription);
  const resolvedTemplateId = normalizeString(templateId) || 'default';
  const sanitizedUserData = userData && typeof userData === 'object' ? userData : null;

  if (!trimmedDescription) throw new Error('Job description is required');

  try {
    getGenAI(); // validate key exists
  } catch (err) {
    console.warn('[CREATE] API key missing, using fallback:', err.message);
    return {
      resume: createUserBasedFallback(sanitizedUserData),
      meta: { source: 'fallback', reason: err.message },
    };
  }

  try {
    const prompt = buildResumePrompt(trimmedDescription, resolvedTemplateId, sanitizedUserData);
    console.log(`[CREATE] Calling Gemini ${getModel()} for resume generation...`);
    const raw = await callGemini(prompt);
    const parsed = parseResumeResult(raw);
    console.log(`[CREATE] Resume generation complete`);
    return { resume: parsed, meta: { source: 'ai', model: getModel() } };
  } catch (err) {
    console.error('[CREATE] Generation failed:', err.message);
    return {
      resume: createUserBasedFallback(sanitizedUserData),
      meta: { source: 'fallback', reason: err.message },
    };
  }
};
