import fs from 'fs';

const OCR_ENDPOINT = 'https://api.mistral.ai/v1/ocr';
const OCR_MODEL = 'mistral-ocr-latest';
const TIMEOUT_MS = 90_000;

function getApiKey() {
  return process.env.MISTRAL_API_KEY;
}

// JSON schema matching the portfolioly format that normalizeParserResponse() already handles
const RESUME_SCHEMA = {
  type: 'object',
  properties: {
    personal_info: {
      type: 'object',
      properties: {
        full_name: { type: 'string' },
        headline: { type: 'string' },
        email: { type: 'string' },
        phone: { type: 'string' },
        location: { type: 'string' },
        summary: { type: 'string' },
        profiles: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              network: { type: 'string' },
              username: { type: 'string' },
              url: { type: 'string' }
            },
            required: ['url'],
            additionalProperties: false,
          },
        },
      },
      required: ['full_name'],
      additionalProperties: false,
    },
    work_experiences: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          organization: { type: 'string' },
          title: { type: 'string' },
          location: { type: 'string' },
          start_date: { type: 'string' },
          end_date: { type: 'string' },
          is_current: { type: 'boolean' },
          gpa: { type: 'string' },
          honors: { type: 'array', items: { type: 'string' } },
          highlights: { type: 'array', items: { type: 'string' } },
          highlights: { type: 'array', items: { type: 'string' } },
          technologies: { type: 'array', items: { type: 'string' } },
        },
        required: ['organization', 'title'],
        additionalProperties: false,
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          institution: { type: 'string' },
          degree: { type: 'string' },
          location: { type: 'string' },
          start_date: { type: 'string' },
          end_date: { type: 'string' },
          is_current: { type: 'boolean' },
        },
        required: ['institution'],
        additionalProperties: false,
      },
    },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          role: { type: 'string' },
          start_date: { type: 'string' },
          end_date: { type: 'string' },
          location: { type: 'string' },
          highlights: { type: 'array', items: { type: 'string' } },
          technologies: { type: 'array', items: { type: 'string' } },
          live_link: { type: 'string' },
          github: { type: 'string' },
        },
        required: ['name'],
        additionalProperties: false,
      },
    },
    skills: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              items: { type: 'array', items: { type: 'string' } },
            },
            required: ['name', 'items'],
            additionalProperties: false,
          },
        },
      },
      required: ['categories'],
      additionalProperties: false,
    },
    certifications: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          issuer: { type: 'string' },
          date: { type: 'string' },
        },
        required: ['name'],
        additionalProperties: false,
      },
    },
    achievements: {
      type: 'array',
      items: { type: 'string' },
    },
    coursework: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['personal_info'],
  additionalProperties: false,
};

const ANNOTATION_PROMPT = `Extract ALL resume information faithfully. Follow these rules strictly:

PERSONAL INFO:
- Extract email addresses, phone numbers, and location only when explicitly present.
- Phone: read each digit individually — never drop, transpose, or merge digits. Count every digit carefully.
- For links/profiles, preserve exactly what appears in the document.
- If shown as handles like "Github:// username" or "LinkedIn:// username", keep that form.
- Do NOT infer or fabricate full profile URLs from names/handles.

WORK EXPERIENCE:
- Extract title/role and organization exactly as written.
- Capture location metadata (e.g., Remote/Hybrid/Onsite/city, country) when present anywhere in the job block.
- Preserve all bullets exactly as written (including duplicates).
- Dates should be start_date and end_date as strings. Always include both start AND end (e.g. "July 2020" and "Present").

EDUCATION:
- Extract institution, degree, graduation date(s), and location.
- Always extract BOTH start and end year. If only graduation year is shown and it is a 4-year degree, subtract 4 for the start year.
- Extract GPA/CGPA exactly as labelled (e.g. "CGPA: 7.69"). Look anywhere in the education block — inline, in parentheses, in a sub-line.
- Extract honors/Dean's list and highlights when present.

SKILLS:
- Keep explicit skill categories exactly as labelled (Expert, Senior, High Knowledge, Tinkering, Languages, Frameworks, etc.).
- Do not put all skills into a single category.
- Extract coursework into coursework field when present.

PROJECTS:
- Extract project role metadata and dates when present.
- If a project appears inside a company's experience block, use the company's date range and mark role as "Professional".
- Extract live_link: any URL associated with the project — website, App Store, Play Store, GitHub, or domain (e.g. "cointopper.com").
- Extract technologies only if explicitly listed as tech/stack/tools.
- Preserve impact metrics (downloads, users, revenue) in highlights exactly as written.

TEXT NORMALISATION — apply these corrections automatically:
- "Al" (A + lowercase l) → "AI" when referring to Artificial Intelligence; "Gen Al" → "Gen AI"
- "A, B Testing" → "A/B Testing"
- "Neo-6,000,000 GPS" or similar comma-separated part numbers → "Neo-6M GPS"
- "3d Printing" or "3D printing" → "3D Printing"
- "go" as a standalone skill → "Go" (programming language)
- "Rest API" → "REST API"; "GIT" (all caps) → "Git"
- "fine tuning" or "finetuning" → "Fine-tuning"
- "BLOC" → "BLoC"; "tensorflow" or "Tensorflow" → "TensorFlow"
- "Chat GPT" → "ChatGPT"; "Koltin" → "Kotlin"; "Olama" → "Ollama"; "Riverpods" → "Riverpod"
- "AWS lambda" → "AWS Lambda"; "Github" → "GitHub"; "Mysql" → "MySQL"
- "Ios" → "iOS"; "Javascript" → "JavaScript"; "Typescript" → "TypeScript"
- "Graphql" → "GraphQL"; "Nosql" → "NoSQL"
- Trailing punctuation on technology names (e.g. "Websockets." → "Websockets")`;

export function isMistralConfigured() {
  const key = getApiKey();
  return Boolean(key && key.trim().length > 0);
}

/**
 * Patch structured output using raw OCR markdown to fill gaps the model missed.
 */
function patchFromMarkdown(structured, markdown) {
  const pi = structured.personal_info || {};
  const lines = markdown.split('\n').map((line) => line.trim()).filter(Boolean);
  const normalizeUrl = (value) => {
    if (!value || typeof value !== 'string') return '';
    const trimmed = value.trim().replace(/[),.;]+$/, '');
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^(www\.)?[\w.-]+\.[a-z]{2,}([\/#?].*)?$/i.test(trimmed)) {
      return `https://${trimmed.replace(/^www\./i, '')}`;
    }
    return '';
  };
  const isGenericProfileRoot = (url) => {
    const normalized = normalizeUrl(url).toLowerCase();
    return !normalized ||
      normalized === 'https://github.com' ||
      normalized === 'https://www.github.com' ||
      normalized === 'https://linkedin.com' ||
      normalized === 'https://www.linkedin.com' ||
      normalized === 'https://linkedin.com/in' ||
      normalized === 'https://www.linkedin.com/in';
  };

  // Patch email
  if (!pi.email) {
    const emailMatch = markdown.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
    if (emailMatch) {
      pi.email = emailMatch[0];
      console.log('[MISTRAL OCR] Patched email from markdown:', pi.email);
    }
  }

  // Patch phone
  if (!pi.phone) {
    const phoneMatch = markdown.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      pi.phone = phoneMatch[0].trim();
      console.log('[MISTRAL OCR] Patched phone from markdown:', pi.phone);
    }
  }

  // Patch location
  if (!pi.location) {
    // Common patterns: "City, State", "City, Country"
    const locMatch = markdown.match(/(?:Location|Address|Based in)[:\s]*([^\n|]+)/i);
    if (locMatch) {
      pi.location = locMatch[1].trim();
      console.log('[MISTRAL OCR] Patched location from markdown:', pi.location);
    } else {
      const locationLine = lines.find((line) => {
        if (line.length > 70 || !line.includes(',')) return false;
        if (/@|https?:\/\/|linkedin|github|skills|experience|projects|education/i.test(line)) return false;
        return /^[a-zA-Z\s,.-]+$/.test(line);
      });
      if (locationLine) {
        pi.location = locationLine;
        console.log('[MISTRAL OCR] Patched location from header-like line:', pi.location);
      }
    }
  }  // Patch profiles without hallucinating usernames.
  // 1) Keep only explicit URLs already present in the document.
  // 2) Preserve handle-format links like "Github:// username" as-is.
  const explicitUrls = [...markdown.matchAll(/https?:\/\/[^\s)\]>]+/g)]
    .map((m) => normalizeUrl(m[0]))
    .filter(Boolean)
    .filter((url) => !isGenericProfileRoot(url));
  const handleProfiles = lines
    .map((line) => line.match(/^(github|linkedin)\s*:\/\/\s*([a-zA-Z0-9._-]+)\s*$/i))
    .filter(Boolean)
    .map((match) => {
      const networkRaw = match[1].toLowerCase();
      const username = match[2].trim();
      return {
        network: networkRaw === 'github' ? 'GitHub' : 'LinkedIn',
        username,
        url: `${networkRaw}://${username}`,
      };
    });

  const existingMeaningful = (pi.profiles || [])
    .map((p) => ({
      network: p.network || '',
      username: p.username || '',
      url: normalizeUrl(p.url || '') || (typeof p.url === 'string' ? p.url.trim() : ''),
    }))
    .filter((p) => p.url && !isGenericProfileRoot(p.url));

  const mergedProfiles = [
    ...existingMeaningful,
    ...explicitUrls.map((url) => ({ network: '', username: '', url })),
    ...handleProfiles,
  ].filter((profile, index, arr) => arr.findIndex((p) => p.url.toLowerCase() === profile.url.toLowerCase()) === index);

  if (mergedProfiles.length > 0) {
    pi.profiles = mergedProfiles;
    console.log('[MISTRAL OCR] Patched profiles from markdown:', mergedProfiles.length, 'entries');
  }

  // Patch work experience titles if model left title empty or same as company.
  const experiences = structured.work_experiences || [];
  for (const exp of experiences) {
    if (!exp.title || exp.title === exp.organization) {
      // Try to find a role near the company name in markdown
      const companyEscaped = exp.organization.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rolePattern = new RegExp(
        `(?:${companyEscaped})[\\s\\n]*([A-Z][a-zA-Z &/]+(?:Developer|Engineer|Designer|Manager|Lead|Analyst|Intern|Consultant|Architect|Specialist|Director|Coordinator))`,
        'i'
      );
      const roleMatch = markdown.match(rolePattern);
      if (roleMatch) {
        exp.title = roleMatch[1].trim();
        console.log('[MISTRAL OCR] Patched role for', exp.organization, ':', exp.title);
      }
      // Also try reverse: role before company
      if (!exp.title || exp.title === exp.organization) {
        const reversePattern = new RegExp(
          `([A-Z][a-zA-Z &/]+(?:Developer|Engineer|Designer|Manager|Lead|Analyst|Intern|Consultant|Architect|Specialist|Director|Coordinator))[\\s\\n]*(?:at|@|[-–—|,])?\\s*${companyEscaped}`,
          'i'
        );
        const reverseMatch = markdown.match(reversePattern);
        if (reverseMatch) {
          exp.title = reverseMatch[1].trim();
          console.log('[MISTRAL OCR] Patched role (reverse) for', exp.organization, ':', exp.title);
        }
      }
    }
  }

  // Patch education — fill institution if empty
  const eduEntries = structured.education || [];
  for (const edu of eduEntries) {
    if (!edu.institution || edu.institution.length < 3) {
      // Look for university/college/institute names in markdown
      const instMatch = markdown.match(
        /(?:^|\n)\s*([A-Z][^\n]*(?:University|College|Institute|School|Academy)[^\n]*)/i
      );
      if (instMatch) {
        edu.institution = instMatch[1].trim();
        console.log('[MISTRAL OCR] Patched institution from markdown:', edu.institution);
      }
    }
  }

  // Patch education metadata (GPA / honors) if present in raw lines.
  for (const edu of eduEntries) {
    if (!edu.gpa) {
      const gpaLine = lines.find((line) => /(cgpa|gpa)\s*[:\-]/i.test(line));
      if (gpaLine) {
        const gpaValue = gpaLine.replace(/.*?(cgpa|gpa)\s*[:\-]\s*/i, '').trim();
        if (gpaValue) edu.gpa = gpaValue;
      }
    }

    if (!Array.isArray(edu.honors) || edu.honors.length === 0) {
      const honorsLines = lines.filter((line) => /(dean'?s list|honors?|distinction)/i.test(line));
      if (honorsLines.length) {
        edu.honors = honorsLines;
      }
    }
  }

  // Patch experience location from metadata lines like "Dates | Remote".
  for (const exp of experiences) {
    if (exp.location || !exp.organization) continue;
    const companyEscaped = exp.organization.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const metaLine = lines.find((line) => new RegExp(companyEscaped, 'i').test(line) && line.includes('|'));
    if (!metaLine) continue;
    const parts = metaLine.split('|').map((part) => part.trim()).filter(Boolean);
    const locationPart = parts[parts.length - 1] || '';
    if (/^(remote|hybrid|onsite|on-site|[a-zA-Z\s]+,\s*[a-zA-Z\s]+)$/i.test(locationPart)) {
      exp.location = locationPart;
      console.log('[MISTRAL OCR] Patched experience location for', exp.organization, ':', exp.location);
    }
  }

  // Patch project metadata from nearby lines (dates and role).
  const projectEntries = structured.projects || [];
  const dateRangeRegex = /([A-Za-z]{3,9}\s*\d{4}|\d{4})\s*[-–—]\s*(Present|Current|[A-Za-z]{3,9}\s*\d{4}|\d{4})/i;
  for (const proj of projectEntries) {
    if (!proj.name) continue;
    const projectEscaped = proj.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const projectLineIndex = lines.findIndex((line) => new RegExp(`\\b${projectEscaped}\\b`, 'i').test(line));
    if (projectLineIndex < 0) continue;
    const nearby = lines.slice(projectLineIndex, Math.min(projectLineIndex + 5, lines.length));
    for (const line of nearby) {
      if ((!proj.start_date || !proj.end_date) && dateRangeRegex.test(line)) {
        const match = line.match(dateRangeRegex);
        if (match) {
          proj.start_date = proj.start_date || match[1].trim();
          proj.end_date = proj.end_date || match[2].trim();
        }
      }
      if (!proj.role && line.includes('|')) {
        const parts = line.split('|').map((part) => part.trim()).filter(Boolean);
        if (parts.length >= 2 && !dateRangeRegex.test(parts[parts.length - 1])) {
          proj.role = parts[parts.length - 1];
        }
      }
    }
  }

  // Do not infer a global headline from work entries.
  // Headline should only come from explicitly present header/title text.

  structured.personal_info = pi;
  return structured;
}

export async function parseResumeWithMistralOCR(filePath) {
  const apiKey = getApiKey();
  if (!apiKey || !apiKey.trim()) {
    throw new Error('MISTRAL_API_KEY is not configured');
  }

  console.log('[MISTRAL OCR] Reading PDF from disk…');
  const pdfBuffer = fs.readFileSync(filePath);
  const base64Data = pdfBuffer.toString('base64');

  const body = {
    model: OCR_MODEL,
    document: {
      type: 'document_url',
      document_url: `data:application/pdf;base64,${base64Data}`,
    },
    document_annotation_format: {
      type: 'json_schema',
      json_schema: {
        name: 'ResumeData',
        schema: RESUME_SCHEMA,
      },
    },
    document_annotation_prompt: ANNOTATION_PROMPT,
  };

  console.log('[MISTRAL OCR] Calling Mistral OCR API…');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OCR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Mistral OCR API ${response.status}: ${errText}`);
    }

    const result = await response.json();
    console.log('[MISTRAL OCR] Pages processed:', result.usage_info?.pages_processed ?? '?');

    // Get raw markdown from all pages
    const rawMarkdown = (result.pages || []).map(p => p.markdown || '').join('\n\n');
    console.log('[MISTRAL OCR] Raw markdown length:', rawMarkdown.length, 'chars');

    // Parse structured annotation
    const annotation = result.document_annotation;
    if (!annotation) {
      throw new Error('Mistral OCR returned no document_annotation');
    }

    let parsed = typeof annotation === 'string' ? JSON.parse(annotation) : annotation;

    // Hybrid: patch gaps from raw markdown
    parsed = patchFromMarkdown(parsed, rawMarkdown);

    parsed._parser = 'mistral-ocr';
    parsed._rawMarkdown = rawMarkdown;
    console.log('[MISTRAL OCR] Extraction complete —', parsed.personal_info?.full_name || 'unknown name');
    return parsed;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extract raw markdown text from a PDF using Mistral OCR.
 * No annotation/schema — just clean OCR output for downstream processing.
 * @param {string} filePath - Absolute path to the PDF file
 * @returns {Promise<string>} Raw markdown text from all pages
 */
export async function extractMarkdownFromPDF(filePath) {
  const apiKey = getApiKey();
  if (!apiKey || !apiKey.trim()) {
    throw new Error('MISTRAL_API_KEY is not configured');
  }

  console.log('[MISTRAL OCR] Reading PDF from disk…');
  const pdfBuffer = fs.readFileSync(filePath);
  const base64Data = pdfBuffer.toString('base64');

  const body = {
    model: OCR_MODEL,
    document: {
      type: 'document_url',
      document_url: `data:application/pdf;base64,${base64Data}`,
    },
  };

  console.log(`[MISTRAL OCR] Extracting markdown (${Math.round(pdfBuffer.length / 1024)}KB)…`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OCR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Mistral OCR API ${response.status}: ${errText}`);
    }

    const result = await response.json();
    console.log('[MISTRAL OCR] Pages processed:', result.usage_info?.pages_processed ?? '?');

    const markdown = (result.pages || []).map(p => p.markdown || '').join('\n\n');
    console.log('[MISTRAL OCR] Markdown length:', markdown.length, 'chars');
    return markdown;
  } finally {
    clearTimeout(timer);
  }
}

