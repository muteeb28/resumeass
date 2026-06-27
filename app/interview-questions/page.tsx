// TEMPORARY:
// This page currently reads from public/data/interview-questions.json
// as a compatibility layer until the Interview Questions backend API
// is available.
// Replace the static JSON import with backend API calls once the
// backend integration is complete.

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Brain, BookOpen, Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";
import rawData from "../../public/data/interview-questions.json";

// ── Types ──────────────────────────────────────────────────────────────────────

type Company = {
  id: string;
  name: string;
  category: string | null;
  difficulty: string[] | null;
  topics: string[];
  questionCount: number | null;
  source: { name: string; url: string };
  lastUpdated: string | null;
};

// Future-proof modal union — add "progress" | "bookmarks" | "mock" when ready
type ModalState =
  | { type: "practice"; company: Company; topic?: string }
  | { type: "topics"; company: Company }
  | null;

const data = rawData as {
  version: number;
  generatedAt: string;
  companies: Company[];
};

// ── Derived filter values ──────────────────────────────────────────────────────

const ALL_CATEGORIES = Array.from(
  new Set(data.companies.map((c) => c.category).filter(Boolean) as string[])
).sort();

const ALL_DIFFICULTIES = ["Easy", "Medium", "Hard"];

// ── AI feature list ────────────────────────────────────────────────────────────

const AI_FEATURES = [
  "Company-specific question bank",
  "Adaptive AI interviewer",
  "Follow-up questions based on your answers",
  "Difficulty progression",
  "Coding & DSA rounds",
  "Behavioral interview training",
];

// ── Avatar palette (amber / neutral only — no blue, teal, purple) ─────────────

const PALETTES = [
  { bg: "bg-amber-100", text: "text-amber-800" },
  { bg: "bg-neutral-100", text: "text-neutral-700" },
  { bg: "bg-orange-100", text: "text-orange-800" },
  { bg: "bg-stone-100", text: "text-stone-700" },
  { bg: "bg-yellow-100", text: "text-yellow-800" },
];

function avatarPalette(name: string) {
  return PALETTES[name.charCodeAt(0) % PALETTES.length];
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function InterviewQuestionsPage() {
  const [search, setSearch] = useState("");
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return data.companies.filter((c) => {
      if (q) {
        const hit =
          c.name.toLowerCase().includes(q) ||
          c.topics.some((t) => t.toLowerCase().includes(q)) ||
          c.category?.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (activeDifficulty && !c.difficulty?.includes(activeDifficulty)) return false;
      if (activeCategory && c.category !== activeCategory) return false;
      return true;
    });
  }, [search, activeDifficulty, activeCategory]);

  const hasFilters = !!(search || activeDifficulty || activeCategory);

  function clearFilters() {
    setSearch("");
    setActiveDifficulty(null);
    setActiveCategory(null);
  }

  return (
    <BackgroundRippleLayout tone="light" contentClassName="pt-6 sm:pt-8">
      <Navbar tone="light" />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:pt-8 sm:px-6 lg:px-8">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="pt-6 pb-14 text-center sm:pt-10 sm:pb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-800">
            <Brain className="h-3 w-3" />
            ResumeAssist Interview Academy
          </span>

          <h1 className="mx-auto mt-5 max-w-3xl text-5xl font-black tracking-tight text-neutral-950 sm:text-6xl lg:text-7xl">
            Company-wise
            <br className="hidden sm:block" />
            {" "}Interview Questions
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-500">
            Practice with an AI coach that knows exactly how{" "}
            <span className="font-semibold text-neutral-700">
              {data.companies.length} top companies
            </span>{" "}
            interview — and adapts to your level.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {[
              { dot: "bg-emerald-500", label: `${data.companies.length} companies` },
              { dot: "bg-amber-500", label: `${ALL_CATEGORIES.length} categories` },
              { dot: "bg-neutral-400", label: "AI practice coming soon" },
            ].map(({ dot, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 shadow-sm"
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
                {label}
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── STICKY FILTER BAR ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="sticky top-16 z-40 -mx-4 mb-8 border-b border-neutral-200 bg-[#fbfbf8]/95 px-4 pb-4 pt-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Google, System Design, Arrays…"
              className="h-12 w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-10 text-sm text-neutral-800 shadow-sm placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                !activeCategory
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50"
              )}
            >
              All
            </button>
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  activeCategory === cat
                    ? "border-amber-500 bg-amber-500 text-slate-950"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50"
                )}
              >
                {cat}
              </button>
            ))}

            <span className="mx-1 self-center select-none text-neutral-300">|</span>

            {ALL_DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                  activeDifficulty === d
                    ? "border-amber-500 bg-amber-500 text-slate-950"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── RESULTS SUMMARY ───────────────────────────────────────────── */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            {filtered.length} {filtered.length === 1 ? "company" : "companies"}
            {hasFilters ? " matched" : ""}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-800"
            >
              <X size={11} />
              Clear filters
            </button>
          )}
        </div>

        {/* ── CARD GRID ─────────────────────────────────────────────────── */}
        {filtered.length > 0 ? (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((company, index) => {
              const palette = avatarPalette(company.name);
              return (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.32) }}
                  className="group flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
                >
                  {/* Header — future: bookmark slot (right side), solved-badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-transform duration-200 group-hover:scale-110",
                        palette.bg,
                        palette.text
                      )}
                    >
                      {initials(company.name)}
                    </div>
                    {company.category && (
                      <span className="mt-0.5 shrink-0 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-500">
                        {company.category}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3.5 text-base font-bold leading-tight text-neutral-900">
                    {company.name}
                  </h3>

                  {company.difficulty && company.difficulty.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {company.difficulty.map((d) => (
                        <span
                          key={d}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            d === "Easy" && "bg-emerald-50 text-emerald-700",
                            d === "Medium" && "bg-amber-50 text-amber-700",
                            d === "Hard" && "bg-red-50 text-red-700"
                          )}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  {company.topics.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {company.topics.slice(0, 4).map((topic) => (
                        <span
                          key={topic}
                          className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600"
                        >
                          {topic}
                        </span>
                      ))}
                      {company.topics.length > 4 && (
                        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[11px] font-medium text-neutral-400">
                          +{company.topics.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex-1" />

                  {/* Footer — future: progress bar, "recently practiced" label */}
                  <div className="mt-5 border-t border-neutral-100 pt-4">
                    {company.questionCount != null && (
                      <p className="mb-3 text-xs text-neutral-400">
                        <span className="font-semibold text-neutral-700">
                          {company.questionCount}+
                        </span>{" "}
                        curated questions
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setModal({ type: "practice", company })}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400 active:scale-[0.98]"
                      >
                        <Brain size={13} />
                        Practice with AI
                      </button>
                      <button
                        onClick={() => setModal({ type: "topics", company })}
                        className="flex items-center gap-1 rounded-lg border border-neutral-200 px-3 py-2.5 text-xs font-semibold text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
                      >
                        <BookOpen size={12} />
                        Browse Topics
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </section>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-24 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <Search size={22} className="text-neutral-400" />
            </div>
            <h3 className="mt-4 text-base font-bold text-neutral-800">No companies found</h3>
            <p className="mt-2 max-w-xs text-sm text-neutral-400">
              {search
                ? `No results for "${search}". Try a broader search or remove a filter.`
                : "No companies match the selected filters."}
            </p>
            <button
              onClick={clearFilters}
              className="mt-5 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
            >
              Clear all filters
            </button>
          </motion.div>
        )}

        {/* ── MODALS ────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {modal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setModal(null)}
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

              {/* Inner modal — animated between "practice" and "topics" */}
              <AnimatePresence mode="wait">

                {/* ── AI Practice modal ───────────────────────────── */}
                {modal.type === "practice" && (
                  <motion.div
                    key="practice"
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-black/10"
                  >
                    {/* Amber top accent */}
                    <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-amber-400 to-amber-500" />

                    <div className="p-7">
                      <button
                        onClick={() => setModal(null)}
                        className="absolute right-5 top-5 text-neutral-400 transition-colors hover:text-neutral-700"
                        aria-label="Close"
                      >
                        <X size={18} />
                      </button>

                      {/* Brand header */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                          <Brain size={22} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                            ResumeAssist
                          </p>
                          <h2 className="text-lg font-black leading-tight text-neutral-900">
                            AI Interview Coach
                          </h2>
                        </div>
                      </div>

                      {/* Company / topic context badge */}
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5">
                        <div
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold",
                            avatarPalette(modal.company.name).bg,
                            avatarPalette(modal.company.name).text
                          )}
                        >
                          {initials(modal.company.name)}
                        </div>
                        <span className="text-xs font-semibold text-neutral-700">
                          {modal.topic
                            ? `${modal.company.name} · ${modal.topic}`
                            : `Preparing for ${modal.company.name}`}
                        </span>
                      </div>

                      {/* Feature list */}
                      <div className="mt-5 space-y-2.5">
                        {AI_FEATURES.map((feature) => (
                          <div key={feature} className="flex items-center gap-2.5">
                            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                              <Check size={11} className="text-amber-700" />
                            </div>
                            <span className="text-sm text-neutral-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTAs */}
                      <div className="mt-6 flex gap-2">
                        <Link
                          href="/contact-us"
                          onClick={() => setModal(null)}
                          className="flex flex-1 items-center justify-center rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400"
                        >
                          Join Early Access
                        </Link>
                        <button
                          onClick={() => setModal(null)}
                          className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
                        >
                          Later
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Browse Topics modal ──────────────────────────── */}
                {modal.type === "topics" && (
                  <motion.div
                    key="topics"
                    initial={{ opacity: 0, scale: 0.96, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative z-10 w-full max-w-lg rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-black/10"
                  >
                    <div className="p-7">
                      <button
                        onClick={() => setModal(null)}
                        className="absolute right-5 top-5 text-neutral-400 transition-colors hover:text-neutral-700"
                        aria-label="Close"
                      >
                        <X size={18} />
                      </button>

                      {/* Company header */}
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold",
                            avatarPalette(modal.company.name).bg,
                            avatarPalette(modal.company.name).text
                          )}
                        >
                          {initials(modal.company.name)}
                        </div>
                        <div>
                          <h2 className="text-lg font-black text-neutral-900">
                            {modal.company.name}
                          </h2>
                          <p className="text-xs text-neutral-500">
                            Choose a topic to practise
                          </p>
                        </div>
                      </div>

                      {/* Topic grid — clicking a topic opens the AI Practice modal */}
                      <div className="mt-6 grid grid-cols-2 gap-2">
                        {modal.company.topics.map((topic) => (
                          <button
                            key={topic}
                            onClick={() =>
                              setModal({ type: "practice", company: modal.company, topic })
                            }
                            className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left text-sm font-semibold text-neutral-800 transition-all duration-150 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-900 active:scale-[0.98]"
                          >
                            <span>{topic}</span>
                            <ChevronRight size={14} className="flex-shrink-0 text-neutral-400" />
                          </button>
                        ))}
                      </div>

                      {/* Attribution — source tucked out of the primary workflow */}
                      <p className="mt-6 text-center text-[10px] leading-relaxed text-neutral-400">
                        Interview roadmap informed by publicly available interview resources.
                        Source available on request.
                      </p>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </BackgroundRippleLayout>
  );
}
