# JobFlix × Ledger Design System — Migration Notes (Phase 1)

**Status:** Research / audit only. **No UI has been changed.**
**Date:** 2026-07-04
**Author context:** Prepared for the JobFlix repositioning of the ResumeAssist frontend.
**Visual source of truth:** `Ledger Design System.html` (repo root).
**Scope of this file:** Documentation only. This document does not modify any component, route, or token file.

---

## 0. Why this document exists

The product is being unified and repositioned as **JobFlix** — a career operating system.
ResumeAssist should stop reading as a standalone resume-builder and instead read as **one module inside JobFlix**.

The **Ledger Design System** is the chosen visual source of truth: a calm, high-contrast system built for dense financial/data tooling — warm neutrals, near-black ink, and a single electric indigo accent. That "engineered for dense data, calm, one accent" ethos maps cleanly onto JobFlix's actual surface area (jobs, application tracking, HR outreach, referrals, memberships).

This file captures:
1. Extracted Ledger design tokens & principles.
2. Reusable Ledger component patterns.
3. An audit of where the current ResumeAssist frontend conflicts with Ledger.
4. A recommended revamp direction.
5. Brand migration notes (ResumeAssist → JobFlix).
6. What must **not** change yet.

> **Note on tooling:** The repo advertises a `code-review-graph` MCP and `context-mode` MCP. For this audit I used direct file inspection (Read/Glob) because the task is a bounded design read of specific known files. No preferred plugin was required or unavailable; nothing was blocked.

---

## 1. Extracted Ledger design tokens

All values below are lifted directly from the inline styles in `Ledger Design System.html`. Hex is authoritative.

### 1.1 Color — Neutrals (warm, ink-forward)

| Token | Hex | Usage in Ledger |
|---|---|---|
| Canvas | `#F4F2ED` | Page background (warm off-white) |
| Surface | `#FFFFFF` | Cards, modals, dropdowns, inputs |
| Sunken | `#EBE8E1` | Segmented-control track, hover rows, inset areas |
| Border | `#E1DDD3` | Default 1px borders, dividers |
| Border (strong) | `#D6D1C6` | Slightly heavier borders |
| Row hover | `#F8F6F1` | Table row hover, dialog footer fill |
| Ink / 40 | `#9A9C9F` | Disabled text, faint captions |
| Ink / 70 | `#5B5D63` | Secondary / muted body text |
| Ink | `#16181D` | Primary text, headings, dark buttons |
| Dark | `#121316` | Deepest surface |
| Mono caption ink | `#8A8C90` | Monospace eyebrow/label text |

### 1.2 Color — Accent (single electric indigo)

| Token | Hex | Usage |
|---|---|---|
| Accent | `#5A4BEB` | Primary CTA fill, active tab underline, focus, progress, section-number text |
| Accent / hover | `#4A3BD6` | Hover on primary CTA |
| Accent / soft | `#E7E4FC` | Soft accent background (chips, icon tiles, selected menu row) |
| Accent / ink | `#2A2072` | Text on accent-soft backgrounds |

### 1.3 Color — Status (muted, earthy — not neon)

| State | Ink | Soft background |
|---|---|---|
| Success | `#2E7D53` | `#DCEEE2` |
| Warning | `#B7791F` | `#F6ECCF` |
| Danger | `#C0392B` | `#F3D9D5` |
| Info | `#2F6FB0` | `#D8E6F2` |

Status colors are deliberately desaturated (earthy green/ochre/brick/steel-blue), consistent with the "calm financial" tone. No pure `#22c55e`/`#ef4444`-style neons.

### 1.4 Typography

Two families only:

| Role | Family | Where |
|---|---|---|
| Text | **Hanken Grotesk** (400/500/600/700/800) | Headings, body, buttons, labels |
| Data & labels | **JetBrains Mono** (400/500/600) | Eyebrows, captions, numeric data cells, version tags, section numbers |

Type scale (from the specimen block):

| Style | Size / weight | Tracking / leading |
|---|---|---|
| Display | 62px / 700 | `-0.03em`, line 1.02 |
| Heading 1 | 40px / 700 | `-0.02em`, line 1.05 |
| Heading 2 | 30px / 600 | `-0.02em` |
| Heading 3 | 22px / 600 | `-0.01em` |
| Body Lg | 18px / 400 | line 1.5 |
| Body | 16px / 400 | line 1.55 |
| Small | 14px / 500 | — |
| Mono caption | 12px / 500 | `0.12em`, `UPPERCASE`, color `#8A8C90` |

**Signature move:** monospace is a load-bearing part of the identity. Eyebrows, table headers, numeric amounts, timestamps, version chips, and section numbers are all JetBrains Mono with wide letter-spacing. This is what makes Ledger read as "instrument for data" rather than generic SaaS.

### 1.5 Spacing (base-4 scale)

`4 (xs) · 8 (sm) · 16 (md) · 24 (lg) · 48 (xl) · 96 (2xl)`

Section rhythm: large `hr` dividers (1px `#E1DDD3`) with `64px` vertical margin between major sections. Section heading blocks sit ~28px above their content.

### 1.6 Radius

| Token | Value | Applies to |
|---|---|---|
| sm | `6px` | Small inline chips, section-number badge |
| md | `10px` | Inputs, dropdown items, list rows, small icon tiles |
| lg | `16px` | Cards, dialogs, alerts, tables |
| pill | `999px` | **Buttons**, badges, toggles, segmented control, avatars, pagination-adjacent pills |

### 1.7 Elevation (cool-tinted, low)

| Token | Shadow |
|---|---|
| sm | `0 1px 2px rgba(20,20,25,.06)` |
| md | `0 4px 12px rgba(20,20,25,.08)` |
| lg | `0 14px 34px rgba(20,20,25,.14)` |
| dialog | `0 24px 60px rgba(20,20,25,.22)` |

Shadows are subtle and near-neutral. No colored glows, no neon drop-shadows.

### 1.8 Layout

- Content column: `max-width: 1120px`, horizontal padding `40px`.
- Masthead: brand lockup = 26px `#16181D` rounded-7px square containing an 11px `#5A4BEB` rounded-3px square, wordmark, then a **mono pill version tag** (`border #E1DDD3`, `#8A8C90` text).
- Each section is introduced by a numbered **mono badge** (`01`, `02`…) rendered as accent-indigo text on an ink `#16181D` chip, beside a 28px/700 title and a muted one-line description.

---

## 2. Ledger visual principles

1. **One accent, held in reserve.** Indigo `#5A4BEB` is the only saturated color. It marks primary action, active state, focus, and progress — nothing decorative. Everything else is warm neutral + ink.
2. **Warm paper, near-black ink, high contrast.** Canvas is `#F4F2ED`, not pure white; text is near-black `#16181D`. The result reads calm but legible.
3. **Monospace is the instrument.** Data, labels, and metadata are JetBrains Mono with wide tracking. This signals precision and "dense data tooling."
4. **Pills for action, soft-radius for containers.** Buttons/badges/toggles are fully rounded; cards/dialogs/tables use 16px.
5. **Quiet elevation.** Low, cool, neutral shadows. No glow, no gradient neon, no ripple.
6. **Status is earthy, not electric.** Muted green/ochre/brick/steel.
7. **Structured, numbered sections.** Mono section numbers + eyebrows create a documentation-grade rhythm.
8. **Restraint over decoration.** Motion and ornament are minimal; the system trusts type, spacing, and one accent.

---

## 3. Reusable Ledger component patterns

Descriptions are what to reproduce, not literal code (implementation is Phase 2+).

### 3.1 Buttons (pill)
- **Primary:** indigo `#5A4BEB` fill, white text, `font-weight 600`, `~11px 22px` padding, `border-radius 999px`; hover `#4A3BD6`.
- **Dark:** `#16181D` fill, `#F4F2ED` text (e.g. "Contact sales").
- **Secondary:** white fill, `1px #E1DDD3` border, ink text; hover fill `#EBE8E1`.
- **Ghost:** transparent, ink text; hover fill `#EBE8E1`.
- **Disabled:** `#EBE8E1` fill, `#9A9C9F` text, `not-allowed`.
- **Small:** `13px` text, `~7px 15px` padding.
- **Status pills:** approve = `#2E7D53` on `#DCEEE2`; decline = `#C0392B` on `#F3D9D5`.

### 3.2 Badges & chips
- Pill, `13px/600`, soft-bg + colored-ink pairing, optional leading status dot (6px).
- Removable chip: white fill + `1px #E1DDD3` border + trailing circular `×` on `#EBE8E1`.

### 3.3 Inputs & controls
- Input: white fill, `1px #E1DDD3`, `10px` radius, `~11px 14px` padding; focus border → `#16181D`.
- Search field: input with leading muted glyph inside the bordered container.
- Toggle: `38×22` pill track; on = `#5A4BEB`, off = `#E1DDD3`; 18px white knob.
- Segmented control: `#EBE8E1` pill track, active segment = white pill with `sm` shadow.
- Checkbox: `20px`, `6px` radius, checked = `#5A4BEB` with white check. Radio: `20px` circle, checked = 5px indigo ring.
- Select menu: trigger with `1.5px #5A4BEB` border when open; popover uses `lg` shadow, selected row = `#E7E4FC` / `#2A2072`, other rows hover `#F4F2ED`.

### 3.4 Cards
- **Standard:** white, `1px #E1DDD3`, `16px` radius, `sm` shadow, `~22px` padding.
- **Stat card:** mono eyebrow + status pill delta, 36px/700 numeral, muted subtitle, thin multi-segment progress bar (indigo/ink/border).
- **Feature card (inverted):** `#16181D` fill, `#F4F2ED` text, indigo icon tile top-left.
- **List card:** white container padding `8px`, rows with `34px` rounded-9px colored initial tiles, hover row `#EBE8E1`.

### 3.5 Data table
- `16px` rounded container, `1px #E1DDD3`, `sm` shadow, `overflow hidden`.
- Header row `#F8F6F1`; header cells = **mono, 11px, `0.08em`, uppercase, `#8A8C90`**.
- Body rows separated by `1px #EEEBE4`; numeric cells in mono; status column uses status pills; row hover `#F8F6F1`.

### 3.6 Alerts / banners
- `12px` radius, soft status bg + matching hairline border, circular status glyph badge, bold title + muted detail line. One variant per status color.

### 3.7 Navigation & feedback
- **Tabs:** bottom-border row; active tab = ink text + `2px #5A4BEB` underline; inactive = `#8A8C90`.
- **Breadcrumb:** muted segments / `#16181D` bold current.
- **Pagination:** `34px` rounded-9px cells; active = indigo fill white text; others white + `1px #E1DDD3`.
- **Tooltip:** `#16181D` fill, `#F4F2ED` text, `8px` radius, small caret.
- **Progress/meters:** `8px` track `#E1DDD3`, fill indigo (or warning ochre); mono percentage; spinner = indigo top on `#E1DDD3` ring.
- **Dialog:** `16px` radius, `dialog` shadow, indigo icon tile, title + muted body, footer on `#F8F6F1` with divider, secondary + primary pill actions.

---

## 4. Current ResumeAssist frontend audit

Files inspected: `app/page.tsx`, `src/components/AnimatedPinDemo.tsx`, `src/components/hero-section.tsx`, `src/components/navbar.tsx`, `src/components/button.tsx`, `src/components/ui/badge.tsx`, `src/index.css`, `docs/design-system/resumeassist-ui-guidelines.md`.

### 4.1 What already aligns with Ledger (leverage these)

- **Warm off-white canvas.** `--app-bg: #fbfbf8` is a warm off-white, conceptually the same intent as Ledger `#F4F2ED`. Near-black ink `--app-ink: #0b0b0b` ≈ Ledger `#16181D`.
- **A near-Ledger indigo already exists.** `src/index.css` ships a **"Jobs Hub Design System v2 (Direction 1 — Sharp)"** token block with `--color-hub-accent: oklch(0.520 0.220 278)` — an electric indigo/violet extremely close to Ledger's `#5A4BEB`, plus `--color-hub-salary` (earthy green) and `--color-hub-warn` (ochre) that mirror Ledger's muted status palette. **The Jobs Hub subsystem is already ~80% Ledger-aligned.** This is the single biggest migration lever.
- **Card structure is close.** Existing guidelines already prescribe `rounded-xl`/`rounded-2xl` white cards with `1px neutral-200` borders and subtle `shadow-sm`/`shadow-md`, `hover:border-neutral-300` — the same shape language as Ledger cards (only radius + border warmth differ).
- **Eyebrow labels exist** (`text-xs uppercase tracking-[0.3em]`) — the same idea as Ledger mono eyebrows, just not monospace yet.
- **Motion is already restrained** (subtle `-translate-y-0.5` lifts, `easeOut`, no elastic springs per §9 of the current guidelines) — compatible with Ledger's calm ethos.
- **The IA is already a career OS.** The navbar exposes Jobs (Find Jobs, Job Tracker, HR Emails, Dubai HR, Gulf Jobs, AU & NZ), Learn (Courses, Prepare, Interview Questions), Referrals, Pricing, Blog — and links out to `jobflix.in` / `NEXT_PUBLIC_JOBFLIX_VIEW`. The product is structurally already JobFlix-shaped.

### 4.2 Where it conflicts with Ledger

| Area | Current ResumeAssist | Ledger | Severity |
|---|---|---|---|
| **Primary accent** | Amber `#f59e0b` primary CTA (per guidelines §5) + teal/cyan gradients in hero + Jobs Teal `#0D9488` accent | Single indigo `#5A4BEB` | **High** — competing accents, no unified brand color |
| **Hero styling** | Teal→cyan gradient headline text, teal/sky blurred blobs, floating glow badges (`shadow-teal-500/30`), gradient "Generate with AI" pill | Calm, flat, one accent, no glow/gradient | **High** — directly violates Ledger restraint |
| **Landing effects** | Aceternity stack: `BackgroundRippleLayout`, `lamp`, `3d-pin`, `hero-highlight`, `spotlight`, `macbook-scroll`, gradient slate CTA card | No ripple/lamp/spotlight/glow | **High** — decorative ornament Ledger avoids |
| **Buttons** | `rounded-lg`/`rounded-xl`; guidelines explicitly say pills are for badges only; primary `Button` (`button.tsx`) is white-on-black with white glow shadows + `ring-purple-500` focus | Fully **pill** buttons; indigo focus | **High** — shape + focus color mismatch |
| **Typography** | Space Grotesk (display) + Manrope (body); Plus Jakarta on Jobs Hub; **no monospace** anywhere; extra Source Sans/Serif imports | Hanken Grotesk + JetBrains Mono (mono is core) | **High** — missing the mono "instrument" signature |
| **Color remap hack** | `@theme` **remaps `teal-*`/`green-*`/`purple-*` Tailwind utilities to warm grays**; real teal only via `bg-jobs-teal` | Standard palette, no remap; indigo is real indigo | **High** — a footgun that will fight a real indigo accent; `purple-*` is neutralized, so Ledger indigo can't ride `purple-*` |
| **Status colors** | `emerald-600` success, `amber-500` warning, "error not defined" | Muted `#2E7D53`/`#B7791F`/`#C0392B`/`#2F6FB0` incl. defined danger + info | **Medium** — brighter, incomplete set |
| **Badge accent** | `Badge` default + `brand` variants are teal (`bg-teal-600`, `bg-teal-50 text-teal-700`) | Indigo/soft-indigo + earthy status | **Medium** |
| **Border warmth** | `neutral-200 #e5e5e5` (cool-neutral) for most borders | Warm `#E1DDD3` | **Low/Medium** — subtle warmth loss |
| **Brand mark & name** | `/logo.png` alt **"ResumeAssist AI"** in navbar + footer; footer says "© ResumeAssist AI" and "future of resume building" | Should read as JobFlix | **High (brand)** |
| **Two button systems** | `components/button.tsx` (dark-bg, glow) **and** `components/ui/button.tsx` (amber primary) | One coherent button system | **Medium** — duplication/inconsistency |

### 4.3 Brand-identity conflicts (feels like ResumeAssist, not JobFlix)

- Navbar and footer logo alt text and copyright are **"ResumeAssist AI"**; footer tagline is "The future of resume building is here."
- Copy centers the resume artifact ("2k resumes created today", "Optimize My Resume", "Create AI Resume Now") rather than the broader career OS.
- The 3D-pin CTA already gestures at the unified product ("careerSprint", "Our Career, End-to-End", links to `jobflix.in/jobs`) — but it's a one-off card, not the frame of the whole page.
- Result: the career-OS navigation is present, but the **hero + framing still sell a standalone resume tool**. The page needs to lead with JobFlix and position resume/optimize as one module.

---

## 5. Recommended revamp direction (proposal only — do not implement in Phase 1)

Ordered from foundation → surface.

1. **Adopt Ledger tokens as the global system.** Introduce Ledger's neutrals, indigo accent, and earthy status colors as first-class tokens. The cleanest path is to **promote the existing `--color-hub-*` block to the global brand tokens** (it already encodes the indigo accent + earthy status) and align the neutral scale to Ledger's warm values (`canvas #F4F2ED`, `border #E1DDD3`, `ink #16181D`, `muted #5B5D63`).
2. **Retire the Tailwind color-remap hack.** The `@theme` remap of `teal-*`/`green-*`/`purple-*` → warm gray must be unwound before a real indigo accent can exist safely. This is a coordinated change (touches every page relying on the remap) — plan it as its own migration step, not a drive-by.
3. **Introduce JetBrains Mono for data/labels/eyebrows.** Add it as `--font-mono`/`--font-data`; convert eyebrows, table headers, numeric/stat values, timestamps, and badges/version tags to mono. This alone shifts the product toward the Ledger "instrument" feel.
4. **Move text type toward Hanken Grotesk** (or keep a Grotesk that matches Ledger's proportions) and **drop unused font imports** (Source Sans/Serif) to reduce drift.
5. **Unify buttons on the Ledger pill system.** Consolidate `button.tsx` + `ui/button.tsx` into one component with: primary (indigo pill), dark, secondary (bordered), ghost, and status variants; indigo focus ring (replace `ring-purple-500`).
6. **Calm the hero and landing.** Replace teal/cyan gradients, blurred blobs, and glow badges with flat Ledger surfaces, one indigo accent, and mono metadata. Reserve/retire the ripple/lamp/spotlight/3d-pin ornament on the primary marketing path (keep where genuinely useful, e.g. a single product moment).
7. **Warm the borders and shadows** to Ledger values (`#E1DDD3`, cool low shadows).
8. **Reframe as JobFlix.** Lead the page with the JobFlix career-OS narrative; present Resume/Optimize, Jobs, Learn, Referrals as modules of one system. Update logo, alt text, footer, and copyright.
9. **Rewrite the design guardrail doc** (`docs/design-system/resumeassist-ui-guidelines.md`) once tokens change — its current core principle ("do not introduce indigo/purple/blue/violet") is the **exact inverse** of the Ledger target and will actively block the migration if left in force.

**Suggested sequencing:** tokens (1–2) → typography (3–4) → primitives (5) → surfaces (6–8) → docs (9). Land tokens + docs first so subsequent UI work has a correct target.

---

## 6. Brand migration notes — ResumeAssist → JobFlix

- **Positioning:** JobFlix is the parent brand and the "career operating system." ResumeAssist becomes the **resume/optimize module** inside JobFlix — same as Jobs, Learn, Referrals, Job Tracker, HR Emails.
- **Naming/marks to change (Phase 2+):** navbar logo + `alt`, footer logo + `alt`, footer copyright ("© 2024 ResumeAssist AI"), footer tagline, and hero copy that centers "resume" as the whole product.
- **Assets:** `/logo.png` is the ResumeAssist mark; a JobFlix mark/lockup will be needed. Ledger's lockup pattern (ink rounded square + inner indigo square + wordmark + mono version/label pill) is a strong reference for a JobFlix mark.
- **Already-JobFlix plumbing (keep):** `NEXT_PUBLIC_JOBFLIX_VIEW` auth/profile/membership links, `jobflix.in` course/opportunity/prepare links, and the "careerSprint / Our Career, End-to-End" CTA. These confirm the unification is already underway at the routing/auth layer — the visual layer just needs to catch up.
- **Voice:** Ledger's "calm, precise, data-forward, one confident accent" translates well to JobFlix ("run your whole job search from one place") — lead with the system, not the artifact. Avoid hype/glow language in favor of concrete, instrument-like copy.
- **Tone bridge:** Ledger's tagline energy ("Time is money. Save both.") is a good model for a JobFlix line that frames the OS, not the resume.

---

## 7. What should NOT change yet (Phase 1 guardrails)

- **Do not edit landing page UI** (`app/page.tsx`, `AnimatedPinDemo`, `hero-section`, `navbar`, or any section component). Audit only.
- **Do not touch `src/index.css` tokens or `@theme`** — including the color-remap and the `--color-hub-*` block. The remap unwind is a coordinated migration, not a Phase-1 edit.
- **Do not add packages** (no new font packages, no design libs). Font adoption is a Phase-2 decision.
- **Do not refactor components** — including consolidating the two button systems or replacing the Aceternity effects.
- **Do not rewrite `docs/design-system/resumeassist-ui-guidelines.md` yet.** It still governs current pages; it should be revised only once new tokens are agreed, so live pages don't lose their guardrail mid-flight.
- **Do not swap brand marks / copy yet.** Logo, alt text, footer, and copyright changes are Phase-2 brand work.
- **Do not change auth pages** (`/login`, `/register`, `/onboarding`) — explicitly out of scope of the current system and unaudited here.
- **Blast radius of Phase 1 = this file only.**

---

## 8. Open questions to resolve before Phase 2

1. **Fonts:** adopt Hanken Grotesk exactly, or keep a near-equivalent already loaded? And confirm JetBrains Mono is in-scope for data/labels.
2. **Canvas:** move to Ledger `#F4F2ED`, or keep the slightly cooler `#fbfbf8`?
3. **Remap unwind:** is there appetite to remove the `teal/green/purple` → gray remap now, or should the Ledger accent be introduced under a **new** token namespace (e.g. `brand-*` / promoted `hub-*`) to avoid a repo-wide sweep first?
4. **Ornament:** fully retire ripple/lamp/spotlight/3d-pin, or preserve one signature moment?
5. **Doc governance:** replace `resumeassist-ui-guidelines.md` with a JobFlix-Ledger guideline, or supersede it with a new file and deprecate the old?
6. **Scope of first visual pass:** landing page only, or landing + Jobs Hub (which is already closest to Ledger)?
