import OpenAI from 'openai';

export interface ATSScore {
  overall: number;
  categories: {
    formatting: number;
    keywords: number;
    experience: number;
    skills: number;
  };
  suggestions: string[];
}

export class ResumeAnalysisService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Required for browser usage
    });
  }

  /**
   * Extract text from uploaded file (PDF, DOC, DOCX)
   */
  async extractTextFromFile(file: File): Promise<string> {
    const fileType = file.type;
    
    if (fileType === 'application/pdf') {
      return this.extractFromPDF(file);
    } else if (fileType === 'application/msword' || 
               fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return this.extractFromDOCX(file);
    }
    
    throw new Error('Unsupported file type. Please upload PDF, DOC, or DOCX files.');
  }

  /**
   * Extract text from PDF file (simplified for demo)
   */
  private async extractFromPDF(file: File): Promise<string> {
    // For demo purposes, return placeholder text
    // In production, implement proper PDF text extraction
    return `Sample resume text extracted from ${file.name}. This would contain the actual resume content including work experience, education, skills, and other relevant information.`;
  }

  /**
   * Extract text from DOCX file (simplified for demo)
   */
  private async extractFromDOCX(file: File): Promise<string> {
    // For demo purposes, return placeholder text
    // In production, implement proper DOCX text extraction
    return `Sample resume text extracted from ${file.name}. This would contain the actual resume content including work experience, education, skills, and other relevant information.`;
  }

  /**
   * Analyze resume text using DeepSeek API
   */
  async analyzeResume(resumeText: string, jobDescription?: string): Promise<ATSScore> {
    try {
      const prompt = this.buildAnalysisPrompt(resumeText, jobDescription);
      
      const completion = await this.openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume analyzer and ATS (Applicant Tracking System) specialist. Analyze resumes and provide detailed scoring and improvement suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const analysisResult = completion.choices[0].message.content;
      
      if (!analysisResult) {
        throw new Error('No analysis result received from DeepSeek API');
      }
      
      return this.parseAnalysisResult(analysisResult);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw new Error('Failed to analyze resume. Please try again.');
    }
  }

  /**
   * Build the analysis prompt for DeepSeek API
   */
  private buildAnalysisPrompt(resumeText: string, jobDescription?: string): string {
    const basePrompt = `
Please analyze this resume for ATS (Applicant Tracking System) compatibility and provide a detailed score breakdown.

Resume Text:
${resumeText}

${jobDescription ? `Job Description to match against:\n${jobDescription}\n` : ''}

Please provide your analysis in the following JSON format:
{
  "overall": <number between 0-100>,
  "categories": {
    "formatting": <number between 0-100>,
    "keywords": <number between 0-100>,
    "experience": <number between 0-100>,
    "skills": <number between 0-100>
  },
  "suggestions": [
    "<specific improvement suggestion 1>",
    "<specific improvement suggestion 2>",
    "<specific improvement suggestion 3>",
    "<specific improvement suggestion 4>",
    "<specific improvement suggestion 5>"
  ]
}

Scoring criteria:
- Formatting (0-100): ATS-friendly structure, clear sections, consistent formatting
- Keywords (0-100): Relevant industry keywords, job-specific terms, skill mentions
- Experience (0-100): Clear work history, quantified achievements, relevant experience
- Skills (0-100): Technical skills, soft skills, certifications, relevant competencies

Overall score should be calculated based on all categories. Provide 5 specific, actionable suggestions for improvement.
`;

    return basePrompt.trim();
  }

  /**
   * Parse the analysis result from DeepSeek API
   */
  private parseAnalysisResult(analysisText: string): ATSScore {
    try {
      // Extract JSON from the response (in case there's additional text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in analysis result');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!parsed.overall || !parsed.categories || !parsed.suggestions) {
        throw new Error('Invalid analysis result structure');
      }

      return {
        overall: Math.min(100, Math.max(0, parsed.overall)),
        categories: {
          formatting: Math.min(100, Math.max(0, parsed.categories.formatting || 0)),
          keywords: Math.min(100, Math.max(0, parsed.categories.keywords || 0)),
          experience: Math.min(100, Math.max(0, parsed.categories.experience || 0)),
          skills: Math.min(100, Math.max(0, parsed.categories.skills || 0))
        },
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 5) : [
          'Add more industry-specific keywords throughout your resume',
          'Improve formatting consistency and use standard section headers',
          'Include quantified achievements with numbers and percentages',
          'Add technical skills section with relevant technologies',
          'Use action verbs to start bullet points in experience section'
        ]
      };
    } catch (error) {
      console.error('Error parsing analysis result:', error);
      
      // Return fallback scores if parsing fails
      return {
        overall: 45,
        categories: {
          formatting: 60,
          keywords: 25,
          experience: 70,
          skills: 30
        },
        suggestions: [
          'Add more industry-specific keywords throughout your resume',
          'Improve formatting consistency and use standard section headers',
          'Include quantified achievements with numbers and percentages',
          'Add technical skills section with relevant technologies',
          'Use action verbs to start bullet points in experience section'
        ]
      };
    }
  }
}