export function LiveReadyBadge({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-(--jf-radius-pill)
                 bg-success/10 border border-success/20 text-success
                 text-[10px] font-semibold shrink-0"
    >
      <span className="w-[5px] h-[5px] rounded-full bg-success animate-pulse" />
      {text}
    </span>
  );
}
