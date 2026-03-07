"use client";

import { useRef, useState, useEffect } from "react";
import { Navbar } from "./navbar";
import { BackgroundRippleLayout } from "./background-ripple-layout";
import { Button } from "./button";
import { buildApiUrl, extractResumeData } from "../services/resumeOptimizerApi";
import { generateJobSpecificResume } from "../services/resumeGenerator";
import JakeTemplate from "./resume/JakeTemplate";
import TemplateTwoColumn from "../templates/TemplateTwoColumn";
import TemplateSidebar from "../templates/TemplateSidebar";
import TemplateDarkSidebar from "../templates/TemplateDarkSidebar";
import { exportResumeDocx } from "../services/docxExport";
import ResumeDataEditor from "./edit/ResumeDataEditor";
import type { ResumeGenerationResult } from "@/types/resume";
import { validateResumeJson } from "../types/resume";
import type { ResumeData } from "@/types/portfolioly-resume";
import { convertToPortfoliolyFormat, normalizeProfileLinks } from "@/utils/resume-converter";
import {
  FileText,
  Upload,
  CheckCircle2,
  User,
  Briefcase,
  Sparkles,
  Blocks,
  Loader2,
  Download,
  Pencil,
  Eye,
  Globe,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import PortfolioPreview from "./portfolio-preview";

type TemplateId = "jake" | "two-column" | "sidebar" | "dark-sidebar";

const templateOptions: Array<{ id: TemplateId; name: string; description: string }> = [
  { id: "jake", name: "ATS CV", description: "Clean ATS-friendly layout" },
  { id: "two-column", name: "Two Column CV", description: "Professional two-column design" },
  { id: "sidebar", name: "Dubai CV", description: "Sidebar with skills" },
  { id: "dark-sidebar", name: "Academic CV", description: "Dark sidebar accent" },
];

type StepId = "resume" | "generate" | "results" | "portfolio-edit" | "portfolio-published";
type InputMode = "upload" | "paste" | "portfolio";
type ViewMode = "edit" | "preview";

const sanitizeFilename = (name: string) =>
  name.replace(/[^a-z0-9]/gi, "_").toLowerCase();

const isPortfoliolyResumeData = (value: any): value is ResumeData => {
  return Boolean(
    value &&
    typeof value === "object" &&
    value.basics &&
    Array.isArray(value.work) &&
    Array.isArray(value.skills) &&
    Array.isArray(value.projects) &&
    Array.isArray(value.education)
  );
};

// Processing steps for the generate screen
interface ProcessingStep {
  id: string;
  label: string;
  icon: React.ElementType;
}

const processingSteps: ProcessingStep[] = [
  { id: "read", label: "Reading document", icon: FileText },
  { id: "extract", label: "Extracting profile", icon: User },
  { id: "experience", label: "Analyzing experience", icon: Briefcase },
  { id: "skills", label: "Processing skills", icon: Sparkles },
  { id: "build", label: "Building resume", icon: Blocks },
];

// Simple text extraction for initial upload display only
const extractTextFromParsed = (data: any): string => {
  if (!data || typeof data !== "object") return "";

  if (data.originalText && typeof data.originalText === "string") {
    return data.originalText;
  }

  if (data.rawText && typeof data.rawText === "string") {
    return data.rawText;
  }

  if (data.data && data.data.originalText && typeof data.data.originalText === "string") {
    return data.data.originalText;
  }

  const content = data.fullContent || data.layout || data;
  const lines: string[] = [];

  const isResumeData = content.basics && (
    Array.isArray(content.work) ||
    Array.isArray(content.experience) ||
    Array.isArray(content.skills)
  );
  const isPortfoliolyFormat = content.personal_info || content.work_experiences;

  const name = isResumeData
    ? content.basics?.name
    : isPortfoliolyFormat
      ? content.personal_info?.full_name
      : (content.name || content.personalInfo?.name || content.contact?.name);
  if (name) lines.push(String(name));

  const contact = isResumeData
    ? content.basics
    : isPortfoliolyFormat
      ? content.personal_info
      : (content.personalInfo || content.contact || content.contactInfo || {});

  if (contact?.title || contact?.headline) {
    lines.push(String(contact.title || contact.headline));
  }
  lines.push("");

  if (contact?.email) lines.push(`Email: ${contact.email}`);
  if (contact?.phone) lines.push(`Phone: ${contact.phone}`);
  if (contact?.location) lines.push(`Location: ${contact.location}`);

  if (Array.isArray(contact?.profiles)) {
    contact.profiles.forEach((profile: any) => {
      if (profile.url) {
        const label = profile.network || profile.label || 'Link';
        lines.push(`${label}: ${profile.url}`);
      }
    });
  } else if (Array.isArray(contact?.links)) {
    contact.links.forEach((link: string) => {
      if (typeof link === "string" && link.trim()) {
        const normalized = link.trim().toLowerCase();
        const label = normalized.includes('github.com')
          ? 'GitHub'
          : normalized.includes('linkedin.com')
            ? 'LinkedIn'
            : 'Link';
        lines.push(`${label}: ${link.trim()}`);
      }
    });
  } else {
    if (contact?.github) lines.push(`GitHub: ${contact.github}`);
    if (contact?.linkedin) lines.push(`LinkedIn: ${contact.linkedin}`);
    if (contact?.twitter) lines.push(`Twitter: ${contact.twitter}`);
  }

  const summary = content.basics?.summary || content.summary || content.professionalSummary || content.profile;
  if (summary) lines.push("", "PROFESSIONAL SUMMARY", String(summary));

  const rawSkills = Array.isArray(content.skills) ? content.skills : [];
  if (rawSkills.length) {
    lines.push("", "SKILLS");
    for (const s of rawSkills) {
      if (typeof s === 'string') {
        lines.push(s);
      } else if (s && typeof s === 'object') {
        const items = Array.isArray(s.keywords) ? s.keywords : Array.isArray(s.items) ? s.items : [];
        if (items.length) {
          const label = s.name || 'Skills';
          lines.push(`${label}: ${items.join(', ')}`);
        }
      }
    }
  }

  const experience = isResumeData
    ? (
      Array.isArray(content.work)
        ? content.work
        : (Array.isArray(content.experience) ? content.experience : [])
    )
    : isPortfoliolyFormat
      ? (Array.isArray(content.work_experiences) ? content.work_experiences : [])
      : (Array.isArray(content.experience) ? content.experience : []);
  if (experience.length) {
    lines.push("", "EXPERIENCE");
    experience.forEach((exp: any) => {
      const title = exp.position || exp.title || exp.role || "";
      const company = exp.company || exp.company_name || exp.organization || "";
      let dates = exp.dates || exp.duration || "";
      if (!dates && (exp.startDate || exp.endDate)) {
        dates = [exp.startDate, exp.endDate].filter(Boolean).join(' - ');
      }
      if (!dates && (exp.start_date || exp.end_date)) {
        dates = [exp.start_date, exp.end_date].filter(Boolean).join(' - ');
      }
      if (title || company) lines.push(`${title} at ${company} (${dates})`.trim());

      let bullets = exp.highlights || exp.description || exp.bullets || exp.responsibilities || [];
      if (typeof bullets === 'string') {
        bullets = bullets.split('\n').map((line: string) => line.trim()).filter(Boolean);
      }
      if (Array.isArray(bullets)) {
        bullets.forEach((b: any) => {
          const text = String(b).trim();
          if (text) lines.push(`- ${text.replace(/^[-•*]\s*/, '')}`);
        });
      }
    });
  }

  const projects = Array.isArray(content.projects) ? content.projects : [];
  if (projects.length) {
    lines.push("", "PROJECTS");
    projects.forEach((proj: any) => {
      const projName = proj.name || proj.title || "";
      const description = proj.description || proj.summary || "";
      const link = proj.link || proj.url || "";

      if (projName) {
        lines.push(projName);
        if (description) lines.push(description);

        let bullets = proj.highlights || proj.bullets || proj.points || [];
        if (typeof bullets === 'string') {
          bullets = bullets.split('\n').map((line: string) => line.trim()).filter(Boolean);
        }
        if (Array.isArray(bullets)) {
          bullets.forEach((b: any) => {
            const text = String(b).trim();
            if (text) lines.push(`- ${text.replace(/^[-•*]\s*/, '')}`);
          });
        }

        if (link) lines.push(`Link: ${link}`);
        const tech = proj.tech || proj.technologies || [];
        if (Array.isArray(tech) && tech.length) {
          lines.push(`Tech: ${tech.join(", ")}`);
        }
      }
    });
  }

  const education = Array.isArray(content.education) ? content.education : [];
  if (education.length) {
    lines.push("", "EDUCATION");
    education.forEach((edu: any) => {
      if (typeof edu === 'string') {
        lines.push(edu);
        return;
      }

      const school = edu.institution || edu.school || edu.university || "";
      const degree = edu.studyType || edu.degree || "";
      const field = edu.area || edu.branch || "";
      const score = edu.score || edu.grade || "";
      let dates = edu.dates || edu.year || edu.graduation || "";
      if (!dates && (edu.startDate || edu.endDate)) {
        dates = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
      }

      let degreeLine = degree;
      if (field) degreeLine += ` in ${field}`;

      if (school) {
        const line = degreeLine
          ? `${degreeLine} - ${school}${dates ? ` (${dates})` : ''}`
          : `${school}${dates ? ` (${dates})` : ''}`;
        lines.push(line);
      }
      if (score) lines.push(`GPA: ${score}`);
    });
  }

  const certifications = Array.isArray(content.certifications) ? content.certifications : [];
  if (certifications.length) {
    lines.push("", "CERTIFICATIONS");
    certifications.forEach((cert: any) => {
      if (typeof cert === "string") {
        lines.push(`- ${cert}`);
      } else {
        const certName = cert.name || cert.title || "";
        const issuer = cert.issuer || "";
        const date = cert.date || "";
        const parts = [certName, issuer, date].filter(Boolean);
        if (parts.length) lines.push(`- ${parts.join(" - ")}`);
      }
    });
  }

  const achievements = Array.isArray(content.achievements) ? content.achievements
    : Array.isArray(content.awards) ? content.awards : [];
  if (achievements.length) {
    lines.push("", "ACHIEVEMENTS");
    achievements.forEach((achievement: any) => {
      if (typeof achievement === "string") {
        const text = achievement.trim();
        if (text) lines.push(`- ${text.replace(/^[-•*]\s*/, '')}`);
      } else if (achievement && typeof achievement === 'object') {
        const achName = achievement.name || achievement.title || "";
        if (achName) lines.push(`- ${achName}`);
      }
    });
  }

  const coursework = Array.isArray(content.coursework) ? content.coursework : [];
  if (coursework.length) {
    lines.push("", "COURSEWORK");
    coursework.forEach((course: any) => {
      const text = typeof course === 'string' ? course.trim() : (course?.name || '');
      if (text) lines.push(`- ${text}`);
    });
  }

  const community = Array.isArray(content.community) ? content.community : [];
  if (community.length) {
    lines.push("", "COMMUNITY & ACTIVITIES");
    community.forEach((item: any) => {
      const role = item.role || item.title || "";
      const org = item.organization || item.company || "";
      if (role || org) {
        lines.push(`- ${role}${org ? `: ${org}` : ""}`);
      }
    });
  }

  return lines.join("\r\n").trim();
};

export const CreateResumeSimple = () => {
  const [step, setStep] = useState<StepId>("resume");
  const [inputMode, setInputMode] = useState<InputMode | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [_resumeJson, setResumeJson] = useState<any>(null);
  const [parsedResumeJson, setParsedResumeJson] = useState<any>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationWarning, setGenerationWarning] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<ResumeGenerationResult | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [docxGenerating, setDocxGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("jake");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Portfolio state
  const [portfolioData, setPortfolioData] = useState<ResumeData | null>(null);
  const [portfolioViewMode, setPortfolioViewMode] = useState<ViewMode>("preview");
  const [portfolioSlug, setPortfolioSlug] = useState<string | null>(null);
  const [portfolioUrl, setPortfolioUrl] = useState<string | null>(null);
  const [portfolioCopied, setPortfolioCopied] = useState(false);
  const [isPortfolioExtracting, setIsPortfolioExtracting] = useState(false);
  const [isPortfolioPublishing, setIsPortfolioPublishing] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [portfolioFileName, setPortfolioFileName] = useState<string | null>(null);

  // Processing step tracker for generate screen
  const [activeProcessingStep, setActiveProcessingStep] = useState(0);

  const resumePreviewRef = useRef<HTMLDivElement | null>(null);

  // Animate processing steps while generating
  useEffect(() => {
    if (!isGenerating) {
      setActiveProcessingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveProcessingStep((prev) => {
        if (prev < processingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setResumeError("Please upload a PDF resume.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setResumeError("File size exceeds 10MB limit.");
      return;
    }

    setIsExtracting(true);
    setResumeError(null);
    setUploadedFileName(file.name);

    try {
      const parsed = await extractResumeData(file);
      setParsedResumeJson(parsed);

      const text = extractTextFromParsed(parsed);

      setTimeout(() => {
        setResumeText(text);
      }, 100);
      if (!text.trim()) {
        setResumeError("We could not extract text from this PDF. Please paste your resume text.");
      }
    } catch (error: any) {
      setResumeError(error?.message || "Failed to extract resume text.");
    } finally {
      setIsExtracting(false);
      event.target.value = "";
    }
  };

  const handleContinue = async () => {
    const trimmedResume = resumeText.trim();
    if (!trimmedResume) {
      if (uploadedFileName) {
        setResumeError("We could not extract text from your PDF. Please paste your resume text.");
      } else {
        setResumeError("Upload a PDF or paste your resume text to continue.");
      }
      return;
    }
    setResumeError(null);
    await handleGenerate();
  };

  const handleGenerate = async () => {
    setGenerationError(null);
    setGenerationWarning(null);
    setIsGenerating(true);
    setActiveProcessingStep(0);
    setStep("generate");

    try {
      let result: ResumeGenerationResult;

      if (parsedResumeJson) {
        const portfoliolyResume = isPortfoliolyResumeData(parsedResumeJson)
          ? parsedResumeJson
          : convertToPortfoliolyFormat(parsedResumeJson);

        setParsedResumeJson(portfoliolyResume as any);
        setResumeJson(portfoliolyResume as any);

        setGenerationResult({
          resume: portfoliolyResume as any,
          report: {
            matchEstimate: 100,
            keywordsAdded: [],
            keywordsMissing: [],
            changes: []
          },
          meta: { source: 'direct-parse', reason: 'Using portfolioly format from backend' }
        });
        setStep("results");
        return;
      } else {
        const cleanedResumeText = resumeText
          .split('\n')
          .reduce((acc: string[], line: string) => {
            const trimmed = line.trim();
            if (trimmed && /^(PROFESSIONAL SUMMARY|SKILLS|EXPERIENCE|EDUCATION|PROJECTS|COMMUNITY|VOLUNTEER|AWARDS|CERTIFICATIONS|LANGUAGES)$/i.test(trimmed)) {
              const recentLines = acc.slice(-3);
              if (recentLines.some(l => l.trim() === trimmed)) {
                return acc;
              }
            }
            acc.push(line);
            return acc;
          }, [])
          .join('\n');

        result = await generateJobSpecificResume({
          resumeText: cleanedResumeText,
          jobDescription: "",
        });
      }

      const validation = validateResumeJson(result.resume);
      if (!validation.valid) {
        throw new Error(`Invalid resume data: ${validation.errors.join(", ")}`);
      }

      setGenerationResult(result);
      const flags = result.report?.flags || [];
      if (flags.includes("experience_unparsed")) {
        setGenerationWarning(
          "We could not fully structure your experience section."
        );
      }
      setStep("results");
    } catch (error: any) {
      setGenerationError(error?.message || "Failed to generate resume.");
      setStep("resume");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!resumePreviewRef.current || !generationResult || pdfGenerating) return;

    try {
      setPdfGenerating(true);
      const element = resumePreviewRef.current;

      let stylesheets = "";
      const styleElements = Array.from(document.querySelectorAll("style"));
      styleElements.forEach((style) => {
        stylesheets += style.textContent + "\n";
      });

      const linkElements = Array.from(
        document.querySelectorAll("link[rel=\"stylesheet\"]")
      );
      for (const link of linkElements) {
        const href = (link as HTMLLinkElement).href;
        if (href) stylesheets += `@import url('${href}'); \n`;
      }

      const html = `
        <!DOCTYPE html>
          <html>
            <head><meta charset="UTF-8"><style>${stylesheets}</style></head>
            <body>${element.outerHTML}</body>
          </html>
      `;

      const response = await fetch(buildApiUrl("generate-pdf"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html,
          options: {
            format: "Letter",
            printBackground: true,
            preferCSSPageSize: true,
            margin: "0in",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("PDF generation failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const name = generationResult.resume.basics.name || "resume";
      link.href = url;
      link.download = `${sanitizeFilename(name)}-resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation error:", error);
      setGenerationError("Failed to generate PDF.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!generationResult || docxGenerating) return;
    try {
      setDocxGenerating(true);
      const name = generationResult.resume.basics.name || "resume";
      await exportResumeDocx(
        generationResult.resume,
        `${sanitizeFilename(name)}-resume.docx`,
        "classic"
      );
    } catch (error) {
      console.error("DOCX generation error:", error);
      setGenerationError("Failed to generate DOCX.");
    } finally {
      setDocxGenerating(false);
    }
  };

  const handleResumeChange = (updatedResume: ResumeData) => {
    setGenerationResult((prev) =>
      prev ? { ...prev, resume: updatedResume as any } : prev
    );
  };

  const handleCopyLink = () => {
    if (!publishedUrl) return;
    navigator.clipboard.writeText(publishedUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Portfolio Flow Handlers ────────────────────────────────────────

  const handlePortfolioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setPortfolioError("Please upload a PDF resume.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPortfolioError("File size exceeds 10MB limit.");
      return;
    }

    setIsPortfolioExtracting(true);
    setPortfolioError(null);
    setPortfolioFileName(file.name);

    try {
      const parsed = await extractResumeData(file) as any;
      console.log('[PORTFOLIO] Server response keys:', Object.keys(parsed));
      console.log('[PORTFOLIO] experience:', parsed.experience?.length, 'work_experiences:', parsed.work_experiences?.length);

      // Build portfolio data directly from server response — no double conversion
      const p = parsed;
      const exp = p.experience || p.work_experiences || [];
      const edu = p.education || [];
      const sk = p.skills || [];
      const proj = p.projects || [];
      const achv = p.achievements || [];
      const pi = p.personal_info || {};
      const basics = p.basics || {};

      const rawProfileLinks = [
        ...(Array.isArray(basics.links) ? basics.links : []),
        ...((Array.isArray(pi.profiles) ? pi.profiles : [])
          .map((pr: any) => pr?.url)
          .filter(Boolean)),
      ];
      const normalizedProfileLinks = normalizeProfileLinks(rawProfileLinks);

      const portfolioResult = {
        basics: {
          name: basics.name || pi.full_name || "",
          email: basics.email || pi.email || "",
          phone: basics.phone || pi.phone || "",
          headline: basics.title || pi.headline || "",
          summary: basics.summary || pi.summary || "",
          location: basics.location || pi.location || "",
          profiles: normalizedProfileLinks.map((link: string) => ({
            network: link?.toLowerCase().includes('github') ? 'GitHub' :
              link?.toLowerCase().includes('linkedin') ? 'LinkedIn' : 'Link',
            username: '',
            url: link || ""
          }))
        },
        work: exp.map((e: any) => ({
          company: e.company || e.organization || "",
          position: e.role || e.title || e.position || "",
          startDate: e.startDate || e.start_date || (e.dates || "").split(/[-–—]/)[0]?.trim() || "",
          endDate: e.endDate || e.end_date || (e.is_current ? "Present" : (e.dates || "").split(/[-–—]/)[1]?.trim()) || "Present",
          highlights: e.bullets || e.highlights || []
        })),
        education: edu.map((e: any) => ({
          institution: e.school || e.institution || "",
          area: e.degree || e.area || "",
          studyType: "Degree",
          score: e.gpa || e.score || ""
        })),
        skills: Array.isArray(sk) && sk.length > 0 && sk[0]?.items
          ? sk.map((s: any) => ({ name: s.name || "Skills", keywords: s.items || [] }))
          : (sk.categories || []).map((c: any) => ({ name: c.name || "Skills", keywords: c.items || [] })),
        projects: proj.map((pr: any) => ({
          name: pr.name || "",
          description: pr.description || pr.more_context || "",
          entity: "Personal",
          type: "Project",
          liveUrl: pr.live_link || pr.liveUrl || pr.link || "",
          sourceUrl: pr.github || pr.sourceUrl || pr.source || "",
        })),
        awards: (Array.isArray(achv) ? achv : []).map((a: any) => ({
          title: typeof a === 'string' ? a : (a.name || a.title || ''),
          date: '',
          awarder: '',
          summary: ''
        })),
        volunteer: []
      };

      console.log('[PORTFOLIO] Built portfolio:', {
        work: portfolioResult.work.length,
        education: portfolioResult.education.length,
        skills: portfolioResult.skills.length,
        projects: portfolioResult.projects.length,
        awards: portfolioResult.awards.length,
      });

      setPortfolioData(portfolioResult);
      setStep("portfolio-edit");
    } catch (error: any) {
      setPortfolioError(error?.message || "Failed to extract resume. Please try again.");
    } finally {
      setIsPortfolioExtracting(false);
      event.target.value = "";
    }
  };

  const handlePortfolioPublish = async () => {
    if (!portfolioData || isPortfolioPublishing) return;

    try {
      setIsPortfolioPublishing(true);
      const res = await fetch(buildApiUrl("/portfolio"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ data: portfolioData, theme: "default" }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to publish");
      }

      const result = await res.json();
      const fullUrl = `${window.location.origin}${result.url}`;
      setPortfolioSlug(result.slug);
      setPortfolioUrl(fullUrl);
      setStep("portfolio-published");
      toast.success("Portfolio published!");
    } catch (error: any) {
      toast.error(error.message || "Failed to publish portfolio");
    } finally {
      setIsPortfolioPublishing(false);
    }
  };

  const handlePortfolioCopyLink = () => {
    if (!portfolioUrl) return;
    navigator.clipboard.writeText(portfolioUrl);
    setPortfolioCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setPortfolioCopied(false), 2000);
  };

  // ─── Upload / Source Step ───────────────────────────────────────────
  const renderUploadStep = () => (
    <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
        Import Your Professional Data
      </h1>
      <p className="mt-4 text-neutral-500 text-lg">
        Choose a source to get started — quick and easy. You can edit anytime.
      </p>

      {/* Source cards */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
        {/* Upload PDF card — clicking opens file picker directly */}
        <label
          className={`group flex flex-col items-center gap-4 rounded-2xl border-2 bg-white p-8 transition-all hover:shadow-md cursor-pointer ${inputMode === "upload"
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
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={(e) => {
              setInputMode("upload");
              handleFileUpload(e);
            }}
            disabled={isExtracting}
          />
        </label>

        {/* Create Portfolio card — clicking opens file picker directly */}
        <label
          className={`group flex flex-col items-center gap-4 rounded-2xl border-2 bg-white p-8 transition-all hover:shadow-md cursor-pointer ${inputMode === "portfolio"
              ? "border-neutral-900 shadow-md"
              : "border-neutral-200 hover:border-neutral-300"
            }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-600 group-hover:bg-neutral-200 transition-colors">
            <Globe className="h-7 w-7" />
          </div>
          <div>
            <div className="text-lg font-semibold text-neutral-900">Create Portfolio</div>
            <p className="mt-1 text-sm text-neutral-500">
              Turn your resume into a shareable portfolio page
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={(e) => {
              setInputMode("portfolio");
              handlePortfolioUpload(e);
            }}
            disabled={isPortfolioExtracting}
          />
        </label>
      </div>

      {/* Expanded input area */}
      {inputMode && (
        <div className="mt-8 w-full max-w-xl text-left">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            {inputMode === "upload" && (
              <>
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
              </>
            )}

            {inputMode === "portfolio" && (
              <>
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
                    onChange={handlePortfolioUpload}
                    disabled={isPortfolioExtracting}
                  />
                </label>
                {portfolioFileName && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
                    <FileText className="h-4 w-4" />
                    {portfolioFileName}
                  </div>
                )}
                {isPortfolioExtracting && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting resume content...
                  </div>
                )}
                {portfolioError && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {portfolioError}
                  </div>
                )}
              </>
            )}

            {/* Show extracted text (or paste area if extraction failed) */}
            {inputMode === "upload" && (resumeText || resumeError) && (
              <div className="mt-4">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  {resumeText ? "Extracted Text (editable)" : "Paste Your Resume Text"}
                </label>
                <textarea
                  value={resumeText}
                  onChange={(event) => {
                    setResumeText(event.target.value);
                    if (parsedResumeJson) {
                      setParsedResumeJson(null);
                    }
                    if (event.target.value && resumeError) {
                      setResumeError(null);
                    }
                  }}
                  placeholder="Paste your resume text here..."
                  className="mt-2 h-40 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 resize-none"
                />
              </div>
            )}

            {isExtracting && (
              <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Extracting resume content...
              </div>
            )}

            {resumeError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {resumeError}
              </div>
            )}

            {inputMode !== "portfolio" && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleContinue}
                  disabled={isExtracting || isGenerating}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 px-8"
                >
                  Get started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ─── Generating / Processing Step ──────────────────────────────────
  const renderGenerateStep = () => (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight">
        Import Your Professional Data
      </h1>
      <p className="mt-4 text-neutral-500 text-lg">
        Choose a source to get started — quick and easy. You can edit anytime.
      </p>

      <div className="mt-12 w-full text-left">
        <div className="flex items-center gap-2 mb-6">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-600" />
          <span className="text-sm font-semibold uppercase tracking-wider text-neutral-600">
            AI Processing
          </span>
        </div>

        <div className="space-y-5">
          {processingSteps.map((ps, idx) => {
            const Icon = ps.icon;
            const isDone = idx < activeProcessingStep;
            const isActive = idx === activeProcessingStep;


            return (
              <div key={ps.id} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${isDone
                    ? "bg-neutral-900 text-white"
                    : isActive
                      ? "bg-neutral-100 text-neutral-700"
                      : "bg-neutral-50 text-neutral-300"
                  }`}>
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isActive ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`text-base ${isDone
                    ? "text-neutral-500 line-through"
                    : isActive
                      ? "text-neutral-900 font-medium"
                      : "text-neutral-400"
                  }`}>
                  {ps.label}{isActive ? " ..." : ""}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-sm text-neutral-400">
          Usually takes 30-60 seconds
        </p>
      </div>
    </div>
  );

  // ─── Results Step ──────────────────────────────────────────────────
  const renderResultsStep = () => {
    if (!generationResult) return null;

    const resume = generationResult.resume;
    const portfoliolyResume = isPortfoliolyResumeData(resume)
      ? resume
      : convertToPortfoliolyFormat(resume as any);

    return (
      <div className="space-y-0">
        {/* Top toolbar - like Portfolioly's Edit/Preview/Fullscreen/Deploy/Publish/Save */}
        <div className="rounded-t-2xl border border-neutral-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode("edit")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "edit"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
                }`}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "preview"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
                }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === "preview" && (
              <div className="flex items-center gap-1 mr-2">
                {templateOptions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${selectedTemplate === t.id
                        ? "bg-neutral-900 text-white border-neutral-900"
                        : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
                      }`}
                    title={t.description}
                  >
                    {t.name}
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

          {/* Published link banner */}
          {publishedUrl && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-sm">
              <span className="text-green-700 truncate max-w-[200px] sm:max-w-xs">{publishedUrl}</span>
              <button
                onClick={handleCopyLink}
                className="text-green-600 hover:text-green-800 transition-colors flex-shrink-0"
                title="Copy link"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Warnings */}
        {(generationWarning || generationError) && (
          <div className="border-x border-neutral-200 bg-white px-4 py-2 space-y-2">
            {generationWarning && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-700">
                {generationWarning}
              </div>
            )}
            {generationError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-sm text-red-600">
                {generationError}
              </div>
            )}
          </div>
        )}

        {/* Content area */}
        <div className="rounded-b-2xl border border-t-0 border-neutral-200 bg-white">
          {viewMode === "edit" && (
            <div className="p-6">
              <ResumeDataEditor data={portfoliolyResume} onChange={handleResumeChange} />
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

        {/* Start over link */}
        <div className="pt-4 text-center">
          <button
            onClick={() => setStep("resume")}
            className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Start another resume
          </button>
        </div>
      </div>
    );
  };

  // ─── Portfolio Edit Step ────────────────────────────────────────────
  const renderPortfolioEditStep = () => {
    if (!portfolioData) return null;

    return (
      <div className="space-y-0">
        {/* Top toolbar — same style as resume results */}
        <div className="rounded-t-2xl border border-neutral-200 bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPortfolioViewMode("edit")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                portfolioViewMode === "edit"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={() => setPortfolioViewMode("preview")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                portfolioViewMode === "preview"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePortfolioPublish}
              disabled={isPortfolioPublishing}
              className="bg-neutral-900 text-white hover:bg-neutral-800 text-sm h-9"
            >
              <Globe className="h-3.5 w-3.5 mr-1" />
              {isPortfolioPublishing ? "Publishing..." : "Publish Portfolio"}
            </Button>
          </div>
        </div>

        {/* Content area */}
        <div className="rounded-b-2xl border border-t-0 border-neutral-200 bg-white">
          {portfolioViewMode === "edit" && (
            <div className="p-6">
              <ResumeDataEditor data={portfolioData} onChange={setPortfolioData} />
            </div>
          )}

          {portfolioViewMode === "preview" && (
            <div className="p-6">
              <PortfolioPreview data={portfolioData} />
            </div>
          )}

        </div>

        {/* Start over link */}
        <div className="pt-4 text-center">
          <button
            onClick={() => {
              setStep("resume");
              setInputMode(null);
              setPortfolioData(null);
              setPortfolioFileName(null);
            }}
            className="text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            Start over
          </button>
        </div>
      </div>
    );
  };

  // ─── Portfolio Published Step ──────────────────────────────────────
  const renderPortfolioPublishedStep = () => (
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
            {portfolioUrl}
          </div>
          <button
            onClick={handlePortfolioCopyLink}
            className="shrink-0 text-neutral-600 hover:text-neutral-800 transition-colors"
            title="Copy link"
          >
            {portfolioCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <a
            href={`/p/${portfolioSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Portfolio
          </a>
          <button
            onClick={() => {
              setStep("resume");
              setInputMode(null);
              setPortfolioData(null);
              setPortfolioFileName(null);
              setPortfolioUrl(null);
              setPortfolioSlug(null);
            }}
            className="px-5 py-2 border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
          >
            Create Another
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <BackgroundRippleLayout
      tone="light"
      className="bg-white"
      contentClassName="resume-optimizer pt-16"
    >
      <Navbar tone="light" />
      <div className="px-4 pb-20 pt-24">
        <div className="mx-auto max-w-6xl">
          {step === "resume" && renderUploadStep()}
          {step === "generate" && renderGenerateStep()}
          {step === "results" && renderResultsStep()}
          {step === "portfolio-edit" && renderPortfolioEditStep()}
          {step === "portfolio-published" && renderPortfolioPublishedStep()}
        </div>
      </div>
    </BackgroundRippleLayout>
  );
};
