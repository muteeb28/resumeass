"use client";

import type { ReactNode } from "react";
import type {
  ResumeSection,
  SectionItem,
  TimelineItem,
  ListItem,
  EducationItem,
  ProjectItem,
  CertificationItem,
  TextItem,
} from "@/types/resume";
import {
  isTimelineItem,
  isListItem,
  isEducationItem,
  isProjectItem,
  isCertificationItem,
  isTextItem,
} from "@/types/resume";

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

export const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3">
    <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-800">
      {label}
    </span>
    <span className="h-px flex-1 bg-slate-300" />
  </div>
);

export const TimelineList = ({
  items,
  renderItem,
}: {
  items: any[];
  renderItem: (item: any, index: number) => ReactNode;
}) => (
  <div className="relative border-l border-slate-300 pl-8 ml-2">
    {items.map((item, index) => (
      <div key={index} className="relative pb-6 last:pb-0">
        <span className="absolute -left-[37px] top-[4px] h-2.5 w-2.5 rounded-full border-2 border-slate-900 bg-white" />
        {renderItem(item, index)}
      </div>
    ))}
  </div>
);

export const BulletList = ({ bullets }: { bullets: string[] }) => (
  <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px] text-slate-800 ml-4 list-outside">
    {bullets.map((bullet, index) => (
      <li key={index}>{bullet}</li>
    ))}
  </ul>
);

// ============================================================================
// LAYOUT-SPECIFIC RENDERERS
// ============================================================================

const TimelineRenderer = ({ items }: { items: TimelineItem[] }) => (
  <div className="mt-2 space-y-4">
    {items.map((item, index) => (
      <div key={index} className="no-page-break">
        <div className="flex items-baseline justify-between gap-4">
          <div className="font-semibold text-slate-900">
            {item.organization || item.title}
          </div>
          {item.location && (
            <div className="text-[11px] uppercase text-slate-600">
              {item.location}
            </div>
          )}
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <div className="italic text-slate-800">{item.title}</div>
          {item.dates && (
            <div className="text-[11px] uppercase text-slate-600">
              {item.dates}
            </div>
          )}
        </div>
        {item.description && (
          <p className="mt-1 text-[12px] text-slate-700">{item.description}</p>
        )}
        {item.bullets && item.bullets.length > 0 && (
          <BulletList bullets={item.bullets} />
        )}
      </div>
    ))}
  </div>
);


const TimelineWithDotsRenderer = ({ items }: { items: TimelineItem[] }) => (
  <div className="mt-3">
    <TimelineList
      items={items}
      renderItem={(item: TimelineItem) => (
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-[12px] font-semibold text-slate-900">
              {item.title}
            </h3>
            {item.dates && (
              <span className="text-[11px] text-slate-500">{item.dates}</span>
            )}
          </div>
          <p className="text-[11px] text-slate-600">
            {item.organization}
            {item.location ? `, ${item.location}` : ""}
          </p>
          {item.description && (
            <p className="mt-1 text-[11px] text-slate-600">{item.description}</p>
          )}
          {item.bullets && item.bullets.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-slate-700">
              {item.bullets.map((bullet, bulletIndex) => (
                <li key={bulletIndex}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    />
  </div>
);

const ListRenderer = ({ items }: { items: ListItem[] }) => {
  // Group items by category if categories exist
  const grouped = items.reduce((acc, item) => {
    const category = item.category || "__uncategorized__";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item.value);
    return acc;
  }, {} as Record<string, string[]>);

  const categories = Object.keys(grouped);

  if (categories.length === 1 && categories[0] === "__uncategorized__") {
    // Flat list without categories
    return (
      <div className="mt-2 text-[12px] text-slate-800">
        {grouped["__uncategorized__"].join(", ")}
      </div>
    );
  }

  // Categorized list
  return (
    <div className="mt-2 space-y-1 text-[12px] text-slate-800">
      {categories
        .filter((cat) => cat !== "__uncategorized__")
        .map((category, index) => (
          <div key={index}>
            <span className="font-semibold">{category}:</span>{" "}
            {grouped[category].join(", ")}
          </div>
        ))}
      {grouped["__uncategorized__"]?.length > 0 && (
        <div>{grouped["__uncategorized__"].join(", ")}</div>
      )}
    </div>
  );
};

const EducationRenderer = ({ items }: { items: EducationItem[] }) => (
  <div className="mt-2 space-y-3 text-[12px] text-slate-800">
    {items.map((edu, index) => {
      const displayDates = edu.dates || (edu.endDate || edu.startDate
        ? [edu.startDate, edu.endDate].filter(Boolean).join(" – ")
        : undefined);
      return (
        <div key={index} className="mb-1.5 last:mb-0">
          <div className="flex items-baseline justify-between gap-4">
            <div className="font-semibold text-slate-900">{edu.school}</div>
            {displayDates && (
              <div className="text-[11px] uppercase text-slate-900 font-bold">
                {displayDates}
              </div>
            )}
          </div>
          {(edu.degree || edu.location) && (
            <div className="flex items-baseline justify-between gap-4">
              <div className="italic text-slate-800">{edu.degree}</div>
              {edu.location && (
                <div className="text-[11px] uppercase text-slate-600">
                  {edu.location}
                </div>
              )}
            </div>
          )}
          {(edu.gpa || (edu.details && edu.details.length > 0)) && (
            <p className="mt-0.5 text-[11px] text-slate-600">
              {[edu.gpa ? `GPA: ${edu.gpa}` : "", ...(edu.details || [])]
                .filter(Boolean)
                .join(" | ")}
            </p>
          )}
          {edu.highlights && edu.highlights.length > 0 && (
            <ul className="mt-1 list-disc space-y-1 pl-5 text-[12px] text-slate-800 ml-4 list-outside">
              {edu.highlights.map((h, j) => (
                <li key={j}>{h}</li>
              ))}
            </ul>
          )}
        </div>
      );
    })}
  </div>
);

const ProjectsRenderer = ({ items }: { items: ProjectItem[] }) => (
  <div className="mt-2 space-y-3">
    {items.map((project, index) => {
      const displayDates = project.startDate || project.endDate
        ? [project.startDate, project.endDate].filter(Boolean).join(" – ")
        : undefined;
      const allBullets = [
        ...(project.bullets || []),
        ...(project.highlights || []),
      ];
      return (
        <div key={index}>
          <div className="flex items-baseline justify-between gap-4">
            <div className="font-semibold text-slate-900">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {project.name}
                </a>
              ) : (
                project.name
              )}
            </div>
            {displayDates && (
              <div className="text-[11px] uppercase text-slate-600">
                {displayDates}
              </div>
            )}
          </div>
          {project.role && (
            <div className="italic text-slate-800 text-[12px]">{project.role}</div>
          )}
          {project.description && (
            <p className="text-[12px] text-slate-800">{project.description}</p>
          )}
          {allBullets.length > 0 && (
            <BulletList bullets={allBullets} />
          )}
          {project.tech && project.tech.length > 0 && (
            <p className="mt-1 text-[11px] text-slate-600">
              Tech: {project.tech.join(", ")}
            </p>
          )}
        </div>
      );
    })}
  </div>
);

const CertificationsRenderer = ({ items }: { items: CertificationItem[] }) => (
  <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-slate-800">
    {items.map((cert, index) => (
      <li key={index}>
        {cert.name}
        {cert.issuer ? ` - ${cert.issuer}` : ""}
        {cert.date ? ` (${cert.date})` : ""}
      </li>
    ))}
  </ul>
);

const TextRenderer = ({ items }: { items: TextItem[] }) => (
  <div className="mt-2 text-[12px] leading-5 text-slate-800">
    {items.map((item, index) => (
      <p key={index} className="whitespace-pre-line">
        {item.content}
      </p>
    ))}
  </div>
);

const RawTextFallback = ({ rawText }: { rawText: string }) => (
  <p className="mt-2 whitespace-pre-line text-[12px] text-slate-800 font-medium">
    {rawText}
  </p>
);

// ============================================================================
// ITEM FILTERS
// ============================================================================

const filterItemsByType = <T extends SectionItem>(
  items: SectionItem[],
  guard: (item: SectionItem) => item is T
): T[] => items.filter(guard);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export type GenericSectionVariant = "classic" | "split";

export interface GenericSectionProps {
  section: ResumeSection;
  variant?: GenericSectionVariant;
  showHeader?: boolean;
  className?: string;
}

export default function GenericSection({
  section,
  variant = "classic",
  showHeader = true,
  className = "",
}: GenericSectionProps) {
  const { label, layout, items, rawText, visible } = section;

  // Don't render if not visible
  if (!visible) {
    console.log(`GenericSection [${label}] hidden because visible=false`);
    return null;
  }

  // Check if we have any items to render
  const hasItems = items && items.length > 0;
  const hasRawText = rawText && rawText.trim().length > 0;

  // Don't render if no content
  if (!hasItems && !hasRawText) {
    return null;
  }

  const renderContent = () => {
    console.log(`[GenericSection] Rendering ${label} (ID: ${section.id}), layout: ${layout}, items: ${items?.length || 0}, rawText: ${!!rawText}`);

    // If no structured items, fall back to raw text
    if (!hasItems) {
      return <RawTextFallback rawText={rawText!} />;
    }

    // Render based on layout type
    switch (layout) {
      case "timeline": {
        const timelineItems = filterItemsByType(items, isTimelineItem);
        if (timelineItems.length === 0) {
          return hasRawText ? <RawTextFallback rawText={rawText!} /> : null;
        }
        return variant === "split" ? (
          <TimelineWithDotsRenderer items={timelineItems} />
        ) : (
          <TimelineRenderer items={timelineItems} />
        );
      }

      case "list": {
        const listItems = filterItemsByType(items, isListItem);
        if (listItems.length === 0) {
          return hasRawText ? <RawTextFallback rawText={rawText!} /> : null;
        }
        return <ListRenderer items={listItems} />;
      }

      case "education": {
        const eduItems = filterItemsByType(items, isEducationItem);
        if (eduItems.length === 0) {
          return hasRawText ? <RawTextFallback rawText={rawText!} /> : null;
        }
        return <EducationRenderer items={eduItems} />;
      }

      case "projects": {
        const projectItems = filterItemsByType(items, isProjectItem);
        if (projectItems.length === 0) {
          return hasRawText ? <RawTextFallback rawText={rawText!} /> : null;
        }
        return <ProjectsRenderer items={projectItems} />;
      }

      case "certifications": {
        const certItems = filterItemsByType(items, isCertificationItem);
        if (certItems.length === 0) {
          return hasRawText ? <RawTextFallback rawText={rawText!} /> : null;
        }
        return <CertificationsRenderer items={certItems} />;
      }

      case "text": {
        const textItems = filterItemsByType(items, isTextItem);
        if (textItems.length === 0) {
          return hasRawText ? <RawTextFallback rawText={rawText!} /> : null;
        }
        return <TextRenderer items={textItems} />;
      }

      default:
        // Unknown layout, try to render raw text
        return hasRawText ? <RawTextFallback rawText={rawText!} /> : null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <div className={className}>
      {showHeader && <SectionHeader label={label} />}
      {content}
    </div>
  );
}

// ============================================================================
// EXPORTS FOR CUSTOM USAGE
// ============================================================================

export {
  TimelineRenderer,
  TimelineWithDotsRenderer,
  ListRenderer,
  EducationRenderer,
  ProjectsRenderer,
  CertificationsRenderer,
  TextRenderer,
  RawTextFallback,
  filterItemsByType,
};
