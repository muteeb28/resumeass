"use client";
import { type ResumeData } from "../services/resumeGenerator";
import { Button } from "./button";
import { Navbar } from "./navbar";
import { DeedyResume } from "./deedy-resume";

interface ResumePreviewProps {
  resumeData: ResumeData;
  templateId: string;
  templateName: string;
}

export const ResumePreview = ({ resumeData, templateId, templateName }: ResumePreviewProps) => {
  
  const handleDownload = () => {
    // TODO: Implement PDF generation and download
    alert('PDF download coming soon! For now, you can copy the content or take a screenshot.');
  };

  const handleEdit = () => {
    // TODO: Go back to edit mode
    window.history.back();
  };

  const renderModernTemplate = () => (
    <div className="w-full max-w-4xl mx-auto bg-white text-black p-8 shadow-2xl rounded-lg" style={{fontFamily: 'system-ui, sans-serif'}}>
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-slate-800 text-white p-6 -m-8 mr-6 rounded-l-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{resumeData.personalInfo.name.toUpperCase()}</h1>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-slate-200 uppercase tracking-wide">Contact</h2>
            <div className="text-sm text-slate-300 space-y-2">
              <p>📧 {resumeData.personalInfo.email}</p>
              <p>📱 {resumeData.personalInfo.phone}</p>
              <p>📍 {resumeData.personalInfo.location}</p>
              {resumeData.personalInfo.linkedIn && (
                <p>🔗 {resumeData.personalInfo.linkedIn}</p>
              )}
              {resumeData.personalInfo.portfolio && (
                <p>💻 {resumeData.personalInfo.portfolio}</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-3 text-slate-200 uppercase tracking-wide">Skills</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Technical</p>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.technical.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Soft Skills</p>
                <div className="text-sm text-slate-400 space-y-1">
                  {resumeData.skills.soft.map((skill, index) => (
                    <p key={index}>• {skill}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {resumeData.certifications && resumeData.certifications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold mb-3 text-slate-200 uppercase tracking-wide">Certifications</h2>
              <div className="text-sm text-slate-400 space-y-1">
                {resumeData.certifications.map((cert, index) => (
                  <p key={index}>• {cert}</p>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right Main Content */}
        <div className="w-2/3 pl-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-gray-900 uppercase tracking-wide border-b-2 border-blue-600 pb-2">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-gray-900 uppercase tracking-wide border-b-2 border-blue-600 pb-2">
              Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{exp.position}</h3>
                      <p className="text-blue-700 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-gray-600 text-sm">{exp.duration}</span>
                  </div>
                  <div className="text-gray-700 space-y-1">
                    {exp.description.map((desc, i) => (
                      <p key={i} className="text-sm">{desc}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3 text-gray-900 uppercase tracking-wide border-b-2 border-blue-600 pb-2">
              Education
            </h2>
            <div className="space-y-3">
              {resumeData.education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-blue-700 font-medium">{edu.institution}</p>
                    </div>
                    <span className="text-gray-600 text-sm">{edu.graduation}</span>
                  </div>
                  {edu.gpa && (
                    <p className="text-gray-700 text-sm">GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {resumeData.projects && resumeData.projects.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3 text-gray-900 uppercase tracking-wide border-b-2 border-blue-600 pb-2">
                Projects
              </h2>
              <div className="space-y-3">
                {resumeData.projects.map((project, index) => (
                  <div key={index}>
                    <h3 className="font-bold text-gray-900">{project.name}</h3>
                    <p className="text-gray-700 text-sm mb-1">{project.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAcademicTemplate = () => (
    <div className="w-full max-w-4xl mx-auto bg-white text-black p-8 shadow-2xl rounded-lg" style={{fontFamily: 'Times, serif'}}>
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-gray-900 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{resumeData.personalInfo.name}</h1>
        <div className="text-sm text-gray-600">
          <p>{resumeData.personalInfo.email} • {resumeData.personalInfo.phone}</p>
          <p>{resumeData.personalInfo.location}</p>
          {resumeData.personalInfo.linkedIn && <p>{resumeData.personalInfo.linkedIn}</p>}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-gray-900 uppercase">Professional Summary</h2>
        <p className="text-gray-800 leading-relaxed">{resumeData.summary}</p>
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-gray-900 uppercase">Education</h2>
        <div className="space-y-3">
          {resumeData.education.map((edu, index) => (
            <div key={index} className="flex justify-between">
              <div>
                <p className="font-bold">{edu.degree}</p>
                <p className="italic text-gray-700">{edu.institution}</p>
                {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
              </div>
              <span className="text-gray-600">{edu.graduation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-gray-900 uppercase">Professional Experience</h2>
        <div className="space-y-4">
          {resumeData.experience.map((exp, index) => (
            <div key={index}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{exp.position}</h3>
                  <p className="italic text-gray-700">{exp.company}</p>
                </div>
                <span className="text-gray-600">{exp.duration}</span>
              </div>
              <div className="text-gray-700 space-y-1 leading-relaxed">
                {exp.description.map((desc, i) => (
                  <p key={i} className="text-sm">{desc}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-3 text-gray-900 uppercase">Technical Skills</h2>
          <div className="text-gray-700">
            {resumeData.skills.technical.join(', ')}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-3 text-gray-900 uppercase">Core Competencies</h2>
          <div className="text-gray-700 space-y-1">
            {resumeData.skills.soft.map((skill, index) => (
              <p key={index}>• {skill}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMinimalTemplate = () => (
    <div className="w-full max-w-4xl mx-auto bg-white text-black p-8 shadow-2xl rounded-lg" style={{fontFamily: 'system-ui, sans-serif'}}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-thin text-gray-900 mb-2">{resumeData.personalInfo.name.toUpperCase()}</h1>
        <div className="w-24 h-0.5 bg-gray-400 mx-auto mb-4"></div>
        <div className="text-sm text-gray-600">
          <p>{resumeData.personalInfo.email} • {resumeData.personalInfo.phone} • {resumeData.personalInfo.location}</p>
        </div>
      </div>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-medium mb-4 text-gray-800">PROFESSIONAL SUMMARY</h2>
          <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
        </div>

        <div>
          <h2 className="text-xl font-medium mb-4 text-gray-800">EXPERIENCE</h2>
          <div className="space-y-6">
            {resumeData.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between text-base mb-2">
                  <span className="font-medium">{exp.position}</span>
                  <span className="text-gray-600">{exp.duration}</span>
                </div>
                <p className="text-gray-600 mb-2">{exp.company}</p>
                <div className="text-gray-700 space-y-1">
                  {exp.description.map((desc, i) => (
                    <p key={i} className="text-sm">{desc}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-medium mb-4 text-gray-800">SKILLS</h2>
            <div className="text-gray-700 space-y-2">
              <div>
                <p className="font-medium">Technical</p>
                <p className="text-sm">{resumeData.skills.technical.join(', ')}</p>
              </div>
              <div>
                <p className="font-medium">Core Competencies</p>
                <p className="text-sm">{resumeData.skills.soft.join(', ')}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-medium mb-4 text-gray-800">EDUCATION</h2>
            <div className="space-y-3">
              {resumeData.education.map((edu, index) => (
                <div key={index}>
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-gray-600 text-sm">{edu.institution}</p>
                  <p className="text-gray-500 text-sm">{edu.graduation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Banking Template - Conservative and Professional
  const renderBankingTemplate = () => (
    <div className="w-full max-w-4xl mx-auto bg-white text-black p-8 shadow-2xl rounded-lg" style={{fontFamily: 'Times, serif'}}>
      <div className="border-b-4 border-blue-900 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">{resumeData.personalInfo.name.toUpperCase()}</h1>
        <div className="text-sm text-gray-700 grid grid-cols-2 gap-4">
          <div>
            <p>📧 {resumeData.personalInfo.email}</p>
            <p>📱 {resumeData.personalInfo.phone}</p>
          </div>
          <div>
            <p>📍 {resumeData.personalInfo.location}</p>
            {resumeData.personalInfo.linkedIn && <p>🔗 {resumeData.personalInfo.linkedIn}</p>}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-blue-900 mb-3 uppercase border-b border-blue-300">PROFESSIONAL SUMMARY</h2>
        <p className="text-gray-800 leading-relaxed">{resumeData.summary}</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-blue-900 mb-3 uppercase border-b border-blue-300">PROFESSIONAL EXPERIENCE</h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <h3 className="font-bold text-blue-800">{exp.position}</h3>
                    <span className="text-gray-600 text-sm">{exp.duration}</span>
                  </div>
                  <p className="text-blue-700 font-medium mb-2">{exp.company}</p>
                  <div className="text-gray-700 space-y-1">
                    {exp.description.map((desc, i) => (
                      <p key={i} className="text-sm">{desc}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-blue-900 mb-3 uppercase border-b border-blue-300">EDUCATION</h2>
            <div className="space-y-3">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <p className="font-bold text-blue-800">{edu.degree}</p>
                    <p className="text-blue-700">{edu.institution}</p>
                    {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
                  </div>
                  <span className="text-gray-600">{edu.graduation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-blue-900 mb-3 uppercase">CORE COMPETENCIES</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Technical Skills</h3>
                <div className="space-y-1">
                  {resumeData.skills.technical.map((skill, index) => (
                    <p key={index} className="text-xs text-gray-700">• {skill}</p>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Soft Skills</h3>
                <div className="space-y-1">
                  {resumeData.skills.soft.map((skill, index) => (
                    <p key={index} className="text-xs text-gray-700">• {skill}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {resumeData.certifications && resumeData.certifications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-blue-900 mb-3 uppercase">CERTIFICATIONS</h2>
              <div className="space-y-1">
                {resumeData.certifications.map((cert, index) => (
                  <p key={index} className="text-xs text-gray-700">• {cert}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Creative Template - Bold and Modern
  const renderCreativeTemplate = () => (
    <div className="w-full max-w-4xl mx-auto bg-white text-black p-8 shadow-2xl rounded-lg">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 -m-8 mb-6 rounded-t-lg">
        <h1 className="text-4xl font-light mb-2">{resumeData.personalInfo.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm">
          <span>{resumeData.personalInfo.email}</span>
          <span>{resumeData.personalInfo.phone}</span>
          <span>{resumeData.personalInfo.location}</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center mb-3">
          <div className="w-8 h-1 bg-purple-600 mr-3"></div>
          <h2 className="text-xl font-bold text-gray-900">CREATIVE SUMMARY</h2>
        </div>
        <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-1 bg-pink-600 mr-3"></div>
              <h2 className="text-xl font-bold text-gray-900">EXPERIENCE</h2>
            </div>
            <div className="space-y-6">
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="relative pl-6">
                  <div className="absolute left-0 top-2 w-3 h-3 bg-purple-600 rounded-full"></div>
                  <div className="absolute left-1.5 top-5 w-0.5 h-full bg-purple-200"></div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-purple-800">{exp.position}</h3>
                      <p className="text-pink-600 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">{exp.duration}</span>
                  </div>
                  <div className="text-gray-700 space-y-1">
                    {exp.description.map((desc, i) => (
                      <p key={i} className="text-sm">{desc}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {resumeData.projects && resumeData.projects.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-1 bg-pink-600 mr-3"></div>
                <h2 className="text-xl font-bold text-gray-900">PROJECTS</h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {resumeData.projects.map((project, index) => (
                  <div key={index} className="border-l-4 border-purple-400 pl-4">
                    <h3 className="font-bold text-purple-800">{project.name}</h3>
                    <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-6 h-1 bg-purple-600 mr-2"></div>
              <h2 className="text-lg font-bold text-gray-900">SKILLS</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-purple-800 mb-2">Technical</h3>
                <div className="flex flex-wrap gap-1">
                  {resumeData.skills.technical.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-pink-600 mb-2">Creative</h3>
                <div className="space-y-1">
                  {resumeData.skills.soft.map((skill, index) => (
                    <p key={index} className="text-gray-700 text-sm">• {skill}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <div className="w-6 h-1 bg-pink-600 mr-2"></div>
              <h2 className="text-lg font-bold text-gray-900">EDUCATION</h2>
            </div>
            <div className="space-y-3">
              {resumeData.education.map((edu, index) => (
                <div key={index}>
                  <p className="font-bold text-purple-800">{edu.degree}</p>
                  <p className="text-pink-600 text-sm">{edu.institution}</p>
                  <p className="text-gray-600 text-sm">{edu.graduation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Consulting Template - McKinsey Style
  const renderConsultingTemplate = () => (
    <div className="w-full max-w-4xl mx-auto bg-white text-black p-8 shadow-2xl rounded-lg" style={{fontFamily: 'Arial, sans-serif'}}>
      <div className="text-center border-b-2 border-gray-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{resumeData.personalInfo.name.toUpperCase()}</h1>
        <div className="text-xs text-gray-600 space-x-3">
          <span>{resumeData.personalInfo.email}</span>
          <span>|</span>
          <span>{resumeData.personalInfo.phone}</span>
          <span>|</span>
          <span>{resumeData.personalInfo.location}</span>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-400 pb-1">PROFESSIONAL SUMMARY</h2>
          <p className="text-xs text-gray-800 leading-relaxed">{resumeData.summary}</p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-400 pb-1">PROFESSIONAL EXPERIENCE</h2>
          <div className="space-y-3">
            {resumeData.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline mb-1">
                  <div className="flex-1">
                    <span className="font-bold text-xs text-gray-900">{exp.company}</span>
                    <span className="text-xs text-gray-700 ml-2">| {exp.position}</span>
                  </div>
                  <span className="text-xs text-gray-600">{exp.duration}</span>
                </div>
                <div className="text-xs text-gray-700 space-y-0.5 pl-2">
                  {exp.description.map((desc, i) => (
                    <p key={i}>{desc}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-400 pb-1">EDUCATION</h2>
            <div className="space-y-2">
              {resumeData.education.map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-gray-900">{edu.institution}</span>
                    <span className="text-gray-600">{edu.graduation}</span>
                  </div>
                  <p className="text-xs text-gray-700">{edu.degree}</p>
                  {edu.gpa && <p className="text-xs text-gray-600">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-2 border-b border-gray-400 pb-1">SKILLS & COMPETENCIES</h2>
            <div className="space-y-2">
              <div>
                <h3 className="text-xs font-semibold text-gray-800">Technical Skills</h3>
                <p className="text-xs text-gray-700">{resumeData.skills.technical.join(', ')}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-800">Core Competencies</h3>
                <p className="text-xs text-gray-700">{resumeData.skills.soft.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Tech Template - Developer Focused
  const renderTechTemplate = () => (
    <div className="w-full max-w-4xl mx-auto bg-gray-900 text-green-400 p-8 shadow-2xl rounded-lg" style={{fontFamily: 'Monaco, monospace'}}>
      <div className="border border-green-400 p-4 mb-6">
        <div className="text-green-300 text-xs mb-2">$ whoami</div>
        <h1 className="text-2xl font-bold text-green-400 mb-2">{resumeData.personalInfo.name}</h1>
        <div className="text-sm space-y-1">
          <div><span className="text-green-600">email:</span> {resumeData.personalInfo.email}</div>
          <div><span className="text-green-600">phone:</span> {resumeData.personalInfo.phone}</div>
          <div><span className="text-green-600">location:</span> {resumeData.personalInfo.location}</div>
          {resumeData.personalInfo.linkedIn && <div><span className="text-green-600">linkedin:</span> {resumeData.personalInfo.linkedIn}</div>}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-green-300 text-sm mb-2">$ cat summary.md</div>
          <div className="bg-gray-800 border-l-4 border-green-400 p-3">
            <p className="text-green-100 text-sm leading-relaxed">{resumeData.summary}</p>
          </div>
        </div>

        <div>
          <div className="text-green-300 text-sm mb-2">$ ls -la experience/</div>
          <div className="space-y-4">
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="border-l-2 border-green-600 pl-4">
                <div className="flex justify-between items-baseline mb-2">
                  <div>
                    <h3 className="text-green-400 font-bold">{exp.position}</h3>
                    <p className="text-green-300 text-sm">@ {exp.company}</p>
                  </div>
                  <span className="text-green-600 text-xs">{exp.duration}</span>
                </div>
                <div className="text-green-100 text-sm space-y-1">
                  {exp.description.map((desc, i) => (
                    <p key={i} className="before:content-['>'] before:text-green-600 before:mr-2">{desc}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-green-300 text-sm mb-2">$ cat skills.json</div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="mb-3">
                <div className="text-green-400 text-sm">{"{"}</div>
                <div className="ml-4">
                  <div className="text-green-300">"technical": [</div>
                  <div className="ml-4 space-y-1">
                    {resumeData.skills.technical.map((skill, index) => (
                      <div key={index} className="text-green-100 text-xs">"{skill}"{index < resumeData.skills.technical.length - 1 ? ',' : ''}</div>
                    ))}
                  </div>
                  <div className="text-green-300">],</div>
                  <div className="text-green-300">"soft": [</div>
                  <div className="ml-4 space-y-1">
                    {resumeData.skills.soft.map((skill, index) => (
                      <div key={index} className="text-green-100 text-xs">"{skill}"{index < resumeData.skills.soft.length - 1 ? ',' : ''}</div>
                    ))}
                  </div>
                  <div className="text-green-300">]</div>
                </div>
                <div className="text-green-400 text-sm">{"}"}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-green-300 text-sm mb-2">$ head education.log</div>
            <div className="space-y-3">
              {resumeData.education.map((edu, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded">
                  <div className="text-green-400 font-bold text-sm">{edu.degree}</div>
                  <div className="text-green-300 text-sm">{edu.institution}</div>
                  <div className="text-green-600 text-xs">{edu.graduation}</div>
                  {edu.gpa && <div className="text-green-100 text-xs">GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {resumeData.projects && resumeData.projects.length > 0 && (
          <div>
            <div className="text-green-300 text-sm mb-2">$ git log --oneline projects/</div>
            <div className="space-y-3">
              {resumeData.projects.map((project, index) => (
                <div key={index} className="border border-green-600 p-3 rounded">
                  <h3 className="text-green-400 font-bold">{project.name}</h3>
                  <p className="text-green-100 text-sm mb-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded border border-green-600">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Executive Template - C-Suite Level
  const renderExecutiveTemplate = () => (
    <div className="w-full max-w-4xl mx-auto bg-white text-black p-8 shadow-2xl rounded-lg" style={{fontFamily: 'Georgia, serif'}}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-light text-gray-900 mb-3">{resumeData.personalInfo.name}</h1>
        <div className="w-32 h-px bg-gray-400 mx-auto mb-4"></div>
        <div className="text-gray-600 space-y-1">
          <p>{resumeData.personalInfo.email} • {resumeData.personalInfo.phone}</p>
          <p>{resumeData.personalInfo.location}</p>
          {resumeData.personalInfo.linkedIn && <p>{resumeData.personalInfo.linkedIn}</p>}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-light text-gray-900 mb-4 text-center">EXECUTIVE SUMMARY</h2>
        <p className="text-gray-800 leading-relaxed text-center max-w-3xl mx-auto">{resumeData.summary}</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-light text-gray-900 mb-4 text-center">LEADERSHIP EXPERIENCE</h2>
          <div className="space-y-6">
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                <p className="text-gray-700 font-medium mb-1">{exp.company}</p>
                <p className="text-gray-600 text-sm mb-3">{exp.duration}</p>
                <div className="max-w-3xl mx-auto text-gray-700 space-y-2">
                  {exp.description.map((desc, i) => (
                    <p key={i} className="text-sm leading-relaxed">{desc}</p>
                  ))}
                </div>
                {index < resumeData.experience.length - 1 && <div className="w-16 h-px bg-gray-300 mx-auto mt-6"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="text-center">
            <h2 className="text-xl font-light text-gray-900 mb-4">EDUCATION</h2>
            <div className="space-y-3">
              {resumeData.education.map((edu, index) => (
                <div key={index}>
                  <p className="font-semibold text-gray-900">{edu.degree}</p>
                  <p className="text-gray-700">{edu.institution}</p>
                  <p className="text-gray-600 text-sm">{edu.graduation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-xl font-light text-gray-900 mb-4">CORE COMPETENCIES</h2>
            <div className="space-y-2">
              <div className="text-gray-700 text-sm space-y-1">
                {[...resumeData.skills.technical.slice(0, 4), ...resumeData.skills.soft.slice(0, 4)].map((skill, index) => (
                  <p key={index}>• {skill}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Add remaining placeholder functions
  const renderEngineeringTemplate = () => renderTechTemplate();
  const renderMedicalTemplate = () => renderAcademicTemplate();
  const renderStartupTemplate = () => renderCreativeTemplate();
  const renderLegalTemplate = () => renderConsultingTemplate();
  const renderSalesTemplate = () => renderModernTemplate();
  const renderMarketingTemplate = () => renderCreativeTemplate();
  const renderDesignerTemplate = () => renderCreativeTemplate();
  const renderDataTemplate = () => renderTechTemplate();
  const renderManagerTemplate = () => renderExecutiveTemplate();
  const renderFreelancerTemplate = () => renderCreativeTemplate();
  const renderGraduateTemplate = () => renderMinimalTemplate();
  const renderCorporateTemplate = () => renderBankingTemplate();

  const renderTemplate = () => {
    switch (templateId) {
      case 'deedy':
        return <DeedyResume resumeData={resumeData} />;
      case 'academic':
        return renderAcademicTemplate();
      case 'minimal':
        return renderMinimalTemplate();
      case 'banking':
        return renderBankingTemplate();
      case 'engineering':
        return renderEngineeringTemplate();
      case 'medical':
        return renderMedicalTemplate();
      case 'consulting':
        return renderConsultingTemplate();
      case 'startup':
        return renderStartupTemplate();
      case 'legal':
        return renderLegalTemplate();
      case 'sales':
        return renderSalesTemplate();
      case 'marketing':
        return renderMarketingTemplate();
      case 'designer':
        return renderDesignerTemplate();
      case 'data':
        return renderDataTemplate();
      case 'manager':
        return renderManagerTemplate();
      case 'freelancer':
        return renderFreelancerTemplate();
      case 'graduate':
        return renderGraduateTemplate();
      case 'executive':
        return renderExecutiveTemplate();
      case 'creative':
        return renderCreativeTemplate();
      case 'corporate':
        return renderCorporateTemplate();
      case 'tech':
        return renderTechTemplate();
      case 'modern':
      default:
        return renderModernTemplate();
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Your Resume is Ready! 🎉
            </h1>
            <p className="text-slate-400 text-lg">
              Generated using <span className="text-purple-400 font-semibold">{templateName}</span> template
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <Button onClick={handleDownload} size="lg">
              📄 Download PDF
            </Button>
            <Button onClick={handleEdit} variant="outline" size="lg">
              ✏️ Edit Resume
            </Button>
          </div>

          {/* Resume Preview */}
          <div className="bg-gray-100 p-8 rounded-xl">
            {renderTemplate()}
          </div>

          {/* Footer Actions */}
          <div className="text-center mt-8">
            <p className="text-slate-400 mb-4">
              Love your resume? Share it with the world!
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="ghost" size="sm">Share on LinkedIn</Button>
              <Button variant="ghost" size="sm">Save to Cloud</Button>
              <Button variant="ghost" size="sm">Create Another</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};