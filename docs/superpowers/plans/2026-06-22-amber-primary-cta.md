# Amber Primary CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all black/near-black primary CTA buttons on the Referrals pages with the amber (`#f59e0b`) design system token, delivered via a new `variant="primary"` in `src/components/ui/button.tsx`.

**Architecture:** Add one new CVA variant (`primary`) to the shared shadcn Button. Refactor every CTA on the three Referrals pages to use it. Update the design-system guidelines to reflect the new default primary color. Leave every non-referrals page untouched in this PR.

**Tech Stack:** Next.js 15, React, Tailwind CSS v4, `class-variance-authority` (cva), `src/components/ui/button.tsx` (shadcn pattern).

## Global Constraints

- Amber primary: `bg-amber-500 (#f59e0b)` · hover: `bg-amber-400 (#fbbf24)` · text: `text-slate-950 (#020617)`
- `rounded-xl` is the referrals-page radius — pass via `className`, not baked into the variant
- Do NOT touch backend, API routes, auth flow logic, or any file outside the list in each task
- Preserve all `variant="outline"`, `variant="ghost"`, `variant="secondary"`, `variant="destructive"` buttons
- Do NOT change the yellow-badge eyebrow label `text-[#4353CF]` on become-referrer (typography-only, out of scope)
- `amber-500` is NOT remapped by this project's `@theme` block — it resolves to standard Tailwind value

---

## File Map

| File | Action | Reason |
|---|---|---|
| `src/components/ui/button.tsx` | Modify | Add `primary` variant to CVA |
| `docs/design-system/resumeassist-ui-guidelines.md` | Modify | Update §4 CTA tokens, §5 Primary CTA Pattern, §11 Referrals |
| `app/referrals/page.tsx` | Modify | 4 black CTAs → `variant="primary"` |
| `app/referrals/list/page.tsx` | Modify | 2 raw `<button>` Contact elements → amber className |
| `app/referrals/become-referrer/page.tsx` | Modify | 1 indigo button → `variant="primary"` |
| `src/components/navbar.tsx` | Modify | Mobile Login button → `variant="primary"` |

---

### Task 1: Add `primary` variant to button.tsx

**Files:**
- Modify: `src/components/ui/button.tsx`

**Interfaces:**
- Produces: `variant="primary"` accepted by `<Button>` — classes: `bg-amber-500 text-slate-950 shadow-sm hover:bg-amber-400 active:scale-[0.98] transition-colors`

- [ ] **Step 1: Open and read `src/components/ui/button.tsx`**

Confirm current variants are: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`.

- [ ] **Step 2: Add the `primary` variant**

In `src/components/ui/button.tsx`, inside the `variants.variant` object, add after `link`:

```ts
primary:
  "bg-amber-500 text-slate-950 shadow-sm hover:bg-amber-400 active:scale-[0.98] transition-colors",
```

Full updated variants block:

```ts
variants: {
  variant: {
    default:
      "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
    destructive:
      "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
    outline:
      "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
    secondary:
      "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
    ghost:
      "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
    link: "text-primary underline-offset-4 hover:underline",
    primary:
      "bg-amber-500 text-slate-950 shadow-sm hover:bg-amber-400 active:scale-[0.98] transition-colors",
  },
  // ... rest unchanged
```

- [ ] **Step 3: Verify TypeScript accepts it**

Run from `resumeassist/`:
```
npx tsc --noEmit 2>&1 | grep -i "button\|primary"
```
Expected: no errors mentioning `button.tsx` or the `primary` variant.

---

### Task 2: Update design-system guidelines

**Files:**
- Modify: `docs/design-system/resumeassist-ui-guidelines.md`

**Interfaces:**
- Consumes: `variant="primary"` from Task 1
- Produces: updated §4, §5, §11, §13 describing the amber primary system

- [ ] **Step 1: Update §4 Primary/CTA token table**

Replace the current §4 Primary/CTA section:

```markdown
#### Primary / CTA

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| App primary CTA | — | `#f59e0b` (`bg-amber-500`) | Primary action buttons — `variant="primary"` |
| Primary CTA hover | — | `#fbbf24` (`bg-amber-400`) | Hover state on primary buttons |
| Primary CTA text | — | `#020617` (`text-slate-950`) | Text on amber CTA backgrounds |
| shadcn primary | `--primary` | `#18181b` | shadcn `variant="default"`, toggles only |
| Primary foreground | `--primary-foreground` | `#fafafa` | Text on `variant="default"` backgrounds |
```

- [ ] **Step 2: Update §5 Primary CTA Pattern**

Replace the Primary CTA Pattern code block:

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

Also remove the old near-black example and replace the introductory sentence to read:
> ResumeAssist primary CTAs use amber (`bg-amber-500 / #f59e0b`) via `variant="primary"` on `src/components/ui/button.tsx`. Near-black (`bg-neutral-900`) is no longer the default primary CTA color.

- [ ] **Step 3: Update §11 Referrals > Buttons**

Replace:
```markdown
- "Contact" / "Connect" buttons: use `bg-neutral-900 text-white hover:bg-neutral-700 rounded-lg font-semibold` — **not indigo, not purple, not violet**.
```

With:
```markdown
- "Contact" / "Connect" / primary action buttons: use `variant="primary"` from `src/components/ui/button.tsx` with `className="rounded-xl"`. Do **not** use indigo, purple, violet, or near-black (`bg-neutral-900`) for primary actions.
```

- [ ] **Step 4: Update §13 Premium Unlock CTA — add note distinguishing it from the new primary**

Append to the Notes bullet list in §13:
```markdown
- The `variant="primary"` in `src/components/ui/button.tsx` uses the same amber fill. The distinction is semantic: `variant="primary"` is for all primary actions; the `UnlockCta` reference implementation is the specific membership paywall CTA shape (pill, `shadow-lg shadow-amber-500/20`, `hover:-translate-y-0.5`).
```

---

### Task 3: Refactor `app/referrals/page.tsx`

**Files:**
- Modify: `app/referrals/page.tsx`

**Interfaces:**
- Consumes: `variant="primary"` from Task 1

There are **4 black CTAs** to change in this file.

- [ ] **Step 1: "Ask for referral" hero button**

Find:
```tsx
<Button
  onClick={() => setIsModalOpen(true)}
  className="h-11 rounded-xl bg-neutral-900 px-6 text-white shadow-sm hover:bg-neutral-700 active:scale-[0.98]"
>
  Ask for referral
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

Replace with:
```tsx
<Button
  variant="primary"
  onClick={() => setIsModalOpen(true)}
  className="h-11 rounded-xl px-6"
>
  Ask for referral
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
```

- [ ] **Step 2: "Search" inline button (raw `<button>` inside search bar)**

Find:
```tsx
<button
  onClick={handleSearch}
  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-xl bg-neutral-900 px-3 sm:px-5 text-sm font-semibold text-white transition hover:bg-neutral-700 active:scale-[0.98]"
>
  Search
</button>
```

Replace with:
```tsx
<button
  onClick={handleSearch}
  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-xl bg-amber-500 px-3 sm:px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 active:scale-[0.98]"
>
  Search
</button>
```

*(Kept as raw `<button>` because of the `absolute` positioning context — converting to Button component would require adding all positioning classes via className.)*

- [ ] **Step 3: "+ Become a Referrer" banner button**

Find:
```tsx
<Button
  asChild
  className="h-10 flex-shrink-0 rounded-xl bg-neutral-900 px-5 text-sm text-white hover:bg-neutral-700"
>
  <Link href="/referrals/become-referrer">
    + Become a Referrer
  </Link>
</Button>
```

Replace with:
```tsx
<Button
  asChild
  variant="primary"
  className="h-10 flex-shrink-0 rounded-xl px-5 text-sm"
>
  <Link href="/referrals/become-referrer">
    + Become a Referrer
  </Link>
</Button>
```

- [ ] **Step 4: "Submit referral request" modal button**

Find:
```tsx
<Button
  type="submit"
  disabled={submitting}
  className="h-11 rounded-xl bg-neutral-900 px-5 text-white hover:bg-neutral-700"
>
  {submitting ? "Sending..." : "Submit referral request"}
</Button>
```

Replace with:
```tsx
<Button
  type="submit"
  variant="primary"
  disabled={submitting}
  className="h-11 rounded-xl px-5"
>
  {submitting ? "Sending..." : "Submit referral request"}
</Button>
```

- [ ] **Step 5: TypeScript check**
```
npx tsc --noEmit 2>&1 | grep "referrals/page"
```
Expected: no errors.

---

### Task 4: Refactor `app/referrals/list/page.tsx`

**Files:**
- Modify: `app/referrals/list/page.tsx`

**Interfaces:**
- Consumes: amber color tokens directly (raw `<button>` elements)

There are **2 Contact button instances** using `bg-neutral-900` (the active/initial state, and the static-item state).

- [ ] **Step 1: Static-item Contact button**

Find (first occurrence, `isStaticItem` branch):
```tsx
className="h-9 w-full rounded-xl bg-neutral-900 text-xs font-semibold text-white transition-colors hover:bg-neutral-700 active:scale-[0.98]"
```

Replace with:
```tsx
className="h-9 w-full rounded-xl bg-amber-500 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400 active:scale-[0.98]"
```

- [ ] **Step 2: Default (non-static) Contact button**

Find (second occurrence, the `revealState === undefined` branch):
```tsx
className="h-9 w-full rounded-xl bg-neutral-900 text-xs font-semibold text-white transition-colors hover:bg-neutral-700 active:scale-[0.98]"
```

Replace with:
```tsx
className="h-9 w-full rounded-xl bg-amber-500 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400 active:scale-[0.98]"
```

*(The `revealState === "loading"` → `bg-neutral-400` and `revealState === "error"` → rose styling are intentional non-primary states — do NOT change them.)*

- [ ] **Step 3: TypeScript check**
```
npx tsc --noEmit 2>&1 | grep "referrals/list"
```
Expected: no errors.

---

### Task 5: Refactor `app/referrals/become-referrer/page.tsx`

**Files:**
- Modify: `app/referrals/become-referrer/page.tsx`

**Interfaces:**
- Consumes: `variant="primary"` from Task 1

There is **1 indigo CTA** to fix (design system violation — `bg-[#4353CF]`) plus the form submit button.

- [ ] **Step 1: "Back to referrals hub" success-state button**

Find:
```tsx
<Button
  asChild
  className="rounded-xl bg-[#4353CF] px-6 text-white hover:bg-[#3645b5]"
>
  <Link href="/referrals">Back to referrals hub</Link>
</Button>
```

Replace with:
```tsx
<Button
  asChild
  variant="primary"
  className="rounded-xl px-6"
>
  <Link href="/referrals">Back to referrals hub</Link>
</Button>
```

- [ ] **Step 2: Check for any other black/indigo buttons in this file**

Run:
```
grep -n "bg-neutral-900\|bg-slate-900\|bg-\[#4353CF\]\|bg-\[#" app/referrals/become-referrer/page.tsx
```
Expected: zero results after Step 1.

*(The form submit button in become-referrer uses the standard default `Button` — it is already handled by the existing variant; do not change it unless it has `bg-neutral-900` inline.)*

- [ ] **Step 3: TypeScript check**
```
npx tsc --noEmit 2>&1 | grep "become-referrer"
```
Expected: no errors.

---

### Task 6: Refactor `src/components/navbar.tsx` mobile Login button

**Files:**
- Modify: `src/components/navbar.tsx`

**Interfaces:**
- Consumes: `variant="primary"` from Task 1

There is **1 mobile Login button** using conditional `bg-slate-900`.

- [ ] **Step 1: Mobile Login button**

Find:
```tsx
<Button
  size="sm"
  className={cn("w-full", isLight ? "bg-slate-900 text-white hover:bg-slate-800" : "")}
  onClick={() =>
    window.location.href = `${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login?next=${encodeURIComponent(window.location.origin)}`
  }
>
  Login
</Button>
```

Replace with:
```tsx
<Button
  size="sm"
  variant="primary"
  className="w-full rounded-lg"
  onClick={() =>
    window.location.href = `${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login?next=${encodeURIComponent(window.location.origin)}`
  }
>
  Login
</Button>
```

*(The `isLight` conditional is removed — `variant="primary"` is always amber regardless of navbar tone. The `rounded-lg` override matches navbar button radius convention.)*

- [ ] **Step 2: TypeScript check**
```
npx tsc --noEmit 2>&1 | grep "navbar"
```
Expected: no errors.

---

### Task 7: Visual validation with Playwright

**Files:** None modified — validation only.

- [ ] **Step 1: Take before/after screenshots of all three Referrals pages**

Navigate to and screenshot:
1. `http://localhost:3002/referrals` — check "Ask for referral", "Search", "+ Become a Referrer" buttons
2. `http://localhost:3002/referrals/list` — check "Contact" buttons on referrer cards
3. `http://localhost:3002/referrals/become-referrer` — check success state (or inspect form submit button)

- [ ] **Step 2: Confirm amber color renders**

In Playwright or browser, verify each button shows `#f59e0b` background, `#020617` text, no black/neutral-900 on any primary CTA.

- [ ] **Step 3: Full TypeScript clean run**

```
npx tsc --noEmit 2>&1 | grep -v "node_modules" | head -20
```
Expected: same pre-existing errors as before (3 known errors in test files and `job-tracker-page.tsx`) — zero new errors.

- [ ] **Step 4: Confirm preserved variants untouched**

Verify the following are unchanged (visual inspection):
- All `variant="outline"` buttons on Referrals pages (Cancel, Update profile, View referrals board)
- All `variant="ghost"` buttons (modal close, etc.)
- Paywall membership CTAs in `hr-emails-table.tsx`, `job-board.tsx`, `sidebar-demo.tsx` (already amber — no change needed)

---

## Self-Review

**Spec coverage:**
- ✅ Audit all `bg-neutral-900/slate-900/black` buttons — done in research phase
- ✅ Add `variant="primary"` to `src/components/ui/button.tsx`
- ✅ Amber CTA styling applied to new variant
- ✅ Referrals page: Ask for referral, Search, Become a Referrer, Contact buttons
- ✅ Preserve outline, ghost, secondary, destructive variants
- ✅ Design system guidelines updated
- ✅ Playwright screenshot validation

**Buttons intentionally NOT changed in this plan:**
- `payment-section.tsx` highlight button — uses `bg-neutral-900 hover:bg-teal-600`; different visual context (dark pricing card). Out of scope for this PR.
- Job Board / Job Tracker Login fallback buttons — semantic login buttons, not product CTAs. Out of scope.
- Navbar desktop avatar indicator dots (`bg-slate-900` on avatar circle) — decorative, not a button.

**Placeholder scan:** No TBDs, no "implement later", all code blocks are complete.

**Type consistency:** `variant="primary"` string used identically across all tasks. CVA definition in Task 1 matches usage in Tasks 3–6.
