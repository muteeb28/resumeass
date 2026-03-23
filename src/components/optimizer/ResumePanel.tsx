"use client";

import { useMemo } from "react";
import type { ResumeJSON } from "@/types/resume";
import { convertToPortfoliolyFormat } from "@/utils/resume-converter";
import { migrateOldToNew } from "@/types/resume";
import TemplateATS from "@/templates/TemplateATS";
import TemplateTwoColumn from "@/templates/TemplateTwoColumn";
import TemplateSidebar from "@/templates/TemplateSidebar";
import TemplateDarkSidebar from "@/templates/TemplateDarkSidebar";

export type TemplateId = "ats" | "two-column" | "sidebar" | "dark-sidebar";

const TEMPLATES: { id: TemplateId; label: string }[] = [
  { id: "ats", label: "ATS CV" },
  { id: "two-column", label: "Two Column" },
  { id: "sidebar", label: "Sidebar" },
  { id: "dark-sidebar", label: "Dark Sidebar" },
];

interface Props {
  resume: ResumeJSON;
  selectedTemplate: TemplateId;
  atsScore: number;
  onSetTemplate: (t: TemplateId) => void;
}

export default function ResumePanel({ resume, selectedTemplate, atsScore, onSetTemplate }: Props) {
  const resumeData = useMemo(() => {
    try {
      return convertToPortfoliolyFormat(migrateOldToNew(resume));
    } catch {
      return null;
    }
  }, [resume]);

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Template picker */}
      <div className="flex-none border-b border-border px-4 py-2.5 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium mr-1">Template:</span>
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSetTemplate(t.id)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              selectedTemplate === t.id
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground border border-border hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
        {atsScore > 0 && (
          <div className="ml-auto">
            <AtsScorePill score={atsScore} />
          </div>
        )}
      </div>

      {/* Resume preview */}
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        <div
          className="bg-white shadow-md"
          style={{
            width: "210mm",
            minHeight: "297mm",
            transformOrigin: "top center",
            transform: "scale(0.72)",
            marginBottom: "-28%",
          }}
        >
          {selectedTemplate === "ats" && <TemplateATS resume={resume} />}
          {selectedTemplate === "two-column" && resumeData && <TemplateTwoColumn data={resumeData} />}
          {selectedTemplate === "sidebar" && resumeData && <TemplateSidebar data={resumeData} />}
          {selectedTemplate === "dark-sidebar" && resumeData && <TemplateDarkSidebar data={resumeData} />}
        </div>
      </div>
    </div>
  );
}

function AtsScorePill({ score }: { score: number }) {
  const color =
    score >= 75
      ? "bg-green-100 text-green-700 border-green-200"
      : score >= 50
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-red-100 text-red-700 border-red-200";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      ATS {score}%
    </span>
  );
}
