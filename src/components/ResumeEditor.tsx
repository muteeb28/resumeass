"use client";

import { useCallback } from "react";
import type { ResumeJSON, ResumeExperience, ResumeEducation, ResumeProject, ResumeSkillCategory, ResumeCertification } from "@/types/resume";

interface ResumeEditorProps {
  resume: ResumeJSON;
  onChange: (resume: ResumeJSON) => void;
}

const inputClass = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";
const labelClass = "block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1";
const sectionClass = "rounded-2xl border border-neutral-200 bg-white p-4 space-y-4";
const sectionTitleClass = "text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-2 mb-4";

export default function ResumeEditor({ resume, onChange }: ResumeEditorProps) {
  // Update basics
  const updateBasics = useCallback((field: keyof ResumeJSON["basics"], value: string | string[]) => {
    onChange({
      ...resume,
      basics: { ...resume.basics, [field]: value },
    });
  }, [resume, onChange]);

  // Update experience
  const updateExperience = useCallback((index: number, field: keyof ResumeExperience, value: any) => {
    const updated = [...resume.experience];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resume, experience: updated });
  }, [resume, onChange]);

  const addExperience = useCallback(() => {
    onChange({
      ...resume,
      experience: [...resume.experience, { company: "", role: "", dates: "", location: "", bullets: [""] }],
    });
  }, [resume, onChange]);

  const removeExperience = useCallback((index: number) => {
    onChange({
      ...resume,
      experience: resume.experience.filter((_, i) => i !== index),
    });
  }, [resume, onChange]);

  // Update education
  const updateEducation = useCallback((index: number, field: keyof ResumeEducation, value: any) => {
    const updated = [...(resume.education || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resume, education: updated });
  }, [resume, onChange]);

  const addEducation = useCallback(() => {
    onChange({
      ...resume,
      education: [...(resume.education || []), { school: "", degree: "", dates: "", location: "" }],
    });
  }, [resume, onChange]);

  const removeEducation = useCallback((index: number) => {
    onChange({
      ...resume,
      education: (resume.education || []).filter((_, i) => i !== index),
    });
  }, [resume, onChange]);

  // Update skills
  const updateSkillCategory = useCallback((index: number, field: keyof ResumeSkillCategory, value: any) => {
    const updated = [...resume.skills];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resume, skills: updated });
  }, [resume, onChange]);

  const addSkillCategory = useCallback(() => {
    onChange({
      ...resume,
      skills: [...resume.skills, { name: "Skills", items: [] }],
    });
  }, [resume, onChange]);

  const removeSkillCategory = useCallback((index: number) => {
    onChange({
      ...resume,
      skills: resume.skills.filter((_, i) => i !== index),
    });
  }, [resume, onChange]);

  // Update projects
  const updateProject = useCallback((index: number, field: keyof ResumeProject, value: any) => {
    const updated = [...(resume.projects || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resume, projects: updated });
  }, [resume, onChange]);

  const addProject = useCallback(() => {
    onChange({
      ...resume,
      projects: [...(resume.projects || []), { name: "", description: "" }],
    });
  }, [resume, onChange]);

  const removeProject = useCallback((index: number) => {
    onChange({
      ...resume,
      projects: (resume.projects || []).filter((_, i) => i !== index),
    });
  }, [resume, onChange]);

  // Update certifications
  const updateCertification = useCallback((index: number, field: keyof ResumeCertification, value: string) => {
    const updated = [...(resume.certifications || [])];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resume, certifications: updated });
  }, [resume, onChange]);

  const addCertification = useCallback(() => {
    onChange({
      ...resume,
      certifications: [...(resume.certifications || []), { name: "" }],
    });
  }, [resume, onChange]);

  const removeCertification = useCallback((index: number) => {
    onChange({
      ...resume,
      certifications: (resume.certifications || []).filter((_, i) => i !== index),
    });
  }, [resume, onChange]);

  return (
    <div className="space-y-6">
      {/* Basics */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              value={resume.basics.name || ""}
              onChange={(e) => updateBasics("name", e.target.value)}
              className={inputClass}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={resume.basics.title || ""}
              onChange={(e) => updateBasics("title", e.target.value)}
              className={inputClass}
              placeholder="Software Engineer"
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={resume.basics.email || ""}
              onChange={(e) => updateBasics("email", e.target.value)}
              className={inputClass}
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              type="tel"
              value={resume.basics.phone || ""}
              onChange={(e) => updateBasics("phone", e.target.value)}
              className={inputClass}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              type="text"
              value={resume.basics.location || ""}
              onChange={(e) => updateBasics("location", e.target.value)}
              className={inputClass}
              placeholder="San Francisco, CA"
            />
          </div>
          <div>
            <label className={labelClass}>Links (comma-separated)</label>
            <input
              type="text"
              value={(resume.basics.links || []).join(", ")}
              onChange={(e) => updateBasics("links", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
              className={inputClass}
              placeholder="linkedin.com/in/yourprofile, github.com/yourusername"
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Summary</label>
          <textarea
            value={resume.basics.summary || ""}
            onChange={(e) => updateBasics("summary", e.target.value)}
            className={`${inputClass} h-24 resize-none`}
            placeholder="Brief professional summary..."
          />
        </div>
      </div>

      {/* Experience */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitleClass}>Experience</h3>
          <button
            onClick={addExperience}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            + Add
          </button>
        </div>
        {resume.experience.map((exp, index) => (
          <div key={index} className="border border-neutral-100 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div>
                  <label className={labelClass}>Role/Title</label>
                  <input
                    type="text"
                    value={exp.role || ""}
                    onChange={(e) => updateExperience(index, "role", e.target.value)}
                    className={inputClass}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className={labelClass}>Company</label>
                  <input
                    type="text"
                    value={exp.company || ""}
                    onChange={(e) => updateExperience(index, "company", e.target.value)}
                    className={inputClass}
                    placeholder="Google"
                  />
                </div>
                <div>
                  <label className={labelClass}>Dates</label>
                  <input
                    type="text"
                    value={exp.dates || ""}
                    onChange={(e) => updateExperience(index, "dates", e.target.value)}
                    className={inputClass}
                    placeholder="2021 - Present"
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    type="text"
                    value={exp.location || ""}
                    onChange={(e) => updateExperience(index, "location", e.target.value)}
                    className={inputClass}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
              <button
                onClick={() => removeExperience(index)}
                className="ml-2 text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <div>
              <label className={labelClass}>Bullets (one per line)</label>
              <textarea
                value={(exp.bullets || []).join("\n")}
                onChange={(e) => updateExperience(index, "bullets", e.target.value.split("\n").filter(Boolean))}
                className={`${inputClass} h-32 resize-none`}
                placeholder="Led development of key features&#10;Improved performance by 40%&#10;Mentored junior developers"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitleClass}>Education</h3>
          <button
            onClick={addEducation}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            + Add
          </button>
        </div>
        {(resume.education || []).map((edu, index) => (
          <div key={index} className="border border-neutral-100 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div>
                  <label className={labelClass}>School</label>
                  <input
                    type="text"
                    value={edu.school || ""}
                    onChange={(e) => updateEducation(index, "school", e.target.value)}
                    className={inputClass}
                    placeholder="Stanford University"
                  />
                </div>
                <div>
                  <label className={labelClass}>Degree</label>
                  <input
                    type="text"
                    value={edu.degree || ""}
                    onChange={(e) => updateEducation(index, "degree", e.target.value)}
                    className={inputClass}
                    placeholder="B.S. Computer Science"
                  />
                </div>
                <div>
                  <label className={labelClass}>Dates</label>
                  <input
                    type="text"
                    value={edu.dates || ""}
                    onChange={(e) => updateEducation(index, "dates", e.target.value)}
                    className={inputClass}
                    placeholder="2017 - 2021"
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    type="text"
                    value={edu.location || ""}
                    onChange={(e) => updateEducation(index, "location", e.target.value)}
                    className={inputClass}
                    placeholder="Stanford, CA"
                  />
                </div>
              </div>
              <button
                onClick={() => removeEducation(index)}
                className="ml-2 text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitleClass}>Skills</h3>
          <button
            onClick={addSkillCategory}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            + Add Category
          </button>
        </div>
        {resume.skills.map((category, index) => (
          <div key={index} className="border border-neutral-100 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                <div>
                  <label className={labelClass}>Category Name</label>
                  <input
                    type="text"
                    value={category.name || ""}
                    onChange={(e) => updateSkillCategory(index, "name", e.target.value)}
                    className={inputClass}
                    placeholder="Languages"
                  />
                </div>
                <div>
                  <label className={labelClass}>Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={(category.items || []).join(", ")}
                    onChange={(e) => updateSkillCategory(index, "items", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    className={inputClass}
                    placeholder="JavaScript, TypeScript, Python"
                  />
                </div>
              </div>
              <button
                onClick={() => removeSkillCategory(index)}
                className="ml-2 text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitleClass}>Projects</h3>
          <button
            onClick={addProject}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            + Add
          </button>
        </div>
        {(resume.projects || []).map((project, index) => (
          <div key={index} className="border border-neutral-100 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Project Name</label>
                    <input
                      type="text"
                      value={project.name || ""}
                      onChange={(e) => updateProject(index, "name", e.target.value)}
                      className={inputClass}
                      placeholder="My Awesome Project"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Link</label>
                    <input
                      type="text"
                      value={project.link || ""}
                      onChange={(e) => updateProject(index, "link", e.target.value)}
                      className={inputClass}
                      placeholder="github.com/user/project"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={project.description || ""}
                    onChange={(e) => updateProject(index, "description", e.target.value)}
                    className={`${inputClass} h-16 resize-none`}
                    placeholder="Brief description of the project..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Technologies (comma-separated)</label>
                  <input
                    type="text"
                    value={(project.tech || []).join(", ")}
                    onChange={(e) => updateProject(index, "tech", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                    className={inputClass}
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </div>
              </div>
              <button
                onClick={() => removeProject(index)}
                className="ml-2 text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitleClass}>Certifications</h3>
          <button
            onClick={addCertification}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            + Add
          </button>
        </div>
        {(resume.certifications || []).map((cert, index) => (
          <div key={index} className="border border-neutral-100 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="grid grid-cols-3 gap-3 flex-1">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    type="text"
                    value={cert.name || ""}
                    onChange={(e) => updateCertification(index, "name", e.target.value)}
                    className={inputClass}
                    placeholder="AWS Solutions Architect"
                  />
                </div>
                <div>
                  <label className={labelClass}>Issuer</label>
                  <input
                    type="text"
                    value={cert.issuer || ""}
                    onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                    className={inputClass}
                    placeholder="Amazon"
                  />
                </div>
                <div>
                  <label className={labelClass}>Date</label>
                  <input
                    type="text"
                    value={cert.date || ""}
                    onChange={(e) => updateCertification(index, "date", e.target.value)}
                    className={inputClass}
                    placeholder="2023"
                  />
                </div>
              </div>
              <button
                onClick={() => removeCertification(index)}
                className="ml-2 text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
