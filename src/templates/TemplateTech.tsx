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

export default function TemplateTech({ resume }: { resume: AnyResumeJSON }) {
  const resumeV2 = ensureV2Format(resume);
  const { basics, sections } = resumeV2;

  const contactParts = buildContactLine(basics);
  const sortedSections = getSortedSections(resumeV2);

  // Filter out summary - we render it separately
  const summarySection = sections.summary;
  const otherSections = sortedSections.filter(s => s.id !== 'summary');

  return (
    <ResumePage
      className="tech-template mx-auto max-w-[820px] bg-white text-slate-900"
      style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
    >
      {/* Tech-style header */}
      <div className="relative bg-slate-900 px-6 py-6 text-green-400">
        {/* Terminal-style decorations */}
        <div className="absolute top-2 left-2 flex gap-1">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
        </div>

        <div className="mt-4">
          <div className="text-[11px] text-green-600 mb-1">$ whoami</div>
          <h1 className="text-[24px] font-bold text-green-400 font-mono">
            {basics.name || "Resume"}
          </h1>
          {basics.title && (
            <div className="mt-2">
              <span className="text-[11px] text-green-600">$ echo $ROLE</span>
              <p className="text-[13px] text-green-300 font-medium">
                {basics.title}
              </p>
            </div>
          )}

          {/* Contact info in terminal style */}
          {contactParts.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] text-green-600 mb-1">$ cat contact.txt</div>
              <div className="text-[11px] text-green-300 space-y-1">
                {contactParts.map((item, index) => (
                  <div key={`${item}-${index}`} className="flex items-center gap-2">
                    <span className="text-green-600">&gt;</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tech summary */}
      {summarySection && summarySection.visible && (
        <div className="bg-slate-50 border-l-4 border-green-500 px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] text-slate-600 font-mono">// </span>
            <h2 className="text-[12px] font-bold uppercase tracking-[0.15em] text-slate-700 font-mono">
              README.md
            </h2>
          </div>
          <div className="bg-white border border-slate-200 rounded p-4">
            <p className="text-[12px] leading-6 text-slate-800 font-mono">
              {summarySection.items
                .filter(item => item.type === 'text')
                .map(item => (item as { type: 'text'; content: string }).content)
                .join('\n') || summarySection.rawText || basics.summary}
            </p>
          </div>
        </div>
      )}

      {/* Main content with tech styling */}
      <div className="px-6 py-6 space-y-8">
        {otherSections.map((section, index) => (
          <div key={section.id} className="group">
            {/* Tech section header */}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[11px] text-green-600 font-mono">##</span>
              <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-slate-900 font-mono">
                {section.label}
              </h2>
              <div className="h-px flex-1 bg-slate-300"></div>
              <span className="text-[10px] text-slate-400 font-mono">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Code block style content */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <GenericSection
                section={section}
                variant="classic"
                showHeader={false}
                className="tech-section-content"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Tech styling overrides */}
      <style>{`
        .tech-template {
          font-family: "JetBrains Mono", "Fira Code", monospace;
        }
        
        .tech-template .tech-section-content {
          font-size: 11px;
          line-height: 1.6;
          font-family: "JetBrains Mono", "Fira Code", monospace;
        }
        
        .tech-template .tech-section-content h3 {
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 3px;
          font-size: 12px;
          position: relative;
        }
        
        .tech-template .tech-section-content h3::before {
          content: '\\003E ';
          color: #16a34a;
          font-weight: normal;
        }
        
        .tech-template .tech-section-content ul {
          margin-left: 16px;
          margin-top: 4px;
        }
        
        .tech-template .tech-section-content li {
          margin-bottom: 2px;
          color: #475569;
          position: relative;
        }
        
        .tech-template .tech-section-content li::before {
          content: '- ';
          color: #16a34a;
          font-weight: bold;
          margin-right: 4px;
        }
        
        .tech-template .tech-section-content li::marker {
          content: '';
        }
        
        .tech-template .tech-section-content .font-semibold {
          color: #1e293b;
          font-weight: 700;
        }
        
        .tech-template .tech-section-content .italic {
          color: #16a34a;
          font-style: normal;
          font-weight: 600;
        }
        
        .tech-template .tech-section-content .text-slate-900 {
          color: #1e293b;
        }
        
        .tech-template .tech-section-content .text-slate-800 {
          color: #334155;
        }
      `}</style>
    </ResumePage>
  );
}