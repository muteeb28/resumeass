import type { ResumeData } from "@/types/portfolioly-resume";

export interface SectionConfig {
  id: string;
  getValue: (data: ResumeData) => any;
  applyChange: (data: ResumeData, value: any) => ResumeData;
}

export const sectionConfigs: SectionConfig[] = [
  {
    id: "basics",
    getValue: (d) => d.basics,
    applyChange: (d, v) => ({ ...d, basics: { ...v, profiles: d.basics.profiles, photo: d.basics.photo } }),
  },
  {
    id: "photo",
    getValue: (d) => d.basics?.photo ?? null,
    applyChange: (d, v) => ({ ...d, basics: { ...d.basics, photo: v || undefined } }),
  },
  {
    id: "profiles",
    getValue: (d) => d.basics?.profiles ?? [],
    applyChange: (d, v) => ({ ...d, basics: { ...d.basics, profiles: v } }),
  },
  {
    id: "work",
    getValue: (d) => d.work ?? [],
    applyChange: (d, v) => ({ ...d, work: v }),
  },
  {
    id: "skills",
    getValue: (d) => d.skills ?? [],
    applyChange: (d, v) => ({ ...d, skills: v }),
  },
  {
    id: "projects",
    getValue: (d) => d.projects ?? [],
    applyChange: (d, v) => ({ ...d, projects: v }),
  },
  {
    id: "education",
    getValue: (d) => d.education ?? [],
    applyChange: (d, v) => ({ ...d, education: v }),
  },
  {
    id: "awards",
    getValue: (d) => d.awards ?? [],
    applyChange: (d, v) => ({ ...d, awards: v }),
  },
];
