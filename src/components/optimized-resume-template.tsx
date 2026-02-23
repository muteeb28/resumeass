import { memo } from "react";

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  github: string;
  linkedin: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}

interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  graduationDate: string;
  gpa: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
}

interface OptimizedResumeTemplateProps {
  resumeData: ResumeData;
}

const ResumeHeader = memo(({ personalInfo }: { personalInfo: PersonalInfo }) => (
  <div className="text-center mb-2">
    <div className="text-right text-[8px] mb-2" style={{ color: '#9ca3af' }}>
      Last Updated on {new Date().toLocaleDateString()}
    </div>
    <h1 className="text-[20px] font-light tracking-wide mb-2">
      {personalInfo.name ? (
        <>
          <span className="font-extralight">{personalInfo.name.split(' ')[0] || ''}</span>{' '}
          <span className="font-normal" style={{ color: '#000000' }}>{personalInfo.name.split(' ').slice(1).join(' ') || ''}</span>
        </>
      ) : null}
    </h1>
    <div className="text-[8px] border-b pb-3 mb-2" style={{ color: '#4b5563', borderColor: '#d1d5db' }}>
      {[personalInfo.website, personalInfo.email, personalInfo.phone].filter(Boolean).join(' | ')}
    </div>
  </div>
));

const EducationSection = memo(({ education }: { education: Education[] }) => (
  <div className="mb-4">
    <h2 className="text-[8px] font-light uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>Education</h2>
    {education.filter(edu => edu.degree || edu.school).map((edu) => (
      <div key={edu.id} className="mb-2">
        <div className="font-semibold uppercase text-[8px]">{edu.school}</div>
        <div className="text-[8px]" style={{ color: '#374151' }}>{edu.degree}</div>
        {edu.gpa && <div className="text-[8px]" style={{ color: '#374151' }}>GPA: {edu.gpa}</div>}
        <div className="text-[8px]" style={{ color: '#6b7280' }}>{edu.graduationDate}</div>
        {edu.location && <div className="text-[8px]" style={{ color: '#6b7280' }}>{edu.location}</div>}
      </div>
    ))}
  </div>
));

const LinksSection = memo(({ personalInfo }: { personalInfo: PersonalInfo }) => (
  <div className="mb-4">
    <h2 className="text-[8px] font-light uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>Links</h2>
    <div className="text-[8px] leading-tight space-y-2">
      {personalInfo.github && (
        <div>GitHub:// <span className="font-semibold">{personalInfo.github.replace('github.com/', '').replace('https://', '').replace('http://', '')}</span></div>
      )}
      {personalInfo.linkedin && (
        <div>LinkedIn:// <span className="font-semibold">{personalInfo.linkedin.replace('linkedin.com/in/', '').replace('https://', '').replace('http://', '')}</span></div>
      )}
      {personalInfo.website && (
        <div>Website:// <span className="font-semibold">{personalInfo.website.replace('https://', '').replace('http://', '')}</span></div>
      )}
    </div>
  </div>
));

const SkillsSection = memo(({ skills }: { skills: string[] }) => (
  <div className="mb-4">
    <h2 className="text-[8px] font-light uppercase tracking-wide mb-4" style={{ color: '#6b7280' }}>Skills</h2>
    <div>
      <div className="font-semibold text-[8px] mb-2">Programming</div>
      <div className="text-[8px] leading-tight">
        {skills.length > 0 && (
          <>
            <div><span className="font-semibold">Proficient:</span></div>
            <div>{skills.slice(0, 4).join(' • ')}</div>
            {skills.length > 4 && (
              <>
                <div className="mt-2"><span className="font-semibold">Familiar:</span></div>
                <div>{skills.slice(4).join(' • ')}</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  </div>
));

const ExperienceSection = memo(({ experiences }: { experiences: Experience[] }) => (
  <div className="mb-4">
    <h2 className="text-[8px] font-light uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>Experience</h2>

    {experiences.filter(exp => exp.title || exp.company).map((exp) => (
      <div key={exp.id} className="mb-2">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="font-semibold uppercase text-[8px]">{exp.company}</span>
            <span className="text-[8px]" style={{ color: '#374151' }}>{exp.title ? ` | ${exp.title}` : ''}</span>
          </div>
          <span className="text-[8px]" style={{ color: '#6b7280' }}>
            {exp.startDate && exp.endDate ? `${exp.startDate} – ${exp.endDate}` :
              exp.startDate ? `${exp.startDate} – Present` : ''}
          </span>
        </div>
        {exp.location && <div className="text-[8px] italic" style={{ color: '#6b7280' }}>{exp.location}</div>}
        <div className="text-[8px] leading-tight mt-2" style={{ color: '#4b5563' }}>
          {exp.description.filter(desc => desc.trim()).map((desc, i) => (
            <span key={i}>• {desc}{i < exp.description.filter(desc => desc.trim()).length - 1 ? <br /> : ''}</span>
          ))}
        </div>
      </div>
    ))}

  </div>
));

const ProjectsSection = memo(({ projects }: { projects: Project[] }) => (
  <div className="mb-4">
    <h2 className="text-[8px] font-light uppercase tracking-wide mb-2" style={{ color: '#6b7280' }}>Projects</h2>

    {projects.filter(project => project.name || project.description).map((project) => (
      <div key={project.id} className="mb-4">
        <div className="flex justify-between items-baseline">
          <div>
            <span className="font-semibold uppercase text-[8px]">{project.name}</span>
            {project.technologies && <span className="text-[8px]" style={{ color: '#374151' }}>{` | ${project.technologies}`}</span>}
          </div>
          {project.link && (
            <span className="text-[8px]" style={{ color: '#6b7280' }}>{project.link.replace('https://', '').replace('http://', '')}</span>
          )}
        </div>
        <div className="text-[8px] leading-tight mt-2" style={{ color: '#4b5563' }}>
          {project.description}
        </div>
      </div>
    ))}

  </div>
));

export const OptimizedResumeTemplate = memo(({ resumeData }: OptimizedResumeTemplateProps) => (
  <>
    <ResumeHeader personalInfo={resumeData.personalInfo} />

    <div className="flex gap-3 text-[8px]" style={{ height: 'calc(100% - 120px)' }}>
      {/* Left Column */}
      <div style={{ width: '240px', flexShrink: 0 }}>
        <EducationSection education={resumeData.education} />
        <LinksSection personalInfo={resumeData.personalInfo} />
        {/* Coursework would go here if dynamic data existed for it */}
        <SkillsSection skills={resumeData.skills} />
      </div>

      {/* Right Column */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <ExperienceSection experiences={resumeData.experiences} />
        <ProjectsSection projects={resumeData.projects} />
      </div>
    </div>
  </>
));