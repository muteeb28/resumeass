import React, { useEffect, useRef, useState, useCallback } from 'react';

// Page dimensions in pixels (96 DPI) - Letter size
const PAGE_WIDTH_PX = 8.5 * 96;
const PAGE_HEIGHT_PX = 11 * 96;
const PAGE_PADDING_PX = 0.5 * 96;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PAGE_PADDING_PX * 2;

interface PageContent {
  startIndex: number;
  endIndex: number;
}

const atsStyles = `
  .ats-template {
    font-family: Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.4;
    color: #000;
    background: transparent;
  }

  .ats-template * {
    box-sizing: border-box;
  }

  .ats-pages-container {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .ats-pages-container.print-mode {
    gap: 0;
  }

  .ats-page-wrapper {
    position: relative;
  }

  .ats-page-label {
    position: absolute;
    top: -24px;
    left: 0;
    font-size: 12px;
    color: #6b7280;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .ats-page {
    width: ${PAGE_WIDTH_PX}px;
    height: ${PAGE_HEIGHT_PX}px;
    padding: ${PAGE_PADDING_PX}px;
    background: white;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    box-sizing: border-box;
  }

  .ats-page.print-mode {
    box-shadow: none;
    height: auto;
    min-height: ${PAGE_HEIGHT_PX}px;
  }

  .ats-header {
    text-align: center;
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .ats-header-photo {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #000;
    margin-bottom: 4px;
  }

  .ats-header h1 {
    font-size: 24pt;
    font-weight: bold;
    letter-spacing: 0;
    text-transform: uppercase;
    margin: 0;
  }

  .ats-contact {
    font-size: 10pt;
    margin-top: 4px;
  }

  .ats-section {
    margin-bottom: 12px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .ats-section-title {
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

  .ats-entry {
    margin-bottom: 12px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .ats-entry:last-child {
    margin-bottom: 0;
  }

  .ats-entry-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .ats-entry-title {
    font-weight: bold;
    margin: 0;
    font-size: 11pt;
  }

  .ats-entry-date {
    font-size: 10pt;
  }

  .ats-entry-subheader {
    display: flex;
    justify-content: space-between;
    font-style: italic;
    font-size: 10pt;
  }

  .ats-entry-bullets {
    list-style-type: disc;
    margin: 4px 0 0 16px;
    padding-left: 0;
    font-size: 10pt;
  }

  .ats-entry-bullets li {
    margin-left: 16px;
    margin-bottom: 1px;
    page-break-inside: avoid;
    break-inside: avoid;
  }

  .ats-project-title {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .ats-project-tech {
    font-style: italic;
    font-size: 10pt;
    font-weight: normal;
  }

  .ats-project-link {
    font-size: 10pt;
    text-decoration: underline;
    color: black;
  }

  .ats-skills {
    font-size: 10pt;
  }

  .ats-skill-row {
    margin: 2px 0;
  }

  .ats-skill-category {
    font-weight: bold;
  }

  .ats-measure-container {
    position: absolute;
    opacity: 0;
    pointer-events: none;
    width: ${PAGE_WIDTH_PX - PAGE_PADDING_PX * 2}px;
    font-family: Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.4;
  }

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

    .ats-page-label {
      display: none !important;
    }

    .ats-measure-container {
      display: none !important;
    }

    .ats-pages-container {
      gap: 0 !important;
    }

    .ats-page {
      width: 8.5in !important;
      height: 11in !important;
      padding: 0.5in !important;
      box-shadow: none !important;
      page-break-after: always;
      break-after: page;
      overflow: visible !important;
    }

    .ats-page:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .ats-entry {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .ats-section {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .ats-entry-bullets li {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .ats-section-title {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
  }
`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ats-section">
      <h2 className="ats-section-title">{title}</h2>
      {children}
    </div>
  );
}

function buildHeaderSection(data: any): React.ReactNode {
  const { basics } = data;
  if (!basics) return null;

  const contactParts: React.ReactNode[] = [];

  if (basics.phone) {
    contactParts.push(<span key="phone">{basics.phone}</span>);
  }

  if (basics.email) {
    contactParts.push(<span key="email">{basics.email}</span>);
  }

  if (basics.location) {
    contactParts.push(<span key="location">{basics.location}</span>);
  }

  if (basics.links && Array.isArray(basics.links)) {
    basics.links.forEach((link: string, i: number) => {
      contactParts.push(<span key={`link-${i}`}>{link}</span>);
    });
  }

  return (
    <div key="header" className="ats-header">
      {basics.photo && (
        <img src={basics.photo} alt={basics.name} className="ats-header-photo" />
      )}
      <h1>{basics.name}</h1>
      {contactParts.length > 0 && (
        <p className="ats-contact">
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

function buildSectionTitleOnly(title: string, key: string): React.ReactNode {
  return (
    <div key={key} style={{ marginBottom: "4px" }}>
      <h2 className="ats-section-title">{title}</h2>
    </div>
  );
}

function buildTimelineEntry(item: any, index: number, sectionId: string): { key: string; content: React.ReactNode } {
  return {
    key: `${sectionId}-${index}`,
    content: (
      <div key={`${sectionId}-${index}`} className="ats-entry">
        <div className="ats-entry-header">
          <span className="ats-entry-title">{item.title || ''}</span>
          <span className="ats-entry-date">{item.dates || ''}</span>
        </div>
        <div className="ats-entry-subheader">
          <span>{item.organization || ''}</span>
          <span>{item.location || ''}</span>
        </div>
        {item.bullets && item.bullets.length > 0 && (
          <ul className="ats-entry-bullets">
            {item.bullets.map((bullet: string, j: number) => (
              <li key={j}>{bullet}</li>
            ))}
          </ul>
        )}
      </div>
    )
  };
}

function buildEducationEntry(item: any, index: number, sectionId: string): { key: string; content: React.ReactNode } {
  return {
    key: `${sectionId}-${index}`,
    content: (
      <div key={`${sectionId}-${index}`} className="ats-entry">
        <div className="ats-entry-header">
          <span style={{ fontWeight: "bold" }}>{item.school || ''}</span>
          <span>{item.location || ''}</span>
        </div>
        <div className="ats-entry-subheader">
          <span>
            {item.degree || ''}
            {item.gpa ? `, GPA: ${item.gpa}` : ''}
          </span>
          <span>{item.dates || ''}</span>
        </div>
        {item.details && item.details.length > 0 && (
          <ul className="ats-entry-bullets">
            {item.details.map((detail: string, j: number) => (
              <li key={j}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
    )
  };
}

function buildProjectEntry(item: any, index: number, sectionId: string): { key: string; content: React.ReactNode } {
  return {
    key: `${sectionId}-${index}`,
    content: (
      <div key={`${sectionId}-${index}`} className="ats-entry">
        <div className="ats-entry-header">
          <span className="ats-project-title">
            <span className="ats-entry-title">{item.name || ''}</span>
            {item.tech && item.tech.length > 0 && (
              <span className="ats-project-tech">
                {" "}| {item.tech.join(", ")}
              </span>
            )}
          </span>
          {item.link && (
            <a
              href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ats-project-link"
            >
              Link
            </a>
          )}
        </div>
        {item.description && (
          <div style={{ fontSize: "10pt", marginTop: "2px" }}>
            {item.description}
          </div>
        )}
        {item.bullets && item.bullets.length > 0 && (
          <ul className="ats-entry-bullets">
            {item.bullets.map((bullet: string, j: number) => (
              <li key={j}>{bullet}</li>
            ))}
          </ul>
        )}
      </div>
    )
  };
}

function buildSkillsSection(items: any[], sectionId: string): React.ReactNode | null {
  if (!items || items.length === 0) return null;

  const categories: Record<string, string[]> = {};
  const plain: string[] = [];

  items.forEach((item: any) => {
    const val = item.value || item;
    if (item.category) {
      if (!categories[item.category]) categories[item.category] = [];
      categories[item.category].push(val);
    } else {
      plain.push(val);
    }
  });

  return (
    <div key={sectionId} className="ats-skills">
      {Object.entries(categories).map(([cat, vals]) => (
        <p key={cat} className="ats-skill-row">
          <span className="ats-skill-category">{cat}:</span>{" "}
          {vals.join(", ")}
        </p>
      ))}
      {plain.length > 0 && <p className="ats-skill-row">{plain.join(", ")}</p>}
    </div>
  );
}

function buildCertificationsSection(items: any[], sectionId: string): React.ReactNode | null {
  if (!items || items.length === 0) return null;

  return (
    <div key={sectionId}>
      <ul className="ats-entry-bullets">
        {items.map((cert: any, i: number) => (
          <li key={i}>
            <strong>{cert.name}</strong>
            {cert.issuer && <span> - {cert.issuer}</span>}
            {cert.date && <span> ({cert.date})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function buildTextSection(items: any[], sectionId: string): React.ReactNode | null {
  if (!items || items.length === 0) return null;

  return (
    <div key={sectionId}>
      {items.map((item: any, i: number) => (
        <p key={i} style={{ margin: 0, fontSize: "10pt" }}>
          {item.content || item}
        </p>
      ))}
    </div>
  );
}

function buildSections(data: any): React.ReactNode[] {
  const sections: React.ReactNode[] = [];

  // Always start with header
  sections.push(buildHeaderSection(data));

  if (!data.sections) return sections;

  // Get all sections, sort by order
  const sectionsArray = Object.keys(data.sections)
    .map(k => ({ id: k, ...data.sections[k] }))
    .filter(s => s.visible !== false)
    .sort((a, b) => (a.order || 100) - (b.order || 100));

  for (const section of sectionsArray) {
    if (!section.items || section.items.length === 0) continue;

    switch (section.layout) {
      case 'timeline':
        sections.push(buildSectionTitleOnly(section.label, `${section.id}-title`));
        const timelineEntries = (section.items as any[]).map((item: any, i: number) => buildTimelineEntry(item, i, section.id));
        timelineEntries.forEach(entry => sections.push(entry.content));
        break;

      case 'education':
        sections.push(buildSectionTitleOnly(section.label, `${section.id}-title`));
        const eduEntries = (section.items as any[]).map((item: any, i: number) => buildEducationEntry(item, i, section.id));
        eduEntries.forEach(entry => sections.push(entry.content));
        break;

      case 'projects':
        sections.push(buildSectionTitleOnly(section.label, `${section.id}-title`));
        const projEntries = (section.items as any[]).map((item: any, i: number) => buildProjectEntry(item, i, section.id));
        projEntries.forEach(entry => sections.push(entry.content));
        break;

      case 'list':
        const skillsContent = buildSkillsSection(section.items, section.id);
        if (skillsContent) {
          sections.push(
            <Section key={section.id} title={section.label}>
              {skillsContent}
            </Section>
          );
        }
        break;

      case 'certifications':
        const certsContent = buildCertificationsSection(section.items, section.id);
        if (certsContent) {
          sections.push(
            <Section key={section.id} title={section.label}>
              {certsContent}
            </Section>
          );
        }
        break;

      case 'text':
        const textContent = buildTextSection(section.items, section.id);
        if (textContent) {
          sections.push(
            <Section key={section.id} title={section.label}>
              {textContent}
            </Section>
          );
        }
        break;

      default:
        console.warn(`Unknown layout: ${section.layout}`);
        break;
    }
  }

  return sections;
}

export default function ATSResumeRenderer({ data }: { data: any }) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageContent[]>([
    { startIndex: 0, endIndex: -1 },
  ]);

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
    const timeouts = [
      setTimeout(calculatePages, 50),
      setTimeout(calculatePages, 150),
      setTimeout(calculatePages, 300),
    ];

    return () => timeouts.forEach(clearTimeout);
  }, [calculatePages]);

  useEffect(() => {
    const timeoutId = setTimeout(calculatePages, 100);
    return () => clearTimeout(timeoutId);
  }, [data, calculatePages]);

  useEffect(() => {
    window.addEventListener("resize", calculatePages);
    return () => window.removeEventListener("resize", calculatePages);
  }, [calculatePages]);

  if (!data) return null;

  const allSections = buildSections(data);

  return (
    <div className="ats-template">
      <style>{atsStyles}</style>

      {/* Hidden measurement container */}
      <div ref={measureRef} className="ats-measure-container">
        {allSections.map((section, i) => (
          <div key={i} data-section>
            {section}
          </div>
        ))}
      </div>

      {/* Rendered pages */}
      <div className="ats-pages-container">
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className="ats-page-wrapper">
            {pages.length > 1 && (
              <div className="ats-page-label">
                Page {pageIndex + 1} of {pages.length}
              </div>
            )}
            <div className="ats-page">
              {allSections.slice(page.startIndex, page.endIndex + 1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
