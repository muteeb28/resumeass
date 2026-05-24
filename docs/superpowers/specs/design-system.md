# Jobs Hub Design System
# Direction 1 — Sharp (cool slate + vibrant indigo)

**Confirmed:** 2026-05-23  
**Scope:** `app/job-tracker/` and all components under `src/components/jobs-hub/`  
**Replaces:** Direction A (Calm Linear + teal) from 2026-05-21  
**Do not apply outside this scope without explicit approval.**

> This is the source of truth for all Jobs Hub styling. Subagents and phases implement FROM this spec. Any deviation must update this file first.

---

## 1. CSS Tokens — add to `src/index.css` under `:root`

Tailwind v4 supports OKLCH natively. Register as a `@theme` block so Tailwind generates utility classes automatically.

```css
/* ── Jobs Hub Design System v2 (Direction 1 — Sharp, 2026-05-23) ── */
@theme {
  /* base */
  --color-hub-bg:             oklch(0.987 0.002 260);
  --color-hub-bg-subtle:      oklch(0.972 0.004 260);
  --color-hub-surface:        oklch(1.000 0.001 260);
  --color-hub-border:         oklch(0.905 0.005 260);
  --color-hub-border-strong:  oklch(0.812 0.008 260);
  /* text */
  --color-hub-text-1:         oklch(0.100 0.010 260);
  --color-hub-text-2:         oklch(0.440 0.010 260);
  --color-hub-text-3:         oklch(0.600 0.007 260);
  /* accent — vibrant Linear-grade indigo */
  --color-hub-accent:         oklch(0.520 0.220 278);
  --color-hub-accent-soft:    oklch(0.960 0.030 278);
  --color-hub-accent-fg:      oklch(0.360 0.160 278);
  /* salary */
  --color-hub-salary:         oklch(0.490 0.160 148);
  --color-hub-salary-bg:      oklch(0.950 0.040 148);
  /* status */
  --color-hub-warn:           oklch(0.570 0.150  55);
  --color-hub-warn-bg:        oklch(0.950 0.050  55);
}
```

This generates Tailwind utilities: `bg-hub-bg`, `text-hub-text-1`, `border-hub-border`, `bg-hub-accent`, etc.

### Quick reference table

| Token | OKLCH | Nearest hex | Usage |
|---|---|---|---|
| `hub-bg` | `0.987 0.002 260` | #FAFBFC | Page background |
| `hub-surface` | `1.000 0.001 260` | #FFFFFF | Cards, table rows |
| `hub-bg-subtle` | `0.972 0.004 260` | #F3F4F6 | Thead, hover row, chip rest |
| `hub-border` | `0.905 0.005 260` | #E2E4E9 | Cards, chips, table |
| `hub-border-strong` | `0.812 0.008 260` | #C8CBD4 | Input border, dividers |
| `hub-text-1` | `0.100 0.010 260` | #141419 | Headings, titles |
| `hub-text-2` | `0.440 0.010 260` | #5E6175 | Meta, company |
| `hub-text-3` | `0.600 0.007 260` | #8890A0 | Timestamps, muted |
| `hub-accent` | `0.520 0.220 278` | #4F5DE8 | Tab indicator, active chip, "New" badge |
| `hub-accent-soft` | `0.960 0.030 278` | #EEEFFE | Active chip bg, badge bg |
| `hub-accent-fg` | `0.360 0.160 278` | #2F3AB2 | Text on accent-soft |
| `hub-salary` | `0.490 0.160 148` | #18795E | Salary/CTC figures |
| `hub-salary-bg` | `0.950 0.040 148` | #EDFBF4 | Replied badge bg |
| `hub-warn` | `0.570 0.150 55` | #B45309 | Opened badge text |
| `hub-warn-bg` | `0.950 0.050 55` | #FEF3C7 | Opened badge bg |

### Accent rule
Accent (`hub-accent`) appears only in:
1. Tab indicator line (2px bottom border)
2. Active filter chip (fill + border)
3. "New" badge on job cards
4. Focus rings
5. Hover state on chips (border only, at 40% opacity)

**Never** use accent on headings, card bodies, or table cells. Never use it decoratively.

---

## 2. Typography

Font: **Plus Jakarta Sans** — add to `src/index.css` import at top:
```css
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
```
Then add to `@theme`:
```css
--font-hub: 'Plus Jakarta Sans', -apple-system, sans-serif;
```

| Element | Tailwind classes | Notes |
|---|---|---|
| Page title (h1) | `text-xl font-bold text-hub-text-1 tracking-tight` | -0.022em tracking |
| Panel subtitle | `text-xs text-hub-text-3` | Lives below panel title |
| Card job title | `text-[14px] font-semibold text-hub-text-1 leading-snug tracking-[-0.01em]` | |
| Card company / meta | `text-[12.5px] text-hub-text-2` | Company · Location · Work type |
| Card salary | `text-[13px] font-semibold text-hub-salary` | Only place salary color appears |
| Card timestamp | `text-[11.5px] text-hub-text-3` | |
| Skill tag | `text-[11.5px] font-medium text-hub-text-3` | Inside tag chip |
| Filter chip | `text-[12px] font-medium` | |
| Tab label | `text-[13px] font-medium` inactive / `font-semibold` active | |
| Table thead | `text-[11.5px] font-semibold text-hub-text-3` | lowercase, no uppercase |
| Table cell | `text-[13px] text-hub-text-1` | |
| Table muted cell | `text-[12.5px] text-hub-text-3` | Timestamps, email |
| Status badge | `text-[11.5px] font-semibold` | |
| "New" badge | `text-[10px] font-semibold` | |

---

## 3. Spacing & Layout

| Element | Value |
|---|---|
| Page max width | `max-w-[940px] mx-auto px-5` |
| Top bar height | `h-[52px]` |
| Tab nav height | `h-[42px]` (tabs + indicator row) |
| Page content padding | `pt-7 pb-20` |
| Panel title margin | `mb-5` |
| Search / toolbar margin | `mb-[14px]` |
| Chips row margin | `mb-[18px]` |
| Job list gap | `gap-[3px]` (barely visible separation) |
| Job card padding | `px-4 py-[13px]` |
| Company logo size | `w-9 h-9` (36px) |
| Logo — card gap | `gap-3` (12px) |
| Tag chip gap | `gap-1` |
| Kanban col gap | `gap-[10px]` |
| Table cell padding | `px-4 py-[11px]` |

---

## 4. Border Radius

| Component | Value |
|---|---|
| Job card | `rounded-[10px]` |
| Company logo | `rounded-[6px]` |
| Filter chip | `rounded-full` |
| "New" badge | `rounded-full` |
| Status badge | `rounded-[4px]` |
| Skill tag | `rounded-[4px]` |
| Table container | `rounded-[14px]` |
| Search input | `rounded-[10px]` |
| Button | `rounded-[10px]` |
| Kanban card | `rounded-[6px]` |
| Kanban column | `rounded-[10px]` |

---

## 5. Shadow System

All shadows use cool-tinted color to match the slate base. No warm shadows.

```css
/* paste these into :root in src/index.css */
--shadow-hub-sm: 0 1px 2px oklch(0.10 0.01 260 / 0.07), 0 1px 1px oklch(0.10 0.01 260 / 0.04);
--shadow-hub:    0 2px 8px oklch(0.10 0.01 260 / 0.09), 0 1px 3px oklch(0.10 0.01 260 / 0.05);
--shadow-hub-md: 0 4px 16px oklch(0.10 0.01 260 / 0.11), 0 2px 4px oklch(0.10 0.01 260 / 0.06);
```

| State | Shadow |
|---|---|
| Card at rest | none |
| Card hover | `var(--shadow-hub)` + `translateY(-1px)` |
| Kanban card hover | `var(--shadow-hub-sm)` + `translateY(-1px)` |
| Table container | none (border only) |
| Search input focus | `0 0 0 3px oklch(0.52 0.22 278 / 0.12)` |

---

## 6. Motion — Framer Motion Constants

Create `src/lib/motion.ts` — import from here everywhere. **Do not hardcode easing inline.**

```typescript
// src/lib/motion.ts
// Centralized motion primitives for Jobs Hub
// All Framer Motion variants and transitions reference this file.

/** Tab indicator slide — spring with slight overshoot */
export const TAB_INDICATOR = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
  mass: 1,
} satisfies import('framer-motion').SpringOptions

/** Content panel entrance — expo-out feel */
export const PANEL_IN = {
  initial: { opacity: 0, y: 7 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.30, ease: [0.16, 1, 0.3, 1] },
} as const

/** Stagger container — wraps lists of job cards */
export const STAGGER_CONTAINER = {
  animate: { transition: { staggerChildren: 0.055 } },
} as const

/** Single staggered item (job card, table row, kanban column) */
export const STAGGER_ITEM = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: [0.16, 1, 0.3, 1] },
  },
} as const

/** Active dot on tab (scale in on active) */
export const TAB_DOT = {
  initial: { scale: 0.3, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring', stiffness: 400, damping: 22 },
} as const

/** Card hover lift — use with whileHover */
export const CARD_HOVER = {
  y: -1,
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
} as const

/** Chip hover */
export const CHIP_HOVER = {
  scale: 1.01,
  transition: { duration: 0.12 },
} as const

/** Reduced-motion safe wrapper — disables y-transforms when prefers-reduced-motion */
export function safeMotion<T extends { initial?: object; animate?: object }>(
  variant: T,
  reducedMotion: boolean
): T {
  if (!reducedMotion) return variant
  return {
    ...variant,
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  }
}
```

### Reduced motion rule
Always wrap Framer Motion components with `useReducedMotion()`. When true: disable y-transforms, use instant opacity only.

```tsx
const reduced = useReducedMotion()
// pass reducedMotion={reduced ?? false} to safeMotion() 
// or check before applying y-based variants
```

---

## 7. Component Specs

### 7.1 Tab Navigation

Tab bar: `sticky top-[52px] z-[100]`, `border-b border-hub-border`, `bg-hub-surface`.

```tsx
// Tab indicator: absolutely positioned, uses layoutId for Framer Motion spring
<motion.div
  layoutId="tab-indicator"
  className="absolute bottom-0 h-[2px] rounded-t-[2px] bg-hub-accent"
  transition={TAB_INDICATOR}
/>
```

Active tab: `text-hub-text-1 font-semibold`
Inactive tab: `text-hub-text-3 font-medium hover:text-hub-text-2`
Tab padding: `px-[15px] py-[11px]`
Active dot: `w-[5px] h-[5px] rounded-full bg-hub-accent ml-[5px]` — `<AnimatePresence>` + scale spring

### 7.2 Filter Chips

```
Rest:   bg-hub-surface border border-hub-border-strong text-hub-text-2
        text-[12px] font-medium px-[11px] py-1 rounded-full
Hover:  border-hub-accent/40 text-hub-accent-fg bg-hub-accent-soft
Active: bg-hub-accent border-hub-accent text-white
        box-shadow: 0 1px 4px oklch(0.52 0.22 278 / 0.3)
Transition: 130ms, border + bg + color
```

### 7.3 Job Card

```
Rest:   bg-hub-surface border border-hub-border rounded-[10px]
        padding: px-4 py-[13px]
Hover:  border-hub-border-strong, var(--shadow-hub), translateY(-1px)
        transition: border 150ms, box-shadow 180ms, transform 180ms
```

Company logo: 36×36, `rounded-[6px]`, `border border-hub-border`.
Logo background: use a small palette of cool-tinted OKLCH colors keyed by company initial — not random warm tints.

Salary: `text-[13px] font-semibold text-hub-salary` — the only place salary color appears.
"New" badge: `bg-hub-accent-soft text-hub-accent-fg border border-hub-accent/20 text-[10px] font-semibold rounded-full px-1.5 py-0.5`

### 7.4 HR / Dubai HR Table

Container: `bg-hub-surface border border-hub-border rounded-[14px] overflow-hidden`

```
thead:  bg-hub-bg-subtle
th:     text-[11.5px] font-semibold text-hub-text-3 px-4 py-[9px] text-left
        border-b border-hub-border
tbody tr:
  rest:   border-b border-hub-border
  hover:  bg-hub-bg-subtle transition-colors 100ms
  last:   no border-b
td:     text-[13px] text-hub-text-1 px-4 py-[11px]
```

Status badges (no side-stripe borders — use full background):

| Status | Background | Text | Border |
|---|---|---|---|
| Sent | `hub-bg-subtle` | `hub-text-3` | `hub-border` |
| Opened | `hub-warn-bg` | `hub-warn` | `hub-warn/20` |
| Replied | `hub-salary-bg` | `hub-salary` | `hub-salary/20` |

Format: `inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-0.5 rounded-[4px]` with a 4px filled circle before the label.

### 7.5 Kanban (Job Tracker)

Columns: 4-col grid, `gap-[10px]`
Column bg: `bg-hub-bg-subtle border border-hub-border rounded-[10px] p-[11px]`
Stage label: `text-[11.5px] font-semibold text-hub-text-2`
Count badge: `text-[10.5px] font-semibold text-hub-text-3 bg-hub-border min-w-[18px] h-[18px] rounded-full`
Card: `bg-hub-surface border border-hub-border rounded-[6px] p-[9px] cursor-pointer`
Card hover: `var(--shadow-hub-sm)` + `translateY(-1px)`
Empty state: `border border-dashed border-hub-border-strong rounded-[6px] p-4 text-center text-[12.5px] text-hub-text-3`

### 7.6 Search Input

```
height: 35px, rounded-[10px], border border-hub-border-strong bg-hub-surface
padding: px-3 pl-[30px] (for search icon)
text: text-[13px] text-hub-text-1, placeholder: text-hub-text-3
focus: border-hub-accent, box-shadow: 0 0 0 3px oklch(0.52 0.22 278 / 0.12)
transition: border-color 150ms, box-shadow 150ms
```

### 7.7 Live Dot + Badge

```tsx
<span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-hub-text-3">
  <span className="w-[5px] h-[5px] rounded-full bg-hub-salary animate-pulse" />
  Live
</span>
```

Pulse animation: standard Tailwind `animate-pulse` (CSS only — no Framer Motion for this).

---

## 8. Phase Implementation Plan

Phases are sequential. Each phase must not be started until the previous is merged and working.

### Phase 1 — Foundation (implement first, nothing else depends on it)
- [ ] Add `@theme` color tokens to `src/index.css`
- [ ] Add CSS shadow variables to `:root` in `src/index.css`
- [ ] Add Google Font import for Plus Jakarta Sans to `src/index.css`
- [ ] Create `src/lib/motion.ts` with all motion constants
- [ ] Create `src/components/jobs-hub/tabs.config.ts` with TabId, TabConfig, TABS array

### Phase 2 — Navigation
- [ ] Create/update `src/components/jobs-hub/JobsHubNav.tsx`
  - Framer Motion `layoutId="tab-indicator"` spring indicator
  - 6 tabs with `AnimatePresence` dot
  - Sticky positioning below topbar
- [ ] Wire into `app/job-tracker/page.tsx`

### Phase 3 — Jobs Feed
- [ ] Update `src/components/job-board.tsx`
  - Apply new card styles (surface/border/radius/hover)
  - Filter chips to Direction 1 spec
  - Stagger job cards with `STAGGER_CONTAINER` + `STAGGER_ITEM`
  - Company logo cool-tinted colors

### Phase 4 — HR Tables
- [ ] Update `src/components/hr-emails-table.tsx`
  - New thead/tbody styles
  - Status badge system (Sent/Opened/Replied)
  - Row hover + stagger entrance

### Phase 5 — Regional Panels
- [ ] Dubai HR tab (new table matching Phase 4 spec)
- [ ] Gulf Jobs tab (job list matching Phase 3 spec)
- [ ] AU & NZ Jobs tab (job list matching Phase 3 spec)

---

## 9. Shared Primitive Checklist

Before any Phase 3+ work begins, confirm these files exist:

- [ ] `src/lib/motion.ts`
- [ ] `src/components/jobs-hub/tabs.config.ts`
- [ ] `src/index.css` — hub tokens registered under `@theme`

Every component imports motion from `src/lib/motion.ts`. No inline easing strings.

---

## 10. Out of Scope

Do not change any of the following in any phase:

- `BackgroundRippleLayout` — affects whole app
- `Navbar` — not in scope
- Resume, Portfolio, Optimizer routes
- Any company logo color palettes used elsewhere
- `src/styles/resume-optimizer.css`
