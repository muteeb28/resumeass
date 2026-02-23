export type RenderMode = 'preview' | 'single' | 'multi';

export const PLACEHOLDERS = {
  name: ''
};

export const CONTENT_LIMITS: Record<RenderMode, {
  summaryChars?: number;
  skills?: number;
  experience?: number;
  bullets?: number;
  education?: number;
  projects?: number;
  certifications?: number;
}> = {
  preview: {
    summaryChars: 140,
    skills: 6,
    experience: 1,
    bullets: 2,
    education: 1,
    projects: 1,
    certifications: 2
  },
  single: {
    summaryChars: 400,
    skills: 12,
    experience: 3,
    bullets: 4,
    education: 2,
    projects: 2,
    certifications: 4
  },
  multi: {}
};

export const MULTI_PAGE_RULES = {
  minExperience: 3,
  summaryChars: 300,
  minSkills: 10,
  minEducation: 2,
  minCertifications: 4
};

export const SECTION_TITLES = {
  seniorModern: {
    summary: 'EXECUTIVE SUMMARY',
    skills: 'SKILLS',
    competencies: 'CORE COMPETENCIES',
    experience: 'EXPERIENCE',
    professionalExperience: 'PROFESSIONAL EXPERIENCE',
    education: 'EDUCATION',
    projects: 'PROJECTS',
    certifications: 'CERTIFICATIONS'
  },
  conciseClassic: {
    summary: 'PROFESSIONAL SUMMARY',
    skills: 'SKILLS',
    coreSkills: 'CORE SKILLS',
    experience: 'EXPERIENCE',
    professionalExperience: 'PROFESSIONAL EXPERIENCE',
    education: 'EDUCATION',
    projects: 'PROJECTS',
    certifications: 'CERTIFICATIONS'
  }
};

export const CONTACT_LABELS = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  website: 'Portfolio'
};
