import { CONTENT_LIMITS, PLACEHOLDERS } from './resumeConfig';
import type { RenderMode } from './resumeConfig';

export type ResumeStyle = 'senior-modern' | 'concise-classic' | 'modern-executive' | 'minimalist-ats' | 'dynamic-ats' | 'default';

export interface ResumeContact {
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  links?: string[];
}

export interface ResumeExperience {
  title?: string;
  company?: string;
  dates?: string;
  duration?: string;
  location?: string;
  description?: string[] | string;
}

export interface ResumeEducation {
  institution?: string;
  university?: string;
  degree?: string;
  year?: string;
  dates?: string;
  location?: string;
  gpa?: string;
}

export interface ResumeProject {
  name?: string;
  description?: string;
  technologies?: string[] | string;
}

export interface NormalizedResume {
  name: string;
  contact: ResumeContact;
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: Array<string | { name?: string; title?: string; date?: string }>;
  style: ResumeStyle;
  templateName?: string;
}

export interface RenderState {
  isMultiPage: boolean;
  mode: RenderMode;
  showFullContent: boolean;
  pageCount: number;
  pageIndex?: number;
}

const dedupeList = (items: string[]) => {
  const seen = new Set<string>();
  const deduped: string[] = [];
  items.forEach((item) => {
    const trimmed = item.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(trimmed);
  });
  return deduped;
};

const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return dedupeList(value.map((item: any) => String(item).trim()).filter(Boolean));
  }
  if (typeof value === 'string') {
    return dedupeList(
      value
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean)
    );
  }
  if (value && typeof value === 'object') {
    const nestedValues = Object.values(value as Record<string, unknown>);
    return dedupeList(nestedValues.flatMap((item) => toStringList(item)));
  }
  return [];
};

const hasMeaningfulText = (value: string) => /[\p{L}\p{N}]/u.test(value);

const toLinkList = (links: unknown): string[] => {
  if (!Array.isArray(links)) return [];
  return links
    .map((link: any) => {
      if (typeof link === 'string') return link;
      if (link && typeof link === 'object') {
        const linkObj = link as { url?: unknown; href?: unknown; link?: unknown; label?: unknown; type?: unknown };
        const label = typeof linkObj.label === 'string'
          ? linkObj.label
          : typeof linkObj.type === 'string'
            ? linkObj.type
            : '';
        const url = linkObj.url || linkObj.href || linkObj.link;
        if (typeof url === 'string' && label) {
          return `${label}: ${url}`;
        }
        if (typeof url === 'string') {
          return url;
        }
        return label;
      }
      return '';
    })
    .filter((link): link is string => Boolean(link));
};

const toCleanBulletList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item: any) => (typeof item === 'string' || typeof item === 'number' ? String(item).trim() : ''))
      .filter((item) => hasMeaningfulText(item));
  }
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => hasMeaningfulText(item));
  }
  return [];
};

const normalizeExperience = (entries: unknown): ResumeExperience[] => {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry: any) => {
      const rawDescription = entry.description ?? entry.points ?? entry.bullets ?? entry.responsibilities ?? [];
      const description = toCleanBulletList(rawDescription);
      return {
        title: entry.title || entry.position || entry.role,
        company: entry.company || entry.employer || entry.organization,
        dates: entry.dates || entry.date || entry.duration,
        duration: entry.duration,
        location: entry.location,
        description
      };
    })
    .filter((entry) => {
      const description = Array.isArray(entry.description) ? entry.description : [];
      return Boolean(
        entry.title ||
        entry.company ||
        entry.dates ||
        entry.duration ||
        entry.location ||
        description.length > 0
      );
    });
};

const normalizeEducation = (entries: unknown): ResumeEducation[] => {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry: any) => ({
      institution: entry.institution || entry.university || entry.school,
      university: entry.university,
      degree: entry.degree || entry.program,
      year: entry.year || entry.dates || entry.graduation,
      dates: entry.dates,
      location: entry.location,
      gpa: entry.gpa
    }))
    .filter((entry) => Boolean(
      entry.institution ||
      entry.university ||
      entry.degree ||
      entry.year ||
      entry.dates ||
      entry.location ||
      entry.gpa
    ));
};

const normalizeProjects = (entries: unknown): ResumeProject[] => {
  if (!entries) return [];
  const rawEntries = Array.isArray(entries) ? entries : toStringList(entries);
  const isProjectNoise = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    return /^(https?|www|link|links|url|urls|website|portfolio|github|demo|live|tech|technologies|stack|tools|skills)$/.test(trimmed);
  };
  const isUrlLike = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return /^(https?:\/\/|www\.)/i.test(trimmed) || /^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(trimmed);
  };
  const isProjectHeading = (value: string) => {
    const normalized = value
      .replace(/^[#>\-\*\+\s]+/, '')
      .replace(/[*_`]+/g, '')
      .replace(/:\s*$/, '')
      .trim()
      .toLowerCase();
    return /(project|projects|portfolio|key projects|notable projects)/.test(normalized);
  };
  const cleanValue = (value: string) => value.replace(/^[\s\-\*\+|\u2022]+/, '').trim();

  return rawEntries
    .map((entry: any): ResumeProject | null => {
      if (typeof entry === 'string') {
        const cleaned = cleanValue(entry);
        if (!cleaned || isProjectHeading(cleaned) || !hasMeaningfulText(cleaned)) return null;
        if (isProjectNoise(cleaned) || isUrlLike(cleaned)) return null;
        return { name: cleaned };
      }
      if (!entry || typeof entry !== 'object') return null;
      const name = typeof entry.name === 'string'
        ? entry.name
        : typeof entry.title === 'string'
          ? entry.title
          : '';
      const description = typeof entry.description === 'string'
        ? entry.description
        : typeof entry.summary === 'string'
          ? entry.summary
          : '';
      const technologies = toStringList(entry.technologies || entry.techStack || entry.stack)
        .filter((tech) => hasMeaningfulText(tech));
      const rawName = name.trim();
      const cleanName = isProjectNoise(rawName) || isUrlLike(rawName) ? '' : rawName;
      const cleanDescription = description.trim();
      const hasName = Boolean(cleanName && hasMeaningfulText(cleanName));
      const hasDescription = Boolean(cleanDescription && hasMeaningfulText(cleanDescription));
      const hasContent = hasName || hasDescription || technologies.length > 0;
      if (!hasContent) return null;
      if (name && isProjectHeading(name)) return null;
      return {
        name: hasName ? cleanName : undefined,
        description: hasDescription ? cleanDescription : undefined,
        technologies: technologies.length > 0 ? technologies : undefined
      };
    })
    .filter((entry): entry is ResumeProject => entry !== null);
};

const detectStyle = (data: any): ResumeStyle => {
  const style = data?.style || data?.templateStyle;
  if (style) return style as ResumeStyle;
  const name = String(data?.templateName || '').toLowerCase();
  if (name.includes('senior')) return 'senior-modern';
  if (name.includes('concise')) return 'concise-classic';
  return 'default';
};

export const normalizeResumeData = (data: any): NormalizedResume => {
  const content = data?.fullContent || data?.layout || data?.fullStructure || data || {};
  const contactSource = content.contact || content.personalInfo || content.contactInfo || {};
  const linkList = toLinkList(contactSource.links);
  const primarySkills = toStringList(content.skills);
  const fallbackSkills = toStringList(content.coreSkills || content.skillset || content.skillSet);
  const skills = primarySkills.length > 0 ? primarySkills : fallbackSkills;
  const summary = content.summary ||
    content.professionalSummary ||
    content.executiveSummary ||
    content.profile ||
    content.objective ||
    content.about ||
    '';
  const projectsSource = content.projects ||
    content.projectExperience ||
    content.portfolio ||
    content.projectWork ||
    content.personalProjects ||
    content.keyProjects ||
    content.notableProjects;

  return {
    name: content.name || contactSource.name || data?.name || PLACEHOLDERS.name,
    contact: {
      email: contactSource.email || content.email,
      phone: contactSource.phone || content.phone,
      location: contactSource.location || content.location,
      linkedin: contactSource.linkedin || contactSource.linkedIn || content.linkedin,
      github: contactSource.github || content.github,
      website: contactSource.website || contactSource.portfolio || content.website || content.portfolio,
      links: linkList
    },
    summary,
    skills,
    experience: normalizeExperience(content.experience),
    education: normalizeEducation(content.education),
    projects: normalizeProjects(projectsSource),
    certifications: Array.isArray(content.certifications) || typeof content.certifications === 'string'
      ? (Array.isArray(content.certifications) ? content.certifications : toStringList(content.certifications))
      : [],
    style: detectStyle(data),
    templateName: data?.templateName
  };
};

const safeNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

export const getPageCountHint = (data: any): number | null => {
  if (!data || typeof data !== 'object') return null;
  const candidates = [
    data.originalPageCount,
    data.pageCount,
    data.formatInfo?.originalPageCount,
    data.formatInfo?.estimatedPageCount,
    data.structure?.originalPageCount,
    data.structure?.estimatedPageCount,
    data.content?.originalPageCount,
    data.content?.pageCount
  ];

  for (const candidate of candidates) {
    const parsed = safeNumber(candidate);
    if (parsed && parsed > 0) {
      return Math.round(parsed);
    }
  }

  return null;
};

const countBullets = (entry: ResumeExperience) => {
  if (!entry) return 0;
  const description = entry.description || [];
  if (Array.isArray(description)) return description.filter(Boolean).length;
  if (typeof description === 'string') {
    return description.split(/\n|\u2022/).map((item) => item.trim()).filter(Boolean).length;
  }
  return 0;
};

const estimateContentWeight = (content: NormalizedResume) => {
  const summaryLength = content.summary?.length || 0;
  const summaryWeight = summaryLength ? Math.max(1, Math.ceil(summaryLength / 120)) : 0;
  const skillsWeight = content.skills.length;
  const experienceWeight = content.experience.reduce((total, exp) => total + 3 + countBullets(exp), 0);
  const educationWeight = content.education.length * 2;
  const projectsWeight = content.projects.reduce((total, project) => {
    const descriptionLength = project.description ? project.description.length : 0;
    return total + 2 + Math.min(2, Math.ceil(descriptionLength / 120));
  }, 0);
  const certificationsWeight = content.certifications.length;

  return summaryWeight + skillsWeight + experienceWeight + educationWeight + projectsWeight + certificationsWeight;
};

const estimatePageCount = (content: NormalizedResume) => {
  const totalWeight = estimateContentWeight(content);
  if (totalWeight <= 0) return 1;
  const targetWeightPerPage = 18;
  return Math.max(1, Math.ceil(totalWeight / targetWeightPerPage));
};

export const paginateResumeContent = (content: NormalizedResume, pageCount: number): NormalizedResume[] => {
  const normalizedPageCount = Math.max(1, Math.round(pageCount));
  if (normalizedPageCount <= 1) return [content];

  const createEmptyPage = (): NormalizedResume => ({
    name: content.name,
    contact: content.contact,
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    style: content.style,
    templateName: content.templateName
  });

  const pages = Array.from({ length: normalizedPageCount }, () => createEmptyPage());
  const totalWeight = estimateContentWeight(content);
  const targetWeightPerPage = Math.max(1, Math.ceil(totalWeight / normalizedPageCount));

  let pageIndex = 0;
  let remaining = targetWeightPerPage;

  const advancePage = () => {
    if (pageIndex < normalizedPageCount - 1) {
      pageIndex += 1;
      remaining = targetWeightPerPage;
    }
  };

  const placeItem = (weight: number, apply: (page: NormalizedResume) => void) => {
    const normalizedWeight = Math.max(1, weight);
    if (pageIndex < normalizedPageCount - 1 && normalizedWeight > remaining) {
      advancePage();
    }
    apply(pages[pageIndex]);
    remaining = Math.max(0, remaining - normalizedWeight);
  };

  if (content.summary) {
    const summaryWeight = Math.max(1, Math.ceil(content.summary.length / 120));
    pages[0].summary = content.summary;
    remaining = Math.max(0, remaining - summaryWeight);
  }

  content.skills.forEach((skill) => {
    placeItem(1, (page) => page.skills.push(skill));
  });

  content.experience.forEach((exp) => {
    const weight = 3 + countBullets(exp);
    placeItem(weight, (page) => page.experience.push(exp));
  });

  content.education.forEach((edu) => {
    placeItem(2, (page) => page.education.push(edu));
  });

  content.projects.forEach((project) => {
    const descriptionLength = project.description ? project.description.length : 0;
    const weight = 2 + Math.min(2, Math.ceil(descriptionLength / 120));
    placeItem(weight, (page) => page.projects.push(project));
  });

  content.certifications.forEach((cert) => {
    placeItem(1, (page) => page.certifications.push(cert));
  });

  return pages;
};

export const deriveRenderState = (
  content?: NormalizedResume,
  modeOverride: RenderMode | 'auto' = 'auto',
  pageCountHint?: number | null
): RenderState => {
  const safeContent = content ?? getFallbackResumeData();
  const forceSingle = modeOverride === 'single' || modeOverride === 'preview';
  const shouldUseMultiPage = safeContent.experience.length > 3 ||
    (safeContent.summary.length > 350 && safeContent.experience.length > 2) ||
    safeContent.skills.length > 12 ||
    safeContent.education.length > 2 ||
    safeContent.certifications.length > 4 ||
    safeContent.projects.length > 2;

  const estimatedPageCount = estimatePageCount(safeContent);
  const contentBasedPageCount = shouldUseMultiPage
    ? Math.max(2, estimatedPageCount)
    : estimatedPageCount;
  const normalizedPageCount = !forceSingle && pageCountHint && pageCountHint > 0
    ? Math.round(pageCountHint)
    : null;

  const resolvedPageCount = forceSingle
    ? 1
    : Math.max(
      normalizedPageCount || 1,
      contentBasedPageCount,
      modeOverride === 'multi' ? 2 : 1
    );

  const isMultiPage = modeOverride === 'multi'
    ? true
    : forceSingle
      ? false
      : resolvedPageCount > 1;

  let mode: RenderMode = modeOverride === 'auto'
    ? (isMultiPage ? 'multi' : 'single')
    : modeOverride;
  const showFullContent = mode !== 'preview';
  const pageCount = forceSingle ? 1 : resolvedPageCount;

  if (modeOverride !== 'auto') {
    mode = modeOverride;
  }

  return { isMultiPage, mode, showFullContent, pageCount };
};

const clampText = (value: string, max?: number) => {
  if (!max || value.length <= max) return value;
  return `${value.substring(0, max)}...`;
};

const limitArray = <T,>(items: T[], max?: number) => {
  if (!max) return items;
  return items.slice(0, max);
};

export const applyContentLimits = (content: NormalizedResume, mode: RenderMode): NormalizedResume => {
  const limits = CONTENT_LIMITS[mode];
  const limitedExperience = limitArray(content.experience, limits.experience).map((exp) => ({
    ...exp,
    description: normalizeDescription(exp.description, limits.bullets)
  }));

  return {
    ...content,
    summary: clampText(content.summary, limits.summaryChars),
    skills: limitArray(content.skills, limits.skills),
    experience: limitedExperience,
    education: limitArray(content.education, limits.education),
    projects: limitArray(content.projects, limits.projects),
    certifications: limitArray(content.certifications, limits.certifications)
  };
};

export const normalizeDescription = (description: ResumeExperience['description'], max?: number) => {
  const points = toCleanBulletList(description);
  return max ? points.slice(0, max) : points;
};

export const getFallbackResumeData = (): NormalizedResume => ({
  name: PLACEHOLDERS.name,
  contact: {
    email: '',
    phone: '',
    location: ''
  },
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  style: 'default',
  templateName: ''
});
