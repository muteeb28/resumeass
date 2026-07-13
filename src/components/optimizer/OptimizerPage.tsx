"use client";

import { useState, useCallback, useRef } from "react";
import { H1_CTA_BAND, INTRO_TEXT } from "@/lib/typography";
import type { ResumeJSON } from "@/types/resume";
import { exportResumeDocx } from "@/services/docxExport";
import { convertToPortfoliolyFormat } from "@/utils/resume-converter";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import ResumeDataEditor from "@/components/edit/ResumeDataEditor";
import JakeTemplate from "@/components/resume/JakeTemplate";
import TemplateTwoColumn from "@/templates/TemplateTwoColumn";
import TemplateSidebar from "@/templates/TemplateSidebar";
import TemplateDarkSidebar from "@/templates/TemplateDarkSidebar";
import type { ResumeData } from "@/types/portfolioly-resume";
import { Pencil, Eye, Download, ChevronDown, ChevronUp } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { useUserStore } from "@/stores/useUserStore";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PreAnalysis {
  ats_score_before: number;
  current_keywords: string[];
  weak_sections: string[];
}

interface BulletChange {
  section: string;
  original: string;
  improved: string;
}

interface Changelog {
  ats_score_after: number;
  keywords_added: string[];
  keywords_missing: string[];
  sections_modified: string[];
  top_changes: string[];
  bullet_changes?: BulletChange[];
}

interface OptimizedPayload {
  optimized_resume: {
    name: string;
    contact?: { email?: string; phone?: string; linkedin?: string; location?: string };
    summary?: string;
    experience?: { company?: string; title?: string; dates?: string; bullets?: string[] }[];
    education?: { institution?: string; degree?: string; dates?: string }[];
    skills?: string[];
    projects?: { name?: string; description?: string; bullets?: string[]; link?: string; github?: string; tech?: string[] }[];
  };
  changelog: Changelog;
}

type Phase = "idle" | "analyzing" | "ready" | "optimizing" | "done";
type TemplateId = "jake" | "two-column" | "sidebar" | "dark-sidebar";
type ViewMode = "edit" | "preview";

const TEMPLATE_OPTIONS: { id: TemplateId; name: string }[] = [
  { id: "jake", name: "ATS CV" },
  { id: "two-column", name: "Two Column CV" },
  { id: "sidebar", name: "Dubai CV" },
  { id: "dark-sidebar", name: "Academic CV" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripMd(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").trim();
}

function toArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? (val as T[]) : [];
}

function normalizeChangelog(raw: any): Changelog {
  return {
    ats_score_after: Number(raw?.ats_score_after) || 0,
    keywords_added: toArray<string>(raw?.keywords_added),
    keywords_missing: toArray<string>(raw?.keywords_missing),
    sections_modified: toArray<string>(raw?.sections_modified),
    top_changes: toArray<string>(raw?.top_changes),
    bullet_changes: toArray<BulletChange>(raw?.bullet_changes),
  };
}

function mapToResumeJSON(p: OptimizedPayload["optimized_resume"] | undefined | null): ResumeJSON {
  if (!p) throw new Error("Optimizer returned an unexpected response structure. Please try again.");
  const c = p.contact || {};
  const skills = Array.isArray(p.skills) ? p.skills : [];
  return {
    basics: {
      name: stripMd(p.name || ""),
      title: "",
      email: c.email || "",
      phone: c.phone || "",
      location: c.location || "",
      links: c.linkedin ? [c.linkedin] : [],
      summary: stripMd(p.summary || ""),
    },
    experience: (p.experience || []).map((e) => ({
      company: stripMd(e.company || ""),
      role: stripMd(e.title || ""),
      location: "",
      dates: e.dates || "",
      bullets: (e.bullets || []).map(stripMd),
      tech: [],
    })),
    education: (p.education || []).map((ed) => ({
      school: ed.institution || "",
      degree: ed.degree || "",
      location: "",
      dates: ed.dates || "",
      details: [],
    })),
    skills: skills.length ? [{ name: "Skills", items: skills }] : [],
    projects: (p.projects || []).map((proj) => ({
      name: proj.name || "",
      description: proj.description || "",
      bullets: (proj.bullets || []).map(stripMd),
      tech: proj.tech || [],
      link: proj.link || "",
      github: proj.github || "",
    })),
    certifications: [],
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OptimizerPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [preAnalysis, setPreAnalysis] = useState<PreAnalysis | null>(null);
  const [progressMsg, setProgressMsg] = useState("");
  const [optimizedResume, setOptimizedResume] = useState<ResumeJSON | null>(null);
  const [changelog, setChangelog] = useState<Changelog | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Results view state
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("jake");
  const [portfoliolyResume, setPortfoliolyResume] = useState<ResumeData | null>(null);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [docxGenerating, setDocxGenerating] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  const atsBefore = preAnalysis?.ats_score_before ?? 0;
  const atsAfter = changelog?.ats_score_after ?? 0;
  const delta = atsAfter - atsBefore;
  const { user } = useUserStore();
  const router = useRouter();

  // ── Call 1: Pre-analysis ──────────────────────────────────────────────────

const handleFileSelect = useCallback(
  async (file: File) => {
    setSelectedFile(file);
    setUploadedFilename(file.name);
    setErrorMsg("");
    setPreAnalysis(null);
    setOptimizedResume(null);
    setChangelog(null);
    setPhase("analyzing");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jobDescription.trim()) formData.append("jobDescription", jobDescription);

      let buffer = "";
      let eventName = "";
      let gotResult = false;
      let seenBytes = 0;

      // Make the Axios POST request to your endpoint
      await axiosInstance.post('/analyze-resume', formData, {
        responseType: 'text',
        headers: {
          // Override global instance JSON header for multipart form data
          'Content-Type': 'multipart/form-data',
        },
        onDownloadProgress: (progressEvent) => {
          const currentResponse = progressEvent.event.target.response || "";
          
          // Isolate the brand new string chunk
          const chunk = currentResponse.substring(seenBytes);
          seenBytes = currentResponse.length;

          // Append to our processing buffer
          buffer += chunk;

          // Parse incoming SSE lines right here as they stream in
          const lines = buffer.split("\n");
          buffer = lines.pop() || ""; // Retain incomplete lines in buffer

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventName = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              
              if (eventName === "result") {
                if (!data.success) throw new Error(data.error || "Analysis failed");
                const raw = data.data;
                
                setPreAnalysis({
                  ats_score_before: Number(raw?.ats_score_before) || 0,
                  current_keywords: toArray<string>(raw?.current_keywords),
                  weak_sections: toArray<string>(raw?.weak_sections),
                });
                
                gotResult = true;
                setPhase("ready");
              } else if (eventName === "error") {
                throw new Error(data.message || "Analysis failed");
              }
              eventName = ""; // Reset context for the next block
            }
          }
        }
      });

      // This executes AFTER the entire network stream completes
      if (!gotResult) {
        throw new Error("Analysis completed — server did not return a result");
      }

    } catch (err: any) {
      // Captures network errors, interceptor redirects, and custom parsing errors
      const errMsg = err.response?.data?.message || err.message || "Failed to analyze resume";
      setErrorMsg(errMsg);
      setPhase("idle");
    }
  },
  [jobDescription] // React tracking dependencies
);

  // ── Call 2: Optimization (SSE) ────────────────────────────────────────────

const handleOptimize = useCallback(async () => {
  if (!selectedFile) return;
  setErrorMsg("");
  setProgressMsg("Starting optimization...");
  setPhase("optimizing");

  try {
    if (!user) {
      router.push(`${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login`);
      return;
    }
    const formData = new FormData();
    formData.append("resume", selectedFile);
    if (jobDescription.trim()) formData.append("jobDescription", jobDescription);
    
    let buffer = "";
    let eventName = "";
    let gotComplete = false;
    let seenBytes = 0;

    await axiosInstance.post('/optimize-resume-stream', formData, {
      responseType: 'text',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onDownloadProgress: (progressEvent) => {
        const currentResponse = progressEvent.event.target.response || "";
        const chunk = currentResponse.substring(seenBytes);
        seenBytes = currentResponse.length;

        buffer += chunk;
        
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventName = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            
            if (eventName === "progress") {
              setProgressMsg(data.message || "");
            } else if (eventName === "complete") {
              const payload = data.data as OptimizedPayload;
              const mapped = mapToResumeJSON(payload.optimized_resume);
              const rd = convertToPortfoliolyFormat(mapped);
              
              setOptimizedResume(mapped);
              setPortfoliolyResume(rd);
              setChangelog(normalizeChangelog(payload.changelog));
              gotComplete = true;
              setPhase("done");
            } else if (eventName === "error") {
              throw new Error(data.message || "Optimization failed");
            }
            eventName = "";
          }
        }
      }
    });

    if (!gotComplete) {
      throw new Error("Optimization completed — server did not return a final result");
    }

  } catch (err: any) {
    const parsedError = JSON.parse(err.response.data);
    const errMsg = parsedError.message || err.message || "Failed to optimize resume";
    setErrorMsg(errMsg);
    setPhase("ready");
  }
}, [selectedFile, jobDescription]);

  // ── Downloads ─────────────────────────────────────────────────────────────

  const handleDownloadDocx = useCallback(async () => {
    if (!optimizedResume || docxGenerating) return;
    setDocxGenerating(true);
    try {
      await exportResumeDocx(optimizedResume, "optimized-resume.docx");
    } catch (err: any) {
      alert(err.message || "DOCX download failed");
    } finally {
      setDocxGenerating(false);
    }
  }, [optimizedResume, docxGenerating]);

const handleDownloadPdf = useCallback(async () => {
  if (!resumePreviewRef.current || !optimizedResume || pdfGenerating) return;
  if (viewMode !== "preview") {
    setViewMode("preview");
    return;
  }
  setPdfGenerating(true);
  
  try {
    let stylesheets = "";
    document.querySelectorAll("style").forEach((s) => { 
      stylesheets += s.textContent + "\n"; 
    });
    document.querySelectorAll("link[rel='stylesheet']").forEach((l) => {
      const href = (l as HTMLLinkElement).href;
      if (href) stylesheets += `@import url('${href}');\n`;
    });
    
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${stylesheets}</style></head><body>${resumePreviewRef.current.outerHTML}</body></html>`;
    const res = await axiosInstance.post('/generate-pdf', {
      html, 
      options: { 
        format: "Letter", 
        printBackground: true, 
        preferCSSPageSize: true, 
        margin: "0in" 
      }
    }, {
      responseType: 'blob',
      headers: {
        "Content-Type": "application/json", 
      }
    });

    const blob = res.data; 
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const name = (optimizedResume.basics.name || "resume").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    
    a.href = url;
    a.download = `${name}-optimized.pdf`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

  } catch (err: any) {
    let errMsg = "PDF generation failed";
    if (err.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try { errMsg = JSON.parse(text).message || errMsg; } catch { errMsg = text || errMsg; }
    } else {
      errMsg = err.message || errMsg;
    }
    alert(errMsg);
  } finally {
    setPdfGenerating(false);
  }
}, [resumePreviewRef, optimizedResume, pdfGenerating, viewMode, axiosInstance]);

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = useCallback(() => {
    setPhase("idle");
    setSelectedFile(null);
    setUploadedFilename("");
    setPreAnalysis(null);
    setOptimizedResume(null);
    setPortfoliolyResume(null);
    setChangelog(null);
    setErrorMsg("");
    setProgressMsg("");
    setViewMode("preview");
    setSelectedTemplate("jake");
  }, []);

  // ── Done: full-screen /create-style layout ────────────────────────────────

  if (phase === "done" && optimizedResume && portfoliolyResume) {
    return (
      <BackgroundRippleLayout tone="light" className="bg-page" contentClassName="resume-optimizer pt-[74px]" showRipple={false}>
        <Navbar tone="light" />
        <div className="px-4 pb-20 pt-24">
          <div className="mx-auto max-w-6xl space-y-0">

            {/* Toolbar */}
            <div className="rounded-t-[var(--jf-radius-panel)] border border-border-soft bg-page px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              {/* Edit / Preview tabs */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode("edit")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--jf-radius-row)] text-sm font-medium transition-all ${viewMode === "edit" ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-surface-alt"
                    }`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setViewMode("preview")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-[var(--jf-radius-row)] text-sm font-medium transition-all ${viewMode === "preview" ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-surface-alt"
                    }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </button>
              </div>

              {/* Template switcher + downloads */}
              <div className="flex items-center gap-2 flex-wrap">
                {viewMode === "preview" && (
                  <div className="flex items-center gap-1 mr-2">
                    {TEMPLATE_OPTIONS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`px-3 py-1.5 text-xs rounded-[var(--jf-radius-row)] border transition-all ${selectedTemplate === t.id
                            ? "bg-ink-900 text-white border-ink-900"
                            : "bg-page text-ink-500 border-border-soft hover:border-border-frame"
                          }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}

                <Button onClick={handleDownloadPdf} disabled={pdfGenerating} size="sm">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  {pdfGenerating ? "PDF..." : "PDF"}
                </Button>
                <Button onClick={handleDownloadDocx} disabled={docxGenerating} variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  {docxGenerating ? "DOCX..." : "DOCX"}
                </Button>
              </div>
            </div>

            {/* Changelog summary bar */}
            {changelog && (
              <div className="border-x border-border-soft bg-surface-alt">
                {/* Collapsed bar */}
                <button
                  onClick={() => setChangelogOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-ink-600 hover:bg-track transition-colors"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-medium text-ink-900">Optimization summary</span>
                    {atsBefore > 0 && atsAfter > 0 && (
                      <span className="flex items-center gap-1.5 text-xs">
                        <AtsScoreBadge score={atsBefore} />
                        <span className="text-ink-400">→</span>
                        <AtsScoreBadge score={atsAfter} />
                        {delta !== 0 && (
                          <span className={`font-semibold ${delta > 0 ? "text-success" : "text-error"}`}>
                            {delta > 0 ? `+${delta}` : delta} pts
                          </span>
                        )}
                      </span>
                    )}
                    <span className="text-xs text-ink-400">
                      {changelog.keywords_added.length > 0 && (
                        <span className="text-success font-medium">+{changelog.keywords_added.length} keywords</span>
                      )}
                      {changelog.keywords_added.length > 0 && changelog.keywords_missing.length > 0 && (
                        <span className="mx-1 text-ink-400">·</span>
                      )}
                      {changelog.keywords_missing.length > 0 && (
                        <span className="text-warning font-medium">{changelog.keywords_missing.length} missing</span>
                      )}
                      {(changelog.bullet_changes?.length ?? 0) > 0 && (
                        <>
                          <span className="mx-1 text-ink-400">·</span>
                          <span className="text-info font-medium">{changelog.bullet_changes!.length} bullets rewritten</span>
                        </>
                      )}
                    </span>
                  </div>
                  {changelogOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                </button>

                {/* Expanded detail */}
                {changelogOpen && (
                  <div className="px-4 pb-5 space-y-5 border-t border-border-soft">

                    {/* Keywords: Added vs Missing side by side */}
                    {(changelog.keywords_added.length > 0 || changelog.keywords_missing.length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        {changelog.keywords_added.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-success/15 text-success text-[10px] font-bold">+</span>
                              <p className="text-xs font-semibold text-ink-700">
                                Added to your resume
                                <span className="ml-1.5 text-[11px] font-normal text-success">({changelog.keywords_added.length})</span>
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {changelog.keywords_added.map((kw) => (
                                <span key={kw} className="text-[11px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {changelog.keywords_missing.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-warning/15 text-warning text-[10px] font-bold">!</span>
                              <p className="text-xs font-semibold text-ink-700">
                                Still missing from resume
                                <span className="ml-1.5 text-[11px] font-normal text-warning">({changelog.keywords_missing.length})</span>
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {changelog.keywords_missing.map((kw) => (
                                <span key={kw} className="text-[11px] px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bullet changes: before → after diff */}
                    {(changelog.bullet_changes?.length ?? 0) > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-ink-700">
                          Bullets rewritten
                          <span className="ml-1.5 text-[11px] font-normal text-info">({changelog.bullet_changes!.length})</span>
                        </p>
                        <div className="space-y-2">
                          {changelog.bullet_changes!.map((bc, i) => (
                            <div key={i} className="rounded-[var(--jf-radius-row)] border border-border-soft bg-page overflow-hidden">
                              <div className="px-3 py-1.5 bg-surface-alt border-b border-border-soft">
                                <span className="text-[10px] font-medium text-ink-500 uppercase tracking-[0.09em]">{bc.section}</span>
                              </div>
                              <div className="divide-y divide-border-soft">
                                <div className="flex gap-2 px-3 py-2">
                                  <span className="shrink-0 text-[11px] font-bold text-error/70 w-4">−</span>
                                  <p className="text-[11px] text-ink-400 line-through leading-relaxed">{bc.original}</p>
                                </div>
                                <div className="flex gap-2 px-3 py-2 bg-success/5">
                                  <span className="shrink-0 text-[11px] font-bold text-success w-4">+</span>
                                  <p className="text-[11px] text-ink-900 leading-relaxed">{bc.improved}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="rounded-b-[var(--jf-radius-panel)] border border-t-0 border-border-soft bg-page">
              {viewMode === "edit" && (
                <div className="p-6">
                  <ResumeDataEditor data={portfoliolyResume} onChange={setPortfoliolyResume} />
                </div>
              )}
              {viewMode === "preview" && (
                <div className="p-6">
                  <div ref={resumePreviewRef} className="resume-content min-w-0">
                    {selectedTemplate === "jake" && <JakeTemplate data={portfoliolyResume} />}
                    {selectedTemplate === "two-column" && <TemplateTwoColumn data={portfoliolyResume} />}
                    {selectedTemplate === "sidebar" && <TemplateSidebar data={portfoliolyResume} />}
                    {selectedTemplate === "dark-sidebar" && <TemplateDarkSidebar data={portfoliolyResume} />}
                  </div>
                </div>
              )}
            </div>

            {/* Optimize another */}
            <div className="pt-4 text-center">
              <button
                onClick={handleReset}
                className="text-sm text-ink-400 hover:text-ink-600 transition-colors"
              >
                Optimize another resume
              </button>
            </div>
          </div>
        </div>
      </BackgroundRippleLayout>
    );
  }

  // ── Upload / Analyze flow ─────────────────────────────────────────────────

  const canOptimize = phase === "ready" && !!selectedFile;

  return (
    <BackgroundRippleLayout tone="light" className="bg-page" contentClassName="resume-optimizer pt-[74px]" showRipple={false}>
      <Navbar tone="light" />
      <div className="px-4 pb-20 pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-xl mx-auto">
            <div className="space-y-5">
              <div>
                <h1 className={H1_CTA_BAND}>Optimize your resume</h1>
                <p className={`mt-2 ${INTRO_TEXT}`}>
                  Upload your resume and optionally paste a job description. We&apos;ll analyze your ATS score, then fully rewrite it.
                </p>
              </div>

              {/* Upload */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <h2 className="font-medium text-sm">Resume</h2>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                    e.target.value = "";
                  }}
                />
                <div
                  onClick={() => phase !== "analyzing" && fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${phase === "analyzing"
                      ? "border-primary bg-primary/5 cursor-default"
                      : "border-border hover:border-primary/50 hover:bg-accent/30 cursor-pointer"
                    }`}
                >
                  {phase === "analyzing" ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-muted-foreground">Analyzing resume...</p>
                    </div>
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <svg className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-sm font-medium">{uploadedFilename}</p>
                      <p className="text-xs text-muted-foreground">Click to replace</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm">Drop or click to upload</p>
                      <p className="text-xs text-muted-foreground">PDF or DOCX, max 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job description */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium text-sm">Job description</h2>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Optional</span>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here, or leave blank for general ATS optimization..."
                  className="w-full h-28 text-sm bg-muted rounded-md px-3 py-2 border-0 resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Pre-analysis */}
              {preAnalysis && (
                <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold">ATS pre-analysis</p>
                      <p className="text-[11px] text-muted-foreground">Scanned for ATS compatibility</p>
                    </div>
                    <AtsScoreBadge score={atsBefore} />
                  </div>

                  {preAnalysis.current_keywords.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-muted-foreground">Current keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {preAnalysis.current_keywords.map((kw) => (
                          <span key={kw} className="text-[11px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {preAnalysis.weak_sections.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-medium text-muted-foreground">Weak sections</p>
                      <div className="flex flex-wrap gap-1.5">
                        {preAnalysis.weak_sections.map((sec) => (
                          <span key={sec} className="text-[11px] px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20 capitalize">
                            {sec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {errorMsg && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-xs text-destructive">
                  {errorMsg}
                </div>
              )}

              {/* CTA */}
              <button
                onClick={handleOptimize}
                disabled={!canOptimize}
                className={`w-full py-3 px-6 rounded-lg text-sm font-medium transition-colors ${canOptimize
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
              >
                {phase === "optimizing" ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {progressMsg || "Optimizing..."}
                  </span>
                ) : (
                  "Optimize Now"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </BackgroundRippleLayout>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function AtsScoreBadge({ score }: { score: number }) {
  if (!score || score <= 0) return null;
  const color =
    score >= 75
      ? "bg-success/10 text-success border-success/20"
      : score >= 50
        ? "bg-warning/10 text-warning border-warning/20"
        : "bg-error/10 text-error border-error/20";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      ATS {score}%
    </span>
  );
}
