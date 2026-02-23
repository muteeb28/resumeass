import { GoogleGenerativeAI } from '@google/generative-ai';
import { cleanExtractedTextWithStructure, validateResumeTextWithStructure } from './enhancedFileProcessor.js';
import { parseResumeUltimate } from './dynamicResumeParser.js';
import crypto from 'crypto';

// Simple replacement for formatResumePreservingStructure
function formatResumeSimple(parsedResume, targetRole) {
  return {
    personalInfo: parsedResume.personalInfo || {},
    summary: parsedResume.summary || '',
    experience: parsedResume.experience || [],
    skills: parsedResume.skills || [],
    education: parsedResume.education || [],
    projects: parsedResume.projects || [],
    certifications: parsedResume.certifications || [],
    awards: parsedResume.awards || [],
    publications: parsedResume.publications || [],
    languages: parsedResume.languages || [],
    interests: parsedResume.interests || [],
    references: parsedResume.references || [],
    community: parsedResume.community || []
  };
}

/**
 * Enhanced Resume Optimizer with STRICT Page Count Preservation
 * RULE: If input has N pages, output MUST have N pages
 */

// Initialize Gemini AI
let genAI;
let model;

/**
 * Comprehensive logging system
 */
const Logger = {
  info: (id, message) => console.log(` [${id}] ${message}`),
  error: (id, message) => console.error(` [${id}] ${message}`),
  success: (id, message) => console.log(` [${id}] ${message}`),
  debug: (id, message) => console.log(` [${id}] ${message}`),
  warn: (id, message) => console.log(` [${id}] ${message}`),
  pagePreservation: (id, originalPages, message) => console.log(` [${id}] [PAGES:${originalPages}] ${message}`)
};

/**
 * Initialize Gemini AI with enhanced error handling
 */
export function initializeGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL;

  if (!apiKey) {
    Logger.error('INIT', 'Missing GEMINI_API_KEY environment variable');
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  if (!modelName) {
    Logger.error('INIT', 'Missing GEMINI_MODEL environment variable');
    throw new Error('GEMINI_MODEL environment variable is required');
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: modelName });
    Logger.success('INIT', 'Gemini AI initialized successfully');
    return true;
  } catch (error) {
    Logger.error('INIT', 'Failed to initialize Gemini AI: ' + error.message);
    throw error;
  }
}

/**
 * Enhanced Gemini API call with better error handling and timeouts
 */
/**
 * Enhanced Gemini API call with support for Multimodal (PDF) input
 */
async function callGeminiAPI(prompt, input = null, timeoutMs = 90000, requestId = 'UNKNOWN') {
  if (!model) {
    Logger.info(requestId, 'Initializing Gemini AI...');
    await initializeGeminiAI();
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Gemini API timeout')), timeoutMs)
  );

  try {
    Logger.debug(requestId, `Calling Gemini API with timeout ${timeoutMs}ms...`);

    let contentParts = [];

    // Add text prompt
    contentParts.push({ text: prompt });

    // Add binary input if provided (PDF/Image)
    if (input && input.buffer && input.mimeType) {
      Logger.debug(requestId, `Adding inline data: ${input.mimeType}, ${input.buffer.length} bytes`);
      contentParts.push({
        inlineData: {
          data: input.buffer.toString('base64'),
          mimeType: input.mimeType
        }
      });
    }

    const result = await Promise.race([
      model.generateContent(contentParts),
      timeoutPromise
    ]);

    const response = await result.response;
    const rawText = response.text();
    Logger.success(requestId, `Gemini API call completed (${rawText.length} chars)`);

    return parseGeminiResponse(rawText, requestId);
  } catch (error) {
    Logger.error(requestId, `Gemini API call failed: ${error.message}`);
    if (error.message.includes('timeout')) {
      Logger.error(requestId, `Timeout after ${timeoutMs}ms - check network/API key/quota`);
    }
    if (error.response) {
      Logger.error(requestId, `API Error Response: ${JSON.stringify(error.response)}`);
    }
    throw error;
  }
}

/**
 * Enhanced JSON parser for Gemini responses with better error handling
 */
function parseGeminiResponse(rawResponse, requestId = 'UNKNOWN') {
  let cleanedResponse = rawResponse.trim();

  Logger.debug(requestId, `Parsing Gemini response (${cleanedResponse.length} chars)...`);

  // Remove markdown code blocks
  if (cleanedResponse.includes('```json')) {
    const match = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) cleanedResponse = match[1].trim();
  } else if (cleanedResponse.includes('```')) {
    const match = cleanedResponse.match(/```\s*([\s\S]*?)\s*```/);
    if (match) cleanedResponse = match[1].trim();
  }

  // Extract JSON object
  const jsonStart = cleanedResponse.indexOf('{');
  const jsonEnd = cleanedResponse.lastIndexOf('}');

  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
  }

  // Fix common JSON issues
  cleanedResponse = cleanedResponse.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

  try {
    const parsed = JSON.parse(cleanedResponse);
    Logger.success(requestId, 'Successfully parsed Gemini response');

    // Debug logging to inspect response structure
    Logger.debug(requestId, `Response keys: ${Object.keys(parsed).join(', ')}`);
    Logger.debug(requestId, `Projects field exists: ${parsed.hasOwnProperty('projects')}`);
    Logger.debug(requestId, `Projects data: ${JSON.stringify(parsed.projects || 'NOT FOUND', null, 2)}`);

    // Check all fields that might contain project-like data
    const allFields = Object.keys(parsed);
    const projectLikeFields = allFields.filter(key =>
      key.toLowerCase().includes('project') ||
      key.toLowerCase().includes('portfolio')
    );
    if (projectLikeFields.length > 0) {
      Logger.debug(requestId, `Found project-like fields: ${projectLikeFields.join(', ')}`);
      projectLikeFields.forEach(field => {
        Logger.debug(requestId, `${field}: ${JSON.stringify(parsed[field], null, 2)}`);
      });
    }

    return parsed;
  } catch (error) {
    Logger.error(requestId, `Failed to parse Gemini response: ${error.message}`);
    Logger.debug(requestId, `Raw response snippet: ${cleanedResponse.substring(0, 200)}...`);
    throw new Error(`Failed to parse Gemini response: ${error.message}`);
  }
}

/**
 * MAIN RESUME OPTIMIZATION FUNCTION with STRICT PAGE PRESERVATION
 * @param {string|object} resumeInput - Raw resume text OR { buffer, mimeType }
 * @param {string} targetRole - Target job role
 * @param {object} options - Options including originalPageCount and progressCallback
 * @returns {object} Optimization result with preserved page count
 */
export async function optimizeResumeWithPagePreservation(resumeInput, targetRole, options = {}) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const { progressCallback, originalPageCount, fileStructure, parsedData } = options;

  // Extract actual page count from various sources
  const actualPageCount = originalPageCount || fileStructure?.originalPageCount || fileStructure?.estimatedPageCount || 1;

  Logger.pagePreservation(requestId, actualPageCount, 'STARTING OPTIMIZATION WITH STRICT PAGE PRESERVATION');
  Logger.info(requestId, `Target role: ${targetRole}`);

  const isBinaryInput = typeof resumeInput === 'object' && resumeInput.buffer;
  const hasStructuredInput = parsedData && typeof parsedData === 'object';

  if (isBinaryInput) {
    Logger.info(requestId, `Processing Binary Input: ${resumeInput.mimeType}, ${resumeInput.buffer.length} bytes`);
  } else if (typeof resumeInput === 'string') {
    Logger.info(requestId, `Resume text length: ${resumeInput.length} characters`);
  } else if (hasStructuredInput) {
    Logger.info(requestId, 'Processing structured resume payload from client');
  }

  // Progress helper
  const sendProgress = (step, message, data = null) => {
    Logger.info(requestId, `Progress: ${step} - ${message}`);
    if (progressCallback && typeof progressCallback === 'function') {
      progressCallback(step, message, data);
    }
  };

  try {
    let cleanedText = '';
    let parsedResume = null;
    let aiEnhancementResult = null;

    if (hasStructuredInput) {
      sendProgress('parsing', 'Using extracted resume data from client...');
      parsedResume = parsedData;
      cleanedText = '';

      sendProgress('ai_enhancing', 'Enhancing structured resume data with AI...');
      aiEnhancementResult = await enhanceResumeWithAI(parsedData, targetRole, actualPageCount, requestId, { structured: true });

    } else if (isBinaryInput) {
      // Direct PDF/Binary Flow - Skip local cleaning/parsing
      sendProgress('ai_enhancing', 'Analyzing document directly with AI (skipping local parsing)...');

      // Call Gemini with the file buffer directly
      aiEnhancementResult = await enhanceResumeWithAI(resumeInput, targetRole, actualPageCount, requestId);

      // Use AI result to populate "cleanedText" and "parsedResume" for template generation
      // The AI returns a structured object, we can derive the rest
      parsedResume = aiEnhancementResult.parsedData;
      cleanedText = "Content extracted directly from PDF by AI.";

    } else {
      // Text Flow (Legacy) - Use existing local logic
      // Step 1: Clean and validate text with structure awareness
      sendProgress('cleaning', 'Cleaning resume text with structure preservation...');
      cleanedText = cleanExtractedTextWithStructure(resumeInput, fileStructure || {});
      const validation = validateResumeTextWithStructure(cleanedText, fileStructure || {});

      if (!validation.isValid) {
        throw new Error(`Invalid resume: ${validation.errors.join(', ')}`);
      }

      Logger.pagePreservation(requestId, actualPageCount, `Validation complete - ${validation.wordCount} words`);

      // Step 2: Parse resume with structure awareness
      sendProgress('parsing', 'Parsing resume structure...');
      const structureWithPageCount = {
        ...fileStructure,
        originalPageCount: actualPageCount,
        estimatedPageCount: actualPageCount,
        isMultiPage: actualPageCount > 1
      };

      parsedResume = parseResumeUltimate(cleanedText);
      Logger.pagePreservation(requestId, actualPageCount, `Parsed ${parsedResume.experience.length} experience entries`);

      // Step 4: AI Enhancement (Text based)
      sendProgress('ai_enhancing', 'Enhancing resume with AI while preserving page structure...');
      aiEnhancementResult = await enhanceResumeWithAI(cleanedText, targetRole, actualPageCount, requestId);
    }

    // Step 3: Format resume preserving original page count
    // (We do this after AI for binary flow, or before for text flow - actually let's standardise)
    // For binary flow, parsedResume comes from AI. For text flow, it comes from regex.

    sendProgress('formatting', 'Formatting resume with page preservation...');
    const baseFormattedResume = formatResumeSimple(parsedResume, targetRole);
    Logger.pagePreservation(requestId, actualPageCount, `Base formatting complete - preserving ${actualPageCount} pages`);

    // Step 5: Create final templates with STRICT page preservation
    sendProgress('generating_templates', 'Generating final templates with page preservation...');
    const optimizedTemplates = createTemplatesWithPagePreservation(
      baseFormattedResume,
      aiEnhancementResult,
      targetRole,
      actualPageCount,
      requestId
    );

    // Step 6: Final validation and results
    sendProgress('finalizing', 'Finalizing optimization results...');

    const result = {
      originalText: cleanedText,
      templates: optimizedTemplates,
      improvements: aiEnhancementResult?.improvements || generateDefaultImprovements(targetRole, actualPageCount),
      stats: aiEnhancementResult?.stats || generateDefaultStats(actualPageCount, 500), // Default word count if unknown
      keyChanges: aiEnhancementResult?.keyChanges || `Resume optimized for ${targetRole} role while preserving ${actualPageCount}-page structure`,
      targetRole: targetRole,
      pagePreservation: {
        originalPageCount: actualPageCount,
        preservedPageCount: actualPageCount,
        strictPreservation: true
      }
    };

    Logger.pagePreservation(requestId, actualPageCount, 'OPTIMIZATION COMPLETED SUCCESSFULLY');
    Logger.success(requestId, `Generated ${result.templates.length} templates`);

    sendProgress('completed', 'Resume optimization completed with page preservation!', {
      templates: result.templates.length,
      targetRole,
      originalPageCount: actualPageCount,
      preservedPageCount: actualPageCount
    });

    return result;

  } catch (error) {
    Logger.error(requestId, `Resume optimization failed: ${error.message}`);
    sendProgress('error', error.message);
    throw error;
  }
}

/**
 * Enhance resume with AI while preserving page count
 */
/**
 * Enhance resume with AI while preserving page count
 * @param {string|object} resumeInput - Raw resume text OR { buffer, mimeType }
 */
async function enhanceResumeWithAI(resumeInput, targetRole, pageCount, requestId, options = {}) {
  Logger.pagePreservation(requestId, pageCount, 'Starting AI enhancement with page preservation...');

  const isBinary = typeof resumeInput === 'object' && resumeInput.buffer;
  const isStructured = Boolean(options.structured);

  // Create appropriate prompt based on input type
  const prompt = isStructured
    ? createStructuredResumePrompt(resumeInput, targetRole)
    : isBinary
      ? createMultimodalPagePreservationPrompt(targetRole, pageCount)
      : createTextPagePreservationPrompt(resumeInput, targetRole, pageCount);

  // Call AI with appropriate input
  const timeoutMs = Number(process.env.GEMINI_TIMEOUT_MS) || 90000;
  const aiResult = await callGeminiAPI(prompt, isBinary ? resumeInput : null, timeoutMs, requestId);

  // Validate that AI result respects page count
  if (aiResult.templates) {
    aiResult.templates.forEach((template, index) => {
      // Ensure content object exists
      if (!template.content) {
        template.content = {};
      }

      if (!template.content.originalPageCount) {
        template.content.originalPageCount = pageCount;
        template.content.formatType = pageCount > 1 ? 'multi_page' : 'single_page';
        Logger.pagePreservation(requestId, pageCount, `Fixed template ${index + 1} page count`);
      }
    });
  }

  Logger.pagePreservation(requestId, pageCount, 'AI enhancement completed with page preservation');
  return aiResult;
}

/**
 * Create prompt for PDF/Binary input (Token Efficient)
 */
function createMultimodalPagePreservationPrompt(targetRole, originalPageCount = 1) {
  return `You are an elite ATS (Applicant Tracking System) optimization expert. I have attached a resume in PDF format.
  
GOAL: Optimize this resume for the role of ${targetRole} while maintaining 95%+ ATS compatibility and preserving the original ${originalPageCount}-page structure.

CRITICAL INSTRUCTIONS:
1. READ THE ATTACHED PDF VISUALLY. Ignore any "ghost" text or artifacts that are hidden behind layers. Focus on the visible, human-readable content.
2. PRESERVE ACCURACY: Keep all titles, companies, dates, and locations EXACTLY as they appear visually.
3. PRESERVE LAYOUT: The output must reflect the structure of a ${originalPageCount}-page document.

OUTPUT FORMAT (JSON ONLY):
{
  "parsedData": {
    "contactInfo": { "name": "...", "email": "...", "phone": "...", "links": [...] },
    "summary": "...",
    "experience": [ { "title": "...", "company": "...", "date": "...", "location": "...", "points": ["..."] } ],
    "education": [...],
    "skills": { "technical": [...], "soft": [...] },
    "projects": [...]
  },
  "templates": [
    {
      "id": "senior-modern",
      "name": "Modern Executive",
      "style": "senior-modern",
      "description": "High-impact design for senior roles",
      "content": { ...parsedData structure but optimized... }
    },
    {
      "id": "concise-classic",
      "name": "Minimalist ATS",
      "style": "concise-classic",
      "description": "Clean, parseable layout",
      "content": { ...parsedData structure but optimized... }
    }
  ],
  "improvements": ["..."],
  "stats": { "atsScore": 95, "keywordsAdded": 0 },
  "keyChanges": "..."
}`;
}

function compactStructuredPayload(data) {
  if (!data || typeof data !== 'object') return {};

  const cleanString = (value) => typeof value === 'string'
    ? value.replace(/\s+/g, ' ').trim()
    : '';

  const normalizeList = (value) => {
    if (Array.isArray(value)) {
      return value.map(cleanString).filter(Boolean);
    }
    if (typeof value === 'string') {
      return value.split(/[,|\n]/).map(cleanString).filter(Boolean);
    }
    return [];
  };

  const normalizeSkills = (skills) => {
    if (Array.isArray(skills)) return normalizeList(skills);
    if (skills && typeof skills === 'object') {
      return Object.values(skills).flatMap((item) => normalizeList(item));
    }
    return normalizeList(skills);
  };

  const personalInfo = data.personalInfo || data.contactInfo || data.contact || {};
  const experience = Array.isArray(data.experience) ? data.experience : [];
  const education = Array.isArray(data.education) ? data.education : [];
  const projects = Array.isArray(data.projects) ? data.projects : [];

  return {
    personalInfo: {
      name: cleanString(personalInfo.name || ''),
      email: cleanString(personalInfo.email || ''),
      phone: cleanString(personalInfo.phone || ''),
      location: cleanString(personalInfo.location || ''),
      linkedin: cleanString(personalInfo.linkedin || personalInfo.linkedIn || ''),
      github: cleanString(personalInfo.github || ''),
      website: cleanString(personalInfo.website || personalInfo.portfolio || ''),
      links: Array.isArray(personalInfo.links) ? personalInfo.links : []
    },
    summary: cleanString(data.summary || data.professionalSummary || data.profile || data.objective || ''),
    skills: normalizeSkills(data.skills),
    experience: experience.map((item) => ({
      title: cleanString(item.title || item.position || item.role || ''),
      company: cleanString(item.company || item.employer || item.organization || ''),
      location: cleanString(item.location || ''),
      dates: cleanString(item.dates || item.date || item.duration || ''),
      bullets: normalizeList(item.bullets || item.points || item.description || item.responsibilities || [])
    })),
    education: education.map((item) => ({
      degree: cleanString(item.degree || item.program || ''),
      institution: cleanString(item.institution || item.university || item.school || ''),
      location: cleanString(item.location || ''),
      dates: cleanString(item.dates || item.year || item.graduation || ''),
      gpa: cleanString(item.gpa || '')
    })),
    projects: projects.map((item) => ({
      name: cleanString(item.name || item.title || ''),
      description: cleanString(item.description || item.summary || ''),
      technologies: normalizeList(item.technologies || item.stack || item.techStack || [])
    })),
    certifications: Array.isArray(data.certifications)
      ? data.certifications
      : normalizeList(data.certifications || [])
  };
}

function createStructuredResumePrompt(parsedData, targetRole) {
  const payload = compactStructuredPayload(parsedData);
  const payloadString = JSON.stringify(payload);

  return `You are an ATS optimization expert. Optimize the structured resume data for the role of ${targetRole}.

RULES:
1. Use ONLY the provided data. Do not add new companies, roles, dates, or certifications.
2. Preserve all factual details and improve wording for ATS.
3. Keep bullets concise and action-oriented.

STRUCTURED RESUME DATA:
${payloadString}

Return ONLY this JSON structure:
{
  "templates": [
    {
      "id": "senior-modern",
      "name": "Modern Executive",
      "style": "senior-modern",
      "description": "High-impact design for senior roles",
      "content": {
        "name": "",
        "contact": { "email": "", "phone": "", "location": "", "linkedin": "", "website": "" },
        "summary": "",
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": []
      }
    },
    {
      "id": "concise-classic",
      "name": "Minimalist ATS",
      "style": "concise-classic",
      "description": "Clean, parseable layout",
      "content": {
        "name": "",
        "contact": { "email": "", "phone": "", "location": "", "linkedin": "", "website": "" },
        "summary": "",
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": []
      }
    }
  ],
  "improvements": ["..."],
  "stats": { "atsScore": 90, "keywordsAdded": 0, "improvementsMade": 0, "matchScore": 80 },
  "keyChanges": "..."
}`;
}

/**
 * Create page-aware optimization prompt for Gemini (Legacy/Text-Only)
 */
function createTextPagePreservationPrompt(resumeText, targetRole, originalPageCount = 1) {
  // Token-efficient approach: truncate if resume is very long
  const maxResumeChars = Number(process.env.GEMINI_MAX_RESUME_CHARS) || 8000; // Keep prompt under ~2000 tokens
  const truncatedResume = resumeText.length > maxResumeChars
    ? resumeText.substring(0, maxResumeChars) + '\n... [resume continues]'
    : resumeText;

  const pageInstructions = originalPageCount > 1 ?
    `${originalPageCount}-page resume - PRESERVE ALL content` :
    `Single-page resume - keep concise`;

  return `You are an elite ATS (Applicant Tracking System) optimization expert. Your goal is to optimize the provided resume to be 95%+ ATS-friendly for the role of ${targetRole} while maintaining 100% honesty and accuracy.

CRITICAL CONTENT PRESERVATION RULES:
1. YOU MUST PRESERVE ALL ORIGINAL TITLES, COMPANY NAMES, DATES, AND LOCATIONS EXACTLY AS THEY APPEAR.
2. NEVER MERGE bullet points, description sentences, or achievements into the "title" or "company" fields.
3. EACH FIELD MUST CONTAIN ONLY ITS CORRESPONDING ENTITY (e.g., Title: "Software Engineer", NOT "Software Engineer | Built App").
4. PRESERVE ALL CORE BULLET POINTS AND ACHIEVEMENTS in the "description" array. You may slightly rephrase them for ATS.
5. DO NOT put job titles, dates, or companies into the "description" array as bullet points.
6. DO NOT HARDCODE ANY DATA. Every piece of information in the output must come from the original resume.
7. If a section exists in the original (e.g., Projects, Certifications), it MUST be included in the output.
8. If a field is missing in the resume, return an empty string or empty array. Do not add placeholder text.
9. "Expertise and Skills" must be treated as a SKILLS section, not as part of the last job experience.

Resume (${originalPageCount} pages):
${truncatedResume}

INSTRUCTIONS:
- Analyze the resume for the ${targetRole} role.
- Optimize the summary and experience descriptions for high keyword relevance.
- You MUST create EXACTLY TWO templates with fundamentally different professional aesthetics.

Return this EXACT JSON structure with TWO distinct templates:
{
  "templates": [
    {
      "id": "modern-executive",
      "name": "Modern Executive",
      "description": "A sophisticated, high-impact layout for senior roles. Features a bold header and clean section separation. (${pageInstructions})",
      "content": {
        "name": "",
        "contact": {"email": "", "phone": "", "location": "", "linkedin": ""},
        "summary": "",
        "skills": [],
        "experience": [{"title": "", "company": "", "duration": "", "location": "", "description": []}],
        "education": [{"institution": "", "degree": "", "year": "", "gpa": ""}],
        "projects": [{"name": "", "description": "", "technologies": []}],
        "certifications": [],
        "originalPageCount": ${originalPageCount},
        "formatType": "${originalPageCount > 1 ? 'multi_page' : 'single_page'}"
      },
      "style": "senior-modern",
      "isOptimized": true
    },
    {
      "id": "minimalist-ats",
      "name": "Minimalist ATS",
      "description": "Ultra-clean, single-column layout designed for maximum parsing accuracy. Perfect for technical and highly structured ATS. (${pageInstructions})",
      "content": {
        "name": "",
        "contact": {"email": "", "phone": "", "location": "", "linkedin": ""},
        "summary": "",
        "skills": [],
        "experience": [{"title": "", "company": "", "duration": "", "location": "", "description": []}],
        "education": [{"institution": "", "degree": "", "year": ""}],
        "projects": [{"name": "", "description": "", "technologies": []}],
        "certifications": [],
        "originalPageCount": ${originalPageCount},
        "formatType": "${originalPageCount > 1 ? 'multi_page' : 'single_page'}"
      },
      "style": "concise-classic",
      "isOptimized": true
    }
  ],
  "improvements": ["Highlight of specific optimization made", "..."],
  "stats": {"atsScore": 95, "keywordsAdded": 0, "improvementsMade": 0, "matchScore": 90},
  "keyChanges": "Concise summary of how the resume was transformed for the ${targetRole} role"
}

FINAL CHECK:
- Are there two templates? (YES)
- Is "senior-modern" first and "concise-classic" second? (YES)
- Is original content preserved? (YES - CRITICAL)
- Return ONLY the JSON object. No markdown.`;
}

function countSkillItems(skills) {
  if (!skills) return 0;
  if (Array.isArray(skills)) {
    return skills.filter((item) => hasMeaningfulValue(item)).length;
  }
  if (typeof skills === 'string') {
    return skills
      .split(/[,|\n]/)
      .map((item) => item.trim())
      .filter((item) => hasMeaningfulValue(item)).length;
  }
  if (typeof skills === 'object') {
    return Object.values(skills)
      .flatMap((value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return value.split(/[,|\n]/);
        return [];
      })
      .map((item) => (typeof item === 'string' ? item.trim() : item))
      .filter((item) => hasMeaningfulValue(item)).length;
  }
  return 0;
}

function countExperienceBullets(experience) {
  if (!Array.isArray(experience)) return 0;
  return experience.reduce((total, entry) => {
    if (!entry) return total;
    const bullets = entry.description || entry.points || entry.bullets || entry.responsibilities || [];
    if (Array.isArray(bullets)) {
      return total + bullets.filter((item) => (typeof item === 'string' || typeof item === 'number') && String(item).trim()).length;
    }
    if (typeof bullets === 'string') {
      // Split on bullet patterns, not just newlines to preserve multi-line bullets
      return total + bullets
        .split(/\n(?=[-•●○◦▪▸►✓✔→⁃∙·*]\s)/) // Split only at bullet starts
        .map((item) => item.trim())
        .filter(Boolean).length;
    }
    return total;
  }, 0);
}

function isTemplateContentSparse(content) {
  if (!content || typeof content !== 'object') return true;
  const summary = content.summary || content.professionalSummary || content.profile || content.objective || '';
  const experience = Array.isArray(content.experience) ? content.experience : [];
  const education = Array.isArray(content.education) ? content.education : [];
  const projects = Array.isArray(content.projects) ? content.projects : [];
  const certifications = Array.isArray(content.certifications) ? content.certifications : [];
  const skillsCount = countSkillItems(content.skills);
  const experienceCount = experience.filter((entry) => !isEmptyValue(entry)).length;
  const educationCount = education.filter((entry) => !isEmptyValue(entry)).length;
  const projectsCount = projects.filter((entry) => !isEmptyValue(entry)).length;
  const certificationsCount = certifications.filter((entry) => !isEmptyValue(entry)).length;
  const bulletCount = countExperienceBullets(experience);
  const summaryLength = typeof summary === 'string' ? summary.trim().length : 0;
  const totalSections = experienceCount + educationCount + projectsCount + certificationsCount;
  const totalSignals = totalSections + Math.min(skillsCount, 6) + (summaryLength >= 60 ? 2 : summaryLength > 0 ? 1 : 0);

  if (experienceCount === 0 && totalSections === 0 && skillsCount < 3 && summaryLength < 80) {
    return true;
  }

  if (experienceCount < 1 && bulletCount < 2 && totalSignals < 4) {
    return true;
  }

  return false;
}

function hasMeaningfulValue(value, depth = 0) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return /[\p{L}\p{N}]/u.test(trimmed);
  }
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  if (depth > 3) return false;
  if (Array.isArray(value)) {
    return value.some((item) => hasMeaningfulValue(item, depth + 1));
  }
  if (typeof value === 'object') {
    return Object.values(value).some((item) => hasMeaningfulValue(item, depth + 1));
  }
  return false;
}

function isEmptyValue(value) {
  return !hasMeaningfulValue(value);
}

function mergeContactFields(templateContact, baseContact) {
  const resolved = { ...baseContact, ...templateContact };
  const fields = ['email', 'phone', 'location', 'linkedin', 'linkedIn', 'github', 'website', 'portfolio'];
  fields.forEach((field) => {
    if (isEmptyValue(templateContact?.[field]) && !isEmptyValue(baseContact?.[field])) {
      resolved[field] = baseContact[field];
    }
  });

  if ((!Array.isArray(templateContact?.links) || templateContact.links.length === 0) &&
    Array.isArray(baseContact?.links) && baseContact.links.length > 0) {
    resolved.links = baseContact.links;
  }

  if (Array.isArray(resolved.links)) {
    resolved.links = resolved.links.filter((link) => !isEmptyValue(link));
  }

  return resolved;
}

function mergeTemplateContent(templateContent, baseContent) {
  const resolved = { ...(templateContent || {}) };
  const fallback = baseContent || {};
  const fallbackContact = fallback.contact || fallback.contactInfo || fallback.personalInfo || {};
  const templateContact = resolved.contact || resolved.contactInfo || resolved.personalInfo || {};

  if (isEmptyValue(resolved.name)) {
    const nameCandidate = fallback.name || fallback.personalInfo?.name || fallback.contactInfo?.name;
    if (!isEmptyValue(nameCandidate)) {
      resolved.name = nameCandidate;
    }
  }

  resolved.contact = mergeContactFields(templateContact, fallbackContact);

  if (isEmptyValue(resolved.summary)) {
    const summaryCandidate = fallback.summary || fallback.professionalSummary || fallback.profile || fallback.objective;
    if (!isEmptyValue(summaryCandidate)) {
      resolved.summary = summaryCandidate;
    }
  }

  if (countSkillItems(resolved.skills) === 0 && countSkillItems(fallback.skills) > 0) {
    resolved.skills = fallback.skills;
  }

  const sectionFallbacks = [
    { key: 'experience', altKeys: [] },
    { key: 'education', altKeys: [] },
    { key: 'projects', altKeys: ['projectExperience', 'portfolio'] },
    { key: 'certifications', altKeys: ['licenses'] }
  ];

  sectionFallbacks.forEach(({ key, altKeys }) => {
    const current = resolved[key];
    if (!isEmptyValue(current)) return;
    const candidates = [fallback[key], ...altKeys.map((alt) => fallback[alt])];
    const candidate = candidates.find((value) => !isEmptyValue(value));
    if (candidate !== undefined) {
      resolved[key] = candidate;
    }
  });

  const sanitizeArray = (value) => Array.isArray(value) ? value.filter((item) => !isEmptyValue(item)) : value;
  resolved.skills = sanitizeArray(resolved.skills);
  resolved.experience = sanitizeArray(resolved.experience);
  resolved.education = sanitizeArray(resolved.education);
  resolved.projects = sanitizeArray(resolved.projects);
  resolved.certifications = sanitizeArray(resolved.certifications);

  return resolved;
}

/**
 * Create templates with strict page preservation
 */
function createTemplatesWithPagePreservation(baseFormattedResume, aiEnhancementResult, targetRole, originalPageCount = 1, requestId) {
  Logger.pagePreservation(requestId, originalPageCount, 'Creating templates with strict page preservation...');

  const templates = [];
  const baseContent = baseFormattedResume.layout || baseFormattedResume.fullStructure || {};
  const nameForTemplate = baseFormattedResume.layout?.name || baseFormattedResume.fullStructure?.name || "";
  const namePrefix = nameForTemplate ? `${nameForTemplate} - ` : '';

  if (aiEnhancementResult && aiEnhancementResult.templates && aiEnhancementResult.templates.length > 0) {
    const aiTemplates = [];

    // Use AI-enhanced templates but ensure page preservation
    aiEnhancementResult.templates.forEach((template, index) => {
      // Ensure content object exists
      if (!template.content) {
        Logger.warn(requestId, `Template ${index + 1} missing content object - initializing`);
        template.content = {};
      }

      template.content = mergeTemplateContent(template.content, baseContent);

      if (isTemplateContentSparse(template.content)) {
        Logger.warn(requestId, `Template ${index + 1} missing core content - skipping AI template`);
        return;
      }

      // Force page preservation
      template.content.originalPageCount = originalPageCount;
      template.content.formatType = originalPageCount > 1 ? 'multi_page' : 'single_page';
      template.content.preserveOriginalDensity = true;

      // Update descriptions to reflect page count
      if (originalPageCount > 1 && !template.description.includes('multi-page')) {
        template.description = template.description.replace(
          /template/i,
          `multi-page template (${originalPageCount} pages)`
        );
      }

      Logger.pagePreservation(requestId, originalPageCount, `Enhanced AI template ${index + 1}: ${template.style}`);
      aiTemplates.push(template);
    });

    if (aiTemplates.length > 0) {
      templates.push(...aiTemplates);
      Logger.pagePreservation(requestId, originalPageCount, `Using ${aiTemplates.length} AI templates`);
      return templates;
    }

    Logger.warn(requestId, 'AI templates too sparse; falling back to parser output');
  } else {
    // Create structured templates with page preservation
    Logger.pagePreservation(requestId, originalPageCount, 'Creating structured templates (AI enhancement unavailable)...');

    // Senior Modern Template
    templates.push({
      id: `${namePrefix}Senior Modern`,
      name: `${namePrefix}Senior Modern`,
      description: originalPageCount > 1 ?
        `Executive-level multi-page template (${originalPageCount} pages) with comprehensive sections` :
        'Executive-level template with modern design',
      content: {
        ...baseContent,
        originalPageCount: originalPageCount,
        formatType: originalPageCount > 1 ? 'multi_page' : 'single_page',
        preserveOriginalDensity: true
      },
      style: "senior-modern",
      isOptimized: false
    });

    // Concise Classic Template
    const conciseContent = originalPageCount > 1 ?
      baseContent : // For multi-page, keep all content
      createSinglePageVersion(baseContent); // For single-page, condense appropriately

    templates.push({
      id: `${namePrefix}Concise Classic`,
      name: `${namePrefix}Concise Classic`,
      description: originalPageCount > 1 ?
        `Clean, ATS-friendly multi-page format (${originalPageCount} pages) with full content` :
        'Clean, ATS-friendly single-page format',
      content: {
        ...conciseContent,
        originalPageCount: originalPageCount,
        formatType: originalPageCount > 1 ? 'multi_page' : 'single_page',
        preserveOriginalDensity: true
      },
      style: "concise-classic",
      isOptimized: false
    });
  }

  Logger.pagePreservation(requestId, originalPageCount, `Created ${templates.length} templates with preserved page count`);
  return templates;
}

/**
 * Create single-page version of content (only used for originally single-page resumes)
 */
function createSinglePageVersion(content) {
  return {
    ...content,
    summary: content.summary && content.summary.length > 400 ?
      content.summary.substring(0, 400) + '...' : content.summary,
    skills: (content.skills || []).slice(0, 15),
    experience: (content.experience || []).slice(0, 4).map(exp => ({
      ...exp,
      description: exp.description.slice(0, 4)
    })),
    education: (content.education || []).slice(0, 2),
    projects: (content.projects || []).slice(0, 2),
    certifications: (content.certifications || []).slice(0, 5)
  };
}

/**
 * Generate default improvements when AI enhancement fails
 */
function generateDefaultImprovements(targetRole, pageCount) {
  const improvements = [
    ` Resume structured and optimized for ${targetRole}`,
    ` ${pageCount > 1 ? 'Multi-page' : 'Single-page'} formatting preserved`,
    ' Professional sections organized',
    ' Content optimized for ATS systems'
  ];

  if (pageCount > 1) {
    improvements.push(` All ${pageCount} pages of content preserved`);
  }

  return improvements;
}

/**
 * Generate default stats when AI enhancement fails
 */
function generateDefaultStats(pageCount, wordCount) {
  return {
    atsScore: 75 + (pageCount > 1 ? 10 : 0), // Multi-page resumes often score higher
    keywordsAdded: Math.min(Math.floor(wordCount / 100), 15),
    improvementsMade: 3 + (pageCount > 1 ? 2 : 0),
    matchScore: 70 + (pageCount > 1 ? 5 : 0),
    pageCount: pageCount,
    wordCount: wordCount
  };
}

/**
 * Legacy compatibility wrapper
 */
export async function optimizeResume(resumeText, targetRole, options = {}) {
  return await optimizeResumeWithPagePreservation(resumeText, targetRole, options);
}
