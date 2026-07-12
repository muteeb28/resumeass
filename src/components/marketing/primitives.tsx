/**
 * JobFlix Marketing — Core primitives (Ledger visual language, azure accent).
 * Reusable across all marketing sprints. Styling derives from the additive
 * `--brand-*` tokens in src/index.css.
 */
import * as React from "react";
import Link from "next/link";
import { cn } from "../../lib/utils";

/* ── Container ─────────────────────────────────────────────── */
/* Widths locked to the JobFlix Design System's three containers. */

/*
 * max-width includes the horizontal padding below (border-box), so the
 * value here is content-width + padding, not the raw content-width token —
 * padding is added on top of the Design System's content target, matching
 * the reference (measured: 1180px content row -> 1260px total box at the
 * lg:px-10 breakpoint where the constraint actually binds).
 */
type Width = "prose" | "content" | "wide";
const widthClass: Record<Width, string> = {
  prose: "max-w-[calc(var(--jf-container-prose)+80px)]",
  content: "max-w-[calc(var(--jf-container-content)+80px)]",
  wide: "max-w-[calc(var(--jf-container-wide)+80px)]",
};

export function Container({
  width = "wide",
  className,
  children,
}: {
  width?: Width;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full px-6 sm:px-8 lg:px-10", widthClass[width], className)}>
      {children}
    </div>
  );
}

/* ── MonoLabel (eyebrow / structural label) ────────────────── */

export function MonoLabel({
  children,
  tone = "muted",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "accent";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono-data text-xs font-semibold uppercase tracking-[0.09em]",
        tone === "accent" ? "text-brand-accent" : "text-brand-mono",
        className
      )}
    >
      {children}
    </span>
  );
}

/* ── Button (Ledger pill) ──────────────────────────────────── */

type ButtonVariant = "primary" | "ghost";
type ButtonSize = "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-canvas disabled:opacity-50 disabled:pointer-events-none";

const buttonVariant: Record<ButtonVariant, string> = {
  primary: "bg-brand-accent text-white hover:bg-brand-accent-hover",
  ghost: "bg-transparent text-brand-ink hover:bg-brand-sunken",
};

const buttonSize: Record<ButtonSize, string> = {
  md: "py-[9px] px-[18px] text-sm",
  lg: "py-[15px] px-[28px] text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const classes = cn(buttonBase, buttonVariant[variant], buttonSize[size], className);
  if (href.startsWith("#") || href.startsWith("http")) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

/* ── SectionHeader (eyebrow + heading + intro) ─────────────── */

export function SectionHeader({
  eyebrow,
  heading,
  intro,
  align = "left",
  headingClassName,
  introClassName,
  className,
  headingLevel: Heading = "h2",
}: {
  eyebrow?: string;
  heading: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  headingClassName?: string;
  introClassName?: string;
  className?: string;
  /** Defaults to h2 (marketing sections). Real product pages should pass "h1" — one h1 per page. */
  headingLevel?: "h1" | "h2";
}) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      {eyebrow && <MonoLabel tone="accent">{eyebrow}</MonoLabel>}
      {/*
        When headingClassName is provided, it fully REPLACES the marketing
        type treatment below rather than merging with it. twMerge only
        dedupes classes within the same breakpoint prefix — a caller
        override like "text-2xl" would leave "sm:text-4xl lg:text-[2.875rem]"
        untouched and still win at those widths. Full replacement avoids
        that trap entirely instead of requiring every caller to redeclare
        every breakpoint the default happens to use.
      */}
      <Heading
        className={cn(
          "mt-3 text-ink-900",
          headingClassName ??
            "font-medium leading-[1.08] tracking-[-0.02em] text-3xl sm:text-4xl lg:text-[2.875rem]"
        )}
      >
        {heading}
      </Heading>
      {intro && (
        <p
          className={cn(
            "mt-4 text-[19px] leading-[1.6] text-ink-600",
            align === "center" && "mx-auto max-w-2xl",
            introClassName
          )}
        >
          {intro}
        </p>
      )}
    </div>
  );
}

/* ── Stat (numeral + label) ─────────────────────────────────── */

/* "sm" = ADL v1.0 compact in-card stat (Derived: spec names "in-card
   values" as a legitimate weight-600 use). Value 15px/600 per the Small
   token bumped to in-card weight; label is the literal In-card-label
   token (11/600/+0.04em). */
const statValueSize: Record<"lg" | "sm", string> = {
  lg: "text-4xl font-medium leading-[0.9] tracking-[-0.03em] sm:text-5xl",
  sm: "text-[15px] font-semibold leading-none",
};
const statLabelSize: Record<"lg" | "sm", string> = {
  lg: "mt-2 text-sm leading-snug",
  sm: "mt-0.5 text-[11px] font-semibold tracking-[0.04em] leading-snug",
};

export function Stat({
  value,
  label,
  className,
  size = "lg",
}: {
  value: string;
  label: string;
  className?: string;
  /** "lg" (default) is the marketing hero scale. "sm" is for compact inline captions (e.g. a list toolbar count). */
  size?: "lg" | "sm";
}) {
  return (
    <div className={className}>
      <div className={cn(statValueSize[size], "text-ink-900")}>{value}</div>
      <p className={cn(statLabelSize[size], "text-ink-500")}>{label}</p>
    </div>
  );
}

/* ── ProgressBar (labelled fill) ────────────────────────────── */

export function ProgressBar({
  label,
  percent,
  className,
}: {
  label: string;
  percent: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-ink-600">{label}</span>
        <span className="font-mono-data font-semibold text-ink-900">{percent}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-track">
        <div
          className="h-full rounded-full"
          style={{ width: `${percent}%`, background: "var(--jf-grad-bar)" }}
        />
      </div>
    </div>
  );
}

/* ── RowChip (compact list row: avatar-letter + title + meta + value) ── */

export function RowChip({
  letter,
  title,
  meta,
  value,
  badge,
  className,
}: {
  letter: string;
  title: string;
  meta: string;
  value?: string;
  badge?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-[11px] bg-surface-alt px-[13px] py-[11px]",
        className
      )}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--jf-radius-mini)] bg-sapphire-50 font-mono-data text-xs font-semibold text-sapphire-brand">
        {letter}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-ink-900">{title}</div>
        <div className="truncate text-xs text-ink-500">{meta}</div>
      </div>
      {badge}
      {value && <div className="font-mono-data text-sm font-semibold text-ink-900">{value}</div>}
    </div>
  );
}

/* ── ProductFrame (the one dominant floating panel) ─────────── */
/*
 * Two card treatments per the Design System: "flat" for in-page product
 * visuals (feature rows — tighter frame radius, quiet shadow), and
 * "theatrical" for hero-level panels (larger panel radius, dramatic
 * shadow). Composition around the card — glow washes, tilted
 * continuation sheets, positioning — is owned by the call site (e.g.
 * HeroPanel), since that's specific to what's actually being composed,
 * not intrinsic to "a card."
 */

const frameEmphasis: Record<"flat" | "theatrical", string> = {
  flat: "rounded-[var(--jf-radius-frame)] border border-border-frame bg-page p-[var(--jf-space-frame-pad)] shadow-[var(--jf-shadow-frame)]",
  theatrical:
    "rounded-[var(--jf-radius-panel)] border border-border-soft bg-page p-[var(--jf-space-panel-pad)] shadow-[var(--jf-shadow-theatrical)]",
};

export function ProductFrame({
  children,
  emphasis = "flat",
  className,
}: {
  children: React.ReactNode;
  emphasis?: "flat" | "theatrical";
  className?: string;
}) {
  return <div className={cn(frameEmphasis[emphasis], className)}>{children}</div>;
}

/* ── LogoStrip (text wordmarks only, per Design System) ─────── */

export function LogoStrip({
  names,
  className,
  tone = "dark",
  spread = false,
}: {
  names: string[];
  className?: string;
  /** "dark" (default) is today's on-navy usage. "light" is for the
   *  light-canvas hero, matching the same ink scale used everywhere
   *  else on a light surface. */
  tone?: "dark" | "light";
  /** When true, spreads names edge-to-edge across the full container
   *  width (justify-between) instead of centering with fixed gaps —
   *  matches the reference trust-strip's full-width distribution. */
  spread?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-y-3",
        spread ? "justify-between gap-x-6" : "justify-center gap-x-10",
        className
      )}
    >
      {names.map((name) => (
        <span
          key={name}
          className={cn(
            "text-lg font-medium",
            tone === "light" ? "text-ink-500" : "text-white/60"
          )}
        >
          {name}
        </span>
      ))}
    </div>
  );
}
