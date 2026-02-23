/**
 * Converter to transform parsed resume data into Portfolioly's strict schema
 */

import type { ResumeJSON, ResumeJSONv2, TimelineItem, ProjectItem, EducationItem, ListItem } from "@/types/resume";
import type { ResumeData, ResumeWork, ResumeEducation, ResumeSkill, ResumeProject, ResumeAward, ResumeVolunteer } from "@/types/portfolioly-resume";

const normalizeUrl = (value: string): string => {
  const trimmed = value.trim().replace(/[),.;]+$/, "");
  if (!trimmed) return "";

  // Handle "Github:// Username" and "LinkedIn:// Username" shorthand from resumes
  const githubMatch = trimmed.match(/^github:\/\/\s*(.+)$/i);
  if (githubMatch) {
    const username = githubMatch[1].trim().replace(/\s+/g, "");
    return `https://github.com/${username}`;
  }
  const linkedinMatch = trimmed.match(/^linkedin:\/\/\s*(.+)$/i);
  if (linkedinMatch) {
    const username = linkedinMatch[1].trim().replace(/\s+/g, "");
    return `https://linkedin.com/in/${username}`;
  }

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(www\.)?[\w.-]+\.[a-z]{2,}([/#?].*)?$/i.test(trimmed)) {
    return `https://${trimmed.replace(/^www\./i, "")}`;
  }
  return "";
};

const isGenericRootProfileUrl = (url: string): boolean => {
  const lower = url.toLowerCase().replace(/\/+$/, "");
  return (
    lower === "https://github.com" ||
    lower === "https://linkedin.com" ||
    lower === "https://www.linkedin.com" ||
    lower === "https://linkedin.com/in" ||
    lower === "https://www.linkedin.com/in"
  );
};

export const normalizeProfileLinks = (links: string[]): string[] => {
  const normalized = links
    .filter((link): link is string => typeof link === "string")
    .map(normalizeUrl)
    .filter(Boolean);

  const unique = [...new Set(normalized)];
  const meaningful = unique.filter((url) => !isGenericRootProfileUrl(url));
  return meaningful.length > 0 ? meaningful : unique;
};

/**
 * Convert parsed resume to Portfolioly's EXACT format
 */
export function convertToPortfoliolyFormat(resume: ResumeJSON | ResumeJSONv2): ResumeData {
  const dynamicResume = resume as any;
  const profileLinks = normalizeProfileLinks(resume.basics?.links || []);
  // 1. BASICS
  const basics = {
    name: resume.basics?.name || "",
    email: resume.basics?.email || "",
    phone: resume.basics?.phone || "",
    headline: resume.basics?.title || "",
    summary: resume.basics?.summary || "",
    location: resume.basics?.location || "",
    profiles: profileLinks.map(link => ({
      network: link?.toLowerCase().includes('github') ? 'GitHub' :
        link?.toLowerCase().includes('linkedin') ? 'LinkedIn' : 'Link',
      username: '',
      url: link || ""
    }))
  };

  // 2. WORK (formerly experience)
  let work: ResumeWork[] = [];
  if ('sections' in resume) {
    // V2 Format
    const expSection = Object.values(resume.sections || {}).find(s =>
      s.id === 'experience' || s.label.toLowerCase().includes('experience')
    );
    if (expSection) {
      work = expSection.items
        .filter((item): item is TimelineItem => item.type === 'timeline')
        .map(item => ({
          company: item.organization || "",
          position: item.title || "",
          startDate: (item.dates || "").split(/[-–—]/)[0]?.trim() || "",
          endDate: (item.dates || "").split(/[-–—]/)[1]?.trim() || "Present",
          highlights: item.bullets || []
        }));
    }
  } else {
    // V1 Format
    work = (resume.experience || []).map(exp => ({
      company: exp.company || "",
      position: exp.role || "",
      startDate: (exp.dates || "").split(/[-–—]/)[0]?.trim() || "",
      endDate: (exp.dates || "").split(/[-–—]/)[1]?.trim() || "Present",
      highlights: exp.bullets || []
    }));
  }

  // 3. EDUCATION
  let education: ResumeEducation[] = [];
  if ('sections' in resume) {
    const eduSection = Object.values(resume.sections || {}).find(s => s.id === 'education');
    if (eduSection) {
      education = eduSection.items
        .filter((item): item is EducationItem => item.type === 'education')
        .map(item => ({
          institution: item.school || "",
          area: item.degree || "",
          studyType: "Degree",
          score: item.gpa || ""
        }));
    }
  } else {
    education = (resume.education || []).map(edu => {
      const details: string[] = (edu as any).details || [];
      const cgpaDetail = details.find((d: string) => /gpa|cgpa|grade/i.test(d));
      const score = cgpaDetail || "";
      const otherDetails = details.filter((d: string) => d !== cgpaDetail);
      const dates: string = (edu as any).dates || "";
      const dateParts = dates.split(/\s*[-–—]\s*/);
      return {
        institution: edu.school || "",
        area: edu.degree || "",
        studyType: "Degree",
        score,
        highlights: otherDetails,
        startDate: dateParts[0]?.trim() || "",
        endDate: dateParts[1]?.trim() || "",
        location: (edu as any).location || "",
      };
    });
  }

  // 4. SKILLS
  let skills: ResumeSkill[] = [];
  if ('sections' in resume) {
    const skillsSection = Object.values(resume.sections || {}).find(s => s.id === 'skills');
    if (skillsSection) {
      const grouped: Record<string, string[]> = {};
      skillsSection.items
        .filter((item): item is ListItem => item.type === 'list')
        .forEach(item => {
          const category = item.category || "General";
          if (!grouped[category]) grouped[category] = [];
          grouped[category].push(item.value);
        });
      skills = Object.entries(grouped).map(([name, keywords]) => ({ name, keywords }));
    }
  } else {
    skills = (resume.skills || []).map(s => ({
      name: s.name || "Skills",
      keywords: s.items || []
    }));
  }

  // 5. PROJECTS
  let projects: ResumeProject[] = [];
  if ('sections' in resume) {
    const projSection = Object.values(resume.sections || {}).find(s => s.id === 'projects');
    if (projSection) {
      projects = projSection.items
        .filter((item): item is ProjectItem => item.type === 'project')
        .map(item => ({
          name: item.name || "",
          description: item.description || "",
          entity: "Personal",
          type: "Project"
        }));
    }
  } else {
    projects = (resume.projects || []).map(p => {
      const proj = p as any;
      const dates: string = proj.dates || "";
      const dateParts = dates.split(/\s*[-–—]\s*/);
      return {
        name: p.name || "",
        description: p.description || "",
        entity: "Personal",
        type: "Project",
        highlights: proj.bullets || [],
        startDate: dateParts[0]?.trim() || "",
        endDate: dateParts[1]?.trim() || "",
        role: proj.role || "",
        liveUrl: proj.link || "",
      };
    });
  }

  // 6. AWARDS & VOLUNTEER
  // Preserve achievements/coursework so extraction data is not lost during conversion.
  const achievements = Array.isArray(dynamicResume.achievements) ? dynamicResume.achievements : [];
  const coursework = Array.isArray(dynamicResume.coursework) ? dynamicResume.coursework : [];

  const awardsFromAchievementsRaw: Array<ResumeAward | null> = achievements
    .map((item: any): ResumeAward | null => {
      if (typeof item === "string") {
        const text = item.trim();
        if (!text) return null;
        return { title: text, date: "", awarder: "", summary: "" };
      }
      if (item && typeof item === "object") {
        const title = (item.name || item.title || "").toString().trim();
        if (!title) return null;
        return {
          title,
          date: (item.date || "").toString(),
          awarder: (item.issuer || item.awarder || "").toString(),
          summary: (item.summary || item.description || "").toString(),
        };
      }
      return null;
    });
  const awardsFromAchievements: ResumeAward[] = awardsFromAchievementsRaw
    .filter((item): item is ResumeAward => item !== null);

  const awardsFromCourseworkRaw: Array<ResumeAward | null> = coursework
    .map((course: any): ResumeAward | null => {
      const text = typeof course === "string" ? course.trim() : (course?.name || "").toString().trim();
      if (!text) return null;
      return {
        title: text,
        date: "",
        awarder: "Coursework",
        summary: "Relevant coursework",
      };
    });
  const awards: ResumeAward[] = awardsFromAchievements;

  // Map volunteer/organizations from extraction
  const rawVolunteer = Array.isArray(dynamicResume.volunteer) ? dynamicResume.volunteer : [];
  const volunteer: ResumeVolunteer[] = rawVolunteer
    .filter((v: any) => v && (v.organization || v.role))
    .map((v: any) => ({
      organization: (v.organization || "").toString().trim(),
      position: (v.role || "").toString().trim(),
      url: "",
      startDate: (v.dates || "").toString().split(/[-–—]/)[0]?.trim() || "",
      endDate: (v.dates || "").toString().split(/[-–—]/)[1]?.trim() || "",
      summary: (v.bullets || []).join(". "),
      highlights: Array.isArray(v.bullets) ? v.bullets : [],
    }));

  const courseworkList: string[] = coursework
    .map((c: any) => (typeof c === "string" ? c.trim() : (c?.name || "").toString().trim()))
    .filter(Boolean);

  // Map certifications → extraSections entry
  const rawCertifications = Array.isArray(dynamicResume.certifications) ? dynamicResume.certifications : [];
  const certSection = rawCertifications.length > 0 ? [{
    title: "Certifications",
    items: rawCertifications
      .map((c: any) => {
        if (typeof c === "string") return c.trim();
        const name = (c.name || "").trim();
        const issuer = (c.issuer || "").trim();
        const date = (c.date || "").trim();
        return [name, issuer && `Issued by ${issuer}`, date].filter(Boolean).join(" — ");
      })
      .filter(Boolean),
  }] : [];

  // Map raw extraSections from Mistral (interests, languages, publications, etc.)
  const rawExtraSections = Array.isArray(dynamicResume.extraSections) ? dynamicResume.extraSections : [];
  const extraSections = [
    ...certSection,
    ...rawExtraSections
      .filter((s: any) => s && s.title && Array.isArray(s.items) && s.items.length > 0)
      .map((s: any) => ({ title: s.title, items: s.items.filter(Boolean) })),
  ];

  return {
    basics,
    work,
    skills,
    projects,
    education,
    awards,
    volunteer,
    coursework: courseworkList,
    extraSections: extraSections.length > 0 ? extraSections : undefined,
  };
}

