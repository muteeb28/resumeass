import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

/**
 * ATS Resume Optimizer - Built from Scratch
 * Goal: 90% ATS Score with Complete Content Preservation
 */

let genAI;
let model;

const log = (msg) => console.log(`ðŸŽ¯ [ATS] ${msg}`);

/**
 * Initialize Gemini AI
 */
export function initializeAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_ATS_MODEL;
  if (!apiKey) throw new Error('GEMINI_API_KEY is required');
  if (!modelName) throw new Error('GEMINI_ATS_MODEL is required');
  
  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: modelName });
  log('AI initialized successfully');
}

/**
 * Call Gemini API with retry logic
 */
async function callAI(prompt, binaryInput = null, timeout = 60000) {
  if (!model) await initializeAI();
  
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('AI timeout')), timeout)
  );
  
  try {
    let contentParts = [{ text: prompt }];
    
    // Add binary input if provided (for PDFs)
    if (binaryInput?.buffer && binaryInput?.mimeType) {
      contentParts.push({
        inlineData: {
          data: binaryInput.buffer.toString('base64'),
          mimeType: binaryInput.mimeType
        }
      });
    }
    
    const result = await Promise.race([
      model.generateContent(contentParts),
      timeoutPromise
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    return parseJSON(text);
  } catch (error) {
    log(`AI Error: ${error.message}`);
    throw error;
  }
}

/**
 * Parse JSON from AI response
 */
function parseJSON(text) {
  let cleaned = text.trim();
  
  // Remove markdown
  if (cleaned.includes('```json')) {
    const match = cleaned.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) cleaned = match[1].trim();
  } else if (cleaned.includes('```')) {
    const match = cleaned.match(/```\s*([\s\S]*?)\s*```/);
    if (match) cleaned = match[1].trim();
  }
  
  // Extract JSON
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }
  
  // Fix trailing commas
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
  
  return JSON.parse(cleaned);
}

/**
 * MAIN OPTIMIZATION FUNCTION
 * Optimizes resume for 90% ATS score while preserving all content
 */
export async function optimizeResumeForATS(resumeInput, targetRole, options = {}) {
  const requestId = crypto.randomUUID().slice(0, 8);
  const { progressCallback } = options;
  
  log(`[${requestId}] Starting optimization for: ${targetRole}`);
  
  const progress = (step, msg) => {
    log(`[${requestId}] ${step}: ${msg}`);
    progressCallback?.(step, msg);
  };
  
  try {
    progress('start', 'Initializing ATS optimization...');
    
    // Determine input type
    const isBinary = typeof resumeInput === 'object' && resumeInput.buffer;
    
    if (isBinary) {
      log(`[${requestId}] Processing PDF binary (${resumeInput.buffer.length} bytes)`);
      progress('analyzing', 'Analyzing PDF with AI vision...');
    } else {
      log(`[${requestId}] Processing text (${resumeInput.length} chars)`);
      progress('analyzing', 'Analyzing resume content...');
    }
    
    // Step 1: Extract and structure resume with AI
    progress('extracting', 'Extracting all sections and content...');
    const extractedData = await extractResumeContent(resumeInput, requestId);
    
    log(`[${requestId}] Extracted: ${extractedData.experience?.length || 0} jobs, ${extractedData.skills?.length || 0} skills`);
    
    // Step 2: Optimize for ATS while preserving content
    progress('optimizing', 'Optimizing for 90% ATS score...');
    const optimizedData = await optimizeForATS(extractedData, targetRole, requestId);
    
    // Step 3: Generate 2 beautiful templates
    progress('generating', 'Creating beautiful ATS-optimized templates...');
    const templates = createATSTemplates(optimizedData, targetRole);
    
    log(`[${requestId}] Generated ${templates.length} templates`);
    
    // Step 4: Calculate ATS score
    const atsScore = calculateATSScore(optimizedData);
    
    progress('completed', `Optimization complete! ATS Score: ${atsScore}%`);
    
    return {
      success: true,
      templates,
      atsScore,
      improvements: optimizedData.improvements || [],
      stats: {
        atsScore,
        keywordsAdded: optimizedData.keywordsAdded || 0,
        sectionsOptimized: optimizedData.sectionsOptimized || 0
      },
      targetRole
    };
    
  } catch (error) {
    log(`[${requestId}] ERROR: ${error.message}`);
    progress('error', error.message);
    throw error;
  }
}

/**
 * Extract resume content from input (text or binary)
 */
async function extractResumeContent(input, requestId) {
  const isBinary = typeof input === 'object' && input.buffer;
  
  const prompt = `You are an expert resume parser. Extract ALL content from this resume into a structured format.

${isBinary ? 'IMPORTANT: Read the attached PDF visually. Focus on visible content only.' : ''}

RULES:
1. Preserve EVERY heading, subheading, and section
2. Extract ALL bullet points and descriptions
3. Keep ALL dates, companies, titles exactly as written
4. Identify ALL skills, certifications, projects
5. Maintain original structure and organization

${!isBinary ? `Resume Text:\n${input.substring(0, 6000)}` : ''}

Return this EXACT JSON structure:
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email",
    "phone": "phone",
    "location": "location",
    "linkedin": "linkedin url",
    "website": "portfolio/website"
  },
  "professionalSummary": "Original summary or objective",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "dates": "Start - End",
      "bullets": ["Bullet 1", "Bullet 2", "..."]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "location": "City, State",
      "dates": "Year",
      "gpa": "GPA if mentioned",
      "honors": "Honors/Awards if any"
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "languages": ["language1", "language2"],
    "frameworks": ["framework1"],
    "tools": ["tool1", "tool2"],
    "soft": ["soft skill1", "soft skill2"]
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["tech1", "tech2"],
      "link": "URL if any"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Date"
    }
  ],
  "additionalSections": [
    {
      "heading": "Section Heading",
      "content": "Section content"
    }
  ]
}

Return ONLY the JSON. No markdown, no explanations.`;

  return await callAI(prompt, isBinary ? input : null);
}

/**
 * Optimize extracted data for 90% ATS score
 */
async function optimizeForATS(extractedData, targetRole, requestId) {
  const prompt = `You are an ATS optimization expert. Your goal: Optimize this resume for 90%+ ATS score for a ${targetRole} role.

Current Resume Data:
${JSON.stringify(extractedData)}

OPTIMIZATION RULES:
1. PRESERVE all original content - do NOT remove or fabricate information
2. ENHANCE bullet points with action verbs and quantifiable metrics
3. ADD relevant keywords for ${targetRole} where naturally appropriate
4. OPTIMIZE formatting for ATS parsing (simple, clear structure)
5. MAINTAIN all original headings and sections
6. IMPROVE professional summary for impact and relevance

ATS SCORING CRITERIA (Target: 90%):
- Keywords alignment: 30 points
- Clear structure: 20 points
- Action verbs: 15 points
- Quantifiable results: 15 points
- Format cleanliness: 10 points
- Contact info clarity: 10 points

Return this JSON:
{
  "personalInfo": { ...enhanced contact info... },
  "professionalSummary": "ATS-optimized summary with keywords",
  "experience": [
    {
      "title": "Original Title",
      "company": "Original Company",
      "location": "Original Location",
      "dates": "Original Dates",
      "bullets": ["OPTIMIZED bullet with action verb and metrics", "..."]
    }
  ],
  "education": [ ...preserved education... ],
  "skills": {
    "technical": ["optimized skill list with relevant keywords"],
    "languages": [...],
    "frameworks": [...],
    "tools": [...],
    "soft": [...]
  },
  "projects": [ ...enhanced projects... ],
  "certifications": [ ...preserved certifications... ],
  "additionalSections": [ ...preserved additional sections... ],
  "improvements": [
    "Added 15 relevant keywords for ${targetRole}",
    "Enhanced 12 bullet points with quantifiable metrics",
    "Optimized summary for ATS parsing",
    "..."
  ],
  "keywordsAdded": 15,
  "sectionsOptimized": 5
}

Return ONLY the JSON.`;

  return await callAI(prompt);
}

/**
 * Create 2 beautiful ATS-optimized templates
 */
function createATSTemplates(optimizedData, targetRole) {
  const templates = [];
  
  // Template 1: Professional Modern
  templates.push({
    id: 'professional-modern',
    name: 'Professional Modern',
    description: 'Clean, modern design optimized for ATS with excellent readability',
    style: 'senior-modern',
    content: {
      ...optimizedData,
      templateStyle: 'professional-modern'
    }
  });
  
  // Template 2: Classic ATS
  templates.push({
    id: 'classic-ats',
    name: 'Classic ATS',
    description: 'Traditional single-column format for maximum ATS compatibility',
    style: 'concise-classic',
    content: {
      ...optimizedData,
      templateStyle: 'classic-ats'
    }
  });
  
  return templates;
}

/**
 * Calculate ATS score based on optimized content
 */
function calculateATSScore(data) {
  let score = 50; // Base score
  
  // Contact info (10 points)
  if (data.personalInfo?.email) score += 3;
  if (data.personalInfo?.phone) score += 3;
  if (data.personalInfo?.location) score += 2;
  if (data.personalInfo?.linkedin) score += 2;
  
  // Professional summary (10 points)
  if (data.professionalSummary?.length > 100) score += 10;
  
  // Experience with bullets (15 points)
  const bulletCount = data.experience?.reduce((sum, exp) => sum + (exp.bullets?.length || 0), 0) || 0;
  score += Math.min(bulletCount, 15);
  
  // Skills (10 points)
  const skillCount = Object.values(data.skills || {}).flat().length;
  score += Math.min(skillCount / 2, 10);
  
  // Education (5 points)
  if (data.education?.length > 0) score += 5;
  
  return Math.min(Math.round(score), 95); // Cap at 95%
}
