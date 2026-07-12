"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowRight, ExternalLink, Lock, RefreshCw, Search, SearchX, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { STAGGER_CONTAINER, STAGGER_ITEM } from "../lib/motion";
import axiosInstance from "@/lib/axios";
import { useUserStore } from "@/stores/useUserStore";
import { JobRow } from "./jobs-hub/JobRow";
import { Stat } from "./marketing/primitives";
import { Button } from "./ui/button";

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

interface JobBoardAccess {
  locked: boolean;
  canReadFullBoard: boolean;
  isLoggedIn: boolean;
  requiresLogin: boolean;
  requiresMembership: boolean;
  cta: "login" | "membership";
}

interface JobBoardResponse {
  success?: boolean;
  jobs: Job[];
  total: number;
  visibleCount?: number;
  lockedCount?: number;
  access?: JobBoardAccess;
  disabled?: boolean;
  message?: string;
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

const LIMIT = 30;

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
    <div className="bg-page border border-border-soft rounded-(--jf-radius-row) px-4 py-[13px] animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-(--jf-radius-mini) bg-surface-alt flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-[6px]">
          <div className="h-[13px] bg-surface-alt rounded w-2/3" />
          <div className="h-[11px] bg-surface-alt rounded w-1/2" />
        </div>
        <div className="h-[13px] bg-surface-alt rounded w-16 flex-shrink-0" />
      </div>
    </div>
  );
}

/**
 * Renders JobRow (RowChip-derived, src/components/jobs-hub/JobRow.tsx) inside
 * the same motion.div stagger-entrance + tap-scale wrapper the previous
 * hand-rolled JobCard used. JobRow owns the visual treatment (including
 * hover shadow) via CSS/token classes now, replacing the old raw-JS
 * onMouseEnter/onMouseLeave oklch() color assignments.
 *
 * Known visual change: JobRow's avatar is RowChip's flat sapphire letter
 * chip, not the previous per-company OKLCH-hashed color palette — that
 * palette was a hardcoded-value pattern the token migration is removing,
 * not something RowChip's API currently supports reproducing.
 */
function JobCard({ job, reduced }: { job: Job; reduced: boolean }) {
  return (
    <motion.div
      variants={reduced ? undefined : STAGGER_ITEM}
      initial={reduced ? { opacity: 0 } : undefined}
      animate={reduced ? { opacity: 1 } : undefined}
    >
      <JobRow
        job={{
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          postedDate: job.postedDate,
          url: job.url,
          type: job.type,
          salary: job.salary,
          tags: job.tags,
          isNew: isNew(job.postedDate),
        }}
      />
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function JobBoard() {
  const [jobs, setJobs]               = useState<Job[]>([]);
  const [loading, setLoading]         = useState(true);
  const [disabled, setDisabled]       = useState(false);
  const [access, setAccess]           = useState<JobBoardAccess | null>(null);
  const [category, setCategory]       = useState<CategoryValue>("");
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const reduced                       = useReducedMotion() ?? false;
  const { user, membership } = useUserStore();

  const isActiveMember = Boolean(
    membership &&
      membership.status === "active" &&
      ["premium", "ultra"].includes(membership.tier?.toLowerCase() ?? "")
  );
  const hasPremiumMembership = isActiveMember && membership?.tier === "premium";
  const hasUltraMembership = isActiveMember && membership?.tier === "ultra";
  const canSearch = hasUltraMembership;
  const canFilter = true;
  const isPreviewLocked = access?.locked ?? !isActiveMember;
  const isGuest = !user;
  const jobflixViewBase = process.env.NEXT_PUBLIC_JOBFLIX_VIEW || "";
  const loginHref =
    typeof window !== "undefined"
      ? `${jobflixViewBase}/login?next=${encodeURIComponent(window.location.href)}`
      : `${jobflixViewBase}/login`;
  const membershipHref = '/pricing';

  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef     = useRef<AbortController | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
  }, []);

  function handleSearchInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (!canSearch) return;
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
      const res = await axiosInstance(`/jobs?${params}`, { signal: controller.signal });
      const data: JobBoardResponse = await res.data;
      if (data.disabled) {
        setDisabled(true);
        setJobs([]);
        setAccess(null);
        return;
      }
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      setTotal(data.total ?? 0);
      setAccess(data.access ?? null);
    } catch (err) {
      if (controller.signal.aborted) return;
      setJobs([]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [category, searchQuery, page, disabled]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const totalPages = isPreviewLocked ? 1 : Math.ceil(total / LIMIT);
  const filterLabel = category === "" ? "fresh" : category;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!canSearch) return;
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
      <div className="py-16 text-center">
        <p className="text-[14px] font-semibold text-ink-900 mb-1">
          Job discovery temporarily paused
        </p>
        <p className="text-[13px] text-ink-500 max-w-sm mx-auto">
          We're rebuilding this feature. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isPreviewLocked && (
        <div className="rounded-(--jf-radius-frame) border border-border-soft bg-page p-4 md:p-5 mb-5 text-left shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-ink-400">
                <Lock className="h-3.5 w-3.5 text-ink-400" />
                Locked Preview
              </div>
              <p className="mt-2 text-[13px] font-semibold text-ink-900">
                {isGuest ? "Login to unlock the full job board." : "Purchase membership to unlock the full job board."}
              </p>
              <p className="mt-1 text-[12.5px] text-ink-600 leading-relaxed">
                You can browse the first 5 jobs. The rest stay blurred until you sign in or upgrade your membership.
              </p>
            </div>
            <Button asChild variant="primary" size="sm">
              <a href={access?.cta === "membership" ? membershipHref : loginHref}>
                {access?.cta === "membership" ? "Buy Membership" : "Login"}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      )}

      {hasPremiumMembership && !hasUltraMembership && (
        <div className="rounded-(--jf-radius-frame) border border-sapphire-bright/20 bg-sapphire-50 p-4 mb-5 text-left">
          <p className="text-[13px] font-semibold text-sapphire-brand mb-1">Premium access</p>
          <p className="text-[12.5px] text-sapphire-brand/90 leading-relaxed">
            Premium members can browse job listings, but search is reserved for Ultra membership.
          </p>
        </div>
      )}

      {/* Toolbar: search + refresh */}
      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-[14px]">
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-[10px] top-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              color: searchFocused ? "var(--color-sapphire-brand)" : "var(--color-ink-500)",
              transition: "color 150ms",
            }}
          />
            <input
            type="text"
            value={searchInput}
            onChange={handleSearchInput}
            placeholder={
              isGuest
                ? "Login to unlock jobs"
                : hasPremiumMembership
                ? "Search reserved for Ultra members"
                : "Upgrade to unlock jobs"
            }
            disabled={!canSearch}
            className={
              "w-full h-[35px] pl-[30px] pr-3 rounded-(--jf-radius-tile) border border-border-frame bg-page text-[13px] text-ink-900 placeholder:text-ink-500 outline-none " +
              (!canSearch ? "cursor-not-allowed opacity-70 bg-surface-alt" : "")
            }
            style={{ transition: "border-color 150ms, box-shadow 150ms" }}
            onFocus={(e) => {
              if (!canSearch) return;
              setSearchFocused(true);
              e.currentTarget.style.borderColor = "var(--color-sapphire-bright)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(47, 123, 224, 0.12)";
            }}
            onBlur={(e) => {
              if (!canSearch) return;
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
          className="h-[35px] w-[35px] flex items-center justify-center rounded-(--jf-radius-tile) border border-border-soft
                     bg-page text-ink-500 hover:border-border-frame hover:text-ink-600 disabled:opacity-40 flex-shrink-0"
          style={{ transition: "border-color 150ms, color 150ms" }}
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </motion.button>
      </form>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5 mb-[18px]">
        {TALENTD_CATEGORIES.map((c) => {
          const isActive = category === c.value;
          const buttonDisabled = !canFilter;
          return (
            <motion.button
              key={c.value === "" ? "__all__" : c.value}
              type="button"
              disabled={buttonDisabled}
              onClick={() => {
                if (buttonDisabled) return;
                setCategory(c.value);
                setPage(1);
              }}
              className={[
                "px-[11px] py-1 rounded-(--jf-radius-pill) text-[12px] font-medium border transition-colors duration-150",
                isActive
                  ? "bg-sapphire-bright border-sapphire-bright text-white"
                  : "bg-transparent border-transparent text-ink-500 hover:bg-sapphire-50 hover:border-sapphire-brand/40 hover:text-sapphire-brand",
                buttonDisabled ? "opacity-50 cursor-not-allowed" : "",
              ].join(" ")}
              style={{
                boxShadow: isActive ? "0 1px 4px rgba(47, 123, 224, 0.3)" : undefined,
              }}
            >
              {c.label}
            </motion.button>
          );
        })}
      </div>

      {/* Results count */}
      {!loading && total > 0 && (
        <Stat size="sm" value={total.toLocaleString()} label={`${filterLabel} jobs`} className="mb-4" />
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
            className="flex flex-col gap-2.5"
          >
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} reduced={reduced} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="py-14 text-center border border-dashed border-border-soft rounded-(--jf-radius-row)"
          >
            <SearchX size={26} strokeWidth={1.5} className="mx-auto mb-4 text-ink-500" />
            <p className="text-[14px] font-semibold text-ink-900 mb-1.5">
              {emptyTitle(searchQuery, category)}
            </p>
            <p className="text-[12.5px] text-ink-500 max-w-[270px] mx-auto mb-5 leading-relaxed">
              {emptyHint(searchQuery, category)}
            </p>
            <motion.button
              onClick={clearFilters}
              className="text-[12px] font-medium text-sapphire-brand bg-sapphire-50 border border-sapphire-brand/20
                         hover:bg-sapphire-100 hover:border-sapphire-brand/30 transition-colors duration-150
                         px-4 py-1.5 rounded-(--jf-radius-pill)"
            >
              Clear filters
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {isPreviewLocked && jobs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mt-6"
        >
          <div className="rounded-(--jf-radius-panel) border border-border-soft bg-page p-4 md:p-5 shadow-sm">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-(--jf-radius-pill) border border-border-soft bg-surface-alt px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
                <Sparkles className="h-3.5 w-3.5 text-ink-500" />
                More jobs hidden
              </div>
              <p className="text-[14px] font-semibold text-ink-900">
                {access?.cta === "membership"
                  ? "Upgrade your membership to reveal the rest of the board."
                  : "Login to continue reading the job board."}
              </p>
              <p className="text-[12.5px] leading-relaxed text-ink-600">
                The preview stops here, with a soft blur just like Medium. Unlocking gives you the remaining jobs, search, and full filters.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <Button asChild variant="primary" size="sm">
                  <a href={access?.cta === "membership" ? membershipHref : loginHref}>
                    {access?.cta === "membership" ? "Purchase Membership" : "Login"}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {!isPreviewLocked && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-border-soft">
          <motion.button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 h-[32px] px-3 rounded-(--jf-radius-pill) border border-border-soft
                       bg-page text-[12px] font-medium text-ink-700 hover:bg-surface-alt
                       transition-colors duration-150 disabled:opacity-30"
          >
            <ChevronLeft size={13} />
            Prev
          </motion.button>
          <span className="text-[12px] text-ink-500">
            Page {page} of {totalPages}
          </span>
          <motion.button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 h-[32px] px-3 rounded-(--jf-radius-pill) border border-border-soft
                       bg-page text-[12px] font-medium text-ink-700 hover:bg-surface-alt
                       transition-colors duration-150 disabled:opacity-30"
          >
            Next
            <ChevronRight size={13} />
          </motion.button>
        </div>
      )}
    </div>
  );
}
