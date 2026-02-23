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

export default function TemplateMinimal({ resume }: { resume: AnyResumeJSON }) {
  const resumeV2 = ensureV2Format(resume);
  const { basics, sections } = resumeV2;

  const contactParts = buildContactLine(basics);
  const sortedSections = getSortedSections(resumeV2);

  // Filter out summary - we render it separately
  const summarySection = sections.summary;
  const otherSections = sortedSections.filter(s => s.id !== 'summary');

  return (
    <ResumePage
      className="minimal-template mx-auto max-w-[820px] bg-white text-slate-900"
      style={{ fontFamily: '"Helvetica Neue", "Arial", sans-serif' }}
    >
      {/* Ultra-minimal header */}
      <div className="pb-8 text-center">
        <h1 className="text-[36px] font-light text-slate-900 tracking-wide">
          {basics.name || "Resume"}
        </h1>
        {basics.title && (
          <p className="mt-2 text-[14px] font-light text-slate-600 tracking-wide">
            {basics.title}
          </p>
        )}

        {/* Minimal contact line */}
        {contactParts.length > 0 && (
          <div className="mt-4 text-[11px] text-slate-500 tracking-wide">
            {contactParts.join("  •  ")}
          </div>
        )}
      </div>

      {/* Minimal summary */}
      {summarySection && summarySection.visible && (
        <div className="pb-8 border-b border-slate-200">
          <p className="text-[13px] leading-7 text-slate-700 text-center max-w-2xl mx-auto font-light">
            {summarySection.items
              .filter(item => item.type === 'text')
              .map(item => (item as { type: 'text'; content: string }).content)
              .join('\n') || summarySection.rawText || basics.summary}
          </p>
        </div>
      )}

      {/* Main content with minimal styling */}
      <div className="pt-8 space-y-10">
        {otherSections.map((section) => (
          <div key={section.id} className="group">
            {/* Minimal section header */}
            <div className="mb-6 text-center">
              <h2 className="text-[16px] font-light uppercase tracking-[0.3em] text-slate-900">
                {section.label}
              </h2>
              <div className="mt-2 mx-auto h-px w-16 bg-slate-300"></div>
            </div>

            {/* Section content */}
            <div className="minimal-section-content">
              <GenericSection
                section={section}
                variant="classic"
                showHeader={false}
                className="minimal-content"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Minimal styling overrides */}
      <style>{`
        .minimal-template {
          font-family: "Helvetica Neue", "Arial", sans-serif;
        }
        
        .minimal-template .minimal-content {
          font-size: 12px;
          line-height: 1.7;
          font-weight: 300;
        }
        
        .minimal-template .minimal-content h3 {
          font-weight: 400;
          color: #1e293b;
          margin-bottom: 4px;
          font-size: 13px;
        }
        
        .minimal-template .minimal-content ul {
          margin-left: 20px;
          margin-top: 6px;
          list-style: none;
        }
        
        .minimal-template .minimal-content li {
          margin-bottom: 4px;
          color: #64748b;
          position: relative;
          padding-left: 12px;
        }
        
        .minimal-template .minimal-content li::before {
          content: '—';
          position: absolute;
          left: 0;
          color: #cbd5e1;
          font-weight: 300;
        }
        
        .minimal-template .minimal-content .font-semibold {
          color: #1e293b;
          font-weight: 400;
        }
        
        .minimal-template .minimal-content .italic {
          color: #64748b;
          font-style: italic;
          font-weight: 300;
        }
        
        .minimal-template .minimal-content .text-slate-900 {
          color: #1e293b;
        }
        
        .minimal-template .minimal-content .text-slate-800 {
          color: #334155;
        }
        
        .minimal-template .minimal-content .text-slate-600 {
          color: #64748b;
        }
      `}</style>
    </ResumePage>
  );
}