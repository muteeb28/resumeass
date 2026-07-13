"use client";

/**
 * JobFlix Hero — The Chain Reaction.
 *
 * The visitor WATCHES one real career move through JobFlix's connected
 * pipeline: résumé improves → clears ATS → jobs match → recruiter surfaces →
 * referral opens → interview prep generates → tracker organizes it. Each beat
 * triggers the next; the artifacts are real product surfaces (see artifacts.tsx).
 *
 * Robustness: SSR / no-JS renders the finished chain (coherent). With motion
 * enabled it replays once from the top. `prefers-reduced-motion` shows it
 * settled. Only meaningful motion — each reveal is a real action completing.
 */
import * as React from "react";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  ResumeArtifact,
  AtsArtifact,
  JobsArtifact,
  RecruiterArtifact,
  ReferralArtifact,
  PrepArtifact,
  TrackerArtifact,
} from "./artifacts";

type Beat = {
  key: string;
  tag: string;
  caption: string;
  render: (revealed: boolean) => React.ReactNode;
};

const BEATS: Beat[] = [
  { key: "resume", tag: "Résumé", caption: "Rewrote your bullet to match the job.", render: (r) => <ResumeArtifact revealed={r} /> },
  { key: "ats", tag: "ATS", caption: "Cleared the ATS screen — 92%.", render: (r) => <AtsArtifact revealed={r} /> },
  { key: "jobs", tag: "Jobs", caption: "3 roles matched to your résumé.", render: () => <JobsArtifact /> },
  { key: "recruiter", tag: "Recruiter", caption: "Found the hiring contact.", render: () => <RecruiterArtifact /> },
  { key: "referral", tag: "Referral", caption: "A referral path opened here.", render: () => <ReferralArtifact /> },
  { key: "prep", tag: "Prep", caption: "Generated your interview prep.", render: () => <PrepArtifact /> },
  { key: "tracker", tag: "Tracker", caption: "Every step — now in one place.", render: () => <TrackerArtifact /> },
];

const ALT_TEXT =
  "A live demonstration: your résumé improves, clears the ATS screen, matches real jobs, surfaces a verified recruiter and a referral, generates interview prep, and lands organized in your tracker.";

export function ChainReaction() {
  const reduce = useReducedMotion();
  // Default to the finished chain so SSR / no-JS shows a coherent frame.
  const [step, setStep] = React.useState(BEATS.length);
  const [playing, setPlaying] = React.useState(false);

  // Before paint (motion enabled): rewind to the top and play once.
  React.useLayoutEffect(() => {
    if (reduce) return;
    setStep(0);
    setPlaying(true);
  }, [reduce]);

  React.useEffect(() => {
    if (!playing || step >= BEATS.length) return;
    const t = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 400 : 820);
    return () => window.clearTimeout(t);
  }, [playing, step]);

  return (
    <div
      role="img"
      aria-label={ALT_TEXT}
      className="w-full rounded-2xl border border-brand-border bg-brand-canvas p-3 shadow-brand-lg sm:p-4"
    >
      {/* header — one connected system, driven by JobFlix */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-brand-ink">
            <span className="h-2 w-2 rounded-[3px] bg-brand-accent" />
          </span>
          <span className="font-mono-data text-[10.5px] uppercase tracking-[0.12em] text-brand-mono">
            One search · handled by JobFlix
          </span>
        </div>
        <span className="font-mono-data text-[10.5px] uppercase tracking-[0.1em] text-brand-accent-ink">
          Live
        </span>
      </div>

      <ol className="px-1">
        {BEATS.map((beat, i) => {
          const revealed = i < step;
          const isLast = i === BEATS.length - 1;
          return (
            <li key={beat.key} className="flex gap-3">
              {/* connector rail — subordinate chain wiring, not the hero */}
              <div className="flex flex-col items-center pt-1" aria-hidden>
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300",
                    revealed
                      ? "border-brand-accent bg-brand-accent text-white"
                      : "border-brand-border-strong bg-brand-surface"
                  )}
                >
                  {revealed ? <Check size={9} strokeWidth={3.5} /> : null}
                </span>
                {!isLast && (
                  <span
                    className={cn(
                      "mt-1 w-0.5 flex-1 rounded-full transition-colors duration-300",
                      revealed ? "bg-brand-accent/40" : "bg-brand-border"
                    )}
                  />
                )}
              </div>

              {/* beat content */}
              <motion.div
                className={cn("min-w-0 flex-1", isLast ? "pb-1" : "pb-3")}
                initial={false}
                animate={{ opacity: revealed ? 1 : 0.32, y: revealed ? 0 : 6 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                {beat.render(revealed)}
                <p className="mt-1 flex items-center gap-1.5 font-mono-data text-[10.5px] leading-tight tracking-[0.02em]">
                  <span className="font-semibold uppercase tracking-[0.08em] text-brand-accent-ink">
                    {beat.tag}
                  </span>
                  <span className="text-brand-mono">· {beat.caption}</span>
                </p>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
