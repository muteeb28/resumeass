import { ProductFrame, RowChip } from "../primitives";

const roles = [
  { letter: "P", title: "Product Designer", meta: "Figma · Remote", value: "96%", referral: true },
  { letter: "U", title: "UX Engineer", meta: "Stripe · Hybrid", value: "91%", referral: true },
  { letter: "D", title: "Design Systems Lead", meta: "Airbnb · Remote", value: "88%", referral: false },
];

export function JobsReferralsPanel() {
  return (
    <ProductFrame>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink-900">Matched roles</span>
        <span className="text-[11px] font-normal text-ink-500">Remote · Full-time</span>
      </div>

      <div className="mt-4 space-y-1.5">
        {roles.map((r) => (
          <RowChip
            key={r.title}
            letter={r.letter}
            title={r.title}
            meta={r.meta}
            value={r.value}
            badge={
              r.referral ? (
                <span className="whitespace-nowrap text-xs font-medium text-sapphire-bright">🔓 referral</span>
              ) : undefined
            }
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-border-soft pt-3 text-sm text-ink-700">
        <span aria-hidden>🔓</span>
        2 warm intros available at Figma
      </div>
    </ProductFrame>
  );
}
