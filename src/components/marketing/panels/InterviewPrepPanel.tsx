import { ProductFrame } from "../primitives";

export function InterviewPrepPanel() {
  return (
    <ProductFrame>
      <span className="text-[13px] font-semibold text-ink-900">
        Mock interview · System design
      </span>

      <div className="mt-3.5 flex flex-col gap-2.5">
        <div className="max-w-[80%] self-start rounded-[12px_12px_12px_4px] bg-surface-alt px-[13px] py-[10px] text-[12.5px] leading-[1.45] text-ink-700">
          How would you design a job-matching feed that stays fast at 10M users?
        </div>

        <div className="max-w-[80%] self-end rounded-[12px_12px_4px_12px] bg-ink-900 px-[13px] py-[10px] text-[12.5px] leading-[1.45] text-white">
          I&rsquo;d precompute match scores offline and serve from a ranked cache…
        </div>
      </div>

      <div className="mt-3.5 rounded-[11px] border border-sapphire-100 bg-sapphire-50 px-[13px] py-3">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-sapphire-700">
          AI feedback
        </div>
        <p className="mt-1.5 text-[12.5px] leading-[1.45] text-sapphire-800">
          Strong start. Name the consistency trade-off and you clear senior bar.
        </p>
      </div>
    </ProductFrame>
  );
}
