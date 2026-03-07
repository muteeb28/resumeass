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
 * Convert parsed resume to Portfolioly's EXACT format.
 * Accepts ResumeJSON (v1) or ResumeJSONv2.
 * For best results, pass data through parserToV2() first so ALL sections are captured.
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

  let work: ResumeWork[] = [];
  let education: ResumeEducation[] = [];
  let skills: ResumeSkill[] = [];
  let projects: ResumeProject[] = [];
  let awards: ResumeAward[] = [];
  let volunteer: ResumeVolunteer[] = [];
  let courseworkList: string[] = [];
  let extraSections: Array<{ title: string; items: string[] }> = [];

  if ('sections' in resume) {
    // ── V2 Format: iterate every section and map to portfolioly fields ──
    const CORE_SECTION_IDS = new Set([
      'experience', 'education', 'skills', 'projects',
      'achievements', 'awards', 'volunteer', 'coursework', 'certifications',
    ]);

    for (const section of Object.values(resume.sections || {})) {
      const id = section.id;
      const items = section.items || [];

      if (id === 'experience' || section.label.toLowerCase().includes('experience')) {
        work = items
          .filter((item): item is TimelineItem => item.type === 'timeline')
          .map(item => ({
            company: item.organization || "",
            position: item.title || "",
            startDate: (item.dates || "").split(/[-–—]/)[0]?.trim() || "",
            endDate: (item.dates || "").split(/[-–—]/)[1]?.trim() || "Present",
            highlights: item.bullets || [],
          }));

      } else if (id === 'education') {
        education = items
          .filter((item): item is EducationItem => item.type === 'education')
          .map(item => ({
            institution: item.school || "",
            area: item.degree || "",
            studyType: "Degree",
            score: item.gpa || "",
            highlights: item.highlights || [],
            startDate: item.startDate || (item.dates || "").split(/[-–—]/)[0]?.trim() || "",
            endDate: item.endDate || (item.dates || "").split(/[-–—]/)[1]?.trim() || "",
            location: item.location || "",
          }));

      } else if (id === 'skills') {
        const grouped: Record<string, string[]> = {};
        items
          .filter((item): item is ListItem => item.type === 'list')
          .forEach(item => {
            const category = item.category || "General";
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push(item.value);
          });
        skills = Object.entries(grouped).map(([name, keywords]) => ({ name, keywords }));

      } else if (id === 'projects') {
        projects = items
          .filter((item): item is ProjectItem => item.type === 'project')
          .map(item => ({
            name: item.name || "",
            description: item.description || "",
            entity: "Personal",
            type: "Project",
            highlights: item.bullets || item.highlights || [],
            startDate: item.startDate || "",
            endDate: item.endDate || "",
            role: item.role || "",
            liveUrl: item.link || "",
            sourceUrl: item.github || "",
          }));

      } else if (id === 'achievements' || id === 'awards') {
        awards = items
          .map((item: any): ResumeAward | null => {
            if (item.type === 'list') {
              const text = (item.value || "").trim();
              return text ? { title: text, date: "", awarder: item.category || "", summary: "" } : null;
            }
            if (item.type === 'timeline') {
              const title = (item.title || "").trim();
              return title ? {
                title,
                date: item.dates || "",
                awarder: item.organization || "",
                summary: (item.bullets || []).join(". "),
              } : null;
            }
            return null;
          })
          .filter((a): a is ResumeAward => a !== null);

      } else if (id === 'volunteer') {
        volunteer = items
          .filter((item): item is TimelineItem => item.type === 'timeline')
          .map(item => ({
            organization: item.organization || "",
            position: item.title || "",
            url: "",
            startDate: (item.dates || "").split(/[-–—]/)[0]?.trim() || "",
            endDate: (item.dates || "").split(/[-–—]/)[1]?.trim() || "",
            summary: (item.bullets || []).join(". "),
            highlights: item.bullets || [],
          }));

      } else if (id === 'coursework') {
        courseworkList = items
          .filter((item): item is ListItem => item.type === 'list')
          .map(item => item.value)
          .filter(Boolean);

      } else if (id === 'certifications') {
        const certItems = items
          .map((item: any) => {
            if (item.type === 'certification') {
              return [item.name, item.issuer && `Issued by ${item.issuer}`, item.date]
                .filter(Boolean).join(" — ");
            }
            if (item.type === 'list') return item.value;
            return '';
          })
          .filter(Boolean);
        if (certItems.length > 0) {
          extraSections.push({ title: "Certifications", items: certItems });
        }

      } else {
        // All other sections (languages, interests, publications, extra_*, etc.) → extraSections
        const sectionItems = items
          .map((item: any) => item.value || item.content || item.title || item.name || "")
          .filter(Boolean);
        if (sectionItems.length > 0) {
          extraSections.push({ title: section.label, items: sectionItems });
        }
      }
    }

  } else {
    // ── V1 Format ──
    work = (resume.experience || []).map(exp => ({
      company: exp.company || "",
      position: exp.role || "",
      startDate: (exp.dates || "").split(/[-–—]/)[0]?.trim() || "",
      endDate: (exp.dates || "").split(/[-–—]/)[1]?.trim() || "Present",
      highlights: exp.bullets || [],
    }));

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

    skills = (resume.skills || []).map(s => ({
      name: s.name || "Skills",
      keywords: s.items || [],
    }));

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
        sourceUrl: proj.github || "",
      };
    });

    const rawAchievements = Array.isArray(dynamicResume.achievements) ? dynamicResume.achievements : [];
    awards = rawAchievements
      .map((item: any): ResumeAward | null => {
        if (typeof item === "string") {
          const text = item.trim();
          return text ? { title: text, date: "", awarder: "", summary: "" } : null;
        }
        if (item && typeof item === "object") {
          const title = (item.name || item.title || "").toString().trim();
          return title ? {
            title,
            date: (item.date || "").toString(),
            awarder: (item.issuer || item.awarder || "").toString(),
            summary: (item.summary || item.description || "").toString(),
          } : null;
        }
        return null;
      })
      .filter((item): item is ResumeAward => item !== null);

    const rawVolunteer = Array.isArray(dynamicResume.volunteer) ? dynamicResume.volunteer : [];
    volunteer = rawVolunteer
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

    const rawCoursework = Array.isArray(dynamicResume.coursework) ? dynamicResume.coursework : [];
    courseworkList = rawCoursework
      .map((c: any) => (typeof c === "string" ? c.trim() : (c?.name || "").toString().trim()))
      .filter(Boolean);

    const rawCertifications = Array.isArray(dynamicResume.certifications) ? dynamicResume.certifications : [];
    if (rawCertifications.length > 0) {
      extraSections.push({
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
      });
    }

    const rawExtraSections = Array.isArray(dynamicResume.extraSections) ? dynamicResume.extraSections : [];
    extraSections = [
      ...extraSections,
      ...rawExtraSections
        .filter((s: any) => s && s.title && Array.isArray(s.items) && s.items.length > 0)
        .map((s: any) => ({ title: s.title, items: s.items.filter(Boolean) })),
    ];
  }

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

