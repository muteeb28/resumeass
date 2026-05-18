"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  platform: string;
  postedDate: string;
  url: string;
  type: string;
  salary?: string;
  tags?: string[];
  category?: string;
}

// "" = "All" (no category filter sent to API)
type CategoryValue =
  | ""
  | "Fresher"
  | "Internship"
  | "Remote"
  | "IT/Software"
  | "Core Engineering"
  | "Batch 2026"
  | "Batch 2025"
  | "Full Time"
  | "Design"
  | "Sales & Marketing"
  | "DevOps"
  | "APM"
  | "PM";

// ─── Constants ────────────────────────────────────────────────────────────────
const TALENTD_CATEGORIES: { label: string; value: CategoryValue }[] = [
  { label: "All",               value: "" },
  { label: "Fresher",           value: "Fresher" },
  { label: "Internship",        value: "Internship" },
  { label: "Remote",            value: "Remote" },
  { label: "IT / Software",     value: "IT/Software" },
  { label: "Core Engineering",  value: "Core Engineering" },
  { label: "DevOps",            value: "DevOps" },
  { label: "PM",                value: "PM" },
  { label: "APM",               value: "APM" },
  { label: "Batch 2026",        value: "Batch 2026" },
  { label: "Batch 2025",        value: "Batch 2025" },
  { label: "Full Time",         value: "Full Time" },
  { label: "Design",            value: "Design" },
  { label: "Sales & Marketing", value: "Sales & Marketing" },
];

const TYPE_BADGE_COLORS: Record<string, string> = {
  "Full-time": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Internship:  "bg-violet-50 text-violet-700 border-violet-200",
  Contract:    "bg-amber-50 text-amber-700 border-amber-200",
  "Part-time": "bg-sky-50 text-sky-700 border-sky-200",
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function JobCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-neutral-100" />
          <div className="space-y-2">
            <div className="h-4 w-36 bg-neutral-100 rounded" />
            <div className="h-3 w-24 bg-neutral-100 rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-neutral-100 rounded-full" />
      </div>
      <div className="flex gap-3 mb-4">
        <div className="h-3 w-28 bg-neutral-100 rounded" />
        <div className="h-3 w-20 bg-neutral-100 rounded" />
      </div>
      <div className="h-9 w-full bg-neutral-100 rounded-xl" />
    </div>
  );
}

function CompanyInitials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const colors = [
    "bg-teal-100 text-teal-700",
    "bg-indigo-100 text-indigo-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-orange-100 text-orange-700",
  ];
  const idx = name.charCodeAt(0) % colors.length;

  return (
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${colors[idx]}`}>
      {initials || "?"}
    </div>
  );
}

function JobCard({ job, index }: { job: Job; index: number }) {
  const badgeClass = TYPE_BADGE_COLORS[job.type] ?? "bg-neutral-100 text-neutral-600 border-neutral-200";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-white border border-neutral-200 rounded-2xl p-5 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-200 flex flex-col gap-3"
    >
      {/* Header: logo + title + type badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <CompanyInitials name={job.company} />
          <div className="min-w-0">
            <h3 className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors">
              {job.title}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 truncate">{job.company}</p>
          </div>
        </div>
        <span className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${badgeClass}`}>
          {job.type}
        </span>
      </div>

      {/* CTC / Salary */}
      {job.salary && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-emerald-600">{job.salary}</span>
          <span className="text-xs text-neutral-400">per annum</span>
        </div>
      )}

      {/* Meta: location and time only */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin size={11} />
            {job.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock size={11} />
          {job.postedDate}
        </span>
      </div>

      {/* Skill tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Apply button */}
      <div className="mt-auto pt-1">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-neutral-900 text-white hover:bg-teal-600 transition-colors duration-200"
        >
          Apply Now
          <ExternalLink size={13} />
        </a>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const LIMIT = 9;

export default function JobBoard() {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [disabled, setDisabled] = useState(false);
  // "" = All (no category filter). Default is All so users see every fresh job.
  const [category, setCategory] = useState<CategoryValue>("");
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [searchInput, setSearchInput]   = useState("");
  const [searchQuery, setSearchQuery]   = useState("");

  // Debounce search input 300 ms
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val), 300);
  }

  const fetchJobs = useCallback(async () => {
    if (disabled) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        source:     "india",
        searchText: searchQuery,
        page:       String(page),
        limit:      String(LIMIT),
      });
      // Omit category entirely when All is selected so the API applies no category filter.
      if (category) params.set("category", category);

      const res  = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      if (data.disabled) { setDisabled(true); setJobs([]); return; }
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setTotal(data.total ?? 0);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, page, disabled]);

  // Reset to page 1 whenever category or search changes
  useEffect(() => { setPage(1); }, [category, searchQuery]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const totalPages = Math.ceil(total / LIMIT);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(searchInput);
  }

  function clearFilters() {
    setCategory("");
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  }

  // Human-readable label for the current filter
  const filterLabel = category === "" ? "fresh" : category;

  if (disabled) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-32 text-center gap-4">
        <div className="text-4xl">🔧</div>
        <h2 className="text-xl font-semibold text-neutral-800">Job Discovery Temporarily Disabled</h2>
        <p className="text-neutral-500 max-w-md">
          Job discovery is temporarily disabled while we rebuild this feature. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          <span className="inline-block text-xs text-neutral-400 font-medium bg-neutral-100 border border-neutral-200 rounded-full px-3 py-1 mb-3">
            {!loading && total > 0
              ? `${total.toLocaleString()} ${filterLabel} jobs`
              : "Jobs in India"} • Updated regularly
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-neutral-900">
            Fresh Jobs in India
          </h1>
          <p className="text-neutral-500 mt-2 max-w-2xl">
            Latest listings updated regularly — freshers, interns, and full-time roles.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-200 bg-white text-sm font-medium text-neutral-600 hover:border-teal-400 hover:text-teal-600 transition disabled:opacity-40 self-start lg:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchInput}
          onChange={handleSearchInput}
          placeholder="Search jobs, companies…"
          className="w-full pl-11 pr-28 py-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-neutral-900 text-white text-sm font-semibold hover:bg-teal-600 transition"
        >
          Search
        </button>
      </form>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TALENTD_CATEGORIES.map((c) => (
          <button
            key={c.value === "" ? "__all__" : c.value}
            onClick={() => setCategory(c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150 ${
              category === c.value
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-teal-300 hover:text-teal-600"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!loading && total > 0 && (
        <p className="text-xs text-neutral-400 mb-4">
          {total} {filterLabel} jobs
        </p>
      )}

      {/* Job grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {Array.from({ length: LIMIT }).map((_, i) => <JobCardSkeleton key={i} />)}
          </motion.div>
        ) : jobs.length > 0 ? (
          <motion.div
            key={`jobs-${page}-${category}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {jobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <p className="text-neutral-400 text-lg mb-2">
              No {filterLabel} jobs in the database yet. Try refreshing or check back after the next ingestion run.
            </p>
            <button onClick={clearFilters} className="text-sm text-teal-600 hover:underline">
              Reset filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-full border border-neutral-200 bg-white text-neutral-500 hover:border-teal-400 hover:text-teal-600 disabled:opacity-30 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-full border border-neutral-200 bg-white text-neutral-500 hover:border-teal-400 hover:text-teal-600 disabled:opacity-30 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
