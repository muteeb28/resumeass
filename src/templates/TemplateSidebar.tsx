"use client";


import type { ResumeData } from "@/types/portfolioly-resume";

interface Props {
  data: ResumeData;
}

export default function TemplateSidebar({ data }: Props) {
  const { basics, work, skills, projects, education, awards } = data;
  const summary = (data as any).summary || "";

  return (
    <div className="tsb-root" style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
      <style>{sidebarStyles}</style>

      {/* Header */}
      <div className="tsb-header">
        {basics.photo && (
          <img
            src={basics.photo}
            alt={basics.name || "Profile"}
            style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px", border: "3px solid rgba(255,255,255,0.3)" }}
          />
        )}
        <h1 className="tsb-name">{basics.name || "Your Name"}</h1>
        {summary && <p className="tsb-subtitle">{summary.length > 120 ? summary.slice(0, 120) + "..." : summary}</p>}
      </div>

      {/* Body with sidebar */}
      <div className="tsb-body">
        {/* Left Sidebar */}
        <div className="tsb-sidebar">
          {/* Contact */}
          <div className="tsb-sidebar-section">
            <h3 className="tsb-sidebar-title">Contact</h3>
            <div className="tsb-contact-list">
              {basics.email && (
                <div className="tsb-contact-item">
                  <span className="tsb-contact-icon">@</span>
                  <span>{basics.email}</span>
                </div>
              )}
              {basics.phone && (
                <div className="tsb-contact-item">
                  <span className="tsb-contact-icon">#</span>
                  <span>{basics.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Links */}
          {basics.profiles && basics.profiles.length > 0 && (
            <div className="tsb-sidebar-section">
              <h3 className="tsb-sidebar-title">Links</h3>
              <div className="tsb-contact-list">
                {basics.profiles.map((p, i) => (
                  <div key={i} className="tsb-contact-item">
                    <span className="tsb-contact-icon tsb-link-icon">{p.network.charAt(0)}</span>
                    <span className="tsb-link-text">{p.url || p.network}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="tsb-sidebar-section">
              <h3 className="tsb-sidebar-title">Skills</h3>
              {skills.map((cat, i) => (
                <div key={i} className="tsb-skill-group">
                  <div className="tsb-skill-cat">{cat.name}</div>
                  <div className="tsb-skill-list">
                    {cat.keywords.map((kw, j) => (
                      <span key={j} className="tsb-skill-tag">{kw}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Awards */}
          {awards.length > 0 && (
            <div className="tsb-sidebar-section">
              <h3 className="tsb-sidebar-title">Awards</h3>
              {awards.map((a, i) => (
                <div key={i} className="tsb-award-item">
                  <div className="tsb-award-title">{a.title}</div>
                  {a.awarder && <div className="tsb-award-detail">{a.awarder}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Main Content */}
        <div className="tsb-main">
          {/* Summary */}
          {summary && (
            <div className="tsb-main-section">
              <h2 className="tsb-main-title">Profile</h2>
              <p className="tsb-profile-text">{summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {work.length > 0 && (
            <div className="tsb-main-section">
              <h2 className="tsb-main-title">Work Experience</h2>
              {work.map((w, i) => (
                <div key={i} className="tsb-work-entry">
                  <div className="tsb-work-header">
                    <div>
                      <div className="tsb-work-position">{w.position}</div>
                      <div className="tsb-work-company">{w.company}</div>
                    </div>
                    <div className="tsb-work-date">
                      {w.startDate}{w.endDate ? ` – ${w.endDate}` : ""}
                    </div>
                  </div>
                  {w.highlights.length > 0 && (
                    <ul className="tsb-work-bullets">
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
            <div className="tsb-main-section">
              <h2 className="tsb-main-title">Education</h2>
              {education.map((edu, i) => {
                const gradDate = edu.endDate || edu.startDate || "";
                return (
                  <div key={i} className="tsb-edu-entry">
                    <div className="tsb-work-header">
                      <div>
                        <div className="tsb-work-position">{edu.studyType}{edu.area ? ` in ${edu.area}` : ""}</div>
                        <div className="tsb-work-company">{edu.institution}</div>
                        {edu.location && <div className="tsb-edu-score">{edu.location}</div>}
                      </div>
                      {gradDate && <div className="tsb-work-date">{gradDate}</div>}
                    </div>
                    {edu.score && <div className="tsb-edu-score">{edu.score}</div>}
                    {edu.highlights && edu.highlights.length > 0 && (
                      <ul className="tsb-work-bullets">
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
            <div className="tsb-main-section">
              <h2 className="tsb-main-title">Projects</h2>
              {projects.map((p, i) => {
                const projDates = p.startDate || p.endDate
                  ? [p.startDate, p.endDate].filter(Boolean).join(" – ")
                  : p.type || "";
                return (
                  <div key={i} className="tsb-work-entry">
                    <div className="tsb-work-header">
                      <div>
                        <div className="tsb-work-position">{p.name}</div>
                        {p.role && <div className="tsb-work-company">{p.role}</div>}
                        {p.entity && <div className="tsb-work-company">{p.entity}</div>}
                      </div>
                      {projDates && <div className="tsb-work-date">{projDates}</div>}
                    </div>
                    {p.description && (
                      <ul className="tsb-work-bullets">
                        {p.description.split("\n").filter(Boolean).map((line, j) => (
                          <li key={j}>{line.replace(/^-\s*/, "")}</li>
                        ))}
                      </ul>
                    )}
                    {p.highlights && p.highlights.length > 0 && (
                      <ul className="tsb-work-bullets">
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

const sidebarStyles = `
  .tsb-root {
    max-width: 816px;
    margin: 0 auto;
    background: #fff;
    color: #333;
    font-size: 10pt;
    line-height: 1.5;
  }

  .tsb-header {
    background: #4a5568;
    color: #fff;
    padding: 32px;
    text-align: center;
  }

  .tsb-name {
    font-size: 28pt;
    font-weight: 700;
    margin: 0 0 6px 0;
    letter-spacing: 1px;
  }

  .tsb-subtitle {
    font-size: 9.5pt;
    opacity: 0.85;
    margin: 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .tsb-body {
    display: grid;
    grid-template-columns: 260px 1fr;
  }

  .tsb-sidebar {
    background: #f7fafc;
    border-right: 1px solid #e2e8f0;
    padding: 20px;
  }

  .tsb-sidebar-section {
    margin-bottom: 20px;
  }

  .tsb-sidebar-title {
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #4a5568;
    margin: 0 0 10px 0;
    padding-bottom: 6px;
    border-bottom: 2px solid #4a5568;
  }

  .tsb-contact-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .tsb-contact-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 8.5pt;
    color: #4a5568;
    word-break: break-all;
  }

  .tsb-contact-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: #4a5568;
    color: #fff;
    border-radius: 50%;
    font-size: 8pt;
    font-weight: 700;
    flex-shrink: 0;
  }

  .tsb-link-icon {
    background: #2b6cb0;
  }

  .tsb-link-text {
    font-size: 8pt;
    color: #2b6cb0;
    line-height: 1.4;
  }

  .tsb-skill-group {
    margin-bottom: 10px;
  }

  .tsb-skill-cat {
    font-size: 8.5pt;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 4px;
  }

  .tsb-skill-list {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
  }

  .tsb-skill-tag {
    display: inline-block;
    padding: 1px 8px;
    background: #edf2f7;
    color: #4a5568;
    border-radius: 3px;
    font-size: 7.5pt;
    border: 1px solid #e2e8f0;
  }

  .tsb-award-item {
    margin-bottom: 6px;
  }

  .tsb-award-title {
    font-size: 8.5pt;
    font-weight: 600;
    color: #2d3748;
  }

  .tsb-award-detail {
    font-size: 8pt;
    color: #718096;
  }

  .tsb-main {
    padding: 20px 28px;
  }

  .tsb-main-section {
    margin-bottom: 18px;
  }

  .tsb-main-title {
    font-size: 12pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #2d3748;
    margin: 0 0 10px 0;
    padding-bottom: 4px;
    border-bottom: 2px solid #4a5568;
  }

  .tsb-profile-text {
    font-size: 9pt;
    color: #4a5568;
    line-height: 1.6;
    margin: 0;
  }

  .tsb-work-entry {
    margin-bottom: 14px;
  }

  .tsb-edu-entry {
    margin-bottom: 10px;
  }

  .tsb-work-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .tsb-work-position {
    font-size: 10pt;
    font-weight: 600;
    color: #1a202c;
  }

  .tsb-work-company {
    font-size: 9pt;
    color: #718096;
  }

  .tsb-work-date {
    font-size: 8.5pt;
    color: #a0aec0;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .tsb-work-bullets {
    margin: 4px 0 0 16px;
    padding: 0;
    list-style: disc;
  }

  .tsb-work-bullets li {
    font-size: 9pt;
    color: #4a5568;
    margin-bottom: 2px;
    line-height: 1.45;
  }

  .tsb-edu-score {
    font-size: 8.5pt;
    color: #a0aec0;
    margin-top: 2px;
  }
`;
