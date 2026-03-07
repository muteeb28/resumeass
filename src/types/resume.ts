export type ResumeBasics = {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  links?: string[];
  summary?: string;
  photo?: string; // URL or base64 image
};

export type ResumeSkillCategory = {
  name: string;
  items: string[];
};

export type ResumeExperience = {
  company: string;
  role: string;
  dates?: string;
  location?: string;
  bullets: string[];
  tech?: string[];
};

export type ResumeProject = {
  name: string;
  description?: string;
  bullets?: string[];
  tech?: string[];
  link?: string;
  github?: string;
};

export type ResumeEducation = {
  school: string;
  degree?: string;
  dates?: string;
  location?: string;
  details?: string[];
};

export type ResumeCertification = {
  name: string;
  issuer?: string;
  date?: string;
};

export type ResumeJSON = {
  basics: ResumeBasics;
  summaryRawText?: string;
  skills: ResumeSkillCategory[];
  skillsRawText?: string;
  experience: ResumeExperience[];
  experienceRawText?: string;
  projects?: ResumeProject[];
  projectsRawText?: string;
  education?: ResumeEducation[];
  educationRawText?: string;
  certifications?: ResumeCertification[];
  certificationsRawText?: string;
};

export type ResumeChange = {
  section: string;
  before: string;
  after: string;
  reason: string;
};

export type ResumeReport = {
  matchEstimate: number;
  keywordsAdded: string[];
  keywordsMissing: string[];
  changes: ResumeChange[];
  flags?: string[];
};

export type ResumeGenerationResult = {
  resume: ResumeJSON;
  report: ResumeReport;
  meta?: {
    source?: string;
    reason?: string;
    [key: string]: any;
  };
};

export type ResumeValidationResult = {
  valid: boolean;
  errors: string[];
  warnings?: string[];
};

// ============================================================================
// NEW ARCHITECTURE: Data-driven sections (v2)
// ============================================================================

/**
 * ARCHITECTURE RULES:
 *
 * 1. SECTION NAMES are infinite and require zero code changes
 *    - "experience", "community", "awards", "custom_field_123" all work
 *    - Parser can extract any section name
 *    - Templates render any section name
 *
 * 2. LAYOUT TYPES are finite and require renderer code
 *    - Adding 'timeline' renderer = one-time implementation
 *    - Adding "community" section = zero implementation (uses existing 'timeline' layout)
 *    - New layouts are rare (maybe 1-2 per year)
 *    - New sections are frequent (every user resume is different)
 *
 * 3. If parser encounters unknown structure:
 *    - Falls back to layout: 'text', rawText: <content>
 *    - User sees data (not silent loss)
 *    - Can manually edit or fix parser later
 */

// Layout types (finite - require renderer implementations)
export type LayoutType =
  | 'timeline'       // Experience, Community (role + org + bullets)
  | 'list'           // Skills (flat items with optional category)
  | 'education'      // Special timeline: school + degree + dates
  | 'projects'       // Special timeline: name + description + tech + bullets
  | 'certifications' // Name + issuer + date
  | 'text';          // Raw text fallback

// Type-safe section items (discriminated unions)
export type SectionItem =
  | TimelineItem
  | ListItem
  | EducationItem
  | ProjectItem
  | CertificationItem
  | TextItem;

export interface TimelineItem {
  type: 'timeline';
  title: string;
  organization: string;
  location?: string;
  dates?: string;
  bullets?: string[];
  description?: string;
}

export interface ListItem {
  type: 'list';
  value: string;
  category?: string;
}

export interface EducationItem {
  type: 'education';
  school: string;
  degree?: string;
  dates?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  gpa?: string;
  details?: string[];
  highlights?: string[];
}

export interface ProjectItem {
  type: 'project';
  name: string;
  description?: string;
  tech?: string[];
  bullets?: string[];
  highlights?: string[];
  link?: string;
  github?: string;
  startDate?: string;
  endDate?: string;
  role?: string;
}

export interface CertificationItem {
  type: 'certification';
  name: string;
  issuer?: string;
  date?: string;
}

export interface TextItem {
  type: 'text';
  content: string;
}

// Resume section with flexible layout
export interface ResumeSection {
  id: string;           // Section identifier (can be any string)
  label: string;        // Display name
  layout: LayoutType;   // How to render it
  order: number;        // Display order (0-100)
  visible: boolean;     // Show/hide toggle
  rawText?: string;     // Fallback if parsing failed
  items: SectionItem[]; // Structured data
}

// New resume JSON structure (v2)
export interface ResumeJSONv2 {
  version: 2;
  basics: ResumeBasics;
  sections: Record<string, ResumeSection>;
}

// Union type for backward compatibility
export type AnyResumeJSON = ResumeJSON | ResumeJSONv2;

export const normalizeResumeJson = (input: ResumeJSON): ResumeJSON => ({
  basics: {
    name: input.basics?.name || "",
    title: input.basics?.title || "",
    email: input.basics?.email || "",
    phone: input.basics?.phone || "",
    location: input.basics?.location || "",
    links: Array.isArray(input.basics?.links) ? input.basics.links : [],
    summary: input.basics?.summary || "",
  },
  skills: Array.isArray(input.skills) ? input.skills : [],
  skillsRawText: input.skillsRawText || "",
  experience: Array.isArray(input.experience) ? input.experience : [],
  experienceRawText: input.experienceRawText || "",
  projects: Array.isArray(input.projects) ? input.projects : [],
  projectsRawText: input.projectsRawText || "",
  education: Array.isArray(input.education) ? input.education : [],
  educationRawText: input.educationRawText || "",
  certifications: Array.isArray(input.certifications) ? input.certifications : [],
  certificationsRawText: input.certificationsRawText || "",
});

export const validateResumeJson = (input: ResumeJSON): ResumeValidationResult => {
  const errors: string[] = [];

  if (!input || typeof input !== "object") {
    return { valid: false, errors: ["Resume payload is missing."] };
  }

  if (!input.basics || typeof input.basics !== "object") {
    errors.push("Basics section is required.");
  } else if (!input.basics.name || typeof input.basics.name !== "string") {
    errors.push("Basics name is required.");
  }

  if (!Array.isArray(input.skills)) {
    errors.push("Skills must be an array.");
  }

  if (!Array.isArray(input.experience)) {
    errors.push("Experience must be an array.");
  }
  return { valid: errors.length === 0, errors };
};

// ============================================================================
// VALIDATION: V2 FORMAT
// ============================================================================

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  severity: ValidationSeverity;
  path: string;
  message: string;
}

export interface ResumeValidationResultV2 {
  valid: boolean;
  issues: ValidationIssue[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isTimelineItem = (item: SectionItem): item is TimelineItem =>
  item.type === 'timeline';

export const isListItem = (item: SectionItem): item is ListItem =>
  item.type === 'list';

export const isEducationItem = (item: SectionItem): item is EducationItem =>
  item.type === 'education';

export const isProjectItem = (item: SectionItem): item is ProjectItem =>
  item.type === 'project';

export const isCertificationItem = (item: SectionItem): item is CertificationItem =>
  item.type === 'certification';

export const isTextItem = (item: SectionItem): item is TextItem =>
  item.type === 'text';

export const isResumeJSONv2 = (resume: AnyResumeJSON): resume is ResumeJSONv2 =>
  'version' in resume && resume.version === 2;

export const isResumeJSONv1 = (resume: AnyResumeJSON): resume is ResumeJSON =>
  !('version' in resume) || (resume as any).version !== 2;

// ============================================================================
// SECTION HELPERS
// ============================================================================

// Default section order mapping
export const DEFAULT_SECTION_ORDER: Record<string, number> = {
  summary: 0,
  experience: 10,
  education: 20,
  skills: 30,
  projects: 40,
  certifications: 50,
  achievements: 60,
  coursework: 65,
  community: 70,
  awards: 75,
  volunteer: 78,
};

// Default layout mapping for common sections
export const DEFAULT_SECTION_LAYOUT: Record<string, LayoutType> = {
  summary: 'text',
  experience: 'timeline',
  education: 'education',
  skills: 'list',
  projects: 'projects',
  certifications: 'certifications',
  achievements: 'list',
  coursework: 'list',
  community: 'timeline',
  awards: 'list',
  volunteer: 'timeline',
};

// Get sorted sections array from v2 resume
export const getSortedSections = (resume: ResumeJSONv2): ResumeSection[] => {
  return Object.values(resume.sections)
    .filter(section => section.visible)
    .sort((a, b) => a.order - b.order);
};

// Create a new empty section
export const createSection = (
  id: string,
  label: string,
  layout?: LayoutType
): ResumeSection => ({
  id,
  label,
  layout: layout ?? DEFAULT_SECTION_LAYOUT[id] ?? 'text',
  order: DEFAULT_SECTION_ORDER[id] ?? 100,
  visible: true,
  items: [],
});

// ============================================================================
// MIGRATION: V1 -> V2
// ============================================================================

const DEFAULT_SECTION_LABELS: Record<string, string> = {
  summary: 'Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  achievements: 'Achievements',
  coursework: 'Relevant Coursework',
  community: 'Community & Activities',
  awards: 'Awards & Honors',
};

/**
 * Migrate a v1 ResumeJSON to v2 ResumeJSONv2 format
 */
export const migrateOldToNew = (v1: ResumeJSON): ResumeJSONv2 => {
  const sections: Record<string, ResumeSection> = {};

  // Helper to create a section with items
  const addSection = (
    id: string,
    items: SectionItem[],
    rawText?: string
  ): void => {
    const hasItems = items.length > 0;
    const hasRawText = rawText && rawText.trim().length > 0;

    if (!hasItems && !hasRawText) return;

    sections[id] = {
      id,
      label: DEFAULT_SECTION_LABELS[id] || id.charAt(0).toUpperCase() + id.slice(1),
      layout: DEFAULT_SECTION_LAYOUT[id] || 'text',
      order: DEFAULT_SECTION_ORDER[id] ?? 100,
      visible: true,
      rawText: hasRawText ? rawText : undefined,
      items,
    };
  };

  // Summary section (text layout)
  if (v1.basics?.summary || v1.summaryRawText) {
    const items: TextItem[] = v1.basics?.summary
      ? [{ type: 'text', content: v1.basics.summary }]
      : [];
    addSection('summary', items, v1.summaryRawText);
  }

  // Experience section (timeline layout)
  const experienceItems: TimelineItem[] = (v1.experience || []).map(exp => ({
    type: 'timeline' as const,
    title: exp.role || '',
    organization: exp.company || '',
    location: exp.location,
    dates: exp.dates,
    bullets: exp.bullets || [],
  }));
  addSection('experience', experienceItems, v1.experienceRawText);

  // Education section (education layout)
  const educationItems: EducationItem[] = (v1.education || []).map(edu => ({
    type: 'education' as const,
    school: edu.school || '',
    degree: edu.degree,
    dates: edu.dates,
    location: edu.location,
    details: edu.details,
    highlights: (edu as any).highlights,
    startDate: (edu as any).startDate,
    endDate: (edu as any).endDate,
  }));
  addSection('education', educationItems, v1.educationRawText);

  // Skills section (list layout with categories)
  const skillItems: ListItem[] = (v1.skills || []).flatMap(category =>
    (category.items || []).map(skill => ({
      type: 'list' as const,
      value: skill,
      category: category.name,
    }))
  );
  addSection('skills', skillItems, v1.skillsRawText);

  // Projects section (projects layout)
  const projectItems: ProjectItem[] = (v1.projects || []).map(proj => ({
    type: 'project' as const,
    name: proj.name || '',
    description: proj.description,
    tech: proj.tech,
    bullets: proj.bullets,
    highlights: (proj as any).highlights,
    link: proj.link,
    github: proj.github,
    startDate: (proj as any).startDate,
    endDate: (proj as any).endDate,
    role: (proj as any).role,
  }));
  addSection('projects', projectItems, v1.projectsRawText);

  // Certifications section (certifications layout)
  const certItems: CertificationItem[] = (v1.certifications || []).map(cert => ({
    type: 'certification' as const,
    name: cert.name || '',
    issuer: cert.issuer,
    date: cert.date,
  }));
  addSection('certifications', certItems, v1.certificationsRawText);

  // Community section (timeline layout) - from extended v1 format
  const communityData = (v1 as any).community;
  if (Array.isArray(communityData) && communityData.length > 0) {
    const communityItems: TimelineItem[] = communityData.map((item: any) => ({
      type: 'timeline' as const,
      title: item.role || '',
      organization: item.organization || '',
      description: item.description,
      bullets: item.bullets,
    }));
    addSection('community', communityItems);
  }

  // CAPTURE ALL OTHER DYNAMIC SECTIONS
  // This ensure we don't drop fields like "volunteer", "awards", "languages", etc.
  const KNOWN_KEYS = new Set([
    'basics', 'summaryRawText', 'skills', 'skillsRawText',
    'experience', 'experienceRawText', 'projects', 'projectsRawText',
    'education', 'educationRawText', 'certifications', 'certificationsRawText',
    'community', 'communityRawText'
  ]);

  Object.keys(v1).forEach(key => {
    if (KNOWN_KEYS.has(key)) return;

    const val = (v1 as any)[key];
    console.log(`migrateOldToNew inspecting key: ${key}, isArray: ${Array.isArray(val)}, len: ${val?.length}`);

    // If it's an array of objects, try to infer structure
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object') {
      // Heuristic: Does it look like a timeline? (has role/title/company/org)
      const isTimeline = val.some(item => item.role || item.title || item.company || item.organization);

      if (isTimeline) {
        const items: TimelineItem[] = val.map((item: any) => ({
          type: 'timeline' as const,
          title: item.role || item.title || '',
          organization: item.company || item.organization || item.issuer || '', // fallback for awards
          dates: item.dates || item.date || '',
          location: item.location || '',
          bullets: Array.isArray(item.bullets) ? item.bullets : (item.description ? [item.description] : [])
        }));
        addSection(key, items);
      } else {
        // Heuristic: Does it look like a simpl list?
        const items: ListItem[] = val.map((item: any) => ({
          type: 'list' as const,
          value: item.name || item.value || JSON.stringify(item),
          category: item.category
        }));
        addSection(key, items);
      }
    }
  });

  // USER-REQUEST-DEBUG: What sections did we actually capture?
  console.log("migrateOldToNew OUTPUT Sections:", Object.keys(sections));

  return {
    version: 2,
    basics: {
      name: v1.basics?.name || '',
      title: v1.basics?.title,
      email: v1.basics?.email,
      phone: v1.basics?.phone,
      location: v1.basics?.location,
      links: v1.basics?.links,
      summary: v1.basics?.summary,
    },
    sections,
  };
};

/**
 * Migrate v2 back to v1 format (for backwards compatibility)
 */
export const migrateNewToOld = (v2: ResumeJSONv2): ResumeJSON => {
  const result: ResumeJSON = {
    basics: { ...v2.basics },
    skills: [],
    experience: [],
  };

  // Extract summary
  const summarySection = v2.sections.summary;
  if (summarySection) {
    const textItems = summarySection.items.filter(isTextItem);
    if (textItems.length > 0) {
      result.basics.summary = textItems.map(t => t.content).join('\n');
    }
    if (summarySection.rawText) {
      result.summaryRawText = summarySection.rawText;
    }
  }

  // Extract experience
  const expSection = v2.sections.experience;
  if (expSection) {
    const timelineItems = expSection.items.filter(isTimelineItem);
    result.experience = timelineItems.map(item => ({
      company: item.organization,
      role: item.title,
      dates: item.dates,
      location: item.location,
      bullets: item.bullets || [],
    }));
    if (expSection.rawText) {
      result.experienceRawText = expSection.rawText;
    }
  }

  // Extract education
  const eduSection = v2.sections.education;
  if (eduSection) {
    const eduItems = eduSection.items.filter(isEducationItem);
    result.education = eduItems.map(item => ({
      school: item.school,
      degree: item.degree,
      dates: item.dates,
      location: item.location,
      details: item.details,
      ...(item.highlights ? { highlights: item.highlights } : {}),
      ...(item.startDate ? { startDate: item.startDate } : {}),
      ...(item.endDate ? { endDate: item.endDate } : {}),
    } as any));
    if (eduSection.rawText) {
      result.educationRawText = eduSection.rawText;
    }
  }

  // Extract skills (group by category)
  const skillsSection = v2.sections.skills;
  if (skillsSection) {
    const listItems = skillsSection.items.filter(isListItem);
    const grouped: Record<string, string[]> = {};

    listItems.forEach(item => {
      const category = item.category || 'Skills';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item.value);
    });

    result.skills = Object.entries(grouped).map(([name, items]) => ({
      name,
      items,
    }));

    if (skillsSection.rawText) {
      result.skillsRawText = skillsSection.rawText;
    }
  }

  // Extract projects
  const projSection = v2.sections.projects;
  if (projSection) {
    const projItems = projSection.items.filter(isProjectItem);
    result.projects = projItems.map(item => ({
      name: item.name,
      description: item.description,
      tech: item.tech,
      bullets: item.bullets,
      link: item.link,
      ...(item.highlights ? { highlights: item.highlights } : {}),
      ...(item.startDate ? { startDate: item.startDate } : {}),
      ...(item.endDate ? { endDate: item.endDate } : {}),
      ...(item.role ? { role: item.role } : {}),
    } as any));
    if (projSection.rawText) {
      result.projectsRawText = projSection.rawText;
    }
  }

  // Extract certifications
  const certSection = v2.sections.certifications;
  if (certSection) {
    const certItems = certSection.items.filter(isCertificationItem);
    result.certifications = certItems.map(item => ({
      name: item.name,
      issuer: item.issuer,
      date: item.date,
    }));
    if (certSection.rawText) {
      result.certificationsRawText = certSection.rawText;
    }
  }

  return result;
};

/**
 * Ensure resume is in v2 format (migrate if needed)
 */
export const ensureV2Format = (resume: AnyResumeJSON): ResumeJSONv2 => {
  if (isResumeJSONv2(resume)) {
    return resume;
  }
  return migrateOldToNew(resume);
};

/**
 * Ensure resume is in v1 format (migrate if needed)
 */
export const ensureV1Format = (resume: AnyResumeJSON): ResumeJSON => {
  if (isResumeJSONv1(resume)) {
    return resume;
  }
  return migrateNewToOld(resume);
};

/**
 * NUCLEAR FIX: Direct Parser -> V2 Transformation
 * Bypasses V1 schema entirely. Captures ALL keys.
 */
export const parserToV2 = (parsed: any): ResumeJSONv2 => {
  const sections: Record<string, ResumeSection> = {};
  const KNOWN_IGNORED = new Set(['basics', 'allSections', 'integrity', 'status', 'resumeJson', 'structure', 'originalText', 'formatInfo', 'confidence', 'personalInfo', '_parser', 'rawText', 'extraSections']);

  // 1. BASICS
  const basics: ResumeBasics = {
    name: parsed.basics?.name || parsed.personalInfo?.name || '',
    email: parsed.basics?.email || parsed.personalInfo?.email,
    phone: parsed.basics?.phone || parsed.personalInfo?.phone,
    location: parsed.basics?.location || parsed.personalInfo?.location,
    links: parsed.basics?.links || parsed.personalInfo?.links,
    summary: parsed.basics?.summary || parsed.summary || parsed.objective || '',
    title: parsed.basics?.title || parsed.personalInfo?.title || ''
  };

  // 2. DYNAMIC SECTIONS LOOP
  Object.keys(parsed).forEach(key => {
    if (KNOWN_IGNORED.has(key)) return;

    const val = parsed[key];

    // Skip empty or non-array/non-string
    if (!val) return;
    if (Array.isArray(val) && val.length === 0) return;

    // Determine Layout
    let layout: LayoutType = 'text';
    let items: SectionItem[] = [];

    // Case A: Array of Objects
    if (Array.isArray(val) && typeof val[0] === 'object') {
      // Heuristic: Timeline (Title/Role + Org/Company)
      const isTimeline = val.some((item: any) => item.role || item.title || item.company || item.organization || item.school || item.institution);
      // Heuristic: Project
      const isProject = val.some((item: any) => item.tech || item.technologies || item.link || item.url);
      // Heuristic: List (Skills)
      const isList = val.some((item: any) => item.name && Array.isArray(item.items));

      if (key === 'education') {
        layout = 'education';
        items = val.map((item: any) => ({
          type: 'education',
          school: item.school || item.institution || item.university || item.organization || '',
          degree: item.degree || item.title || '',
          dates: item.dates || item.year || item.date || '',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          location: item.location || '',
          details: item.details || [],
          highlights: item.highlights || [],
        }));
      } else if (key === 'skills' || isList) {
        layout = 'list';
        // Flatten categories if needed, or map flat strings
        items = val.flatMap((cat: any) => {
          if (cat.items && Array.isArray(cat.items)) {
            // Category structure
            return cat.items.map((s: string) => ({ type: 'list', value: s, category: cat.name }));
          }
          // Flat object
          return { type: 'list', value: cat.name || cat.value || JSON.stringify(cat) };
        });
      } else if (key === 'experience' || key === 'volunteer' || key === 'community') {
        // Known timeline keys — always timeline regardless of field heuristics
        layout = 'timeline';
        items = val.map((item: any) => ({
          type: 'timeline',
          title: item.title || item.role || item.position || '',
          organization: item.company || item.organization || item.employer || '',
          dates: item.dates || item.date || item.year || '',
          location: item.location || '',
          bullets: item.bullets || (item.description ? [item.description] : [])
        }));
      } else if (isProject) {
        layout = 'projects';
        items = val.map((item: any) => ({
          type: 'project',
          name: item.name || item.title || '',
          description: item.description || item.summary,
          tech: item.tech || item.technologies || [],
          bullets: item.bullets || [],
          highlights: item.highlights || [],
          link: item.link || item.url,
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          role: item.role || '',
        }));
      } else if (isTimeline) {
        layout = 'timeline';
        items = val.map((item: any) => ({
          type: 'timeline',
          title: item.title || item.role || item.position || '',
          organization: item.company || item.organization || item.employer || '',
          dates: item.dates || item.date || item.year || '',
          location: item.location || '',
          bullets: item.bullets || (item.description ? [item.description] : [])
        }));
      } else {
        // Default to generic list if object has 'name'
        if (val[0].name) {
          layout = 'list';
          items = val.map((item: any) => ({ type: 'list', value: item.name }));
        }
      }
    }
    // Case B: Array of Strings
    else if (Array.isArray(val) && typeof val[0] === 'string') {
      layout = 'list';
      items = val.map(s => ({ type: 'list', value: s }));
    }
    // Case D: Fallback Raw Text
    let rawText: string | undefined = undefined;
    if (typeof val === 'string') {
      rawText = val;
    } else if (Array.isArray(val) && typeof val[0] === 'string') {
      rawText = val.join('\n');
    } else {
      // For complex objects that failed heuristics, stringify as a last resort
      try {
        rawText = JSON.stringify(val, null, 2);
      } catch (e) {
        rawText = String(val);
      }
    }

    // 3. CREATE SECTION
    if (items.length > 0 || (rawText && rawText.length > 0)) {
      sections[key] = {
        id: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        layout,
        order: DEFAULT_SECTION_ORDER[key] ?? 100,
        visible: true,
        items,
        rawText
      };
    }
  });

  // Expand extraSections: each entry becomes its own V2 section
  const extraSections = (parsed as any).extraSections;
  if (Array.isArray(extraSections)) {
    extraSections.forEach((s: any, idx: number) => {
      if (!s?.title || !Array.isArray(s.items) || s.items.length === 0) return;
      const sectionId = `extra_${s.title.toLowerCase().replace(/\s+/g, '_')}_${idx}`;
      sections[sectionId] = {
        id: sectionId,
        label: s.title,
        layout: 'list',
        order: 90 + idx,
        visible: true,
        items: s.items.map((item: string) => ({ type: 'list' as const, value: item })),
      };
    });
  }

  return {
    version: 2,
    basics,
    sections
  };
}

const VALID_LAYOUTS: LayoutType[] = ['timeline', 'list', 'education', 'projects', 'certifications', 'text'];
const VALID_ITEM_TYPES = ['timeline', 'list', 'education', 'project', 'certification', 'text'];

/**
 * Validate a v2 resume structure
 */
export const validateResumeV2 = (resume: unknown): ResumeValidationResultV2 => {
  const issues: ValidationIssue[] = [];

  const addIssue = (severity: ValidationSeverity, path: string, message: string) => {
    issues.push({ severity, path, message });
  };

  // Check if resume is an object
  if (!resume || typeof resume !== 'object') {
    addIssue('error', '', 'Resume must be an object');
    return { valid: false, issues };
  }

  const r = resume as Record<string, unknown>;

  // Check version
  if (r.version !== 2) {
    addIssue('error', 'version', 'Resume version must be 2');
  }

  // Validate basics
  if (!r.basics || typeof r.basics !== 'object') {
    addIssue('error', 'basics', 'Basics section is required');
  } else {
    const basics = r.basics as Record<string, unknown>;

    if (!basics.name || typeof basics.name !== 'string') {
      addIssue('error', 'basics.name', 'Name is required and must be a string');
    } else if (basics.name.trim().length === 0) {
      addIssue('warning', 'basics.name', 'Name is empty');
    }

    if (basics.email && typeof basics.email !== 'string') {
      addIssue('error', 'basics.email', 'Email must be a string');
    } else if (basics.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basics.email as string)) {
      addIssue('warning', 'basics.email', 'Email format appears invalid');
    }

    if (basics.links && !Array.isArray(basics.links)) {
      addIssue('error', 'basics.links', 'Links must be an array');
    }
  }

  // Validate sections
  if (!r.sections || typeof r.sections !== 'object') {
    addIssue('error', 'sections', 'Sections object is required');
  } else {
    const sections = r.sections as Record<string, unknown>;

    Object.entries(sections).forEach(([sectionId, section]) => {
      const path = `sections.${sectionId}`;

      if (!section || typeof section !== 'object') {
        addIssue('error', path, 'Section must be an object');
        return;
      }

      const s = section as Record<string, unknown>;

      // Validate section structure
      if (typeof s.id !== 'string') {
        addIssue('error', `${path}.id`, 'Section id must be a string');
      } else if (s.id !== sectionId) {
        addIssue('warning', `${path}.id`, `Section id "${s.id}" does not match key "${sectionId}"`);
      }

      if (typeof s.label !== 'string') {
        addIssue('error', `${path}.label`, 'Section label must be a string');
      }

      if (!VALID_LAYOUTS.includes(s.layout as LayoutType)) {
        addIssue('error', `${path}.layout`, `Invalid layout type: ${s.layout}. Valid types: ${VALID_LAYOUTS.join(', ')}`);
      }

      if (typeof s.order !== 'number') {
        addIssue('warning', `${path}.order`, 'Section order should be a number');
      }

      if (typeof s.visible !== 'boolean') {
        addIssue('warning', `${path}.visible`, 'Section visible should be a boolean');
      }

      // Validate items array
      if (!Array.isArray(s.items)) {
        addIssue('error', `${path}.items`, 'Section items must be an array');
      } else {
        (s.items as unknown[]).forEach((item, index) => {
          const itemPath = `${path}.items[${index}]`;
          validateSectionItem(item, s.layout as LayoutType, itemPath, addIssue);
        });
      }
    });

    // Check for common sections
    if (!sections.experience) {
      addIssue('info', 'sections', 'No experience section found');
    }
    if (!sections.skills) {
      addIssue('info', 'sections', 'No skills section found');
    }
  }

  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };
};

/**
 * Validate a section item matches expected structure for its type
 */
function validateSectionItem(
  item: unknown,
  expectedLayout: LayoutType,
  path: string,
  addIssue: (severity: ValidationSeverity, path: string, message: string) => void
): void {
  if (!item || typeof item !== 'object') {
    addIssue('error', path, 'Item must be an object');
    return;
  }

  const i = item as Record<string, unknown>;

  if (!VALID_ITEM_TYPES.includes(i.type as string)) {
    addIssue('error', `${path}.type`, `Invalid item type: ${i.type}. Valid types: ${VALID_ITEM_TYPES.join(', ')}`);
    return;
  }

  // Type-specific validation
  switch (i.type) {
    case 'timeline':
      if (typeof i.title !== 'string') {
        addIssue('error', `${path}.title`, 'Timeline item title must be a string');
      }
      if (typeof i.organization !== 'string') {
        addIssue('error', `${path}.organization`, 'Timeline item organization must be a string');
      }
      if (i.bullets && !Array.isArray(i.bullets)) {
        addIssue('error', `${path}.bullets`, 'Timeline item bullets must be an array');
      }
      if (expectedLayout !== 'timeline') {
        addIssue('warning', path, `Timeline item in non-timeline section (layout: ${expectedLayout})`);
      }
      break;

    case 'list':
      if (typeof i.value !== 'string') {
        addIssue('error', `${path}.value`, 'List item value must be a string');
      }
      if (expectedLayout !== 'list') {
        addIssue('warning', path, `List item in non-list section (layout: ${expectedLayout})`);
      }
      break;

    case 'education':
      if (typeof i.school !== 'string') {
        addIssue('error', `${path}.school`, 'Education item school must be a string');
      }
      if (expectedLayout !== 'education') {
        addIssue('warning', path, `Education item in non-education section (layout: ${expectedLayout})`);
      }
      break;

    case 'project':
      if (typeof i.name !== 'string') {
        addIssue('error', `${path}.name`, 'Project item name must be a string');
      }
      if (i.tech && !Array.isArray(i.tech)) {
        addIssue('error', `${path}.tech`, 'Project item tech must be an array');
      }
      if (expectedLayout !== 'projects') {
        addIssue('warning', path, `Project item in non-projects section (layout: ${expectedLayout})`);
      }
      break;

    case 'certification':
      if (typeof i.name !== 'string') {
        addIssue('error', `${path}.name`, 'Certification item name must be a string');
      }
      if (expectedLayout !== 'certifications') {
        addIssue('warning', path, `Certification item in non-certifications section (layout: ${expectedLayout})`);
      }
      break;

    case 'text':
      if (typeof i.content !== 'string') {
        addIssue('error', `${path}.content`, 'Text item content must be a string');
      }
      if (expectedLayout !== 'text') {
        addIssue('warning', path, `Text item in non-text section (layout: ${expectedLayout})`);
      }
      break;
  }
}

/**
 * Quick check if resume is valid (no errors)
 */
export const isValidResumeV2 = (resume: unknown): resume is ResumeJSONv2 => {
  return validateResumeV2(resume).valid;
};
