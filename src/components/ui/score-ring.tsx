/**
 * Promoted from src/components/marketing/hero/HeroPanel.tsx (was a
 * private, unexported function scoped to that file). Implementation is
 * unchanged — only relocated so product-chrome surfaces (Optimizer,
 * ATS Optimize) can reuse it instead of reimplementing.
 */
export function ScoreRing({ value, percent }: { value: string; percent: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <div className="relative flex h-[76px] w-[76px] flex-shrink-0 items-center justify-center">
      <svg viewBox="0 0 76 76" className="h-full w-full -rotate-90">
        <circle cx="38" cy="38" r={radius} className="fill-none stroke-track" strokeWidth="6" />
        <circle
          cx="38"
          cy="38"
          r={radius}
          className="fill-none stroke-sapphire-bright"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-[29px] font-medium tracking-[-0.03em] text-ink-900">{value}</span>
    </div>
  );
}
