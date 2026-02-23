import { buildApiUrl } from './resumeOptimizerApi';
import type { ResumeGenerationResult } from '../types/resume';

export interface UserData {
  personalDetails: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
    summary?: string;
  };
  experiences: Array<{
    jobTitle: string;
    company: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    location: string;
    description?: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    graduationDate: string;
    location: string;
    gpa?: string;
  }>;
  skills?: string;
}

export interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedIn?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    graduation: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
  };
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  certifications?: string[];
}

export class ResumeGeneratorService {
  async generateResume(jobDescription: string, templateId: string, userData?: UserData): Promise<ResumeData> {
    const response = await fetch(buildApiUrl('generate-resume'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobDescription,
        templateId,
        userData
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to generate resume');
    }

    return result.data as ResumeData;
  }
}

export type JobResumeRequest = {
  resumeText: string;
  jobDescription?: string;
  roleTitle?: string;
  companyName?: string;
};

const getNetworkErrorMessage = (error: unknown) => {
  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return "Unable to reach the API. Start the backend server and confirm VITE_API_URL or the /api proxy is correct.";
  }
  return "Unable to reach the API.";
};

export async function generateJobSpecificResume(
  payload: JobResumeRequest
): Promise<ResumeGenerationResult> {
  let response: Response;
  try {
    response = await fetch(buildApiUrl('generate-job-resume'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to generate job-specific resume');
  }

  return result.data as ResumeGenerationResult;
}
