"use client";

import ResumePage from "@/components/resume-optimizer/ResumePage";
import { GenericSection, SectionHeader } from "@/components/resume";
import type { AnyResumeJSON, ResumeJSONv2 } from "@/types/resume";
import { ensureV2Format, getSortedSections } from "@/types/resume";

const getVal = (obj: any, ...keys: string[]) => {
  if (!obj) return "";
  for (const key of keys) {
    if (obj[key] && typeof obj[key] === "string" && obj[key].trim()) {
      return obj[key].trim();
    }
  }
  return "";
};

const buildContactLine = (basics: ResumeJSONv2["basics"]) => {
  const parts = [
    getVal(basics, "email"),
    getVal(basics, "phone"),
    getVal(basics, "location"),
    ...(basics.links || [])
  ]
    .map((item) => (item || "").trim())
    .filter(Boolean);
  return parts.join(" | ");
};

export default function TemplateClassic({ resume }: { resume: AnyResumeJSON }) {
  // Ensure we're working with v2 format
  const resumeV2 = ensureV2Format(resume);
  const { basics, sections } = resumeV2;

  const contactLine = buildContactLine(basics);
  const sortedSections = getSortedSections(resumeV2);

  // Filter out summary - we render it separately after contact info
  const summarySection = sections.summary;
  const otherSections = sortedSections.filter(s => s.id !== 'summary');

  return (
    <ResumePage
      className="classic-template mx-auto max-w-[820px] bg-white text-slate-900"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      {/* Header */}
      <div className="text-center">
        <h1 className="text-[26px] font-semibold tracking-[0.08em]">
          {basics.name || "Resume"}
        </h1>
        {basics.title && (
          <p className="mt-1 text-[12px] text-slate-700">
            {basics.title}
          </p>
        )}
        {contactLine && (
          <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-slate-700">
            {contactLine}
          </p>
        )}
      </div>

      {/* Summary - rendered separately without section header styling */}
      {summarySection && summarySection.visible && (
        <div>
          <SectionHeader label="Summary" />
          <p className="mt-2 text-[12px] leading-5 text-slate-800">
            {summarySection.items
              .filter(item => item.type === 'text')
              .map(item => (item as { type: 'text'; content: string }).content)
              .join('\n') || summarySection.rawText || basics.summary}
          </p>
        </div>
      )}

      {/* All other sections */}
      {otherSections.map((section) => (
        <GenericSection
          key={section.id}
          section={section}
          variant="classic"
          className="mt-4"
        />
      ))}
    </ResumePage>
  );
}
