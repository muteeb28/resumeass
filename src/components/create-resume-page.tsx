"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./button";
import { Navbar } from "./navbar";
import { ResumeGeneratorService, type ResumeData } from "../services/resumeGenerator";

type CreateStep = 'templates' | 'job-description' | 'generating' | 'preview' | 'payment';

interface Template {
  id: string;
  name: string;
  description: string;
  price: number;
  isFree: boolean;
  preview: string;
  features: string[];
}

// Template preview components
const ModernProfessionalPreview = () => (
  <div className="w-full h-full bg-white p-2 text-black text-[8px] overflow-hidden relative">
    <div className="border-b border-gray-300 pb-1 mb-2">
      <h1 className="text-sm font-bold text-gray-900">JOHN SMITH</h1>
      <div className="text-gray-600 text-[7px] space-y-0.5">
        <p>john.smith@email.com • (555) 123-4567</p>
        <p>San Francisco, CA • linkedin.com/in/john</p>
      </div>
    </div>
    
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 text-gray-800">PROFESSIONAL SUMMARY</h2>
      <p className="text-[7px] leading-tight text-gray-700">Results-driven Software Engineer with 5+ years of experience...</p>
    </div>
    
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 text-gray-800">EXPERIENCE</h2>
      <div className="space-y-1">
        <div>
          <div className="flex justify-between text-[7px]">
            <span className="font-semibold">Senior Software Engineer</span>
            <span>2022-Present</span>
          </div>
          <p className="text-[7px] text-gray-600">TechCorp Inc.</p>
          <p className="text-[6px] text-gray-700">• Led development of 3 major features</p>
          <p className="text-[6px] text-gray-700">• Improved team productivity by 30%</p>
        </div>
      </div>
    </div>
    
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 text-gray-800">SKILLS</h2>
      <div className="flex flex-wrap gap-0.5">
        <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-[6px] rounded">React</span>
        <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-[6px] rounded">Node.js</span>
        <span className="px-1 py-0.5 bg-blue-100 text-blue-800 text-[6px] rounded">Python</span>
      </div>
    </div>
    
    <div>
      <h2 className="text-[9px] font-bold mb-1 text-gray-800">EDUCATION</h2>
      <div className="text-[7px] text-gray-700">
        <p className="font-semibold">B.S. Computer Science</p>
        <p>Stanford University, 2019</p>
      </div>
    </div>
  </div>
);

const ExecutivePremiumPreview = () => (
  <div className="w-full h-full bg-white p-2 text-black text-[8px] overflow-hidden">
    <div className="bg-slate-800 text-white p-2 mb-2 -mx-2 -mt-2">
      <h1 className="text-[10px] font-bold">MICHAEL EXECUTIVE</h1>
      <div className="text-slate-200 text-[7px]">
        <p>CTO • San Francisco, CA</p>
        <p>michael@email.com</p>
      </div>
    </div>
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 text-slate-800">EXECUTIVE SUMMARY</h2>
      <p className="text-[7px] leading-tight">Strategic technology leader with 15+ years...</p>
    </div>
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 text-slate-800">LEADERSHIP</h2>
      <div className="border-l-2 border-slate-400 pl-1">
        <div className="text-[7px]">
          <p className="font-semibold">Chief Technology Officer</p>
          <p className="text-gray-600">Fortune 500 Corp | 2020-Present</p>
          <p className="text-[6px]">• Led digital transformation ($50M savings)</p>
        </div>
      </div>
    </div>
  </div>
);

const CreativeDesignerPreview = () => (
  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 p-2 text-black text-[8px] overflow-hidden">
    <div className="text-center mb-2 border-b-2 border-purple-400 pb-1">
      <h1 className="text-[10px] font-bold text-purple-800">SARAH CREATIVE</h1>
      <div className="text-purple-600 text-[7px]">
        <p>UI/UX Designer</p>
        <p>sarah@creative.com • NYC</p>
      </div>
    </div>
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 text-purple-700">CREATIVE SUMMARY</h2>
      <p className="text-[7px] leading-tight">Innovative designer with passion for user-centered design...</p>
    </div>
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 text-purple-700">DESIGN EXPERIENCE</h2>
      <div className="bg-white rounded p-1">
        <div className="text-[7px]">
          <p className="font-semibold">Senior UI Designer</p>
          <p className="text-gray-600">Creative Agency</p>
          <p className="text-[6px]">• Award-winning mobile app (1M+ downloads)</p>
        </div>
      </div>
    </div>
  </div>
);

const TechMinimalPreview = () => (
  <div className="w-full h-full bg-gray-900 text-green-400 p-2 text-[8px] overflow-hidden font-mono">
    <div className="border border-green-400 p-1 mb-2">
      <h1 className="text-[10px] font-bold text-green-300">$ alex_developer</h1>
      <div className="text-green-500 text-[7px]">
        <p>alex@dev.com | github.com/alex</p>
      </div>
    </div>
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 text-green-300">// ABOUT</h2>
      <p className="text-[7px] leading-tight">Full-stack developer specialized in modern web technologies...</p>
    </div>
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 text-green-300">// EXPERIENCE</h2>
      <div className="text-[7px]">
        <p><span className="text-yellow-400">const</span> senior_dev = &#123;</p>
        <p className="ml-2">company: <span className="text-blue-400">"TechStartup"</span>,</p>
        <p className="ml-2">role: <span className="text-blue-400">"Senior Dev"</span></p>
        <p>&#125;;</p>
      </div>
    </div>
  </div>
);

const AcademicResearchPreview = () => (
  <div className="w-full h-full bg-white p-2 text-black text-[8px] overflow-hidden">
    <div className="text-center border-b-2 border-black pb-1 mb-2">
      <h1 className="text-[10px] font-bold">DR. ROBERT RESEARCH</h1>
      <div className="text-gray-700 text-[7px]">
        <p>Professor of Computer Science</p>
        <p>r.research@university.edu</p>
      </div>
    </div>
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 underline">RESEARCH INTERESTS</h2>
      <p className="text-[7px] leading-tight">Machine Learning, NLP, Computer Vision...</p>
    </div>
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 underline">PUBLICATIONS</h2>
      <div className="text-[6px]">
        <p>• Research, R. et al. (2024). "Advanced ML Techniques." Nature AI, 15(3).</p>
        <p>• Research, R. (2023). "Deep Learning Applications." Science, 380(6645).</p>
      </div>
    </div>
  </div>
);

const SalesImpactPreview = () => (
  <div className="w-full h-full bg-blue-50 p-2 text-black text-[8px] overflow-hidden">
    <div className="bg-blue-600 text-white p-2 mb-2 -mx-2 -mt-2 relative">
      <h1 className="text-[10px] font-bold">LISA SALESPERSON</h1>
      <div className="text-blue-100 text-[7px]">
        <p>Sales Director • lisa@company.com</p>
      </div>
      <div className="absolute top-1 right-1 bg-yellow-400 text-black px-1 py-0.5 text-[6px] font-bold rounded">
        TOP PERFORMER
      </div>
    </div>
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 text-blue-700">PERFORMANCE</h2>
      <p className="text-[7px] leading-tight">High-performing sales professional with 150%+ quota achievement...</p>
    </div>
    <div className="mb-2">
      <h2 className="text-[9px] font-bold mb-1 text-blue-700">ACHIEVEMENTS</h2>
      <div className="space-y-1">
        <div className="bg-green-100 p-1 rounded text-[6px]">
          <strong>$2.5M</strong> Annual Revenue
        </div>
        <div className="bg-yellow-100 p-1 rounded text-[6px]">
          <strong>175%</strong> of Sales Quota
        </div>
      </div>
    </div>
  </div>
);

const templates: Template[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Clean, ATS-friendly design perfect for tech and corporate roles',
    price: 0,
    isFree: true,
    preview: 'ModernProfessionalPreview',
    features: ['ATS Optimized', 'Clean Layout', 'Professional Typography', 'Single Page']
  },
  {
    id: 'executive-premium',
    name: 'Executive Premium',
    description: 'Sophisticated design for senior management and executive positions',
    price: 12,
    isFree: false,
    preview: 'ExecutivePremiumPreview',
    features: ['Premium Design', 'Multi-page Support', 'Custom Branding', 'Executive Layout']
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    description: 'Eye-catching template for creative professionals and designers',
    price: 15,
    isFree: false,
    preview: 'CreativeDesignerPreview',
    features: ['Creative Layout', 'Portfolio Section', 'Color Customization', 'Visual Elements']
  },
  {
    id: 'tech-minimal',
    name: 'Tech Minimal',
    description: 'Minimalist design optimized for software engineers and developers',
    price: 10,
    isFree: false,
    preview: 'TechMinimalPreview',
    features: ['Developer Focused', 'Skills Matrix', 'Project Showcase', 'GitHub Integration']
  },
  {
    id: 'academic-research',
    name: 'Academic Research',
    description: 'Formal template for researchers, professors, and academic positions',
    price: 8,
    isFree: false,
    preview: 'AcademicResearchPreview',
    features: ['Publication List', 'Research Focus', 'Academic Format', 'Citation Ready']
  },
  {
    id: 'sales-impact',
    name: 'Sales Impact',
    description: 'Results-focused template for sales professionals and business development',
    price: 12,
    isFree: false,
    preview: 'SalesImpactPreview',
    features: ['Metrics Focused', 'Achievement Highlights', 'Performance Charts', 'Results Driven']
  }
];

const TemplateCard = ({ 
  template, 
  onSelect, 
  isSelected 
}: { 
  template: Template; 
  onSelect: (template: Template) => void;
  isSelected: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -5 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    className={`relative bg-slate-800/50 rounded-xl overflow-hidden cursor-pointer transition-all shadow-lg hover:shadow-2xl ${
      isSelected ? 'ring-2 ring-purple-500 shadow-purple-500/25' : 'hover:bg-slate-800/70'
    }`}
    onClick={() => onSelect(template)}
  >
    {template.isFree && (
      <div className="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
        FREE
      </div>
    )}
    
    {!template.isFree && (
      <div className="absolute top-4 right-4 z-10 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
        ${template.price}
      </div>
    )}

    <div className="aspect-[3/4] bg-slate-100 border-2 border-slate-300 rounded-lg flex items-center justify-center relative overflow-hidden group shadow-inner">
      {template.id === 'modern-professional' && <ModernProfessionalPreview />}
      {template.id === 'executive-premium' && <ExecutivePremiumPreview />}
      {template.id === 'creative-designer' && <CreativeDesignerPreview />}
      {template.id === 'tech-minimal' && <TechMinimalPreview />}
      {template.id === 'academic-research' && <AcademicResearchPreview />}
      {template.id === 'sales-impact' && <SalesImpactPreview />}
      
      {/* Fallback if no preview matches */}
      {!['modern-professional', 'executive-premium', 'creative-designer', 'tech-minimal', 'academic-research', 'sales-impact'].includes(template.id) && (
        <div className="text-slate-400 text-4xl">📄</div>
      )}
      
      {/* Template name label at bottom */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-black bg-opacity-70 text-white text-[10px] px-2 py-1 rounded text-center">
          {template.name}
        </div>
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
        <div className="text-white font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black bg-opacity-70 px-4 py-2 rounded-lg">
          Select Template
        </div>
      </div>
    </div>

    <div className="p-6">
      <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
      <p className="text-slate-400 text-sm mb-4">{template.description}</p>
      
      <div className="space-y-2 mb-4">
        {template.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
            {feature}
          </div>
        ))}
      </div>

      <Button 
        className={`w-full ${isSelected ? 'bg-purple-600' : ''}`}
        variant={isSelected ? 'default' : 'outline'}
      >
        {isSelected ? 'Selected' : template.isFree ? 'Use Free Template' : `Use Template - $${template.price}`}
      </Button>
    </div>
  </motion.div>
);

const TemplateSelection = ({ 
  onTemplateSelect, 
  selectedTemplate 
}: { 
  onTemplateSelect: (template: Template) => void;
  selectedTemplate: Template | null;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-7xl mx-auto"
  >
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-white mb-4">
        Choose Your Resume Template
      </h2>
      <p className="text-slate-400 text-lg max-w-2xl mx-auto">
        Select from our professionally designed templates. Start with our free template or choose a premium design for advanced features.
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onSelect={onTemplateSelect}
          isSelected={selectedTemplate?.id === template.id}
        />
      ))}
    </div>

    {selectedTemplate && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Button 
          size="lg" 
          onClick={() => {/* Continue to next step */}}
          className="px-12"
        >
          Continue with {selectedTemplate.name}
        </Button>
      </motion.div>
    )}
  </motion.div>
);

const JobDescriptionForm = ({ 
  onSubmit, 
  onBack,
  selectedTemplate 
}: { 
  onSubmit: (jobDescription: string) => void;
  onBack: () => void;
  selectedTemplate: Template;
}) => {
  const [jobDescription, setJobDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim()) {
      onSubmit(jobDescription.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Job Description for AI Resume Creation
        </h2>
        <p className="text-slate-400 text-lg">
          Paste the job description and our AI will create a tailored resume using the <strong>{selectedTemplate.name}</strong> template
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="job-description" className="block text-sm font-medium text-slate-300 mb-2">
            Job Description
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here. Our AI will analyze the requirements and create a perfectly tailored resume..."
            className="w-full h-64 px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            required
          />
        </div>
        
        <div className="flex gap-4 justify-center">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="px-8"
          >
            Back to Templates
          </Button>
          <Button 
            type="submit"
            className="px-8"
            disabled={!jobDescription.trim()}
          >
            Generate Resume with AI
          </Button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-slate-800/30 rounded-lg">
        <p className="text-sm text-slate-400 text-center">
          🤖 <strong>AI-Powered:</strong> Our DeepSeek AI will analyze the job requirements and create a compelling resume that highlights your relevant skills and experience.
        </p>
      </div>
    </motion.div>
  );
};

const GeneratingAnimation = ({ selectedTemplate }: { selectedTemplate: Template }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="max-w-2xl mx-auto text-center"
  >
    <div className="mb-8">
      <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Creating Your Resume</h2>
      <p className="text-slate-400 text-lg">AI is crafting your perfect resume using the {selectedTemplate.name} template...</p>
    </div>

    <div className="space-y-4 text-left max-w-lg mx-auto">
      {[
        "Analyzing job requirements...",
        "Matching your skills to role...", 
        "Crafting compelling descriptions...",
        "Optimizing for ATS systems...",
        "Finalizing your resume..."
      ].map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.8 }}
          className="flex items-center gap-3 text-slate-300"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.8 + 0.3 }}
            className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"
          />
          {step}
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const ResumePreview = ({ 
  resume, 
  template 
}: { 
  resume: ResumeData;
  template: Template;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-6xl mx-auto"
  >
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold text-white mb-4">
        Your Resume is Ready! 🎉
      </h2>
      <p className="text-slate-400 text-lg">
        AI-generated resume using the <strong>{template.name}</strong> template
      </p>
    </div>

    <div className="grid lg:grid-cols-3 gap-8">
      {/* Resume Preview */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-xl p-8 text-black">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{resume.personalInfo.name}</h1>
            <div className="mt-2 text-gray-600 space-y-1">
              <div className="flex items-center gap-4 flex-wrap">
                <span>{resume.personalInfo.email}</span>
                <span>{resume.personalInfo.phone}</span>
                <span>{resume.personalInfo.location}</span>
              </div>
              {resume.personalInfo.linkedIn && (
                <div className="flex items-center gap-4">
                  <span>{resume.personalInfo.linkedIn}</span>
                  {resume.personalInfo.portfolio && <span>{resume.personalInfo.portfolio}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
          </div>

          {/* Experience */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
            <div className="space-y-6">
              {resume.experience.map((exp, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                    </div>
                    <span className="text-gray-600 text-sm">{exp.duration}</span>
                  </div>
                  <div className="text-gray-700 space-y-1">
                    {exp.description.map((desc, descIndex) => (
                      <p key={descIndex} className="text-sm">{desc}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Skills</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.technical.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.soft.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Education</h2>
            {resume.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700">{edu.institution}</p>
                  </div>
                  <div className="text-right text-gray-600">
                    <p>{edu.graduation}</p>
                    {edu.gpa && <p className="text-sm">GPA: {edu.gpa}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Projects */}
          {resume.projects && resume.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Projects</h2>
              {resume.projects.map((project, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {resume.certifications && resume.certifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Certifications</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {resume.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Actions Panel */}
      <div className="lg:col-span-1">
        <div className="bg-slate-800/50 rounded-xl p-6 sticky top-8">
          <h3 className="text-xl font-bold text-white mb-4">Download Options</h3>
          
          <div className="space-y-4 mb-6">
            <Button className="w-full" size="lg">
              📄 Download PDF
            </Button>
            <Button variant="outline" className="w-full">
              📝 Download Word
            </Button>
            <Button variant="outline" className="w-full">
              ✏️ Edit Resume
            </Button>
          </div>

          <div className="border-t border-slate-600 pt-6">
            <h4 className="text-white font-semibold mb-3">Template: {template.name}</h4>
            <div className="space-y-2 text-sm text-slate-300">
              {template.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.location.reload()}
            >
              Create Another Resume
            </Button>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export const CreateResumePage = () => {
  const [currentStep, setCurrentStep] = useState<CreateStep>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);
  
  // Initialize the AI service
  const resumeGenerator = new ResumeGeneratorService();

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    if (template.isFree) {
      setCurrentStep('job-description');
    } else {
      // For paid templates, could show payment first
      setCurrentStep('job-description');
    }
  };

  const handleJobDescriptionSubmit = async (jobDescription: string) => {
    setCurrentStep('generating');
    
    if (!selectedTemplate) return;
    
    try {
      // Generate resume with AI
      const resume = await resumeGenerator.generateResume(jobDescription, selectedTemplate.id);
      setGeneratedResume(resume);
      setCurrentStep('preview');
    } catch (error) {
      console.error('Resume generation failed:', error);
      // Still proceed to preview with fallback data
      setCurrentStep('preview');
    }
  };

  const handleBackToTemplates = () => {
    setCurrentStep('templates');
    setSelectedTemplate(null);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 'templates' && (
              <motion.div key="templates">
                <TemplateSelection 
                  onTemplateSelect={handleTemplateSelect}
                  selectedTemplate={selectedTemplate}
                />
              </motion.div>
            )}
            
            {currentStep === 'job-description' && selectedTemplate && (
              <motion.div key="job-description">
                <JobDescriptionForm 
                  onSubmit={handleJobDescriptionSubmit}
                  onBack={handleBackToTemplates}
                  selectedTemplate={selectedTemplate}
                />
              </motion.div>
            )}
            
            {currentStep === 'generating' && selectedTemplate && (
              <motion.div key="generating">
                <GeneratingAnimation selectedTemplate={selectedTemplate} />
              </motion.div>
            )}
            
            {currentStep === 'preview' && generatedResume && selectedTemplate && (
              <motion.div key="preview">
                <ResumePreview 
                  resume={generatedResume}
                  template={selectedTemplate}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
