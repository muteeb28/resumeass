import type { Transition, Variants } from 'framer-motion'

/**
 * ADL v1.0 motion rule (Direct, from the JobFlix Design System spec):
 * only background-color/border-color ever transition, at 0.15s ease.
 * Never animate: hover scale or transform, panel tilts, shadows, glow
 * washes, headlines, scroll-triggered reveals, parallax. Do not add a new
 * whileTap/whileHover scale or transform constant here — extend the ADL
 * first if a genuinely new interaction pattern is needed.
 *
 * TAB_INDICATOR/TAB_DOT below predate this rule and are only consumed by
 * the currently-unused JobsHubNav.tsx — left as-is since that component
 * isn't live, not because the pattern is approved for reuse.
 */

/** Tab indicator slide — fast spring, near-critically damped (no perceptible bounce) */
export const TAB_INDICATOR = {
  type: 'spring' as const,
  stiffness: 460,
  damping: 38,
  mass: 1,
}

/** Content panel entrance — expo-out feel */
export const PANEL_IN = {
  initial: { opacity: 0, y: 7 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.30, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
} as const

/** Stagger container — wraps lists of job cards */
export const STAGGER_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
}

/** Single staggered item (job card, table row, kanban column) */
export const STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: [0.16, 1, 0.3, 1] } as Transition,
  },
}

/** Active dot on tab (scale in on active) */
export const TAB_DOT = {
  initial: { scale: 0.3, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring', stiffness: 400, damping: 22 },
} as const

/**
 * Tab panel transition — wraps the entire content area for each tab.
 * Concurrent with exit (default AnimatePresence mode): enter starts as old panel fades out.
 * Exit is faster than enter so the outgoing panel clears quickly.
 */
export const TAB_PANEL = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, transition: { duration: 0.10 } },
  transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
} as const

/** Table row stagger container — faster cadence than card lists */
export const TABLE_ROWS: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03 } },
}

/** Single table row entrance — opacity only, no y-transform (avoids table layout quirks) */
export const TABLE_ROW: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.20, ease: [0.16, 1, 0.3, 1] } as Transition },
}

/** Reduced-motion safe wrapper */
export function safeMotion<T extends { initial?: object; animate?: object }>(
  variant: T,
  reducedMotion: boolean,
): T {
  if (!reducedMotion) return variant
  return {
    ...variant,
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  }
}
