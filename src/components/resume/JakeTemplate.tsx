/**
 * Jake's Resume Template - Copied EXACTLY from portfolioly
 *
 * A classic ATS-friendly resume template inspired by Jake Ryan's design.
 * Features Computer Modern Serif font, clean layout, and proper multi-page support
 * with visual page separation in preview mode.
 */

"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import type { ResumeData, SectionType } from "@/types/portfolioly-resume";
import {
  renderHighlight,
} from "./template-utils";

// Page dimensions in pixels (96 DPI) - Letter size
const PAGE_WIDTH_PX = 8.5 * 96;
const PAGE_HEIGHT_PX = 11 * 96;
const PAGE_PADDING_PX = 0.5 * 96;
// Extra buffer prevents content from being clipped when measurement is slightly off
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PAGE_PADDING_PX * 2 - 36;

interface PageContent {
  startIndex: number;
  endIndex: number;
}

export interface JakeTemplateProps {
  data: ResumeData;
  sectionOrder?: SectionType[];
  isPrintMode?: boolean;
}

/**
 * Get display text for a project link
 * If GitHub URL, return "GitHub", otherwise return titlecase domain
 */


/**
 * Load Computer Modern Serif font via link element
 */
function ensureFontLoaded(): void {
  if (typeof document === "undefined") return;

  const fontId = "jake-template-cm-serif-font";
  if (document.getElementById(fontId)) return;

  const style = document.createElement("style");
  style.id = fontId;
  style.textContent = `@import url('https://cdn.jsdelivr.net/gh/aaaakshat/cm-web-fonts@latest/fonts.css');`;
  document.head.appendChild(style);
}

/**
 * Get URL for a profile
 */


/**
 * Jake's template styles - embedded for self-contained rendering
 */
const jakeStyles = `
  .jake-template {
    font-family: "Computer Modern Serif", "Times New Roman", Georgia, serif;
    font-size: 11pt;
    line-height: 1.4;
    color: #000;
    background: transparent;
  }

  .jake-template * {
    box-sizing: border-box;
  }

  .jake-pages-container {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .jake-pages-container.print-mode {
    gap: 0;
  }

  .jake-page-wrapper {
    position: relative;
  }

  .jake-page-label {
    position: absolute;
    top: -24px;
    left: 0;
    font-size: 12px;
    color: #6b7280;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .jake-page {
    width: ${PAGE_WIDTH_PX}px;
    height: ${PAGE_HEIGHT_PX}px;
    padding: ${PAGE_PADDING_PX}px;
    background: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    box-sizing: border-box;
  }

  .jake-page.print-mode {
    box-shadow: none;
    height: auto;
    min-height: ${PAGE_HEIGHT_PX}px;
  }

  .jake-header {
    text-align: center;
    margin-bottom: 12px;
  }

  .jake-header h1 {
    font-size: 24pt;
    font-weight: bold;
    letter-spacing: 0;
    text-transform: uppercase;
    margin: 0;
  }

  .jake-headline {
    font-size: 11pt;
    font-weight: 400;
    margin: 2px 0 0 0;
    color: #444;
    letter-spacing: 0.3px;
  }

  .jake-contact {
    font-size: 10pt;
    margin-top: 4px;
  }

  .jake-contact a {
    text-decoration: underline;
    color: black;
  }

  .jake-contact a:hover {
    color: #333;
  }

  .jake-proj-links {
    display: inline-flex;
    gap: 4px;
    margin-left: 8px;
    vertical-align: middle;
  }

  .jake-proj-link-btn {
    display: inline-flex;
    align-items: center;
    font-size: 8pt;
    font-weight: 600;
    padding: 1px 6px;
    border: 1px solid #555;
    border-radius: 3px;
    color: #333 !important;
    text-decoration: none !important;
    background: #f5f5f5;
    transition: background 0.15s;
  }

  .jake-proj-link-btn:hover {
    background: #e0e0e0;
    color: #000 !important;
  }

  .jake-section {
    margin-bottom: 12px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .jake-section-title {
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0;
    border-bottom: 1px solid black;
    padding-bottom: 2px;
    margin: 0 0 8px 0;
    page-break-after: avoid;
    break-after: avoid;
  }

  .jake-entry {
    margin-bottom: 12px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .jake-entry:last-child {
    margin-bottom: 0;
  }

  .jake-entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .jake-entry-title {
    font-weight: bold;
    margin: 0;
    font-size: 11pt;
  }

  .jake-entry-date {
    font-size: 10pt;
  }

  .jake-entry-subheader {
    display: flex;
    justify-content: space-between;
    font-style: italic;
    font-size: 10pt;
  }

  .jake-entry-bullets {
    list-style-type: disc;
    margin: 4px 0 0 16px;
    padding-left: 0;
    font-size: 10pt;
  }

  .jake-entry-bullets li {
    margin-left: 16px;
    margin-bottom: 1px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .jake-project-title {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .jake-project-tech {
    font-style: italic;
    font-size: 10pt;
    font-weight: normal;
  }

  .jake-project-link {
    font-size: 10pt;
    text-decoration: underline;
    color: black;
  }

  .jake-project-link:hover {
    color: #333;
  }

  .jake-skills {
    font-size: 10pt;
  }

  .jake-skill-row {
    margin: 2px 0;
  }

  .jake-skill-category {
    font-weight: bold;
  }

  /* Hidden measurement container */
  .jake-measure-container {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: ${PAGE_WIDTH_PX - PAGE_PADDING_PX * 2}px;
    font-family: "Computer Modern Serif", "Times New Roman", serif;
    font-size: 11pt;
    line-height: 1.4;
  }

  /* Print styles - critical for proper PDF export */
  @media print {
    @page {
      size: letter;
      margin: 0 !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background: white !important;
    }

    .jake-page-label {
      display: none !important;
    }

    .jake-measure-container {
      display: none !important;
    }

    .jake-pages-container {
      gap: 0 !important;
    }

    .jake-page {
      width: 8.5in !important;
      height: 11in !important;
      padding: 0.5in !important;
      box-shadow: none !important;
      page-break-after: always;
      break-after: page;
      overflow: visible !important;
    }

    .jake-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .jake-contact a,
    .jake-project-link {
      text-decoration: none !important;
    }

    .jake-entry {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .jake-section {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .jake-entry-bullets li {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .jake-section-title {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
  }
`;

/**
 * Section component for consistent styling
 */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="jake-section">
      <h2 className="jake-section-title">{title}</h2>
      {children}
    </div>
  );
}

/**
 * Build header section
 */
function buildHeaderSection(data: ResumeData): React.ReactNode {
  const { basics } = data;
  const contactParts: React.ReactNode[] = [];

  if (basics?.phone) {
    contactParts.push(<span key="phone">{basics.phone}</span>);
  }

  if (basics?.email) {
    contactParts.push(
      <span key="email">
        <a href={`mailto:${basics.email}`}>{basics.email}</a>
      </span>
    );
  }

  // Profile links
  if (basics?.profiles && basics.profiles.length > 0) {
    for (const profile of basics.profiles) {
      if (profile.url) {
        contactParts.push(
          <span key={profile.network}>
            <a
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {profile.network}
            </a>
          </span>
        );
      }
    }
  }

  return (
    <div key="header" className="jake-header">
      {basics?.photo && (
        <img
          src={basics.photo}
          alt={basics.name || "Profile"}
          style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px" }}
        />
      )}
      <h1>{basics?.name}</h1>
      {basics?.headline && (
        <p className="jake-headline">{basics.headline}</p>
      )}
      {contactParts.length > 0 && (
        <p className="jake-contact">
          {contactParts.map((part, i) => (
            <React.Fragment key={i}>
              {part}
              {i < contactParts.length - 1 && " | "}
            </React.Fragment>
          ))}
        </p>
      )}
    </div>
  );
}

/**
 * Build education section
 */
function buildEducationSection(data: ResumeData): React.ReactNode | null {
  if (!data?.education || data.education.length === 0) return null;

  return (
    <Section key="education" title="Education">
      {data.education.map((edu, i) => {
        const dateStr = edu.startDate && edu.endDate
          ? `${edu.startDate} – ${edu.endDate}`
          : edu.startDate || edu.endDate || "";
        const locationDate = [dateStr, edu.location].filter(Boolean).join(" | ");
        const allHighlights = [
          ...(edu.score ? [edu.score] : []),
          ...(edu.highlights || []),
        ];
        return (
          <div key={`edu-${i}`} style={{ marginBottom: "4px" }}>
            <div className="jake-entry-header">
              <span style={{ fontWeight: "bold" }}>{edu.institution}</span>
              <span style={{ fontSize: "10pt" }}>{locationDate}</span>
            </div>
            <div className="jake-entry-subheader">
              <span>
                {edu.studyType && edu.studyType !== "Degree" ? edu.studyType + " in " : ""}
                {edu.area}
              </span>
            </div>
            {allHighlights.length > 0 && (
              <ul className="jake-entry-bullets">
                {allHighlights.map((h, j) => (
                  <li key={j}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </Section>
  );
}

/**
 * Build experience section title
 */
function buildExperienceTitleSection(): React.ReactNode {
  return (
    <div key="experience-title" style={{ marginBottom: "4px" }}>
      <h2 className="jake-section-title">Experience</h2>
    </div>
  );
}

/**
 * Build individual experience entries
 */
function buildExperienceEntries(
  data: ResumeData
): { key: string; content: React.ReactNode }[] {
  if (!data?.work || data.work.length === 0) return [];

  return data.work.map((work, i) => ({
    key: `work-${i}`,
    content: (
      <div key={`work-${i}`} className="jake-entry">
        <div className="jake-entry-header">
          <span className="jake-entry-title">{work.position}</span>
          <span className="jake-entry-date">
            {work.startDate && work.endDate ? `${work.startDate} – ${work.endDate}` : work.startDate || work.endDate || ""}
          </span>
        </div>
        <div className="jake-entry-subheader">
          <span>{work.company}</span>
          <span></span>
        </div>
        {work.highlights && work.highlights.filter((h: string) => h.trim()).length > 0 && (
          <ul className="jake-entry-bullets">
            {work.highlights.filter((h: string) => h.trim()).map((bullet: string, j: number) => (
              <li key={j}>{renderHighlight(bullet)}</li>
            ))}
          </ul>
        )}
      </div>
    ),
  }));
}

/**
 * Build projects section title
 */
function buildProjectsTitleSection(): React.ReactNode {
  return (
    <div key="projects-title" style={{ marginBottom: "4px" }}>
      <h2 className="jake-section-title">Projects</h2>
    </div>
  );
}

/**
 * Build individual project entries
 */
function buildProjectEntries(
  data: ResumeData
): { key: string; content: React.ReactNode }[] {
  if (!data?.projects || data.projects.length === 0) return [];

  return data.projects.map((proj, i) => {
    const dateStr = proj.startDate && proj.endDate
      ? `${proj.startDate} – ${proj.endDate}`
      : proj.startDate || proj.endDate || "";
    const rightLabel = [dateStr, proj.role].filter(Boolean).join(" | ");
    return {
      key: `proj-${i}`,
      content: (
        <div key={`proj-${i}`} className="jake-entry">
          <div className="jake-entry-header">
            <span className="jake-project-title">
              <span className="jake-entry-title">{proj.name}</span>
              {(proj.liveUrl || proj.sourceUrl) && (
                <span className="jake-proj-links">
                  {proj.liveUrl && (
                    <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="jake-proj-link-btn">
                      Website
                    </a>
                  )}
                  {proj.sourceUrl && (
                    <a href={proj.sourceUrl} target="_blank" rel="noopener noreferrer" className="jake-proj-link-btn">
                      Source
                    </a>
                  )}
                </span>
              )}
            </span>
            <span style={{ fontSize: "10pt" }}>{rightLabel}</span>
          </div>
          {proj.description && (
            <p style={{ margin: "4px 0 0 0", fontSize: "10pt" }}>{proj.description}</p>
          )}
          {proj.highlights && proj.highlights.filter((h: string) => h.trim()).length > 0 && (
            <ul className="jake-entry-bullets">
              {proj.highlights.filter((h: string) => h.trim()).map((bullet: string, j: number) => (
                <li key={j}>{renderHighlight(bullet)}</li>
              ))}
            </ul>
          )}
        </div>
      ),
    };
  });
}

/**
 * Build skills section
 */
function buildSkillsSection(data: ResumeData): React.ReactNode | null {
  if (!data?.skills || data.skills.length === 0) return null;

  return (
    <Section key="skills" title="Technical Skills">
      <div className="jake-skills">
        {data.skills.map((skill, i) => (
          <p key={i} className="jake-skill-row">
            <span className="jake-skill-category">{skill.name}:</span>{" "}
            {skill.keywords.filter(item => item.trim()).join(", ")}
          </p>
        ))}
      </div>
    </Section>
  );
}

/**
 * Build awards section
 */
function buildAwardsSection(data: ResumeData): React.ReactNode | null {
  if (!data?.awards || data.awards.length === 0) return null;

  return (
    <Section key="awards" title="Achievements">
      <ul className="jake-entry-bullets">
        {data.awards.map((award, i) => (
          <li key={i}>
            <strong>{award.title}</strong>
            {award.awarder && <span> - {award.awarder}</span>}
            {award.date && <span> ({award.date})</span>}
            {award.summary && <p style={{ margin: 0 }}>{award.summary}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}

/**
 * Build coursework section
 */
function buildCourseworkSection(data: ResumeData): React.ReactNode | null {
  if (!data?.coursework || data.coursework.length === 0) return null;

  return (
    <Section key="coursework" title="Coursework">
      <ul className="jake-entry-bullets">
        {data.coursework.map((course, i) => (
          <li key={i}>{course}</li>
        ))}
      </ul>
    </Section>
  );
}

/**
 * Build volunteer section
 */
/**
 * Build extra/catch-all sections (Certifications, Interests, Languages, etc.)
 */
function buildExtraSections(data: ResumeData): React.ReactNode[] {
  if (!data?.extraSections || data.extraSections.length === 0) return [];
  return data.extraSections.map((section, idx) => (
    <Section key={`extra-${idx}`} title={section.title}>
      <p style={{ margin: 0, fontSize: "10pt", lineHeight: "1.4" }}>
        {section.items.join(" • ")}
      </p>
    </Section>
  ));
}

function buildVolunteerSection(data: ResumeData): React.ReactNode | null {
  if (!data?.volunteer || data.volunteer.length === 0) return null;

  return (
    <Section key="volunteer" title="Volunteering">
      {data.volunteer.map((item, i) => (
        <div key={`vol-${i}`} className="jake-entry">
          <div className="jake-entry-header">
            <span className="jake-entry-title">{item.position}</span>
            <span className="jake-entry-date">
              {item.startDate && item.endDate ? `${item.startDate} – ${item.endDate}` : item.startDate || item.endDate || ""}
            </span>
          </div>
          <div className="jake-entry-subheader">
            <span>{item.organization}</span>
          </div>
          {item.summary && <p style={{ margin: "4px 0 0 0", fontSize: "10pt" }}>{item.summary}</p>}
          {item.highlights && item.highlights.length > 0 && (
            <ul className="jake-entry-bullets">
              {item.highlights.map((bullet, j) => (
                <li key={j}>{renderHighlight(bullet)}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </Section>
  );
}

/**
 * Build all sections based on section order
 */
function buildSections(
  data: ResumeData,
  sectionOrder: SectionType[] = ["basics", "work", "skills", "projects", "education", "awards", "volunteer"]
): React.ReactNode[] {
  const sections: React.ReactNode[] = [];

  // Always start with header
  sections.push(buildHeaderSection(data));

  // Process sections based on order
  for (const sectionType of sectionOrder) {
    switch (sectionType) {
      case "basics":
        // Header already added; render summary if present
        if (data?.basics?.summary) {
          sections.push(
            <Section key="summary" title="Summary">
              <p style={{ margin: 0, fontSize: "10pt", lineHeight: 1.6 }}>{data.basics.summary}</p>
            </Section>
          );
        }
        break;

      case "education":
        const education = buildEducationSection(data);
        if (education) sections.push(education);
        break;

      case "work":
        if (data?.work && data.work.length > 0) {
          sections.push(buildExperienceTitleSection());
          const expEntries = buildExperienceEntries(data);
          expEntries.forEach((entry) => sections.push(entry.content));
        }
        break;

      case "projects":
        if (data?.projects && data.projects.length > 0) {
          sections.push(buildProjectsTitleSection());
          const projEntries = buildProjectEntries(data);
          projEntries.forEach((entry) => sections.push(entry.content));
        }
        break;

      case "skills":
        const skills = buildSkillsSection(data);
        if (skills) sections.push(skills);
        break;

      case "awards":
        const awards = buildAwardsSection(data);
        if (awards) sections.push(awards);
        const coursework = buildCourseworkSection(data);
        if (coursework) sections.push(coursework);
        break;

      case "volunteer":
        const volunteer = buildVolunteerSection(data);
        if (volunteer) sections.push(volunteer);
        break;
    }
  }

  // Append extraSections after all standard sections
  const extraNodes = buildExtraSections(data);
  extraNodes.forEach((node) => sections.push(node));

  return sections;
}


/**
 * Jake's Resume Template Component
 */
export function JakeTemplate({
  data,
  sectionOrder,
  isPrintMode = false,
}: JakeTemplateProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageContent[]>([
    { startIndex: 0, endIndex: -1 },
  ]);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Load the font
  useEffect(() => {
    ensureFontLoaded();

    if (typeof document !== "undefined" && "fonts" in document) {
      (document as any).fonts.ready.then(() => {
        setFontLoaded(true);
      });
    } else {
      setTimeout(() => setFontLoaded(true), 500);
    }
  }, []);

  const calculatePages = useCallback(() => {
    if (!measureRef.current) return;

    const sections = measureRef.current.querySelectorAll("[data-section]");
    const sectionHeights: number[] = [];

    sections.forEach((section) => {
      sectionHeights.push((section as HTMLElement).offsetHeight);
    });

    const newPages: PageContent[] = [];
    let currentPageHeight = 0;
    let currentPageStart = 0;

    sectionHeights.forEach((height, index) => {
      if (currentPageHeight + height > CONTENT_HEIGHT_PX && currentPageHeight > 0) {
        newPages.push({ startIndex: currentPageStart, endIndex: index - 1 });
        currentPageStart = index;
        currentPageHeight = height;
      } else {
        currentPageHeight += height;
      }
    });

    newPages.push({
      startIndex: currentPageStart,
      endIndex: sectionHeights.length - 1,
    });

    setPages(newPages);
  }, []);

  useEffect(() => {
    if (!fontLoaded) return;

    const timeouts = [
      setTimeout(calculatePages, 50),
      setTimeout(calculatePages, 150),
      setTimeout(calculatePages, 300),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [fontLoaded, calculatePages]);

  useEffect(() => {
    if (!fontLoaded) return;

    const timeoutId = setTimeout(calculatePages, 100);
    return () => clearTimeout(timeoutId);
  }, [data, sectionOrder, fontLoaded, calculatePages]);

  useEffect(() => {
    window.addEventListener("resize", calculatePages);
    return () => window.removeEventListener("resize", calculatePages);
  }, [calculatePages]);

  const effectiveSectionOrder = sectionOrder || [
    "basics",
    "work",
    "skills",
    "projects",
    "education",
    "awards",
    "volunteer",
  ];

  // Debug: Log what data the template is receiving
  console.log("JakeTemplate received data:", {
    name: data.basics?.name,
    work_count: data.work?.length || 0,
    education_count: data.education?.length || 0,
    projects_count: data.projects?.length || 0,
    skills_count: data.skills?.length || 0,
    awards_count: data.awards?.length || 0,
    volunteer_count: data.volunteer?.length || 0,
  });

  const allSections = buildSections(data, effectiveSectionOrder);

  return (
    <div className={`jake-template ${isPrintMode ? "print-mode" : ""}`}>
      <style>{jakeStyles}</style>

      {/* Hidden measurement container */}
      <div ref={measureRef} className="jake-measure-container">
        {allSections.map((section, i) => (
          <div key={i} data-section>
            {section}
          </div>
        ))}
      </div>

      {/* Rendered pages */}
      <div className={`jake-pages-container ${isPrintMode ? "print-mode" : ""}`}>
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="jake-page-wrapper">
            {!isPrintMode && pages.length > 1 && (
              <div className="jake-page-label">
                Page {pageIndex + 1} of {pages.length}
              </div>
            )}
            <div className={`jake-page ${isPrintMode ? "print-mode" : ""}`}>
              {allSections.slice(page.startIndex, page.endIndex + 1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JakeTemplate;
