/**
 * Generic table-row primitive for JobFlix Design System list views.
 * Extracted from ResumeListRow (Sprint 2) so the same row shape can serve
 * other detail-list tables (e.g. /referrals/list) without re-deriving the
 * token treatment each time. ResumeListRow now composes this directly —
 * its rendered output is unchanged.
 */
import { cn } from "@/lib/utils";

export interface ListRowCell {
  content: React.ReactNode;
  className?: string;
}

export function ListRow({ cells, className }: { cells: ListRowCell[]; className?: string }) {
  return (
    <tr className={cn("transition-colors hover:bg-surface-alt", className)}>
      {cells.map((cell, i) => (
        <td key={i} className={cn("px-4 py-4", cell.className)}>
          {cell.content}
        </td>
      ))}
    </tr>
  );
}
