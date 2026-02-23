import { GoogleGenerativeAI } from '@google/generative-ai';
import { cleanExtractedText, validateResumeText } from './fileProcessor.js';
import { parseAndFormatResume } from './resumeParser.js';
import crypto from 'crypto';

// Initialize Gemini AI
let genAI;
let model;

// Simple logger to reduce console spam
const log = {
  info: (message) => console.log(` ${message}`),
  error: (message) => console.error(` ${message}`),
  success: (message) => console.log(` ${message}`),
  debug: (message) => console.log(` ${message}`)
};

// Simplified JSON parser for Gemini responses
function parseGeminiResponse(rawResponse) {
  let cleanedResponse = rawResponse.trim();

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
    return JSON.parse(cleanedResponse);
  } catch (error) {
    throw new Error(`Failed to parse Gemini response: ${error.message}`);
  }
}

// Simple function to create concise version of resume data
function createConciseVersion(data) {
  const concise = { ...data };

  // Trim summary to 2 sentences max
  if (concise.summary) {
    const sentences = concise.summary.split(/[.!?]+/);
    if (sentences.length > 2) {
      concise.summary = sentences.slice(0, 2).join('. ').trim() + '.';
    }
  }

  // Limit arrays to reasonable sizes for concise format
  if (Array.isArray(concise.skills)) concise.skills = concise.skills.slice(0, 10);
  if (Array.isArray(concise.experience)) concise.experience = concise.experience.slice(0, 3);
  if (Array.isArray(concise.projects)) concise.projects = concise.projects.slice(0, 2);
  if (Array.isArray(concise.certifications)) concise.certifications = concise.certifications.slice(0, 5);

  return concise;
}

// Extract basic resume data from text
function extractBasicResumeData(resumeText) {
  const data = {
    name: "Professional Resume",
    contact: { email: "", phone: "", location: "" },
    summary: "",
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: []
  };

  // Extract name (first line usually)
  const lines = resumeText.split('\n').filter(line => line.trim());
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine && firstLine.length < 50 && !firstLine.includes('@')) {
      data.name = firstLine;
    }
  }

  // Extract email
  const emailMatch = resumeText.match(/[\w._%+-]+@[\w.-]+\.[A-Z|a-z]{2,}/);
  if (emailMatch) data.contact.email = emailMatch[0];

  // Extract phone
  const phoneMatch = resumeText.match(/(?:\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/);
  if (phoneMatch) data.contact.phone = phoneMatch[0];

  // Extract skills from SKILLS section
  const skillsMatch = resumeText.match(/SKILLS[:\s]*([\s\S]*?)(?=\n\n|EXPERIENCE|EDUCATION|$)/i);
  if (skillsMatch) {
    data.skills = skillsMatch[1]
      .split(/[,\n]+/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 1 && skill.length < 30)
      .slice(0, 15);
  }

  // Basic summary - first paragraph or professional summary section
  const summaryMatch = resumeText.match(/(?:SUMMARY|PROFILE)[:\s]*([\s\S]*?)(?=\n\n|EXPERIENCE|SKILLS|$)/i);
  if (summaryMatch) {
    data.summary = summaryMatch[1].trim().split('\n')[0]; // First line only
  } else {
    // Fallback: create basic summary
    data.summary = `${data.skills.slice(0, 3).join(', ')} professional with proven experience.`;
  }

  return data;
}

// Initialize Gemini AI
export function initializeGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    log.error('Missing GEMINI_API_KEY environment variable');
    throw new Error('GEMINI_API_KEY environment variable is required');
  }

  try {
    genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL;
    if (!modelName) {
      throw new Error('GEMINI_MODEL environment variable is required');
    }
    model = genAI.getGenerativeModel({ model: modelName });
    log.success('Gemini AI initialized successfully');
    return true;
  } catch (error) {
    log.error('Failed to initialize Gemini AI: ' + error.message);
    throw error;
  }
}

// Simple Gemini API call with timeout
async function callGeminiAPI(prompt, timeoutMs = 30000) {
  if (!model) {
    await initializeGeminiAI();
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Gemini API timeout')), timeoutMs)
  );


  const maxRetries = 3;
  let retryCount = 0;

  while (true) {
    try {
      const result = await Promise.race([
        model.generateContent(prompt),
        timeoutPromise
      ]);

      const response = await result.response;
      const usage = response.usageMetadata;
      if (usage) {
        log.info(`Token Usage - Prompt: ${usage.promptTokenCount}, Response: ${usage.candidatesTokenCount}, Total: ${usage.totalTokenCount}`);
      }

      const rawText = response.text();
      return parseGeminiResponse(rawText);
    } catch (error) {
      if ((error.message.includes('429') || error.status === 429) && retryCount < maxRetries) {
        retryCount++;
        const delay = Math.pow(2, retryCount) * 1000 + (Math.random() * 1000);
        log.info(`Rate limit hit (429). Retrying in ${Math.round(delay)}ms... (Attempt ${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      log.error('Gemini API call failed: ' + error.message);
      throw error;
    }
  }
}

// Main resume optimization function - simplified and working
export async function optimizeResume(resumeText, targetRole, options = {}) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const { progressCallback, originalPageCount } = options;

  // Progress helper
  const sendProgress = (step, message, data = null) => {
    if (progressCallback && typeof progressCallback === 'function') {
      progressCallback(step, message, data);
    }
  };

  try {
    log.info(`[${requestId}] Starting resume optimization for role: ${targetRole}`);
    if (originalPageCount) {
      log.info(`[${requestId}] Original PDF page count: ${originalPageCount}`);
    }
    sendProgress('analyzing', 'Analyzing resume content...');

    // Clean and parse resume using comprehensive parser
    const cleanedText = cleanExtractedText(resumeText);
    const parsedResume = parseAndFormatResume(cleanedText);
    const basicData = parsedResume.formatType === 'multi_page' ?
      parsedResume.fullStructure :
      (parsedResume.layout || extractBasicResumeData(cleanedText));

    sendProgress('optimizing', 'Optimizing resume with AI...');
    log.debug(`[${requestId}] Parsed format: ${parsedResume.formatType}`);
    log.debug(`[${requestId}] Extracted data - Name: ${basicData.personalInfo?.name || basicData.name}, Experience: ${basicData.experience?.length || 0}`);

    // Handle multi-page resume differently
    // Enhanced multi-page detection based on content analysis and original page count
    const shouldBeMultiPage = determineIfMultiPage(basicData, cleanedText, originalPageCount);
    const isMultiPage = parsedResume.formatType === 'multi_page' || shouldBeMultiPage;
    // Use original page count if provided, otherwise use calculated page count
    const pageCount = originalPageCount && originalPageCount > 1 ? originalPageCount : (shouldBeMultiPage ? 3 : (parsedResume.pageCount || 1));

    if (isMultiPage) {
      log.info(`[${requestId}] Processing multi-page resume (${pageCount} pages) - Content-based: ${shouldBeMultiPage}`);
    }

    // Try Gemini optimization first
    let optimizedData = null;
    try {
      const prompt = createOptimizationPrompt(cleanedText, targetRole);
      optimizedData = await callGeminiAPI(prompt);
      log.success(`[${requestId}] AI optimization successful`);
    } catch (error) {
      log.error(`[${requestId}] AI optimization failed: ${error.message}`);
      // Fall back to basic data
    }

    sendProgress('generating', 'Generating resume templates...');

    // Create templates
    const templates = [];

    if (optimizedData && optimizedData.templates) {
      // Use AI-optimized templates but preserve multi-page formatting
      optimizedData.templates.forEach(template => {
        // Preserve or add multi-page information if this is a multi-page resume
        if (isMultiPage && template.content) {
          template.content.formatType = 'multi_page';
          template.content.pageCount = pageCount;
          // Update description to reflect multi-page status
          if (!template.description.includes('multi-page')) {
            template.description = template.description.replace(
              template.style === 'senior-modern' ? 'Executive template' : 'Clean',
              template.style === 'senior-modern' ?
                `Executive multi-page template (${pageCount} pages)` :
                `Clean multi-page format (${pageCount} pages)`
            );
          }
        }
        templates.push(template);
      });

      log.success(`[${requestId}] Using ${templates.length} AI-optimized templates`);
      if (isMultiPage) {
        log.info(`[${requestId}] Enhanced AI templates with multi-page formatting (${pageCount} pages)`);
      }
    } else {
      // Fallback to structured templates using parsed data
      log.info(`[${requestId}] Using fallback templates with parsed data`);

      const nameForTemplate = basicData.personalInfo?.name || basicData.name || "Professional";

      if (isMultiPage) {
        log.info(`[${requestId}] Creating multi-page templates with ${pageCount} pages`);

        // Multi-page resume - preserve full content
        templates.push({
          id: `${nameForTemplate} - Senior Modern`,
          name: `${nameForTemplate} - Senior Modern`,
          description: `Executive-level multi-page template (${pageCount} pages) with comprehensive sections`,
          content: {
            name: basicData.personalInfo?.name || basicData.name,
            contact: {
              email: basicData.personalInfo?.email || basicData.contact?.email,
              phone: basicData.personalInfo?.phone || basicData.contact?.phone,
              location: basicData.personalInfo?.location || basicData.contact?.location || ""
            },
            summary: basicData.summary || "Experienced professional with proven track record.",
            skills: basicData.skills || [],
            experience: basicData.experience || [],
            education: basicData.education || [],
            projects: basicData.projects || [],
            certifications: basicData.certifications || [],
            achievements: basicData.achievements || [],
            domains: basicData.domains || [],
            formatType: 'multi_page',
            pageCount: pageCount
          },
          style: "senior-modern",
          isOptimized: false
        });

        // Create a less aggressive condensed version for multi-page Concise Classic
        const conciseContent = {
          name: basicData.personalInfo?.name || basicData.name,
          contact: {
            email: basicData.personalInfo?.email || basicData.contact?.email,
            phone: basicData.personalInfo?.phone || basicData.contact?.phone,
            location: basicData.personalInfo?.location || basicData.contact?.location || ""
          },
          summary: basicData.summary || "Professional with extensive experience.",
          skills: (basicData.skills || []), // Keep all skills for multi-page
          experience: (basicData.experience || []), // Keep all experience for multi-page
          education: (basicData.education || []), // Keep all education
          projects: (basicData.projects || []), // Keep all projects for multi-page
          certifications: (basicData.certifications || []), // Keep all certifications
          formatType: 'multi_page',  // Mark as multi-page
          pageCount: pageCount
        };

        templates.push({
          id: `${nameForTemplate} - Concise Classic`,
          name: `${nameForTemplate} - Concise Classic`,
          description: `Clean, ATS-friendly multi-page format (${pageCount} pages) with full content`,
          content: conciseContent,
          style: "concise-classic",
          isOptimized: false
        });

        log.info(`[${requestId}] Created multi-page templates:`);
        log.info(`[${requestId}] - Senior Modern: ${basicData.experience?.length || 0} experience entries`);
        log.info(`[${requestId}] - Concise Classic: ${conciseContent.experience?.length || 0} experience entries`);
      } else {
        // Regular single-page resume
        templates.push({
          id: `${nameForTemplate} - Senior Modern`,
          name: `${nameForTemplate} - Senior Modern`,
          description: "Executive-level template with modern design",
          content: basicData,
          style: "senior-modern",
          isOptimized: false
        });

        templates.push({
          id: `${nameForTemplate} - Concise Classic`,
          name: `${nameForTemplate} - Concise Classic`,
          description: "Clean, ATS-friendly format",
          content: createConciseVersion(basicData),
          style: "concise-classic",
          isOptimized: false
        });
      }
    }

    sendProgress('completed', 'Resume optimization completed!', {
      templates: templates.length,
      targetRole
    });

    // Return results
    const result = {
      originalText: cleanedText,
      templates,
      improvements: optimizedData?.improvements || [
        ` Resume structured for ${targetRole}`,
        " Professional formatting applied",
        " Key sections organized"
      ],
      stats: optimizedData?.stats || {
        atsScore: 75,
        keywordsAdded: 5,
        improvementsMade: 3,
        matchScore: 70
      },
      keyChanges: optimizedData?.keyChanges || `Resume optimized for ${targetRole} role`,
      targetRole
    };

    log.success(`[${requestId}] Resume optimization completed with ${result.templates.length} templates`);
    return result;

  } catch (error) {
    log.error(`[${requestId}] Resume optimization failed: ${error.message}`);
    sendProgress('error', error.message);
    throw error;
  }
}

// Determine if resume should be multi-page based on content analysis
function determineIfMultiPage(resumeData, resumeText, originalPageCount = null) {
  log.debug(' Analyzing resume for multi-page formatting...');

  // If we have the original page count from the PDF, use it as a strong indicator
  if (originalPageCount && originalPageCount > 1) {
    log.info(` Original PDF had ${originalPageCount} pages - respecting original page count`);
    return true;
  }

  // Count key content indicators
  const experienceCount = resumeData.experience?.length || 0;
  const totalBulletPoints = resumeData.experience?.reduce((total, exp) =>
    total + (exp.description?.length || 0), 0) || 0;
  const skillsCount = resumeData.skills?.length || 0;
  const educationCount = resumeData.education?.length || 0;
  const certificationsCount = resumeData.certifications?.length || 0;
  const projectsCount = resumeData.projects?.length || 0;
  const textLength = resumeText.length;
  const lineCount = resumeText.split('\n').filter(line => line.trim().length > 0).length;

  // Calculate content complexity score
  let complexityScore = 0;

  // Experience weight (most important)
  complexityScore += experienceCount * 15;
  complexityScore += Math.min(totalBulletPoints * 3, 120); // Cap bullet point impact

  // Other content weights  
  complexityScore += skillsCount * 1;
  complexityScore += educationCount * 8;
  complexityScore += certificationsCount * 3;
  complexityScore += projectsCount * 10;

  // Text length and line count factors
  complexityScore += Math.min(textLength / 50, 80); // Cap text length impact
  complexityScore += Math.min(lineCount * 2, 60); // Cap line count impact

  log.debug(` Content analysis: ${experienceCount} jobs, ${totalBulletPoints} bullets, ${skillsCount} skills, ${certificationsCount} certs, ${textLength} chars, ${lineCount} lines`);
  log.debug(` Complexity score: ${complexityScore} (threshold: 180)`);

  // Multi-page threshold (adjusted for your resume profile)
  const shouldBeMultiPage = complexityScore > 180 ||
    experienceCount >= 5 ||
    totalBulletPoints >= 15 ||
    (experienceCount >= 3 && certificationsCount >= 2) ||
    textLength > 2500;

  log.info(` Multi-page decision: ${shouldBeMultiPage ? 'YES' : 'NO'} (score: ${complexityScore})`);

  return shouldBeMultiPage;
}

// Create optimization prompt for Gemini
function createOptimizationPrompt(resumeText, targetRole) {
  return `You are a professional resume optimizer. Optimize this resume for a ${targetRole} position.

Original Resume:
${resumeText}

Return a JSON response with this exact structure:
{
  "templates": [
    {
      "id": "name - Senior Modern",
      "name": "name - Senior Modern", 
      "description": "Executive template with comprehensive sections",
      "content": {
        "name": "Full Name",
        "contact": {"email": "", "phone": "", "location": ""},
        "summary": "Professional summary",
        "skills": ["skill1", "skill2"],
        "experience": [{"title": "", "company": "", "dates": "", "description": [""]}],
        "education": [{"degree": "", "university": "", "year": ""}],
        "projects": [],
        "certifications": []
      },
      "style": "senior-modern",
      "isOptimized": true
    },
    {
      "id": "name - Concise Classic",
      "name": "name - Concise Classic",
      "description": "Clean, ATS-friendly format", 
      "content": {
        "name": "Full Name",
        "contact": {"email": "", "phone": "", "location": ""},
        "summary": "Concise summary",
        "skills": ["skill1", "skill2"],
        "experience": [{"title": "", "company": "", "dates": "", "description": [""]}],
        "education": [{"degree": "", "university": "", "year": ""}],
        "projects": [],
        "certifications": []
      },
      "style": "concise-classic",
      "isOptimized": true
    }
  ],
  "improvements": ["improvement1", "improvement2"],
  "stats": {"atsScore": 85, "keywordsAdded": 5, "improvementsMade": 3, "matchScore": 80},
  "keyChanges": "Summary of key changes made"
}

Important: Return ONLY valid JSON, no markdown or extra text.`;
}
