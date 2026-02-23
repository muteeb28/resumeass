"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./button";
import { Navbar } from "./navbar";
import { DeepSeekOptimizationService } from "../services/deepseekOptimization";

type OptimizeStep = 'upload' | 'target-role' | 'job-description' | 'optimizing' | 'template-selection' | 'payment';


import { FileUpload } from "./file-upload";

const TargetRoleForm = ({ onSubmit, onBack }: {
  onSubmit: (targetRole: string) => void;
  onBack: () => void;
}) => {
  const [targetRole, setTargetRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetRole.trim()) {
      onSubmit(targetRole.trim());
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
          What's Your Target Role?
        </h2>
        <p className="text-slate-400 text-lg">
          Tell us the specific position you're applying for so we can optimize your resume accordingly
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="target-role" className="block text-sm font-medium text-slate-300 mb-2">
            Target Job Title
          </label>
          <input
            id="target-role"
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., Senior Software Engineer, Product Manager, Data Scientist"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            Back
          </Button>
          <Button
            type="submit"
            className="px-8"
            disabled={!targetRole.trim()}
          >
            Continue
          </Button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-slate-800/30 rounded-lg">
        <p className="text-sm text-slate-400 text-center">
          💡 <strong>Tip:</strong> Be specific with your target role. This helps our AI tailor
          the optimization to match industry expectations and required skills.
        </p>
      </div>
    </motion.div>
  );
};

const JobDescriptionForm = ({ onSubmit, onBack }: {
  onSubmit: (jobDescription: string) => void;
  onBack: () => void;
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
          Add Job Description
        </h2>
        <p className="text-slate-400 text-lg">
          Paste the job description so our AI can optimize your resume to match the specific requirements
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
            placeholder="Paste the complete job description here..."
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
            Back
          </Button>
          <Button
            type="submit"
            className="px-8"
            disabled={!jobDescription.trim()}
          >
            Optimize Resume
          </Button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-slate-800/30 rounded-lg">
        <p className="text-sm text-slate-400 text-center">
          💡 <strong>Tip:</strong> Including a job description helps our AI analyze keyword matches,
          required skills, and experience alignment for better ATS optimization.
        </p>
      </div>
    </motion.div>
  );
};

const OptimizingAnimation = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="max-w-2xl mx-auto text-center"
  >
    <div className="mb-8">
      <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">Optimizing Your Resume</h2>
      <p className="text-slate-400 text-lg">Our AI is enhancing your resume for maximum impact...</p>
    </div>

    <div className="space-y-4 text-left max-w-lg mx-auto">
      {[
        "Analyzing target role requirements...",
        "Matching keywords to job description...",
        "Enhancing experience descriptions...",
        "Optimizing skill presentation...",
        "Creating tailored templates..."
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

interface OptimizedResume {
  fixes: string[];
  improvements: string[];
  optimizedContent: string;
  templates: {
    id: string;
    name: string;
    description: string;
    price: number;
    preview: string;
  }[];
}


const TemplateSelection = ({
  optimizedResume,
  onSelectTemplate
}: {
  optimizedResume: OptimizedResume;
  onSelectTemplate: (templateId: string, price: number) => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-12">
        <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Resume Optimized Successfully!</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Our AI has enhanced your resume. Here's what we fixed and 3 professional templates to choose from.
        </p>
      </div>

      {/* Fixes and Improvements */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Fixes Applied */}
        <div className="bg-slate-800/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            Issues Fixed
          </h3>
          <div className="space-y-3">
            {optimizedResume.fixes.map((fix, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-slate-300 text-sm">{fix}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Improvements Made */}
        <div className="bg-slate-800/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Enhancements Added
          </h3>
          <div className="space-y-3">
            {optimizedResume.improvements.map((improvement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                <p className="text-slate-300 text-sm">{improvement}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-white text-center mb-8">
          Choose Your Optimized Resume Template
        </h3>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Templates Grid */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">Choose Your Template:</h3>
            <div className="space-y-4">
              {optimizedResume.templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-700/50 transition-colors cursor-pointer border-2 border-transparent hover:border-blue-500"
                  onClick={() => onSelectTemplate(template.id, template.price)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-1">{template.name}</h4>
                      <p className="text-slate-400 text-sm mb-3">{template.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-white">${template.price}</span>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTemplate(template.id, template.price);
                          }}
                        >
                          Select This Template
                        </Button>
                      </div>
                    </div>
                    <div className="w-16 h-20 bg-white rounded shadow-sm flex-shrink-0 ml-4">
                      {/* Mini template preview */}
                      {template.id === 'professional-ats' && (
                        <div className="h-full p-2 text-xs">
                          <div className="h-1 bg-blue-600 mb-1 rounded"></div>
                          <div className="space-y-0.5">
                            <div className="h-0.5 bg-gray-400 rounded"></div>
                            <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-0.5 bg-gray-400 rounded w-1/2"></div>
                          </div>
                        </div>
                      )}
                      {template.id === 'modern-executive' && (
                        <div className="h-full p-2 text-xs">
                          <div className="h-2 bg-gray-900 mb-1 rounded"></div>
                          <div className="border-l border-gray-900 pl-1 space-y-0.5">
                            <div className="h-0.5 bg-gray-400 rounded"></div>
                            <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-0.5 bg-gray-400 rounded w-1/2"></div>
                          </div>
                        </div>
                      )}
                      {template.id === 'creative-impact' && (
                        <div className="h-full p-2 text-xs">
                          <div className="h-2 bg-gradient-to-r from-purple-600 to-blue-600 mb-1 rounded"></div>
                          <div className="space-y-0.5">
                            <div className="h-0.5 bg-purple-300 rounded p-0.5">
                              <div className="h-full bg-purple-600 rounded"></div>
                            </div>
                            <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-0.5 bg-gray-400 rounded w-1/2"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Your Optimized Resume Preview:</h3>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-h-[700px] overflow-y-auto">
              <div className="p-8">
                {/* Default to first template preview */}
                <div className="space-y-4 text-black">
                  <div className="border-b-2 border-blue-600 pb-3">
                    <h1 className="text-2xl font-bold text-blue-600 mb-1">YOUR NAME</h1>
                    <p className="text-gray-600">your.email@email.com | (555) 123-4567 | LinkedIn: /in/yourname</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h2 className="font-bold text-blue-600 text-lg mb-2">PROFESSIONAL SUMMARY</h2>
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {optimizedResume.improvements.length > 0 ?
                          optimizedResume.improvements[0] :
                          "Experienced professional with proven track record of delivering high-impact solutions and driving business results."}
                      </p>
                    </div>
                    <div>
                      <h2 className="font-bold text-blue-600 text-lg mb-2">KEY IMPROVEMENTS MADE</h2>
                      <ul className="text-gray-800 text-sm space-y-1">
                        {optimizedResume.fixes.slice(0, 3).map((fix, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">✓</span>
                            <span>{fix}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h2 className="font-bold text-blue-600 text-lg mb-2">EXPERIENCE</h2>
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">Senior Professional | Your Company</h3>
                          <p className="text-gray-600 text-sm mb-2">2020 - Present</p>
                          <ul className="text-gray-800 text-sm space-y-1">
                            <li>• Led high-impact projects and cross-functional teams</li>
                            <li>• Delivered measurable results and exceeded performance targets</li>
                            <li>• Implemented strategic initiatives driving business growth</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="font-bold text-blue-600 text-lg mb-2">CORE COMPETENCIES</h2>
                      <p className="text-gray-800 text-sm">Industry-specific skills, Technologies, Leadership, Strategic Planning, Project Management</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm text-center">
                👆 This preview shows your optimized content. Select a template above to proceed with payment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-slate-400 mb-6">
          All templates include your optimized content with enhanced keywords and formatting
        </p>
      </div>
    </motion.div>
  );
};

const PaymentFlow = ({ onBack }: { onBack: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-2xl mx-auto text-center"
  >
    <h2 className="text-3xl font-bold text-white mb-4">Complete Your Purchase</h2>
    <p className="text-slate-400 mb-8">
      Secure payment to optimize your resume with AI
    </p>

    <div className="bg-slate-800/50 rounded-xl p-8 mb-8">
      <div className="flex justify-between items-center mb-4">
        <span className="text-white">Resume Optimization Service</span>
        <span className="text-2xl font-bold text-white">$9.00</span>
      </div>
      <div className="text-slate-400 text-sm text-left space-y-2">
        <div>✓ AI-powered ATS optimization</div>
        <div>✓ Boost score to 85+</div>
        <div>✓ Keyword enhancement</div>
        <div>✓ Format optimization</div>
        <div>✓ Instant download</div>
      </div>
    </div>

    <div className="space-y-4">
      <Button size="lg" className="w-full">
        Pay with Stripe
      </Button>
      <Button variant="outline" size="lg" className="w-full">
        Pay with PayPal
      </Button>
    </div>

    <button
      onClick={onBack}
      className="mt-6 text-slate-400 hover:text-white transition-colors"
    >
      ← Back to results
    </button>
  </motion.div>
);

export const OptimizeResumePage = () => {
  const [currentStep, setCurrentStep] = useState<OptimizeStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState<string>('');
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResume | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string, price: number } | null>(null);

  // Initialize the optimization service (in production, get API key from environment)
  const optimizationService = new DeepSeekOptimizationService();

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      setUploadedFile(files[0]);
      setCurrentStep('target-role');
    }
  };

  const handleTargetRoleSubmit = (role: string) => {
    setTargetRole(role);
    setCurrentStep('job-description');
  };

  const handleJobDescriptionSubmit = async (jobDesc: string) => {
    console.log('🚀 Starting optimization flow...');
    setCurrentStep('optimizing');

    if (!uploadedFile) {
      console.error('❌ No file uploaded');
      return;
    }

    console.log('📁 Processing file:', uploadedFile.name, uploadedFile.type);
    console.log('🎯 Target role:', targetRole);
    console.log('📝 Job description length:', jobDesc.length);

    try {
      // Extract text from the uploaded file
      console.log('📄 Extracting text from file...');
      const resumeText = await optimizationService.extractTextFromFile(uploadedFile);

      // Call DeepSeek API for resume optimization
      console.log('🤖 Calling DeepSeek API for optimization...');
      const optimizationResult = await optimizationService.optimizeResume(
        resumeText,
        targetRole,
        jobDesc
      );

      // Create optimized resume object with template options
      const optimizedResumeData: OptimizedResume = {
        fixes: optimizationResult.fixes,
        improvements: optimizationResult.improvements,
        optimizedContent: optimizationResult.optimizedContent,
        templates: [
          {
            id: 'professional-ats',
            name: 'Professional ATS',
            description: 'Clean, ATS-friendly design optimized for applicant tracking systems',
            price: 12,
            preview: '/templates/professional-preview.png'
          },
          {
            id: 'modern-executive',
            name: 'Modern Executive',
            description: 'Contemporary design perfect for senior-level positions',
            price: 15,
            preview: '/templates/executive-preview.png'
          },
          {
            id: 'creative-impact',
            name: 'Creative Impact',
            description: 'Eye-catching design that highlights your achievements',
            price: 18,
            preview: '/templates/creative-preview.png'
          }
        ]
      };

      console.log('✅ Optimization complete, setting results...');
      setOptimizedResume(optimizedResumeData);
      setCurrentStep('template-selection');
    } catch (error: any) {
      console.error('❌ Optimization failed:', error);

      // Show error to user but continue with fallback data for testing
      alert(`Optimization failed: ${error.message}. Showing demo results for testing.`);

      // Fallback demo data
      const fallbackData: OptimizedResume = {
        fixes: [
          "Enhanced action verbs throughout experience section",
          "Added missing technical keywords for better ATS scoring",
          "Improved quantification of achievements with specific metrics",
          "Optimized formatting for better readability",
          "Strengthened professional summary alignment with target role"
        ],
        improvements: [
          `Tailored content specifically for ${targetRole} position`,
          "Highlighted relevant technical skills and competencies",
          "Enhanced project descriptions with measurable outcomes",
          "Added industry-specific terminology and keywords",
          "Improved overall professional presentation and impact"
        ],
        optimizedContent: `
YOUR NAME
Senior ${targetRole}
Email: email@example.com | Phone: (555) 000-0000 | LinkedIn: /in/yourprofile

PROFESSIONAL SUMMARY
Experienced ${targetRole} with proven track record of delivering high-impact solutions and driving business results. Expert in modern technologies with strong leadership and collaboration skills.

CORE COMPETENCIES
• Advanced technical expertise in relevant technologies
• Project leadership and cross-functional collaboration  
• Strategic problem-solving and analytical thinking
• Agile methodologies and best practices
• Performance optimization and scalability

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Tech Corporation | 2020-2023
• Led development of enterprise applications serving 10,000+ users
• Improved system performance by 45% through architectural optimizations
• Mentored junior developers and established coding best practices
• Collaborated with product teams to deliver features ahead of schedule

SOFTWARE ENGINEER | Innovation Labs | 2018-2020  
• Developed scalable web applications using modern frameworks
• Implemented automated testing reducing bugs by 60%
• Participated in code reviews and technical architecture decisions
• Contributed to open-source projects and technical documentation

EDUCATION
Bachelor of Science in Computer Science | University of Technology | 2018

CERTIFICATIONS
• AWS Certified Solutions Architect
• Certified Scrum Master
`,
        templates: [
          {
            id: 'professional-ats',
            name: 'Professional ATS',
            description: 'Clean, ATS-friendly design optimized for applicant tracking systems',
            price: 12,
            preview: '/templates/professional-preview.png'
          },
          {
            id: 'modern-executive',
            name: 'Modern Executive',
            description: 'Contemporary design perfect for senior-level positions',
            price: 15,
            preview: '/templates/executive-preview.png'
          },
          {
            id: 'creative-impact',
            name: 'Creative Impact',
            description: 'Eye-catching design that highlights your achievements',
            price: 18,
            preview: '/templates/creative-preview.png'
          }
        ]
      };

      setOptimizedResume(fallbackData);
      setCurrentStep('template-selection');
    }
  };

  const handleBackToUpload = () => {
    setCurrentStep('upload');
    setUploadedFile(null);
    setTargetRole('');
  };

  const handleBackToTargetRole = () => {
    setCurrentStep('target-role');
  };


  const handleSelectTemplate = (templateId: string, price: number) => {
    setSelectedTemplate({ id: templateId, price });
    setCurrentStep('payment');
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Optimize Your Resume
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Get your resume analyzed by AI and optimized for ATS systems to maximize your job search success
            </p>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 'upload' && (
              <motion.div key="upload">
                <FileUpload onChange={handleFileUpload} />
              </motion.div>
            )}

            {currentStep === 'target-role' && (
              <motion.div key="target-role">
                <TargetRoleForm
                  onSubmit={handleTargetRoleSubmit}
                  onBack={handleBackToUpload}
                />
              </motion.div>
            )}

            {currentStep === 'job-description' && (
              <motion.div key="job-description">
                <JobDescriptionForm
                  onSubmit={handleJobDescriptionSubmit}
                  onBack={handleBackToTargetRole}
                />
              </motion.div>
            )}

            {currentStep === 'optimizing' && (
              <motion.div key="optimizing">
                <OptimizingAnimation />
              </motion.div>
            )}

            {currentStep === 'template-selection' && optimizedResume && (
              <motion.div key="template-selection">
                <TemplateSelection
                  optimizedResume={optimizedResume}
                  onSelectTemplate={handleSelectTemplate}
                />
              </motion.div>
            )}

            {currentStep === 'payment' && selectedTemplate && (
              <motion.div key="payment">
                <PaymentFlow onBack={() => setCurrentStep('template-selection')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
