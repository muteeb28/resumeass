import React from 'react';
import ResumePage from '../ResumePage';
import { BulletList, ContactLine } from '../ResumeSections';
import type { NormalizedResume, RenderState } from '../resumeUtils';
import { ensureV2Format, getSortedSections } from '@/types/resume';
import type { ResumeSection } from '@/types/resume';

interface DynamicATSProps {
  content: NormalizedResume;
  renderState: RenderState;
}

/**
 * Dynamic ATS-Friendly Resume Template
 * - 95% ATS compatible: Simple layout, no columns, standard formatting
 * - Fully dynamic: Renders any section from the parsed resume
 * - Section-based rendering using layout types
 */
const DynamicATS: React.FC<DynamicATSProps> = ({ content, renderState }) => {
  const showHeader = renderState.pageIndex === undefined || renderState.pageIndex === 0;

  // Contact info check
  const hasContactInfo = Boolean(
    content.contact.email ||
    content.contact.phone ||
    content.contact.location ||
    content.contact.linkedin ||
    content.contact.github ||
    content.contact.website ||
    (content.contact.links && content.contact.links.length > 0)
  );

  // Render Header (Name + Contact)
  const renderHeader = () => (
    <div className="mb-6 pb-4 border-b-2 border-gray-800">
      {content.name && (
        <h1 className="text-3xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
          {content.name}
        </h1>
      )}
      {hasContactInfo && (
        <ContactLine
          items={[
            content.contact.email,
            content.contact.phone,
            content.contact.location,
            content.contact.linkedin,
            content.contact.github,
            content.contact.website,
            ...(content.contact.links || [])
          ]}
          className="flex flex-wrap gap-x-3 text-sm text-gray-700"
        />
      )}
    </div>
  );

  // Render Section Title
  const renderSectionTitle = (label: string) => (
    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-3 pb-1 border-b border-gray-400">
      {label}
    </h2>
  );

  // Render Timeline Item (Experience, Volunteer, etc.)
  const renderTimelineItem = (item: any, index: number) => {
    const bullets = item.bullets || [];
    const hasContent = item.title || item.organization || bullets.length > 0;

    if (!hasContent) return null;

    return (
      <div key={`timeline-${index}`} className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
          {item.title && (
            <h3 className="text-base font-bold text-gray-900">
              {item.title}
            </h3>
          )}
          {item.dates && (
            <span className="text-sm text-gray-600 font-medium">
              {item.dates}
            </span>
          )}
        </div>

        {item.organization && (
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-sm font-semibold text-gray-800">
              {item.organization}
            </p>
            {item.location && (
              <p className="text-sm text-gray-600 italic">
                {item.location}
              </p>
            )}
          </div>
        )}

        {item.description && !bullets.length && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {item.description}
          </p>
        )}

        {bullets.length > 0 && (
          <BulletList
            items={bullets}
            className="space-y-1 text-sm text-gray-700 leading-relaxed"
          />
        )}
      </div>
    );
  };

  // Render Education Item
  const renderEducationItem = (item: any, index: number) => {
    if (!item.school && !item.degree) return null;

    return (
      <div key={`education-${index}`} className="mb-3">
        <div className="flex justify-between items-baseline">
          <div>
            {item.degree && (
              <h3 className="text-base font-bold text-gray-900">
                {item.degree}
              </h3>
            )}
            {item.school && (
              <p className="text-sm font-semibold text-gray-800">
                {item.school}
              </p>
            )}
            {item.location && (
              <p className="text-sm text-gray-600">
                {item.location}
              </p>
            )}
          </div>
          <div className="text-right">
            {item.dates && (
              <p className="text-sm text-gray-600 font-medium">
                {item.dates}
              </p>
            )}
            {item.gpa && (
              <p className="text-sm text-gray-600">
                GPA: {item.gpa}
              </p>
            )}
          </div>
        </div>

        {item.details && item.details.length > 0 && (
          <BulletList
            items={item.details}
            className="mt-2 space-y-1 text-sm text-gray-700"
          />
        )}
      </div>
    );
  };

  // Render Project Item
  const renderProjectItem = (item: any, index: number) => {
    if (!item.name && !item.description) return null;

    return (
      <div key={`project-${index}`} className="mb-4">
        <div className="flex justify-between items-baseline mb-1">
          {item.name && (
            <h3 className="text-base font-bold text-gray-900">
              {item.name}
            </h3>
          )}
          {item.link && (
            <span className="text-sm text-gray-600">
              {item.link}
            </span>
          )}
        </div>

        {item.tech && item.tech.length > 0 && (
          <p className="text-sm text-gray-700 font-medium mb-1">
            <span className="font-semibold">Technologies:</span> {Array.isArray(item.tech) ? item.tech.join(', ') : item.tech}
          </p>
        )}

        {item.description && (
          <p className="text-sm text-gray-700 leading-relaxed mb-2">
            {item.description}
          </p>
        )}

        {item.bullets && item.bullets.length > 0 && (
          <BulletList
            items={item.bullets}
            className="space-y-1 text-sm text-gray-700"
          />
        )}
      </div>
    );
  };

  // Render List Item (Skills, Awards, etc.)
  const renderListItems = (items: any[]) => {
    // Group by category if present
    const categorized: Record<string, string[]> = {};
    const uncategorized: string[] = [];

    items.forEach(item => {
      const value = item.value || item;
      if (item.category) {
        if (!categorized[item.category]) {
          categorized[item.category] = [];
        }
        categorized[item.category].push(value);
      } else {
        uncategorized.push(value);
      }
    });

    return (
      <div className="space-y-2">
        {Object.entries(categorized).map(([category, values]) => (
          <div key={category}>
            <p className="text-sm font-semibold text-gray-800 mb-1">
              {category}:
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {values.join(' • ')}
            </p>
          </div>
        ))}

        {uncategorized.length > 0 && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {uncategorized.join(' • ')}
          </p>
        )}
      </div>
    );
  };

  // Render Certification Item
  const renderCertificationItem = (item: any, index: number) => {
    const name = typeof item === 'string' ? item : (item.name || item.title);
    if (!name) return null;

    const issuer = typeof item === 'object' && item !== null ? item.issuer : undefined;
    const date = typeof item === 'object' && item !== null ? item.date : undefined;

    return (
      <div key={`cert-${index}`} className="mb-2">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{name}</span>
          {issuer && <span className="text-gray-600"> - {issuer}</span>}
          {date && <span className="text-gray-600"> ({date})</span>}
        </p>
      </div>
    );
  };

  // Render Text Item
  const renderTextItem = (item: any) => {
    const content = item.content || item;
    return (
      <p className="text-sm text-gray-700 leading-relaxed mb-2">
        {content}
      </p>
    );
  };

  // Render Section based on layout type
  const renderSection = (section: ResumeSection) => {
    if (!section.visible || section.items.length === 0) return null;

    return (
      <div key={section.id} className="mb-6">
        {renderSectionTitle(section.label)}

        <div>
          {section.layout === 'timeline' && (
            <div>
              {section.items.map((item, index) => renderTimelineItem(item, index))}
            </div>
          )}

          {section.layout === 'education' && (
            <div>
              {section.items.map((item, index) => renderEducationItem(item, index))}
            </div>
          )}

          {section.layout === 'projects' && (
            <div>
              {section.items.map((item, index) => renderProjectItem(item, index))}
            </div>
          )}

          {section.layout === 'list' && (
            <div>
              {renderListItems(section.items)}
            </div>
          )}

          {section.layout === 'certifications' && (
            <div>
              {section.items.map((item, index) => renderCertificationItem(item, index))}
            </div>
          )}

          {section.layout === 'text' && (
            <div>
              {section.items.map((item, index) => (
                <div key={`text-${index}`}>{renderTextItem(item)}</div>
              ))}
            </div>
          )}

          {section.rawText && (
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {section.rawText}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Handle both v1 and v2 resume formats
  const renderDynamicSections = () => {
    // Try to convert to v2 format if needed
    const rawData = (content as any).resumeData || content;

    // Check if we have v2 format with sections
    if (rawData.version === 2 && rawData.sections) {
      const v2Resume = ensureV2Format(rawData);
      const sections = getSortedSections(v2Resume);
      return sections.map(section => renderSection(section));
    }

    // Fallback to v1 format rendering
    return (
      <>
        {/* Summary */}
        {content.summary && (
          <div className="mb-6">
            {renderSectionTitle('Professional Summary')}
            <p className="text-sm text-gray-700 leading-relaxed">
              {content.summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {content.skills && content.skills.length > 0 && (
          <div className="mb-6">
            {renderSectionTitle('Skills')}
            <p className="text-sm text-gray-700 leading-relaxed">
              {content.skills.join(' • ')}
            </p>
          </div>
        )}

        {/* Experience */}
        {content.experience && content.experience.length > 0 && (
          <div className="mb-6">
            {renderSectionTitle('Professional Experience')}
            {content.experience.map((exp, index) => {
              const description = Array.isArray(exp.description) ? exp.description : [];
              return (
                <div key={`exp-${index}`} className="mb-4">
                  <div className="flex justify-between items-baseline mb-1">
                    {exp.title && (
                      <h3 className="text-base font-bold text-gray-900">
                        {exp.title}
                      </h3>
                    )}
                    {(exp.dates || exp.duration) && (
                      <span className="text-sm text-gray-600 font-medium">
                        {exp.dates || exp.duration}
                      </span>
                    )}
                  </div>
                  {exp.company && (
                    <div className="flex justify-between items-baseline mb-2">
                      <p className="text-sm font-semibold text-gray-800">
                        {exp.company}
                      </p>
                      {exp.location && (
                        <p className="text-sm text-gray-600 italic">
                          {exp.location}
                        </p>
                      )}
                    </div>
                  )}
                  {description.length > 0 && (
                    <BulletList
                      items={description}
                      className="space-y-1 text-sm text-gray-700 leading-relaxed"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Education */}
        {content.education && content.education.length > 0 && (
          <div className="mb-6">
            {renderSectionTitle('Education')}
            {content.education.map((edu, index) => (
              <div key={`edu-${index}`} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <div>
                    {edu.degree && (
                      <h3 className="text-base font-bold text-gray-900">
                        {edu.degree}
                      </h3>
                    )}
                    {(edu.university || edu.institution) && (
                      <p className="text-sm font-semibold text-gray-800">
                        {edu.university || edu.institution}
                      </p>
                    )}
                    {edu.location && (
                      <p className="text-sm text-gray-600">
                        {edu.location}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {(edu.dates || edu.year) && (
                      <p className="text-sm text-gray-600 font-medium">
                        {edu.dates || edu.year}
                      </p>
                    )}
                    {edu.gpa && (
                      <p className="text-sm text-gray-600">
                        GPA: {edu.gpa}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {content.projects && content.projects.length > 0 && (
          <div className="mb-6">
            {renderSectionTitle('Projects')}
            {content.projects.map((project, index) => (
              <div key={`proj-${index}`} className="mb-4">
                {project.name && (
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {project.name}
                  </h3>
                )}
                {project.technologies && (
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    <span className="font-semibold">Technologies:</span> {Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}
                  </p>
                )}
                {project.description && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {content.certifications && content.certifications.length > 0 && (
          <div className="mb-6">
            {renderSectionTitle('Certifications')}
            {content.certifications.map((cert, index) => {
              const name = typeof cert === 'string' ? cert : (cert.name || cert.title);
              const issuer = typeof cert === 'object' && cert !== null ? (cert as any).issuer : undefined;
              const date = typeof cert === 'object' && cert !== null ? cert.date : undefined;
              return (
                <div key={`cert-${index}`} className="mb-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{name}</span>
                    {issuer && <span className="text-gray-600"> - {issuer}</span>}
                    {date && <span className="text-gray-600"> ({date})</span>}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  return (
    <ResumePage className="mx-auto max-w-[850px] shadow-lg">
      {showHeader && renderHeader()}
      {renderDynamicSections()}
    </ResumePage>
  );
};

export default DynamicATS;
