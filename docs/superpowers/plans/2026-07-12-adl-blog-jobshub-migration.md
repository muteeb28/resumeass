# Blog & Jobs Hub ADL Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the presentation (not the IA/content/behavior) of every blog route and the Jobs Hub locked-preview Login CTA onto the Application Design Language (ADL) already implemented on the Homepage, so Homepage / Blog / Blog article / Find Jobs / Resume / Referrals / Pricing / Contact Us all read as one product.

**Architecture:** No new design system is being invented. Every task is a token-substitution + component-substitution pass: replace hardcoded hex/Tailwind-named colors and bespoke markup with the existing `--jf-*` / `ink-*` / `sapphire-*` / `--color-page` / `--color-surface-alt` / `--color-border-soft` CSS custom properties (defined in `src/index.css`) and the existing shared components (`src/components/ui/button.tsx` `Button`, `src/components/background-ripple-layout.tsx` `BackgroundRippleLayout`, `src/components/navbar.tsx` `Navbar`). No new primitives need to be built — the ADL already has everything these pages need.

**Tech Stack:** Next.js App Router, Tailwind CSS v4 (CSS-variable-driven `@theme`), TypeScript, `class-variance-authority` for the `Button` component.

## Global Constraints

- Do NOT change information architecture, routes, data sources, or content copy. `/blog` and `/blog/feed` remain two separate routes with their own distinct content — restyle both, do not merge them (confirmed with user).
- `app/blog/all/page.tsx` (admin CMS) gets the full ADL treatment, same as customer-facing pages (confirmed with user).
- The 6 hardcoded rainbow-accented sections in `src/components/blog-page.tsx` are flattened to ADL ink/sapphire tokens only — no reintroduced rainbow, no reintroduced semantic success/error colors as a substitute palette (confirmed with user).
- Every button that is a real `<button>`/link CTA (not a tab/filter control) must use `Button` from `@/components/ui/button` — no bespoke `<a className="...">` or `<button className="...">` reimplementing pill/shadow/hover CSS that `Button` already provides.
- Product-page shell convention (used by Resume/Referrals/Pricing/Contact Us — treat as canonical): `<BackgroundRippleLayout tone="light" showRipple={false} contentClassName="pt-[74px]"><Navbar tone="light" />...</BackgroundRippleLayout>`.
- ADL heading voice is `font-medium` (weight 500), never `font-bold`/`font-black` — see `src/lib/typography.ts` (`PAGE_TITLE`, `H1_CTA_BAND`, `SECTION_TITLE`, `CARD_TITLE` all use `font-medium`) and the Homepage's own H1–H3 treatments.
- ADL ships one signature accent color for links/active-states/CTAs: sapphire (`--color-sapphire-bright: #2F7BE0`, `--color-sapphire-brand: #1D5FD8`). It does not have a second "brand" accent — amber, teal, and indigo accents found in blog/jobs-hub are legacy and get replaced by sapphire, except where a color is doing genuine semantic work (destructive/error states), which keeps using `--destructive`/`--color-error`.
- Button motion rule (already documented in `src/components/ui/button.tsx`): only `background-color`/`border-color` may transition on a button — no `scale`/`translate` hover animation. Any bespoke button being replaced that had a `hover:-translate-y-0.5` or similar transform loses that transform as part of the migration (this is intentional, not an oversight).

### ADL token reference (used throughout every task below)

| Legacy value | ADL replacement | Notes |
|---|---|---|
| `#fbfbf8` / `bg-slate-50` (page bg) | `bg-page` (`--color-page: #FFFFFF`) | |
| `#0b0b0b` / `text-slate-900` / `bg-slate-900` | `text-ink-900` / `bg-ink-900` (`#0B2A3C`) | |
| `#6b6b6b` / `text-slate-600` / `text-slate-500` | `text-ink-500` (`#647B8E`) or `text-ink-600` (`#3E556B`) for body copy | slate-600→ink-600, slate-500→ink-500 |
| `text-slate-400` | `text-ink-400` (`#93A5B2`) | |
| `#e6e6e3` / `border-slate-200` / `bg-slate-100` / `bg-slate-50` (surfaces/dividers) | `border-border-soft` (`#EEF2F1`) / `bg-surface-alt` (`#F5F8F7`) | |
| `border-slate-300` | `border-border-frame` (`#E4EBEF`) | |
| `#c8c8c4` (subtle separators/dots) | `text-ink-400` | |
| `#2a2a2a` (headline hover) | `text-ink-700` (`#24455B`) | |
| `#aaa` (input placeholder) | `placeholder:text-ink-400` | |
| `amber-500`/`amber-600`/`amber-700` (accent, links, active tab) | `sapphire-bright` (`#2F7BE0`) / `sapphire-brand` (`#1D5FD8`) | |
| `hover:bg-amber-50` | `hover:bg-sapphire-50` | |
| `teal-500`/`teal-600` (prose link) | `sapphire-brand` / `sapphire-700` (`#163F8C`) | |
| `indigo-600` (hover accents) | `sapphire-bright` | |
| rainbow (`emerald`/`sky`/`rose`/`violet`/`teal`/`amber` accent blocks in `blog-page.tsx`) | top bar → `bg-sapphire-bright`; blob → `bg-sapphire-50/70`; card border → `border-border-soft`; pill badge → `bg-sapphire-50 text-sapphire-brand` | flatten per user decision — no exceptions |
| `rose-*` used for a genuine error/not-found state | `destructive` / `text-destructive` / `bg-destructive/10` | keep — this is semantic, not decorative |
| `rounded-xl`/`rounded-2xl`/`rounded-lg`/`rounded-full` (ad hoc) | `rounded-(--jf-radius-frame)` (14px) / `rounded-(--jf-radius-panel)` (20px) / `rounded-(--jf-radius-mini)` (6px) / `rounded-(--jf-radius-pill)` (9999px) | pick by scale: cards/images→frame, hero panels→panel, chips/small tiles→mini, buttons/pills→pill |
| `shadow-sm`/`shadow-md`/ad hoc box-shadow | `shadow-[var(--jf-shadow-frame)]` / `shadow-[var(--jf-shadow-panel)]` / `shadow-[var(--jf-shadow-theatrical-sm)]` | |
| `font-bold`/`font-black` on headings | `font-medium` | |
| `--color-hub-*` / `--font-hub` (Jobs Hub Design System v2) | `ink-*` / `sapphire-*` / `border-soft` / default font (Onest) | see Task 9 |

## File Structure

```
Modify:
  src/components/blog/types.ts              (CATEGORY_GRADIENTS flatten)
  src/components/blog/CategoryTabs.tsx       (full retoken)
  src/components/blog/PostCard.tsx           (full retoken)
  src/components/blog/NewsletterBox.tsx      (full retoken + shared Button)
  src/components/blog/FeaturedPost.tsx       (full retoken)
  src/components/blog/PostsGrid.tsx          (full retoken + shared Button)
  src/components/blog/SidebarTopPosts.tsx    (full retoken)
  app/blog/feed/page.tsx                     (shell + retoken + shared Button)
  src/styles/blog-prose.css                  (full retoken)
  src/components/blog-post.tsx               (shell + retoken + shared Button + prose bug fix)
  src/components/blog-page.tsx               (shell + retoken + flatten rainbow + shared Button)
  app/blog/all/page.tsx                      (full retoken)
  src/components/job-board.tsx               (Login CTA → shared Button, ×2 + amber cleanup)
  src/components/jobs-hub/JobsHubNav.tsx     (full retoken, drop hub-* tokens)
```

No new files are created. No files are deleted.

---

### Task 1: `src/components/blog/types.ts` — flatten category gradients

**Files:**
- Modify: `src/components/blog/types.ts`

- [ ] **Step 1: Replace the gradient map**

Replace lines 45–56 with:

```ts
export const CATEGORY_GRADIENTS: Record<string, string> = {
  "Jobs":         "from-sapphire-50 to-page",
  "Resume":       "from-sapphire-50 to-page",
  "Career Tips":  "from-sapphire-50 to-page",
  "Scholarships": "from-sapphire-50 to-page",
  "Study Abroad": "from-sapphire-50 to-page",
  "Interviews":   "from-sapphire-50 to-page",
  "Remote Work":  "from-sapphire-50 to-page",
  "Internships":  "from-sapphire-50 to-page",
};

export const DEFAULT_GRADIENT = "from-sapphire-50 to-page";
```

- [ ] **Step 2: Verify**

Run: `grep -n "amber\|stone\|neutral\|yellow\|orange\|pink\|sky\|indigo\|rose\|teal\|emerald" src/components/blog/types.ts`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/types.ts
git commit -m "style(blog): flatten category thumbnail gradients to ADL sapphire tokens"
```

---

### Task 2: `src/components/blog/CategoryTabs.tsx` — retoken

**Files:**
- Modify: `src/components/blog/CategoryTabs.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
"use client";

import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({ categories, active, onSelect }: CategoryTabsProps) {
  return (
    <div className="bg-page border-b border-border-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-7 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={cn(
                "flex-shrink-0 py-3.5 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors duration-150 border-b-2 -mb-px",
                active === cat
                  ? "text-ink-900 border-sapphire-bright"
                  : "text-ink-500 border-transparent hover:text-ink-900 hover:border-ink-900/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `grep -n "#0b0b0b\|#6b6b6b\|#fbfbf8\|amber" src/components/blog/CategoryTabs.tsx`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/CategoryTabs.tsx
git commit -m "style(blog): retoken CategoryTabs to ADL ink/sapphire tokens"
```

---

### Task 3: `src/components/blog/PostCard.tsx` — retoken

**Files:**
- Modify: `src/components/blog/PostCard.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BlogPostMeta, getCategoryGradient } from "./types";

interface PostCardProps {
  post: BlogPostMeta;
}

export default function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article>
        {/* Image — no card border, just clean rounded image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-(--jf-radius-frame) mb-4">
          {post.image?.url ? (
            <img
              src={post.image.url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
          ) : (
            <div
              className={cn(
                "w-full h-full bg-gradient-to-br",
                getCategoryGradient(post.category)
              )}
            />
          )}
          {/* Category chip overlay */}
          <span className="absolute bottom-3 left-3 bg-page/90 backdrop-blur-sm text-ink-900 text-[9px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-(--jf-radius-mini)">
            {post.category}
          </span>
        </div>

        {/* Text — open, no container */}
        <div className="space-y-2">
          {/* Meta: author · date · read time */}
          <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
            <span className="font-medium">{post.author.name}</span>
            <span className="text-ink-400">·</span>
            <span>{formattedDate}</span>
            <span className="text-ink-400">·</span>
            <span>{post.readTime}</span>
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-semibold text-ink-900 line-clamp-2 leading-snug group-hover:text-sapphire-bright transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-[13px] text-ink-500 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
```

(Note: `font-bold` → `font-medium`/`font-semibold` per the ADL heading-weight rule — card titles use `font-semibold` here, matching `CARD_TITLE`'s weight for small dense titles.)

- [ ] **Step 2: Verify**

Run: `grep -n "#0b0b0b\|#6b6b6b\|#c8c8c4\|amber\|rounded-xl" src/components/blog/PostCard.tsx`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/PostCard.tsx
git commit -m "style(blog): retoken PostCard to ADL ink/sapphire tokens"
```

---

### Task 4: `src/components/blog/NewsletterBox.tsx` — retoken + shared Button

**Files:**
- Modify: `src/components/blog/NewsletterBox.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div className="border border-dashed border-border-frame rounded-(--jf-radius-frame) p-5 mt-10">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500 mb-1">
        Newsletter
      </p>
      <h3 className="text-[15px] font-semibold text-ink-900 mb-1">
        Don&apos;t miss a thing
      </h3>
      <p className="text-xs text-ink-500 mb-4 leading-relaxed">
        Subscribe to get career resources straight to your inbox.
      </p>

      {submitted ? (
        <p className="text-sm font-medium text-sapphire-brand">
          Thanks, you&apos;re in!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 min-w-0 px-3 py-2 text-[13px] border border-border-soft rounded-(--jf-radius-mini) bg-page text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-sapphire-bright transition-colors"
          />
          <Button type="submit" size="sm" variant="primary" className="flex-shrink-0">
            Subscribe
          </Button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `grep -n "#0b0b0b\|#6b6b6b\|#c8c8c4\|#e6e6e3\|#fbfbf8\|#aaa\|amber\|slate-950" src/components/blog/NewsletterBox.tsx`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/NewsletterBox.tsx
git commit -m "style(blog): retoken NewsletterBox and switch submit to shared Button"
```

---

### Task 5: `src/components/blog/FeaturedPost.tsx` — retoken

**Files:**
- Modify: `src/components/blog/FeaturedPost.tsx`

- [ ] **Step 1: Apply these exact replacements** (structure/layout classes are untouched — only color tokens change)

| Old | New |
|---|---|
| `text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b6b6b] flex-shrink-0` (line 32, "Featured" label) | `text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500 flex-shrink-0` |
| `w-1 h-1 rounded-full bg-amber-500 flex-shrink-0` (line 35, dot) | `w-1 h-1 rounded-full bg-sapphire-bright flex-shrink-0` |
| `text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600` (line 36, category name) | `text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire-brand` |
| `font-bold text-[#0b0b0b] tracking-[-0.02em]` + `group-hover:text-[#2a2a2a] transition-colors` (lines 56–57, headline) | `font-medium text-ink-900 tracking-[-0.02em]` + `group-hover:text-ink-700 transition-colors` |
| `text-[14px] xl:text-[15px] text-[#6b6b6b] leading-relaxed` (line 64, excerpt) | `text-[14px] xl:text-[15px] text-ink-500 leading-relaxed` |
| `border border-[#e6e6e3] flex-shrink-0` (line 75, avatar image border) | `border border-border-soft flex-shrink-0` |
| `w-6 h-6 rounded-full bg-[#e6e6e3] flex items-center justify-center text-[10px] font-bold text-[#6b6b6b] uppercase flex-shrink-0` (line 78, avatar fallback) | `w-6 h-6 rounded-full bg-surface-alt flex items-center justify-center text-[10px] font-bold text-ink-500 uppercase flex-shrink-0` |
| `text-sm font-medium text-[#0b0b0b] whitespace-nowrap` (line 82, author name) | `text-sm font-medium text-ink-900 whitespace-nowrap` |
| `text-[#c8c8c4] flex-shrink-0` (lines 83, 85, separators) | `text-ink-400 flex-shrink-0` |
| `text-sm text-[#6b6b6b] whitespace-nowrap` (lines 84, 86, date/readtime) | `text-sm text-ink-500 whitespace-nowrap` |
| `overflow-hidden rounded-2xl` (line 91, image wrapper) | `overflow-hidden rounded-(--jf-radius-panel)` |

- [ ] **Step 2: Verify**

Run: `grep -n "#0b0b0b\|#6b6b6b\|#c8c8c4\|#e6e6e3\|amber" src/components/blog/FeaturedPost.tsx`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/FeaturedPost.tsx
git commit -m "style(blog): retoken FeaturedPost to ADL ink/sapphire tokens"
```

---

### Task 6: `src/components/blog/PostsGrid.tsx` — retoken + shared Button

**Files:**
- Modify: `src/components/blog/PostsGrid.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
import { BlogPostMeta } from "./types";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";

interface PostsGridProps {
  posts: BlogPostMeta[];
  onClearFilter: () => void;
}

export default function PostsGrid({ posts, onClearFilter }: PostsGridProps) {
  return (
    <section>
      {/* Section header — editorial style */}
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-border-soft">
        <h2 className="text-2xl font-medium text-ink-900 tracking-tight">Recent posts</h2>
        <Button variant="outline" size="sm" onClick={onClearFilter} className="flex-shrink-0">
          View all posts →
        </Button>
      </div>

      {/* 3 / 2 / 1 column grid with generous gutters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run: `grep -n "#0b0b0b\|#e6e6e3\|font-bold" src/components/blog/PostsGrid.tsx`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/PostsGrid.tsx
git commit -m "style(blog): retoken PostsGrid and switch view-all control to shared Button"
```

---

### Task 7: `src/components/blog/SidebarTopPosts.tsx` — retoken

**Files:**
- Modify: `src/components/blog/SidebarTopPosts.tsx`

- [ ] **Step 1: Apply these exact replacements**

| Old | New |
|---|---|
| `lg:pl-10 lg:border-l-2 lg:border-[#e6e6e3]` (line 18) | `lg:pl-10 lg:border-l-2 lg:border-border-soft` |
| `text-[10px] font-bold uppercase tracking-[0.22em] text-[#6b6b6b] mb-3` (line 20, "Top Posts" label) | `text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500 mb-3` |
| `lg:border-b lg:border-[#e6e6e3] lg:last:border-b-0` (line 38) | `lg:border-b lg:border-border-soft lg:last:border-b-0` |
| `w-14 h-14 lg:w-[72px] lg:h-[72px] rounded-xl overflow-hidden` (line 46) | `w-14 h-14 lg:w-[72px] lg:h-[72px] rounded-(--jf-radius-frame) overflow-hidden` |
| `text-[12px] lg:text-[13px] font-semibold text-[#0b0b0b] line-clamp-2 leading-snug group-hover:text-amber-700 transition-colors` (line 65, title) | `text-[12px] lg:text-[13px] font-semibold text-ink-900 line-clamp-2 leading-snug group-hover:text-sapphire-bright transition-colors` |
| `text-[10px] lg:text-[11px] text-[#6b6b6b] leading-none whitespace-nowrap` (line 68, meta) | `text-[10px] lg:text-[11px] text-ink-500 leading-none whitespace-nowrap` |

- [ ] **Step 2: Verify**

Run: `grep -n "#0b0b0b\|#6b6b6b\|#e6e6e3\|amber" src/components/blog/SidebarTopPosts.tsx`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/blog/SidebarTopPosts.tsx
git commit -m "style(blog): retoken SidebarTopPosts to ADL ink/sapphire tokens"
```

---

### Task 8: `app/blog/feed/page.tsx` — shell + retoken + shared Button

**Files:**
- Modify: `app/blog/feed/page.tsx`

**Interfaces:**
- Consumes: `CategoryTabs`, `FeaturedPost`, `SidebarTopPosts`, `NewsletterBox`, `PostsGrid` from Tasks 2–7 (already retokened, no prop changes), `Button` from `@/components/ui/button`, `BackgroundRippleLayout` from `@/components/background-ripple-layout`.

- [ ] **Step 1: Add imports**

Add after the existing `import { Navbar } from '@/components/navbar';` line:

```tsx
import { BackgroundRippleLayout } from '@/components/background-ripple-layout';
import { Button } from '@/components/ui/button';
```

- [ ] **Step 2: Replace the shell wrapper**

Replace:
```tsx
  return (
    <>
      <Navbar tone="light" />

      <main className="pt-16 bg-[#fbfbf8] min-h-screen">
```
with:
```tsx
  return (
    <BackgroundRippleLayout tone="light" showRipple={false} contentClassName="pt-[74px]">
      <Navbar tone="light" />

      <main className="bg-page min-h-screen">
```

And replace the closing:
```tsx
      </main>
    </>
  );
}
```
with:
```tsx
      </main>
    </BackgroundRippleLayout>
  );
}
```

- [ ] **Step 3: Retoken the skeleton, empty state, and pagination**

Replace the first-load skeleton block:
```tsx
            <div className="animate-pulse bg-[#e6e6e3] rounded-2xl h-[420px]" />
            <div className="animate-pulse bg-[#e6e6e3] rounded-2xl h-[420px]" />
```
with:
```tsx
            <div className="animate-pulse bg-border-soft rounded-(--jf-radius-panel) h-[420px]" />
            <div className="animate-pulse bg-border-soft rounded-(--jf-radius-panel) h-[420px]" />
```
and:
```tsx
                <div key={i} className="animate-pulse bg-[#e6e6e3] rounded-xl h-64" />
```
with:
```tsx
                <div key={i} className="animate-pulse bg-border-soft rounded-(--jf-radius-frame) h-64" />
```

Replace the divider:
```tsx
            <div className="border-t border-[#e6e6e3]" />
```
with:
```tsx
            <div className="border-t border-border-soft" />
```

Replace the empty state:
```tsx
              <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
                <p className="text-xl font-bold text-[#0b0b0b] tracking-tight">
                  You&apos;re all caught up.
                </p>
                <p className="text-sm text-[#6b6b6b] max-w-sm leading-relaxed">
                  Explore more career resources or check back soon for new articles.
                </p>
                <button
                  onClick={() => setActiveCategory('All')}
                  className="mt-1 border border-amber-500 text-amber-600 hover:bg-amber-50 px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  ← Browse all topics
                </button>
              </div>
```
with:
```tsx
              <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
                <p className="text-xl font-medium text-ink-900 tracking-tight">
                  You&apos;re all caught up.
                </p>
                <p className="text-sm text-ink-500 max-w-sm leading-relaxed">
                  Explore more career resources or check back soon for new articles.
                </p>
                <Button variant="outline" size="sm" onClick={() => setActiveCategory('All')} className="mt-1">
                  ← Browse all topics
                </Button>
              </div>
```

Replace the "Load more" button:
```tsx
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-10 py-3.5 border border-[#0b0b0b] text-[#0b0b0b] text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-[#0b0b0b] hover:text-white transition-all disabled:opacity-40"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Loading
                    </span>
                  ) : (
                    'Load more articles'
                  )}
                </button>
```
with:
```tsx
                <Button variant="outline" size="lg" onClick={handleLoadMore} disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Loading
                    </span>
                  ) : (
                    'Load more articles'
                  )}
                </Button>
```

Replace the "caught up" caption:
```tsx
              <p className="text-center text-xs text-[#6b6b6b] italic tracking-wide mt-16">
```
with:
```tsx
              <p className="text-center text-xs text-ink-500 italic tracking-wide mt-16">
```

- [ ] **Step 4: Verify**

Run: `grep -n "#0b0b0b\|#6b6b6b\|#e6e6e3\|#fbfbf8\|amber" app/blog/feed/page.tsx`
Expected: no output.

Run: `cd resumeassist && npx tsc --noEmit` (from repo root) — expect no new errors referencing `app/blog/feed/page.tsx`.

- [ ] **Step 5: Commit**

```bash
git add app/blog/feed/page.tsx
git commit -m "style(blog): migrate /blog/feed shell to BackgroundRippleLayout + ADL tokens"
```

---

### Task 9: `src/styles/blog-prose.css` — retoken article typography

**Files:**
- Modify: `src/styles/blog-prose.css`

- [ ] **Step 1: Apply these exact `rgb()` replacements** (`.prose-invert` block, lines 8–52, is confirmed dead/unused — leave untouched, out of scope)

| Old `rgb(...)` | Role | New `rgb(...)` (ADL token) |
|---|---|---|
| `rgb(71 85 105)` | `.prose` base text color (line 3) | `rgb(62 85 107)` (`--color-ink-600`) |
| `rgb(15 23 42)` | h1–h4 / strong / blockquote / code text / table header text (lines 55, 64, 73, 82, 154, 172, 187, 236) | `rgb(11 42 60)` (`--color-ink-900`) |
| `rgb(100 116 139)` | ordered-list numeral color (line 147) | `rgb(100 123 142)` (`--color-ink-500`) |
| `rgb(148 163 184)` | unordered bullet dot (line 130), table thead border (line 232) | `rgb(147 165 178)` (`--color-ink-400`) |
| `rgb(226 232 240)` | blockquote border (line 156), tbody row border (line 246), `<hr>` (line 259) | `rgb(238 242 241)` (`--color-border-soft`) |
| `rgb(241 245 249)` | inline `code` background (line 190) | `rgb(245 248 247)` (`--color-surface-alt`) |
| `rgb(15 23 42)` (pre background, line 197) | `pre` block background | `rgb(7 30 43)` (`--color-navy-900`) |
| `rgb(226 232 240)` (pre text, line 196) | `pre` block text | `rgb(192 207 218)` (`--color-dark-body`) |
| `rgb(20 184 166)` | link color (line 177) | `rgb(29 95 216)` (`--color-sapphire-brand`) |
| `rgb(13 148 136)` | link hover (line 183) | `rgb(22 63 140)` (`--color-sapphire-700`) |

- [ ] **Step 2: Update heading weights to the ADL voice**

Replace `font-weight: 800;` (line 56, `.prose h1`) with `font-weight: 500;`
Replace `font-weight: 700;` (line 65, `.prose h2`) with `font-weight: 500;`
Replace `font-weight: 600;` (line 74, `.prose h3`) with `font-weight: 500;`
Replace `font-weight: 600;` (line 83, `.prose h4`) with `font-weight: 500;`

(`.prose strong` keeps `font-weight: 600` — emphasis inside body copy stays distinct from heading weight.)

- [ ] **Step 3: Verify**

Run: `grep -n "rgb(15 23 42)\|rgb(71 85 105)\|rgb(100 116 139)\|rgb(148 163 184)\|rgb(226 232 240)\|rgb(241 245 249)\|rgb(20 184 166)\|rgb(13 148 136)" src/styles/blog-prose.css`
Expected: no output in the `.prose` (non-`.prose-invert`) rules — occurrences inside `.prose-invert` (lines 8–52) are expected and fine, out of scope.

- [ ] **Step 4: Commit**

```bash
git add src/styles/blog-prose.css
git commit -m "style(blog): retoken article prose typography to ADL ink/sapphire/navy tokens"
```

---

### Task 10: `src/components/blog-post.tsx` — shell, retoken, shared Button, prose fix

**Files:**
- Modify: `src/components/blog-post.tsx`

**Interfaces:**
- Consumes: `Button` from `@/components/ui/button`, `BackgroundRippleLayout` from `@/components/background-ripple-layout`, `blog-prose.css` (Task 9, already retokened).

- [ ] **Step 1: Add imports**

Add near the top (alongside the existing `Navbar` import):
```tsx
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
```
(`Button` is already imported in this file per the existing share-button/CTA usage — confirm the import exists; if it imports from a different path, point it at `@/components/ui/button`.)

- [ ] **Step 2: Replace the root shell**

Replace the outer wrapper (currently a `<div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/60 to-white text-slate-900 antialiased selection:bg-slate-900 selection:text-white">` containing `<Navbar tone="light" />`) with:

```tsx
<BackgroundRippleLayout
  tone="light"
  showRipple={false}
  contentClassName="pt-[74px]"
  className="antialiased selection:bg-ink-900 selection:text-white"
>
  <Navbar tone="light" />
  {/* ...existing body... */}
</BackgroundRippleLayout>
```

Remove the manual `bg-gradient-to-b from-slate-50 via-slate-50/60 to-white text-slate-900` — `BackgroundRippleLayout tone="light"` already supplies flat `bg-page text-ink-900`, matching Contact Us/Pricing/Resume/Referrals (no gradient background is used on any other ADL product page).

- [ ] **Step 3: Apply these exact token replacements throughout the file**

| Old | New |
|---|---|
| `from-slate-100/40 via-amber-50/20 to-transparent` (decorative glow) | `from-surface-alt/40 via-sapphire-50/20 to-transparent` |
| `animate-spin ... border-2 border-slate-900 border-t-transparent` (loading spinner) | `animate-spin ... border-2 border-ink-900 border-t-transparent` |
| `text-sm font-medium text-slate-500 tracking-wide animate-pulse` ("Gathering the insights...") | `text-sm font-medium text-ink-500 tracking-wide animate-pulse` |
| `bg-white border border-slate-200/80 rounded-2xl shadow-sm` (not-found card) | `bg-page border border-border-soft rounded-(--jf-radius-panel) shadow-[var(--jf-shadow-panel)]` |
| `bg-rose-50` / `text-rose-500` (not-found icon circle) | `bg-destructive/10` / `text-destructive` |
| `text-xs font-medium tracking-wider text-slate-400 uppercase` / `hover:text-slate-800` (breadcrumb) | `text-xs font-medium tracking-wider text-ink-400 uppercase` / `hover:text-ink-900` |
| `text-3xl md:text-5xl lg:text-[52px] font-black tracking-tight text-slate-900` (title) | `text-3xl md:text-5xl lg:text-[52px] font-medium tracking-[-0.025em] text-ink-900` |
| `w-9 h-9 rounded-full bg-slate-900 ring-1 ring-slate-200` (author avatar) | `w-9 h-9 rounded-full bg-ink-900 ring-1 ring-border-soft` |
| `text-sm text-slate-500` (meta row) | `text-sm text-ink-500` |
| `bg-slate-100 text-slate-600 rounded-md` (read-time chip) | `bg-surface-alt text-ink-600 rounded-(--jf-radius-mini)` |
| `bg-white hover:bg-slate-100/80 text-slate-600 border border-slate-200/80 rounded-lg shadow-2xs` (tags) | `bg-page hover:bg-surface-alt text-ink-600 border border-border-soft rounded-(--jf-radius-mini)` (drop `shadow-2xs` — homepage's `RowChip` tags are flat, no shadow) |
| `from-white via-white/95` (paywall fade) | `from-page via-page/95` |
| `rounded-[1.75rem] border border-slate-200/90 bg-white/92 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl` (paywall card) | `rounded-(--jf-radius-panel) border border-border-soft bg-page/92 shadow-[var(--jf-shadow-theatrical-sm)] backdrop-blur-xl` |
| `bg-slate-900 text-white rounded-full` (lock icon badge) | `bg-ink-900 text-white rounded-(--jf-radius-pill)` |
| `text-amber-500` (Members Only sparkle icon) | `text-sapphire-bright` |
| `bg-white border-slate-200/80 rounded-2xl shadow-xs` (author bio card) | `bg-page border-border-soft rounded-(--jf-radius-panel) shadow-[var(--jf-shadow-frame)]` |
| `bg-slate-900 group-hover:bg-indigo-600` (author bio accent bar) | `bg-ink-900 group-hover:bg-sapphire-bright` |
| `bg-slate-100/50 border border-slate-200/40 rounded-2xl` (share section) | `bg-surface-alt/50 border border-border-soft/60 rounded-(--jf-radius-panel)` |
| `border-slate-200/80 bg-slate-50/50` (related-posts divider) | `border-border-soft bg-surface-alt/50` |
| `bg-white rounded-2xl border-slate-200/70 hover:border-slate-300/90 shadow-2xs hover:shadow-md hover:-translate-y-1` (related post cards) | `bg-page rounded-(--jf-radius-frame) border-border-soft hover:border-border-frame shadow-[var(--jf-shadow-frame)] hover:shadow-[var(--jf-shadow-panel)]` (drop `hover:-translate-y-1` per button/card motion rule — background/border/shadow may transition, transform should not) |
| `group-hover:text-indigo-600` (related post title hover) | `group-hover:text-sapphire-bright` |
| `border-slate-200/80 bg-white text-slate-400` (footer) | `border-border-soft bg-page text-ink-400` |

- [ ] **Step 4: Replace bespoke CTA buttons with shared `Button`**

- Not-found CTA (`bg-slate-900 text-white hover:bg-slate-800 rounded-xl`) → `<Button variant="primary">` wrapping the same label/link.
- Paywall "Login" CTA (`bg-slate-900 ... hover:bg-slate-800`) → `<Button variant="outline">` (secondary, since Purchase Membership is the primary action in this paired CTA — see Global Constraints).
- Paywall "Purchase/Buy Membership" CTA (`bg-amber-500 ... text-slate-950 shadow-amber-500/25 hover:bg-amber-400`) → `<Button variant="primary">` (this makes it visually identical to the "Buy Membership" CTA in Jobs Hub's `job-board.tsx`, Task 13 — same action, same component, same styling app-wide).
- Share/Copy Link buttons (`Button variant="outline"` with `bg-white border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl shadow-2xs` override) → drop the className override entirely; the plain `outline` variant already resolves to ADL-correct colors via `--background`/`--accent` tokens.
- "Explore All Articles" CTA (`bg-slate-900 text-white hover:bg-slate-800 rounded-xl`) → `<Button variant="primary">`.

- [ ] **Step 5: Fix the missing `.prose` class**

Find the content-body render (`<div ... dangerouslySetInnerHTML={{ __html: ... }} className={\`w-full ${isLocked ? "..." : ""}\`} />` or equivalent) and change the className to prepend `prose`:

```tsx
className={`prose w-full ${isLocked ? "max-h-[920px] overflow-hidden px-6 md:px-10 pt-8 pb-24" : ""}`}
```

This activates `src/styles/blog-prose.css` (Task 9), which was previously imported but never applied.

- [ ] **Step 6: Verify**

Run: `grep -n "slate-\|amber-\|indigo-\|rose-50\|rose-500\|font-black\|shadow-2xs\|-translate-y-1" src/components/blog-post.tsx`
Expected: no output (aside from any unrelated legitimate uses you should double-check individually — there should be none in this file after the above steps).

Run: `cd resumeassist && npx tsc --noEmit` — expect no new errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/blog-post.tsx
git commit -m "style(blog): migrate article page shell, tokens, and CTAs to ADL; fix missing .prose class"
```

---

### Task 11: `src/components/blog-page.tsx` — shell, retoken, flatten rainbow, shared Button

**Files:**
- Modify: `src/components/blog-page.tsx`

**Interfaces:**
- Consumes: `Button` from `@/components/ui/button`, `BackgroundRippleLayout` from `@/components/background-ripple-layout`.

- [ ] **Step 1: Add import and replace the root shell**

Add: `import { BackgroundRippleLayout } from "@/components/background-ripple-layout";`

Replace the root wrapper (`<div className="min-h-screen bg-slate-50 text-slate-900">` containing `<Navbar tone="light" />`) with:

```tsx
<BackgroundRippleLayout tone="light" showRipple={false} contentClassName="pt-[74px]">
  <Navbar tone="light" />
  {/* ...existing body... */}
</BackgroundRippleLayout>
```

- [ ] **Step 2: Retoken the loading state**

Replace `animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto` with `animate-spin rounded-full h-12 w-12 border-b-2 border-ink-900 mx-auto`.

- [ ] **Step 3: Retoken the header block**

Replace `text-xs uppercase tracking-[0.35em] text-slate-500` with `text-xs uppercase tracking-[0.35em] text-ink-500`.
Replace `text-5xl md:text-6xl font-bold text-slate-900` with `text-5xl md:text-6xl font-medium tracking-[-0.02em] text-ink-900`.

- [ ] **Step 4: Retoken the TOC card**

Replace `bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm` with `bg-page border border-border-soft rounded-(--jf-radius-panel) p-6 md:p-8 shadow-[var(--jf-shadow-frame)]`.

- [ ] **Step 5: Flatten all 6 rainbow playbook sections**

For each of the 6 sections (currently `emerald`/`sky`/`rose`/`amber`/`violet`/`teal`), apply this substitution uniformly — every section ends up with identical, non-rainbow styling per the "flatten to ADL ink/sapphire" decision:

| Pattern (any of the 6 colors) | Replace with |
|---|---|
| `relative overflow-hidden bg-white border border-{color}-200 rounded-2xl p-6 md:p-8 shadow-sm` (card) | `relative overflow-hidden bg-page border border-border-soft rounded-(--jf-radius-panel) p-6 md:p-8 shadow-[var(--jf-shadow-frame)]` |
| `absolute inset-x-0 top-0 h-1 bg-{color}-400` (top bar) | `absolute inset-x-0 top-0 h-1 bg-sapphire-bright` |
| `absolute ... blur-3xl` with `bg-{color}-100/70` (decorative blob) | same positioning classes, `bg-sapphire-50/70` |
| `rounded-full bg-{color}-100 px-2 py-0.5 text-xs font-semibold text-{color}-900` (pill badge, incl. the rose "warning" pills) | `rounded-(--jf-radius-pill) bg-sapphire-50 px-2 py-0.5 text-xs font-semibold text-sapphire-brand` |

Do this for all 6 sections (emerald, sky, rose, amber, violet, teal) — every section's card/bar/blob/pills converge on the same sapphire/page/border-soft values. Section copy/content/headings stay untouched (no IA/content change).

- [ ] **Step 6: Retoken the category filter pills**

Replace:
```tsx
<button className={`px-4 py-2 rounded-full text-sm transition-all ${
  selectedCategory === category.name ? "bg-slate-900 text-white" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
}`}>
```
with:
```tsx
<button className={`rounded-(--jf-radius-pill) px-4 py-2 text-sm font-medium transition-colors ${
  selectedCategory === category.name ? "bg-ink-900 text-white" : "bg-page text-ink-600 border border-border-soft hover:bg-surface-alt"
}`}>
```

- [ ] **Step 7: Retoken featured post cards**

Replace `bg-white rounded-lg p-6 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md` with `bg-page rounded-(--jf-radius-frame) p-6 border border-border-soft hover:border-border-frame shadow-[var(--jf-shadow-frame)] hover:shadow-[var(--jf-shadow-panel)]`.
Replace the "Featured" badge `bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-semibold` with `bg-ink-900 text-white px-3 py-1 rounded-(--jf-radius-pill) text-xs font-semibold`.

- [ ] **Step 8: Retoken post list rows**

Replace `border-b border-slate-200 pb-8 last:border-b-0` with `border-b border-border-soft pb-8 last:border-b-0`.

- [ ] **Step 9: Replace bespoke Prev/Next pagination buttons**

Replace:
```tsx
<Button variant="outline" onClick={...} disabled={currentPage === 1}
  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">Previous</Button>
<span className="text-slate-600">Page {currentPage} of {totalPages}</span>
<Button variant="outline" onClick={...} disabled={currentPage === totalPages}
  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">Next</Button>
```
with (drop the className override entirely — the plain `outline` variant already resolves through ADL-correct `--background`/`--accent` tokens, matching Resume page's pagination exactly):
```tsx
<Button variant="outline" size="sm" onClick={...} disabled={currentPage === 1}>Previous</Button>
<span className="text-sm text-ink-500">Page <span className="font-semibold text-ink-900">{currentPage}</span> of {totalPages}</span>
<Button variant="outline" size="sm" onClick={...} disabled={currentPage === totalPages}>Next</Button>
```

- [ ] **Step 10: Retoken the footer**

Replace `border-t border-slate-200 py-12 bg-white` with `border-t border-border-soft py-12 bg-page`.
Replace `text-slate-500 hover:text-slate-700` with `text-ink-500 hover:text-ink-700`.

- [ ] **Step 11: Verify**

Run: `grep -n "slate-\|emerald-\|sky-\|rose-\|amber-\|violet-\|teal-\|bg-slate-50" src/components/blog-page.tsx`
Expected: no output.

Run: `cd resumeassist && npx tsc --noEmit` — expect no new errors.

- [ ] **Step 12: Commit**

```bash
git add src/components/blog-page.tsx
git commit -m "style(blog): migrate /blog shell, flatten rainbow sections, retoken to ADL"
```

---

### Task 12: `app/blog/all/page.tsx` — admin page ADL migration

**Files:**
- Modify: `app/blog/all/page.tsx`

- [ ] **Step 1: Retoken the root wrapper and header**

Replace `min-h-screen bg-slate-50 text-slate-900 p-8 font-sans antialiased` with `min-h-screen bg-page text-ink-900 p-8 antialiased`.
Replace `text-2xl font-bold tracking-tight text-slate-900` (h1) with `text-2xl font-medium tracking-tight text-ink-900`.
Replace `text-xs text-slate-500` (subtitle) with `text-xs text-ink-500`.

- [ ] **Step 2: Retoken the search bar panel**

Replace `p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3` with `p-4 bg-page rounded-(--jf-radius-frame) border border-border-soft shadow-[var(--jf-shadow-frame)] flex items-center gap-3`.
Replace `absolute left-3 top-2.5 h-4 w-4 text-slate-400` (search icon) with `absolute left-3 top-2.5 h-4 w-4 text-ink-400`.
Replace `w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white` (search input) with `w-full pl-9 pr-4 py-2 bg-surface-alt border border-border-soft rounded-(--jf-radius-mini) text-sm text-ink-900 focus:outline-none focus:border-sapphire-bright focus:bg-page`.
Replace `h-4 w-4 text-blue-600 animate-spin` (loader) with `h-4 w-4 text-sapphire-bright animate-spin`.

- [ ] **Step 3: Retoken the data table panel**

Replace `bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden` (table wrapper) with `bg-page rounded-(--jf-radius-frame) border border-border-soft shadow-[var(--jf-shadow-frame)] overflow-hidden`.
Replace `bg-slate-50 border-b border-slate-200 text-[11px] font-semibold tracking-wider text-slate-500 uppercase` (thead row) with `bg-surface-alt border-b border-border-soft text-[11px] font-semibold tracking-wider text-ink-500 uppercase`.
Replace `divide-y divide-slate-100 text-sm` (tbody) with `divide-y divide-border-soft text-sm`.
Replace `hover:bg-slate-50/50 transition-colors` (row hover) with `hover:bg-surface-alt/50 transition-colors`.
Replace `font-semibold text-slate-900 truncate` (title cell) with `font-semibold text-ink-900 truncate`.
Replace `text-xs text-slate-400 font-mono mt-0.5` (slug cell) with `text-xs text-ink-400 font-mono mt-0.5`.
Replace `px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100` (category chip) with `px-2.5 py-0.5 bg-sapphire-50 text-sapphire-brand text-xs rounded-(--jf-radius-pill) font-medium border border-sapphire-100`.
Replace the status chip ternary:
```tsx
post.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
```
with:
```tsx
post.isPublished ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
```
(this is a genuine semantic status indicator — live vs. disabled — not decorative color, so it keeps using the ADL's dedicated `--color-success`/`--color-warning` tokens rather than being flattened to sapphire; consistent with how the "not-found"/destructive states elsewhere stay on `--destructive`.)

- [ ] **Step 4: Retoken the row action buttons**

Replace `p-1.5 flex items-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md text-xs font-semibold transition-all` (HTML Workspace button) with `p-1.5 flex items-center gap-1 text-sapphire-brand bg-sapphire-50 hover:bg-sapphire-100 border border-sapphire-100 rounded-(--jf-radius-mini) text-xs font-semibold transition-colors`.
Replace `p-1.5 flex items-center gap-1 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold transition-all` (Edit Info button) with `p-1.5 flex items-center gap-1 text-ink-700 hover:bg-surface-alt border border-border-soft rounded-(--jf-radius-mini) text-xs font-semibold transition-colors`.
Replace `p-1.5 text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-md` (visibility toggle) with `p-1.5 text-ink-500 border border-border-soft hover:bg-surface-alt rounded-(--jf-radius-mini)`.
Replace `p-1.5 text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 rounded-md` (delete button) with `p-1.5 text-destructive hover:bg-destructive/10 border border-border-soft hover:border-destructive/20 rounded-(--jf-radius-mini)` (keep destructive semantics for a delete action — this is not decorative rose, it's a genuine destructive-action color).

- [ ] **Step 5: Verify**

Run: `grep -n "slate-\|blue-\|emerald-\|rose-" app/blog/all/page.tsx`
Expected: no output.

Run: `cd resumeassist && npx tsc --noEmit` — expect no new errors.

- [ ] **Step 6: Commit**

```bash
git add app/blog/all/page.tsx
git commit -m "style(blog): migrate admin post-management table to ADL tokens"
```

---

### Task 13: `src/components/job-board.tsx` — Jobs Hub Login CTA → shared Button

**Files:**
- Modify: `src/components/job-board.tsx`

**Interfaces:**
- Consumes: `Button` from `@/components/ui/button`.

- [ ] **Step 1: Add import**

Add: `import { Button } from "@/components/ui/button";`

- [ ] **Step 2: Replace CTA instance A** (locked-preview banner, currently lines 311–321)

Replace:
```tsx
<a
  href={access?.cta === "membership" ? membershipHref : loginHref}
  className={`inline-flex items-center justify-center gap-2 rounded-(--jf-radius-pill) px-4 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
    access?.cta === "membership"
      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
      : "bg-ink-900 text-white shadow-lg shadow-ink-900/20 hover:bg-ink-700"
  }`}
>
  {access?.cta === "membership" ? "Buy Membership" : "Login"}
  <ArrowRight className="h-4 w-4" />
</a>
```
with:
```tsx
<Button asChild variant="primary" size="sm">
  <a href={access?.cta === "membership" ? membershipHref : loginHref}>
    {access?.cta === "membership" ? "Buy Membership" : "Login"}
    <ArrowRight className="h-4 w-4" />
  </a>
</Button>
```

This drops the bespoke `hover:-translate-y-0.5` transform (violates the documented ADL button motion rule: only background/border-color may transition) and the hardcoded `bg-ink-900`/`shadow-ink-900` navy fill — both CTA branches now render through the exact same `Button variant="primary"` used everywhere else in the app (e.g. the "Buy Membership" branch already did; now "Login" matches it exactly, eliminating the unique Jobs Hub button design).

- [ ] **Step 3: Replace CTA instance B** (mid-scroll gate, currently lines 505–515)

Replace:
```tsx
<a
  href={access?.cta === "membership" ? membershipHref : loginHref}
  className={`inline-flex items-center justify-center gap-2 rounded-(--jf-radius-pill) px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${
    access?.cta === "membership"
      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
      : "bg-ink-900 text-white shadow-lg shadow-ink-900/20 hover:bg-ink-700"
  }`}
>
  {access?.cta === "membership" ? "Purchase Membership" : "Login"}
  <ArrowRight className="h-4 w-4" />
</a>
```
with:
```tsx
<Button asChild variant="primary" size="sm">
  <a href={access?.cta === "membership" ? membershipHref : loginHref}>
    {access?.cta === "membership" ? "Purchase Membership" : "Login"}
    <ArrowRight className="h-4 w-4" />
  </a>
</Button>
```

- [ ] **Step 4: Clean up adjacent amber drift in the same file**

Replace `<Lock className="h-3.5 w-3.5 text-amber-500" />` with `<Lock className="h-3.5 w-3.5 text-ink-400" />`.
Replace `<Sparkles className="h-3.5 w-3.5 text-amber-500" />` with `<Sparkles className="h-3.5 w-3.5 text-ink-500" />`.
Replace the "Premium access" banner:
```tsx
<div className="rounded-[14px] border border-amber-200 bg-amber-50 p-4 mb-5 text-left">
  <p className="text-[13px] font-semibold text-amber-900 mb-1">Premium access</p>
  <p className="text-[12.5px] text-amber-900/90 leading-relaxed">
```
with:
```tsx
<div className="rounded-(--jf-radius-frame) border border-sapphire-bright/20 bg-sapphire-50 p-4 mb-5 text-left">
  <p className="text-[13px] font-semibold text-sapphire-brand mb-1">Premium access</p>
  <p className="text-[12.5px] text-sapphire-brand/90 leading-relaxed">
```

- [ ] **Step 5: Verify**

Run: `grep -n "amber-\|bg-ink-900 text-white shadow-lg\|hover:-translate-y-0.5" src/components/job-board.tsx`
Expected: no output.

Run: `cd resumeassist && npx tsc --noEmit` — expect no new errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/job-board.tsx
git commit -m "style(jobs-hub): replace bespoke navy Login CTA with shared ADL primary Button"
```

---

### Task 14: `src/components/jobs-hub/JobsHubNav.tsx` — drop legacy hub-* tokens

**Files:**
- Modify: `src/components/jobs-hub/JobsHubNav.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { TABS } from './tabs.config'
import { TAB_INDICATOR, TAB_DOT } from '../../lib/motion'

export function JobsHubNav() {
  const pathname = usePathname()
  const reduced = useReducedMotion() ?? false

  return (
    <nav
      aria-label="Jobs Hub sections"
      className="sticky top-16 z-[100] bg-page border-b border-border-soft"
    >
      <div className="max-w-[940px] mx-auto px-5">
        <div className="flex items-end overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = pathname === tab.path

            return (
              <Link
                key={tab.id}
                href={tab.path}
                id={`tab-${tab.id}`}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'relative flex items-center gap-[5px] px-[15px] py-[11px] shrink-0',
                  'text-[13px] transition-colors duration-[130ms] outline-none select-none',
                  'focus-visible:ring-2 focus-visible:ring-sapphire-bright/30 focus-visible:rounded-t-[4px]',
                  isActive
                    ? 'text-ink-900 font-semibold'
                    : 'text-ink-500 font-medium hover:text-ink-700',
                ].join(' ')}
              >
                <span>{tab.label}</span>

                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key="dot"
                      className="w-[5px] h-[5px] rounded-full bg-sapphire-bright flex-shrink-0"
                      initial={reduced ? { opacity: 0 } : TAB_DOT.initial}
                      animate={reduced ? { opacity: 1 } : TAB_DOT.animate}
                      exit={reduced ? { opacity: 0 } : { scale: 0.3, opacity: 0 }}
                      transition={TAB_DOT.transition}
                    />
                  )}
                </AnimatePresence>

                {tab.dataStatus === 'empty' && (
                  <span className="text-[9px] font-semibold text-ink-500 bg-surface-alt border border-border-soft px-[5px] py-px rounded-[3px] leading-none">
                    soon
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-x-0 bottom-0 h-[2px] rounded-t-[2px] bg-sapphire-bright"
                    transition={reduced ? { duration: 0 } : TAB_INDICATOR}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
```

(`font-hub` / `Plus Jakarta Sans` inline style is dropped entirely — the nav now inherits the app-wide Onest font like every other ADL surface, no per-component font override.)

- [ ] **Step 2: Verify**

Run: `grep -n "hub-\|font-hub\|Plus Jakarta" src/components/jobs-hub/JobsHubNav.tsx`
Expected: no output.

Run: `cd resumeassist && npx tsc --noEmit` — expect no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/jobs-hub/JobsHubNav.tsx
git commit -m "style(jobs-hub): retire legacy hub-* token system, migrate nav to ADL ink/sapphire"
```

---

### Task 15: Final consistency check (visual, not token-based)

**Files:** none modified unless drift is found — this task is verification, with follow-up fixes as needed.

- [ ] **Step 1: Start the dev server**

```bash
cd resumeassist && npm run dev
```

- [ ] **Step 2: Visually compare, side by side, in a real browser**

Navigate to and screenshot each of:
- `/` (Homepage — canonical reference)
- `/blog`
- `/blog/feed`
- `/blog/<any real slug>` (article page)
- `/blog/all` (admin)
- `/find-jobs` (Jobs Hub — trigger the locked-preview state to see the Login CTA)
- `/resume`
- `/referrals`
- `/pricing`
- `/contact-us`

For each page, check: page canvas/background color, card surfaces, border colors, border radius, shadows, section spacing, heading weight/tracking, button appearance (shape, color, hover), and nav treatment. Anything that visually reads as "a different design system" — not just a technically-different-but-close token — counts as drift.

- [ ] **Step 3: Fix any remaining drift found**

If a page still looks off-system (e.g. a spacing rhythm that doesn't match `--jf-space-section`, a shadow that's visibly heavier/lighter than `--jf-shadow-frame`, a stray legacy hex missed by the grep passes in earlier tasks), fix it directly in the relevant file using the same ADL token reference table from Global Constraints. Re-run the grep verification for that file afterward.

- [ ] **Step 4: Final repo-wide sweep for anything missed**

Run from the `resumeassist` root:
```bash
grep -rn "hub-surface\|hub-border\|hub-text\|hub-accent\|font-hub" app/find-jobs src/components/jobs-hub src/components/job-board.tsx
grep -rln "#0b0b0b\|#6b6b6b\|#fbfbf8\|#e6e6e3\|#c8c8c4" app/blog src/components/blog src/components/blog-page.tsx src/components/blog-post.tsx
```
Expected: no output from either command. If anything remains, it was missed by Tasks 1–14 — fix it using the same token table, then re-run.

- [ ] **Step 5: Commit any fixes from this pass**

```bash
git add -A
git commit -m "style: final ADL consistency pass across blog and jobs hub"
```

(Skip this step if Steps 3–4 found nothing to fix.)

---

## Self-Review

**Spec coverage:**
- Page canvas / background colors / surface hierarchy → Tasks 8, 10, 11, 12 (shell wrapper + `bg-page`/`bg-surface-alt` retoken).
- Card styling / border colors / border radius / shadows → every task's token-reference-table application (`rounded-(--jf-radius-*)`, `shadow-[var(--jf-shadow-*)]`, `border-border-soft`/`border-border-frame`).
- Section spacing / vertical rhythm → Task 8/10/11 shell migration to `BackgroundRippleLayout` + `pt-[74px]` (matches Resume/Referrals/Pricing/Contact Us exactly).
- Typography tokens → Tasks 9, 10, 11 (`font-medium` heading weight rule, ink color scale).
- Buttons → Tasks 4, 6, 8, 10, 11, 13 (every bespoke `<button>`/`<a>` CTA replaced with shared `Button`).
- Inputs → Task 4 (newsletter email input), Task 12 (admin search input).
- Newsletter component → Task 4.
- Pagination → Task 8 (Load More), Task 11 (Prev/Next).
- Navigation → Task 14 (`JobsHubNav`); `Navbar` itself was already ADL-compliant and untouched.
- Empty states → Task 8 (feed empty state).
- Loading states → Task 8 (skeleton), Task 10/11 (spinners).
- Jobs Hub Login CTA → Task 13.
- Final side-by-side check → Task 15.

**Placeholder scan:** every step above gives literal old→new strings or full file contents — no "add appropriate styling," no "similar to Task N" without the actual code.

**Type consistency:** `Button` props (`variant`, `size`, `asChild`) used consistently match `src/components/ui/button.tsx`'s actual `cva` config (verified by reading the file directly — variants `default|destructive|outline|secondary|ghost|link|primary`, sizes `default|sm|lg|icon`, `asChild` via Radix `Slot`).

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-12-adl-blog-jobshub-migration.md`.
