/**
 * JobFlix Hero — Chain Reaction artifacts.
 *
 * Each component is a compact, authentic representation of a REAL JobFlix
 * capability — the actual surfaces the product produces, not invented
 * analytics. One accent only: azure = done / matched / active; everything
 * else is warm-neutral ink. No status colors, no fake dashboards.
 *
 * `revealed` lets the two most demonstrable surfaces (résumé rewrite, ATS
 * meter) finish their action as the beat lands.
 */
import * as React from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

function Surface({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-brand-border bg-brand-surface p-3", className)}>
      {children}
    </div>
  );
}

/* 1 · Resume Builder — a real bullet, rewritten */
export function ResumeArtifact({ revealed }: { revealed: boolean }) {
  return (
    <Surface>
      <p className="text-[12px] leading-snug text-brand-ink-40 line-through">
        Assisted with various design tasks
      </p>
      <p
        className={cn(
          "mt-1.5 flex items-start gap-1.5 text-[12.5px] font-medium leading-snug text-brand-ink transition-opacity duration-500",
          revealed ? "opacity-100" : "opacity-0"
        )}
      >
        <Check size={13} className="mt-0.5 shrink-0 text-brand-accent" strokeWidth={3} />
        Shipped 3 design-system components, cutting UI bugs 40%
      </p>
    </Surface>
  );
}

/* 2 · ATS Optimization — match meter clears the filter */
export function AtsArtifact({ revealed }: { revealed: boolean }) {
  return (
    <Surface>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono-data text-[10px] uppercase tracking-[0.1em] text-brand-mono">
          ATS match
        </span>
        <span className="font-mono-data text-[13px] font-semibold text-brand-accent">92%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-sunken">
        <motion.div
          className="h-full rounded-full bg-brand-accent"
          initial={false}
          animate={{ width: revealed ? "92%" : "8%" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {["React", "Design systems", "A/B testing"].map((k) => (
          <span
            key={k}
            className="inline-flex items-center gap-1 rounded-full bg-brand-accent-soft px-2 py-0.5 text-[11px] font-medium text-brand-accent-ink"
          >
            <Check size={10} strokeWidth={3} />
            {k}
          </span>
        ))}
      </div>
    </Surface>
  );
}

/* 3 · Job Discovery — roles matched to the improved résumé */
export function JobsArtifact() {
  const jobs = [
    { role: "Product Designer", co: "Northwind", pct: "96" },
    { role: "UX Engineer", co: "Lumen Labs", pct: "91" },
  ];
  return (
    <Surface className="p-2">
      {jobs.map((j, i) => (
        <div
          key={j.role}
          className={cn(
            "flex items-center justify-between px-2 py-1.5",
            i > 0 && "border-t border-brand-border"
          )}
        >
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-semibold text-brand-ink">{j.role}</div>
            <div className="truncate text-[11px] text-brand-ink-70">{j.co}</div>
          </div>
          <span className="ml-2 shrink-0 font-mono-data text-[12px] font-semibold text-brand-accent">
            {j.pct}%
          </span>
        </div>
      ))}
    </Surface>
  );
}

/* 4 · HR Contacts — the verified hiring contact for the top role */
export function RecruiterArtifact() {
  return (
    <Surface>
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-brand-accent-soft font-mono-data text-[12px] font-semibold text-brand-accent-ink">
          SO
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[12.5px] font-semibold text-brand-ink">S. Okafor</div>
          <div className="truncate text-[11px] text-brand-ink-70">Head of Talent · Northwind</div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-accent-soft px-2 py-0.5 text-[11px] font-medium text-brand-accent-ink">
          <Check size={10} strokeWidth={3} />
          Verified
        </span>
      </div>
    </Surface>
  );
}

/* 5 · Referral Marketplace — a warm path into the same company */
export function ReferralArtifact() {
  return (
    <Surface className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-brand-sunken">
        <span className="h-3 w-3 rounded-sm border-l-2 border-brand-accent" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-semibold text-brand-ink">Referral path opened</div>
        <div className="truncate text-[11px] text-brand-ink-70">via M. Reyes · Northwind</div>
      </div>
      <span className="shrink-0 font-mono-data text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-accent-ink">
        Ready
      </span>
    </Surface>
  );
}

/* 6 · Interview Prep — a plan generated for this exact interview */
export function PrepArtifact() {
  const steps = ["Company & role research", "Likely questions", "Your STAR stories"];
  return (
    <Surface className="p-2.5">
      <div className="space-y-1.5">
        {steps.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-brand-accent text-white">
              <Check size={11} strokeWidth={3} />
            </span>
            <span className="text-[12px] text-brand-ink">{s}</span>
          </div>
        ))}
      </div>
    </Surface>
  );
}

/* 7 · Career Tracking — the whole thing, organized in one place */
export function TrackerArtifact() {
  return (
    <Surface className="flex items-center justify-between">
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold text-brand-ink">Northwind</div>
        <div className="truncate text-[11px] text-brand-ink-70">Product Designer</div>
      </div>
      <div className="ml-2 flex shrink-0 items-center gap-2.5">
        <span className="rounded-full bg-brand-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-brand-accent-ink">
          Interview
        </span>
        <span className="font-mono-data text-[10px] uppercase tracking-[0.08em] text-brand-mono">
          Jul 05
        </span>
      </div>
    </Surface>
  );
}
