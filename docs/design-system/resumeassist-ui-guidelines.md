# ResumeAssist UI Guidelines

**Version:** 1.0 — June 2026
**Source of truth:** Landing page (`AnimatedPinDemo`) and current non-auth product pages.
**Auth pages (login, register, onboarding) are excluded from this system for now.**

---

## 1. Purpose

This file is the **official UI reference** for all future Claude, Codex, or human agents working on ResumeAssist pages.

**Read this file before touching any page UI.**

It captures the design tokens, component rules, and layout conventions extracted from the live landing page and product pages. Its goal is to prevent visual inconsistency — random indigo buttons on one page, purple cards on another, arbitrary shadows that don't match anything else.

When in doubt: match the landing page. If a pattern exists there, use it. If a pattern does not exist there, ask before inventing one.

---

## 2. Core Principle

ResumeAssist uses a **warm neutral SaaS design system**.

The palette is intentionally restrained: off-white backgrounds, near-black text, warm gray borders, and a near-black primary CTA. The one genuine accent colour is Jobs Teal (`#0D9488`), used sparingly for active states, badges, and the jobs feature area.

### Rules

- **Do not introduce indigo, purple, blue, or violet** unless those utilities are already present on the page you are editing. They are not part of the core system.
- **Do not copy hex values from screenshots or design references.** Screenshots are layout and structure inspiration only. Always use the tokens listed in §4.
- **Do not assume Tailwind colour utilities map to their standard colours in this project.** See the critical warning in §4.
- **Do not add decorative gradients, glow effects, or neon accents** that are not already on the landing page.

---

## 3. Typography

### Font Families

| Role | Family | CSS Variable | Where applied |
|---|---|---|---|
| **Display** (headings) | `"Space Grotesk", "Segoe UI", sans-serif` | `--font-display` | All `h1`–`h6` via `@layer base` |
| **Body** | `"Manrope", "Segoe UI", sans-serif` | `--font-body` | `html`, `body`, form elements |
| **Jobs Hub exception** | `"Plus Jakarta Sans", -apple-system, sans-serif` | `--font-hub` | Jobs Hub pages only — do not propagate elsewhere |

Both display and body fonts are loaded via Google Fonts in `src/index.css`. Do not add additional font imports.

Apply `.font-display` or `.font-body` utility classes when you need to override the inherited family on a specific element.

### Heading Sizes (landing page scale)

| Element | Mobile | `md:` | `lg:` | Approx px (lg) |
|---|---|---|---|---|
| `h1` — page hero | `text-4xl` | `text-5xl` | `text-[3.25rem]` | 52px |
| `h2` — section titles | `text-3xl` | `text-5xl` | — | 48px |
| `h3` — card/pricing titles | `text-lg` | — | — | 18px |

`h1` and `h2` use `font-bold` (700) with `leading-[1.1]` and `tracking-tight`.
`h3` uses `font-semibold` (600).

### Body / UI Sizes

| Use | Size class | px |
|---|---|---|
| Body prose, descriptions | `text-base` → `md:text-lg` | 16–18px |
| Section eyebrow label | `text-xs uppercase tracking-[0.3em]` | 12px |
| Card description, feature text | `text-sm` | 14px |
| Meta / caption | `text-xs` | 12px |
| Micro label | `text-[10px]` | 10px |

### Font Weights

| Weight | Class | Usage |
|---|---|---|
| 400 | `font-normal` | Body prose, descriptions |
| 500 | `font-medium` | Nav links, secondary labels |
| 600 | `font-semibold` | Buttons, card titles, badge text, nav CTAs |
| 700 | `font-bold` | `h1`, `h2`, statistics, price numerals |

---

## 4. Colors

### ⚠️ Critical Warning: Tailwind Colour Remapping

In `src/index.css`, the `@theme` block **remaps** the standard Tailwind `teal-*`, `green-*`, and `purple-*` utility families to the app's warm neutral scale:

```
bg-teal-500   →  --app-neutral-500  →  #8a8981  (warm mid-gray, NOT green-teal)
bg-teal-600   →  --app-neutral-600  →  #6a6a62  (warm dark gray)
bg-teal-50    →  --app-bg           →  #fbfbf8  (off-white)
border-teal-300 → --app-neutral-300 →  #d2d1c8  (warm light gray)
```

`text-teal-600` is **not** real teal in this project. It is a warm gray.

The `neutral-*` utilities (e.g. `bg-neutral-900`, `text-neutral-500`) use Tailwind v4 defaults and are **not** remapped. Use these freely for UI chrome.

The only genuine teal-green accent is `#0D9488`, accessed via `bg-jobs-teal` / `text-jobs-teal` / `--color-jobs-teal`.

---

### Official Color Tokens

#### Page & Surface

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| Page background | `--app-bg` | `#fbfbf8` | `html`, `body`, section backgrounds |
| Surface / card | `--app-surface` / `--card` | `#ffffff` | Cards, modals, dropdowns |

#### Text

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| Primary text | `--app-ink` | `#0b0b0b` | Body copy, headings |
| Muted text | `--app-muted` | `#5f6368` | Descriptions, captions |
| Muted foreground (shadcn) | `--muted-foreground` | `#71717a` | Placeholder-level text |

#### Borders

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| App border | `--app-border` | `#e6e6e3` | Cards, dividers, input borders |
| shadcn border | `--border` | `#e4e4e7` | shadcn components |
| Tailwind `neutral-200` | — | `#e5e5e5` | Inline border utilities |

Use `border-neutral-200` or `border` (shadcn) interchangeably for card/input borders. They resolve to nearly identical values.

#### Primary / CTA

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| App primary CTA | — | `#f59e0b` (`bg-amber-500`) | Primary action buttons — `variant="primary"` |
| Primary CTA hover | — | `#fbbf24` (`bg-amber-400`) | Hover state on primary buttons |
| Primary CTA text | — | `#020617` (`text-slate-950`) | Text on amber CTA backgrounds |
| shadcn primary | `--primary` | `#18181b` | shadcn `variant="default"`, toggles only |
| Primary foreground | `--primary-foreground` | `#fafafa` | Text on `variant="default"` backgrounds |

#### Accent (Jobs Teal — use sparingly)

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| Jobs Teal | `--color-jobs-teal` | `#0D9488` | Teal badges, hover CTA on pricing, job feature icons |
| Jobs Teal light | `--color-jobs-teal-light` | `#99F6E4` | Teal tints (rare) |

#### Warm Neutral Scale (drives all `teal-*` / `green-*` / `purple-*` utilities)

Use these when you need the warm neutral palette explicitly via CSS variables. Prefer the Tailwind `neutral-*` utilities for standard UI chrome.

| Level | Hex |
|---|---|
| 50 / page bg | `#fbfbf8` |
| 100 | `#f5f5f1` |
| 200 / border | `#e6e6e3` |
| 300 | `#d2d1c8` |
| 400 | `#b0afa6` |
| 500 | `#8a8981` |
| 600 | `#6a6a62` |
| 700 | `#4a4a44` |
| 800 | `#2f2f29` |
| 900 / accent | `#111111` |
| 950 / ink | `#0b0b0b` |

#### Semantic States (inline utilities only — no CSS variables defined)

| State | Utility | Hex |
|---|---|---|
| Success | `text-emerald-600` | `#059669` |
| Warning | `text-amber-500` | `#f59e0b` |
| Error | Not defined — do not invent one |

---

## 5. Buttons

Two button systems are in use. Choose based on context.

### Which to use

- **`src/components/button.tsx`** — custom button, designed for use on dark/colored backgrounds (hero, navbar). Variants: `default` (white), `outline`, `ghost`, `secondary`.
- **`src/components/ui/button.tsx`** — shadcn button, for use on white/neutral page backgrounds. Variants: `primary` (amber), `default` (near-black, toggles only), `outline`, `secondary`, `ghost`, `destructive`.

### Rules

- **Border radius:** `rounded-lg` (8px) or `rounded-xl` (12px). Use `rounded-full` only for pill badges and icon-only buttons.
- **Font weight:** always `font-semibold` (600).
- **Do not use random indigo, violet, or blue** for button backgrounds.

### Size Reference

| Size | Height | Padding | Font size | Radius |
|---|---|---|---|---|
| Small | `h-9` (36px) | `px-4` | `text-sm` | `rounded-lg` |
| Medium (default) | `h-10` or `h-11` (40–44px) | `px-4`–`px-6` | `text-sm`–`text-base` | `rounded-xl` |
| Large (hero CTA) | `h-12` (48px) | `px-6` | `text-base` | `rounded-lg` |
| XL (custom component lg) | `h-14` (56px) | `px-8` | `text-lg` | `rounded-xl` |

### Primary CTA Pattern

ResumeAssist primary CTAs use amber (`bg-amber-500 / #f59e0b`) via `variant="primary"` on `src/components/ui/button.tsx`. Near-black (`bg-neutral-900`) is no longer the default primary CTA color.

```tsx
// Amber primary — use for all primary CTA actions on white/neutral backgrounds
<Button variant="primary" className="rounded-xl h-11 px-6">
  Get Started
</Button>

// Outline secondary
<Button variant="outline" className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-xl h-11 px-6 font-semibold">
  Learn More
</Button>
```

---

## 6. Inputs

Source: `src/components/ui/input.tsx`

```
height:           h-10  (40px)
border-radius:    rounded-lg  (8px)
border:           border border-neutral-200  (#e5e5e5)
focus border:     focus:border-neutral-400   (#a3a3a3)
focus ring:       focus:ring-2 focus:ring-neutral-900/10
background:       bg-white
font-size:        text-sm  (14px)
text color:       text-neutral-900
placeholder:      placeholder:text-neutral-400
padding:          px-3 py-2  (12px / 8px)
transition:       transition-colors
```

Always use the shared `<Input />` component. Do not create ad-hoc `<input>` elements with different styles.

---

## 7. Cards

Two tiers of card radius are in use. Choose based on the visual weight of the context.

### Standard Card (shadcn `<Card />`)

Use for contained data panels, form sections, settings blocks.

```
background:     bg-white
border:         border border-neutral-200
border-radius:  rounded-xl  (12px)
shadow:         shadow-sm
padding:        py-6 (container) / px-6 (header, content, footer)
```

### Feature / Content Card (landing page pattern)

Use for feature showcase cards, job cards, referral profile cards, why-us cards.

```
background:     bg-white  (or bg-neutral-50 for lower-emphasis cards)
border:         border border-neutral-200
border-radius:  rounded-2xl  (16px)
shadow:         none by default
hover shadow:   hover:shadow-xl hover:shadow-neutral-900/5
hover border:   hover:border-neutral-300
padding:        p-5  (20px) or p-6  (24px)
transition:     transition-all duration-200
```

### Pricing Card (payment-section pattern)

```
background:     bg-white
border:         border border-neutral-200  (default) / border-teal-300 (popular)
border-radius:  rounded-2xl  (16px)
shadow:         shadow-md  (default) / shadow-xl shadow-teal-500/10  (popular)
padding:        p-7  (28px)
```

Note: `border-teal-300` here resolves to warm neutral `#d2d1c8` due to remapping. The visual result is a slightly warmer, stronger border — not a green teal border.

---

## 8. Layout

### Container Widths

| Context | Class | Max width |
|---|---|---|
| Full-bleed sections (hero, features) | `max-w-7xl mx-auto` | 1280px |
| Focused sections (pricing, jobs, why-us) | `max-w-6xl mx-auto` | 1152px |
| Narrow prose / descriptions | `max-w-2xl mx-auto` | 672px |
| Feature subtext, subtitle | `max-w-xl mx-auto` | 576px |

### Horizontal Padding

```
Standard:  px-4                        (16px, all breakpoints)
Navbar:    px-4 sm:px-6 lg:px-8       (16 → 24 → 32px)
Hero:      px-6                        (24px)
```

### Vertical Spacing

```
Standard section:      py-12 px-4     (48px top/bottom)
Slightly taller:       py-14 px-4     (56px top/bottom)
Hero:                  pt-24 pb-12 lg:pt-28 lg:pb-20
Section heading mb:    mb-10  (40px) or mb-12  (48px)
```

### Navbar

```
height:     h-16  (64px)
position:   fixed top-0 left-0 right-0 z-50
style:      backdrop-blur-md, border-b
light tone: bg-white/85 border-slate-200
dark tone:  bg-black/80 border-slate-800
```

### Common Grids

```
Two-column hero:      lg:grid-cols-2 gap-8
Pricing cards:        md:grid-cols-2 lg:grid-cols-3 gap-5
Feature / why-us:     sm:grid-cols-2 lg:grid-cols-4 gap-5
Job cards:            grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
```

---

## 9. Motion

**Library:** `motion/react` (Framer Motion v12, imported as `motion`).

```ts
import { motion, AnimatePresence, useInView } from "motion/react";
```

### Standard Transitions

| Use | Duration | Easing |
|---|---|---|
| Color / border changes | `duration-200` | CSS transition |
| Transform (lift, scale) | `duration-300` | CSS transition |
| Scroll-reveal entrance | `0.4–0.6s` | `ease: "easeOut"` |
| Page-element enter | `0.5–0.7s` | `ease: "easeOut"` |
| Navbar slide-in | `0.6s` | `ease: "easeOut"` |
| Spring badges | — | `type: "spring"` |

### Hover Effects

```
Hover lift:       hover:-translate-y-0.5   (subtle — do not use -translate-y-1 or higher)
Active scale:     active:scale-95
Arrow nudge:      group-hover:translate-x-0.5
```

### Scroll Reveal Pattern

```tsx
// Standard section reveal
<motion.div
  initial={{ opacity: 0, y: 24 }}
  animate={inView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.5, ease: "easeOut" }}
>
```

Use `useInView(ref, { once: true, margin: "-60px" })` for section reveals.

### Rules

- Do not use bouncy or elastic spring animations for content cards.
- Do not animate more than `y: 24–30px` for entrance reveals.
- Do not add glow pulse effects, color-changing animations, or opacity flickers on non-interactive elements.
- `AnimatePresence` is reserved for conditional renders (mobile menus, FAQ toggles, tab switches).

---

## 10. Icons

```
Primary library:    lucide-react
Secondary library:  @tabler/icons-react  (installed, available)
Default size:       14px (inline/arrow) to 18px (feature card icons)
Color:              inherits text color — use text-neutral-400, text-neutral-500, text-neutral-900
```

### Icon Container Pattern (feature cards)

```tsx
<div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center mb-5">
  <Icon size={18} className="text-neutral-600" />
</div>
```

Use `bg-teal-50` / `text-teal-600` (warm neutrals) only when the card is in the jobs/feature section where that warm tint is already established.

---

## 11. Page-Specific Guidance: Referrals

The Referrals page (`/referrals`, `/referrals/become-referrer`, `/referrals/list`) should use the global tokens above as its single source of truth.

### Layout

- Wrap content in `max-w-7xl mx-auto px-4` (full sections) or `max-w-6xl mx-auto px-4` (focused lists).
- Use `py-12 px-4` or `py-14 px-4` for top-level sections.
- Profile/referrer cards: use the **Feature Card** pattern from §7 (`rounded-2xl p-5 border border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-xl transition-all duration-200`).

### Colors

- Section headings: `text-neutral-900 font-bold`.
- Descriptions / subtext: `text-neutral-500`.
- Borders: `border-neutral-200`.
- Profile card background: `bg-white`.
- Active / highlighted state: `border-neutral-300` on hover, or `border-jobs-teal` for a genuinely selected referrer.

### Buttons

- "Contact" / "Connect" / primary action buttons: use `variant="primary"` from `src/components/ui/button.tsx` with `className="rounded-xl"`. Do **not** use indigo, purple, violet, or near-black (`bg-neutral-900`) for primary actions.
- Secondary actions: `border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 rounded-lg`.

### Known Inconsistency to Address

If the current Referrals page uses `indigo-*` or `purple-*` Tailwind utilities for buttons or highlights, replace them with `neutral-900` (primary) or `jobs-teal` (accent) equivalents. Screenshots of referral platforms may show blue/purple — **do not copy those colours**. Use the ResumeAssist warm neutral tokens instead.

### Eyebrow Labels (section context labels)

```tsx
<p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Referrals</p>
```

This matches the pattern used in the Pricing and Why Us sections.

---

## 12. Agent Checklist

Before starting any UI work on a non-auth page:

- [ ] Read this file (`docs/design-system/resumeassist-ui-guidelines.md`) in full.
- [ ] Identify which page you are editing. Check whether it already uses `teal-*` utilities and understand they resolve to warm grays, not teal-green.
- [ ] Do not introduce new brand colours (`indigo`, `violet`, `blue`, `rose`, `sky`) without explicit approval.
- [ ] Do not copy hex values from screenshots or external design references. Use only the tokens in §4.
- [ ] Use `neutral-*` utilities for standard UI chrome (borders, shadows, placeholder text, secondary text).
- [ ] Use `jobs-teal` / `--color-jobs-teal` (`#0D9488`) only for genuine teal accents already established in the section context.
- [ ] Keep auth pages (`/login`, `/register`, `/onboarding`) excluded from this system. Do not apply landing-page tokens there without a separate audit.
- [ ] Button labels must be `font-semibold`. Rounded `rounded-lg` or `rounded-xl`. No other radius on buttons.
- [ ] If you make an unavoidable design inconsistency (e.g. a third-party embed that cannot be restyled), document it explicitly in your final report with the reason.
- [ ] Do not modify `src/index.css` or `tailwind.config.*` to add new colour scales without approval.
- [ ] After finishing, verify the page uses consistent spacing (no random `p-3` cards next to `p-7` cards on the same level).

---

## 13. Premium Unlock CTA

Used for gated-feature unlock actions where a logged-in user needs an active membership to access content.

**Current usage:** `src/components/hr-emails-table.tsx` — the "Unlock List" button shown in the paywall overlay on `/hr-emails` and `/dubai-hr`.

Do not refactor `hr-emails-table.tsx` or extract a shared component yet — document here first, reuse later.

### Token values

| Property | Tailwind class | Hex |
|---|---|---|
| Background | `bg-amber-500` | `#f59e0b` |
| Hover background | `hover:bg-amber-400` | `#fbbf24` |
| Text | `text-slate-950` | `#020617` |
| Border radius | `rounded-lg` | `8px` |
| Shadow | `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |

### Reference implementation

```tsx
<a
  href={membershipHref}
  className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap
             rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold
             text-slate-950 shadow-sm hover:bg-amber-400 transition-colors"
>
  Unlock List
  <ArrowRight className="h-3 w-3" />
</a>
```

### Notes

- This amber-on-near-black pairing is intentionally distinct from the primary `bg-neutral-900` CTA — it signals a **premium/monetisation action**, not a standard navigation action.
- `text-slate-950` (`#020617`) provides WCAG AA contrast against `#f59e0b`.
- `amber-500` is **not** remapped by the project's `@theme` block (only `teal-*`, `green-*`, `purple-*` are remapped). It resolves to the standard Tailwind value.
- When this pattern is extracted into a shared component, name it `UnlockCta` or `PremiumCta` and accept `href` + `label` props.
- The `variant="primary"` in `src/components/ui/button.tsx` uses the same amber fill. The distinction is semantic: `variant="primary"` is for all primary actions; the `UnlockCta` reference implementation is the specific membership paywall CTA shape (pill, `shadow-lg shadow-amber-500/20`, `hover:-translate-y-0.5`).

---

## Appendix: Quick Reference Card

```
FONTS
  Display (headings):   Space Grotesk  →  --font-display
  Body:                 Manrope        →  --font-body

PAGE BG:                #fbfbf8   (--app-bg)
CARD BG:                #ffffff
PRIMARY TEXT:           #0b0b0b   (--app-ink)
MUTED TEXT:             #5f6368   (--app-muted)
BORDER:                 #e6e6e3   (--app-border)
SHADCN PRIMARY:         #18181b   (--primary)
CTA / ACCENT:           #111111   (--app-accent)
REAL TEAL:              #0D9488   (--color-jobs-teal)

H1:   text-4xl → md:text-5xl → lg:text-[3.25rem]   font-bold
H2:   text-3xl → md:text-5xl                        font-bold
H3:   text-lg                                        font-semibold
BODY: text-base → md:text-lg                         font-normal

BUTTON RADIUS:   rounded-lg (sm) / rounded-xl (md/lg)
BUTTON WEIGHT:   font-semibold
CARD RADIUS:     rounded-xl (shadcn) / rounded-2xl (feature)
CARD SHADOW:     shadow-sm / shadow-md

CONTAINER:       max-w-7xl (full) / max-w-6xl (focused)
SECTION PADDING: py-12 px-4  to  py-14 px-4
NAVBAR HEIGHT:   h-16  (64px)

MOTION LIBRARY:  motion/react
DURATION:        200ms (color) / 300ms (transform)
EASING:          easeOut
```
