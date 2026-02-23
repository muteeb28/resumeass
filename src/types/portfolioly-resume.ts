/**
 * Portfolioly Resume Schema (JSON Resume Standard)
 *
 * This schema is EXTREMELY STRICT. Deviating by one character will cause site failure.
 * Used for both storage and rendering.
 */

export interface ResumeProfile {
  network: string;
  username: string;
  url: string;
}

export interface ResumeBasics {
  name: string;
  email: string;
  phone: string;
  headline?: string;
  summary?: string;
  location?: string;
  photo?: string;
  profiles: ResumeProfile[];
}

export interface ResumeWork {
  company: string;
  position: string;
  startDate: string; // Raw string, no Date objects
  endDate: string;   // Raw string, no Date objects
  highlights: string[];
}

export interface ResumeSkill {
  name: string;
  keywords: string[];
}

export interface ResumeProject {
  name: string;
  description: string;
  entity: string;
  type: string;
  liveUrl?: string;
  sourceUrl?: string;
  highlights?: string[];
  startDate?: string;
  endDate?: string;
  role?: string;
}

export interface ResumeEducation {
  institution: string;
  area: string;
  studyType: string;
  score: string;
  highlights?: string[];
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface ResumeAward {
  title: string;
  date: string;
  awarder: string;
  summary: string;
}

export interface ResumeVolunteer {
  organization: string;
  position: string;
  url: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
}

export type SectionType =
  | "basics"
  | "work"
  | "skills"
  | "projects"
  | "education"
  | "awards"
  | "volunteer";

export interface ResumeData {
  basics: ResumeBasics;
  work: ResumeWork[];
  skills: ResumeSkill[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  awards: ResumeAward[];
  volunteer: ResumeVolunteer[];
  coursework?: string[];
  extraSections?: Array<{ title: string; items: string[] }>;
}

