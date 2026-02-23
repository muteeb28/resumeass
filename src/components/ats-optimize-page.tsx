"use client";

import React, { useState } from 'react';
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";
import { buildApiUrl } from "@/services/resumeOptimizerApi";

interface ATSOptimizedTemplate {
  id: string;
  name: string;
  description: string;
  style: string;
  content: any;
}

interface OptimizationResult {
  success: boolean;
  templates: ATSOptimizedTemplate[];
  atsScore: number;
  improvements: string[];
  stats: {
    atsScore: number;
    keywordsAdded: number;
    sectionsOptimized: number;
  };
  targetRole: string;
}

export default function ATSOptimizePage() {
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ATSOptimizedTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, DOC, and DOCX files are supported.");
      return;
    }

    setUploadedFile(file);
    setError(null);
    setStep(2);
  };

  const handleOptimize = async () => {
    if (!uploadedFile || !targetRole) return;

    setIsOptimizing(true);
    setStep(3);
    setError(null);
    setProgressMessage('Uploading resume...');

    try {
      const formData = new FormData();
      formData.append('resume', uploadedFile);
      formData.append('targetRole', targetRole);

      const response = await fetch(buildApiUrl('ats-optimize'), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Optimization failed');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Read streaming progress
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const update = JSON.parse(line.slice(6));
            
            if (update.step === 'completed' && update.data) {
              setResult(update.data);
              setStep(4);
            } else if (update.step === 'error') {
              throw new Error(update.message);
            } else {
              setProgressMessage(update.message);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

    } catch (err: any) {
      setError(err.message || "Optimization failed. Please try again.");
      setStep(2);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedTemplate) return;

    try {
      const element = document.getElementById('ats-resume-content');
      if (!element) return;

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    .resume-page { max-width: 800px; margin: 0 auto; }
  </style>
</head>
<body>${element.outerHTML}</body>
</html>`;

      const response = await fetch(buildApiUrl('generate-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, options: { format: 'Letter', printBackground: true } })
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.name.replace(/\s+/g, '-')}-ATS-Optimized.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF.');
    }
  };

  const resetProcess = () => {
    setStep(1);
    setUploadedFile(null);
    setTargetRole('');
    setResult(null);
    setSelectedTemplate(null);
    setError(null);
    setProgressMessage('');
  };

  return (
    <BackgroundRippleLayout tone="dark" contentClassName="ats-optimizer pt-16">
      <Navbar />

      {/* Progress Bar */}
      <div className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-16 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-white/10 rounded-full">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Step {step} of 4</span>
              </div>
              <span className="text-sm font-medium text-slate-400">
                {step === 1 ? 'Upload Resume' : step === 2 ? 'Target Role' : step === 3 ? 'Optimizing' : 'Select Template'}
              </span>
            </div>
            {step > 1 && (
              <button onClick={resetProcess} className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">
                Start Over
              </button>
            )}
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl min-h-[calc(100vh-160px)]">
        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="text-center py-20 animate-in fade-in zoom-in-95 duration-700">
            <div className="inline-flex items-center px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-black uppercase tracking-wider mb-8 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              🎯 90% ATS Score Guaranteed
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Upload Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-blue-500 to-purple-500">Resume</span>
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-16 leading-relaxed">
              We'll optimize it for 90% ATS score while preserving every heading and detail
            </p>

            <div className="max-w-2xl mx-auto">
              <label className="group relative flex flex-col items-center justify-center w-full h-96 border-2 border-dashed border-white/10 rounded-[2.5rem] cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] hover:border-green-500/50 transition-all duration-500 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative flex flex-col items-center px-10">
                  <div className="w-20 h-20 mb-8 rounded-3xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl border border-white/10">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Drop your resume here</h3>
                  <p className="text-slate-500 font-medium">PDF, DOC, DOCX up to 10MB</p>
                </div>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
              </label>

              {error && (
                <div className="mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-red-400 font-bold">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Target Role */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">What's Your Target Role?</h2>
              <p className="text-slate-400 text-lg">We'll optimize your resume with the right keywords and structure</p>
            </div>

            <div className="grid gap-8">
              <div className="bg-white/5 rounded-3xl border border-white/10 p-8 backdrop-blur-sm shadow-2xl">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center border border-white/10">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{uploadedFile?.name}</h3>
                    <p className="text-slate-400">{((uploadedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Target Job Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer, Product Manager, Data Scientist"
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 text-white transition-all duration-300 outline-none hover:bg-white/[0.08] placeholder:text-slate-600"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center font-bold">
                  {error}
                </div>
              )}

              <Button 
                onClick={handleOptimize} 
                disabled={!targetRole || isOptimizing} 
                size="lg" 
                className="h-16 text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500"
              >
                {isOptimizing ? 'Optimizing...' : 'Optimize for 90% ATS Score'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Optimizing */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto py-20 text-center">
            <div className="relative w-32 h-32 mx-auto mb-12">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">🎯</span>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6">Optimizing Your Resume</h2>
            <p className="text-xl text-slate-400 mb-8">{progressMessage || 'Processing...'}</p>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-10 shadow-2xl">
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg text-slate-200">Extracting all content and sections</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    progressMessage.includes('Optimizing') ? "bg-green-500" : "bg-white/20 animate-pulse"
                  )}>
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  </div>
                  <span className="text-lg text-slate-200">Optimizing for 90% ATS score</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    progressMessage.includes('Creating') ? "bg-green-500" : "bg-white/20"
                  )}>
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  </div>
                  <span className="text-lg text-slate-200">Creating beautiful templates</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Template Selection */}
        {step === 4 && result && !selectedTemplate && (
          <div className="animate-in fade-in duration-700">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-black uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                ✨ ATS Score: {result.atsScore}%
              </div>
              <h2 className="text-5xl font-black text-white mb-4">Choose Your Template</h2>
              <p className="text-slate-400 text-lg">Both templates are optimized for maximum ATS compatibility</p>
            </div>

            {/* Improvements */}
            <div className="max-w-4xl mx-auto mb-12 bg-white/5 rounded-3xl border border-white/10 p-8">
              <h3 className="text-xl font-bold text-white mb-6">✨ What We Optimized:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {result.improvements.map((improvement, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-slate-300">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>{improvement}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {result.templates.map((template) => (
                <div
                  key={template.id}
                  className="group bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.06] hover:border-green-500/50 transition-all duration-500 cursor-pointer shadow-2xl"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{template.name}</h3>
                      <p className="text-slate-400">{template.description}</p>
                    </div>
                  </div>
                  
                  <div className="relative h-[500px] rounded-3xl overflow-hidden border border-white/5 bg-white mb-6 group-hover:shadow-[0_0_40px_rgba(34,197,94,0.15)] transition-all duration-500">
                    <div className="p-8 text-sm text-gray-800">
                      <div className="font-bold text-2xl mb-2">{template.content.personalInfo?.name}</div>
                      <div className="text-xs text-gray-600 mb-4">
                        {template.content.personalInfo?.email} | {template.content.personalInfo?.phone}
                      </div>
                      <div className="font-bold text-lg mt-6 mb-2">PROFESSIONAL SUMMARY</div>
                      <div className="text-xs leading-relaxed">{template.content.professionalSummary?.substring(0, 200)}...</div>
                      <div className="font-bold text-lg mt-6 mb-2">EXPERIENCE</div>
                      <div className="text-xs">{template.content.experience?.[0]?.title} - {template.content.experience?.[0]?.company}</div>
                    </div>
                  </div>
                  
                  <Button size="lg" className="w-full h-14 font-bold group-hover:bg-green-600">
                    Select This Template
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Preview & Download */}
        {step === 4 && selectedTemplate && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
              <div>
                <div className="inline-flex items-center px-4 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-black uppercase tracking-wider mb-4">
                  ATS Score: {result?.atsScore}%
                </div>
                <h2 className="text-4xl font-black text-white mb-2">{selectedTemplate.name}</h2>
                <p className="text-slate-400 font-medium">{selectedTemplate.description}</p>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setSelectedTemplate(null)} className="h-14 px-8 font-bold">
                  Change Template
                </Button>
                <Button onClick={handleDownloadPDF} className="h-14 px-8 font-black bg-gradient-to-r from-green-600 to-blue-600">
                  Download PDF
                </Button>
              </div>
            </div>

            <div id="ats-resume-content" className="bg-white rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden p-12">
              {/* Render actual resume content here */}
              <div className="max-w-[800px] mx-auto">
                <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
                  <h1 className="text-4xl font-black text-gray-900 mb-2">{selectedTemplate.content.personalInfo?.name}</h1>
                  <div className="text-sm text-gray-600">
                    {selectedTemplate.content.personalInfo?.email} | {selectedTemplate.content.personalInfo?.phone} | {selectedTemplate.content.personalInfo?.location}
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="mb-6">
                  <h2 className="text-xl font-black text-gray-900 mb-3 uppercase">Professional Summary</h2>
                  <p className="text-gray-700 leading-relaxed">{selectedTemplate.content.professionalSummary}</p>
                </div>

                {/* Skills */}
                {selectedTemplate.content.skills && (
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-gray-900 mb-3 uppercase">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {Object.values(selectedTemplate.content.skills).flat().map((skill: any, idx) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                <div className="mb-6">
                  <h2 className="text-xl font-black text-gray-900 mb-3 uppercase">Experience</h2>
                  {selectedTemplate.content.experience?.map((exp: any, idx: number) => (
                    <div key={idx} className="mb-6">
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-lg font-black text-gray-900">{exp.title}</h3>
                        <span className="text-sm font-bold text-gray-600">{exp.dates}</span>
                      </div>
                      <p className="text-sm font-bold text-gray-700 mb-2">{exp.company} | {exp.location}</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {exp.bullets?.map((bullet: string, bidx: number) => (
                          <li key={bidx}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Education */}
                <div className="mb-6">
                  <h2 className="text-xl font-black text-gray-900 mb-3 uppercase">Education</h2>
                  {selectedTemplate.content.education?.map((edu: any, idx: number) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-base font-black text-gray-900">{edu.degree}</h3>
                          <p className="text-sm text-gray-700">{edu.institution}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-600">{edu.dates}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Projects */}
                {selectedTemplate.content.projects && selectedTemplate.content.projects.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-gray-900 mb-3 uppercase">Projects</h2>
                    {selectedTemplate.content.projects.map((project: any, idx: number) => (
                      <div key={idx} className="mb-4">
                        <h3 className="text-base font-black text-gray-900 mb-1">{project.name}</h3>
                        <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {project.technologies.map((tech: string, tidx: number) => (
                              <span key={tidx} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Certifications */}
                {selectedTemplate.content.certifications && selectedTemplate.content.certifications.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-gray-900 mb-3 uppercase">Certifications</h2>
                    <ul className="space-y-2">
                      {selectedTemplate.content.certifications.map((cert: any, idx: number) => (
                        <li key={idx} className="text-sm text-gray-700">
                          <span className="font-bold">{cert.name}</span>
                          {cert.issuer && <span> - {cert.issuer}</span>}
                          {cert.date && <span className="text-gray-600"> ({cert.date})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </BackgroundRippleLayout>
  );
}
