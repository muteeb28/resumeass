/**
 * Promoted from app/resume/page.tsx (was a local, non-exported function).
 * Status-category mapping logic is unchanged — only the visual treatment
 * migrated to JobFlix Design System tokens.
 *
 * Token sourcing (JobFlix Design System.html):
 * - Colors: semantic Success #0FA573 / Warning #C77414 / Error #D6455B /
 *   Info #2FA1DC; soft backgrounds derived via /10 opacity of the base
 *   token — the same technique already shipped in HeroPanel's "Live"
 *   badge (bg-success/10 + text-success), not a new pattern.
 * - Radius: pill (9999) via Tailwind's built-in `rounded-full`.
 * - Type: "in-card label" spec — 11/600/+0.04em.
 */
import { cn } from "../../lib/utils";

export type StatusCategory = "success" | "info" | "warning" | "error" | "neutral";

const DONE = ["done", "completed", "success", "ready"];
const PROCESSING = ["processing", "optimizing", "in-progress", "in_progress", "generating"];
const PENDING = ["pending", "queued", "draft"];
const FAILED = ["failed", "error"];

function categoryOf(raw?: string): StatusCategory {
  const key = (raw || "pending").toLowerCase();
  if (DONE.includes(key)) return "success";
  if (PROCESSING.includes(key)) return "info";
  if (PENDING.includes(key)) return "warning";
  if (FAILED.includes(key)) return "error";
  return "neutral";
}

function labelOf(raw?: string, category?: StatusCategory) {
  if (raw) return raw.charAt(0).toUpperCase() + raw.slice(1);
  switch (category) {
    case "success":
      return "Completed";
    case "info":
      return "Processing";
    case "warning":
      return "Pending";
    case "error":
      return "Failed";
    default:
      return "Pending";
  }
}

const categoryClass: Record<StatusCategory, string> = {
  success: "bg-success/10 text-success",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
  error: "bg-error/10 text-error",
  neutral: "bg-track text-ink-600",
};

/** Shared label derivation, for callers that need just the text (e.g. a summary tile) without the pill chrome. */
export function getStatusLabel(status?: string): string {
  return labelOf(status, categoryOf(status));
}

export function StatusBadge({ status, className }: { status?: string; className?: string }) {
  const category = categoryOf(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.04em]",
        categoryClass[category],
        className
      )}
    >
      {labelOf(status, category)}
    </span>
  );
}
