"use client";

import ResumePage from "@/components/resume-optimizer/ResumePage";
import { GenericSection } from "@/components/resume";
import type { AnyResumeJSON, ResumeJSONv2, ResumeSection } from "@/types/resume";
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

const buildContactBlocks = (basics: ResumeJSONv2["basics"]) => {
  const items = [
    getVal(basics, "email"),
    getVal(basics, "phone"),
    getVal(basics, "location"),
    ...(basics.links || [])
  ]
    .map((item) => (item || "").trim())
    .filter(Boolean);
  return items;
};

// Sections that go in the left column (main content)
const LEFT_COLUMN_SECTIONS = ['experience'];

// Sections that go in the right column (sidebar)
const RIGHT_COLUMN_SECTIONS = ['skills', 'projects', 'education', 'certifications', 'community', 'awards'];

export default function TemplateSplit({ resume }: { resume: AnyResumeJSON }) {
  // Ensure we're working with v2 format
  const resumeV2 = ensureV2Format(resume);
  const { basics, sections } = resumeV2;

  const contactBlocks = buildContactBlocks(basics);
  const sortedSections = getSortedSections(resumeV2);

  // Separate summary from other sections
  const summarySection = sections.summary;

  // Categorize sections into left and right columns
  const leftSections: ResumeSection[] = [];
  const rightSections: ResumeSection[] = [];

  sortedSections
    .filter(s => s.id !== 'summary')
    .forEach(section => {
      if (LEFT_COLUMN_SECTIONS.includes(section.id)) {
        leftSections.push(section);
      } else if (RIGHT_COLUMN_SECTIONS.includes(section.id)) {
        rightSections.push(section);
      } else {
        // Unknown sections go to right column by default
        rightSections.push(section);
      }
    });

  return (
    <ResumePage
      className="mx-auto max-w-[920px] bg-white text-slate-900"
      style={{ fontFamily: '"Source Sans 3", "Segoe UI", sans-serif' }}
    >
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-[26px] font-semibold">
              {basics.name || "Resume"}
            </h1>
            {basics.title && (
              <p className="mt-1 text-[12px] text-slate-700">
                {basics.title}
              </p>
            )}
          </div>
          {contactBlocks.length > 0 && (
            <div className="text-right text-[11px] text-slate-600">
              {contactBlocks.map((item, index) => (
                <div key={`${item}-${index}`}>{item}</div>
              ))}
            </div>
          )}
        </div>

        {/* Summary in header area */}
        {summarySection && summarySection.visible && (
          <p className="mt-4 text-[12px] text-slate-800">
            {summarySection.items
              .filter(item => item.type === 'text')
              .map(item => (item as { type: 'text'; content: string }).content)
              .join('\n') || summarySection.rawText || basics.summary}
          </p>
        )}
      </div>

      {/* Two-column layout */}
      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-[1.6fr_1fr]">
        {/* Left column - Experience and other main content */}
        <div className="space-y-6">
          {leftSections.map((section) => (
            <GenericSection
              key={section.id}
              section={section}
              variant="split"
            />
          ))}
        </div>

        {/* Right column - Skills, Projects, Education, etc. */}
        <div className="space-y-6">
          {rightSections.map((section) => (
            <GenericSection
              key={section.id}
              section={section}
              variant="split"
            />
          ))}
        </div>
      </div>
    </ResumePage>
  );
}
