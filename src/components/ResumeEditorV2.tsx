"use client";

import { useState, useCallback } from "react";
import { User, Camera, Link as LinkIcon, Briefcase, FolderGit2, GraduationCap, Award, FileText } from "lucide-react";
import type { ResumeJSONv2 } from "@/types/resume";

interface ResumeEditorV2Props {
  resume: ResumeJSONv2;
  onChange: (resume: ResumeJSONv2) => void;
}

const inputClass = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10";
const labelClass = "block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1.5";
const buttonClass = "rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors";
const buttonDangerClass = "rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors";
const cardClass = "rounded-lg border border-neutral-200 bg-white p-4";

export default function ResumeEditorV2({ resume, onChange }: ResumeEditorV2Props) {
  const [activeSection, setActiveSection] = useState<string>("personal");

  // Update basics
  const updateBasics = useCallback((field: keyof typeof resume.basics, value: string | string[]) => {
    onChange({
      ...resume,
      basics: { ...resume.basics, [field]: value },
    });
  }, [resume, onChange]);

  // Handle photo upload
  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      updateBasics('photo', reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [updateBasics]);

  // Update section item
  const updateSectionItem = useCallback((sectionId: string, itemIndex: number, updates: any) => {
    const section = resume.sections[sectionId];
    if (!section) return;

    const updatedItems = [...section.items];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };

    onChange({
      ...resume,
      sections: {
        ...resume.sections,
        [sectionId]: {
          ...section,
          items: updatedItems,
        },
      },
    });
  }, [resume, onChange]);

  // Add item to section
  const addSectionItem = useCallback((sectionId: string, newItem: any) => {
    const section = resume.sections[sectionId];
    if (!section) return;

    onChange({
      ...resume,
      sections: {
        ...resume.sections,
        [sectionId]: {
          ...section,
          items: [...section.items, newItem],
        },
      },
    });
  }, [resume, onChange]);

  // Remove item from section
  const removeSectionItem = useCallback((sectionId: string, itemIndex: number) => {
    const section = resume.sections[sectionId];
    if (!section) return;

    onChange({
      ...resume,
      sections: {
        ...resume.sections,
        [sectionId]: {
          ...section,
          items: section.items.filter((_, i) => i !== itemIndex),
        },
      },
    });
  }, [resume, onChange]);

  // Define sections
  const sections = [
    {
      id: 'personal',
      label: 'Personal Info',
      icon: User,
      hasData: () => Boolean(resume.basics?.name)
    },
    {
      id: 'photo',
      label: 'Profile Photo',
      icon: Camera,
      hasData: () => Boolean(resume.basics?.photo)
    },
    {
      id: 'links',
      label: 'Social Links',
      icon: LinkIcon,
      hasData: () => (resume.basics?.links?.length || 0) > 0
    },
  ];

  // Add resume sections dynamically
  const sortedSections = Object.keys(resume.sections || {})
    .map(k => ({ ...resume.sections[k], id: k }))
    .filter(s => s.visible !== false)
    .sort((a, b) => (a.order || 100) - (b.order || 100));

  sortedSections.forEach(s => {
    const iconMap: Record<string, any> = {
      timeline: Briefcase,
      projects: FolderGit2,
      education: GraduationCap,
      certifications: Award,
      text: FileText,
      list: FileText,
    };

    sections.push({
      id: s.id,
      label: s.label,
      icon: iconMap[s.layout] || FileText,
      hasData: () => (s.items?.length || 0) > 0,
    });
  });

  // Render main content
  const renderContent = () => {
    if (activeSection === 'personal') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-900">Personal Information</h2>

          <div className={cardClass + " space-y-4"}>
            <div>
              <label className={labelClass}>Full name</label>
              <input
                type="text"
                value={resume.basics.name || ''}
                onChange={(e) => updateBasics('name', e.target.value)}
                className={inputClass}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className={labelClass}>Headline</label>
              <input
                type="text"
                value={resume.basics.title || ''}
                onChange={(e) => updateBasics('title', e.target.value)}
                className={inputClass}
                placeholder="Lead Mobile Developer & Flutter Engineer"
              />
            </div>

            <div>
              <label className={labelClass}>Summary</label>
              <textarea
                value={resume.basics.summary || ''}
                onChange={(e) => updateBasics('summary', e.target.value)}
                className={inputClass}
                rows={4}
                placeholder="Software developer with contract experience building production apps for iOS and Android..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={resume.basics.email || ''}
                  onChange={(e) => updateBasics('email', e.target.value)}
                  className={inputClass}
                  placeholder="john.doe@example.com"
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={resume.basics.phone || ''}
                  onChange={(e) => updateBasics('phone', e.target.value)}
                  className={inputClass}
                  placeholder="+1 555 0100"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={resume.basics.location || ''}
                onChange={(e) => updateBasics('location', e.target.value)}
                className={inputClass}
                placeholder="San Francisco, CA"
              />
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'photo') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-900">Profile Photo</h2>

          <div className={cardClass}>
            <div className="flex flex-col items-center gap-6 py-8">
              {resume.basics.photo ? (
                <div className="relative">
                  <img
                    src={resume.basics.photo}
                    alt="Profile"
                    className="h-40 w-40 rounded-full object-cover border-4 border-neutral-200"
                  />
                  <button
                    onClick={() => updateBasics('photo', '')}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition-colors"
                    title="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="h-40 w-40 rounded-full bg-neutral-100 border-4 border-dashed border-neutral-300 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-neutral-400" />
                </div>
              )}

              <div className="w-full max-w-md">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="block w-full text-sm text-neutral-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-neutral-900 file:text-white
                    hover:file:bg-neutral-800 file:cursor-pointer cursor-pointer"
                />
                <p className="text-xs text-neutral-400 mt-2">
                  Upload a square photo (JPG, PNG). Recommended size: 400x400px
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === 'links') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-neutral-900">Social Links</h2>

          <div className={cardClass + " space-y-4"}>
            <div>
              <label className={labelClass}>Links (one per line)</label>
              <textarea
                value={(resume.basics.links || []).join('\n')}
                onChange={(e) => updateBasics('links', e.target.value.split('\n').filter(l => l.trim()))}
                className={inputClass}
                rows={5}
                placeholder="linkedin.com/in/username&#10;github.com/username&#10;twitter.com/username"
              />
              <p className="text-xs text-neutral-400 mt-1.5">
                Enter your profile links, one per line
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Render resume sections
    const section = resume.sections[activeSection];
    if (!section) return null;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-neutral-900">{section.label}</h2>

        {section.layout === 'timeline' && renderTimelineSection(activeSection, section)}
        {section.layout === 'education' && renderEducationSection(activeSection, section)}
        {section.layout === 'projects' && renderProjectsSection(activeSection, section)}
        {section.layout === 'list' && renderListSection(activeSection, section)}
        {section.layout === 'certifications' && renderCertificationsSection(activeSection, section)}
        {section.layout === 'text' && renderTextSection(activeSection, section)}
      </div>
    );
  };

  const renderTimelineSection = (sectionId: string, section: any) => (
    <div className="space-y-4">
      {section.items.map((item: any, i: number) => (
        <div key={i} className={cardClass + " space-y-4"}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => updateSectionItem(sectionId, i, { title: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Dates</label>
              <input
                type="text"
                value={item.dates || ''}
                onChange={(e) => updateSectionItem(sectionId, i, { dates: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Organization</label>
              <input
                type="text"
                value={item.organization || ''}
                onChange={(e) => updateSectionItem(sectionId, i, { organization: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={item.location || ''}
                onChange={(e) => updateSectionItem(sectionId, i, { location: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Description (one bullet per line)</label>
            <textarea
              value={(item.bullets || []).join('\n')}
              onChange={(e) => updateSectionItem(sectionId, i, { bullets: e.target.value.split('\n') })}
              className={inputClass}
              rows={4}
            />
          </div>
          <button onClick={() => removeSectionItem(sectionId, i)} className={buttonDangerClass}>
            Remove Entry
          </button>
        </div>
      ))}
      <button
        onClick={() => addSectionItem(sectionId, { type: 'timeline', title: '', organization: '', dates: '', location: '', bullets: [''] })}
        className={buttonClass}
      >
        Add Entry
      </button>
    </div>
  );

  const renderEducationSection = (sectionId: string, section: any) => (
    <div className="space-y-4">
      {section.items.map((item: any, i: number) => (
        <div key={i} className={cardClass + " space-y-4"}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>School</label>
              <input
                type="text"
                value={item.school || ''}
                onChange={(e) => updateSectionItem(sectionId, i, { school: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Degree</label>
              <input
                type="text"
                value={item.degree || ''}
                onChange={(e) => updateSectionItem(sectionId, i, { degree: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Dates</label>
              <input
                type="text"
                value={item.dates || ''}
                onChange={(e) => updateSectionItem(sectionId, i, { dates: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Location</label>
              <input
                type="text"
                value={item.location || ''}
                onChange={(e) => updateSectionItem(sectionId, i, { location: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>GPA</label>
              <input
                type="text"
                value={item.gpa || ''}
                onChange={(e) => updateSectionItem(sectionId, i, { gpa: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <button onClick={() => removeSectionItem(sectionId, i)} className={buttonDangerClass}>
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={() => addSectionItem(sectionId, { type: 'education', school: '', degree: '', dates: '', location: '', gpa: '' })}
        className={buttonClass}
      >
        Add Education
      </button>
    </div>
  );

  const renderProjectsSection = (sectionId: string, section: any) => (
    <div className="space-y-4">
      {section.items.map((item: any, i: number) => (
        <div key={i} className={cardClass + " space-y-4"}>
          <div>
            <label className={labelClass}>Project Name</label>
            <input
              type="text"
              value={item.name || ''}
              onChange={(e) => updateSectionItem(sectionId, i, { name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={item.description || ''}
              onChange={(e) => updateSectionItem(sectionId, i, { description: e.target.value })}
              className={inputClass}
              rows={2}
            />
          </div>
          <div>
            <label className={labelClass}>Link</label>
            <input
              type="text"
              value={item.link || ''}
              onChange={(e) => updateSectionItem(sectionId, i, { link: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Technologies</label>
            <input
              type="text"
              value={(item.tech || []).join(', ')}
              onChange={(e) => updateSectionItem(sectionId, i, { tech: e.target.value.split(',').map(t => t.trim()) })}
              className={inputClass}
              placeholder="React, TypeScript, Node.js"
            />
          </div>
          <button onClick={() => removeSectionItem(sectionId, i)} className={buttonDangerClass}>
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={() => addSectionItem(sectionId, { type: 'project', name: '', description: '', link: '', tech: [] })}
        className={buttonClass}
      >
        Add Project
      </button>
    </div>
  );

  const renderListSection = (sectionId: string, section: any) => (
    <div className={cardClass}>
      <label className={labelClass}>Items (one per line)</label>
      <textarea
        value={section.items.map((item: any) => item.value || item).join('\n')}
        onChange={(e) => {
          const newItems = e.target.value.split('\n').map(v => ({ value: v.trim() })).filter(i => i.value);
          onChange({
            ...resume,
            sections: {
              ...resume.sections,
              [sectionId]: { ...section, items: newItems },
            },
          });
        }}
        className={inputClass}
        rows={8}
      />
    </div>
  );

  const renderCertificationsSection = (sectionId: string, section: any) => (
    <div className="space-y-4">
      {section.items.map((item: any, i: number) => (
        <div key={i} className={cardClass + " space-y-4"}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={item.name || ''}
                onChange={(e) => updateSectionItem(sectionId, i, { name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Issuer</label>
              <input
                type="text"
                value={item.issuer || ''}
                onChange={(e) => updateSectionItem(sectionId, i, { issuer: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input
                type="text"
                value={item.date || ''}
                onChange={(e) => updateSectionItem(sectionId, i, { date: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <button onClick={() => removeSectionItem(sectionId, i)} className={buttonDangerClass}>
            Remove
          </button>
        </div>
      ))}
      <button
        onClick={() => addSectionItem(sectionId, { type: 'certification', name: '', issuer: '', date: '' })}
        className={buttonClass}
      >
        Add Certification
      </button>
    </div>
  );

  const renderTextSection = (sectionId: string, section: any) => (
    <div className={cardClass}>
      <textarea
        value={section.items.map((item: any) => item.content || item).join('\n\n')}
        onChange={(e) => {
          const newItems = e.target.value.split('\n\n').map(c => ({ content: c.trim() })).filter(i => i.content);
          onChange({
            ...resume,
            sections: {
              ...resume.sections,
              [sectionId]: { ...section, items: newItems },
            },
          });
        }}
        className={inputClass}
        rows={8}
      />
    </div>
  );

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar Navigation - Exact portfolioly style */}
      <nav className="w-64 flex-shrink-0 rounded-lg border border-neutral-200 bg-white p-3">
        <div className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const hasData = section.hasData();

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-md w-full min-h-[44px]
                  text-sm font-medium transition-all duration-150 ease-in-out
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2
                  ${isActive
                    ? 'bg-neutral-900 text-white border-l-4 border-white/20 pl-[8px]'
                    : 'text-neutral-600 hover:bg-neutral-100'
                  }
                `}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{section.label}</span>
                {/* Green completion dot */}
                <span
                  className={`h-2 w-2 rounded-full flex-shrink-0 ml-auto ${hasData
                      ? (isActive ? 'bg-white' : 'bg-green-500')
                      : 'bg-neutral-300'
                    }`}
                  aria-label={hasData ? "Completed" : "Empty"}
                />
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
