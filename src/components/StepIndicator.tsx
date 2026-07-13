/**
 * Extracted from create-resume-simple.tsx's inline "generate" step
 * checklist (presentational-only split of an oversized file — logic and
 * state (`processingSteps`, `activeProcessingStep`) stay in the parent,
 * unchanged; only the done/active/pending rendering moved here).
 *
 * Single confirmed consumer (create-portfolio-page.tsx uses a plain
 * spinner instead, not this pattern — grep-checked, not assumed).
 *
 * Token sourcing (JobFlix Design System.html — no rendered reference for
 * this exact pattern exists in Homepage.html, so sourced from documented
 * tokens only):
 * - Done: sapphire-brand fill, white icon (brand color, not success —
 *   this is progress-through-a-task, not a status verdict).
 * - Active: sapphire-50 fill, sapphire-brand icon/text.
 * - Pending: track fill, ink-400 icon/text.
 * - Label: Small text spec — 15/1.45.
 */
import type { ElementType } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export interface StepIndicatorItem {
  id: string;
  label: string;
  icon: ElementType;
}

export function StepIndicator({
  steps,
  activeIndex,
}: {
  steps: StepIndicatorItem[];
  activeIndex: number;
}) {
  return (
    <div className="space-y-5">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx < activeIndex;
        const isActive = idx === activeIndex;

        return (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                isDone
                  ? "bg-sapphire-brand text-white"
                  : isActive
                    ? "bg-sapphire-50 text-sapphire-brand"
                    : "bg-track text-ink-400"
              )}
            >
              {isDone ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : isActive ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
            </div>
            <span
              className={cn(
                "text-[15px] leading-[1.45]",
                isDone ? "text-ink-500 line-through" : isActive ? "font-medium text-ink-900" : "text-ink-400"
              )}
            >
              {step.label}
              {isActive ? " ..." : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
