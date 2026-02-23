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

export default function TemplateCreative({ resume }: { resume: AnyResumeJSON }) {
  const resumeV2 = ensureV2Format(resume);
  const { basics, sections } = resumeV2;

  const contactParts = buildContactLine(basics);
  const sortedSections = getSortedSections(resumeV2);

  // Filter out summary - we render it separately
  const summarySection = sections.summary;
  const otherSections = sortedSections.filter(s => s.id !== 'summary');

  return (
    <ResumePage
      className="creative-template mx-auto max-w-[820px] bg-white text-slate-900"
      style={{ fontFamily: '"Poppins", "Segoe UI", sans-serif' }}
    >
      {/* Creative header with accent */}
      <div className="relative">
        {/* Accent bar */}
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-600"></div>

        <div className="pl-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-[30px] font-bold text-slate-900 leading-tight">
                {basics.name || "Resume"}
              </h1>
              {basics.title && (
                <p className="mt-1 text-[15px] font-medium text-blue-600">
                  {basics.title}
                </p>
              )}
            </div>

            {/* Contact info in creative layout */}
            {contactParts.length > 0 && (
              <div className="text-right text-[11px] text-slate-600 space-y-1">
                {contactParts.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex items-center justify-end gap-2">
                    <div className="h-1 w-1 rounded-full bg-blue-400"></div>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Creative summary */}
      {summarySection && summarySection.visible && (
        <div className="relative bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-5 border-l-4 border-blue-500">
          <div className="absolute top-2 right-4 h-8 w-8 rounded-full bg-blue-100 opacity-50"></div>
          <div className="absolute bottom-2 right-8 h-4 w-4 rounded-full bg-purple-100 opacity-30"></div>

          <h2 className="text-[12px] font-bold uppercase tracking-[0.15em] text-blue-700 mb-3">
            About Me
          </h2>
          <p className="text-[13px] leading-6 text-slate-800 relative z-10">
            {summarySection.items
              .filter(item => item.type === 'text')
              .map(item => (item as { type: 'text'; content: string }).content)
              .join('\n') || summarySection.rawText || basics.summary}
          </p>
        </div>
      )}

      {/* Main content with creative styling */}
      <div className="px-8 py-6 space-y-7">
        {otherSections.map((section, index) => (
          <div key={section.id} className="group relative">
            {/* Creative section header */}
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <h2 className="text-[14px] font-bold uppercase tracking-[0.12em] text-slate-900">
                  {section.label}
                </h2>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-blue-200 via-purple-200 to-transparent"></div>
            </div>

            {/* Decorative elements */}
            {index % 2 === 0 && (
              <div className="absolute -right-4 top-8 h-6 w-6 rounded-full bg-blue-50 opacity-40"></div>
            )}
            {index % 3 === 0 && (
              <div className="absolute -left-2 top-12 h-3 w-3 rounded-full bg-purple-100 opacity-50"></div>
            )}

            {/* Section content */}
            <div className="ml-6 relative z-10">
              <GenericSection
                section={section}
                variant="classic"
                showHeader={false}
                className="creative-section-content"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Creative styling overrides */}
      <style>{`
        .creative-template {
          font-family: "Poppins", "Segoe UI", sans-serif;
        }
        
        .creative-template .creative-section-content {
          font-size: 12px;
          line-height: 1.5;
        }
        
        .creative-template .creative-section-content h3 {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 2px;
          position: relative;
        }
        
        .creative-template .creative-section-content h3::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 20px;
          height: 2px;
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          border-radius: 1px;
        }
        
        .creative-template .creative-section-content ul {
          margin-left: 16px;
          margin-top: 4px;
        }
        
        .creative-template .creative-section-content li {
          margin-bottom: 2px;
          color: #475569;
          position: relative;
        }
        
        .creative-template .creative-section-content li::marker {
          color: #3b82f6;
        }
        
        .creative-template .creative-section-content .font-semibold {
          color: #1e293b;
          font-weight: 600;
        }
        
        .creative-template .creative-section-content .italic {
          color: #6366f1;
          font-style: italic;
          font-weight: 500;
        }
        
        .creative-template .creative-section-content .text-slate-900 {
          color: #1e293b;
        }
      `}</style>
    </ResumePage>
  );
}