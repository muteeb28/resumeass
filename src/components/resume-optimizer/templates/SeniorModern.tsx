import React from 'react';
import ResumePage from '../ResumePage';
import { BulletList, ContactLine, SectionTitle, TechnologyLine } from '../ResumeSections';
import { CONTACT_LABELS, SECTION_TITLES } from '../resumeConfig';
import type { NormalizedResume, RenderState } from '../resumeUtils';

interface SeniorModernProps {
  content: NormalizedResume;
  renderState: RenderState;
}

const ModernExecutive: React.FC<SeniorModernProps> = ({ content, renderState }) => {
  const titles = SECTION_TITLES.seniorModern;
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
  const variant = renderState.pageIndex !== undefined ? 'single' : 'multi';

  const renderHeader = (variant: 'single' | 'multi') => (
    <div className={variant === 'single' ? 'mb-8 border-b-4 border-slate-900 pb-4' : 'mb-10 border-b-4 border-slate-900 pb-6'}>
      {content.name && (
        <h1 className={variant === 'single' ? 'text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight' : 'text-5xl font-black text-slate-900 mb-2 uppercase tracking-tight'}>
          {content.name}
        </h1>
      )}
      {hasContactInfo && (
        <ContactLine
          items={[
            content.contact.email,
            content.contact.phone,
            content.contact.location,
            content.contact.linkedin && `${CONTACT_LABELS.linkedin}: ${content.contact.linkedin}`,
            content.contact.github && `${CONTACT_LABELS.github}: ${content.contact.github}`,
            content.contact.website && `${CONTACT_LABELS.website}: ${content.contact.website}`,
            ...(content.contact.links || [])
          ]}
          className="flex flex-wrap gap-x-4 text-sm font-bold text-slate-700"
        />
      )}
    </div>
  );

  const renderSummary = (variant: 'single' | 'multi') => (
    content.summary ? (
      <div className={variant === 'single' ? 'mb-6' : 'mb-10'}>
        <SectionTitle
          label={titles.summary}
          variant="boxed"
          className={variant === 'single' ? 'text-xl font-black' : 'text-2xl font-black'}
        />
        <p className={`text-slate-800 leading-relaxed text-justify font-medium ${variant === 'single' ? 'text-sm' : 'text-base'}`}>
          {content.summary}
        </p>
      </div>
    ) : null
  );

  const renderSkills = (variant: 'single' | 'multi') => (
    content.skills.length > 0 ? (
      <div className={variant === 'single' ? 'mb-6' : 'mb-10'}>
        <SectionTitle
          label={variant === 'single' ? titles.skills : titles.competencies}
          variant="boxed"
          className={variant === 'single' ? 'text-lg font-black' : 'text-2xl font-black'}
        />
        <div className="flex flex-wrap gap-2">
          {content.skills.map((skill, index) => (
            <span key={`${skill}-${index}`} className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>
    ) : null
  );

  const renderExperience = (variant: 'single' | 'multi') => (
    content.experience.length > 0 ? (
      <div className={variant === 'single' ? 'mb-6' : 'mb-10'}>
        <SectionTitle
          label={variant === 'single' ? titles.experience : titles.professionalExperience}
          variant="boxed"
          className={variant === 'single' ? 'text-lg font-black' : 'text-2xl font-black'}
        />
        <div className={variant === 'single' ? 'space-y-6' : 'space-y-8'}>
          {content.experience.map((exp, index) => {
            const description = Array.isArray(exp.description) ? exp.description : [];
            const dateValue = exp.dates || exp.duration;
            const hasTitle = Boolean(exp.title);
            const hasDates = Boolean(dateValue);
            const hasCompany = Boolean(exp.company);
            const hasLocation = Boolean(exp.location);
            return (
              <div key={`${exp.title}-${index}`} className="experience-item no-page-break">
                {(hasTitle || hasDates) && (
                  <div className="flex justify-between items-baseline mb-2">
                    {hasTitle && (
                      <h3 className={variant === 'single' ? 'text-base font-black text-slate-900' : 'text-xl font-black text-slate-900'}>
                        {exp.title}
                      </h3>
                    )}
                    {hasDates && (
                      <span className="text-sm font-black text-slate-600 uppercase">
                        {dateValue}
                      </span>
                    )}
                  </div>
                )}
                {(hasCompany || hasLocation) && (
                  <div className="flex justify-between items-center mb-3">
                    {hasCompany && (
                      <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        {exp.company}
                      </p>
                    )}
                    {hasLocation && <p className="text-xs font-bold text-slate-500 italic">{exp.location}</p>}
                  </div>
                )}
                {description.length > 0 && (
                  <BulletList
                    items={description}
                    className={variant === 'single' ? 'space-y-1.5 text-sm text-slate-700 font-medium' : 'space-y-2 text-slate-700 font-medium'}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    ) : null
  );

  const renderEducation = (variant: 'single' | 'multi') => (
    content.education.length > 0 ? (
      <div className={variant === 'single' ? 'mb-4' : 'mb-10'}>
        <SectionTitle
          label={titles.education}
          variant="boxed"
          className={variant === 'single' ? 'text-lg font-black' : 'text-2xl font-black'}
        />
        <div className="space-y-4">
          {content.education.map((edu, index) => (
            <div key={`${edu.degree}-${index}`} className="flex justify-between items-start border-l-4 border-slate-200 pl-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">{edu.degree}</h3>
                <p className="text-sm font-bold text-slate-700">
                  {edu.university || edu.institution}
                </p>
                {edu.location && <p className="text-xs text-slate-500">{edu.location}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-600">{edu.dates || edu.year}</p>
                {edu.gpa && <p className="text-xs font-bold text-slate-500">GPA: {edu.gpa}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null
  );

  const renderProjects = (variant: 'single' | 'multi') => {
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
      <div className={variant === 'single' ? 'mt-8' : 'mb-10'}>
        <SectionTitle
          label={titles.projects}
          variant="boxed"
          className={variant === 'single' ? 'text-lg font-black' : 'text-2xl font-black'}
        />
        <div className="grid grid-cols-1 gap-6">
          {projects.map((project, index) => (
            <div key={`${project.name || 'project'}-${index}`} className="bg-slate-50 border-r-4 border-slate-400 p-4">
              {project.name && (
                <h3 className="text-base font-black text-slate-900 mb-2 uppercase">
                  {project.name}
                </h3>
              )}
              {project.description && (
                <p className="text-sm text-slate-700 leading-relaxed mb-3 font-medium">
                  {project.description}
                </p>
              )}
              {project.technologies && (
                <TechnologyLine
                  technologies={project.technologies}
                  className="flex flex-wrap gap-2"
                  variant="tags"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = (variant: 'single' | 'multi') => (
    content.certifications.length > 0 ? (
      <div className={variant === 'single' ? 'mt-4' : 'mb-10'}>
        <SectionTitle
          label={titles.certifications}
          variant="boxed"
          className={variant === 'single' ? 'text-lg font-black' : 'text-2xl font-black'}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.certifications.map((cert, index) => {
            const certName = typeof cert === 'string' ? cert : (cert?.name || cert?.title || String(cert));
            return (
              <div key={`${certName}-${index}`} className="flex items-center bg-white border border-slate-200 rounded p-2 shadow-sm">
                <div className="w-1.5 h-1.5 bg-slate-800 rounded-full mr-3"></div>
                <span className="text-xs font-bold text-slate-800 truncate">{certName}</span>
              </div>
            );
          })}
        </div>
      </div>
    ) : null
  );

  if (!renderState.isMultiPage) {
    return (
      <ResumePage className="mx-auto max-w-[800px] shadow-2xl">
        {renderHeader('single')}
        {renderSummary('single')}
        {renderSkills('single')}
        {renderExperience('single')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderEducation('single')}
          {renderCertifications('single')}
        </div>
        {renderProjects('single')}
      </ResumePage>
    );
  }

  const pageContent = (
    <ResumePage className="mx-auto max-w-[900px] shadow-2xl">
      {shouldShowHeader ? renderHeader(variant) : null}
      {renderSummary(variant)}
      {renderSkills(variant)}
      {renderExperience(variant)}
      {renderEducation(variant)}
      {renderProjects(variant)}
      {renderCertifications(variant)}
    </ResumePage>
  );

  if (renderState.pageIndex !== undefined) {
    return pageContent;
  }

  return (
    <div className="bg-slate-200 py-12 space-y-12">
      {pageContent}
    </div>
  );
};

export default ModernExecutive;
