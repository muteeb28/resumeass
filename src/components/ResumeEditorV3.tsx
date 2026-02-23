"use client";

import { useState } from "react";
import { User, Globe, Briefcase, FolderGit2, GraduationCap, Award, Code } from "lucide-react";
import { PersonalInfoForm } from "./edit/PersonalInfoForm";
import { ProfilesForm } from "./edit/ProfilesForm";
import { WorkExperienceForm } from "./edit/WorkExperienceForm";
import { ProjectsForm } from "./edit/ProjectsForm";
import { EducationForm } from "./edit/EducationForm";
import { SkillsForm } from "./edit/SkillsForm";
import { AwardsForm } from "./edit/AwardsForm";
import type { ResumeData } from "@/types/portfolioly-resume";

interface SidebarSection {
  id: string;
  label: string;
  icon: typeof User;
  component: React.ReactNode;
}

interface ResumeEditorV3Props {
  resume: ResumeData;
  onChange: (resume: ResumeData) => void;
}

export default function ResumeEditorV3({ resume, onChange }: ResumeEditorV3Props) {
  const [activeSection, setActiveSection] = useState("personal-info");

  const sections: SidebarSection[] = [
    {
      id: "personal-info",
      label: "Personal Info",
      icon: User,
      component: (
        <PersonalInfoForm
          value={resume.basics}
          onChange={(basics) => onChange({ ...resume, basics: { ...basics, profiles: resume.basics.profiles } })}
        />
      ),
    },
    {
      id: "social-links",
      label: "Social Profiles",
      icon: Globe,
      component: (
        <ProfilesForm
          value={resume.basics?.profiles || []}
          onChange={(profiles) => onChange({ ...resume, basics: { ...resume.basics, profiles } })}
        />
      ),
    },
    {
      id: "work-experience",
      label: "Work Experience",
      icon: Briefcase,
      component: (
        <WorkExperienceForm
          value={resume.work || []}
          onChange={(work) => onChange({ ...resume, work })}
        />
      ),
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderGit2,
      component: (
        <ProjectsForm
          value={resume.projects || []}
          onChange={(projects) => onChange({ ...resume, projects })}
        />
      ),
    },
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
      component: (
        <EducationForm
          value={resume.education || []}
          onChange={(education) => onChange({ ...resume, education })}
        />
      ),
    },
    {
      id: "awards",
      label: "Awards",
      icon: Award,
      component: (
        <AwardsForm
          value={resume.awards || []}
          onChange={(awards) => onChange({ ...resume, awards })}
        />
      ),
    },
    {
      id: "skills",
      label: "Skills",
      icon: Code,
      component: (
        <SkillsForm
          value={resume.skills || []}
          onChange={(skills) => onChange({ ...resume, skills })}
        />
      ),
    },
  ];

  const activeContent = sections.find((s) => s.id === activeSection)?.component;

  return (
    <div className="flex gap-6 h-full">
      <nav className="w-64 flex-shrink-0 space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-md w-full min-h-[44px]
                text-sm font-medium transition-all duration-150 ease-in-out
                ${
                  isActive
                    ? "bg-neutral-900 text-white border-l-4 border-white/20 pl-[8px]"
                    : "text-neutral-600 hover:bg-neutral-100"
                }
              `}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="flex-1 text-left">{section.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex-1 overflow-y-auto">
        {activeContent}
      </div>
    </div>
  );
}
