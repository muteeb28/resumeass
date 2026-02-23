"use client";

import React, { useState, useEffect } from 'react';
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/button";
import TemplatePreview from "@/components/resume-optimizer/TemplatePreview";
import FinalResumePreview from "@/components/resume-optimizer/FinalResumePreview";
import { getPageCountHint } from "@/components/resume-optimizer/resumeUtils";
import * as resumeOptimizerApi from "@/services/resumeOptimizerApi";
import { ParserStatusIndicator } from "@/components/resume-optimizer/ParserStatusIndicator";
import type { OptimizationResult, TargetRole, ProgressUpdate, ExtractedResumeData, ResumeTemplate } from "@/services/resumeOptimizerApi";
import { getFilePageCount } from "@/services/filePageCountUtils";
import { cn } from "@/lib/utils";

export interface UploadedFile {
  name: string;
  size: string;
  file: File;
}

const sanitizeFilename = (name: string) => name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

export default function OptimizeResumePage() {
  const [step, setStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
  const [targetRoles, setTargetRoles] = useState<TargetRole[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedResumeData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfGenerationType, setPdfGenerationType] = useState<string>('');
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roles = await resumeOptimizerApi.getTargetRoles();
        setTargetRoles(roles);
      } catch (err) {
        console.error('Failed to fetch roles:', err);
      }
    };
    fetchRoles();
  }, []);

  const resumePreviewData = selectedTemplate
    ? { ...selectedTemplate.content, style: selectedTemplate.style, templateName: selectedTemplate.name }
    : null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    setUploadedFile({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      file: file
    });
    setUploadError(null);
    setStep(2);

    setIsExtracting(true);
    setExtractError(null);
    setExtractedData(null);
    try {
      const extracted = await resumeOptimizerApi.extractResumeData(file);
      setExtractedData(extracted);
    } catch (extractErr) {
      const errorMessage = extractErr instanceof Error ? extractErr.message : 'Failed to extract resume data.';
      console.error('Resume extraction failed:', extractErr);
      setExtractError(errorMessage);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleOptimize = async () => {
    if (!uploadedFile?.file || !selectedRole) return;

    setIsOptimizing(true);
    setStep(3);
    setProgressUpdates([]);
    setError(null);

    try {
      const pageCount = await getFilePageCount(uploadedFile.file);

      const result = await resumeOptimizerApi.optimizeResumeWithProgress(
        uploadedFile.file,
        selectedRole,
        (update: ProgressUpdate) => {
          setProgressUpdates(prev => [...prev, update]);
        },
        pageCount,
        extractedData
      );
      setOptimizationResult(result);
      setStep(4);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Optimization failed. Please try again.";
      setError(errorMessage);
      setStep(2);
    } finally {
      setIsOptimizing(false);
    }
  };

  const resetProcess = () => {
    setStep(1);
    setUploadedFile(null);
    setSelectedRole('');
    setOptimizationResult(null);
    setSelectedTemplate(null);
    setProgressUpdates([]);
    setError(null);
  };

  const handleAlternativePdf = async () => {
    if (!selectedTemplate) return;
    const element = document.getElementById('resume-content');
    if (!element || pdfGenerating) return;

    try {
      setPdfGenerating(true);
      setPdfGenerationType('Generating PDF...');

      const targetPageCount = resumePreviewData ? getPageCountHint(resumePreviewData) : null;
      const resolvedTargetPageCount = targetPageCount && targetPageCount > 0 ? targetPageCount : undefined;

      let stylesheets = '';
      const styleElements = Array.from(document.querySelectorAll('style'));
      styleElements.forEach(style => { stylesheets += style.textContent + '\n'; });

      const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      for (const link of linkElements) {
        try {
          const href = (link as HTMLLinkElement).href;
          if (href) stylesheets += `@import url('${href}');\n`;
        } catch (e) {
          console.debug('Failed to fetch stylesheet:', e);
        }
      }

      const printOptimizations = `
        @page { size: Letter; margin: 0; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; padding: 0; }
        .resume-content { page-break-inside: auto !important; }
        .resume-page {
          width: var(--resume-page-width, 8.5in);
          min-height: var(--resume-page-height, 11in);
          padding: var(--resume-page-padding, 0.5in);
          box-sizing: border-box;
          background: #ffffff;
        }
      `;

      const html = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="UTF-8"><style>${stylesheets}${printOptimizations}</style></head>
          <body>${element.outerHTML}</body>
        </html>
      `;

      const response = await fetch(resumeOptimizerApi.buildApiUrl('generate-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html,
          options: {
            format: 'Letter',
            printBackground: true,
            preferCSSPageSize: true,
            margin: '0in',
            fitToPage: true,
            targetPageCount: resolvedTargetPageCount
          }
        })
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${sanitizeFilename(selectedTemplate.name)}-${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF.');
    } finally {
      setPdfGenerating(false);
      setPdfGenerationType('');
    }
  };

  return (
    <BackgroundRippleLayout tone="dark" contentClassName="resume-optimizer pt-16">
      <Navbar />

      <div className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-16 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-white/10 rounded-full">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Step {step} of 4</span>
              </div>
              <span className="text-sm font-medium text-slate-400">
                {step === 1 ? 'Upload' : step === 2 ? 'Customize' : step === 3 ? 'Optimizing' : 'Review'}
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
              className="bg-gradient-to-r from-slate-400 via-white to-slate-400 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl min-h-[calc(100vh-160px)]">
        {step === 1 && (
          <div className="text-center py-20 animate-in fade-in zoom-in-95 duration-700">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Optimize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-white">Resume</span>
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-16 leading-relaxed">
              Our AI analyzes your experience to craft a perfectly tailored, ATS-ready resume in seconds.
            </p>

            <div className="max-w-2xl mx-auto">
              <label className="group relative flex flex-col items-center justify-center w-full h-96 border-2 border-dashed border-white/10 rounded-[2.5rem] cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/50 transition-all duration-500 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-slate-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative flex flex-col items-center px-10">
                  <div className="w-20 h-20 mb-8 rounded-3xl bg-white/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl border border-white/5">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Drop your resume here</h3>
                  <p className="text-slate-500 font-medium">PDF, DOC, DOCX up to 10MB</p>
                </div>
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
              </label>

              {uploadError && (
                <div className="mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-red-400 font-bold flex items-center justify-center">
                    {uploadError}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-3xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Target Your Dream Role</h2>
              <p className="text-slate-400 text-lg">We'll tailor every bullet point to match industry expectations.</p>
            </div>

            <div className="grid gap-8">
              <div className="bg-white/5 rounded-3xl border border-white/10 p-8 backdrop-blur-sm shadow-2xl">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-slate-500/10 rounded-2xl flex items-center justify-center border border-white/10">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{uploadedFile?.name}</h3>
                      <p className="text-slate-400">{uploadedFile?.size}</p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <ParserStatusIndicator
                    isExtracting={isExtracting}
                    status={extractedData?.status}
                    confidence={extractedData?.confidence}
                  />
                </div>
              </div>

              {extractError && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-300 text-center text-sm">
                  {extractError} You can still continue.
                </div>
              )}

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Choose Role</label>
                <input
                  type="text"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  list="target-roles"
                  autoComplete="off"
                  className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-white/10 focus:border-white text-white transition-all duration-300 outline-none hover:bg-white/[0.08]"
                />
                <datalist id="target-roles">
                  {targetRoles.map((role) => (
                    <option key={role.value} value={role.label} />
                  ))}
                </datalist>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center font-bold">
                  {error}
                </div>
              )}

              <Button onClick={handleOptimize} disabled={!selectedRole || isOptimizing} size="lg" className="h-16 text-lg font-bold">
                {isOptimizing ? 'Optimizing Experience...' : 'Optimize My Resume'}
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-2xl mx-auto py-20 text-center">
            <div className="relative w-32 h-32 mx-auto mb-12">
              <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
              <div className="absolute inset-0 border-4 border-white rounded-full border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-12 h-12 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">Optimizing Insights</h2>
            <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 p-10 text-left shadow-2xl">
              <div className="space-y-6">
                {progressUpdates.length > 0 ? progressUpdates.map((update, idx) => (
                  <div key={idx} className="flex items-center gap-5 animate-in slide-in-from-left-6 duration-500">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      update.step === 'completed' ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-white/20 animate-pulse border border-white/40"
                    )}>
                      {update.step === 'completed' ? (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-lg text-slate-200 font-medium">{update.message}</span>
                  </div>
                )) : (
                  <div className="text-center py-4 text-slate-400 italic">Initializing AI engine...</div>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in fade-in duration-700">
            {!selectedTemplate ? (
              <>
                <div className="text-center mb-16">
                  <div className="inline-flex items-center px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-black uppercase tracking-widest mb-6">
                    Optimization Successful
                  </div>
                  <h2 className="text-5xl font-black text-white mb-4">Select A Style</h2>
                  <p className="text-slate-400 text-lg">Choose a template that best represents your professional brand.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {optimizationResult?.data?.templates?.map((template: ResumeTemplate) => (
                    <div
                      key={template.id}
                      className="group bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.06] hover:border-white/50 transition-all duration-500 cursor-pointer shadow-2xl"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">{template.name}</h3>
                          <p className="text-slate-400">{template.description}</p>
                        </div>
                        <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-tighter">Premium</div>
                      </div>
                      <div className="relative h-[550px] rounded-3xl overflow-hidden border border-white/5 bg-white mb-10 group-hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all duration-500">
                        <TemplatePreview template={template} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-sm">
                          <Button size="lg" className="h-14 font-black">Choose This Style</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
                  <div>
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Final Preview</h2>
                    <p className="text-slate-400 font-medium">Review your optimized content and styled layout.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => setSelectedTemplate(null)} className="h-14 px-8 font-bold">Back to Templates</Button>
                    <Button onClick={handleAlternativePdf} disabled={pdfGenerating} className="h-14 px-8 font-black">
                      {pdfGenerating ? (pdfGenerationType || 'Generating...') : 'Download PDF'}
                    </Button>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden border-[12px] border-slate-950">
                  <div id="resume-content" className="resume-content">
                    {resumePreviewData && <FinalResumePreview data={resumePreviewData} mode="multi" />}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </BackgroundRippleLayout>
  );
}
