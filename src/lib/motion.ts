import type { Transition, Variants } from 'framer-motion'

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

/** Card hover lift — use with whileHover */
export const CARD_HOVER = {
  y: -1,
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
} as const

/** Chip hover */
export const CHIP_HOVER = {
  scale: 1.01,
  transition: { duration: 0.12 },
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

/** Standard button press feedback — use as whileTap target */
export const PRESS = {
  scale: 0.97,
  transition: { duration: 0.09, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
} as const

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
