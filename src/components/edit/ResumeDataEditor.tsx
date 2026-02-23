"use client";

import { useState } from "react";
import type { ResumeData } from "@/types/portfolioly-resume";
import { NavigationSidebar, navItems } from "./NavigationSidebar";
import { sectionConfigs } from "./sectionConfig";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { ProfilePhotoUpload } from "./ProfilePhotoUpload";
import { ProfilesForm } from "./ProfilesForm";
import { WorkExperienceForm } from "./WorkExperienceForm";
import { SkillsForm } from "./SkillsForm";
import { ProjectsForm } from "./ProjectsForm";
import { EducationForm } from "./EducationForm";
import { AwardsForm } from "./AwardsForm";
import { FormSection } from "./FormSection";

export interface ResumeDataEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

const formComponents: Record<string, React.ComponentType<{ value: any; onChange: (v: any) => void }>> = {
  basics: PersonalInfoForm,
  profiles: ProfilesForm,
  work: WorkExperienceForm,
  skills: SkillsForm,
  projects: ProjectsForm,
  education: EducationForm,
  awards: AwardsForm,
};

function ProfilePhotoSection({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  return (
    <FormSection title="Profile Photo">
      <ProfilePhotoUpload value={value} onChange={onChange} />
    </FormSection>
  );
}

export default function ResumeDataEditor({ data, onChange }: ResumeDataEditorProps) {
  const [activeSection, setActiveSection] = useState("basics");

  const config = sectionConfigs.find((c) => c.id === activeSection);

  const handleSectionChange = (value: any) => {
    if (!config) return;
    onChange(config.applyChange(data, value));
  };

  // Render the active section
  const renderActiveSection = () => {
    if (activeSection === "photo") {
      return (
        <ProfilePhotoSection
          value={data.basics?.photo ?? null}
          onChange={(photo) =>
            onChange({ ...data, basics: { ...data.basics, photo: photo || undefined } })
          }
        />
      );
    }

    const FormComponent = formComponents[activeSection];
    if (config && FormComponent) {
      return (
        <FormComponent
          value={config.getValue(data)}
          onChange={handleSectionChange}
        />
      );
    }

    return null;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
      {/* Sidebar - desktop */}
      <div className="hidden lg:block">
        <div className="sticky top-4">
          <NavigationSidebar
            data={data}
            activeSection={activeSection}
            onSelect={setActiveSection}
          />
        </div>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden flex flex-wrap gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
              activeSection === item.id
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Active form */}
      <div className="min-w-0">
        {renderActiveSection()}
      </div>
    </div>
  );
}
