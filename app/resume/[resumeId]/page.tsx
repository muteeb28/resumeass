"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, FileText, RefreshCw, ShieldCheck } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import ResumeWorkspace from "@/components/resume/ResumeWorkspace";
import { Button } from "@/components/ui/button";
import { StatusBadge, getStatusLabel } from "@/components/ui/status-badge";

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
  const statusLabel = getStatusLabel(metadata.status);

  const summaryItems = [
    { label: "Filename", value: metadata.filename || "Untitled resume" },
    { label: "Status", value: statusLabel },
    { label: "Created", value: formatDateTime(metadata.createdAt) },
    { label: "Updated", value: formatDateTime(metadata.updatedAt) },
  ];

  return (
    <BackgroundRippleLayout tone="light" className="bg-page" contentClassName="resume-detail pt-[74px]" showRipple={false}>
      <Navbar tone="light" />
      <div className="px-4 pb-20 pt-24">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => router.push("/resume")}>
              <ArrowLeft className="h-4 w-4" />
              Back to resumes
            </Button>

            <Button variant="outline" onClick={() => setReloadToken((value) => value + 1)}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {errorMsg && (
            <div className="rounded-[var(--jf-radius-panel)] border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="rounded-[var(--jf-radius-panel)] border border-border-soft bg-page px-4 py-16 text-center text-sm text-ink-500">
              Loading resume...
            </div>
          ) : resumeRecord ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {summaryItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[var(--jf-radius-panel)] border border-border-soft bg-page px-4 py-4 shadow-[var(--jf-shadow-frame)]"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.09em] text-ink-500">{item.label}</div>
                    <div className="mt-2 text-sm font-medium text-ink-900">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                <div className="rounded-[var(--jf-radius-panel)] border border-border-soft bg-page p-4 shadow-[var(--jf-shadow-frame)]">
                  <div className="flex items-center gap-2 border-b border-border-soft pb-3">
                    <FileText className="h-4 w-4 text-ink-500" />
                    <h2 className="text-sm font-semibold text-ink-900">Job description</h2>
                  </div>
                  <p className="whitespace-pre-wrap pt-4 text-sm leading-7 text-ink-600">
                    {metadata.jobDescription || "—"}
                  </p>
                </div>

                <div className="rounded-[var(--jf-radius-panel)] border border-border-soft bg-page p-4 shadow-[var(--jf-shadow-frame)]">
                  <div className="flex items-center gap-2 border-b border-border-soft pb-3">
                    <ShieldCheck className="h-4 w-4 text-ink-500" />
                    <h2 className="text-sm font-semibold text-ink-900">Resume status</h2>
                  </div>
                  <div className="pt-4">
                    <StatusBadge status={metadata.status} className="px-3 py-1.5 text-xs" />
                    <div className="mt-4 flex items-center gap-2 text-sm text-ink-600">
                      <CalendarDays className="h-4 w-4" />
                      Created {formatDateTime(metadata.createdAt)}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-ink-600">
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
                  { label: "Status", value: statusLabel },
                  { label: "Created", value: formatDateTime(metadata.createdAt) },
                  { label: "Updated", value: formatDateTime(metadata.updatedAt) },
                ]}
              />
            </>
          ) : (
            <div className="rounded-[var(--jf-radius-panel)] border border-border-soft bg-page px-4 py-16 text-center text-sm text-ink-500">
              No resume found.
            </div>
          )}
        </div>
      </div>
    </BackgroundRippleLayout>
  );
}
