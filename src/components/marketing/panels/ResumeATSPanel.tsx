import { ProductFrame, ProgressBar } from "../primitives";

export function ResumeATSPanel() {
  return (
    <ProductFrame>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink-900">
          Resume · Product Designer
        </span>
        <span className="text-[11px] font-normal text-ink-500">ATS scan</span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="text-5xl font-medium leading-none tracking-[-0.03em] text-ink-900">92</div>
        <div>
          <div className="text-xs font-medium text-success">▲ 8 pts this week</div>
          <div className="mt-1 text-sm text-ink-600">Match to job description</div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <ProgressBar label="Keywords matched" percent={94} />
        <ProgressBar label="Quantified impact" percent={88} />
        <ProgressBar label="Formatting & length" percent={97} />
      </div>
    </ProductFrame>
  );
}
