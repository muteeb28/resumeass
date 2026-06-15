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
  Sparkles,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

function StatusBadge({ value } : {value: string}) {
  const key = (value || "pending").toLowerCase();
  const className =
    key === "approved" || key === "completed"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : key === "rejected" || key === "failed"
      ? "bg-rose-100 text-rose-700 border-rose-200"
      : "bg-amber-100 text-amber-700 border-amber-200";

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
    <BackgroundRippleLayout tone="light" contentClassName="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]">
      <Navbar tone="light" />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Link href="/referrals" className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">
                <ArrowLeft className="h-4 w-4" />
                Back to referrals hub
              </Link>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                <Sparkles className="h-3.5 w-3.5" />
                Referral records
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">Referrals board</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">
                  Search referral requests, scan the key details, and move through the pages with pagination.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[280px] flex-1 lg:flex-none lg:min-w-[340px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, job, or experience"
                  className="h-12 rounded-xl border-neutral-200 bg-white pl-10 focus-visible:ring-blue-500"
                />
              </div>
              <Button
                onClick={() => {
                  setSearch("");
                  setQuery({ search: "", page: 1 });
                }}
                variant="outline"
                className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-neutral-700 hover:bg-neutral-50"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Reset
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-neutral-50">
                <tr className="border-b border-neutral-200">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Email</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Phone</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Desired job</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Experience</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  <TableSkeleton />
                ) : errorMsg ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <p className="text-sm font-medium text-neutral-900">We couldn&apos;t load the referrals.</p>
                      <p className="mt-1 text-sm text-neutral-500">{errorMsg}</p>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <p className="text-sm font-medium text-neutral-900">No referrals found</p>
                      <p className="mt-1 text-sm text-neutral-500">Try a different search or submit a new referral request.</p>
                    </td>
                  </tr>
                ) : (
                  rows.map((row: any, index) => (
                    <tr key={row._id || `${query.page}-${index}`} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-4 py-4 min-w-[180px]">
                        <div className="text-sm font-medium text-neutral-900">{row.fullName || "—"}</div>
                        <div className="mt-1 text-xs text-neutral-500">{truncate(row.description, 70)}</div>
                      </td>
                      <td className="px-4 py-4 min-w-[220px] text-sm text-neutral-600">{row.email || "—"}</td>
                      <td className="px-4 py-4 min-w-[140px] text-sm text-neutral-600">{row.phoneNumber || "—"}</td>
                      <td className="px-4 py-4 min-w-[180px] text-sm text-neutral-600">{row.desiredJob || "—"}</td>
                      <td className="px-4 py-4 min-w-[220px] text-sm text-neutral-600">{row.experience || "—"}</td>
                      <td className="px-4 py-4 min-w-[110px]">
                        <StatusBadge value={row.status} />
                      </td>
                      <td className="px-4 py-4 min-w-[170px] text-sm text-neutral-600">
                        {formatDateTime(row.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-neutral-200 bg-neutral-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-neutral-600">
              Page <span className="font-semibold text-neutral-900">{query.page}</span> of{" "}
              <span className="font-semibold text-neutral-900">{pagination.totalPages}</span>
              {pagination.total > 0 ? (
                <span className="ml-2 text-neutral-400">({pagination.total} total)</span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuery((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
                disabled={query.page <= 1 || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => setQuery((current) => ({ ...current, page: Math.min(pagination.totalPages, current.page + 1) }))}
                disabled={query.page >= pagination.totalPages || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
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
