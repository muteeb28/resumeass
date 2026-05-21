# Jobs Hub Design System
# Direction A — Calm Linear + Teal Salary/Hover

**Confirmed:** 2026-05-21  
**Scope:** `app/job-tracker/` and all components under `src/components/jobs-hub/`  
**Do not apply outside this scope without explicit approval.**

---

## 1. Palette

All values are Tailwind utility names. Use these — never hardcode hex in component files.

| Role | Tailwind class | Hex approx | Usage |
|---|---|---|---|
| Page background | `bg-neutral-50` | #F5F5F5 | `BackgroundRippleLayout tone="light"` — unchanged |
| Surface | `bg-white` | #FFFFFF | Cards, table rows, pill strip, chips |
| Text primary | `text-neutral-900` | #171717 | Headings, card titles, table name cells |
| Text secondary | `text-neutral-500` | #737373 | Descriptions, meta, company name |
| Text muted | `text-neutral-400` | #A3A3A3 | Region labels, row numbers, timestamps |
| Border default | `border-neutral-200` | #E5E5E5 | Cards, chips, tab strip, table |
| Border strong | `border-neutral-300` | #D4D4D4 | Apply button at rest |
| Active pill bg | `bg-neutral-900` | #171717 | Active tab pill, active chip, table header |
| **Teal — salary** | `text-emerald-600` | #059669 | Salary/CTC figures only |
| **Teal — hover** | `hover:bg-teal-600` / `hover:border-teal-300` / `hover:text-teal-600` | #0D9488 | Card hover border, Apply button hover fill, table link hover |
| Live badge bg | `bg-emerald-50` | #ECFDF5 | LiveReadyBadge background |
| Live badge border | `border-emerald-200` | #A7F3D0 | LiveReadyBadge border |
| Live badge text | `text-emerald-700` | #065F46 | LiveReadyBadge text |
| Live dot | `bg-emerald-500` | #10B981 | Animated pulse dot |

### Teal constraint — hard rule
Teal appears **only** in these three contexts:
1. Salary / CTC figures: `text-emerald-600`
2. Interactive hover states: card border, apply button fill, chip hover, table link hover
3. The live-ready badge and pulse dot

**Never** use teal for headings, chips at rest, tab pills, backgrounds, or decorative elements.

### Type badge colors (small pills on job cards)
These are functional indicators, not decorative. They remain pastel-tinted:

| Type | Classes |
|---|---|
| Full-time | `bg-emerald-50 text-emerald-700 border-emerald-200` |
| Internship | `bg-violet-50 text-violet-700 border-violet-200` |
| Contract | `bg-amber-50 text-amber-700 border-amber-200` |
| Part-time | `bg-sky-50 text-sky-700 border-sky-200` |
| Default | `bg-neutral-100 text-neutral-600 border-neutral-200` |

These are isolated within the type badge component and do not set a precedent for other chip styling.

---

## 2. Typography

| Element | Classes | Notes |
|---|---|---|
| Page h1 | `text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight` | `tracking-tight` = -0.025em, Direction A key trait |
| Region label | `text-xs uppercase tracking-[0.3em] text-neutral-400` | Existing pattern — preserved |
| Tab description | `text-sm text-neutral-500 max-w-2xl mt-3 leading-relaxed` | |
| Card job title | `text-sm font-semibold text-neutral-900 leading-snug` | |
| Card company | `text-xs text-neutral-500` | |
| Card salary | `text-sm font-semibold text-emerald-600` | Teal only here |
| Card meta (location/time) | `text-xs text-neutral-400` | |
| Filter chip | `text-[11px] font-medium` | |
| Tab pill | `text-xs font-semibold` | |
| Table header | `text-[10px] font-semibold uppercase tracking-[0.04em] text-white` | |
| Table cell | `text-xs text-neutral-600` | |
| Table name cell | `text-xs font-semibold text-neutral-900` | |
| Table link | `text-xs text-teal-600 hover:underline` | Teal scoped to links |
| Result count | `text-xs text-neutral-500` | `<strong>` = `text-neutral-900 font-semibold` |

---

## 3. Spacing & Layout

| Element | Classes |
|---|---|
| Page section | `px-4 py-16` |
| Page container | `max-w-6xl mx-auto` |
| Tab strip margin | `mb-10` |
| Tab header margin | `mb-8` |
| Filter row margin | `mb-6` |
| Cards grid gap | `gap-3` (12px — tighter than gap-4 per Direction A) |
| Cards grid columns | `grid-cols-1 md:grid-cols-2 xl:grid-cols-3` |
| Card padding | `p-5` |
| Card internal gap | `gap-3 flex flex-col` |
| Table cell padding | `px-3 py-2.5` |

---

## 4. Border Radius

| Component | Class | px equiv |
|---|---|---|
| **Job card** | `rounded-xl` | 12px — **changed from `rounded-2xl`** |
| Company avatar | `rounded-xl` | 12px — matches card |
| Tab pills / chips | `rounded-full` | pill |
| Apply button | `rounded-lg` | 8px |
| Table container | `rounded-xl` | 12px |
| Type badge | `rounded-full` | pill |
| Skeleton bars | `rounded-full` | pill |
| Skeleton blocks | `rounded-xl` | 12px |
| Pagination buttons | `rounded-lg` | 8px |

---

## 5. Shadows

Direction A is **shadow-free at rest**. Shadows appear only on interaction.

| State | Shadow |
|---|---|
| Card at rest | none |
| Card hover | `hover:shadow-lg hover:shadow-teal-500/5` — existing, keep |
| Tab strip | `shadow-sm` |
| Active pill | `shadow` (Tailwind default) |
| Table container | `shadow-sm` |
| Apply button at rest | none |

---

## 6. Component Specs

### 6.1 Tab Pill (in JobsHubNav)

```
At rest:    px-5 py-2 rounded-full text-xs font-semibold text-neutral-500 hover:text-neutral-900
Active:     px-5 py-2 rounded-full text-xs font-semibold bg-neutral-900 text-white shadow
Press:      active:scale-[0.97] transition-transform duration-100
Focus:      focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white
```

### 6.2 Filter Chip (in JobBoard)

```
At rest:    px-3 py-1.5 rounded-full text-[11px] font-medium border border-neutral-200
            bg-white text-neutral-500
            hover:border-neutral-400 hover:text-neutral-900
            transition-colors duration-100
Active:     bg-neutral-900 text-white border-neutral-900
            hover:bg-neutral-800
```

No per-category colors. All chips are neutral. The type badge on each card (Full-time / Internship) already provides category color signal.

### 6.3 Apply Button (in JobCard)

```
w-full py-2.5 rounded-lg text-sm font-semibold
border border-neutral-300 bg-white text-neutral-900
hover:bg-teal-600 hover:text-white hover:border-teal-600
transition-colors duration-200
```

This replaces the current `bg-neutral-900` solid button. At rest it's ghost/outlined; on hover it fills teal. This is the primary interaction where teal earns its keep.

### 6.4 Job Card

```
group bg-white border border-neutral-200 rounded-xl p-5
hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5
transition-all duration-200 flex flex-col gap-3
```

Changed: `rounded-2xl` → `rounded-xl`

### 6.5 Company Avatar

```
w-11 h-11 rounded-xl flex items-center justify-center
text-sm font-bold flex-shrink-0
```

Colors remain the existing random-by-initial palette (teal, indigo, rose, amber, etc.) — these are purely decorative identity signals, not teal-constrained.

### 6.6 TabHeader

```html
<div class="mb-8">
  <p class="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-2">
    {region}
  </p>
  <div class="flex items-center gap-3 flex-wrap">
    <h1 class="text-3xl md:text-5xl font-bold text-neutral-900 tracking-tight">
      {label}
    </h1>
    {badge?}
  </div>
  <p class="text-sm text-neutral-500 mt-3 max-w-2xl leading-relaxed">
    {description}
  </p>
</div>
```

Note: `tracking-tight` added to h1 — this is the key Direction A typographic trait.

### 6.7 LiveReadyBadge

```html
<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
             bg-emerald-50 border border-emerald-200 text-emerald-700
             text-[10px] font-semibold shrink-0">
  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
  {text}
</span>
```

### 6.8 Table Header Row

```html
<thead class="bg-neutral-900 text-white sticky top-0 z-10">
  <tr>
    <th class="px-3 py-2.5 text-[10px] font-semibold tracking-[0.04em] whitespace-nowrap">
```

`bg-neutral-900` — matches active pill. This replaces `bg-blue-600` in hr-emails-table.tsx.

### 6.9 Skeleton Bars (EmptyRegionState)

All skeleton fills use `bg-neutral-100 animate-pulse`. No colored skeletons.

### 6.10 Fade Overlays (JobsHubNav)

```
from-neutral-50 to-transparent
```

Must match `BackgroundRippleLayout tone="light"` background (`bg-neutral-50`).

---

## 7. What Changes Per File

| File | What changes |
|---|---|
| `src/components/job-board.tsx` | `rounded-2xl` → `rounded-xl` on cards; Apply button ghost/outlined + teal hover; chip colors all neutral (remove pastel per-category chips) |
| `src/components/hr-emails-table.tsx` | `bg-blue-600` → `bg-neutral-900` on thead |
| `src/components/jobs-hub/JobsHubNav.tsx` | New file — uses `from-neutral-50` fades |
| `src/components/jobs-hub/TabHeader.tsx` | New file — `tracking-tight` on h1 |
| `src/components/jobs-hub/DubaiHrTab.tsx` | New file — `bg-neutral-900` thead, `text-teal-600` links |
| `src/components/sidebar-demo.tsx` | Remove inner toggle only (no style changes) |
| `app/job-tracker/page.tsx` | Wire new nav — no style changes |

### Explicitly NOT changing
- `job-board.tsx` company avatar palette (decorative, not teal)
- Type badges (emerald/violet/amber) — functional, isolated
- `BackgroundRippleLayout` — affects whole app, not in scope
- `Navbar` — not in scope
- Any resume/optimizer/portfolio routes

---

## 8. Animation Tokens

| Animation | Value |
|---|---|
| Tab pill morph | `spring { duration: 0.35, bounce: 0.12 }` |
| Tab content in | `opacity 0→1, y 8→0, duration 0.22s, ease [0.23, 1, 0.32, 1]` |
| Tab content out | `opacity 1→0, y 0→-4, duration 0.22s` |
| Card hover | `transition-all duration-200` (CSS, not Motion) |
| Apply hover | `transition-colors duration-200` |
| Chip hover | `transition-colors duration-100` |
| Fade overlay | `transition-opacity duration-200` |
| Skeleton | `animate-pulse` (Tailwind — CSS animation) |
| Reduced motion | y=0 on all transforms, spring → instant snap |

---

## 9. Centralized Primitive Checklist

Before any subagent writes component code, verify these shared primitives exist:

- [ ] `.scrollbar-hide` in `src/index.css`
- [ ] `src/components/jobs-hub/tabs.config.ts` — TabId, TabConfig, TABS
- [ ] `src/components/jobs-hub/LiveReadyBadge.tsx`
- [ ] `src/components/jobs-hub/TabHeader.tsx` (with `tracking-tight`)
- [ ] `src/components/jobs-hub/EmptyRegionState.tsx`

Every new tab component **imports from these**. No subagent creates its own badge, header, or skeleton.
