import { ProductFrame } from "../primitives";
import { cn } from "../../../lib/utils";

const columns = [
  { title: "Applied", dotClass: "bg-ink-400", count: 3 },
  { title: "Interview", dotClass: "bg-sapphire-mid", count: 4 },
  { title: "Offer", dotClass: "bg-sapphire-brand", count: 2 },
];

export function CareerTrackerPanel() {
  return (
    <ProductFrame>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink-900">Application tracker</span>
        <span className="font-mono-data text-[11px] font-normal text-ink-500">14 active</span>
      </div>

      <div className="mt-3.5 grid grid-cols-3 gap-2.5">
        {columns.map((col) => (
          <div key={col.title} className="rounded-[11px] bg-surface-alt p-[11px]">
            <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-600">
              <span className={cn("h-2 w-2 rounded-full", col.dotClass)} />
              {col.title}
            </div>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {Array.from({ length: col.count }).map((_, i) => (
                <div key={i} className="h-[22px] rounded-[6px] border border-border-frame bg-page" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-[12px] text-ink-500">Next: follow up with Stripe · due tomorrow</div>
    </ProductFrame>
  );
}
