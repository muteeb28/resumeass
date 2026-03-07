"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { MapPin, Clock, ExternalLink, ArrowRight, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

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

const TYPE_COLORS: Record<string, string> = {
  "Full-time": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Internship:  "bg-violet-50 text-violet-700 border-violet-200",
  Contract:    "bg-amber-50 text-amber-700 border-amber-200",
  "Part-time": "bg-sky-50 text-sky-700 border-sky-200",
};

const PLATFORM_COLORS: Record<string, string> = {
  LinkedIn:         "bg-blue-500",
  RemoteRocketship: "bg-rose-500",
  Adzuna:           "bg-purple-500",
};

function CompanyInitials({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const palette = [
    "bg-teal-100 text-teal-700",
    "bg-indigo-100 text-indigo-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-orange-100 text-orange-700",
  ];
  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${palette[name.charCodeAt(0) % palette.length]}`}
    >
      {initials || "?"}
    </div>
  );
}

function Skeleton({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white border border-neutral-200 rounded-2xl p-5 animate-pulse"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3.5 w-3/4 bg-neutral-100 rounded" />
          <div className="h-3 w-1/2 bg-neutral-100 rounded" />
        </div>
        <div className="h-5 w-16 bg-neutral-100 rounded-full flex-shrink-0" />
      </div>
      <div className="flex gap-3 mb-4">
        <div className="h-3 w-28 bg-neutral-100 rounded" />
        <div className="h-3 w-16 bg-neutral-100 rounded" />
      </div>
      <div className="h-9 w-full bg-neutral-100 rounded-xl" />
    </motion.div>
  );
}

// Animated counter for the total number
function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export function JobsPreviewSection() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/jobs?query=all&page=1&limit=6");
        const data = await res.json();
        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
        setTotal(data.total ?? 0);
      } catch {
        setJobs([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section ref={ref} className="py-14 px-4 bg-neutral-50 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8"
        >
          <div>
            {/* Live pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold mb-4"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              Live Jobs
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
              Fresh roles, right now
            </h2>

            {/* Dynamic count line */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView && !loading ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-neutral-500 mt-2 text-sm flex items-center gap-1.5"
            >
              <Zap size={13} className="text-teal-500 flex-shrink-0" />
              {loading ? (
                <span className="flex items-center gap-1">
                  Scanning live boards
                  <span className="inline-flex gap-0.5">
                    {[0,1,2].map(i => (
                      <motion.span
                        key={i}
                        className="w-1 h-1 rounded-full bg-neutral-400 inline-block"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </span>
                </span>
              ) : (
                <span>
                  We found{" "}
                  <span className="font-semibold text-teal-600">
                    <AnimatedCount value={total} />
                  </span>{" "}
                  fresh jobs for you
                </span>
              )}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              href="/job-tracker"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neutral-900 text-white text-sm font-semibold hover:bg-teal-600 transition-colors self-start sm:self-auto flex-shrink-0 group"
            >
              See All Jobs
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="wait">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} delay={i * 0.07} />
                ))
              : jobs.map((job, i) => {
                  const badge = TYPE_COLORS[job.type] ?? "bg-neutral-100 text-neutral-600 border-neutral-200";
                  const dot   = PLATFORM_COLORS[job.platform] ?? "bg-neutral-400";
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 24, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
                      className="group bg-white border border-neutral-200 rounded-2xl p-5 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-500/8 transition-all duration-300 flex flex-col cursor-default"
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <motion.div whileHover={{ scale: 1.08 }} transition={{ type: "spring", stiffness: 400 }}>
                            <CompanyInitials name={job.company} />
                          </motion.div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-neutral-900 text-sm leading-snug line-clamp-2 group-hover:text-teal-700 transition-colors duration-200">
                              {job.title}
                            </h3>
                            <p className="text-xs text-neutral-500 mt-0.5 truncate">{job.company}</p>
                          </div>
                        </div>
                        <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${badge}`}>
                          {job.type}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-500 mb-4">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={10} />
                            {job.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {job.postedDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                          {job.platform}
                        </span>
                      </div>

                      {/* Apply button */}
                      <div className="mt-auto">
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold bg-neutral-900 text-white hover:bg-teal-600 transition-colors duration-200 group/btn"
                        >
                          Apply Now
                          <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        {!loading && jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center mt-8"
          >
            <Link
              href="/job-tracker"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-teal-200 bg-teal-50 text-teal-700 text-sm font-semibold hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all duration-200 group"
            >
              <Sparkles size={14} />
              Browse all {total} jobs with search &amp; filters
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
