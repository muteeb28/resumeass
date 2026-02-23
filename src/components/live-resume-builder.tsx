"use client";
import { useState, useRef, useCallback } from "react";
import { Button } from "./button";
import { Navbar } from "./navbar";
import { OptimizedResumeTemplate } from "./optimized-resume-template";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  current: boolean;
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

export const LiveResumeBuilder = () => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      github: "",
      linkedin: ""
    },
    experiences: [],
    education: [],
    skills: [],
    projects: []
  });

  const updatePersonalInfo = useCallback((field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  }, []);

  const addExperience = useCallback(() => {
    const newExp: Experience = {
      id: Date.now().toString(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: [""]
    };
    setResumeData(prev => ({
      ...prev,
      experiences: [...prev.experiences, newExp]
    }));
  }, []);

  const updateExperience = useCallback((id: string, field: keyof Experience, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  }, []);

  const addEducation = useCallback(() => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: "",
      school: "",
      location: "",
      graduationDate: "",
      gpa: ""
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  }, []);

  const updateEducation = useCallback((id: string, field: keyof Education, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  }, []);

  const updateSkills = useCallback((skills: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: skills.split(',').map(skill => skill.trim()).filter(skill => skill)
    }));
  }, []);

  const addProject = useCallback(() => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "",
      description: "",
      technologies: "",
      link: ""
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  }, []);

  const updateProject = useCallback((id: string, field: keyof Project, value: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(project =>
        project.id === id ? { ...project, [field]: value } : project
      )
    }));
  }, []);

  const downloadPDF = useCallback(async () => {
    if (!resumeRef.current) {
      alert('Resume not found. Please try refreshing the page.');
      return;
    }

    const button = document.getElementById('downloadPdfBtn');
    const originalText = button?.textContent;

    try {
      if (button) button.textContent = 'Generating PDF...';
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc, element) => {
          // Only remove problematic CSS properties, keep the rest
          const allStyleTags = clonedDoc.querySelectorAll('style');
          allStyleTags.forEach(styleTag => {
            if (styleTag.textContent) {
              // Replace oklch and other unsupported color functions with fallback colors
              styleTag.textContent = styleTag.textContent
                .replace(/oklch\([^)]+\)/g, '#000000') // Replace oklch with black
                .replace(/lab\([^)]+\)/g, '#000000')   // Replace lab with black
                .replace(/lch\([^)]+\)/g, '#000000')   // Replace lch with black
                .replace(/hwb\([^)]+\)/g, '#000000');  // Replace hwb with black
            }
          });

          // Ensure the main element has proper background and remove border/shadow
          if (element) {
            element.style.backgroundColor = '#ffffff';
            element.style.position = 'relative';
            element.style.border = 'none';
            element.style.borderRadius = '0';
            element.style.boxShadow = 'none';
            element.style.transform = 'none';
            element.style.margin = '0';
            element.style.padding = '48px'; // Standard margin for PDF
          }

          // Fix any CSS custom properties that might cause issues
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            // Remove CSS custom properties that might not be supported
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.getPropertyValue('color').includes('oklch')) {
              (el as HTMLElement).style.color = '#000000';
            }
            if (computedStyle.getPropertyValue('background-color').includes('oklch')) {
              (el as HTMLElement).style.backgroundColor = '#ffffff';
            }
          });
        }
      });

      const imgData = canvas.toDataURL('image/png', 0.8);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasAspectRatio = canvas.height / canvas.width;
      const pdfAspectRatio = pdfHeight / pdfWidth;

      let imgWidth, imgHeight;
      if (canvasAspectRatio > pdfAspectRatio) {
        imgHeight = pdfHeight;
        imgWidth = imgHeight / canvasAspectRatio;
      } else {
        imgWidth = pdfWidth;
        imgHeight = imgWidth * canvasAspectRatio;
      }

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      const fileName = resumeData.personalInfo.name
        ? `${resumeData.personalInfo.name.replace(/[^a-zA-Z0-9]/g, '_')}_Resume.pdf`
        : 'Resume.pdf';

      pdf.save(fileName);

    } catch (error) {
      alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (button && originalText) {
        button.textContent = originalText;
      }
    }
  }, [resumeData.personalInfo.name]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold mb-4">Live Resume Builder</h1>
            <p className="text-slate-400">Edit on the left, see changes instantly on the right</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-3">
            {/* Left Side - Form */}
            <div className="bg-slate-900 rounded-xl p-6 space-y-6 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">Edit Your Information</h2>

              {/* Personal Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-400">Personal Information</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                    value={resumeData.personalInfo.name}
                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Website"
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                    value={resumeData.personalInfo.website}
                    onChange={(e) => updatePersonalInfo('website', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="GitHub"
                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-blue-400">Experience</h3>
                  <Button onClick={addExperience} variant="outline" size="sm">
                    + Add
                  </Button>
                </div>

                {resumeData.experiences.map((exp, index) => (
                  <div key={exp.id} className="bg-slate-800 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium text-white">Experience #{index + 1}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Job Title"
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                        value={exp.title}
                        onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                        value={exp.location}
                        onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="2021 - Present"
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                        value={`${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ''}`}
                        onChange={(e) => {
                          const parts = e.target.value.split(' - ');
                          updateExperience(exp.id, 'startDate', parts[0] || '');
                          updateExperience(exp.id, 'endDate', parts[1] || '');
                        }}
                      />
                    </div>
                    <textarea
                      placeholder="Job description (one bullet per line)"
                      rows={3}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                      value={exp.description.join('\n')}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value.split('\n'))}
                    />
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-blue-400">Education</h3>
                  <Button onClick={addEducation} variant="outline" size="sm">
                    + Add
                  </Button>
                </div>

                {resumeData.education.map((edu, index) => (
                  <div key={edu.id} className="bg-slate-800 rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-medium text-white">Education #{index + 1}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Degree"
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="School"
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                        value={edu.location}
                        onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Graduation Year"
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                        value={edu.graduationDate}
                        onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-blue-400">Skills</h3>
                <textarea
                  placeholder="Enter skills separated by commas"
                  rows={3}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                  value={resumeData.skills.join(', ')}
                  onChange={(e) => updateSkills(e.target.value)}
                />
              </div>

              {/* Projects */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-blue-400">Projects</h3>
                  <Button onClick={addProject} variant="outline" size="sm">
                    + Add
                  </Button>
                </div>

                {resumeData.projects.map((project, index) => (
                  <div key={project.id} className="bg-slate-800 rounded-lg p-4 space-y-2">
                    <h4 className="text-sm font-medium text-white">Project #{index + 1}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Project Name"
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Technologies"
                        className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                        value={project.technologies}
                        onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                      />
                    </div>
                    <textarea
                      placeholder="Project description"
                      rows={2}
                      className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                      value={project.description}
                      onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Live Preview */}
            <div className="bg-white rounded-xl p-6 sticky top-4 h-fit">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Live Preview</h2>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={downloadPDF} id="downloadPdfBtn">
                  Download PDF
                </Button>
              </div>

              {/* Deedy Resume Template Preview */}
              <div ref={resumeRef} data-resume-content className="w-full h-full bg-white text-black p-4 text-[9px] leading-normal border border-gray-200 rounded-lg overflow-hidden shadow-lg"
                style={{
                  fontFamily: 'Lato, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  aspectRatio: '8.5/11',
                  minHeight: '750px',
                  maxWidth: '650px',
                  margin: '0 auto',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  transform: 'scale(0.9)',
                  transformOrigin: 'top center'
                }}>
                <OptimizedResumeTemplate resumeData={resumeData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};