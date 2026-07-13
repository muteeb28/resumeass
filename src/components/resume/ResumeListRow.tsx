/**
 * Token-sourced from JobFlix Design System.html:
 * - Row divider / hover: border-soft (#EEF2F1) / surface-alt (#F5F8F7).
 * - Text: ink-900 (filename, primary), ink-600 (job description), ink-500
 *   (dates, secondary/caption role).
 * - Action: shadcn ui/button.tsx (outline, sm) via `asChild`, per the
 *   Sprint 2 button-standardization decision — not the marketing Button
 *   (href-only-navigation API mismatch here is fine since this *is*
 *   navigation, but marketing Button carries azure-CTA styling not
 *   appropriate for a table row action; shadcn outline is the neutral
 *   in-product treatment).
 *
 * Sprint 3: composes the generic `ListRow` (src/components/ui/list-row.tsx),
 * extracted so /referrals/list can reuse the same row shape. Rendered
 * output here is unchanged from the pre-extraction version.
 */
import Link from "next/link";
import { Button } from "../ui/button";
import { StatusBadge } from "../ui/status-badge";
import { ListRow } from "../ui/list-row";

export interface ResumeListRowData {
  id: string;
  filename: string;
  jobDescription: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export function ResumeListRow({ row }: { row: ResumeListRowData }) {
  return (
    <ListRow
      cells={[
        {
          className: "min-w-[220px]",
          content: <span className="block text-sm font-medium text-ink-900">{row.filename}</span>,
        },
        {
          className: "min-w-[320px] max-w-[520px]",
          content: (
            <span className="block max-w-[520px] truncate text-sm text-ink-600" title={row.jobDescription}>
              {row.jobDescription}
            </span>
          ),
        },
        { className: "min-w-[120px]", content: <StatusBadge status={row.status} /> },
        { className: "min-w-[180px] text-sm text-ink-500", content: row.createdAt },
        { className: "min-w-[180px] text-sm text-ink-500", content: row.updatedAt },
        {
          className: "min-w-[110px]",
          content: row.id ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/resume/${row.id}`}>Open</Link>
            </Button>
          ) : (
            <span className="text-sm text-ink-400">—</span>
          ),
        },
      ]}
    />
  );
}
