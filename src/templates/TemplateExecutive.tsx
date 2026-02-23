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

export default function TemplateExecutive({ resume }: { resume: AnyResumeJSON }) {
  const resumeV2 = ensureV2Format(resume);
  const { basics, sections } = resumeV2;

  const contactParts = buildContactLine(basics);
  const sortedSections = getSortedSections(resumeV2);

  // Filter out summary - we render it separately
  const summarySection = sections.summary;
  const otherSections = sortedSections.filter(s => s.id !== 'summary');

  return (
    <ResumePage
      className="executive-template mx-auto max-w-[820px] bg-white text-slate-900"
      style={{ fontFamily: '"Playfair Display", "Georgia", serif' }}
    >
      {/* Elegant header */}
      <div className="border-b-2 border-slate-900 pb-6 text-center">
        <h1 className="text-[32px] font-bold tracking-wide text-slate-900">
          {basics.name || "Resume"}
        </h1>
        {basics.title && (
          <p className="mt-2 text-[16px] font-medium text-slate-700 tracking-wide">
            {basics.title}
          </p>
        )}

        {/* Elegant contact line */}
        {contactParts.length > 0 && (
          <div className="mt-4 text-[12px] text-slate-600 tracking-wider">
            {contactParts.join(" • ")}
          </div>
        )}
      </div>

      {/* Executive summary */}
      {summarySection && summarySection.visible && (
        <div className="py-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-slate-400"></div>
              <h2 className="text-[13px] font-semibold uppercase tracking-[0.2em] text-slate-700">
                Executive Summary
              </h2>
              <div className="h-px w-8 bg-slate-400"></div>
            </div>
          </div>
          <p className="text-[13px] leading-6 text-slate-800 text-center max-w-3xl mx-auto">
            {summarySection.items
              .filter(item => item.type === 'text')
              .map(item => (item as { type: 'text'; content: string }).content)
              .join('\n') || summarySection.rawText || basics.summary}
          </p>
        </div>
      )}

      {/* Main content with executive styling */}
      <div className="space-y-8">
        {otherSections.map((section) => (
          <div key={section.id} className="group">
            {/* Executive section header */}
            <div className="mb-5 text-center">
              <div className="inline-flex items-center gap-3">
                <div className="h-px w-12 bg-slate-400"></div>
                <h2 className="text-[14px] font-bold uppercase tracking-[0.15em] text-slate-900">
                  {section.label}
                </h2>
                <div className="h-px w-12 bg-slate-400"></div>
              </div>
            </div>

            {/* Section content */}
            <div className="executive-section-content">
              <GenericSection
                section={section}
                variant="classic"
                showHeader={false}
                className="executive-content"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Executive styling overrides */}
      <style>{`
        .executive-template {
          font-family: "Playfair Display", "Georgia", serif;
        }
        
        .executive-template .executive-content {
          font-size: 12px;
          line-height: 1.6;
        }
        
        .executive-template .executive-content h3 {
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 3px;
          font-size: 13px;
        }
        
        .executive-template .executive-content ul {
          margin-left: 20px;
          margin-top: 6px;
        }
        
        .executive-template .executive-content li {
          margin-bottom: 3px;
          color: #475569;
          line-height: 1.5;
        }
        
        .executive-template .executive-content .font-semibold {
          color: #1e293b;
          font-weight: 700;
        }
        
        .executive-template .executive-content .italic {
          color: #64748b;
          font-style: italic;
          font-weight: 500;
        }
        
        .executive-template .executive-content .text-slate-900 {
          color: #1e293b;
        }
        
        .executive-template .executive-content .text-slate-800 {
          color: #334155;
        }
      `}</style>
    </ResumePage>
  );
}