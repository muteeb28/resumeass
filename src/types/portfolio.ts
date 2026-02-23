export interface PortfolioData {
  name: string;
  initials: string;
  avatarUrl?: string;
  location?: string;
  description: string;
  summary: string;
  contact: {
    email?: string;
    phone?: string;
    social: { name: string; url: string }[];
  };
  work: {
    company: string;
    title: string;
    start: string;
    end: string;
    description: string;
    badges?: string[];
  }[];
  education: {
    school: string;
    degree: string;
    start: string;
    end: string;
  }[];
  skills: string[];
  projects: {
    title: string;
    description: string;
    technologies: string[];
    href?: string;
  }[];
}
