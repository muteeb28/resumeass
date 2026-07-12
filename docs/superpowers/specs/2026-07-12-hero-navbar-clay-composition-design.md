# Hero & Navbar Redesign — Clay Composition, ResumeAssist System

## Goal

Rebuild the homepage's first viewport (navbar + hero + product illustration + trust strip) so its **layout, spacing, hierarchy, and alignment** read as the same class of composition as the Clay.com reference screenshot — while every color, font, button, shadow, radius, and piece of copy remains 100% ResumeAssist's existing design system (the "JobFlix" design language documented in `docs/jobflix-ledger-design-system-notes.md` and the token doc supplied during brainstorming).

**Non-goal:** copying Clay's brand, colors, typography, icons, or literal content. Clay is a *composition* reference only.

## Why this matters (context)

- The current navbar (`src/components/navbar.tsx`) and hero (`src/components/marketing/JobflixHero.tsx`) were built independently: the navbar is a translucent bar floating over a dark `navy-900` hero, has no primary CTA, and uses a hardcoded `max-w-7xl` container that doesn't match the hero's `--jf-container-wide` (1240px).
- The reference composition is one deliberately-designed **light** viewport where the navbar, hero, product visual, and trust strip all share one canvas and one alignment grid. Adopting that composition surfaces (and fixes) the container mismatch and gives the homepage a tighter, more premium first impression without touching any copy.

## Explicit deviations from current conventions (called out on purpose)

1. **Canvas shifts from dark to light.** The existing hero sits on `navy-900` with a translucent navbar over it. This redesign moves the entire first viewport onto ResumeAssist's light surfaces (`--color-page` / `--color-surface-alt`), matching the reference's light composition. The dark `navy-900` gradient theater is **not removed from the design system** — it remains available for other marketing moments — but this specific viewport becomes light. This is an intentional, user-approved deviation, not an oversight.
2. **Hero product visual becomes a 3-card cluster**, not the existing 2-piece `HeroPanel` (dominant panel + one mini sheet). This is a new composition pattern layered on top of the existing primitives (`ProductFrame`, `RowChip`) — it doesn't replace the 1+1 pattern used elsewhere on the page (e.g., `FeatureRow` panels), it adds a second, hero-specific arrangement rule for exactly this spot.

## Navbar

Rebuilt from scratch (not incrementally restyled) as a 3-zone `flex justify-content: space-between` bar: `[logo] [nav links] [actions]`. The symmetric whitespace around the nav-link cluster is emergent from this layout, not manual margins — that's the actual mechanism behind Clay's rhythm.

| Property | Value |
|---|---|
| Container | `--jf-container-wide` (1240px) — replaces today's hardcoded `max-w-7xl` |
| Side padding | `--jf-space-page-padding` (40px) |
| Bar height | 64px (down from 74px) |
| Surface | Sits on the same light canvas as the hero — no translucency, no fixed-over-dark-content trick. Border: drop the static `border-b`; use `shadow-[var(--jf-shadow-frame)]`-style shadow only once scrolled (or omit entirely if that's simpler — no static hairline). |
| Nav link gap | ~36px (up from `--jf-gap-nav`'s 28px) |
| Nav links | Unchanged content: Job Referrals, Jobs ▾ (6-item dropdown), Learn ▾ (4-item dropdown), Pricing, Blog. Dropdown internals get tightened padding to match the new rhythm; items themselves are untouched. |
| Actions (right, in order) | **Log in** (text link) → **Sign up** (ADL primary pill button, sapphire-bright fill, white text, with a trailing `↗` arrow glyph) |
| Actions removed from the bar | "Contact Us" and "Create Resume" no longer appear in the navbar. `Contact Us` needs a new home — **flag for the implementation plan**: check whether a footer contact link already exists; if not, add one there. Do not invent a third navbar action. |
| Login destination | Same as today (`NEXT_PUBLIC_JOBFLIX_VIEW` login redirect) or the existing avatar/session menu when already authenticated — behavior unchanged, only the surrounding chrome changes. |
| Sign up destination | `/create` (same destination the hero's own primary CTA already uses — reinforces one funnel) |
| Vertical alignment | Logo, links, and the pill button all share one optical centerline within the 64px bar. |
| Mobile menu | Existing hamburger/expand behavior is preserved; only the trigger's position/height changes to match the new 64px bar. Internal mobile menu content (Jobs/Learn expandable sections) is unchanged. |

## Hero

Full-viewport composition: navbar (above) + hero grid + trust strip, all on one light canvas, all sharing the same 40px left/right inset.

### Layout

- Section background: `--color-surface-alt` (or `--color-page` — pick whichever reads closer to the reference's off-white during implementation; both are existing tokens, no new color).
- Container: `--jf-container-wide` (1240px), same as navbar.
- Grid: two columns, left content narrower than right visual — reuse the existing ratio (`0.95fr 1.05fr`) and `--jf-gap-hero` (56px).
- Vertical spacing: ~72px between navbar and hero content start (more air than today's `--jf-space-hero-pad-top`), preserving the existing `--jf-space-hero-pad-bottom` (64px) before the trust strip.

### Left column — content unchanged, layout retuned

All existing copy, CTAs, and trust line stay exactly as written. Only spacing changes:

- Eyebrow: `MonoLabel tone="accent"` — unchanged ("Career Operating System"), now rendered in `--color-sapphire-brand` against a light background instead of the dark-tone accent color.
- Headline: same copy ("Where recruiters start replying"), same `H1` scale, now in `--color-ink-900` instead of white.
- Subheadline: same copy, `--color-ink-600` (or `ink-700`) instead of `dark-body`.
- CTAs: unchanged — primary "Create Resume" (`ArrowRight` icon) + ghost "Optimize Resume" — now using the light-surface ghost-button treatment (bordered, `ink-700` text) instead of the dark-tone ghost.
- Trust line: unchanged copy ("Free to start · No credit card required"), `font-mono-data`, `--color-ink-500`.

### Right column — 3-card product cluster (new)

Replaces `HeroPanel`'s current 1-dominant + 1-mini-sheet arrangement with three cards that read as one connected illustration, each built from `ProductFrame` (flat emphasis, `border-border-frame`, `--jf-shadow-frame`) + `RowChip`-style rows — no theatrical shadow, no rotation (the reference cards are perfectly upright with light, even shadows, not the dark-hero "theatrical" treatment).

| Card | Content | Maps to |
|---|---|---|
| **1 — Mentorship & Referrals** | "Get referred by professionals," "1:1 mentorship," "Resume review," footer note on included mock interviews | Existing `Job Referrals` top-level nav destination / follows the pattern already used in `JobsReferralsPanel.tsx` |
| **2 — Latest Jobs** | 3 realistic role rows (e.g. Frontend Developer, Backend Engineer, Product Manager), footer note ("150+ new this week") | Existing `Jobs ▾ → Find Jobs` nav destination |
| **3 — Courses** | Role-relevant course list (System Design, DSA, JavaScript & React, AI Interview Prep), footer note on learner count | Existing `Learn ▾ → Courses` nav destination |

Composition rules (from the approved v3 mockup):

- Card sizes are **not equal** — Card 3 (Courses) is the largest/most dominant, Card 2 (Latest Jobs) the smallest, Card 1 (Mentorship) mid-sized — matching the reference's visual weighting.
- Arrangement: Card 2 top-right, Card 1 center-left (slightly lower), Card 3 bottom-right, with slight corner overlap so the cluster reads as one object, not three separate floating widgets.
- Numbered step chips in each card header ("1. Grow", "2. Apply", "3. Learn") using the existing chip treatment (`bg-sapphire-50 text-sapphire-brand`, small radius) — these are **not copied Clay icon language**, they're a plain text/number badge using existing tokens, chosen because it's what glues the three cards into one narrative the way the reference's numbered badges do.
- Thin, single-color connector strokes between cards (using `ink-400`/`ink-500`-toned SVG paths, no arrowheads copied from Clay's icon set — a simple line/curve is enough) reinforcing the "one illustration" read.
- Card internals: bordered `border-border-soft` rows on `bg-page`, small icon-letter tiles (`bg-sapphire-50 text-sapphire-brand`), mono-caption footers (`font-mono-data`, `ink-500`) — all pulled directly from the existing `ResumeATSPanel` / `JobsReferralsPanel` visual pattern, just resized for a compact card format.
- No rotation/tilt on any of the three cards (unlike the existing `HeroPanel` mini-sheet, which is deliberately tilted — that pattern stays where it is, elsewhere on the page).

### Trust / logo strip

- Copy unchanged: "JobFlix members have been hired at ↘".
- Company logos unchanged: the existing 6 (`Google, Stripe, Airbnb, Figma, Notion, Spotify`) via the existing `LogoStrip` component — **do not invent additional company names** to fill a denser grid. Restyle as a single row spread across the full 1240px container width (matching the reference's edge-to-edge distribution), rather than today's compact left-clustered row.
- Same 40px inset as everything else above it; sits directly below the hero grid with the existing `border-t border-border-soft`-style divider (adapted for the light canvas — likely just spacing, no visible rule needed if the section background itself provides enough separation).

## Design tokens in play (all existing — nothing new introduced)

- **Color:** `sapphire-brand` #1D5FD8, `sapphire-bright` #2F7BE0, `sapphire-50` #EAF1FD, `sapphire-100` #CFE0FB, `ink-900` #0B2A3C, `ink-700` #24455B, `ink-600` #3E556B, `ink-500` #647B8E, `ink-400` #93A5B2, `page` #FFFFFF, `surface-alt` #F5F8F7, `border-soft` #EEF2F1, `border-frame` #E4EBEF.
- **Type:** Onest (display/body), JetBrains Mono (data captions only, 11–13.5px). Headline weight stays 500, never bolder. Eyebrow: 12px/600/+0.09em uppercase.
- **Spacing/containers:** `--jf-container-wide` 1240px, `--jf-space-page-padding` 40px, `--jf-gap-hero` 56px.
- **Radius:** `--jf-radius-pill` (buttons, chips), `--jf-radius-frame` 14px (cards), `--jf-radius-row` 12px (in-card rows).
- **Shadow:** `--jf-shadow-frame` for all three hero cards (flat/light — not the theatrical dark-hero shadow).
- **Motion:** only `background-color`/`border-color` transitions at 0.15s ease, per the existing system-wide rule. No new hover scale/transform effects on the cards or navbar.

## Responsiveness

The composition — not just the elements — must survive down to tablet width, and degrade gracefully (not just stack) on mobile:

- **Tablet (~768–1024px):** navbar keeps its 3-zone structure but may need to collapse the nav-link cluster into the existing mobile-menu pattern earlier than desktop if the 5 links + 2 dropdowns don't fit; hero grid can reduce to a narrower gap before dropping to a single column; the 3-card cluster keeps its overlap/size-hierarchy but scales down proportionally rather than re-stacking into equal-sized cards.
- **Mobile:** hero goes single-column (existing behavior is fine to keep), but the 3-card cluster should not become three full-width stacked blocks — check whether a simplified 1-dominant-card view (with the other two collapsed or hidden) reads better than a naive stack, and decide during implementation with an actual device check, not just a breakpoint guess.
- This needs a real visual pass in a running dev server at multiple widths before calling it done — not just Tailwind breakpoint classes chosen from the desktop layout.

## Component reuse plan

| Need | Source |
|---|---|
| Card container | `ProductFrame` (flat emphasis) from `src/components/marketing/primitives.tsx` |
| Card rows | `RowChip`-style pattern from the same file (may need a compact variant, not necessarily the exported `RowChip` verbatim — check its prop shape against the denser card content before reusing directly vs. adapting) |
| Buttons | `marketing/primitives.tsx` `Button` (`variant="primary"`/`"ghost"`) — same component the hero's CTAs already use |
| Eyebrow | `MonoLabel` |
| Company logos | `LogoStrip` |
| Navbar auth/session menu | Existing dropdown logic in `navbar.tsx` — behavior preserved, only chrome/position changes |

## New pieces needed

- Three new compact card components (or one parameterized card component instantiated 3x) for Mentorship/Referrals, Latest Jobs, and Courses — none of these exist today in `marketing/panels/`.
- A light-canvas variant of the navbar (or a prop/tone adjustment to the existing `Navbar` component, since it already supports a `tone` prop) — evaluate during planning whether this is a new `tone="light-flush"` value or a set of new classes gated by a boolean.
- Connector-line SVG between the three cards.

## Final visual audit (required before calling this done)

After implementation, compare against the reference for **composition only**: overall proportions, spacing rhythm, alignment, card hierarchy/balance, whitespace. Compare against the rest of ResumeAssist for **everything else**: colors, typography, buttons, shadows, borders, radii. Iterate until both checks pass — "close enough" is not sufficient per explicit user direction. This audit should happen in an actual running dev server (`/` route), not just by reading code.
