"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "./navbar";
import { BackgroundRippleLayout } from "./background-ripple-layout";
import { Button } from "./button";
import ResumeDataEditor from "./edit/ResumeDataEditor";
import PortfolioPreview from "./portfolio-preview";
import { extractPortfolioData, buildApiUrl } from "../services/resumeOptimizerApi";
import { convertToPortfoliolyFormat } from "../utils/resume-converter";
import { parserToV2 } from "@/types/resume";
import type { ResumeData } from "@/types/portfolioly-resume";
import {
  Upload,
  FileText,
  Loader2,
  Pencil,
  Eye,
  Globe,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { DeployToVercelButton } from "./DeployToVercelButton";

type StepId = "upload" | "edit" | "published";
type ViewMode = "edit" | "preview" | "raw";

export default function CreatePortfolioPage() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<StepId>("upload");
  const [showUploadZone, setShowUploadZone] = useState(false);

  // Upload state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Editor state
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [rawExtracted, setRawExtracted] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("edit");

  // Publish state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Live URL after Vercel deployment
  const [liveUrl, setLiveUrl] = useState("");
  const [liveCopied, setLiveCopied] = useState(false);

  // Detect Vercel redirect: /portfolio?vercel_deployed=true&slug=xxx
  useEffect(() => {
    const vercelDeployed = searchParams.get("vercel_deployed");
    const slug = searchParams.get("slug");
    if (vercelDeployed === "true" && slug) {
      const url = `${window.location.origin}/p/${slug}`;
      setPublishedSlug(slug);
      setPublishedUrl(url);
      setLiveUrl(`https://${slug}-portfolio.vercel.app`);
      setStep("published");
    }
  }, [searchParams]);

  // ─── Upload Handler ───────────────────────────────────────────────

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Please upload a PDF resume.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size exceeds 10MB limit.");
      return;
    }

    setIsExtracting(true);
    setUploadError(null);
    setUploadedFileName(file.name);

    try {
      const parsed = await extractPortfolioData(file);
      setRawExtracted(parsed);
      setViewMode("raw");
      setStep("edit");
      try {
        const v2 = parserToV2(parsed as any);
        const converted = convertToPortfoliolyFormat(v2);
        setResumeData(converted);
      } catch {
        // conversion failed — raw view still shows
      }
    } catch (error: any) {
      setUploadError(error?.message || "Failed to extract resume. Please try again.");
    } finally {
      setIsExtracting(false);
      event.target.value = "";
    }
  };

  // ─── Publish Handler ──────────────────────────────────────────────

  const handlePublish = async () => {
    if (!resumeData || isPublishing) return;

    try {
      setIsPublishing(true);
      const res = await fetch(buildApiUrl("/portfolio"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ data: resumeData, theme: "default" }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to publish");
      }

      const result = await res.json();
      const fullUrl = `${window.location.origin}${result.url}`;
      setPublishedSlug(result.slug);
      setPublishedUrl(fullUrl);
      setStep("published");
      toast.success("Portfolio published!");
    } catch (error: any) {
      toast.error(error.message || "Failed to publish portfolio");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    if (!publishedUrl) return;
    navigator.clipboard.writeText(publishedUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Step 1: Upload (matches /create page design) ─────────────────

  const renderUploadStep = () => (
    <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
        Import Your Professional Data
      </h1>
      <p className="mt-4 text-neutral-500 text-lg">
        Upload your resume to create a portfolio — quick and easy. You can edit anytime.
      </p>

      {/* Source card */}
      <div className="mt-10 w-full max-w-xl">
        <button
          onClick={() => setShowUploadZone(true)}
          className={`group flex flex-col items-center gap-4 rounded-2xl border-2 bg-white p-8 transition-all hover:shadow-md w-full ${
            showUploadZone
              ? "border-neutral-900 shadow-md"
              : "border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200 transition-colors">
            <Upload className="h-7 w-7" />
          </div>
          <div>
            <div className="text-lg font-semibold text-neutral-900">Upload Resume</div>
            <p className="mt-1 text-sm text-neutral-500">
              Extract your professional experience and projects
            </p>
          </div>
        </button>
      </div>

      {/* Expanded upload area */}
      {showUploadZone && (
        <div className="mt-8 w-full max-w-xl text-left">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-200 rounded-xl cursor-pointer bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300 transition-all">
              <Upload className="h-8 w-8 text-neutral-400 mb-2" />
              <div className="text-neutral-700 text-sm font-semibold">
                Drop your PDF resume here
              </div>
              <p className="text-neutral-400 text-xs mt-1">PDF up to 10MB</p>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileUpload}
                disabled={isExtracting}
              />
            </label>

            {uploadedFileName && (
              <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
                <FileText className="h-4 w-4" />
                {uploadedFileName}
              </div>
            )}

            {isExtracting && (
              <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting resume content...
              </div>
            )}

            {uploadError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {uploadError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ─── Step 2: Edit / Preview (matches /create results toolbar) ─────

  const renderEditStep = () => {
    if (!resumeData && !rawExtracted) return null;

    return (
      <div className="space-y-0">
        {/* Top toolbar */}
        <div className="rounded-t-2xl border border-neutral-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("edit")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "edit"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "preview"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === "raw"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Raw
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-neutral-900 text-white hover:bg-neutral-800 text-sm h-9"
            >
              <Globe className="h-3.5 w-3.5 mr-1" />
              {isPublishing ? "Publishing..." : "Publish Portfolio"}
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="rounded-b-2xl border border-t-0 border-neutral-200 bg-white">
          {viewMode === "edit" && resumeData && (
            <div className="p-6">
              <ResumeDataEditor data={resumeData} onChange={setResumeData} />
            </div>
          )}

          {viewMode === "preview" && resumeData && (
            <div className="p-6">
              <PortfolioPreview data={resumeData} />
            </div>
          )}

          {viewMode === "raw" && (
            <div className="p-6">
              <textarea
                readOnly
                value={JSON.stringify(rawExtracted, null, 2)}
                className="w-full h-[70vh] font-mono text-xs bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-neutral-800 resize-none focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Start over link */}
        <div className="pt-4 text-center">
          <button
            onClick={() => {
              setStep("upload");
              setResumeData(null);
              setUploadedFileName(null);
              setShowUploadZone(false);
            }}
            className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    );
  };

  // ─── Step 3: Published ────────────────────────────────────────────

  const renderPublishedStep = () => (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto py-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 w-full space-y-6">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <Globe className="h-7 w-7 text-green-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-neutral-900">Portfolio Published!</h2>
          <p className="text-neutral-500 text-sm">
            Your portfolio is now live and ready to share
          </p>
        </div>

        {/* URL + Copy */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2.5 text-sm text-neutral-700 font-mono truncate text-left">
            {publishedUrl}
          </div>
          <button
            onClick={handleCopyLink}
            className="shrink-0 text-neutral-600 hover:text-neutral-800 transition-colors"
            title="Copy link"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 justify-center">
            <a
              href={`/p/${publishedSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Portfolio
            </a>
            <button
              onClick={() => {
                setStep("upload");
                setResumeData(null);
                setUploadedFileName(null);
                setPublishedUrl(null);
                setPublishedSlug(null);
                setShowUploadZone(false);
              }}
              className="px-5 py-2 border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
            >
              Create Another
            </button>
          </div>

          {/* One-click Vercel deploy */}
          {publishedSlug && (
            <div className="pt-2 border-t border-neutral-100 space-y-4">
              <div>
                <p className="text-xs text-neutral-400 text-center mb-3">
                  Want your own domain? Deploy to Vercel in one click.
                </p>
                <div className="flex justify-center">
                  <DeployToVercelButton slug={publishedSlug} />
                </div>
              </div>

              {/* Live URL section */}
              <div className="pt-2 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 font-semibold mb-2 text-center">
                  After deploying, paste your live site URL here
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://your-portfolio.vercel.app"
                    className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-400 font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(liveUrl);
                      setLiveCopied(true);
                      setTimeout(() => setLiveCopied(false), 2000);
                    }}
                    disabled={!liveUrl}
                    className="shrink-0 text-neutral-500 hover:text-neutral-700 disabled:opacity-30 transition-colors"
                    title="Copy live URL"
                  >
                    {liveCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                  {liveUrl && (
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-xs font-medium"
                      title="Open live site"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Visit
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Main Render ──────────────────────────────────────────────────

  return (
    <BackgroundRippleLayout
      tone="light"
      className="bg-white"
      contentClassName="resume-optimizer pt-16"
    >
      <Navbar tone="light" />
      <div className="px-4 pb-20 pt-24">
        <div className="mx-auto max-w-6xl">
          {step === "upload" && renderUploadStep()}
          {step === "edit" && renderEditStep()}
          {step === "published" && renderPublishedStep()}
        </div>
      </div>
    </BackgroundRippleLayout>
  );
}
