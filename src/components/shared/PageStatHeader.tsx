/**
 * Composes marketing/primitives.tsx's SectionHeader + Stat for real-product
 * page headers. SectionHeader's default heading scale is marketing-sized
 * (text-3xl+); overridden here to the ADL v1.0 Page Title token (Derived —
 * see src/lib/typography.ts for the full derivation).
 */
import { SectionHeader, Stat } from "../marketing/primitives";
import { PAGE_TITLE } from "@/lib/typography";

export function PageStatHeader({
  eyebrow,
  heading,
  intro,
  statValue,
  statLabel,
  headingLevel = "h1",
  headingClassName,
  introClassName,
  className,
}: {
  eyebrow?: string;
  heading: React.ReactNode;
  intro?: React.ReactNode;
  statValue?: string;
  statLabel?: string;
  /** One h1 per page — pass "h2" if this header sits below an existing page h1. */
  headingLevel?: "h1" | "h2";
  headingClassName?: string;
  introClassName?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className ?? ""}`}>
      <SectionHeader
        eyebrow={eyebrow}
        heading={heading}
        intro={intro}
        headingLevel={headingLevel}
        headingClassName={headingClassName ?? PAGE_TITLE}
        introClassName={introClassName}
      />
      {statValue && <Stat size="sm" value={statValue} label={statLabel ?? ""} className="flex-shrink-0" />}
    </div>
  );
}
