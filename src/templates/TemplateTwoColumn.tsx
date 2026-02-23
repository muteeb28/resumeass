"use client";


import type { ResumeData } from "@/types/portfolioly-resume";

interface Props {
  data: ResumeData;
}

export default function TemplateTwoColumn({ data }: Props) {
  const { basics, work, skills, projects, education, awards } = data;
  const summary = (data as any).summary || "";

  return (
    <div className="ttc-root" style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}>
      <style>{twoColumnStyles}</style>

      {/* Header */}
      <div className="ttc-header">
        {basics.photo && (
          <img
            src={basics.photo}
            alt={basics.name || "Profile"}
            style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "3px solid rgba(255,255,255,0.3)" }}
          />
        )}
        <div className="ttc-header-left">
          <h1 className="ttc-name">{basics.name || "Your Name"}</h1>
          <div className="ttc-contact-row">
            {basics.email && <span>{basics.email}</span>}
            {basics.phone && <span>{basics.phone}</span>}
            {basics.profiles?.map((p, i) => (
              <span key={i}>{p.url || p.network}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="ttc-summary">
          <p>{summary}</p>
        </div>
      )}

      {/* Two-column body */}
      <div className="ttc-body">
        {/* Left column - Experience & Projects */}
        <div className="ttc-col-left">
          {work.length > 0 && (
            <div className="ttc-section">
              <h2 className="ttc-section-title ttc-accent-border">Professional Experience</h2>
              {work.map((w, i) => (
                <div key={i} className="ttc-entry">
                  <div className="ttc-entry-header">
                    <div>
                      <strong className="ttc-entry-title">{w.position}</strong>
                      <span className="ttc-entry-org"> — {w.company}</span>
                    </div>
                    <span className="ttc-entry-date">
                      {w.startDate}{w.endDate ? ` – ${w.endDate}` : ""}
                    </span>
                  </div>
                  {w.highlights.length > 0 && (
                    <ul className="ttc-bullets">
                      {w.highlights.map((h, j) => (
                        <li key={j}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {projects.length > 0 && (
            <div className="ttc-section">
              <h2 className="ttc-section-title ttc-accent-border">Projects</h2>
              {projects.map((p, i) => {
                const projDates = p.startDate || p.endDate
                  ? [p.startDate, p.endDate].filter(Boolean).join(" – ")
                  : p.type || "";
                return (
                  <div key={i} className="ttc-entry">
                    <div className="ttc-entry-header">
                      <strong className="ttc-entry-title">{p.name}</strong>
                      {projDates && <span className="ttc-entry-date">{projDates}</span>}
                    </div>
                    {p.role && <div className="ttc-tech-line">{p.role}</div>}
                    {p.entity && (
                      <div className="ttc-tech-line">{p.entity}</div>
                    )}
                    {p.description && (
                      <ul className="ttc-bullets">
                        {p.description.split("\n").filter(Boolean).map((line, j) => (
                          <li key={j}>{line.replace(/^-\s*/, "")}</li>
                        ))}
                      </ul>
                    )}
                    {p.highlights && p.highlights.length > 0 && (
                      <ul className="ttc-bullets">
                        {p.highlights.map((h, j) => (
                          <li key={j}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column - Education, Skills, Awards */}
        <div className="ttc-col-right">
          {education.length > 0 && (
            <div className="ttc-section">
              <h2 className="ttc-section-title ttc-accent-border">Education</h2>
              {education.map((edu, i) => {
                const gradDate = edu.endDate || edu.startDate || "";
                return (
                  <div key={i} className="ttc-entry">
                    <div className="ttc-entry-header">
                      <strong className="ttc-entry-title">{edu.institution}</strong>
                      {gradDate && <span className="ttc-entry-date">{gradDate}</span>}
                    </div>
                    {edu.studyType && <div className="ttc-edu-degree">{edu.studyType}{edu.area ? ` in ${edu.area}` : ""}</div>}
                    {edu.location && <div className="ttc-edu-score">{edu.location}</div>}
                    {edu.score && <div className="ttc-edu-score">{edu.score}</div>}
                    {edu.highlights && edu.highlights.length > 0 && (
                      <ul className="ttc-bullets">
                        {edu.highlights.map((h, j) => (
                          <li key={j}>{h}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {skills.length > 0 && (
            <div className="ttc-section">
              <h2 className="ttc-section-title ttc-accent-border">Skills</h2>
              {skills.map((cat, i) => (
                <div key={i} className="ttc-skill-category">
                  <div className="ttc-skill-cat-name">{cat.name}</div>
                  <div className="ttc-skill-pills">
                    {cat.keywords.map((kw, j) => (
                      <span key={j} className="ttc-pill">{kw}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {awards.length > 0 && (
            <div className="ttc-section">
              <h2 className="ttc-section-title ttc-accent-border">Awards & Achievements</h2>
              {awards.map((a, i) => (
                <div key={i} className="ttc-entry">
                  <strong className="ttc-entry-title">{a.title}</strong>
                  {a.awarder && <div className="ttc-edu-degree">{a.awarder}</div>}
                  {a.summary && <div className="ttc-edu-score">{a.summary}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const twoColumnStyles = `
  .ttc-root {
    max-width: 816px;
    margin: 0 auto;
    background: #fff;
    color: #1a1a2e;
    font-size: 10pt;
    line-height: 1.5;
  }

  .ttc-header {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    color: #fff;
    padding: 28px 32px;
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .ttc-name {
    font-size: 26pt;
    font-weight: 700;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }

  .ttc-contact-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 9pt;
    opacity: 0.9;
  }

  .ttc-contact-row span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ttc-summary {
    padding: 16px 32px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    font-size: 9.5pt;
    color: #495057;
    line-height: 1.6;
  }

  .ttc-body {
    display: grid;
    grid-template-columns: 1.6fr 1fr;
    gap: 0;
  }

  .ttc-col-left {
    padding: 20px 24px 20px 32px;
    border-right: 1px solid #e9ecef;
  }

  .ttc-col-right {
    padding: 20px 32px 20px 24px;
  }

  .ttc-section {
    margin-bottom: 18px;
  }

  .ttc-section-title {
    font-size: 11pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0 0 10px 0;
    padding-bottom: 6px;
    color: #1a1a2e;
  }

  .ttc-accent-border {
    border-bottom: 2px solid #e8630a;
  }

  .ttc-entry {
    margin-bottom: 12px;
  }

  .ttc-entry-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .ttc-entry-title {
    font-weight: 600;
    color: #1a1a2e;
  }

  .ttc-entry-org {
    color: #495057;
  }

  .ttc-entry-date {
    font-size: 8.5pt;
    color: #868e96;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .ttc-bullets {
    margin: 4px 0 0 16px;
    padding: 0;
    list-style: disc;
  }

  .ttc-bullets li {
    font-size: 9pt;
    color: #343a40;
    margin-bottom: 2px;
    line-height: 1.45;
  }

  .ttc-tech-line {
    font-size: 8.5pt;
    color: #868e96;
    font-style: italic;
    margin-top: 2px;
  }

  .ttc-edu-degree {
    font-size: 9pt;
    color: #495057;
  }

  .ttc-edu-score {
    font-size: 8.5pt;
    color: #868e96;
  }

  .ttc-skill-category {
    margin-bottom: 10px;
  }

  .ttc-skill-cat-name {
    font-size: 9pt;
    font-weight: 600;
    color: #1a1a2e;
    margin-bottom: 4px;
  }

  .ttc-skill-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .ttc-pill {
    display: inline-block;
    padding: 2px 10px;
    background: #e8630a;
    color: #fff;
    border-radius: 12px;
    font-size: 8pt;
    font-weight: 500;
  }
`;
