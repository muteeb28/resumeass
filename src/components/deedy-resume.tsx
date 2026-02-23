"use client";
import { type ResumeData } from "../services/resumeGenerator";

interface DeedyResumeProps {
  resumeData: ResumeData;
}

export const DeedyResume = ({ resumeData }: DeedyResumeProps) => {
  return (
    <div className="w-full max-w-[8.5in] mx-auto bg-white text-black shadow-2xl" 
         style={{
           fontFamily: 'Lato, "Helvetica Neue", Helvetica, Arial, sans-serif',
           fontSize: '10pt',
           lineHeight: '1.2',
           minHeight: '11in',
           padding: '0.5in 0.6in',
           color: '#000000'
         }}>
      
      {/* Last Updated - Top Right */}
      <div className="text-right text-xs text-gray-500 mb-2">
        Last Updated on {new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>

      {/* Header - Name and Contact */}
      <div className="text-center mb-6">
        <h1 style={{
          fontSize: '32pt',
          fontWeight: '300',
          letterSpacing: '0.05em',
          marginBottom: '8pt',
          color: '#000'
        }}>
          {resumeData.personalInfo?.name ? (
            <>
              <span style={{fontWeight: '200', color: '#666'}}>
                {resumeData.personalInfo.name.split(' ')[0]}
              </span>
              <span style={{fontWeight: '400', color: '#000'}}>
                {' ' + resumeData.personalInfo.name.split(' ').slice(1).join(' ')}
              </span>
            </>
          ) : (
            <>
              <span style={{fontWeight: '200', color: '#666'}}>Your</span>
              <span style={{fontWeight: '400', color: '#000'}}> Name</span>
            </>
          )}
        </h1>
        
        <div className="border-b border-gray-400 pb-2">
          <div style={{fontSize: '11pt', color: '#666', marginBottom: '2pt'}}>
            {resumeData.personalInfo?.portfolio || 'yourwebsite.com'} | {resumeData.personalInfo?.linkedIn || 'linkedin.com/in/yourprofile'}
          </div>
          <div style={{fontSize: '11pt', color: '#666'}}>
            {resumeData.personalInfo?.email || 'your.email@domain.com'} | {resumeData.personalInfo?.phone || '(xxx) xxx-xxxx'} | {resumeData.personalInfo?.location || 'Your City, State'}
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-6">
        {/* Left Column - 33% */}
        <div style={{width: '33%'}}>
          
          {/* EDUCATION */}
          <div className="mb-6">
            <h2 style={{
              fontSize: '14pt',
              fontWeight: '300',
              letterSpacing: '0.15em',
              color: '#999',
              textTransform: 'uppercase',
              marginBottom: '8pt'
            }}>
              Education
            </h2>
            
            {resumeData.education && resumeData.education.length > 0 ? (
              resumeData.education.map((edu, index) => (
                <div key={index} className={index < resumeData.education.length - 1 ? "mb-3" : ""}>
                  <div style={{fontSize: '13pt', fontWeight: '600', textTransform: 'uppercase', color: '#000'}}>
                    {edu.institution}
                  </div>
                  <div style={{fontSize: '11pt', color: '#333', marginBottom: '1pt'}}>
                    {edu.degree}
                  </div>
                  <div style={{fontSize: '10pt', color: '#666'}}>
                    {edu.graduation}
                  </div>
                  {edu.gpa && (
                    <div style={{fontSize: '10pt', color: '#666', lineHeight: '1.4', marginTop: '2pt'}}>
                      GPA: {edu.gpa}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div>
                <div style={{fontSize: '13pt', fontWeight: '600', textTransform: 'uppercase', color: '#000'}}>
                  Your University
                </div>
                <div style={{fontSize: '11pt', color: '#333', marginBottom: '1pt'}}>
                  Your Degree
                </div>
                <div style={{fontSize: '10pt', color: '#666'}}>
                  Graduation Year
                </div>
              </div>
            )}
          </div>

          {/* CERTIFICATIONS (if available) */}
          {resumeData.certifications && resumeData.certifications.length > 0 && (
            <div className="mb-6">
              <h2 style={{
                fontSize: '14pt',
                fontWeight: '300',
                letterSpacing: '0.15em',
                color: '#999',
                textTransform: 'uppercase',
                marginBottom: '8pt'
              }}>
                Certifications
              </h2>
              <div style={{fontSize: '10pt', color: '#666', lineHeight: '1.5'}}>
                {resumeData.certifications.map((cert, index) => (
                  <div key={index}>{cert}</div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS (if available) */}
          {resumeData.projects && resumeData.projects.length > 0 && (
            <div className="mb-6">
              <h2 style={{
                fontSize: '14pt',
                fontWeight: '300',
                letterSpacing: '0.15em',
                color: '#999',
                textTransform: 'uppercase',
                marginBottom: '8pt'
              }}>
                Projects
              </h2>
              
              {resumeData.projects.slice(0, 3).map((project, index) => (
                <div key={index} className="mb-3">
                  <div style={{fontSize: '11pt', fontWeight: '600', textTransform: 'uppercase', color: '#000', marginBottom: '1pt'}}>
                    {project.name}
                  </div>
                  <div style={{fontSize: '10pt', color: '#666', lineHeight: '1.4', marginBottom: '2pt'}}>
                    {project.description}
                  </div>
                  <div style={{fontSize: '10pt', color: '#666', lineHeight: '1.4'}}>
                    <strong>Technologies:</strong> {project.technologies.join(' • ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SKILLS */}
          <div>
            <h2 style={{
              fontSize: '14pt',
              fontWeight: '300',
              letterSpacing: '0.15em',
              color: '#999',
              textTransform: 'uppercase',
              marginBottom: '8pt'
            }}>
              Skills
            </h2>
            
            <div>
              <div style={{fontSize: '11pt', fontWeight: '600', textTransform: 'uppercase', color: '#000', marginBottom: '3pt'}}>
                Programming
              </div>
              <div style={{fontSize: '10pt', color: '#666', lineHeight: '1.4'}}>
                {resumeData.skills?.technical && resumeData.skills.technical.length > 0 ? (
                  <div>{resumeData.skills.technical.join(' • ')}</div>
                ) : (
                  <>
                    <div><strong>Over 5000 lines:</strong></div>
                    <div>Java • Shell • Python • Javascript</div>
                    <div>OCaml • Matlab • Rails • LaTeX</div>
                    <div style={{marginTop: '4pt'}}><strong>Over 1000 lines:</strong></div>
                    <div>C • C++ • CSS • PHP • Assembly</div>
                    <div style={{marginTop: '4pt'}}><strong>Familiar:</strong></div>
                    <div>AS3 • iOS • Android • MySQL</div>
                  </>
                )}
              </div>
              
              {resumeData.skills?.soft && resumeData.skills.soft.length > 0 && (
                <div style={{marginTop: '8pt'}}>
                  <div style={{fontSize: '11pt', fontWeight: '600', textTransform: 'uppercase', color: '#000', marginBottom: '3pt'}}>
                    Core Competencies
                  </div>
                  <div style={{fontSize: '10pt', color: '#666', lineHeight: '1.4'}}>
                    {resumeData.skills.soft.join(' • ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - 67% */}
        <div style={{flex: 1}}>
          
          {/* EXPERIENCE */}
          <div className="mb-6">
            <h2 style={{
              fontSize: '14pt',
              fontWeight: '300',
              letterSpacing: '0.15em',
              color: '#999',
              textTransform: 'uppercase',
              marginBottom: '8pt'
            }}>
              Experience
            </h2>

            {resumeData.experience && resumeData.experience.length > 0 ? (
              resumeData.experience.map((exp, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-baseline mb-1">
                    <span style={{fontSize: '13pt', fontWeight: '600', textTransform: 'uppercase', color: '#000'}}>
                      {exp.company}
                    </span>
                    <span style={{fontSize: '12pt', fontWeight: '400', color: '#333', margin: '0 3px'}}>
                      |
                    </span>
                    <span style={{fontSize: '12pt', fontWeight: '400', color: '#333'}}>
                      {exp.position}
                    </span>
                  </div>
                  <div style={{fontSize: '10pt', color: '#666', marginBottom: '4pt'}}>
                    {exp.duration}
                  </div>
                  {exp.description && exp.description.length > 0 && (
                    <div style={{marginLeft: '16pt', marginBottom: '8pt'}}>
                      {exp.description.map((desc, i) => (
                        <div key={i} style={{fontSize: '10pt', color: '#444', lineHeight: '1.5', marginBottom: '2pt', position: 'relative', paddingLeft: '12pt'}}>
                          <span style={{position: 'absolute', left: '0'}}>•</span>
                          {desc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="mb-4">
                <div className="flex items-baseline mb-1">
                  <span style={{fontSize: '13pt', fontWeight: '600', textTransform: 'uppercase', color: '#000'}}>
                    Your Company
                  </span>
                  <span style={{fontSize: '12pt', fontWeight: '400', color: '#333', margin: '0 3px'}}>
                    |
                  </span>
                  <span style={{fontSize: '12pt', fontWeight: '400', color: '#333'}}>
                    Your Position
                  </span>
                </div>
                <div style={{fontSize: '10pt', color: '#666', marginBottom: '4pt'}}>
                  Start Date – End Date
                </div>
              </div>
            )}
          </div>

          {/* PROFESSIONAL SUMMARY */}
          {resumeData.summary && (
            <div className="mb-6">
              <h2 style={{
                fontSize: '14pt',
                fontWeight: '300',
                letterSpacing: '0.15em',
                color: '#999',
                textTransform: 'uppercase',
                marginBottom: '8pt'
              }}>
                Professional Summary
              </h2>
              <div style={{fontSize: '10pt', color: '#444', lineHeight: '1.5'}}>
                {resumeData.summary}
              </div>
            </div>
          )}

          {/* ADDITIONAL SECTIONS (if no specific data available) */}
          {!resumeData.summary && (
            <div className="mb-6">
              <h2 style={{
                fontSize: '14pt',
                fontWeight: '300',
                letterSpacing: '0.15em',
                color: '#999',
                textTransform: 'uppercase',
                marginBottom: '8pt'
              }}>
                Additional Information
              </h2>
              <div style={{fontSize: '10pt', color: '#444', lineHeight: '1.5'}}>
                Add your professional summary, achievements, awards, publications, or other relevant information here.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};