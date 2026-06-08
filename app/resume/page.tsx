"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText, RefreshCw } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";

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

function StatusBadge({ status }: { status?: string }) {
  const { label, className } = getStatusStyle(status);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}>
      {label}
    </span>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <tr key={index} className="border-b border-neutral-100 animate-pulse">
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="h-4 w-full max-w-[180px] rounded bg-neutral-100" />
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
    <BackgroundRippleLayout tone="light" className="bg-white" contentClassName="resume-list pt-16">
      <Navbar tone="light" />
      <div className="px-4 pb-20 pt-24">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                <FileText className="h-3.5 w-3.5" />
                Resume library
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900">Generated resumes</h1>
                <p className="mt-1 max-w-2xl text-sm text-neutral-600">
                  Track every resume you&apos;ve generated, review its status, and open the full optimized view when you need to make changes.
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchResumes(pagination.page)}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-neutral-50">
                  <tr className="border-b border-neutral-200">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Filename</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Job description</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Created</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Updated</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {loading ? (
                    <TableSkeleton />
                  ) : errorMsg ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <p className="text-sm font-medium text-neutral-900">We couldn&apos;t load your resumes.</p>
                        <p className="mt-1 text-sm text-neutral-500">{errorMsg}</p>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <p className="text-sm font-medium text-neutral-900">No resumes yet</p>
                        <p className="mt-1 text-sm text-neutral-500">Once you generate a resume, it will appear here.</p>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => {
                      const id = row._id || row.id || `${pagination.page}-${index}`;
                      const jobDescription = row.jobDescription || "—";

                      return (
                        <tr key={id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="px-4 py-4 min-w-[220px]">
                            <span className="block text-sm font-medium text-neutral-900">{row.filename || "Untitled resume"}</span>
                          </td>
                          <td className="px-4 py-4 min-w-[320px] max-w-[520px]">
                            <span className="block max-w-[520px] truncate text-sm text-neutral-600" title={row.jobDescription || "not set"}>
                              {jobDescription}
                            </span>
                          </td>
                          <td className="px-4 py-4 min-w-[120px]">
                            <StatusBadge status={row.status} />
                          </td>
                          <td className="px-4 py-4 min-w-[180px] text-sm text-neutral-600">
                            {formatDateTime(row.createdAt)}
                          </td>
                          <td className="px-4 py-4 min-w-[180px] text-sm text-neutral-600">
                            {formatDateTime(row.updatedAt)}
                          </td>
                          <td className="px-4 py-4 min-w-[110px]">
                            {(row._id || row.id) ? (
                              <Link
                                href={`/resume/${row._id || row.id}`}
                                className="inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                              >
                                Open
                              </Link>
                            ) : (
                              <span className="text-sm text-neutral-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-neutral-200 bg-neutral-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-neutral-600">
                Page <span className="font-semibold text-neutral-900">{pagination.page}</span> of{" "}
                <span className="font-semibold text-neutral-900">{pagination.totalPages}</span>
                {pagination.total > 0 && (
                  <span className="ml-2 text-neutral-400">
                    ({pagination.total} total)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={pagination.page <= 1 || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundRippleLayout>
  );
}
