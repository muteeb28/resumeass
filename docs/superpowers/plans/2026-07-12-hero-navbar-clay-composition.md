# Hero & Navbar Redesign — Clay Composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan **milestone-by-milestone, with a mandatory human review stop after each milestone** — do not proceed to the next milestone without explicit approval, even if all steps within the current milestone pass. Steps use checkbox (`- [ ]`) syntax for tracking.

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
- **Navbar authored fresh.** `src/components/navbar.tsx` (the shared `Navbar`, used by 37 other pages/components) is not modified beyond a pure data-extraction refactor (Milestone 1) — its rendering/behavior is untouched. The homepage gets a new `MarketingNavbar` component, not a `tone` flag bolted onto the old one.
- **Navbar content:** `Logo | Job Referrals · Jobs ▾ · Learn ▾ · Pricing · Blog · Contact Us | Log in · Sign up`. Auth actions are *only* Log in and Sign up — no "Create Resume" or any third action in the navbar.
- **Hero copy is immutable.** Headline, subhead, both CTA labels, trust line, and eyebrow text are copied verbatim from the current `JobflixHero.tsx` — only layout, spacing, and canvas color change.
- **Hero card cluster is one composition, not three widgets.** Cards: 1. Mentorship & Referrals, 2. Latest Jobs, 3. Courses — built and laid out as a single unit with connectors, overlap, and a size hierarchy (Courses largest, Latest Jobs smallest, Mentorship mid).
- **Trust strip:** only the existing 6 company names (`Google, Stripe, Airbnb, Figma, Notion, Spotify`) — never invent companies.
- **Final acceptance test:** side-by-side squint test against the V3 mockup — composition, spacing, hierarchy, alignment, proportions, whitespace, rhythm must feel nearly identical. Only acceptable differences: ResumeAssist branding, content, product cards, design tokens. Not done until this passes.
- **Execution discipline (added at the user's request):** work proceeds in 7 milestones. After each milestone's steps are complete, **stop and wait for explicit human review approval** before starting the next milestone — regardless of how confident the implementation feels. No milestone may be skipped or merged with another.

---

## File Structure

| File | Responsibility | Introduced in |
|---|---|---|
| `src/components/marketing/nav-links.ts` (new) | Shared `JOB_LINKS` / `LEARN_LINKS` dropdown data — single source of truth for both the shared `Navbar` and the new `MarketingNavbar`. | Milestone 1 |
| `src/components/navbar.tsx` (modified, data-only) | Shared navbar for all non-homepage pages — imports link data instead of declaring it inline. No rendering/behavior change. | Milestone 1 |
| `src/components/marketing/MarketingNavbar.tsx` (new) | Fresh, homepage-only navbar: 3-zone flex, light canvas, 64px, Log in + Sign up only. | Milestone 1 |
| `src/components/AnimatedPinDemo.tsx` (modified) | Renders `<MarketingNavbar />` instead of `<Navbar tone="light" />`. | Milestone 1 |
| `src/components/marketing/primitives.tsx` (modified) | `LogoStrip` gains `tone`/`spread` props (default preserves current dark/marketing usage everywhere else it's called). | Milestone 2 |
| `src/components/marketing/JobflixHero.tsx` (modified) | Light canvas, retuned spacing, left column, grid shell, trust strip. Right column starts as a placeholder (Milestone 2), then becomes `HeroCardCluster` (Milestone 3). | Milestones 2, 3 |
| `src/components/marketing/hero/HeroPanel.tsx` (deleted) | No longer used anywhere once `JobflixHero`'s right column changes — confirmed zero other callers. | Milestone 2 |
| `src/components/marketing/hero/hero-cluster-data.ts` (new) | Typed content for the 3 hero cards. | Milestone 3 |
| `src/components/marketing/hero/HeroCardCluster.tsx` (new) | The 3-card connected composition. | Milestone 3 |

---

## Milestone 1 — Navbar

**Scope:** Build the new homepage-only `MarketingNavbar`, matching the approved V3 navbar composition. Do not touch the shared `Navbar`'s rendering or behavior. Wire it into the homepage so it's reviewable in a running browser. **Stop for review after this milestone.**

### Task 1.1: Extract shared nav-link data (no behavior change)

**Files:**
- Create: `src/components/marketing/nav-links.ts`
- Modify: `src/components/navbar.tsx:1-26`
- Test: `src/__tests__/nav-links.test.ts`

**Interfaces:**
- Produces: `JOB_LINKS: NavDropdownLink[]`, `LEARN_LINKS: NavDropdownLink[]`, `type NavDropdownLink = { name: string; href: string; description: string; icon: LucideIcon; external?: boolean }` — consumed by Task 1.2 (`MarketingNavbar`).

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

- [ ] **Step 6: Commit**

```bash
git add src/components/marketing/nav-links.ts src/components/navbar.tsx src/__tests__/nav-links.test.ts
git commit -m "refactor: extract shared nav-link data out of navbar.tsx"
```

### Task 1.2: Build `MarketingNavbar` — fresh, homepage-only navbar

**Files:**
- Create: `src/components/marketing/MarketingNavbar.tsx`

**Interfaces:**
- Consumes: `JOB_LINKS`, `LEARN_LINKS` (Task 1.1, `./nav-links`), `Container`, `Button` (`./primitives`), `useUserStore` (`../../stores/useUserStore`).
- Produces: `MarketingNavbar()` — no props, consumed by `AnimatedPinDemo.tsx` (Task 1.3).

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

### Task 1.3: Wire `MarketingNavbar` into the homepage + regression check

**Files:**
- Modify: `src/components/AnimatedPinDemo.tsx:3-30`

- [ ] **Step 1: Point `AnimatedPinDemo.tsx` at the new navbar**

Change line 3 from:

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

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit -p .`
Expected: no new errors.

- [ ] **Step 3: Verify the new navbar renders on the homepage**

Run: `npm run dev`, open `http://localhost:3002/`. Confirm the new navbar (light bg, 64px, Job Referrals/Jobs▾/Learn▾/Pricing/Blog/Contact Us + Log in/Sign up) renders above the still-unmodified dark hero — it will look visually mismatched with the dark hero at this point (expected; the hero doesn't move to the light canvas until Milestone 2). This step only confirms the navbar itself is correct and functional (dropdowns open, mobile menu works at a narrow viewport, Sign up links to `/create`).

- [ ] **Step 4: Run the full test suite**

Run: `npx vitest run`
Expected: all tests pass, including the pre-existing `src/__tests__/navbar.test.ts` (untouched by this plan — it mirrors a data shape independent of the actual component and is unaffected by Task 1.1's refactor).

- [ ] **Step 5: Regression check on 3 non-homepage pages using the shared `Navbar`**

With `npm run dev` running, visit `http://localhost:3002/pricing`, `http://localhost:3002/find-jobs`, and `http://localhost:3002/blog`. Confirm each still renders its (unchanged) navbar exactly as before — Task 1.1 only moved constant declarations, so there should be zero visual difference here.

- [ ] **Step 6: Commit**

```bash
git add src/components/AnimatedPinDemo.tsx
git commit -m "feat: wire MarketingNavbar into the homepage"
```

### 🛑 STOP — Milestone 1 review checkpoint

Report back with a screenshot of the new navbar on the homepage and confirmation that Task 1.3 Steps 4-5 passed. **Do not start Milestone 2 without approval.**

---

## Milestone 2 — Hero Layout (no cards yet, no responsiveness yet)

**Scope:** Move `JobflixHero` to the light canvas, implement the left column with the existing copy verbatim, build the two-column grid shell. The right column gets an explicit, visibly-temporary placeholder — the real `HeroCardCluster` is Milestone 3's job, not this one. **Stop for review after this milestone.**

### Task 2.1: Extend `LogoStrip` with light-canvas + full-width-spread support

The trust strip lives inside `JobflixHero`, so this has to land in this milestone too — otherwise the hero would ship with illegible white-on-light-background logo text. It's a small, additive, default-preserving prop extension, not new design language.

**Files:**
- Modify: `src/components/marketing/primitives.tsx:299-311`

**Interfaces:**
- Produces: `LogoStrip({ names, className, tone = "dark", spread = false })` — both new props default to today's exact behavior, so every other existing call site is visually unaffected.
- Consumes (Task 2.2): `<LogoStrip names={hiredAt} tone="light" spread className="mt-6" />`

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
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/primitives.tsx
git commit -m "feat: add light/spread variants to LogoStrip"
```

### Task 2.2: Rewrite `JobflixHero` for the light canvas — left column, grid shell, placeholder right column

**Files:**
- Modify: `src/components/marketing/JobflixHero.tsx` (full file)
- Delete: `src/components/marketing/hero/HeroPanel.tsx`

**Interfaces:**
- Consumes: light/spread `LogoStrip` (Task 2.1).
- Produces: a right-column placeholder slot that Milestone 3's Task 3.2 will replace with `<HeroCardCluster />`.

`HeroPanel` becomes fully unused once this file stops importing it (confirmed zero other callers) — delete it now rather than leave dead code sitting through two milestones.

- [ ] **Step 1: Delete the now-unused `HeroPanel`**

```bash
git rm src/components/marketing/hero/HeroPanel.tsx
```

- [ ] **Step 2: Rewrite `JobflixHero.tsx`**

```typescript
// src/components/marketing/JobflixHero.tsx
/**
 * JobFlix Marketing — Hero.
 * Reverse-engineered against Clay's composition (see
 * docs/superpowers/specs/2026-07-12-hero-navbar-clay-composition-design.md):
 * same eyebrow/headline/subhead/CTA/trust-line content as before, now on
 * ResumeAssist's light canvas. Right column is a temporary placeholder —
 * HeroCardCluster lands in Milestone 3.
 */
import { ArrowRight } from "lucide-react";
import { Container, MonoLabel, Button, LogoStrip } from "./primitives";

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

          {/* Right — TEMPORARY placeholder. Milestone 3 replaces this div
              with <HeroCardCluster />. Deliberately obvious/dashed so it
              reads as unfinished, not as a design decision. */}
          <div className="flex h-[560px] items-center justify-center rounded-[var(--jf-radius-frame)] border border-dashed border-border-frame text-sm text-ink-400">
            HeroCardCluster — Milestone 3
          </div>
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

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit -p .`
Expected: no new errors.

- [ ] **Step 4: Verify the homepage renders on one light canvas**

Run: `npm run dev`, open `http://localhost:3002/`. Confirm: navbar (Milestone 1) and hero now share one continuous light background with no dark band anywhere in the first viewport; left column shows the exact same headline/subhead/CTAs/trust-line copy as before, just restyled for light; right column shows the dashed placeholder box at roughly the right proportions; trust strip logos are legible (dark text on light bg) and spread across the full container width; no console errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/marketing/JobflixHero.tsx
git commit -m "feat: move hero to light canvas with left column + grid shell (placeholder right column)"
```

### 🛑 STOP — Milestone 2 review checkpoint

Report back with a screenshot of the full-width homepage hero (placeholder box included) and confirm Step 4 passed. **Do not start Milestone 3 without approval.**

---

## Milestone 3 — Hero Card Cluster

**Scope:** Build the three-card illustration (Mentorship & Referrals, Latest Jobs, Courses) as one connected composition and swap it into the placeholder slot from Milestone 2. **Stop for review after this milestone.**

### Task 3.1: Hero card cluster content data

**Files:**
- Create: `src/components/marketing/hero/hero-cluster-data.ts`
- Test: `src/__tests__/hero-cluster-data.test.ts`

**Interfaces:**
- Produces: `HERO_CLUSTER_CARDS: HeroClusterCardData[]`, `type HeroClusterCardData = { step: string; title: string; href: string; footer: string; rows: { letter: string; title: string; meta: string }[] }` — consumed by Task 3.2 (`HeroCardCluster`).

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

### Task 3.2: Build `HeroCardCluster` and swap it into the hero

**Files:**
- Create: `src/components/marketing/hero/HeroCardCluster.tsx`
- Modify: `src/components/marketing/JobflixHero.tsx` (import + placeholder swap only)

**Interfaces:**
- Consumes: `HERO_CLUSTER_CARDS` (Task 3.1), `ProductFrame`/`RowChip` (`../primitives`).
- Produces: `HeroCardCluster()` — no props, consumed by `JobflixHero.tsx`.

One component file (not three separate card components), so the numbered narrative, connectors, sizing hierarchy, and overlap are authored together as one unit — this is the "one composition, not three widgets" constraint. Positions are transcribed from the approved V3 mockup (`reference-match-v3.html`'s `.v3-c1`/`.v3-c2`/`.v3-c3`/connector `<path>` coordinates), scaled for `ProductFrame`'s 20px frame padding (the mockup's raw HTML used 14px) — this is Rule 1's measured starting point, refined further in Milestone 5's audit, not a final guess.

- [ ] **Step 1: Write the component**

```typescript
// src/components/marketing/hero/HeroCardCluster.tsx
import Link from "next/link";
import { ProductFrame, RowChip } from "../primitives";
import { HERO_CLUSTER_CARDS, type HeroClusterCardData } from "./hero-cluster-data";

/*
 * Card 3 (Courses) is the largest/most dominant; Card 2 (Latest jobs) is
 * the smallest; Card 1 (Mentorship) is mid-sized — matching the
 * reference's visual weighting. This is the pixel-accuracy source of
 * truth for Milestone 5's audit, not a first guess to be redesigned later.
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

- [ ] **Step 2: Swap the placeholder in `JobflixHero.tsx`**

Add the import (after the `primitives` import):

```typescript
import { HeroCardCluster } from "./hero/HeroCardCluster";
```

Replace the placeholder div:

```typescript
          <div className="flex h-[560px] items-center justify-center rounded-[var(--jf-radius-frame)] border border-dashed border-border-frame text-sm text-ink-400">
            HeroCardCluster — Milestone 3
          </div>
```

with:

```typescript
          <HeroCardCluster />
```

- [ ] **Step 3: Verify it compiles and renders**

Run: `npx tsc --noEmit -p .`
Expected: no new errors.

Run: `npm run dev`, open `http://localhost:3002/`. Confirm the 3 cards render to the right of the headline with visible size hierarchy (Courses biggest, Latest Jobs smallest) and connector lines between them, no console errors. Exact pixel positioning is refined in Milestone 5 — this step only confirms the composition is structurally present and correct (3 cards, connectors, right content, links to `/referrals`, `/find-jobs`, and the external Courses URL).

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/hero/HeroCardCluster.tsx src/components/marketing/JobflixHero.tsx
git commit -m "feat: add HeroCardCluster, swap into hero right column"
```

### 🛑 STOP — Milestone 3 review checkpoint

Report back with a screenshot of the full hero (real card cluster, not the placeholder). **Do not start Milestone 4 without approval.**

---

## Milestone 4 — Trust Strip

**Scope:** The trust strip is already functionally wired (Milestone 2, Task 2.1/2.2) so the hero wouldn't ship broken. This milestone is the dedicated polish/verification pass: confirm it uses only the existing 6 companies, and refine its spacing/rhythm to match the approved V3 composition exactly. **Stop for review after this milestone.**

### Task 4.1: Verify content and refine spacing against V3

**Files:**
- Modify: `src/components/marketing/JobflixHero.tsx` (trust-strip block only, if refinement is needed)

- [ ] **Step 1: Confirm company list**

Open `src/components/marketing/JobflixHero.tsx` and confirm `hiredAt` is exactly `["Google", "Stripe", "Airbnb", "Figma", "Notion", "Spotify"]` — no additions, no substitutions. This should already be true from Milestone 2; this step is a check, not a change.

- [ ] **Step 2: Compare against V3's trust-strip composition**

With `npm run dev` running, open the homepage and the approved V3 mockup (`resumeassist/.superpowers/brainstorm/2131-1783833045/content/reference-match-v3.html`) side by side at 1440px width. Compare specifically: the vertical gap between the hero grid and the trust strip's top border, the gap between the "hired at ↘" label and the logo row, and the horizontal distribution of the 6 logos across the 1240px container.

- [ ] **Step 3: Fix any spacing differences found**

Adjust the `mt-[...]`/`pt-8`/`mt-6` values in the trust-strip block of `JobflixHero.tsx` to close any gap found in Step 2. If no differences are found, state that explicitly rather than skipping this step.

- [ ] **Step 4: Commit** (only if Step 3 changed anything)

```bash
git add src/components/marketing/JobflixHero.tsx
git commit -m "fix: refine trust-strip spacing to match V3 mockup"
```

### 🛑 STOP — Milestone 4 review checkpoint

Report back with a screenshot of the trust strip and confirm the company list matches exactly. **Do not start Milestone 5 without approval.**

---

## Milestone 5 — Desktop Pixel Refinement (most important milestone)

**Scope:** Do not consider the first implementation final. Iterate — compare, list differences, fix, compare again — until the desktop composition has no meaningful gap against V3 in spacing, alignment, proportions, hierarchy, or visual rhythm. **Only after this milestone passes should tablet/mobile work begin. Stop for review after this milestone.**

### Task 5.1: Iterative desktop audit loop

**Files:** `src/components/marketing/MarketingNavbar.tsx`, `src/components/marketing/JobflixHero.tsx`, `src/components/marketing/hero/HeroCardCluster.tsx` — iterated on directly based on audit findings.

This task is the loop itself, not a single pass.

- [ ] **Step 1: Capture the approved target**

With the dev server running, open the approved V3 mockup at its saved path at a 1440×1024 viewport and take a screenshot.

- [ ] **Step 2: Capture the implementation**

Navigate to `http://localhost:3002/` at the same 1440×1024 viewport and screenshot the full first viewport (navbar + hero + trust strip).

- [ ] **Step 3: List every visual difference**

Write down each concrete difference — e.g. "navbar height reads taller than 64px," "card cluster sits too low relative to the headline," "Courses card doesn't read as the largest," "connector lines are misaligned," "headline width doesn't match V3's line-break point." Do not write "looks close enough" — list specifics, or state explicitly that none were found.

- [ ] **Step 4: Fix every listed difference**

For each difference, adjust the relevant classes/values in the responsible file (navbar spacing → `MarketingNavbar.tsx`; hero grid/typography spacing → `JobflixHero.tsx`; card sizes/positions/connectors → `HeroCardCluster.tsx`'s `CARD_POSITION` map and SVG path coordinates). Re-run `npx tsc --noEmit -p .` after each batch of edits.

- [ ] **Step 5: Re-capture and re-compare**

Repeat Steps 2-4 until Step 3 produces no new findings.

- [ ] **Step 6: Commit each meaningful fix pass**

```bash
git add -A
git commit -m "fix: desktop pixel-accuracy pass against approved V3 mockup"
```

(Repeat this commit for each iteration of Steps 2-5 that changed code — small, frequent commits, not one giant diff at the end.)

### 🛑 STOP — Milestone 5 review checkpoint

Report back with the final side-by-side screenshot pair and the list of differences found/fixed across all iterations. **Do not start Milestone 6 without approval — this is the gate the user explicitly called the most important one.**

---

## Milestone 6 — Responsive Adaptation

**Scope:** Only after Milestone 5 is approved. Adapt tablet and mobile while preserving the same visual hierarchy and composition as closely as possible. **Stop for review after this milestone.**

### Task 6.1: Tablet and mobile passes

**Files:** `src/components/marketing/MarketingNavbar.tsx`, `src/components/marketing/JobflixHero.tsx`, `src/components/marketing/hero/HeroCardCluster.tsx`

- [ ] **Step 1: Tablet pass (820×1180 viewport)**

Resize to 820×1180, screenshot the homepage. Verify: navbar collapses into the mobile hamburger pattern if the 6 links don't fit (adjust the `md:` breakpoint in `MarketingNavbar.tsx` if needed); hero grid narrows its gap before dropping to one column; the 3-card cluster scales down proportionally (adjust `CARD_POSITION` widths/offsets with a size variant) rather than becoming three equal-sized stacked blocks.

- [ ] **Step 2: Mobile pass (390×844 viewport)**

Resize to 390×844, screenshot the homepage. Verify: hero is single-column; decide whether the 3-card cluster shows a simplified single dominant card (Courses) with the other two hidden below a breakpoint, or a compact stacked view — pick whichever reads closer to "one illustration" rather than "three unrelated boxes," and implement it as a breakpoint-gated split in `HeroCardCluster.tsx`.

- [ ] **Step 3: Verify no horizontal scroll at either width**

Confirm there's no horizontal scrollbar at either viewport (a common sign of an unclamped absolutely-positioned card escaping its container) — if present, constrain `HeroCardCluster`'s wrapper with `overflow-hidden` or adjust the offending card's offset.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: tablet and mobile responsive pass, preserving hero composition"
```

### 🛑 STOP — Milestone 6 review checkpoint

Report back with tablet and mobile screenshots. **Do not start Milestone 7 without approval.**

---

## Milestone 7 — Final Verification

**Scope:** One final visual audit and full regression pass. Only after this passes is the implementation complete.

### Task 7.1: Squint test + full regression

- [ ] **Step 1: Squint test**

Place the V3 mockup screenshot (Milestone 5, Step 1) and a fresh implementation screenshot (1440×1024) side by side. Confirm composition, spacing, hierarchy, alignment, proportions, whitespace, and rhythm feel nearly identical. The only differences should be ResumeAssist branding/content/cards/tokens — if any element of the navbar or hero still reads as "the old ResumeAssist layout," go back to Milestone 5.

- [ ] **Step 2: Full automated regression**

Run: `npx vitest run` — all pass.
Run: `npx tsc --noEmit -p .` — no new errors.
Run: `npm run lint` — no new errors.
Run: `npm run build` — succeeds.

- [ ] **Step 3: Final manual regression on 3 other pages** (repeat of Milestone 1's Task 1.3 Step 5, as a closing sanity check after all hero/navbar work is done)

Visit `http://localhost:3002/pricing`, `http://localhost:3002/find-jobs`, `http://localhost:3002/blog` — confirm the shared `Navbar` still renders exactly as it did before this project started.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final acceptance pass — hero/navbar Clay-composition redesign complete"
```

### 🛑 Final checkpoint

Report back with the squint-test screenshots and confirmation that Steps 2-3 passed. Only mark the project complete after explicit approval here.
