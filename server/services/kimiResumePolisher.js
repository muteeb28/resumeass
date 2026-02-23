import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

let cachedClient = null;
let cachedConfig = null;
let cachedGeminiModel = null;
let cachedGeminiConfig = null;

const getProviderConfig = () => {
  const preferredProvider = (process.env.POLISH_PROVIDER || '').trim().toLowerCase();
  const geminiKey = (process.env.GEMINI_POLISH_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  const deepseekKey = (process.env.DEEPSEEK_API_KEY || '').trim();
  const kimiKey = (process.env.KIMI_API_KEY || process.env.kimi_k2 || '').trim();

  const geminiConfig = geminiKey
    ? {
      provider: 'gemini',
      apiKey: geminiKey,
      model: (process.env.GEMINI_POLISH_MODEL || process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim(),
      maxTokens: Number(process.env.GEMINI_POLISH_MAX_TOKENS || 3000),
      temperature: Number(process.env.GEMINI_POLISH_TEMPERATURE || 0.2),
      timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS || 90000)
    }
    : null;

  const deepseekConfig = deepseekKey
    ? {
      provider: 'deepseek',
      apiKey: deepseekKey,
      baseURL: (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').trim(),
      model: (process.env.DEEPSEEK_MODEL || 'deepseek-chat').trim(),
      maxTokens: Number(process.env.DEEPSEEK_MAX_TOKENS || 3000),
      temperature: Number(process.env.DEEPSEEK_TEMPERATURE || 0.2),
      timeoutMs: Number(process.env.DEEPSEEK_TIMEOUT_MS || 90000)
    }
    : null;

  const kimiConfig = kimiKey
    ? {
      provider: 'kimi',
      apiKey: kimiKey,
      baseURL: (process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1').trim(),
      model: (process.env.KIMI_MODEL || 'kimi-k2').trim(),
      maxTokens: Number(process.env.KIMI_MAX_TOKENS || 3000),
      temperature: Number(process.env.KIMI_TEMPERATURE || 0.2),
      timeoutMs: Number(process.env.KIMI_TIMEOUT_MS || 90000)
    }
    : null;

  if (preferredProvider) {
    if (preferredProvider === 'gemini') {
      if (!geminiConfig) {
        throw new Error('GEMINI_API_KEY is required for Gemini polish');
      }
      return geminiConfig;
    }
    if (preferredProvider === 'deepseek') {
      if (!deepseekConfig) {
        throw new Error('DEEPSEEK_API_KEY is required for DeepSeek polish');
      }
      return deepseekConfig;
    }
    if (preferredProvider === 'kimi') {
      if (!kimiConfig) {
        throw new Error('KIMI_API_KEY is required for Kimi polish');
      }
      return kimiConfig;
    }
    throw new Error('POLISH_PROVIDER must be gemini, deepseek, or kimi');
  }

  if (geminiConfig) return geminiConfig;
  if (deepseekConfig) return deepseekConfig;
  if (kimiConfig) return kimiConfig;

  throw new Error('GEMINI_API_KEY, DEEPSEEK_API_KEY, or KIMI_API_KEY is required');
};

const getOpenAIClient = (config) => {
  if (!cachedClient || !cachedConfig || cachedConfig.apiKey !== config.apiKey || cachedConfig.baseURL !== config.baseURL) {
    cachedClient = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
      timeout: config.timeoutMs
    });
    cachedConfig = { apiKey: config.apiKey, baseURL: config.baseURL };
  }
  return cachedClient;
};

const getGeminiModel = (config) => {
  if (!cachedGeminiModel || !cachedGeminiConfig ||
    cachedGeminiConfig.apiKey !== config.apiKey ||
    cachedGeminiConfig.model !== config.model ||
    cachedGeminiConfig.temperature !== config.temperature ||
    cachedGeminiConfig.maxTokens !== config.maxTokens
  ) {
    const genAI = new GoogleGenerativeAI(config.apiKey);
    cachedGeminiModel = genAI.getGenerativeModel({
      model: config.model,
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens
      }
    });
    cachedGeminiConfig = {
      apiKey: config.apiKey,
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens
    };
  }
  return cachedGeminiModel;
};

const callGemini = async (prompt, config) => {
  const model = getGeminiModel(config);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Gemini API timeout')), config.timeoutMs);
  });

  const result = await Promise.race([
    model.generateContent(prompt),
    timeoutPromise
  ]);

  const response = await result.response;
  return response.text();
};

const stripCodeFences = (value) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed.startsWith('```')) return trimmed;
  const match = trimmed.match(/```[a-z]*\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : trimmed.replace(/```/g, '').trim();
};

const SECTION_ORDER = ['summary', 'skills', 'experience', 'projects', 'education', 'certifications'];
const SECTION_LABELS = {
  summary: 'PROFESSIONAL SUMMARY',
  skills: 'SKILLS',
  experience: 'EXPERIENCE',
  projects: 'PROJECTS',
  education: 'EDUCATION',
  certifications: 'CERTIFICATIONS'
};
const SECTION_ALIASES = {
  summary: ['professional summary', 'executive summary', 'summary', 'profile', 'objective', 'overview'],
  skills: ['skills', 'technical skills', 'core skills', 'core competencies', 'competencies', 'technologies', 'tech stack'],
  experience: ['experience', 'work experience', 'professional experience', 'employment', 'work history', 'employment history', 'career history'],
  projects: ['projects', 'project experience', 'portfolio', 'key projects', 'notable projects', 'personal projects', 'side projects'],
  education: ['education', 'academics', 'academic background', 'education & training', 'qualifications'],
  certifications: ['certifications', 'certificates', 'licenses', 'credentials']
};

const normalizeHeading = (line) => line
  .replace(/^[#>\-\*\+\s]+/, '')
  .replace(/[*_`]+/g, '')
  .replace(/:\s*$/, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const matchSection = (line) => {
  const normalized = normalizeHeading(line);
  if (!normalized) return null;
  for (const [section, aliases] of Object.entries(SECTION_ALIASES)) {
    if (aliases.includes(normalized)) {
      return section;
    }
  }
  return null;
};

const parseSections = (text) => {
  const sections = { header: [] };
  SECTION_ORDER.forEach((section) => {
    sections[section] = [];
  });

  let current = 'header';
  text.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      sections[current].push('');
      return;
    }
    const matched = matchSection(trimmed);
    if (matched) {
      current = matched;
      return;
    }
    sections[current].push(trimmed);
  });

  return sections;
};

const countWords = (lines) => {
  return lines
    .join(' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean).length;
};

const countBullets = (lines) => {
  return lines.filter((line) => /^[-•*]\s+/.test(line.trim())).length;
};

const hasContent = (lines) => lines.some((line) => line.trim().length > 0);

const rebuildText = (sections) => {
  const headerLines = sections.header || [];
  const output = [];

  headerLines.forEach((line) => {
    if (line.trim()) {
      output.push(line);
    }
  });

  SECTION_ORDER.forEach((section) => {
    const lines = sections[section] || [];
    const filtered = lines.filter((line) => line.trim());
    if (filtered.length === 0) return;
    if (output.length) output.push('');
    output.push(SECTION_LABELS[section]);
    output.push(...filtered);
  });

  return output.join('\n').replace(/\n{3,}/g, '\n\n').trim();
};

const extractCertificationLines = (text) => {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => /certif|credential|license|licen[cs]e|pmp|csm|scrum master|prince2|aws|azure|gcp|google cloud|oracle|cisco/i.test(line));
};

export async function polishResumeText(rawText) {
  const input = typeof rawText === 'string' ? rawText.trim() : '';
  if (!input) {
    throw new Error('Resume text is required');
  }

  const config = getProviderConfig();
  const inputSections = parseSections(input);
  const certificationLines = extractCertificationLines(input);

  const systemPrompt = [
    'You are an ATS resume editor.',
    'Preserve all facts, dates, names, roles, companies, and technologies exactly as provided.',
    'Do NOT invent achievements, metrics, employers, or dates.',
    'Do NOT add placeholders. If something is missing, omit it.',
    'Return plain text only. No markdown, no code fences.'
  ].join(' ');

  const certificationHint = certificationLines.length > 0
    ? [
      'Certifications detected in the input. Preserve them verbatim under a CERTIFICATIONS section:',
      ...certificationLines.map((line) => `- ${line}`)
    ].join('\n')
    : '';

  const userPrompt = [
    'Polish the resume below into a clean, ATS-friendly version.',
    'Keep the content complete but concise. Rephrase for clarity and strong action verbs.',
    'Use these section headers when applicable:',
    'PROFESSIONAL SUMMARY, SKILLS, EXPERIENCE, PROJECTS, EDUCATION, CERTIFICATIONS.',
    'If the input includes certifications or certificates, you MUST include a CERTIFICATIONS section and list each item.',
    'Use simple bullet points starting with "- " for achievements.',
    certificationHint,
    'Resume text:',
    input
  ].filter(Boolean).join('\n');

  let rawResponse = '';

  if (config.provider === 'gemini') {
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    rawResponse = await callGemini(combinedPrompt, config);
  } else {
    const client = getOpenAIClient(config);
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    });
    rawResponse = response?.choices?.[0]?.message?.content || '';
  }

  const cleaned = stripCodeFences(rawResponse);

  if (!cleaned) {
    throw new Error('Polish response was empty');
  }

  const polishedSections = parseSections(cleaned);
  const finalSections = { ...polishedSections };

  const headerHasEmail = (polishedSections.header || []).some((line) => /@/.test(line));
  const inputHasEmail = (inputSections.header || []).some((line) => /@/.test(line));
  if (!headerHasEmail && inputHasEmail) {
    finalSections.header = inputSections.header;
  }

  SECTION_ORDER.forEach((section) => {
    const inputLines = inputSections[section] || [];
    const outputLines = polishedSections[section] || [];

    if (hasContent(inputLines) && !hasContent(outputLines)) {
      finalSections[section] = inputLines;
      return;
    }

    const inputWordCount = countWords(inputLines);
    const outputWordCount = countWords(outputLines);
    const inputBulletCount = countBullets(inputLines);
    const outputBulletCount = countBullets(outputLines);

    const lostBullets = inputBulletCount >= 3 && outputBulletCount < Math.ceil(inputBulletCount * 0.6);
    const lostWords = inputWordCount >= 80 && outputWordCount < Math.ceil(inputWordCount * 0.6);

    if (lostBullets || lostWords) {
      finalSections[section] = inputLines;
    }
  });

  return rebuildText(finalSections);
}
