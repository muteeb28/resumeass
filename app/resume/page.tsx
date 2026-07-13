"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FileText, RefreshCw } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ResumeListRow, type ResumeListRowData } from "@/components/resume/ResumeListRow";
import { PAGE_TITLE } from "@/lib/typography";

type ResumeStatus = string;

interface ResumeRow {
  _id?: string;
  id?: string;
  filename?: string;
  jobDescription?: string;
  status?: ResumeStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface PaginationState {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

const PAGE_SIZE = 10;

function getRecords(payload: any): ResumeRow[] {
  const source =
    payload?.data?.resumes ??
    payload?.data?.items ??
    payload?.data?.list ??
    payload?.resumes ??
    payload?.items ??
    payload?.list ??
    [];

  return Array.isArray(source) ? source : [];
}

function getPagination(payload: any, fallbackTotal: number): PaginationState {
  const source = payload?.data?.pagination ?? payload?.pagination ?? {};
  const total = Number(source.total ?? payload?.data?.total ?? payload?.total ?? fallbackTotal) || fallbackTotal;
  const totalPages = Number(source.totalPages ?? source.pages ?? payload?.data?.totalPages ?? payload?.totalPages) || Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Number(source.page ?? payload?.data?.page ?? payload?.page ?? 1) || 1;
  const limit = Number(source.limit ?? payload?.data?.limit ?? payload?.limit ?? PAGE_SIZE) || PAGE_SIZE;

  return { page, totalPages: Math.max(totalPages, 1), total, limit };
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

function toRowData(row: ResumeRow, page: number, index: number): ResumeListRowData {
  return {
    id: row._id || row.id || "",
    filename: row.filename || "Untitled resume",
    jobDescription: row.jobDescription || "—",
    status: row.status,
    createdAt: formatDateTime(row.createdAt),
    updatedAt: formatDateTime(row.updatedAt),
  };
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <tr key={index} className="animate-pulse border-b border-border-soft">
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="h-4 w-full max-w-[180px] rounded bg-track" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ResumeList() {
  const [rows, setRows] = useState<ResumeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: PAGE_SIZE,
  });

  const fetchResumes = useCallback(async (page: number) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await axiosInstance.get("/resume/list", {
        params: {
          page,
          limit: PAGE_SIZE,
        },
      });

      const records = getRecords(response.data);
      setRows(records);
      setPagination(getPagination(response.data, records.length));
    } catch (err: any) {
      setRows([]);
      setPagination((current) => ({
        ...current,
        page,
      }));
      setErrorMsg(err?.response?.data?.message || err?.message || "Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes(pagination.page);
  }, [fetchResumes, pagination.page]);

  const handlePrev = () => {
    setPagination((current) => ({
      ...current,
      page: Math.max(1, current.page - 1),
    }));
  };

  const handleNext = () => {
    setPagination((current) => ({
      ...current,
      page: Math.min(current.totalPages, current.page + 1),
    }));
  };

  return (
    <BackgroundRippleLayout tone="light" className="bg-page" contentClassName="resume-list pt-[74px]" showRipple={false}>
      <Navbar tone="light" />
      <div className="px-4 pb-20 pt-24">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 rounded-[var(--jf-radius-panel)] border border-border-soft bg-page px-5 py-5 shadow-[var(--jf-shadow-frame)] sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface-alt px-3 py-1 text-xs font-medium text-ink-600">
                <FileText className="h-3.5 w-3.5" />
                Resume library
              </div>
              <div>
                <h1 className={PAGE_TITLE}>Generated resumes</h1>
                <p className="mt-1 max-w-2xl text-sm text-ink-600">
                  Track every resume you&apos;ve generated, review its status, and open the full optimized view when you need to make changes.
                </p>
              </div>
            </div>

            <Button variant="outline" onClick={() => fetchResumes(pagination.page)}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="overflow-hidden rounded-[var(--jf-radius-panel)] border border-border-soft bg-page shadow-[var(--jf-shadow-frame)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-surface-alt">
                  <tr className="border-b border-border-soft">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.09em] text-ink-500">Filename</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.09em] text-ink-500">Job description</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.09em] text-ink-500">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.09em] text-ink-500">Created</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.09em] text-ink-500">Updated</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.09em] text-ink-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft">
                  {loading ? (
                    <TableSkeleton />
                  ) : errorMsg ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <p className="text-sm font-medium text-ink-900">We couldn&apos;t load your resumes.</p>
                        <p className="mt-1 text-sm text-ink-500">{errorMsg}</p>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <p className="text-sm font-medium text-ink-900">No resumes yet</p>
                        <p className="mt-1 text-sm text-ink-500">Once you generate a resume, it will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <ResumeListRow key={row._id || row.id || `${pagination.page}-${index}`} row={toRowData(row, pagination.page, index)} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border-soft bg-surface-alt px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-ink-600">
                Page <span className="font-semibold text-ink-900">{pagination.page}</span> of{" "}
                <span className="font-semibold text-ink-900">{pagination.totalPages}</span>
                {pagination.total > 0 && (
                  <span className="ml-2 text-ink-400">
                    ({pagination.total} total)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handlePrev} disabled={pagination.page <= 1 || loading}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={handleNext} disabled={pagination.page >= pagination.totalPages || loading}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundRippleLayout>
  );
}
