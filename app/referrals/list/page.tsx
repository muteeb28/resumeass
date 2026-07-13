"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListRow } from "@/components/ui/list-row";
import { PageStatHeader } from "@/components/shared/PageStatHeader";

const PAGE_SIZE = 10;

function formatDateTime(value: any) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function truncate(value: string, max = 90) {
  if (!value) return "—";
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
}

/**
 * Local, deliberately distinct from `ui/status-badge.tsx`: that component's
 * DONE/PROCESSING/PENDING/FAILED word-list doesn't recognize "approved"
 * (a status this endpoint actually returns) as success, which would
 * silently reclassify approved records as neutral. Category logic is kept
 * exactly as before; only the raw emerald/rose/amber colors are migrated
 * to the JobFlix Design System's semantic success/error/warning tokens.
 */
function StatusBadge({ value } : {value: string}) {
  const key = (value || "pending").toLowerCase();
  const className =
    key === "approved" || key === "completed"
      ? "bg-success/10 text-success border-success/20"
      : key === "rejected" || key === "failed"
      ? "bg-error/10 text-error border-error/20"
      : "bg-warning/10 text-warning border-warning/20";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}>
      {value || "pending"}
    </span>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <tr key={index} className="border-b border-border-soft animate-pulse">
          {Array.from({ length: 6 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-4">
              <div className="h-4 w-full max-w-[180px] rounded bg-surface-alt" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ReferralListPage() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: PAGE_SIZE,
  });
  const [query, setQuery] = useState({
    search: "",
    page: 1,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = search.trim();
      setQuery((current) => {
        if (current.search === trimmed && current.page === 1) {
          return current;
        }

        return {
          search: trimmed,
          page: 1,
        };
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReferrals() {
      setLoading(true);
      setErrorMsg("");

      try {
        const response = await axiosInstance.get("/referrals", {
          params: {
            page: query.page,
            limit: PAGE_SIZE,
            search: query.search,
          },
          signal: controller.signal,
        });

        const referrals = response.data?.data?.referrals || [];
        const pageInfo = response.data?.data?.pagination || {};

        setRows(referrals);
        setPagination((current) => ({
          ...current,
          page: Number(pageInfo.page || current.page) || 1,
          totalPages: Number(pageInfo.totalPages || Math.max(1, Math.ceil((pageInfo.total || referrals.length) / PAGE_SIZE))) || 1,
          total: Number(pageInfo.total || referrals.length) || 0,
          limit: Number(pageInfo.limit || PAGE_SIZE) || PAGE_SIZE,
        }));
      } catch (error: any) {
        if (error.name === "CanceledError" || error.name === "AbortError") return;
        setRows([]);
        setErrorMsg(error?.response?.data?.message || error?.message || "Failed to load referrals.");
      } finally {
        setLoading(false);
      }
    }

    fetchReferrals();

    return () => controller.abort();
  }, [query.page, query.search]);

  return (
    <BackgroundRippleLayout tone="light" showRipple={false}>
      <Navbar tone="light" />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-(--jf-radius-panel) border border-border-soft bg-page p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Link href="/referrals" className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900">
                <ArrowLeft className="h-4 w-4" />
                Back to referrals hub
              </Link>
              <PageStatHeader
                eyebrow="Referral records"
                heading="Referrals board"
                intro="Search referral requests, scan the key details, and move through the pages with pagination."
                statValue={pagination.total > 0 ? pagination.total.toLocaleString() : undefined}
                statLabel="total requests"
                introClassName="max-w-2xl text-sm leading-6 text-ink-600"
                className="items-start"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[280px] flex-1 lg:flex-none lg:min-w-[340px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, job, or experience"
                  className="h-12 rounded-(--jf-radius-frame) border-border-soft bg-page pl-10 focus-visible:ring-sapphire-bright"
                />
              </div>
              <Button
                onClick={() => {
                  setSearch("");
                  setQuery({ search: "", page: 1 });
                }}
                variant="outline"
                className="h-12 rounded-(--jf-radius-pill) border-border-soft bg-page px-4 text-ink-700 hover:bg-surface-alt"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Reset
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 overflow-hidden rounded-(--jf-radius-panel) border border-border-soft bg-page shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-surface-alt">
                <tr className="border-b border-border-soft">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Phone</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Desired job</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Experience</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {loading ? (
                  <TableSkeleton />
                ) : errorMsg ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <p className="text-sm font-medium text-ink-900">We couldn&apos;t load the referrals.</p>
                      <p className="mt-1 text-sm text-ink-500">{errorMsg}</p>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <p className="text-sm font-medium text-ink-900">No referrals found</p>
                      <p className="mt-1 text-sm text-ink-500">Try a different search or submit a new referral request.</p>
                    </td>
                  </tr>
                ) : (
                  rows.map((row: any, index) => (
                    <ListRow
                      key={row._id || `${query.page}-${index}`}
                      cells={[
                        {
                          className: "min-w-[180px]",
                          content: (
                            <>
                              <div className="text-sm font-medium text-ink-900">{row.fullName || "—"}</div>
                              <div className="mt-1 text-xs text-ink-500">{truncate(row.description, 70)}</div>
                            </>
                          ),
                        },
                        { className: "min-w-[220px] text-sm text-ink-600", content: row.email || "—" },
                        { className: "min-w-[140px] text-sm text-ink-600", content: row.phoneNumber || "—" },
                        { className: "min-w-[180px] text-sm text-ink-600", content: row.desiredJob || "—" },
                        { className: "min-w-[220px] text-sm text-ink-600", content: row.experience || "—" },
                        { className: "min-w-[110px]", content: <StatusBadge value={row.status} /> },
                        { className: "min-w-[170px] text-sm text-ink-600", content: formatDateTime(row.createdAt) },
                      ]}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-border-soft bg-surface-alt/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-ink-600">
              Page <span className="font-semibold text-ink-900">{query.page}</span> of{" "}
              <span className="font-semibold text-ink-900">{pagination.totalPages}</span>
              {pagination.total > 0 ? (
                <span className="ml-2 text-ink-400">({pagination.total} total)</span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuery((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
                disabled={query.page <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-(--jf-radius-pill) border border-border-soft bg-page px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => setQuery((current) => ({ ...current, page: Math.min(pagination.totalPages, current.page + 1) }))}
                disabled={query.page >= pagination.totalPages || loading}
                className="inline-flex items-center gap-1 rounded-(--jf-radius-pill) border border-border-soft bg-page px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </BackgroundRippleLayout>
  );
}
