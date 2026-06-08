"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Eye, Pencil, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/button";
import ResumeDataEditor from "@/components/edit/ResumeDataEditor";
import JakeTemplate from "@/components/resume/JakeTemplate";
import TemplateTwoColumn from "@/templates/TemplateTwoColumn";
import TemplateSidebar from "@/templates/TemplateSidebar";
import TemplateDarkSidebar from "@/templates/TemplateDarkSidebar";
import { exportResumeDocx } from "@/services/docxExport";
import { convertToPortfoliolyFormat } from "@/utils/resume-converter";
import type { ResumeJSON } from "@/types/resume";
import type { ResumeData } from "@/types/portfolioly-resume";

type TemplateId = "jake" | "two-column" | "sidebar" | "dark-sidebar";
type ViewMode = "edit" | "preview";

const TEMPLATE_OPTIONS: { id: TemplateId; name: string }[] = [
  { id: "jake", name: "ATS CV" },
  { id: "two-column", name: "Two Column CV" },
  { id: "sidebar", name: "Dubai CV" },
  { id: "dark-sidebar", name: "Academic CV" },
];

interface OptimizedPayload {
  optimized_resume?: {
    name?: string;
    contact?: { email?: string; phone?: string; linkedin?: string; location?: string };
    summary?: string;
    experience?: { company?: string; title?: string; dates?: string; bullets?: string[] }[];
    education?: { institution?: string; degree?: string; dates?: string }[];
    skills?: string[];
    projects?: { name?: string; description?: string; bullets?: string[]; link?: string; github?: string; tech?: string[] }[];
  };
  changelog?: {
    ats_score_after?: number;
    keywords_added?: string[];
    keywords_missing?: string[];
    sections_modified?: string[];
    top_changes?: string[];
    bullet_changes?: Array<{ section?: string; original?: string; improved?: string }>;
  };
}

export interface ResumeMetadata {
  label: string;
  value: string;
}

export interface ResumeWorkspaceProps {
  resume: unknown;
  title?: string;
  subtitle?: string;
  metadata?: ResumeMetadata[];
  onBack?: () => void;
  backLabel?: string;
}

function stripMd(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").trim();
}

function toArray<T>(val: unknown): T[] {
  return Array.isArray(val) ? (val as T[]) : [];
}

function mapOptimizedPayloadToResumeJSON(payload: OptimizedPayload["optimized_resume"] | undefined | null): ResumeJSON {
  if (!payload) {
    throw new Error("Resume payload is missing optimized resume data.");
  }

  const contact = payload.contact || {};
  const skills = Array.isArray(payload.skills) ? payload.skills : [];

  return {
    basics: {
      name: stripMd(payload.name || ""),
      title: "",
      email: contact.email || "",
      phone: contact.phone || "",
      location: contact.location || "",
      links: contact.linkedin ? [contact.linkedin] : [],
      summary: stripMd(payload.summary || ""),
    },
    experience: (payload.experience || []).map((entry) => ({
      company: stripMd(entry.company || ""),
      role: stripMd(entry.title || ""),
      location: "",
      dates: entry.dates || "",
      bullets: (entry.bullets || []).map(stripMd),
      tech: [],
    })),
    education: (payload.education || []).map((entry) => ({
      school: entry.institution || "",
      degree: entry.degree || "",
      location: "",
      dates: entry.dates || "",
      details: [],
    })),
    skills: skills.length ? [{ name: "Skills", items: skills }] : [],
    projects: (payload.projects || []).map((entry) => ({
      name: entry.name || "",
      description: entry.description || "",
      bullets: (entry.bullets || []).map(stripMd),
      tech: entry.tech || [],
      link: entry.link || "",
      github: entry.github || "",
    })),
    certifications: [],
  };
}

function normalizeResumeInput(input: unknown): ResumeJSON {
  if (!input || typeof input !== "object") {
    throw new Error("Resume data is unavailable.");
  }

  const raw = input as Record<string, any>;

  if (raw.optimized_resume) {
    return mapOptimizedPayloadToResumeJSON(raw.optimized_resume);
  }

  if (raw.optimizedResume) {
    return mapOptimizedPayloadToResumeJSON(raw.optimizedResume);
  }

  if (raw.resume) {
    return normalizeResumeInput(raw.resume);
  }

  if (raw.resumeJson) {
    return normalizeResumeInput(raw.resumeJson);
  }

  if (raw.data) {
    return normalizeResumeInput(raw.data);
  }

  if (raw.basics && Array.isArray(raw.experience) && Array.isArray(raw.education) && Array.isArray(raw.skills)) {
    return raw as ResumeJSON;
  }

  throw new Error("Unsupported resume data format.");
}

function isObject(value: unknown): value is Record<string, any> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function extractChangelog(input: unknown) {
  if (!isObject(input)) return null;
  const source = isObject(input.changelog) ? input.changelog : input;
  const ats = Number(source.ats_score_after || 0) || 0;
  const keywordsAdded = toArray<string>(source.keywords_added);
  const keywordsMissing = toArray<string>(source.keywords_missing);
  const sectionsModified = toArray<string>(source.sections_modified);
  const topChanges = toArray<string>(source.top_changes);
  const bulletChanges = toArray<any>(source.bullet_changes);

  if (!ats && !keywordsAdded.length && !keywordsMissing.length && !sectionsModified.length && !topChanges.length && !bulletChanges.length) {
    return null;
  }

  return {
    ats_score_after: ats,
    keywords_added: keywordsAdded,
    keywords_missing: keywordsMissing,
    sections_modified: sectionsModified,
    top_changes: topChanges,
    bullet_changes: bulletChanges,
  };
}

function formatDateTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function AtsScoreBadge({ score }: { score: number }) {
  if (!score || score <= 0) return null;
  const color =
    score >= 75
      ? "bg-green-100 text-green-700 border-green-200"
      : score >= 50
        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
        : "bg-red-100 text-red-700 border-red-200";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>
      ATS {score}%
    </span>
  );
}

export default function ResumeWorkspace({
  resume,
  title = "Resume preview",
  subtitle,
  metadata = [],
  onBack,
  backLabel = "Back to resumes",
}: ResumeWorkspaceProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("jake");
  const [resumeJSON, setResumeJSON] = useState<ResumeJSON | null>(null);
  const [portfoliolyResume, setPortfoliolyResume] = useState<ResumeData | null>(null);
  const [changelog, setChangelog] = useState<ReturnType<typeof extractChangelog>>(null);
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [docxGenerating, setDocxGenerating] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const normalized = normalizeResumeInput(resume);
      setResumeJSON(normalized);
      setPortfoliolyResume(convertToPortfoliolyFormat(normalized));
      setChangelog(extractChangelog(resume));
      setErrorMsg("");
      setViewMode("preview");
    } catch (err: any) {
      setResumeJSON(null);
      setPortfoliolyResume(null);
      setChangelog(null);
      setErrorMsg(err?.message || "Unable to load resume.");
    }
  }, [resume]);

  const handleDownloadDocx = useCallback(async () => {
    if (!resumeJSON || docxGenerating) return;
    setDocxGenerating(true);
    try {
      await exportResumeDocx(resumeJSON, "resume.docx");
    } catch (err: any) {
      alert(err.message || "DOCX download failed");
    } finally {
      setDocxGenerating(false);
    }
  }, [resumeJSON, docxGenerating]);

  const handleDownloadPdf = useCallback(async () => {
    if (!resumePreviewRef.current || !resumeJSON || pdfGenerating) return;
    if (viewMode !== "preview") {
      setViewMode("preview");
      return;
    }

    setPdfGenerating(true);

    try {
      let stylesheets = "";
      document.querySelectorAll("style").forEach((style) => {
        stylesheets += `${style.textContent || ""}\n`;
      });
      document.querySelectorAll("link[rel='stylesheet']").forEach((link) => {
        const href = (link as HTMLLinkElement).href;
        if (href) stylesheets += `@import url('${href}');\n`;
      });

      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${stylesheets}</style></head><body>${resumePreviewRef.current.outerHTML}</body></html>`;
      const response = await axiosInstance.post(
        "/generate-pdf",
        {
          html,
          options: {
            format: "Letter",
            printBackground: true,
            preferCSSPageSize: true,
            margin: "0in",
          },
        },
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const name = (resumeJSON.basics.name || "resume").replace(/[^a-z0-9]/gi, "_").toLowerCase();

      anchor.href = url;
      anchor.download = `${name}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      let errMsg = "PDF generation failed";
      if (err.response?.data instanceof Blob) {
        const text = await err.response.data.text();
        try {
          errMsg = JSON.parse(text).message || errMsg;
        } catch {
          errMsg = text || errMsg;
        }
      } else {
        errMsg = err.message || errMsg;
      }
      alert(errMsg);
    } finally {
      setPdfGenerating(false);
    }
  }, [resumeJSON, pdfGenerating, viewMode]);

  if (errorMsg) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {errorMsg}
      </div>
    );
  }

  if (!resumeJSON || !portfoliolyResume) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-16 text-center text-sm text-neutral-500">
        Loading resume preview...
      </div>
    );
  }

  const atsScore = changelog?.ats_score_after ?? 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
              {atsScore > 0 && <AtsScoreBadge score={atsScore} />}
            </div>
            {subtitle && <p className="text-sm text-neutral-600 max-w-3xl">{subtitle}</p>}
            {metadata.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {metadata.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-600"
                  >
                    <span className="font-medium text-neutral-900">{item.label}:</span> {item.value}
                  </div>
                ))}
              </div>
            )}
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {backLabel}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-t-2xl border border-neutral-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode("edit")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "edit" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === "preview" ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {viewMode === "preview" && (
            <div className="flex items-center gap-1 mr-2">
              {TEMPLATE_OPTIONS.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    selectedTemplate === template.id
                      ? "bg-neutral-900 text-white border-neutral-900"
                      : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          )}

          <Button
            onClick={handleDownloadPdf}
            disabled={pdfGenerating}
            className="bg-neutral-900 text-white hover:bg-neutral-800 text-sm h-9"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            {pdfGenerating ? "PDF..." : "PDF"}
          </Button>
          <Button
            onClick={handleDownloadDocx}
            disabled={docxGenerating}
            variant="outline"
            className="text-sm h-9 !border-neutral-200 !text-neutral-700 !bg-white hover:!bg-neutral-50"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            {docxGenerating ? "DOCX..." : "DOCX"}
          </Button>
        </div>
      </div>

      {changelog && (
        <div className="border-x border-neutral-200 bg-neutral-50">
          <button
            onClick={() => setChangelogOpen((value) => !value)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-medium text-neutral-800">Optimization summary</span>
              {atsScore > 0 && <AtsScoreBadge score={atsScore} />}
              <span className="text-xs text-neutral-400">
                {changelog.keywords_added.length > 0 && (
                  <span className="text-green-600 font-medium">+{changelog.keywords_added.length} keywords</span>
                )}
                {changelog.keywords_added.length > 0 && changelog.keywords_missing.length > 0 && (
                  <span className="mx-1 text-neutral-300">·</span>
                )}
                {changelog.keywords_missing.length > 0 && (
                  <span className="text-amber-600 font-medium">{changelog.keywords_missing.length} missing</span>
                )}
                {(changelog.bullet_changes?.length ?? 0) > 0 && (
                  <>
                    <span className="mx-1 text-neutral-300">·</span>
                    <span className="text-blue-600 font-medium">{changelog.bullet_changes!.length} bullets rewritten</span>
                  </>
                )}
              </span>
            </div>
            {changelogOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
          </button>

          {changelogOpen && (
            <div className="px-4 pb-5 space-y-5 border-t border-neutral-200">
              {(changelog.keywords_added.length > 0 || changelog.keywords_missing.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  {changelog.keywords_added.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">+</span>
                        <p className="text-xs font-semibold text-neutral-700">
                          Added to your resume
                          <span className="ml-1.5 text-[11px] font-normal text-green-600">({changelog.keywords_added.length})</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {changelog.keywords_added.map((kw) => (
                          <span key={kw} className="text-[11px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {changelog.keywords_missing.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">!</span>
                        <p className="text-xs font-semibold text-neutral-700">
                          Still missing from resume
                          <span className="ml-1.5 text-[11px] font-normal text-amber-600">({changelog.keywords_missing.length})</span>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {changelog.keywords_missing.map((kw) => (
                          <span key={kw} className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="rounded-b-2xl border border-t-0 border-neutral-200 bg-white">
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
    </div>
  );
}
