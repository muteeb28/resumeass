/**
 * Application Design Language (ADL) v1.0 — typography tokens for dense
 * product UI. The JobFlix Design System doesn't define a dashboard/table
 * scale; these are the derived/chosen values that fill that gap, approved
 * as the frozen v1.0 spec. Governance: extend this file (as a versioned
 * revision) before introducing any new typography treatment — never invent
 * a value inline on a page.
 *
 * Classification (see ADL v1.0 doc for full derivation):
 * - PAGE_TITLE: Derived — extrapolated from the documented heading scale's
 *   own size/line-height/tracking trend; weight 500 per the spec's
 *   headline ceiling (600 is reserved for wordmark/eyebrow/in-card values).
 * - SECTION_TITLE / CARD_TITLE: Derived — the spec's own compositional
 *   rule ("eyebrow + 500-weight headline + intro") applied to the
 *   documented Body/Small sizes, not new invented sizes.
 * - DENSE_BODY / CAPTION_META: Selected, not derived — the Small and
 *   Caption tokens already exist; these are the ones whose density fits
 *   product UI (Body/Intro/Lead are marketing-prose scale).
 * - STAT_VALUE_SM / STAT_LABEL_SM: Derived — the spec names "in-card
 *   values" as a legitimate weight-600 use.
 */

export const PAGE_TITLE =
  "text-2xl font-medium leading-[1.2] tracking-[-0.01em] text-ink-900";

/**
 * H1 · CTA band (Direct — verbatim spec token, 56/1.02/500/−0.025em).
 * Used for focused single-task onboarding screens (Create, Optimize,
 * Portfolio) — one prominent heading + one primary action, not a dense
 * list/table page. Distinct from PAGE_TITLE, which is for dense multi-item
 * screens (Resume list, Jobs Hub, Referrals). Added during implementation
 * to correctly apply an already-frozen Tier 1 token; not a new value.
 */
export const H1_CTA_BAND =
  "text-[56px] font-medium leading-[1.02] tracking-[-0.025em] text-ink-900";

/** Intro token (Direct, 19/1.6/400) — the subhead paired with H1_CTA_BAND
 *  on focused single-task screens (Create, Optimize, Portfolio). */
export const INTRO_TEXT = "text-[19px] leading-[1.6] font-normal text-ink-600";

export const SECTION_TITLE =
  "text-[17px] font-medium leading-[1.3] tracking-normal text-ink-900";

export const CARD_TITLE =
  "text-[15px] font-medium leading-[1.3] tracking-normal text-ink-900";

export const DENSE_BODY = "text-[15px] font-normal leading-[1.45] text-ink-700";

export const CAPTION_META = "text-[14px] font-normal text-ink-500";

/** Eyebrow token (Direct, 12/600/+0.09em) — Tailwind text-xs = 12px. */
export const EYEBROW =
  "text-xs font-semibold uppercase tracking-[0.09em] text-sapphire-brand";

/** In-card label token (Direct, 11/600/+0.04em). */
export const IN_CARD_LABEL = "text-[11px] font-semibold tracking-[0.04em]";

export const STAT_VALUE_SM = "text-[15px] font-semibold leading-none text-ink-900";
export const STAT_LABEL_SM = "text-[11px] font-semibold tracking-[0.04em] text-ink-500";

/* ── Spacing (dense product UI) ───────────────────────────────── */
/** Page gutter — Derived, reapplies frame-pad(20px) at the page level. */
export const PAGE_GUTTER = "px-5";
/** Section-to-section gap within a dense page — Chosen (24px). */
export const SECTION_GAP = "24px";
/** Table row vertical padding — Chosen (16px). */
export const ROW_PAD_Y = "py-4";
