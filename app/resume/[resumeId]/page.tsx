"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, RefreshCw, ShieldCheck } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import ResumeWorkspace from "@/components/resume/ResumeWorkspace";

interface ResumeMetadataRow {
  filename?: string;
  jobDescription?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getResumeRecord(payload: any) {
  return (
    payload?.data?.resume ??
    payload?.data?.item ??
    payload?.data ??
    payload?.resume ??
    payload?.item ??
    payload
  );
}

function getStatusStyle(raw?: string) {
  const key = (raw || "pending").toLowerCase();

  if (["done", "completed", "success", "ready"].includes(key)) {
    return {
      label: raw || "Completed",
      className: "bg-green-100 text-green-700 border-green-200",
    };
  }

  if (["processing", "optimizing", "in-progress", "in_progress", "generating"].includes(key)) {
    return {
      label: raw || "Processing",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    };
  }

  if (["pending", "queued", "draft"].includes(key)) {
    return {
      label: raw || "Pending",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    };
  }

  if (["failed", "error"].includes(key)) {
    return {
      label: raw || "Failed",
      className: "bg-red-100 text-red-700 border-red-200",
    };
  }

  return {
    label: raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Pending",
    className: "bg-neutral-100 text-neutral-700 border-neutral-200",
  };
}

export default function ResumePage() {
  const params = useParams<{ resumeId: string }>();
  const router = useRouter();
  const resumeId = Array.isArray(params?.resumeId) ? params.resumeId[0] : params?.resumeId;

  const [resumeRecord, setResumeRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [optimizedResumeContent, setOptimizedResumeContent] = useState(null);

  useEffect(() => {
    if (!resumeId) return;

    let active = true;

    const fetchResume = async () => {
      setLoading(true);
      setErrorMsg("");

      try {
        const response = await axiosInstance.get(`/resume/list/${resumeId}`);
        const record = getResumeRecord(response.data);
        if (!active) return;
        setResumeRecord(record);
        setOptimizedResumeContent(record.optimizedContent);
      } catch (err: any) {
        if (!active) return;
        setResumeRecord(null);
        setErrorMsg(err?.response?.data?.message || err?.message || "Failed to load resume.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchResume();

    return () => {
      active = false;
    };
  }, [resumeId, reloadToken]);

  const metadata: ResumeMetadataRow = resumeRecord || {};
  const status = getStatusStyle(metadata.status);

  const summaryItems = [
    { label: "Filename", value: metadata.filename || "Untitled resume" },
    { label: "Status", value: status.label },
    { label: "Created", value: formatDateTime(metadata.createdAt) },
    { label: "Updated", value: formatDateTime(metadata.updatedAt) },
  ];

  return (
    <BackgroundRippleLayout tone="light" className="bg-white" contentClassName="resume-detail pt-16">
      <Navbar tone="light" />
      <div className="px-4 pb-20 pt-24">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => router.push("/resume")}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to resumes
            </button>

            <button
              onClick={() => setReloadToken((value) => value + 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-16 text-center text-sm text-neutral-500">
              Loading resume...
            </div>
          ) : resumeRecord ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryItems.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{item.label}</div>
                    <div className="mt-2 text-sm font-medium text-neutral-900">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
                    <FileText className="h-4 w-4 text-neutral-500" />
                    <h2 className="text-sm font-semibold text-neutral-900">Job description</h2>
                  </div>
                  <p className="whitespace-pre-wrap pt-4 text-sm leading-7 text-neutral-600">
                    {metadata.jobDescription || "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
                    <ShieldCheck className="h-4 w-4 text-neutral-500" />
                    <h2 className="text-sm font-semibold text-neutral-900">Resume status</h2>
                  </div>
                  <div className="pt-4">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                    <div className="mt-4 flex items-center gap-2 text-sm text-neutral-600">
                      <CalendarDays className="h-4 w-4" />
                      Created {formatDateTime(metadata.createdAt)}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-neutral-600">
                      <CalendarDays className="h-4 w-4" />
                      Updated {formatDateTime(metadata.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              <ResumeWorkspace
                resume={optimizedResumeContent}
                title={metadata.filename || "Resume preview"}
                subtitle={metadata.jobDescription}
                metadata={[
                  { label: "Status", value: status.label },
                  { label: "Created", value: formatDateTime(metadata.createdAt) },
                  { label: "Updated", value: formatDateTime(metadata.updatedAt) },
                ]}
              />
            </>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-16 text-center text-sm text-neutral-500">
              No resume found.
            </div>
          )}
        </div>
      </div>
    </BackgroundRippleLayout>
  );
}
