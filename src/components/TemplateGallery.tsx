"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Navbar } from "./navbar";
import TemplateClassic from "../templates/TemplateClassic";
import TemplateModern from "../templates/TemplateModern";
import TemplateExecutive from "../templates/TemplateExecutive";
import TemplateCreative from "../templates/TemplateCreative";
import TemplateTech from "../templates/TemplateTech";
import TemplateMinimal from "../templates/TemplateMinimal";
import TemplateSplit from "../templates/TemplateSplit";
import { sampleResumeV1Extended } from "../utils/testResumeData";

const templates = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Contemporary design with gradient header and clean sections",
    Component: TemplateModern,
    preview: "/template-previews/modern.png",
    features: ["Gradient header", "Modern typography", "Clean sections", "Professional look"]
  },
  {
    id: "executive",
    name: "Executive",
    description: "Sophisticated design perfect for senior leadership roles",
    Component: TemplateExecutive,
    preview: "/template-previews/executive.png",
    features: ["Elegant typography", "Centered layout", "Executive styling", "Premium feel"]
  },
  {
    id: "creative",
    name: "Creative",
    description: "Stylish design with subtle colors and creative elements",
    Component: TemplateCreative,
    preview: "/template-previews/creative.png",
    features: ["Color accents", "Creative elements", "Modern fonts", "Visual appeal"]
  },
  {
    id: "tech",
    name: "Tech Specialist",
    description: "Developer-focused design with terminal-style elements",
    Component: TemplateTech,
    preview: "/template-previews/tech.png",
    features: ["Terminal styling", "Monospace fonts", "Code-like design", "Tech-focused"]
  },
  {
    id: "minimal",
    name: "Minimal Elite",
    description: "Ultra-clean minimalist design for maximum impact",
    Component: TemplateMinimal,
    preview: "/template-previews/minimal.png",
    features: ["Ultra-clean", "Minimalist", "Maximum impact", "Elegant simplicity"]
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional ATS-friendly layout that works everywhere",
    Component: TemplateClassic,
    preview: "/template-previews/classic.png",
    features: ["ATS-friendly", "Traditional", "Universal", "Time-tested"]
  },
  {
    id: "split",
    name: "Split Layout",
    description: "Two-column design with sidebar for skills and projects",
    Component: TemplateSplit,
    preview: "/template-previews/split.png",
    features: ["Two-column", "Sidebar layout", "Space efficient", "Modern structure"]
  }
];

export default function TemplateGallery() {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [showPreview, setShowPreview] = useState(false);

  const SelectedComponent = selectedTemplate.Component;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar tone="light" />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              Beautiful Resume Templates
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose from our collection of professionally designed resume templates. 
              Each template is ATS-friendly and optimized for modern hiring practices.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
            {/* Template List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Templates</h2>
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedTemplate.id === template.id
                      ? "border-slate-900 bg-white shadow-lg"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {template.name}
                    </h3>
                    {selectedTemplate.id === template.id && (
                      <div className="h-2 w-2 rounded-full bg-slate-900"></div>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm mb-4">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.features.map((feature, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Template Preview */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Preview</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </button>
                  <button
                    onClick={() => window.location.href = "/create"}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Use This Template
                  </button>
                </div>
              </div>

              {showPreview ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                  style={{ aspectRatio: "8.5/11" }}
                >
                  <div className="h-full overflow-auto">
                    <div className="transform scale-75 origin-top-left" style={{ width: "133.33%" }}>
                      <SelectedComponent resume={sampleResumeV1Extended} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl shadow-lg p-12 text-center"
                  style={{ aspectRatio: "8.5/11" }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-slate-600 mb-6 max-w-sm">
                      Click "Show Preview" to see how this template looks with sample resume data.
                    </p>
                    <button
                      onClick={() => setShowPreview(true)}
                      className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Show Preview
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-20 text-center bg-white rounded-2xl p-12 shadow-lg"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Create Your Resume?
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Upload your existing resume and transform it into any of these beautiful templates in minutes.
            </p>
            <button
              onClick={() => window.location.href = "/create"}
              className="px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-xl hover:bg-slate-800 transition-colors"
            >
              Get Started Now
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}