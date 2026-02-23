"use client";

import ResumePage from "@/components/resume-optimizer/ResumePage";
import { GenericSection } from "@/components/resume";
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
  return parts;
};

export default function TemplateModern({ resume }: { resume: AnyResumeJSON }) {
  const resumeV2 = ensureV2Format(resume);
  const { basics, sections } = resumeV2;

  const contactParts = buildContactLine(basics);
  const sortedSections = getSortedSections(resumeV2);

  // Filter out summary - we render it separately
  const summarySection = sections.summary;
  const otherSections = sortedSections.filter(s => s.id !== 'summary');

  return (
    <ResumePage
      className="modern-template mx-auto max-w-[820px] bg-white text-slate-900"
      style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}
    >
      {/* Header with modern styling */}
      <div className="relative bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative">
          <h1 className="text-[28px] font-bold tracking-tight">
            {basics.name || "Resume"}
          </h1>
          {basics.title && (
            <p className="mt-1 text-[14px] font-medium text-slate-200">
              {basics.title}
            </p>
          )}

          {/* Contact info in modern grid */}
          {contactParts.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-slate-300">
              {contactParts.map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary with modern styling */}
      {summarySection && summarySection.visible && (
        <div className="border-l-4 border-slate-900 bg-slate-50 px-6 py-4">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-slate-700 mb-2">
            Professional Summary
          </h2>
          <p className="text-[13px] leading-6 text-slate-800">
            {summarySection.items
              .filter(item => item.type === 'text')
              .map(item => (item as { type: 'text'; content: string }).content)
              .join('\n') || summarySection.rawText || basics.summary}
          </p>
        </div>
      )}

      {/* Main content with modern section styling */}
      <div className="px-8 py-6 space-y-8">
        {otherSections.map((section) => (
          <div key={section.id} className="group">
            {/* Modern section header */}
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-slate-900"></div>
                <h2 className="text-[14px] font-bold uppercase tracking-[0.12em] text-slate-900">
                  {section.label}
                </h2>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-300 to-transparent"></div>
            </div>

            {/* Section content with custom styling */}
            <div className="ml-5">
              <GenericSection
                section={section}
                variant="classic"
                showHeader={false}
                className="modern-section-content"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Modern styling overrides */}
      <style>{`
        .modern-template .modern-section-content {
          font-size: 12px;
          line-height: 1.5;
        }
        
        .modern-template .modern-section-content h3 {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
        }
        
        .modern-template .modern-section-content ul {
          margin-left: 16px;
          margin-top: 4px;
        }
        
        .modern-template .modern-section-content li {
          margin-bottom: 2px;
          color: #475569;
        }
        
        .modern-template .modern-section-content .font-semibold {
          color: #1e293b;
          font-weight: 600;
        }
        
        .modern-template .modern-section-content .italic {
          color: #64748b;
          font-style: italic;
        }
      `}</style>
    </ResumePage>
  );
}