"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ExternalLink, RefreshCw, Search, SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { STAGGER_CONTAINER, STAGGER_ITEM, CARD_HOVER, PRESS } from "@/lib/motion";

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

// Cool-tinted OKLCH palette — keyed by company name's first char code
const LOGO_PALETTE: Array<{ bg: string; fg: string }> = [
  { bg: "oklch(0.94 0.03 278)", fg: "oklch(0.38 0.14 278)" }, // indigo
  { bg: "oklch(0.94 0.03 240)", fg: "oklch(0.38 0.12 240)" }, // blue
  { bg: "oklch(0.94 0.03 200)", fg: "oklch(0.38 0.10 200)" }, // cyan
  { bg: "oklch(0.94 0.03 300)", fg: "oklch(0.38 0.12 300)" }, // violet
  { bg: "oklch(0.94 0.04 148)", fg: "oklch(0.38 0.14 148)" }, // green
  { bg: "oklch(0.94 0.03 180)", fg: "oklch(0.38 0.10 180)" }, // teal
  { bg: "oklch(0.94 0.03 260)", fg: "oklch(0.38 0.08 260)" }, // slate
  { bg: "oklch(0.94 0.03 320)", fg: "oklch(0.38 0.10 320)" }, // plum
];

const LIMIT = 9;

function isNew(postedDate: string): boolean {
  const d = postedDate.toLowerCase();
  return (
    d.includes("hour") ||
    d.includes("minute") ||
    d.includes("just now") ||
    d === "1 day ago" ||
    d === "today"
  );
}

function emptyTitle(searchQuery: string, category: CategoryValue): string {
  if (searchQuery) return `No results for "${searchQuery}"`;
  if (category) return `No ${category} jobs right now`;
  return "No jobs available";
}

function emptyHint(searchQuery: string, category: CategoryValue): string {
  if (searchQuery && category) return "Try a broader search or switch to a different category.";
  if (searchQuery) return "Try different keywords or browse by category.";
  if (category) return "New listings arrive daily — try a broader category or check back soon.";
  return "New listings are added daily. Check back soon.";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function JobCardSkeleton() {
  return (
    <div className="bg-hub-surface border border-hub-border rounded-[10px] px-4 py-[13px] animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[6px] bg-hub-bg-subtle flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-[6px]">
          <div className="h-[13px] bg-hub-bg-subtle rounded w-2/3" />
          <div className="h-[11px] bg-hub-bg-subtle rounded w-1/2" />
        </div>
        <div className="h-[13px] bg-hub-bg-subtle rounded w-16 flex-shrink-0" />
      </div>
    </div>
  );
}

function CompanyLogo({ name }: { name: string }) {
  const { bg, fg } = LOGO_PALETTE[name.charCodeAt(0) % LOGO_PALETTE.length];
  const initials =
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?";
  return (
    <div
      className="w-9 h-9 rounded-[6px] border border-hub-border flex items-center justify-center text-[11px] font-bold flex-shrink-0"
      style={{ backgroundColor: bg, color: fg }}
    >
      {initials}
    </div>
  );
}

function JobCard({ job, reduced, canHoverRef }: { job: Job; reduced: boolean; canHoverRef: { current: boolean } }) {
  return (
    <motion.a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      variants={reduced ? undefined : STAGGER_ITEM}
      initial={reduced ? { opacity: 0 } : undefined}
      animate={reduced ? { opacity: 1 } : undefined}
      whileHover={reduced ? undefined : CARD_HOVER}
      whileTap={reduced ? undefined : { scale: 0.995, transition: { duration: 0.1 } }}
      className="group block bg-hub-surface border border-hub-border rounded-[10px] px-4 py-[13px]
                 outline-none focus-visible:ring-2 focus-visible:ring-hub-accent/30 focus-visible:rounded-[10px]"
      style={{ transition: "border-color 150ms, box-shadow 180ms" }}
      onMouseEnter={(e) => {
        if (!canHoverRef.current) return;
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = "var(--color-hub-border-strong)";
        el.style.boxShadow = "var(--shadow-hub)";
      }}
      onMouseLeave={(e) => {
        if (!canHoverRef.current) return;
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.borderColor = "";
        el.style.boxShadow = "";
      }}
    >
      <div className="flex items-start gap-3">
        <CompanyLogo name={job.company} />

        <div className="flex-1 min-w-0">
          {/* Title + salary */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-[14px] font-semibold text-hub-text-1 leading-snug tracking-[-0.01em] truncate">
                {job.title}
              </h3>
              {isNew(job.postedDate) && (
                <span className="flex-shrink-0 bg-hub-accent-soft text-hub-accent-fg border border-hub-accent/20 text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none">
                  New
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 pt-px">
              {job.salary && (
                <span className="text-[13px] font-semibold text-hub-salary">{job.salary}</span>
              )}
              <ExternalLink
                size={12}
                className="text-hub-text-3 opacity-0 group-hover:opacity-100"
                style={{ transition: "opacity 150ms" }}
              />
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center flex-wrap mt-[3px]" style={{ gap: "0 8px" }}>
            <span className="text-[12.5px] text-hub-text-2">{job.company}</span>
            {job.location && (
              <>
                <span className="text-hub-border text-[10px] leading-none select-none">·</span>
                <span className="text-[12.5px] text-hub-text-3">{job.location}</span>
              </>
            )}
            {job.type && (
              <>
                <span className="text-hub-border text-[10px] leading-none select-none">·</span>
                <span className="text-[11.5px] text-hub-text-3">{job.type}</span>
              </>
            )}
            <span className="text-hub-border text-[10px] leading-none select-none">·</span>
            <span className="text-[11.5px] text-hub-text-3">{job.postedDate}</span>
          </div>

          {/* Skill tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-[7px]">
              {job.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="text-[11.5px] font-medium text-hub-text-3 bg-hub-bg-subtle border border-hub-border rounded-[4px] px-1.5 py-px leading-none"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function JobBoard() {
  const [jobs, setJobs]               = useState<Job[]>([]);
  const [loading, setLoading]         = useState(true);
  const [disabled, setDisabled]       = useState(false);
  const [category, setCategory]       = useState<CategoryValue>("");
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const reduced                       = useReducedMotion() ?? false;

  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef     = useRef<AbortController | null>(null);
  const canHover     = useRef(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    canHover.current = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }, []);
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
  }, []);

  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(val);
      setPage(1);
    }, 300);
  }

  const fetchJobs = useCallback(async () => {
    if (disabled) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        source:     "india",
        searchText: searchQuery,
        page:       String(page),
        limit:      String(LIMIT),
      });
      if (category) params.set("category", category);
      const res = await fetch(`/api/jobs?${params}`, { signal: controller.signal });
      if (!res.ok) {
        setJobs([]);
        return;
      }
      const data = await res.json();
      if (data.disabled) { setDisabled(true); setJobs([]); return; }
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setTotal(data.total ?? 0);
    } catch (err) {
      if (controller.signal.aborted) return;
      setJobs([]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [category, searchQuery, page, disabled]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const totalPages = Math.ceil(total / LIMIT);
  const filterLabel = category === "" ? "fresh" : category;

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

  if (disabled) {
    return (
      <div className="py-16 text-center" style={{ fontFamily: "var(--font-hub)" }}>
        <p className="text-[14px] font-semibold text-hub-text-1 mb-1">
          Job discovery temporarily paused
        </p>
        <p className="text-[13px] text-hub-text-3 max-w-sm mx-auto">
          We're rebuilding this feature. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ fontFamily: "var(--font-hub)" }}>
      {/* Toolbar: search + refresh */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-[14px]">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-[10px] top-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              color: searchFocused ? "var(--color-hub-accent-fg)" : "var(--color-hub-text-3)",
              transition: "color 150ms",
            }}
          />
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchInput}
            placeholder="Search jobs, companies…"
            className="w-full h-[35px] pl-[30px] pr-3 rounded-[10px] border border-hub-border-strong bg-hub-surface
                       text-[13px] text-hub-text-1 placeholder:text-hub-text-3 outline-none"
            style={{ transition: "border-color 150ms, box-shadow 150ms" }}
            onFocus={(e) => {
              setSearchFocused(true);
              e.currentTarget.style.borderColor = "var(--color-hub-accent)";
              e.currentTarget.style.boxShadow = "0 0 0 3px oklch(0.52 0.22 278 / 0.12)";
            }}
            onBlur={(e) => {
              setSearchFocused(false);
              e.currentTarget.style.borderColor = "";
              e.currentTarget.style.boxShadow = "";
            }}
          />
        </div>
        <motion.button
          type="button"
          onClick={fetchJobs}
          disabled={loading}
          aria-label="Refresh jobs"
          whileTap={reduced ? undefined : { scale: 0.93, transition: { duration: 0.08 } }}
          className="h-[35px] w-[35px] flex items-center justify-center rounded-[10px] border border-hub-border
                     bg-hub-surface text-hub-text-3 disabled:opacity-40 flex-shrink-0"
          style={{ transition: "border-color 150ms, color 150ms" }}
          onMouseEnter={(e) => {
            if (!canHover.current) return;
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = "var(--color-hub-border-strong)";
            el.style.color = "var(--color-hub-text-2)";
          }}
          onMouseLeave={(e) => {
            if (!canHover.current) return;
            const el = e.currentTarget as HTMLButtonElement;
            el.style.borderColor = "";
            el.style.color = "";
          }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </motion.button>
      </form>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5 mb-[18px]">
        {TALENTD_CATEGORIES.map((c) => {
          const isActive = category === c.value;
          return (
            <motion.button
              key={c.value === "" ? "__all__" : c.value}
              type="button"
              onClick={(e) => {
                setCategory(c.value);
                setPage(1);
                const el = e.currentTarget as HTMLButtonElement;
                el.style.backgroundColor = "";
                el.style.borderColor = "";
                el.style.color = "";
              }}
              whileTap={reduced ? undefined : { scale: 0.96, transition: { duration: 0.08 } }}
              className={[
                "px-[11px] py-1 rounded-full text-[12px] font-medium border",
                isActive
                  ? "bg-hub-accent border-hub-accent text-white"
                  : "bg-transparent border-transparent text-hub-text-3",
              ].join(" ")}
              style={{
                transition: "border-color 130ms, background-color 130ms, color 130ms, box-shadow 130ms",
                boxShadow: isActive ? "0 1px 4px oklch(0.52 0.22 278 / 0.3)" : undefined,
              }}
              onMouseEnter={(e) => {
                if (isActive || !canHover.current) return;
                const el = e.currentTarget as HTMLButtonElement;
                el.style.backgroundColor = "var(--color-hub-accent-soft)";
                el.style.borderColor = "oklch(0.52 0.22 278 / 0.4)";
                el.style.color = "var(--color-hub-accent-fg)";
              }}
              onMouseLeave={(e) => {
                if (!canHover.current) return;
                const el = e.currentTarget as HTMLButtonElement;
                el.style.backgroundColor = "";
                el.style.borderColor = "";
                el.style.color = "";
              }}
            >
              {c.label}
            </motion.button>
          );
        })}
      </div>

      {/* Results count */}
      {!loading && total > 0 && (
        <p className="text-[11.5px] text-hub-text-3 mb-4">
          <span className="font-medium text-hub-text-2">{total.toLocaleString()}</span>{" "}
          {filterLabel} jobs
        </p>
      )}

      {/* Job list */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="flex flex-col gap-[3px]"
          >
            {Array.from({ length: LIMIT }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : jobs.length > 0 ? (
          <motion.div
            key={`jobs-${page}-${category}-${searchQuery}`}
            variants={reduced ? undefined : STAGGER_CONTAINER}
            initial={reduced ? { opacity: 0 } : "hidden"}
            animate={reduced ? { opacity: 1 } : "show"}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="flex flex-col gap-[3px]"
          >
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} reduced={reduced} canHoverRef={canHover} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="py-14 text-center border border-dashed border-hub-border rounded-[10px]"
          >
            <SearchX size={26} strokeWidth={1.5} className="mx-auto mb-4 text-hub-text-3" />
            <p className="text-[14px] font-semibold text-hub-text-1 mb-1.5">
              {emptyTitle(searchQuery, category)}
            </p>
            <p className="text-[12.5px] text-hub-text-3 max-w-[270px] mx-auto mb-5 leading-relaxed">
              {emptyHint(searchQuery, category)}
            </p>
            <motion.button
              onClick={clearFilters}
              whileTap={reduced ? undefined : { scale: 0.96, transition: { duration: 0.08 } }}
              className="text-[12px] font-medium text-hub-accent-fg bg-hub-accent-soft border border-hub-accent/20
                         px-4 py-1.5 rounded-full"
              style={{ transition: "background-color 130ms, border-color 130ms" }}
              onMouseEnter={(e) => {
                if (!canHover.current) return;
                const el = e.currentTarget as HTMLButtonElement;
                el.style.backgroundColor = "oklch(0.95 0.04 278)";
                el.style.borderColor = "oklch(0.52 0.22 278 / 0.3)";
              }}
              onMouseLeave={(e) => {
                if (!canHover.current) return;
                const el = e.currentTarget as HTMLButtonElement;
                el.style.backgroundColor = "";
                el.style.borderColor = "";
              }}
            >
              Clear filters
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-hub-border">
          <motion.button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            whileTap={reduced ? undefined : PRESS}
            className="flex items-center gap-1.5 h-[32px] px-3 rounded-[8px] border border-hub-border
                       bg-hub-surface text-[12px] font-medium text-hub-text-2
                       disabled:opacity-30"
            style={{ transition: "border-color 150ms, color 150ms" }}
            onMouseEnter={(e) => {
              if (!canHover.current) return;
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "var(--color-hub-border-strong)";
              el.style.color = "var(--color-hub-text-1)";
            }}
            onMouseLeave={(e) => {
              if (!canHover.current) return;
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "";
              el.style.color = "";
            }}
          >
            <ChevronLeft size={13} />
            Prev
          </motion.button>
          <span className="text-[12px] text-hub-text-3">
            Page {page} of {totalPages}
          </span>
          <motion.button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            whileTap={reduced ? undefined : PRESS}
            className="flex items-center gap-1.5 h-[32px] px-3 rounded-[8px] border border-hub-border
                       bg-hub-surface text-[12px] font-medium text-hub-text-2
                       disabled:opacity-30"
            style={{ transition: "border-color 150ms, color 150ms" }}
            onMouseEnter={(e) => {
              if (!canHover.current) return;
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "var(--color-hub-border-strong)";
              el.style.color = "var(--color-hub-text-1)";
            }}
            onMouseLeave={(e) => {
              if (!canHover.current) return;
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "";
              el.style.color = "";
            }}
          >
            Next
            <ChevronRight size={13} />
          </motion.button>
        </div>
      )}
    </div>
  );
}
