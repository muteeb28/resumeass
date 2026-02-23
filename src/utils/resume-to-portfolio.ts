import type { PortfolioData } from "@/types/portfolio";
import type { ResumeData } from "@/types/portfolioly-resume";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function classifyUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes("github.com")) return "GitHub";
  if (lower.includes("linkedin.com")) return "LinkedIn";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "X";
  if (lower.includes("dribbble.com")) return "Dribbble";
  if (lower.includes("behance.net")) return "Behance";
  if (lower.includes("stackoverflow.com")) return "Stack Overflow";
  if (lower.includes("medium.com")) return "Medium";
  if (lower.includes("dev.to")) return "Dev.to";
  return "Website";
}

function splitDates(dateStr: string): { start: string; end: string } {
  if (!dateStr) return { start: "", end: "" };
  const parts = dateStr.split(/\s*[-–—]\s*/);
  return {
    start: parts[0]?.trim() || "",
    end: parts[1]?.trim() || "",
  };
}

/**
 * Maps the Portfolioly ResumeData (what we store in DB / get from parser)
 * into PortfolioData (what the portfolio template renders).
 */
export function mapResumeToPortfolio(data: ResumeData): PortfolioData {
  const basics = data.basics || ({} as any);

  // Social links from profiles
  const social: { name: string; url: string }[] = (basics.profiles || [])
    .filter((p: any) => p.url)
    .map((p: any) => ({
      name: p.network || classifyUrl(p.url),
      url: p.url,
    }));

  // Flatten all skill keywords
  const skills: string[] = (data.skills || []).flatMap(
    (group) => group.keywords || []
  );

  // Map work experience
  const work = (data.work || []).map((job) => ({
    company: job.company || "",
    title: job.position || "",
    start: job.startDate || "",
    end: job.endDate || "",
    description: (job.highlights || []).filter(Boolean).join("\n"),
  }));

  // Map education
  const education = (data.education || []).map((edu) => ({
    school: edu.institution || "",
    degree: [edu.studyType, edu.area].filter(Boolean).join(" in "),
    start: "",
    end: "",
  }));

  // Map projects
  const projects = (data.projects || []).map((proj) => ({
    title: proj.name || "",
    description: proj.description || "",
    technologies: proj.type ? [proj.type] : [],
  }));

  return {
    name: basics.name || "",
    initials: getInitials(basics.name || ""),
    avatarUrl: basics.photo,
    location: basics.location,
    description: basics.headline || basics.name || "",
    summary: basics.summary || "",
    contact: {
      email: basics.email,
      phone: basics.phone,
      social,
    },
    work,
    education,
    skills,
    projects,
  };
}

/**
 * Maps raw parser output (various formats) into PortfolioData.
 * Handles: Portfolioly ResumeData, raw parser JSON, etc.
 */
export function mapRawToPortfolio(raw: any): PortfolioData {
  // If it looks like Portfolioly format (has basics.profiles)
  if (raw.basics && Array.isArray(raw.basics.profiles)) {
    return mapResumeToPortfolio(raw as ResumeData);
  }

  // Raw parser format (personal_info, work_experiences, etc.)
  const pi = raw.personal_info || raw.basics || {};

  const social: { name: string; url: string }[] = (
    pi.links ||
    pi.profiles?.map((p: any) => p.url) ||
    []
  ).map((url: string) => ({
    name: classifyUrl(url),
    url,
  }));

  const skills: string[] = (() => {
    if (raw.skills?.categories) {
      return raw.skills.categories.flatMap(
        (cat: any) => cat.items || cat.keywords || []
      );
    }
    if (Array.isArray(raw.skills)) {
      return raw.skills.flatMap(
        (s: any) =>
          s.keywords || s.items || (typeof s === "string" ? [s] : [])
      );
    }
    return [];
  })();

  const work = (raw.work_experiences || raw.work || raw.experience || []).map(
    (job: any) => {
      const dates = splitDates(job.dates || "");
      return {
        company: job.company || job.organization || "",
        title: job.position || job.role || job.title || "",
        start: job.startDate || dates.start,
        end: job.endDate || dates.end,
        description: (
          job.highlights ||
          job.bullets ||
          job.responsibilities ||
          []
        )
          .filter(Boolean)
          .join("\n"),
      };
    }
  );

  const education = (raw.education || []).map((edu: any) => ({
    school: edu.institution || edu.school || edu.university || "",
    degree: [edu.studyType || edu.degree_type, edu.area || edu.degree]
      .filter(Boolean)
      .join(" in "),
    start: edu.startDate || "",
    end: edu.endDate || "",
  }));

  const projects = (raw.projects || []).map((proj: any) => ({
    title: proj.name || proj.title || "",
    description: proj.description || "",
    technologies: proj.tech || proj.technologies || [],
    href: proj.link || proj.url,
  }));

  const name = pi.full_name || pi.name || "";

  return {
    name,
    initials: getInitials(name),
    avatarUrl: pi.photo,
    location: pi.location,
    description:
      pi.headline || pi.title || raw.basics?.headline || name,
    summary:
      pi.summary ||
      raw.basics?.summary ||
      raw.summary ||
      raw.objective ||
      "",
    contact: {
      email: pi.email || raw.basics?.email,
      phone: pi.phone || raw.basics?.phone,
      social,
    },
    work,
    education,
    skills,
    projects,
  };
}
