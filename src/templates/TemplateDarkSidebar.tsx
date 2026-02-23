"use client";


import type { ResumeData } from "@/types/portfolioly-resume";

interface Props {
  data: ResumeData;
}

export default function TemplateDarkSidebar({ data }: Props) {
  const { basics, work, skills, projects, education, awards } = data;
  const summary = (data as any).summary || "";

  return (
    <div className="tds-root" style={{ fontFamily: '"Inter", "Segoe UI", Arial, sans-serif' }}>
      <style>{darkSidebarStyles}</style>

      {/* Header */}
      <div className="tds-header">
        {basics.photo && (
          <img
            src={basics.photo}
            alt={basics.name || "Profile"}
            style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", marginBottom: 12, border: "3px solid rgba(116,185,255,0.4)" }}
          />
        )}
        <div className="tds-header-content">
          <h1 className="tds-name">{basics.name || "Your Name"}</h1>
          {work.length > 0 && work[0].position && (
            <div className="tds-title-line">{work[0].position}</div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="tds-body">
        {/* Left Sidebar - Dark */}
        <div className="tds-sidebar">
          {/* Contact */}
          <div className="tds-sb-section">
            <h3 className="tds-sb-title">Contact</h3>
            {basics.email && <div className="tds-sb-item">{basics.email}</div>}
            {basics.phone && <div className="tds-sb-item">{basics.phone}</div>}
            {basics.profiles?.map((p, i) => (
              <div key={i} className="tds-sb-item tds-sb-link">{p.url || p.network}</div>
            ))}
          </div>

          {/* Skills - split into hard/soft or by category */}
          {skills.length > 0 && skills.map((cat, i) => (
            <div key={i} className="tds-sb-section">
              <h3 className="tds-sb-title">{cat.name}</h3>
              <div className="tds-sb-skills">
                {cat.keywords.map((kw, j) => (
                  <div key={j} className="tds-sb-skill-item">
                    <span className="tds-sb-skill-dot" />
                    <span>{kw}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Awards in sidebar */}
          {awards.length > 0 && (
            <div className="tds-sb-section">
              <h3 className="tds-sb-title">Awards</h3>
              {awards.map((a, i) => (
                <div key={i} className="tds-sb-award">
                  <div className="tds-sb-award-name">{a.title}</div>
                  {a.awarder && <div className="tds-sb-award-org">{a.awarder}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Main Content */}
        <div className="tds-main">
          {/* Profile Summary */}
          {summary && (
            <div className="tds-section">
              <h2 className="tds-section-heading">Profile Summary</h2>
              <p className="tds-summary-text">{summary}</p>
            </div>
          )}

          {/* Professional Experience */}
          {work.length > 0 && (
            <div className="tds-section">
              <h2 className="tds-section-heading">Professional Experience</h2>
              {work.map((w, i) => (
                <div key={i} className="tds-exp-entry">
                  <div className="tds-exp-top">
                    <div className="tds-exp-position">{w.position}</div>
                    <div className="tds-exp-date">
                      {w.startDate}{w.endDate ? ` – ${w.endDate}` : ""}
                    </div>
                  </div>
                  <div className="tds-exp-company">{w.company}</div>
                  {w.highlights.length > 0 && (
                    <ul className="tds-exp-bullets">
                      {w.highlights.map((h, j) => (
                        <li key={j}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="tds-section">
              <h2 className="tds-section-heading">Education</h2>
              {education.map((edu, i) => {
                const gradDate = edu.endDate || edu.startDate || "";
                return (
                  <div key={i} className="tds-edu-entry">
                    <div className="tds-exp-top">
                      <div className="tds-exp-position">
                        {edu.studyType}{edu.area ? ` in ${edu.area}` : ""}
                      </div>
                      {gradDate && <div className="tds-exp-date">{gradDate}</div>}
                    </div>
                    <div className="tds-exp-company">{edu.institution}</div>
                    {edu.location && <div className="tds-edu-score">{edu.location}</div>}
                    {edu.score && <div className="tds-edu-score">{edu.score}</div>}
                    {edu.highlights && edu.highlights.length > 0 && (
                      <ul className="tds-exp-bullets">
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

          {/* Projects */}
          {projects.length > 0 && (
            <div className="tds-section">
              <h2 className="tds-section-heading">Projects</h2>
              {projects.map((p, i) => {
                const projDates = p.startDate || p.endDate
                  ? [p.startDate, p.endDate].filter(Boolean).join(" – ")
                  : p.type || "";
                return (
                  <div key={i} className="tds-exp-entry">
                    <div className="tds-exp-top">
                      <div className="tds-exp-position">{p.name}</div>
                      {projDates && <div className="tds-exp-date">{projDates}</div>}
                    </div>
                    {p.role && <div className="tds-exp-company">{p.role}</div>}
                    {p.entity && <div className="tds-exp-company">{p.entity}</div>}
                    {p.description && (
                      <ul className="tds-exp-bullets">
                        {p.description.split("\n").filter(Boolean).map((line, j) => (
                          <li key={j}>{line.replace(/^-\s*/, "")}</li>
                        ))}
                      </ul>
                    )}
                    {p.highlights && p.highlights.length > 0 && (
                      <ul className="tds-exp-bullets">
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
      </div>
    </div>
  );
}

const darkSidebarStyles = `
  .tds-root {
    max-width: 816px;
    margin: 0 auto;
    background: #fff;
    font-size: 10pt;
    line-height: 1.5;
  }

  .tds-header {
    background: #2d3436;
    color: #fff;
    padding: 30px 32px;
  }

  .tds-header-content {
    text-align: left;
  }

  .tds-name {
    font-size: 30pt;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .tds-title-line {
    font-size: 11pt;
    font-weight: 400;
    opacity: 0.8;
    margin-top: 4px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .tds-body {
    display: grid;
    grid-template-columns: 240px 1fr;
  }

  .tds-sidebar {
    background: #2d3436;
    color: #dfe6e9;
    padding: 20px;
  }

  .tds-sb-section {
    margin-bottom: 22px;
  }

  .tds-sb-title {
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #74b9ff;
    margin: 0 0 10px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(116, 185, 255, 0.3);
  }

  .tds-sb-item {
    font-size: 8.5pt;
    color: #b2bec3;
    margin-bottom: 4px;
    word-break: break-all;
    line-height: 1.5;
  }

  .tds-sb-link {
    color: #74b9ff;
  }

  .tds-sb-skills {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .tds-sb-skill-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 8.5pt;
    color: #dfe6e9;
  }

  .tds-sb-skill-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #74b9ff;
    flex-shrink: 0;
  }

  .tds-sb-award {
    margin-bottom: 8px;
  }

  .tds-sb-award-name {
    font-size: 8.5pt;
    font-weight: 600;
    color: #dfe6e9;
  }

  .tds-sb-award-org {
    font-size: 8pt;
    color: #636e72;
  }

  .tds-main {
    padding: 20px 28px;
    color: #2d3436;
  }

  .tds-section {
    margin-bottom: 18px;
  }

  .tds-section-heading {
    font-size: 12pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #2d3436;
    margin: 0 0 10px 0;
    padding-bottom: 4px;
    border-bottom: 2px solid #2d3436;
  }

  .tds-summary-text {
    font-size: 9pt;
    color: #636e72;
    line-height: 1.65;
    margin: 0;
  }

  .tds-exp-entry {
    margin-bottom: 14px;
  }

  .tds-edu-entry {
    margin-bottom: 10px;
  }

  .tds-exp-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .tds-exp-position {
    font-size: 10pt;
    font-weight: 600;
    color: #2d3436;
  }

  .tds-exp-company {
    font-size: 9pt;
    color: #636e72;
  }

  .tds-exp-date {
    font-size: 8.5pt;
    color: #b2bec3;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .tds-exp-bullets {
    margin: 4px 0 0 16px;
    padding: 0;
    list-style: disc;
  }

  .tds-exp-bullets li {
    font-size: 9pt;
    color: #636e72;
    margin-bottom: 2px;
    line-height: 1.45;
  }

  .tds-edu-score {
    font-size: 8.5pt;
    color: #b2bec3;
    margin-top: 2px;
  }
`;
