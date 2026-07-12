// src/components/marketing/hero/HeroCardCluster.tsx
import Link from "next/link";
import { ProductFrame, RowChip } from "../primitives";
import { HERO_CLUSTER_CARDS, type HeroClusterCardData } from "./hero-cluster-data";

/*
 * Positions are a first pass, refined further against the approved V3
 * mockup in subsequent pixel-accuracy passes. Card 3 (Courses) is the
 * widest/most dominant; Card 2 (Latest jobs) is the narrowest; Card 1
 * (Mentorship) is mid-width — matching the reference's visual weighting.
 * All 3 cards now have 4 content rows (uniform), so height differences
 * between cards are minimal; the hierarchy signal is primarily width.
 */
const CARD_POSITION: Record<number, string> = {
  0: "top-[150px] left-0 w-[264px] z-[2]",   // Mentorship & referrals
  1: "top-0 right-4 w-[248px] z-[1]",         // Latest jobs
  2: "top-[320px] right-0 w-[312px] z-[3]",   // Courses
};

function ClusterCard({ card, position }: { card: HeroClusterCardData; position: string }) {
  return (
    <Link href={card.href} className={`absolute block ${position}`}>
      <ProductFrame emphasis="flat" className="hover:shadow-[var(--jf-shadow-panel)] transition-shadow duration-150">
        <div className="flex items-center gap-2">
          <span className="rounded-[var(--jf-radius-mini)] bg-sapphire-50 px-2 py-[3px] text-[11px] font-semibold text-sapphire-brand">
            {card.step}
          </span>
          <span className="text-[13px] font-semibold text-ink-900">{card.title}</span>
        </div>
        <div className="mt-3 space-y-1.5">
          {card.rows.map((row) => (
            <RowChip key={row.title} letter={row.letter} title={row.title} meta={row.meta} />
          ))}
        </div>
        <div className="mt-3 border-t border-border-soft pt-2 font-mono-data text-[11px] text-ink-500">
          {card.footer}
        </div>
      </ProductFrame>
    </Link>
  );
}

export function HeroCardCluster() {
  const [mentorship, latestJobs, courses] = HERO_CLUSTER_CARDS;

  return (
    <div className="relative h-[684px]">
      {/*
       * Connector stroke — reinforces "one illustration," not Clay's icon
       * set. viewBox is set to the container's actual measured pixel
       * dimensions (622 x 684 at the 1440px desktop target), not an
       * arbitrary scale, so this coordinate maps 1:1 to the cards' real
       * on-screen positions instead of being stretched/distorted.
       * Only 1 arrow (Mentorship #1 → Latest Jobs #2): a second arrow was
       * tried for Latest Jobs #2 → Courses #3, but that pair's only gap
       * sits inside the small rectangle where the two cards already
       * physically overlap — anything drawn there renders underneath the
       * (z-index-higher) Courses card and is invisible. The physical
       * card overlap itself already reads as "connected" there; forcing
       * a hidden arrow added a maintenance trap for no visible benefit.
       */}
      <svg viewBox="0 0 622 684" className="pointer-events-none absolute inset-0 h-full w-full" fill="none" aria-hidden>
        <defs>
          <marker id="cluster-arrow" markerWidth="8" markerHeight="8" refX="5.5" refY="4" orient="auto">
            <path d="M0,0 L7,4 L0,8" stroke="var(--color-ink-400)" strokeWidth="1.3" fill="none" />
          </marker>
        </defs>
        <path d="M 235 150 C 270 190, 315 250, 350 316" stroke="var(--color-ink-400)" strokeWidth="1.4" markerEnd="url(#cluster-arrow)" />
      </svg>

      <ClusterCard card={latestJobs} position={CARD_POSITION[1]} />
      <ClusterCard card={mentorship} position={CARD_POSITION[0]} />
      <ClusterCard card={courses} position={CARD_POSITION[2]} />
    </div>
  );
}
