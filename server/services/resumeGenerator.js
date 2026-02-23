import OpenAI from 'openai';

let cachedClient = null;
let cachedConfig = null;

const getClientConfig = () => {
  const apiKey = (process.env.DEEPSEEK_API_KEY || '').trim();
  const baseURL = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').trim();
  const model = (process.env.DEEPSEEK_MODEL || 'deepseek-chat').trim();
  return { apiKey, baseURL, model };
};

const getDeepseekClient = () => {
  const config = getClientConfig();
  if (!config.apiKey) {
    return { client: null, config, error: new Error('DEEPSEEK_API_KEY is required') };
  }

  const needsRefresh = !cachedClient
    || !cachedConfig
    || cachedConfig.apiKey !== config.apiKey
    || cachedConfig.baseURL !== config.baseURL;

  if (needsRefresh) {
    cachedClient = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    });
    cachedConfig = { apiKey: config.apiKey, baseURL: config.baseURL };
  }

  return { client: cachedClient, config, error: null };
};

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const buildResumePrompt = (jobDescription, templateId, userData) => {
  const hasUserData = userData && userData.personalDetails;

  const userSummary = hasUserData ? `
USER'S CURRENT INFORMATION:
Personal Details:
- Name: ${normalizeString(userData.personalDetails.fullName)}
- Email: ${normalizeString(userData.personalDetails.email)}
- Phone: ${normalizeString(userData.personalDetails.phone)}
- Location: ${normalizeString(userData.personalDetails.location)}
- LinkedIn: ${normalizeString(userData.personalDetails.linkedin)}
- Website: ${normalizeString(userData.personalDetails.website)}
- Current Summary: ${normalizeString(userData.personalDetails.summary)}

Work Experience:
${(userData.experiences || []).map((exp, i) => `
${i + 1}. ${normalizeString(exp.jobTitle)} at ${normalizeString(exp.company)} (${normalizeString(exp.startDate)} - ${exp.current ? 'Present' : normalizeString(exp.endDate)})
   Location: ${normalizeString(exp.location)}
   Description: ${normalizeString(exp.description)}
`).join('')}

Education:
${(userData.education || []).map((edu, i) => `
${i + 1}. ${normalizeString(edu.degree)} from ${normalizeString(edu.school)} (${normalizeString(edu.graduationDate)})
   Location: ${normalizeString(edu.location)}
   GPA: ${normalizeString(edu.gpa) || 'Not provided'}
`).join('')}

Skills: ${normalizeString(userData.skills)}

CUSTOMIZATION INSTRUCTIONS:
1. ANALYZE the job description to identify:
   - Required technical skills and tools
   - Preferred soft skills and qualities
   - Key responsibilities and requirements
   - Industry keywords and terminology
   - Company culture and values

2. TRANSFORM the user's content by:
   - Rewriting their professional summary to mirror the job requirements
   - Enhancing their work experience descriptions to highlight relevant achievements
   - Reorganizing and expanding their skills to match job requirements
   - Adding industry-specific keywords naturally throughout
   - Quantifying achievements with realistic numbers where missing
   - Using action verbs that match the job posting tone

3. PRIORITIZE content that matches the job description while keeping all factual information accurate.
` : `
RESUME CREATION INSTRUCTIONS:
Since no user data is provided, create a professional resume template that perfectly matches the job requirements:

1. ANALYZE the job description to identify:
   - Required technical skills and tools
   - Preferred soft skills and qualities
   - Key responsibilities and requirements
   - Industry keywords and terminology
   - Experience level and qualifications needed

2. CREATE compelling resume content that includes:
   - A professional summary that mirrors the job requirements
   - Relevant work experience that demonstrates the required skills
   - Education background appropriate for the role
   - Technical and soft skills that match the job posting
   - Projects and achievements that align with job responsibilities

3. ENSURE the resume is:
   - ATS-optimized with relevant keywords
   - Professionally written with strong action verbs
   - Quantified with realistic metrics and achievements
   - Tailored specifically to this job opportunity
`;

  return `
You are an expert resume writer who specializes in creating professional resumes that match specific job requirements. Analyze the job description below and create a compelling, ATS-optimized resume.

TARGET JOB DESCRIPTION:
${jobDescription}

${userSummary}

Template Style: ${templateId}

Please provide the resume data in the following JSON format:
{
  "personalInfo": {
    "name": "Professional Name",
    "email": "email@example.com",
    "phone": "(555) 123-4567",
    "location": "City, State",
    "linkedIn": "linkedin.com/in/profile",
    "portfolio": "portfolio-url.com"
  },
  "summary": "Compelling 2-3 sentence professional summary that highlights relevant experience and matches the job requirements",
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "duration": "MM/YYYY - MM/YYYY",
      "description": [
        "- Achievement-focused bullet point with quantified results",
        "- Another accomplishment that demonstrates relevant skills",
        "- Third bullet showing impact and value delivered"
      ]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science in Computer Science",
      "graduation": "YYYY",
      "gpa": "3.8"
    }
  ],
  "skills": {
    "technical": ["Skills that directly match the job requirements", "Tools mentioned in job posting", "Technologies from job description"],
    "soft": ["Soft skills specifically mentioned in job posting", "Leadership qualities requested", "Communication skills emphasized"]
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description of the project and its impact",
      "technologies": ["Tech1", "Tech2", "Tech3"]
    }
  ],
  "certifications": ["Certification 1", "Certification 2"]
}

CRITICAL REQUIREMENTS:
1. Skills Section Transformation:
   - Extract exact technical skills, tools, and software mentioned in the job description
   - Include programming languages, frameworks, and technologies from the job posting
   - Add relevant certifications or qualifications mentioned in requirements
   - Prioritize skills that appear multiple times in the job description

2. Experience Description Enhancement:
   - Rewrite job descriptions to emphasize achievements that match job requirements
   - Include industry-specific terminology from the job posting
   - Add quantified achievements that align with job responsibilities
   - Use action verbs that mirror the job description language

3. Professional Summary Customization:
   - Mirror the exact qualifications and experience requirements
   - Include key phrases and keywords from the job posting
   - Highlight years of experience that match their requirements
   - Emphasize personality traits and soft skills they're seeking

4. Keyword Integration:
   - Naturally incorporate exact keywords and phrases from job description
   - Include company-specific terminology if mentioned
   - Add industry buzzwords and technical jargon used in the posting
   - Ensure ATS optimization with relevant keyword density

5. Content Prioritization:
   - Lead with information most relevant to the job requirements
   - Emphasize experiences that align with job responsibilities
   - Highlight education and projects that match their needs
   - De-emphasize or reframe less relevant background

STRICT RULES:
- Keep all factual information (names, companies, schools, dates) accurate
- Only enhance descriptions, summaries, and skill presentations
- Do not fabricate experiences, education, or achievements
- Focus on reframing existing background to match job requirements
- Make the resume feel like it was written specifically for this job
`.trim();
};

const parseResumeResult = (result) => {
  const jsonMatch = result.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No valid JSON found in AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  if (!parsed.personalInfo || !parsed.summary || !parsed.experience) {
    throw new Error('Invalid resume structure');
  }

  return parsed;
};

const extractSkillsFromJobDescription = (jobDescription) => {
  const skillKeywords = [
    'JavaScript', 'Python', 'Java', 'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Next.js', 'HTML', 'CSS', 'Sass', 'Bootstrap', 'Tailwind',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL', 'NoSQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Git', 'GitHub', 'GitLab',
    'Linux', 'Unix', 'Agile', 'Scrum', 'REST', 'API', 'GraphQL', 'Microservices', 'TDD', 'Unit Testing'
  ];

  const extracted = [];
  const lowerJobDesc = jobDescription.toLowerCase();

  skillKeywords.forEach((skill) => {
    if (lowerJobDesc.includes(skill.toLowerCase())) {
      extracted.push(skill);
    }
  });

  const skillPatterns = [
    /\b[A-Z][a-z]*\.js\b/g,
    /\b[A-Z]{2,}\b/g
  ];

  skillPatterns.forEach((pattern) => {
    const matches = jobDescription.match(pattern);
    if (!matches) return;
    matches.forEach((match) => {
      if (!extracted.includes(match) && match.length > 2) {
        extracted.push(match);
      }
    });
  });

  return [...new Set(extracted)];
};

const createUserBasedFallback = (jobDescription, userData) => {
  const jobKeywords = jobDescription ? extractSkillsFromJobDescription(jobDescription) : [];

  if (userData && userData.personalDetails) {
    return {
      personalInfo: {
        name: normalizeString(userData.personalDetails.fullName) || 'User',
        email: normalizeString(userData.personalDetails.email) || 'user@email.com',
        phone: normalizeString(userData.personalDetails.phone) || '(555) 123-4567',
        location: normalizeString(userData.personalDetails.location) || 'City, State',
        linkedIn: normalizeString(userData.personalDetails.linkedin) || undefined,
        portfolio: normalizeString(userData.personalDetails.website) || undefined
      },
      summary: normalizeString(userData.personalDetails.summary) || 'Professional with diverse experience and strong technical skills.',
      experience: (userData.experiences || [])
        .filter((exp) => exp.jobTitle && exp.company)
        .map((exp) => ({
          company: normalizeString(exp.company),
          position: normalizeString(exp.jobTitle),
          duration: `${normalizeString(exp.startDate)} - ${exp.current ? 'Present' : normalizeString(exp.endDate)}`,
          description: exp.description
            ? exp.description
              .split(/\n(?=[-•●○◦▪▸►✓✔→⁃∙·*]\s)/) // Split only at bullet starts
              .filter((line) => line.trim())
              .map((line) => {
                const cleaned = line.trim().replace(/^[-•●○◦▪▸►✓✔→⁃∙·*]\s*/, '');
                return cleaned.startsWith('-') ? cleaned : `- ${cleaned}`;
              })
            : [`- Responsibilities and achievements at ${normalizeString(exp.company)}`]
        })),
      education: (userData.education || [])
        .filter((edu) => edu.degree && edu.school)
        .map((edu) => ({
          institution: normalizeString(edu.school),
          degree: normalizeString(edu.degree),
          graduation: normalizeString(edu.graduationDate),
          gpa: normalizeString(edu.gpa) || undefined
        })),
      skills: {
        technical: userData.skills
          ? [...userData.skills.split(',').map((s) => s.trim()).filter(Boolean), ...jobKeywords].slice(0, 12)
          : jobKeywords.slice(0, 8),
        soft: ['Communication', 'Leadership', 'Problem Solving', 'Teamwork']
      },
      projects: [],
      certifications: []
    };
  }

  const fallbackData = getFallbackResumeData();
  if (jobKeywords.length > 0) {
    fallbackData.skills.technical = [...new Set([...fallbackData.skills.technical, ...jobKeywords])].slice(0, 12);
  }

  return fallbackData;
};

const getFallbackResumeData = () => ({
  source: 'fallback',
  status: 'failed',
  confidence: 0,
  data: {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      portfolio: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: []
    },
    projects: [],
    certifications: []
  }
});

export const generateResume = async ({ jobDescription, templateId, userData }) => {
  const trimmedDescription = normalizeString(jobDescription);
  const resolvedTemplateId = normalizeString(templateId) || 'default';
  const sanitizedUserData = userData && typeof userData === 'object' ? userData : null;

  if (!trimmedDescription) {
    throw new Error('Job description is required');
  }

  const { client, config, error } = getDeepseekClient();
  if (!client) {
    const fallback = createUserBasedFallback(trimmedDescription, sanitizedUserData);
    return {
      resume: fallback,
      meta: { source: 'fallback', reason: error.message }
    };
  }

  try {
    const prompt = buildResumePrompt(trimmedDescription, resolvedTemplateId, sanitizedUserData);
    const completion = await client.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer and career consultant. Create compelling, ATS-optimized resumes that perfectly match job requirements while highlighting relevant skills and experience.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const result = completion?.choices?.[0]?.message?.content;
    if (!result) {
      throw new Error('No resume data received from AI');
    }

    const parsed = parseResumeResult(result);
    return {
      resume: parsed,
      meta: { source: 'ai', model: config.model }
    };
  } catch (err) {
    const fallback = createUserBasedFallback(trimmedDescription, sanitizedUserData);
    return {
      resume: fallback,
      meta: { source: 'fallback', reason: err.message }
    };
  }
};
