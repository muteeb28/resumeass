# Hero & Navbar Redesign — Clay Composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reverse-engineer Clay's homepage composition (navbar + hero + product-card illustration + trust strip) for ResumeAssist's homepage, using 100% ResumeAssist copy, tokens, and components — landing on the approved V3 mockup as the pixel-accurate target.

**Architecture:** A fresh, homepage-only `MarketingNavbar` (light canvas, 3-zone flex) replaces `<Navbar tone="light" />` in `AnimatedPinDemo.tsx` only — the shared `Navbar` component keeps serving its other 37 call sites untouched. `JobflixHero` moves from a dark `navy-900` canvas to ResumeAssist's light surfaces and swaps its right-column `HeroPanel` (1 dominant + 1 mini sheet) for a new `HeroCardCluster` (3 cards, one connected composition) built from the existing `ProductFrame`/`RowChip` primitives.

**Tech Stack:** Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS v4, `motion/react`, Vitest (data/logic tests only — this codebase has no component-rendering test harness; visual correctness is verified with a running dev server + Playwright screenshots, not automated snapshot tests).

## Global Constraints

Copied verbatim from the approved spec (`docs/superpowers/specs/2026-07-12-hero-navbar-clay-composition-design.md`) and the user's mandatory implementation rules:

- **This is reverse-engineering, not a redesign.** The approved V3 mockup (`resumeassist/.superpowers/brainstorm/2131-1783833045/content/reference-match-v3.html`) is the pixel-accurate implementation source of truth; the original Clay screenshot is historical context only. Do not reinterpret or improvise — measure and reproduce.
- **Pixel accuracy over eyeballing.** Navbar height/padding, container width, nav-link/CTA spacing, logo placement, hero proportions, headline/paragraph width, card sizes/overlap/positioning, and trust-strip placement must be measured against V3, not approximated. Any deviation needs a stated ResumeAssist-specific reason.
- **Desktop first.** Perfect the desktop (1440px viewport / 1240px container) composition before touching tablet or mobile. Do not compromise desktop composition to pre-solve responsiveness.
- **Iterate until matched.** Build → compare against V3 → list every visual difference → fix every difference → compare again → repeat until no significant difference remains. Compiling is not done; passing the visual audit is done.
- **No new design language.** Reuse `Button`, `ProductFrame`, `RowChip`, `MonoLabel`, `LogoStrip`, and the existing color/typography/spacing/radius/shadow/motion tokens in `src/index.css` and `src/lib/typography.ts`. No new colors, fonts, spacing scale, shadows, radii, or homepage-only one-off styles. Extend existing components (props) where a genuine gap exists — don't fork them.
- **Navbar authored fresh.** `src/components/navbar.tsx` (the shared `Navbar`, used by 37 other pages/components) is not modified beyond a pure data-extraction refactor (Task 1) — its rendering/behavior is untouched. The homepage gets a new `MarketingNavbar` component, not a `tone` flag bolted onto the old one.
- **Navbar content:** `Logo | Job Referrals · Jobs ▾ · Learn ▾ · Pricing · Blog · Contact Us | Log in · Sign up`. Auth actions are *only* Log in and Sign up — no "Create Resume" or any third action in the navbar.
- **Hero copy is immutable.** Headline, subhead, both CTA labels, trust line, and eyebrow text are copied verbatim from the current `JobflixHero.tsx` — only layout, spacing, and canvas color change.
- **Hero card cluster is one composition, not three widgets.** Cards: 1. Mentorship & Referrals, 2. Latest Jobs, 3. Courses — built and laid out as a single unit with connectors, overlap, and a size hierarchy (Courses largest, Latest Jobs smallest, Mentorship mid).
- **Trust strip:** only the existing 6 company names (`Google, Stripe, Airbnb, Figma, Notion, Spotify`) — never invent companies.
- **Final acceptance test (Rule 8):** side-by-side squint test against the V3 mockup — composition, spacing, hierarchy, alignment, proportions, whitespace, rhythm must feel nearly identical. Only acceptable differences: ResumeAssist branding, content, product cards, design tokens. Not done until this passes.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/marketing/nav-links.ts` (new) | Shared `JOB_LINKS` / `LEARN_LINKS` dropdown data — single source of truth for both the shared `Navbar` and the new `MarketingNavbar`. |
| `src/components/navbar.tsx` (modified, data-only) | Shared navbar for all non-homepage pages — imports link data instead of declaring it inline. No rendering/behavior change. |
| `src/components/marketing/primitives.tsx` (modified) | `LogoStrip` gains `tone`/`spread` props (default preserves current dark/marketing usage everywhere else it's called). |
| `src/components/marketing/MarketingNavbar.tsx` (new) | Fresh, homepage-only navbar: 3-zone flex, light canvas, 64px, Log in + Sign up only. |
| `src/components/marketing/hero/hero-cluster-data.ts` (new) | Typed content for the 3 hero cards. |
| `src/components/marketing/hero/HeroCardCluster.tsx` (new) | The 3-card connected composition, replacing `HeroPanel`. |
| `src/components/marketing/hero/HeroPanel.tsx` (deleted) | No longer used anywhere once `JobflixHero` swaps to `HeroCardCluster` — confirmed zero other callers. |
| `src/components/marketing/JobflixHero.tsx` (modified) | Light canvas, retuned spacing, swaps in `HeroCardCluster` and light/spread `LogoStrip`. |
| `src/components/AnimatedPinDemo.tsx` (modified, 2 lines) | Renders `<MarketingNavbar />` instead of `<Navbar tone="light" />`. |

---

### Task 1: Extract shared nav-link data (no behavior change)

**Files:**
- Create: `src/components/marketing/nav-links.ts`
- Modify: `src/components/navbar.tsx:1-26`
- Test: `src/__tests__/nav-links.test.ts`

**Interfaces:**
- Produces: `JOB_LINKS: NavDropdownLink[]`, `LEARN_LINKS: NavDropdownLink[]`, `type NavDropdownLink = { name: string; href: string; description: string; icon: LucideIcon; external?: boolean }` — consumed by Task 5 (`MarketingNavbar`).

- [ ] **Step 1: Write the failing test**

```typescript
// src/__tests__/nav-links.test.ts
import { describe, it, expect } from 'vitest';
import { JOB_LINKS, LEARN_LINKS } from '../components/marketing/nav-links';

describe('shared nav-link data', () => {
  it('JOB_LINKS has the 6 existing job destinations, in order', () => {
    expect(JOB_LINKS.map((l) => l.name)).toEqual([
      'Find Jobs', 'Job Tracker', 'HR Emails', 'Dubai HR', 'Gulf Jobs', 'AU & NZ',
    ]);
  });

  it('LEARN_LINKS has the 4 existing learn destinations, in order, with Courses first', () => {
    expect(LEARN_LINKS.map((l) => l.name)).toEqual([
      'Courses', 'Opportunities', 'Prepare', 'Interview Questions',
    ]);
  });

  it('Courses links to the external jobflix.in destination used by the hero card cluster', () => {
    const courses = LEARN_LINKS.find((l) => l.name === 'Courses');
    expect(courses?.href).toBe('https://jobflix.in/courses');
    expect(courses?.external).toBe(true);
  });

  it('Find Jobs links to /find-jobs, used by the hero card cluster', () => {
    const findJobs = JOB_LINKS.find((l) => l.name === 'Find Jobs');
    expect(findJobs?.href).toBe('/find-jobs');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/nav-links.test.ts`
Expected: FAIL — `Cannot find module '../components/marketing/nav-links'`

- [ ] **Step 3: Create the shared data module**

```typescript
// src/components/marketing/nav-links.ts
import type { LucideIcon } from "lucide-react";
import { Briefcase, ClipboardList, Mail, Building2, Globe, Plane, BookOpen, GraduationCap } from "lucide-react";

export type NavDropdownLink = {
  name: string;
  href: string;
  description: string;
  icon: LucideIcon;
  external?: boolean;
};

export const JOB_LINKS: NavDropdownLink[] = [
  { name: "Find Jobs", href: "/find-jobs", description: "Browse fresh job openings.", icon: Briefcase },
  { name: "Job Tracker", href: "/job-tracker", description: "Track your applications.", icon: ClipboardList },
  { name: "HR Emails", href: "/hr-emails", description: "Find verified HR contacts.", icon: Mail },
  { name: "Dubai HR", href: "/dubai-hr", description: "UAE hiring contacts.", icon: Building2 },
  { name: "Gulf Jobs", href: "/gulf-jobs", description: "Gulf region opportunities.", icon: Globe },
  { name: "AU & NZ", href: "/au-nz", description: "Australia and New Zealand roles.", icon: Plane },
];

export const LEARN_LINKS: NavDropdownLink[] = [
  { name: "Courses", href: "https://jobflix.in/courses", description: "Video courses and learning paths.", icon: GraduationCap, external: true },
  { name: "Opportunities", href: "http://localhost:3000/opportunities", description: "Explore job and career opportunities.", icon: Briefcase, external: true },
  { name: "Prepare", href: "http://localhost:3000/prepare", description: "Practice problems and interview prep.", icon: ClipboardList, external: true },
  { name: "Interview Questions", href: "/interview-questions", description: "Practice company-wise interview questions.", icon: BookOpen, external: false },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/nav-links.test.ts`
Expected: PASS (4/4)

- [ ] **Step 5: Update `navbar.tsx` to import instead of declare (no other change)**

In `src/components/navbar.tsx`, replace lines 1-26:

```typescript
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import AuthModal from "./auth-modal";
import { useUserStore } from "../stores/useUserStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JOB_LINKS, LEARN_LINKS } from "./marketing/nav-links";
```

(Removes the unused `Briefcase, ClipboardList, Mail, Building2, Globe, Plane, BookOpen, GraduationCap` icon imports and the two inline `const JOB_LINKS = [...]` / `const LEARN_LINKS = [...]` arrays — everything else in the file is untouched.)

- [ ] **Step 6: Verify the shared navbar still renders correctly on a non-homepage page**

Run: `npm run dev` (starts on port 3002 per `package.json`), then navigate to `http://localhost:3002/pricing` in a browser and confirm the navbar's Jobs/Learn dropdowns still show the same 6/4 items as before. This page uses `<Navbar tone="dark">` (or whatever tone it passes) — Task 1 must not change its appearance at all.

- [ ] **Step 7: Commit**

```bash
git add src/components/marketing/nav-links.ts src/components/navbar.tsx src/__tests__/nav-links.test.ts
git commit -m "refactor: extract shared nav-link data out of navbar.tsx"
```

---

### Task 2: Extend `LogoStrip` with light-canvas + full-width-spread support

**Files:**
- Modify: `src/components/marketing/primitives.tsx:299-311`

**Interfaces:**
- Produces: `LogoStrip({ names, className, tone = "dark", spread = false })` — `tone` and `spread` are both optional and default to today's exact behavior, so every existing call site (`AnimatedPinDemo`'s final CTA area, if any, and anywhere else `LogoStrip` is used) is visually unaffected.
- Consumes (Task 6): `<LogoStrip names={hiredAt} tone="light" spread className="mt-5" />`

- [ ] **Step 1: Modify `LogoStrip`**

Replace lines 299-311 of `src/components/marketing/primitives.tsx`:

```typescript
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit -p .`
Expected: no new errors introduced (pre-existing errors, if any, are unrelated — compare error count before/after this change).

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/primitives.tsx
git commit -m "feat: add light/spread variants to LogoStrip"
```

---

### Task 3: Hero card cluster content data

**Files:**
- Create: `src/components/marketing/hero/hero-cluster-data.ts`
- Test: `src/__tests__/hero-cluster-data.test.ts`

**Interfaces:**
- Produces: `HERO_CLUSTER_CARDS: HeroClusterCardData[]`, `type HeroClusterCardData = { step: string; title: string; href: string; footer: string; rows: { letter: string; title: string; meta: string }[] }` — consumed by Task 4 (`HeroCardCluster`).

- [ ] **Step 1: Write the failing test**

```typescript
// src/__tests__/hero-cluster-data.test.ts
import { describe, it, expect } from 'vitest';
import { HERO_CLUSTER_CARDS } from '../components/marketing/hero/hero-cluster-data';

describe('hero card cluster data', () => {
  it('has exactly 3 cards, in Mentorship / Latest Jobs / Courses order', () => {
    expect(HERO_CLUSTER_CARDS.map((c) => c.title)).toEqual([
      'Mentorship & referrals',
      'Latest jobs',
      'Courses',
    ]);
  });

  it('each card links to an existing nav destination (no invented routes)', () => {
    expect(HERO_CLUSTER_CARDS.map((c) => c.href)).toEqual([
      '/referrals',
      '/find-jobs',
      'https://jobflix.in/courses',
    ]);
  });

  it('every card has at least 3 rows and a footer caption', () => {
    for (const card of HERO_CLUSTER_CARDS) {
      expect(card.rows.length).toBeGreaterThanOrEqual(3);
      expect(card.footer.length).toBeGreaterThan(0);
      expect(card.step.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/hero-cluster-data.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the data module**

```typescript
// src/components/marketing/hero/hero-cluster-data.ts

export type HeroClusterCardRow = {
  letter: string;
  title: string;
  meta: string;
};

export type HeroClusterCardData = {
  /** Numbered narrative badge, e.g. "1. Grow" — ties the 3 cards into one story. */
  step: string;
  title: string;
  /** Existing nav destination this card previews — no new routes. */
  href: string;
  footer: string;
  rows: HeroClusterCardRow[];
};

export const HERO_CLUSTER_CARDS: HeroClusterCardData[] = [
  {
    step: "1. Grow",
    title: "Mentorship & referrals",
    href: "/referrals",
    footer: "Mock interviews included",
    rows: [
      { letter: "R", title: "Get referred by professionals", meta: "Hiring referrals" },
      { letter: "M", title: "1:1 mentorship", meta: "Career guidance" },
      { letter: "CV", title: "Resume review", meta: "Expert feedback" },
    ],
  },
  {
    step: "2. Apply",
    title: "Latest jobs",
    href: "/find-jobs",
    footer: "150+ new roles this week",
    rows: [
      { letter: "FE", title: "Frontend Developer", meta: "Remote · Full-time" },
      { letter: "BE", title: "Backend Engineer", meta: "Hybrid · Full-time" },
      { letter: "PM", title: "Product Manager", meta: "Remote · Full-time" },
    ],
  },
  {
    step: "3. Learn",
    title: "Courses",
    href: "https://jobflix.in/courses",
    footer: "4,000+ learners enrolled",
    rows: [
      { letter: "SD", title: "System Design", meta: "12 modules" },
      { letter: "DS", title: "DSA", meta: "20 modules" },
      { letter: "JS", title: "JavaScript & React", meta: "18 modules" },
      { letter: "AI", title: "AI Interview Prep", meta: "8 modules" },
    ],
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/hero-cluster-data.test.ts`
Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/hero/hero-cluster-data.ts src/__tests__/hero-cluster-data.test.ts
git commit -m "feat: add hero card cluster content data"
```

---

### Task 4: Build `HeroCardCluster` — the 3-card connected composition

**Files:**
- Create: `src/components/marketing/hero/HeroCardCluster.tsx`
- Modify: `src/components/marketing/JobflixHero.tsx:10` (import swap only — full retune happens in Task 6)
- Delete: `src/components/marketing/hero/HeroPanel.tsx`

**Interfaces:**
- Consumes: `HERO_CLUSTER_CARDS` (Task 3), `ProductFrame`/`RowChip` (`../primitives`).
- Produces: `HeroCardCluster()` — a single default-export-free named component, no props (content is fixed from `hero-cluster-data.ts`), consumed by `JobflixHero.tsx`.

This is one component file (not three separate card components) so the numbered narrative, connectors, sizing hierarchy, and overlap are authored together as one unit, per the "one composition, not three widgets" constraint. Positions below are transcribed directly from the approved V3 mockup (`reference-match-v3.html`'s `.v3-c1`/`.v3-c2`/`.v3-c3`/connector `<path>` coordinates), which is Rule 1's measured source of truth — not eyeballed.

- [ ] **Step 1: Write the component**

```typescript
// src/components/marketing/hero/HeroCardCluster.tsx
import Link from "next/link";
import { ProductFrame, RowChip } from "../primitives";
import { HERO_CLUSTER_CARDS, type HeroClusterCardData } from "./hero-cluster-data";

/*
 * Absolute positions/widths are transcribed from the approved V3 mockup
 * (docs reference: reference-match-v3.html .v3-c1/.v3-c2/.v3-c3), scaled
 * for ProductFrame's 20px frame padding (the mockup's raw HTML used 14px).
 * Card 3 (Courses) is the largest/most dominant; Card 2 (Latest jobs) is
 * the smallest; Card 1 (Mentorship) is mid-sized — matching the
 * reference's visual weighting. This is the pixel-accuracy source of
 * truth for Task 8's audit, not a first guess to be redesigned later.
 */
const CARD_POSITION: Record<number, string> = {
  0: "top-[130px] left-0 w-[264px] z-[2]",   // Mentorship & referrals
  1: "top-0 right-4 w-[248px] z-[1]",         // Latest jobs
  2: "top-[280px] right-0 w-[312px] z-[3]",   // Courses
};

function ClusterCard({ card, position }: { card: HeroClusterCardData; position: string }) {
  return (
    <Link href={card.href} className={`absolute block ${position}`}>
      <ProductFrame emphasis="flat" className="hover:shadow-[var(--jf-shadow-panel)] transition-shadow duration-150">
        <div className="flex items-center gap-2">
          <span className="rounded-[var(--jf-radius-mini)] bg-sapphire-50 px-2 py-[3px] text-[11px] font-semibold text-sapphire-brand">
            {card.step}
          </span>
          <span className="text-[13px] font-semibold text-ink-900">{card.title}</span>
        </div>
        <div className="mt-3 space-y-1.5">
          {card.rows.map((row) => (
            <RowChip key={row.title} letter={row.letter} title={row.title} meta={row.meta} />
          ))}
        </div>
        <div className="mt-3 border-t border-border-soft pt-2 font-mono-data text-[11px] text-ink-500">
          {card.footer}
        </div>
      </ProductFrame>
    </Link>
  );
}

export function HeroCardCluster() {
  const [mentorship, latestJobs, courses] = HERO_CLUSTER_CARDS;

  return (
    <div className="relative h-[560px]">
      {/* Connector strokes — reinforce "one illustration," not Clay's icon set */}
      <svg viewBox="0 0 540 560" className="pointer-events-none absolute inset-0 h-full w-full" fill="none" aria-hidden>
        <path d="M 216 120 C 228 88, 244 68, 268 54" stroke="var(--color-ink-400)" strokeWidth="1.4" />
        <path d="M 500 220 C 516 244, 514 258, 500 270" stroke="var(--color-ink-400)" strokeWidth="1.4" />
        <path d="M 150 540 C 168 512, 190 490, 216 474" stroke="var(--color-ink-400)" strokeWidth="1.4" />
      </svg>

      <ClusterCard card={latestJobs} position={CARD_POSITION[1]} />
      <ClusterCard card={mentorship} position={CARD_POSITION[0]} />
      <ClusterCard card={courses} position={CARD_POSITION[2]} />
    </div>
  );
}
```

- [ ] **Step 2: Delete the now-unused `HeroPanel`**

```bash
git rm src/components/marketing/hero/HeroPanel.tsx
```

- [ ] **Step 3: Swap the import in `JobflixHero.tsx`**

In `src/components/marketing/JobflixHero.tsx`, change line 10 from:

```typescript
import { HeroPanel } from "./hero/HeroPanel";
```

to:

```typescript
import { HeroCardCluster } from "./hero/HeroCardCluster";
```

And change line 50 from `<HeroPanel />` to `<HeroCardCluster />` (this line moves/changes further in Task 6, but must compile now).

- [ ] **Step 4: Verify it compiles and renders without errors**

Run: `npx tsc --noEmit -p .`
Expected: no new errors.

Run: `npm run dev`, navigate to `http://localhost:3002/`, confirm the page loads without a React error overlay or console error (the visual composition is not yet correct — that's Task 6 and the Task 8 audit — this step only confirms it renders).

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/hero/HeroCardCluster.tsx src/components/marketing/JobflixHero.tsx
git commit -m "feat: add HeroCardCluster, remove HeroPanel"
```

---

### Task 5: Build `MarketingNavbar` — fresh, homepage-only navbar

**Files:**
- Create: `src/components/marketing/MarketingNavbar.tsx`

**Interfaces:**
- Consumes: `JOB_LINKS`, `LEARN_LINKS` (Task 1, `./nav-links`), `Container`, `Button` (`./primitives`), `useUserStore` (`../../stores/useUserStore`).
- Produces: `MarketingNavbar()` — no props, consumed by `AnimatedPinDemo.tsx` (Task 7).

Rebuilt from the ground up (not a `tone` flag on `navbar.tsx`) as a 3-zone `flex justify-content: space-between` bar so the whitespace around the nav-link cluster is emergent, not manual. Static (not `fixed`), sitting in normal document flow directly above `JobflixHero` on the same light canvas — the old navbar's translucency/backdrop-blur/fixed-over-dark-hero mechanism does not carry over, because there is no dark hero underneath it anymore.

- [ ] **Step 1: Write the component**

```typescript
// src/components/marketing/MarketingNavbar.tsx
"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { Container, Button } from "./primitives";
import { JOB_LINKS, LEARN_LINKS } from "./nav-links";
import { useUserStore } from "../../stores/useUserStore";

function NavDropdown({
  label,
  links,
  open,
  onToggle,
}: {
  label: string;
  links: typeof JOB_LINKS;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-sm text-ink-600 transition-colors duration-200 hover:text-ink-900"
      >
        {label}
        <ChevronDown size={13} className="opacity-70 transition-transform duration-200 group-hover:rotate-180" />
      </button>
      <div className="invisible absolute top-full left-1/2 z-50 w-[480px] -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <div className="grid grid-cols-2 gap-1 rounded-[var(--jf-radius-panel)] border border-border-soft bg-page p-3 shadow-[var(--jf-shadow-frame)]">
          {links.map((link) => {
            const Icon = link.icon;
            const inner = (
              <>
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-surface-alt text-ink-600">
                  <Icon size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight text-ink-900">{link.name}</div>
                  <div className="mt-0.5 text-xs leading-snug text-ink-500">{link.description}</div>
                </div>
              </>
            );
            const itemCls = "flex items-start gap-3 rounded-lg px-3 py-3 transition-colors duration-150 hover:bg-surface-alt";
            return link.external ? (
              <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className={itemCls}>{inner}</a>
            ) : (
              <Link key={link.name} href={link.href} className={itemCls}>{inner}</Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MarketingNavbar() {
  const { user, logout } = useUserStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [mobileJobsOpen, setMobileJobsOpen] = useState(false);
  const [mobileLearnOpen, setMobileLearnOpen] = useState(false);

  const loginHref =
    typeof window !== "undefined"
      ? `${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login?next=${encodeURIComponent(window.location.origin)}`
      : "#";

  return (
    <nav className="relative z-50 bg-page">
      <Container width="wide">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="ResumeAssist AI" className="h-9 w-auto object-contain" />
          </Link>

          <div className="hidden items-center gap-9 md:flex">
            <Link href="/referrals" className="text-sm text-ink-600 transition-colors duration-200 hover:text-ink-900">
              Job Referrals
            </Link>
            <NavDropdown label="Jobs" links={JOB_LINKS} open={jobsOpen} onToggle={() => setJobsOpen((v) => !v)} />
            <NavDropdown label="Learn" links={LEARN_LINKS} open={learnOpen} onToggle={() => setLearnOpen((v) => !v)} />
            <Link href="/pricing" className="text-sm text-ink-600 transition-colors duration-200 hover:text-ink-900">
              Pricing
            </Link>
            <Link href="/blog" className="text-sm text-ink-600 transition-colors duration-200 hover:text-ink-900">
              Blog
            </Link>
            <Link href="/contact-us" className="text-sm text-ink-600 transition-colors duration-200 hover:text-ink-900">
              Contact Us
            </Link>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            {user ? (
              <div className="group relative">
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-sm font-medium text-white">
                  {user.email ? user.email.split("@")[0].slice(0, 2).toUpperCase() : "?"}
                </button>
                <div className="invisible absolute right-0 z-50 mt-2 w-40 translate-y-1 rounded-md border border-border-soft bg-page opacity-0 shadow-[var(--jf-shadow-frame)] transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <a href={`${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/my-account/dashboard/me`} className="block px-4 py-2 text-sm text-ink-700 hover:bg-surface-alt">Profile</a>
                  <a href={`${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/my-account/membership`} className="block px-4 py-2 text-sm text-ink-700 hover:bg-surface-alt">Memberships</a>
                  <Link href="/resume" className="block px-4 py-2 text-sm text-ink-700 hover:bg-surface-alt">My resume</Link>
                  <button onClick={async () => { await logout(); window.location.href = "/"; }} className="w-full px-4 py-2 text-left text-sm text-ink-700 hover:bg-surface-alt">Logout</button>
                </div>
              </div>
            ) : (
              <Button href={loginHref} variant="ghost" className="text-ink-700 hover:bg-surface-alt">
                Log in
              </Button>
            )}
            <Button href="/create">Sign up ↗</Button>
          </div>

          <button className="p-2 text-ink-700 md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden md:hidden"
            >
              <div className="space-y-1 rounded-lg border border-border-soft bg-page px-2 pt-2 pb-3">
                <Link href="/referrals" className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-alt" onClick={() => setMobileOpen(false)}>Job Referrals</Link>

                <div>
                  <button onClick={() => setMobileJobsOpen((v) => !v)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-alt">
                    <span>Jobs</span>
                    <ChevronDown size={14} className={cn("transition-transform duration-200", mobileJobsOpen && "rotate-180")} />
                  </button>
                  {mobileJobsOpen && (
                    <div className="mt-1 ml-3 space-y-1">
                      {JOB_LINKS.map((link) => (
                        <Link key={link.name} href={link.href} className="block rounded-md px-3 py-2 text-sm text-ink-600 hover:bg-surface-alt" onClick={() => { setMobileOpen(false); setMobileJobsOpen(false); }}>
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <button onClick={() => setMobileLearnOpen((v) => !v)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-alt">
                    <span>Learn</span>
                    <ChevronDown size={14} className={cn("transition-transform duration-200", mobileLearnOpen && "rotate-180")} />
                  </button>
                  {mobileLearnOpen && (
                    <div className="mt-1 ml-3 space-y-1">
                      {LEARN_LINKS.map((link) =>
                        link.external ? (
                          <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="block rounded-md px-3 py-2 text-sm text-ink-600 hover:bg-surface-alt" onClick={() => { setMobileOpen(false); setMobileLearnOpen(false); }}>{link.name}</a>
                        ) : (
                          <Link key={link.name} href={link.href} className="block rounded-md px-3 py-2 text-sm text-ink-600 hover:bg-surface-alt" onClick={() => { setMobileOpen(false); setMobileLearnOpen(false); }}>{link.name}</Link>
                        )
                      )}
                    </div>
                  )}
                </div>

                <Link href="/pricing" className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-alt" onClick={() => setMobileOpen(false)}>Pricing</Link>
                <Link href="/blog" className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-alt" onClick={() => setMobileOpen(false)}>Blog</Link>
                <Link href="/contact-us" className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-alt" onClick={() => setMobileOpen(false)}>Contact Us</Link>

                <div className="mt-2 space-y-2 border-t border-border-soft px-3 pt-3">
                  {!user && (
                    <Button href={loginHref} variant="ghost" className="w-full justify-center text-ink-700">
                      Log in
                    </Button>
                  )}
                  <Button href="/create" className="w-full justify-center">
                    Sign up ↗
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </nav>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit -p .`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/MarketingNavbar.tsx
git commit -m "feat: add fresh homepage-only MarketingNavbar"
```

---

### Task 6: Wire `MarketingNavbar` and `HeroCardCluster` into the homepage, retune `JobflixHero` to the light canvas

**Files:**
- Modify: `src/components/marketing/JobflixHero.tsx` (full file)
- Modify: `src/components/AnimatedPinDemo.tsx:3-30`

**Interfaces:**
- Consumes: `MarketingNavbar` (Task 5), `HeroCardCluster` (Task 4), light/spread `LogoStrip` (Task 2).

- [ ] **Step 1: Rewrite `JobflixHero.tsx` for the light canvas**

```typescript
// src/components/marketing/JobflixHero.tsx
/**
 * JobFlix Marketing — Hero.
 * Reverse-engineered against Clay's composition (see
 * docs/superpowers/specs/2026-07-12-hero-navbar-clay-composition-design.md):
 * same eyebrow/headline/subhead/CTA/trust-line content as before, now on
 * ResumeAssist's light canvas with the 3-card HeroCardCluster illustration.
 */
import { ArrowRight } from "lucide-react";
import { Container, MonoLabel, Button, LogoStrip } from "./primitives";
import { HeroCardCluster } from "./hero/HeroCardCluster";

const hiredAt = ["Google", "Stripe", "Airbnb", "Figma", "Notion", "Spotify"];

export function JobflixHero() {
  return (
    <section className="relative overflow-hidden bg-surface-alt pt-[72px] pb-[var(--jf-space-hero-pad-bottom)]">
      <Container width="wide">
        <div className="grid items-start gap-[var(--jf-gap-hero)] lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left — proof-anchored copy, unchanged content */}
          <div className="max-w-lg">
            <MonoLabel tone="accent">Career Operating System</MonoLabel>

            <h1 className="mt-[26px] text-[2.75rem] font-medium leading-[0.94] tracking-[-0.032em] text-ink-900 sm:text-[3.75rem] lg:text-[5rem]">
              Where recruiters start replying
            </h1>

            <p className="mt-[26px] max-w-[480px] text-xl leading-[1.5] text-ink-600">
              The interviews you&rsquo;ve been chasing. The companies you thought
              wouldn&rsquo;t look twice. Every move you make here brings that offer
              closer — until it&rsquo;s real.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="/create" size="lg">
                Create Resume
                <ArrowRight size={18} />
              </Button>
              <Button href="/optimize" variant="ghost" size="lg" className="text-ink-700 hover:bg-surface-alt">
                Optimize Resume
              </Button>
            </div>

            <p className="mt-6 font-mono-data text-[13.5px] text-ink-500">
              Free to start · No credit card required
            </p>
          </div>

          {/* Right — the 3-card product illustration */}
          <HeroCardCluster />
        </div>

        <div className="mt-[var(--jf-space-section-tight)] border-t border-border-soft pt-8">
          <p className="text-[15px] font-semibold text-ink-900">
            JobFlix members have been hired at ↘
          </p>
          <LogoStrip names={hiredAt} tone="light" spread className="mt-6" />
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Point `AnimatedPinDemo.tsx` at the new navbar**

In `src/components/AnimatedPinDemo.tsx`, change line 3 from:

```typescript
import { Navbar } from "./navbar";
```

to:

```typescript
import { MarketingNavbar } from "./marketing/MarketingNavbar";
```

And change line 25 (inside the returned JSX) from:

```typescript
<Navbar tone="light" />
```

to:

```typescript
<MarketingNavbar />
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit -p .`
Expected: no new errors.

- [ ] **Step 4: Verify the homepage renders on the light canvas**

Run: `npm run dev`, open `http://localhost:3002/` in a browser. Confirm:
- The navbar and hero share one light background (no dark band behind the navbar).
- The 3 cards render to the right of the headline (positions will be refined in Task 8 — this step only confirms nothing crashes and nothing is dark-on-dark/invisible).
- No console errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/JobflixHero.tsx src/components/AnimatedPinDemo.tsx
git commit -m "feat: move homepage hero to light canvas with MarketingNavbar + HeroCardCluster"
```

---

### Task 7: Regression check — confirm the other 37 `Navbar` call sites are unaffected

**Files:** none modified — verification only.

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: all tests pass, including the pre-existing `src/__tests__/navbar.test.ts` (untouched by this plan — it mirrors a data shape independent of the actual component and was not affected by Task 1's refactor).

- [ ] **Step 2: Spot-check 3 non-homepage pages that use the shared `Navbar`**

With `npm run dev` running, visit:
- `http://localhost:3002/pricing`
- `http://localhost:3002/find-jobs`
- `http://localhost:3002/blog`

Confirm each still renders its navbar exactly as before (same tone, same fixed/translucent behavior, Jobs/Learn dropdowns show the same items, Contact Us + Login/avatar still present) — Task 1 only moved constant declarations, so there should be zero visual difference here.

- [ ] **Step 3: Run lint and build**

Run: `npm run lint`
Expected: no new errors (pre-existing warnings unrelated to touched files are fine).

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Commit** (only if Steps 1-3 required any fix; otherwise skip — this task is verification-only)

---

### Task 8: Desktop pixel-accuracy audit (Rule 1 + Rule 2 + Rule 3 — iterate until matched)

**Files:** `src/components/marketing/MarketingNavbar.tsx`, `src/components/marketing/JobflixHero.tsx`, `src/components/marketing/hero/HeroCardCluster.tsx` — iterated on directly based on audit findings.

This task is the loop, not a single step: **build → compare against V3 → list every visual difference → fix every difference → compare again → repeat until no significant difference remains.** Do not stop after one pass.

- [ ] **Step 1: Capture the approved target**

With the dev server running, open the approved V3 mockup directly in a browser at its saved path (`resumeassist/.superpowers/brainstorm/2131-1783833045/content/reference-match-v3.html`) at a 1440×1024 viewport and take a screenshot. This is the Rule 1 measured reference — not the original Clay screenshot.

- [ ] **Step 2: Capture the implementation**

Navigate to `http://localhost:3002/` at the same 1440×1024 viewport and take a screenshot of the first viewport (navbar + hero + trust strip).

- [ ] **Step 3: List every visual difference**

Compare the two screenshots side by side and write down each concrete difference — e.g. "navbar height reads taller than 64px," "card cluster sits too low relative to the headline," "Courses card doesn't read as the largest," "connector lines are missing/misaligned," "trust strip isn't spread full-width." Do not write "looks close enough" — list specifics or state explicitly that none were found.

- [ ] **Step 4: Fix every listed difference**

For each difference, adjust the relevant Tailwind classes/inline styles in the file responsible (navbar spacing → `MarketingNavbar.tsx`; hero grid/typography spacing → `JobflixHero.tsx`; card sizes/positions/connectors → `HeroCardCluster.tsx`'s `CARD_POSITION` map and SVG path coordinates). Re-run `npx tsc --noEmit -p .` after each batch of edits.

- [ ] **Step 5: Re-capture and re-compare**

Repeat Steps 2-4 until Step 3 produces no new findings.

- [ ] **Step 6: Commit each meaningful fix pass**

```bash
git add -A
git commit -m "fix: desktop pixel-accuracy pass against approved V3 mockup"
```

(Repeat this commit for each iteration of Steps 2-5 that changed code — small, frequent commits, not one giant diff at the end.)

---

### Task 9: Responsive adaptation (tablet + mobile) — only after Task 8 passes

**Files:** same three files as Task 8.

- [ ] **Step 1: Tablet pass (820×1180 viewport)**

Resize to 820×1180, screenshot the homepage. Verify: navbar collapses into the mobile hamburger pattern if the 6 links don't fit in the visible zone (adjust the `md:` breakpoint in `MarketingNavbar.tsx` if 768px/`md` is too aggressive for 6 nav items + 2 actions); hero grid narrows its gap before dropping to one column; the 3-card cluster scales down proportionally (adjust `CARD_POSITION` widths/offsets with a `lg:` variant) rather than becoming three equal-sized stacked blocks.

- [ ] **Step 2: Mobile pass (390×844 viewport)**

Resize to 390×844, screenshot the homepage. Verify: hero is single-column; decide whether the 3-card cluster shows a simplified single dominant card (Courses) with the other two hidden below `sm:`, or a compact stacked view — pick whichever reads closer to "one illustration" rather than "three unrelated boxes," and implement it as an `sm:hidden` / `hidden sm:block` split in `HeroCardCluster.tsx`.

- [ ] **Step 3: Verify no horizontal scroll at either width**

At both viewports, confirm there's no horizontal scrollbar (a common sign of an unclamped absolute-positioned card escaping its container) — if present, constrain `HeroCardCluster`'s wrapper with `overflow-hidden` or adjust the offending card's offset.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: tablet and mobile responsive pass, preserving hero composition"
```

---

### Task 10: Final acceptance test (Rule 8) and full regression pass

**Files:** none expected — this is the closing gate.

- [ ] **Step 1: Squint test**

Place the V3 mockup screenshot (Task 8, Step 1) and a fresh implementation screenshot (1440×1024) side by side. Confirm composition, spacing, hierarchy, alignment, proportions, whitespace, and rhythm feel nearly identical. The only differences should be ResumeAssist branding/content/cards/tokens — if any element of the navbar or hero still reads as "the old ResumeAssist layout," go back to Task 8.

- [ ] **Step 2: Full automated regression**

Run: `npx vitest run` — all pass.
Run: `npx tsc --noEmit -p .` — no new errors.
Run: `npm run lint` — no new errors.
Run: `npm run build` — succeeds.

- [ ] **Step 3: Final manual regression on 3 other pages** (repeat of Task 7, Step 2, as a closing sanity check after all hero/navbar work is done)

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final acceptance pass — hero/navbar Clay-composition redesign complete"
```
