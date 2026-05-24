export function LiveReadyBadge({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                 bg-hub-salary-bg border border-hub-salary/20 text-hub-salary
                 text-[10px] font-semibold shrink-0"
      style={{ fontFamily: 'var(--font-hub)' }}
    >
      <span className="w-[5px] h-[5px] rounded-full bg-hub-salary animate-pulse" />
      {text}
    </span>
  );
}
