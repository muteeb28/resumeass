/**
 * JobFlix Design System row for /find-jobs. Composes `RowChip`
 * (src/components/marketing/primitives.tsx) as its core letter+title+
 * meta+value row — RowChip's first real product consumer outside the
 * homepage marketing mockup (JobsReferralsPanel). Skill tags, the "New"
 * badge, and link/hover behavior are layered on top since RowChip's own
 * API doesn't cover them; the underlying data and click-through logic are
 * unchanged from the previous JobCard.
 */
import { RowChip } from "../marketing/primitives";
import { cn } from "@/lib/utils";

export interface JobRowData {
  id: string;
  title: string;
  company: string;
  location: string;
  postedDate: string;
  url: string;
  type: string;
  salary?: string;
  tags?: string[];
  isNew?: boolean;
}

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

export function JobRow({ job, className }: { job: JobRowData; className?: string }) {
  const meta = [job.company, job.location, job.type].filter(Boolean).join(" · ");

  return (
    <a
      href={job.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group block overflow-hidden rounded-[var(--jf-radius-frame)] border border-border-frame bg-page shadow-[var(--jf-shadow-frame)] transition-colors duration-150 hover:border-sapphire-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sapphire-bright/30",
        className
      )}
    >
      <RowChip
        className="bg-page"
        letter={initials(job.company)}
        title={job.title}
        meta={`${meta}${job.postedDate ? ` · ${job.postedDate}` : ""}`}
        value={job.salary}
        badge={
          job.isNew ? (
            <span className="rounded-(--jf-radius-pill) border border-sapphire-brand/20 bg-sapphire-50 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-sapphire-brand">
              New
            </span>
          ) : undefined
        }
      />
      {job.tags && job.tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1 px-[13px] pb-[11px]">
          {job.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-(--jf-radius-mini) border border-border-soft bg-page px-1.5 py-px text-[11.5px] font-medium leading-none text-ink-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
}
