import React from 'react';
import ResumePage from '../ResumePage';
import { BulletList, ContactLine, SectionTitle } from '../ResumeSections';
import { CONTACT_LABELS, SECTION_TITLES } from '../resumeConfig';
import type { NormalizedResume, RenderState } from '../resumeUtils';

interface ConciseClassicProps {
  content: NormalizedResume;
  renderState: RenderState;
}

const MinimalistAts: React.FC<ConciseClassicProps> = ({ content, renderState }) => {
  const titles = SECTION_TITLES.conciseClassic;
  const variant = 'single';
  const showHeader = renderState.pageIndex === undefined || renderState.pageIndex === 0;
  const hasContactInfo = Boolean(
    content.contact.email ||
    content.contact.phone ||
    content.contact.location ||
    content.contact.linkedin ||
    content.contact.github ||
    content.contact.website ||
    (content.contact.links && content.contact.links.length > 0)
  );
  const hasHeaderContent = Boolean(content.name || hasContactInfo);
  const shouldShowHeader = showHeader && hasHeaderContent;

  const renderHeader = () => (
    <div className="border-b-2 border-gray-900 pb-4 mb-6">
      {content.name && (
        <h1 className="text-3xl font-bold text-gray-900 mb-1 tracking-tight">
          {content.name}
        </h1>
      )}
      {hasContactInfo && (
        <ContactLine
          items={[
            content.contact.email,
            content.contact.phone,
            content.contact.location,
            content.contact.linkedin && `${CONTACT_LABELS.linkedin}: ${content.contact.linkedin} `,
            content.contact.github && `${CONTACT_LABELS.github}: ${content.contact.github} `,
            content.contact.website && `${CONTACT_LABELS.website}: ${content.contact.website} `,
            ...(content.contact.links || [])
          ]}
          className="flex flex-wrap gap-x-4 text-sm text-gray-700 font-medium"
        />
      )}
    </div>
  );

  const renderSummary = () => (
    content.summary ? (
      <div className="mb-6">
        <SectionTitle
          label={titles.summary}
          variant="lined"
          className="text-lg font-bold text-gray-900 uppercase tracking-wider"
        />
        <p className="text-gray-800 leading-relaxed text-sm mt-2">
          {content.summary}
        </p>
      </div>
    ) : null
  );

  const renderSkills = () => (
    content.skills.length > 0 ? (
      <div className="mb-6">
        <SectionTitle
          label={variant === 'single' ? titles.skills : titles.coreSkills}
          variant="lined"
          className="text-lg font-bold text-gray-900 uppercase tracking-wider"
        />
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {content.skills.map((skill, index) => (
            <span key={`${skill}-${index}`} className="text-gray-800 text-sm font-semibold flex items-center">
              <span className="text-gray-400 mr-2">•</span>
              {skill}
            </span>
          ))}
        </div>
      </div>
    ) : null
  );

  const renderExperience = () => (
    content.experience.length > 0 ? (
      <div className="mb-6">
        <SectionTitle
          label={variant === 'single' ? titles.experience : titles.professionalExperience}
          variant="lined"
          className="text-lg font-bold text-gray-900 uppercase tracking-wider"
        />
        <div className="space-y-6 mt-3">
          {content.experience.map((exp, index) => {
            const description = Array.isArray(exp.description) ? exp.description : [];
            const dateValue = exp.dates || exp.duration;
            const hasTitle = Boolean(exp.title);
            const hasDates = Boolean(dateValue);
            const hasCompany = Boolean(exp.company);
            const hasLocation = Boolean(exp.location);
            return (
              <div key={`${exp.title}-${index}`} className="no-page-break">
                {(hasTitle || hasDates) && (
                  <div className="flex justify-between items-baseline mb-1">
                    {hasTitle && (
                      <h3 className="text-base font-bold text-gray-900 lowercase first-letter:uppercase">
                        {exp.title}
                      </h3>
                    )}
                    {hasDates && (
                      <span className="text-sm font-bold text-gray-600">
                        {dateValue}
                      </span>
                    )}
                  </div>
                )}
                {(hasCompany || hasLocation) && (
                  <div className="flex justify-between items-baseline mb-2">
                    {hasCompany && (
                      <p className="text-sm font-bold text-gray-800 italic">
                        {exp.company}
                      </p>
                    )}
                    {hasLocation && <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter">{exp.location}</p>}
                  </div>
                )}
                {description.length > 0 && (
                  <BulletList
                    items={description}
                    className="space-y-1.5 text-sm text-gray-800"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    ) : null
  );

  const renderEducation = () => (
    content.education.length > 0 ? (
      <div className="mb-6">
        <SectionTitle
          label={titles.education}
          variant="lined"
          className="text-lg font-bold text-gray-900 uppercase tracking-wider"
        />
        <div className="space-y-4 mt-2">
          {content.education.map((edu, index) => (
            <div key={`${edu.degree}-${index}`} className="flex justify-between items-baseline">
              <div className="flex-1">
                <div className="text-sm font-bold text-gray-900">
                  {edu.degree}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {edu.university || edu.institution}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-600 italic">{edu.year || edu.dates}</div>
                {edu.gpa && <div className="text-xs text-gray-500">GPA: {edu.gpa}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null
  );

  const renderProjects = () => {
    const projects = content.projects.filter((project) => {
      const name = project.name?.trim();
      const description = project.description?.trim();
      const techList = Array.isArray(project.technologies)
        ? project.technologies
        : typeof project.technologies === 'string'
          ? project.technologies.split(',')
          : [];
      const hasTech = techList.some((tech) => String(tech).trim());
      return Boolean(name || description || hasTech);
    });

    if (projects.length === 0) return null;

    return (
      <div className="mb-6">
        <SectionTitle
          label={titles.projects}
          variant="lined"
          className="text-lg font-bold text-gray-900 uppercase tracking-wider"
        />
        <div className="space-y-4 mt-2">
          {projects.map((project, index) => (
            <div key={`${project.name || 'project'}-${index}`} className="no-page-break">
              {project.name && (
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                    {project.name}
                  </h3>
                </div>
              )}
              {project.description && (
                <p className="text-sm text-gray-800 leading-relaxed mt-1">
                  {project.description}
                </p>
              )}
              {project.technologies && (
                <div className="flex flex-wrap gap-x-2 mt-1">
                  <span className="text-xs font-bold text-gray-500">Stack:</span>
                  <span className="text-xs text-gray-700 font-medium">
                    {Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = () => (
    content.certifications.length > 0 ? (
      <div className="mb-6">
        <SectionTitle
          label={titles.certifications}
          variant="lined"
          className="text-lg font-bold text-gray-900 uppercase tracking-wider"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2">
          {content.certifications.map((cert, index) => {
            const certName = typeof cert === 'string' ? cert : (cert?.name || cert?.title || String(cert));
            return (
              <span key={`${certName}-${index}`} className="text-gray-800 text-sm font-medium flex items-center">
                <span className="text-gray-400 mr-2">/</span>
                {certName}
              </span>
            );
          })}
        </div>
      </div>
    ) : null
  );

  return (
    <ResumePage className="mx-auto max-w-[800px] border-none shadow-none">
      {shouldShowHeader ? renderHeader() : null}
      {renderSummary()}
      {renderExperience()}
      {renderSkills()}
      {renderEducation()}
      {renderProjects()}
      {renderCertifications()}
    </ResumePage>
  );
};

export default MinimalistAts;
