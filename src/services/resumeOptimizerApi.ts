const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_API_BASE = '/api';

export const getApiBaseUrl = () => API_BASE_URL || DEFAULT_API_BASE;

export const buildApiUrl = (path: string) => {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return base.endsWith('/') ? `${base.slice(0, -1)}${normalizedPath}` : `${base}${normalizedPath}`;
};

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  content: any;
  style?: string;
  source?: string;
  isOptimized?: boolean;
}

export interface OptimizationResult {
  success: boolean;
  data?: {
    originalText?: string;
    templates?: ResumeTemplate[];
    improvements?: string[];
    stats?: {
      atsScore: number;
      keywordsAdded: number;
      improvementsMade: number;
      matchScore: number;
    };
    keyChanges?: string;
    targetRole?: string;
    optimizationStatus?: string;
  };
  error?: string;
  details?: string;
}

export interface TargetRole {
  value: string;
  label: string;
}

export interface ApiError extends Error {
  status?: number;
  details?: string;
}

export interface ExtractedResumeData {
  status: 'success' | 'partial' | 'failed';
  confidence: number;
  [key: string]: any;
}

/**
 * Progress update interface for streaming optimization
 */
export interface ProgressUpdate {
  step: string;
  message: string;
  timestamp: string;
  data?: any;
}

/**
 * Extract resume content without calling AI
 * Uses XMLHttpRequest for progress tracking like portfolioly
 */
export async function extractResumeData(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ExtractedResumeData> {
  const formData = new FormData();
  formData.append('resume', file);

  const url = buildApiUrl('extract-resume');

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener("load", () => {
      try {
        console.log('\n' + '='.repeat(60));
        console.log('📥 RESUME EXTRACTION RESPONSE');
        console.log('='.repeat(60));
        console.log('Status:', xhr.status);

        if (xhr.status >= 400) {
          console.error('❌ HTTP Error:', xhr.status, xhr.statusText);
          let errorData: any;
          try {
            errorData = JSON.parse(xhr.responseText);
            console.error('Error data:', errorData);
          } catch {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            return;
          }
          reject(new Error(errorData.error || `HTTP ${xhr.status}`));
          return;
        }

        const result = JSON.parse(xhr.responseText);
        console.log('✅ Response received:', {
          success: result.success,
          hasData: !!result.data,
          dataKeys: result.data ? Object.keys(result.data) : []
        });

        if (result.data) {
          console.log('📋 RAW DATA STRUCTURE:', result.data);
          console.log('📋 Extracted Data Summary:');
          console.log('  Name:', result.data.basics?.name || result.data.personal_info?.full_name || 'Not found');
          console.log('  Email:', result.data.basics?.email || result.data.personal_info?.email || 'Not found');
          console.log('  Phone:', result.data.basics?.phone || result.data.personal_info?.phone || 'Not found');
          console.log('  Work Experiences:', result.data.experience?.length || result.data.work_experiences?.length || 0);
          console.log('  Education:', result.data.education?.length || 0);
          console.log('  Projects:', result.data.projects?.length || 0);
          console.log('  Skills Categories:', Array.isArray(result.data.skills)
            ? result.data.skills.length
            : (result.data.skills?.categories?.length || 0));
          console.log('  Achievements:', result.data.achievements?.length || 0);
          console.log('  Parser Used:', result.data._parser);
        }
        console.log('='.repeat(60) + '\n');

        if (!result.success) {
          reject(new Error(result.error || 'Failed to extract resume'));
          return;
        }

        resolve(result.data);
      } catch (error) {
        console.error('❌ Error parsing response:', error);
        reject(error);
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during file upload. Please check your connection."));
    });

    xhr.addEventListener("timeout", () => {
      reject(new Error("Upload timed out. Please try again."));
    });

    xhr.open("POST", url);
    xhr.timeout = 60000; // 60 second timeout
    xhr.send(formData);
  });
}

/**
 * Extract resume data for the portfolio flow — calls /api/extract-portfolio (separate pipeline)
 */
export async function extractPortfolioData(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ExtractedResumeData> {
  const formData = new FormData();
  formData.append('resume', file);

  const url = buildApiUrl('extract-portfolio');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress((event.loaded / event.total) * 100);
        }
      });
    }

    xhr.addEventListener("load", () => {
      try {
        if (xhr.status >= 400) {
          let errorData: any;
          try { errorData = JSON.parse(xhr.responseText); } catch { }
          reject(new Error(errorData?.error || `HTTP ${xhr.status}`));
          return;
        }
        const result = JSON.parse(xhr.responseText);
        if (!result.success) {
          reject(new Error(result.error || 'Failed to extract portfolio resume'));
          return;
        }
        resolve(result.data);
      } catch (error) {
        reject(error);
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during file upload.")));
    xhr.addEventListener("timeout", () => reject(new Error("Upload timed out. Please try again.")));

    xhr.open("POST", url);
    xhr.timeout = 180000; // 3 minute timeout (two-step pipeline takes longer)
    xhr.send(formData);
  });
}

/**
 * Parse pasted resume text without calling AI
 */
export async function parseResumeText(text: string, pageCount?: number): Promise<any> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Resume text is required');
  }

  const response = await fetch(buildApiUrl('parse-resume-text'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: trimmed,
      pageCount
    })
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to parse resume text');
  }

  return result.data;
}

/**
 * Polish resume text using server-side AI (no key in browser)
 */
export async function polishResumeText(text: string): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Resume text is required');
  }

  const response = await fetch(buildApiUrl('polish-resume-text'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: trimmed })
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to polish resume text');
  }

  const polished = result.data?.polishedText;
  if (!polished || typeof polished !== 'string') {
    throw new Error('Polished resume text is missing');
  }

  return polished;
}

/**
 * Optimize resume with streaming progress updates using Server-Sent Events
 */
export async function optimizeResumeWithProgress(
  file: File,
  targetRole: string,
  onProgress: (update: ProgressUpdate) => void,
  originalPageCount?: number,
  parsedData?: any
): Promise<OptimizationResult> {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('targetRole', targetRole);
  if (originalPageCount) {
    formData.append('originalPageCount', originalPageCount.toString());
  }
  if (parsedData) {
    formData.append('parsedData', JSON.stringify(parsedData));
  }

  const response = await fetch(buildApiUrl('optimize-resume-stream'), {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  if (!response.body) throw new Error('Response body is null');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let result: OptimizationResult | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        try {
          const update: ProgressUpdate = JSON.parse(line.slice(6));
          onProgress(update);

          if (update.step === 'completed' && update.data) {
            result = { success: true, data: update.data };
          } else if (update.step === 'error') {
            throw new Error(update.message || 'Optimization failed');
          }
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!result) throw new Error('No result received');
  return result;
}

/**
 * Optimize resume using the backend API (legacy, non-streaming)
 */
export async function optimizeResume(file: File, targetRole: string, originalPageCount?: number): Promise<OptimizationResult> {
  try {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);
    if (originalPageCount) {
      formData.append('originalPageCount', originalPageCount.toString());
    }

    console.log(` Sending optimization request for role: ${targetRole}`);
    console.log(` File: ${file.name}, Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

    const response = await fetch(buildApiUrl('optimize-resume'), {
      method: 'POST',
      body: formData,
    });

    const result: OptimizationResult = await response.json();

    if (!response.ok) {
      const error = new Error(result.error || 'Failed to optimize resume') as ApiError;
      error.status = response.status;
      error.details = result.details;
      throw error;
    }

    if (!result.success) {
      const error = new Error(result.error || 'Optimization failed') as ApiError;
      error.details = result.details;
      throw error;
    }

    console.log(' Resume optimization completed successfully');
    return result;

  } catch (error) {
    console.error(' Resume optimization error:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      const apiError = new Error('Unable to connect to the optimization service. Please ensure the server is running.') as ApiError;
      apiError.details = 'Connection failed';
      throw apiError;
    }

    throw error;
  }
}

/**
 * Get available target roles
 */
export async function getTargetRoles(): Promise<TargetRole[]> {
  try {
    const response = await fetch(buildApiUrl('target-roles'));

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch target roles');
    }

    return result.data;

  } catch (error) {
    console.error('Failed to fetch target roles:', error);

    return [];
  }
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<{ status: string; message: string; timestamp: string }> {
  try {
    const response = await fetch(buildApiUrl('health'));
    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error('API health check failed');
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate file before upload
 */
export function validateResumeFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds the maximum limit of 10MB.`
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only PDF, DOC, and DOCX files are supported.'
    };
  }

  return { valid: true };
}
