"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Briefcase,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  Clock,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  platform: string;
  postedDate: string;
  url: string;
  type: string;
}

const CATEGORIES = [
  { label: "All Roles", value: "all" },
  { label: "Software Engineering", value: "software engineer India" },
  { label: "Frontend", value: "frontend developer India" },
  { label: "Backend", value: "backend developer India" },
  { label: "Data Science", value: "data scientist India" },
  { label: "Product Management", value: "associate product manager" },
  { label: "Project Management", value: "associate project manager" },
  { label: "DevOps", value: "devops engineer India" },
  { label: "Mobile", value: "flutter OR react native OR mobile developer" },
  { label: "Network Support", value: "network support engineer India" },
  { label: "Marketing", value: "digital marketing India" },
  { label: "Sales", value: "sales executive India" },
  { label: "Design", value: "UI UX designer India" },
  { label: "Gulf Jobs", value: "software engineer gulf" },
];

const EXPERIENCE_LEVELS = [
  { label: "All Levels", value: "all" },
  { label: "Fresher / Intern", value: "intern" },
  { label: "Experienced", value: "senior" },
];

const TYPE_BADGE_COLORS: Record<string, string> = {
  "Full-time": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Internship: "bg-violet-50 text-violet-700 border-violet-200",
  Contract: "bg-amber-50 text-amber-700 border-amber-200",
  "Part-time": "bg-sky-50 text-sky-700 border-sky-200",
};

const PLATFORM_DOT_COLORS: Record<string, string> = {
  LinkedIn:           "bg-blue-500",
  RemoteRocketship:   "bg-rose-500",
  Adzuna:             "bg-purple-500",
  RemoteOK:           "bg-orange-500",
  Remotive:           "bg-green-500",
  "Working Nomads":   "bg-cyan-500",
  "We Work Remotely": "bg-indigo-500",
  NoDesk:             "bg-yellow-500",
  "Google Jobs":      "bg-red-500",
  Jobspresso:         "bg-pink-500",
  SimplyHired:        "bg-teal-500",
  Naukri:             "bg-amber-500",
  NaukriGulf:         "bg-orange-600",
  Glassdoor:          "bg-emerald-500",
  Indeed:             "bg-sky-500",
};

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
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${colors[idx]}`}
    >
      {initials || "?"}
    </div>
  );
}

function JobCard({ job, index }: { job: Job; index: number }) {
  const badgeClass =
    TYPE_BADGE_COLORS[job.type] ?? "bg-neutral-100 text-neutral-600 border-neutral-200";
  const dotColor = PLATFORM_DOT_COLORS[job.platform] ?? "bg-neutral-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group bg-white border border-neutral-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-200 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <CompanyInitials name={job.company} />
          <div className="min-w-0">
            <h3 className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors">
              {job.title}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5 truncate">{job.company}</p>
          </div>
        </div>
        <span
          className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${badgeClass}`}
        >
          {job.type}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mb-4">
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
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
          {job.platform}
        </span>
      </div>

      {/* Apply */}
      <div className="mt-auto">
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

const LOCATION_FILTERS = [
  { label: "Worldwide", value: "Worldwide" },
  { label: "Remote", value: "Remote" },
  { label: "India", value: "India" },
  { label: "Gulf", value: "Gulf" },
];

export default function JobBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [experience, setExperience] = useState("all");
  const [locationFilter, setLocationFilter] = useState("Worldwide");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState<number | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch unfiltered grand total once on mount for the hero badge
  useEffect(() => {
    fetch("/api/jobs?query=all&category=All+Roles&page=1&limit=1")
      .then(r => r.json())
      .then(d => setGrandTotal(d.total ?? null))
      .catch(() => {});
  }, []);
  const LIMIT = 9;

  // 300ms debounce on search input
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(val), 300);
  }

  // Category query: always driven by the selected chip + experience level.
  // User's typed searchQuery is sent as a separate AND-filter via searchText param.
  const buildCategoryQuery = useCallback(() => {
    const cat = CATEGORIES.find((c) => c.value === category);
    let q = cat?.value ?? "all";
    if (experience === "intern") q = q === "all" ? "intern India" : `${q} intern`;
    else if (experience === "senior") q = q === "all" ? "senior software engineer India" : `senior ${q}`;
    return q;
  }, [category, experience]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const q = buildCategoryQuery();
      const cat = CATEGORIES.find((c) => c.value === category);
      const catLabel = cat?.label ?? "All Roles";
      const res = await fetch(
        `/api/jobs?query=${encodeURIComponent(q)}&category=${encodeURIComponent(catLabel)}&searchText=${encodeURIComponent(searchQuery)}&locationFilter=${encodeURIComponent(locationFilter)}&page=${page}&limit=${LIMIT}`
      );
      const data = await res.json();
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setTotal(data.total ?? 0);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [buildCategoryQuery, category, searchQuery, locationFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [category, experience, searchQuery, locationFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const totalPages = Math.ceil(total / LIMIT);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(searchInput);
  }

  function clearFilters() {
    setCategory("all");
    setExperience("all");
    setLocationFilter("Worldwide");
    setSearchInput("");
    setSearchQuery("");
    setPage(1);
  }

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div>
          {/* Source badge — live count from aggregator */}
          <span className="inline-block text-xs text-neutral-400 font-medium bg-neutral-100 border border-neutral-200 rounded-full px-3 py-1 mb-3">
            {grandTotal !== null ? `${grandTotal.toLocaleString()} Jobs` : "16+ Sources"} • Updated Live
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-neutral-900">
            Find Jobs Before Everyone Else
          </h1>
          <p className="text-neutral-500 mt-2 max-w-2xl">
            Freshest listings from 16+ job boards — including hidden roles never posted on LinkedIn or Naukri. Updated every few hours.
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

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />
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

      {/* Filters */}
      <div className="space-y-3 mb-8">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                category === cat.value
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Experience + Location toggles */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium mr-1">Experience:</span>
            {EXPERIENCE_LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setExperience(lvl.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
                  experience === lvl.value
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-teal-300"
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 font-medium mr-1">Location:</span>
            {LOCATION_FILTERS.map((loc) => (
              <button
                key={loc.value}
                onClick={() => setLocationFilter(loc.value)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 ${
                  locationFilter === loc.value
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-teal-300"
                }`}
              >
                {loc.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && total > 0 && (
        <p className="text-xs text-neutral-400 mb-4">
          Showing {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} of{" "}
          {total} roles
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
            {Array.from({ length: LIMIT }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : jobs.length > 0 ? (
          <motion.div
            key={`jobs-${page}-${category}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            {jobs.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <p className="text-neutral-400 text-lg mb-2">No roles found.</p>
            <button
              onClick={clearFilters}
              className="text-sm text-teal-600 hover:underline"
            >
              Clear filters
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
          <span className="text-sm text-neutral-500">
            Page {page} of {totalPages}
          </span>
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
