# Blog Feed Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/blog/feed` from a plain infinite-scroll list into a magazine-style editorial page (Reado layout reference) expressed through the ResumeAssist design system.

**Architecture:** A thin orchestrator page (`app/blog/feed/page.tsx`) owns all state and data fetching via the existing `axiosInstance`; six focused presentational components in `src/components/blog/` receive only the props they need. Infinite scroll (IntersectionObserver) is removed and replaced with an explicit Load More button. All category filtering and hero/sidebar derivations happen client-side from already-fetched data — no new API calls.

**Tech Stack:** Next.js 14 App Router · React 18 · Tailwind CSS v4 (`@theme`) · TypeScript · `axiosInstance` (existing) · Playwright (validation only)

---

## Global Constraints

- Do NOT modify any file outside `app/blog/feed/page.tsx` and `src/components/blog/`
- Do NOT touch backend, API routes, controllers, schemas, or `src/lib/axios.ts`
- Do NOT install any new npm packages
- Do NOT commit or push
- Do NOT link to `/blog/all` (it is an admin panel)
- Use only existing CSS variables: `--app-bg #fbfbf8`, `--app-ink #0b0b0b`, `--app-border #e6e6e3`, `--app-muted #5f6368`, amber-500 for CTAs
- Fonts are Space Grotesk (`font-display`, applied globally to headings) and Manrope (`font-body`, applied globally to body) — do NOT add font imports
- `scrollbar-hide` utility class already exists in `src/index.css` — use it
- `cn()` is imported from `@/lib/utils`
- `Navbar` is imported from `@/components/navbar`
- `axiosInstance` is imported from `@/lib/axios`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/blog/types.ts` | Shared TypeScript interfaces for `BlogPostMeta`, `ApiResponse` |
| Create | `src/components/blog/CategoryTabs.tsx` | Sticky horizontal pill row, active amber state |
| Create | `src/components/blog/PostCard.tsx` | Single post card with image, gradient placeholder, hover lift |
| Create | `src/components/blog/FeaturedPost.tsx` | Hero: text-left / image-right on desktop |
| Create | `src/components/blog/SidebarTopPosts.tsx` | Vertical top-posts list (desktop), horizontal strip (tablet/mobile) |
| Create | `src/components/blog/NewsletterBox.tsx` | Static email subscription UI, no backend |
| Create | `src/components/blog/PostsGrid.tsx` | Responsive 3/2/1 grid of PostCards with section header |
| Rewrite | `app/blog/feed/page.tsx` | Orchestrator: state, fetch, Load More, derived data, layout composition |

---

## Task 0: Backup + Scaffold

**Files:**
- Copy: `app/blog/feed/page.tsx` → `app/blog/feed/page.tsx.bak` (rollback snapshot)
- Create: `src/components/blog/types.ts`

**Interfaces:**
- Produces: `BlogPostMeta`, `ApiResponse` — imported by all subsequent tasks

- [ ] **Step 1: Back up the original feed page**

In PowerShell from the `resumeassist/` directory:

```powershell
Copy-Item "app/blog/feed/page.tsx" "app/blog/feed/page.tsx.bak"
```

Expected: `page.tsx.bak` appears alongside `page.tsx`. This is the rollback snapshot.

- [ ] **Step 2: Create the blog components directory**

```powershell
New-Item -ItemType Directory -Force -Path "src/components/blog"
```

Expected: directory exists (no error if it already exists).

- [ ] **Step 3: Create shared types file**

Create `src/components/blog/types.ts` with this exact content:

```typescript
export interface BlogAuthor {
  name: string;
  bio?: string;
  avatar?: string;
}

export interface BlogImage {
  url?: string;
  size?: string;
  type?: string;
}

export interface BlogPostMeta {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: BlogImage;
  author: BlogAuthor;
  category: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
  readTime: string;
  views: number;
  likes: number;
  premium?: boolean;
}

export interface ApiPagination {
  current: number;
  pages: number;
  total: number;
}

export interface ApiResponse {
  success: boolean;
  data: {
    posts: BlogPostMeta[];
    pagination: ApiPagination;
  };
  error?: string;
}

/** Gradient class pairs for categories, used by getCategoryGradient() */
export const CATEGORY_GRADIENTS: Record<string, string> = {
  "Jobs":         "from-amber-100 to-amber-200",
  "Resume":       "from-stone-100 to-stone-200",
  "Career Tips":  "from-orange-100 to-amber-100",
  "Scholarships": "from-sky-100 to-blue-100",
  "Study Abroad": "from-indigo-100 to-sky-100",
  "Interviews":   "from-rose-100 to-pink-100",
  "Remote Work":  "from-teal-100 to-emerald-100",
  "Internships":  "from-yellow-100 to-amber-100",
};

export const DEFAULT_GRADIENT = "from-stone-100 to-neutral-200";

export function getCategoryGradient(category: string): string {
  return CATEGORY_GRADIENTS[category] ?? DEFAULT_GRADIENT;
}
```

- [ ] **Step 4: Verify the file compiles**

```powershell
npx tsc --noEmit --project tsconfig.json 2>&1 | Select-String "blog/types"
```

Expected: no output (no errors referencing types.ts). If TypeScript isn't wired to check src/ directly, a blank result is fine — the import errors will surface in later tasks.

---

## Task 1: CategoryTabs Component

**Files:**
- Create: `src/components/blog/CategoryTabs.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (no blog types needed)
- Produces: `<CategoryTabs categories={string[]} active={string} onSelect={(cat: string) => void} />`

- [ ] **Step 1: Create CategoryTabs.tsx**

```typescript
// src/components/blog/CategoryTabs.tsx
"use client";

import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
}

export default function CategoryTabs({ categories, active, onSelect }: CategoryTabsProps) {
  return (
    <div className="sticky top-16 z-40 bg-[#fbfbf8] border-b border-[#e6e6e3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={cn(
                "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150",
                active === cat
                  ? "bg-amber-500 text-slate-950"
                  : "bg-white border border-[#e6e6e3] text-[#6b6b6b] hover:border-[#0b0b0b] hover:text-[#0b0b0b]"
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

- [ ] **Step 2: Verify no TypeScript errors**

```powershell
npx tsc --noEmit 2>&1 | Select-String "CategoryTabs"
```

Expected: blank (no errors).

---

## Task 2: PostCard Component

**Files:**
- Create: `src/components/blog/PostCard.tsx`

**Interfaces:**
- Consumes: `BlogPostMeta`, `getCategoryGradient` from `src/components/blog/types.ts`
- Produces: `<PostCard post={BlogPostMeta} />`

- [ ] **Step 1: Create PostCard.tsx**

```typescript
// src/components/blog/PostCard.tsx
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
      <article className="bg-white rounded-2xl border border-[#e6e6e3] overflow-hidden h-full hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        {/* Image / Placeholder */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {post.image?.url ? (
            <img
              src={post.image.url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
          <span className="absolute bottom-2 left-2 bg-white/90 text-[#0b0b0b] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
            {post.category}
          </span>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-2">
          <h3 className="text-base font-semibold text-[#0b0b0b] line-clamp-2 leading-snug">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-[#6b6b6b] line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          )}
          {/* Footer */}
          <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs text-[#6b6b6b]">
            <span className="font-medium">{post.author.name}</span>
            <span>·</span>
            <span>{formattedDate}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```powershell
npx tsc --noEmit 2>&1 | Select-String "PostCard"
```

Expected: blank.

---

## Task 3: FeaturedPost Component

**Files:**
- Create: `src/components/blog/FeaturedPost.tsx`

**Interfaces:**
- Consumes: `BlogPostMeta`, `getCategoryGradient` from `./types`
- Produces: `<FeaturedPost post={BlogPostMeta} />`

Desktop layout: text/content LEFT column · image RIGHT column (matches Reado reference).
Mobile layout: image stacked above text.

- [ ] **Step 1: Create FeaturedPost.tsx**

```typescript
// src/components/blog/FeaturedPost.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BlogPostMeta, getCategoryGradient } from "./types";

interface FeaturedPostProps {
  post: BlogPostMeta;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="bg-white rounded-2xl border border-[#e6e6e3] overflow-hidden">
        {/*
          Mobile:  image on top, text below  (flex-col)
          Desktop: text left (~55%), image right (~45%)  (lg:flex-row)
        */}
        <div className="flex flex-col lg:flex-row lg:items-stretch min-h-[360px]">

          {/* LEFT — Text content */}
          <div className="flex flex-col justify-center gap-4 p-7 lg:p-10 lg:w-[55%]">
            {/* Category label */}
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600">
              {post.category}
            </span>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0b0b0b] leading-tight group-hover:text-[#3a3a3a] transition-colors">
              {post.title}
            </h2>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-[#6b6b6b] text-base leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* Author row */}
            <div className="flex items-center gap-2 mt-auto pt-2">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#e6e6e3]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#e6e6e3] flex items-center justify-center text-[10px] font-bold text-[#6b6b6b] uppercase">
                  {post.author.name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-[#0b0b0b]">{post.author.name}</span>
              <span className="text-[#e6e6e3]">·</span>
              <span className="text-sm text-[#6b6b6b]">{formattedDate}</span>
              <span className="text-[#e6e6e3]">·</span>
              <span className="text-sm text-[#6b6b6b]">{post.readTime}</span>
            </div>
          </div>

          {/* RIGHT — Image */}
          <div className="relative lg:w-[45%] aspect-[16/9] lg:aspect-auto overflow-hidden">
            {post.image?.url ? (
              <img
                src={post.image.url}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div
                className={cn(
                  "w-full h-full bg-gradient-to-br",
                  getCategoryGradient(post.category)
                )}
              />
            )}
          </div>

        </div>
      </article>
    </Link>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```powershell
npx tsc --noEmit 2>&1 | Select-String "FeaturedPost"
```

Expected: blank.

---

## Task 4: SidebarTopPosts Component

**Files:**
- Create: `src/components/blog/SidebarTopPosts.tsx`

**Interfaces:**
- Consumes: `BlogPostMeta[]`, `getCategoryGradient` from `./types`
- Produces: `<SidebarTopPosts posts={BlogPostMeta[]} />`

Desktop: vertical list inside a white card.
Tablet/mobile: horizontal scrollable strip, first 3 items visible (items 4–5 hidden via `sm:hidden lg:flex` logic — see step below).

- [ ] **Step 1: Create SidebarTopPosts.tsx**

```typescript
// src/components/blog/SidebarTopPosts.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BlogPostMeta, getCategoryGradient } from "./types";

interface SidebarTopPostsProps {
  posts: BlogPostMeta[];
}

export default function SidebarTopPosts({ posts }: SidebarTopPostsProps) {
  const formattedDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <aside className="bg-white rounded-2xl border border-[#e6e6e3] p-5">
      <h3 className="text-base font-semibold text-[#0b0b0b] mb-1">Top Posts</h3>

      {/*
        Desktop (lg+): vertical list, all 5 items
        Tablet/mobile: horizontal scrollable strip, items 4-5 hidden
      */}
      <ul className="flex lg:flex-col gap-4 overflow-x-auto scrollbar-hide lg:overflow-visible">
        {posts.map((post, index) => (
          <li
            key={post._id}
            className={cn(
              "flex-shrink-0 w-64 lg:w-auto",
              // Hide items 4 and 5 on tablet/mobile
              index >= 3 ? "hidden lg:flex" : "flex",
              "lg:border-b lg:border-[#e6e6e3] lg:last:border-b-0"
            )}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="flex gap-3 py-4 w-full group hover:opacity-80 transition-opacity"
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden">
                {post.image?.url ? (
                  <img
                    src={post.image.url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full h-full bg-gradient-to-br",
                      getCategoryGradient(post.category)
                    )}
                  />
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-sm font-medium text-[#0b0b0b] line-clamp-2 leading-snug">
                  {post.title}
                </p>
                <p className="text-xs text-[#6b6b6b]">
                  {formattedDate(post.publishedAt)} · {post.readTime}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```powershell
npx tsc --noEmit 2>&1 | Select-String "SidebarTopPosts"
```

Expected: blank.

---

## Task 5: NewsletterBox Component

**Files:**
- Create: `src/components/blog/NewsletterBox.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<NewsletterBox />` — no props

No backend integration. Submit only shows inline confirmation text. No API call.

- [ ] **Step 1: Create NewsletterBox.tsx**

```typescript
// src/components/blog/NewsletterBox.tsx
"use client";

import { useState } from "react";

export default function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-white border border-[#e6e6e3] rounded-2xl p-6 mt-6">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#6b6b6b] mb-1">
        Newsletter
      </p>
      <h3 className="text-lg font-semibold text-[#0b0b0b] mb-1">
        Don&apos;t miss a thing
      </h3>
      <p className="text-sm text-[#6b6b6b] mb-4">
        Subscribe to get career resources straight to your inbox.
      </p>

      {submitted ? (
        <p className="text-sm font-medium text-amber-600">
          Thanks, you&apos;re in! 🎉
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-2.5 text-sm border border-[#e6e6e3] rounded-lg bg-[#fbfbf8] text-[#0b0b0b] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#0b0b0b] transition-colors"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
          >
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```powershell
npx tsc --noEmit 2>&1 | Select-String "NewsletterBox"
```

Expected: blank.

---

## Task 6: PostsGrid Component

**Files:**
- Create: `src/components/blog/PostsGrid.tsx`

**Interfaces:**
- Consumes: `BlogPostMeta[]` from `./types`; `PostCard` from `./PostCard`
- Produces: `<PostsGrid posts={BlogPostMeta[]} onClearFilter={() => void} />`

The "VIEW ALL POSTS →" button calls `onClearFilter` (a callback) — it is NOT a `<Link>`. It resets the active category to "All" in the orchestrator.

- [ ] **Step 1: Create PostsGrid.tsx**

```typescript
// src/components/blog/PostsGrid.tsx
import { BlogPostMeta } from "./types";
import PostCard from "./PostCard";

interface PostsGridProps {
  posts: BlogPostMeta[];
  onClearFilter: () => void;
}

export default function PostsGrid({ posts, onClearFilter }: PostsGridProps) {
  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0b0b0b]">Recent posts</h2>
        <button
          onClick={onClearFilter}
          className="text-xs px-3 py-1.5 rounded-full border border-[#e6e6e3] text-[#6b6b6b] hover:border-[#0b0b0b] hover:text-[#0b0b0b] transition-colors flex-shrink-0"
        >
          VIEW ALL POSTS →
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```powershell
npx tsc --noEmit 2>&1 | Select-String "PostsGrid"
```

Expected: blank.

---

## Task 7: Rewrite `app/blog/feed/page.tsx` (Orchestrator)

**Files:**
- Rewrite: `app/blog/feed/page.tsx`

**Interfaces:**
- Consumes: all six components from `src/components/blog/`; `Navbar` from `@/components/navbar`; `axiosInstance` from `@/lib/axios`; all types from `src/components/blog/types`
- Produces: the live `/blog/feed` page

**Key changes vs original:**
- Remove `IntersectionObserver` / infinite scroll entirely
- Remove `loaderRef`, `loadingRef`, `hasMoreRef`, `nextPageRef`
- Add `currentPage` / `totalPages` state
- Add `activeCategory` state
- Add `useMemo` for `featuredPost`, `topPosts`, `categories`, `filteredPosts`
- Add explicit Load More button
- Add Navbar
- Compose all six new components

- [ ] **Step 1: Rewrite app/blog/feed/page.tsx**

Replace the entire file with:

```typescript
// app/blog/feed/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import axiosInstance from "@/lib/axios";
import { Navbar } from "@/components/navbar";
import CategoryTabs from "@/components/blog/CategoryTabs";
import FeaturedPost from "@/components/blog/FeaturedPost";
import SidebarTopPosts from "@/components/blog/SidebarTopPosts";
import NewsletterBox from "@/components/blog/NewsletterBox";
import PostsGrid from "@/components/blog/PostsGrid";
import { BlogPostMeta, ApiResponse } from "@/components/blog/types";

export default function BlogFeedPage() {
  const [allPosts, setAllPosts] = useState<BlogPostMeta[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchPage = async (page: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<ApiResponse>("/blog/posts", {
        params: { page },
      });
      if (res.data.success) {
        const { posts, pagination } = res.data.data;
        setAllPosts((prev) => (page === 1 ? posts : [...prev, ...posts]));
        setTotalPages(pagination.pages);
        setCurrentPage(pagination.current);
      }
    } catch (err) {
      console.error("Error loading posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const handleLoadMore = () => {
    if (!loading && currentPage < totalPages) {
      fetchPage(currentPage + 1);
    }
  };

  // ── Derived state (client-side) ────────────────────────────────────────────
  const featuredPost = useMemo<BlogPostMeta | undefined>(() => {
    return allPosts.find((p) => p.featured) ?? allPosts[0];
  }, [allPosts]);

  const topPosts = useMemo<BlogPostMeta[]>(() => {
    return [...allPosts]
      .filter((p) => p._id !== featuredPost?._id)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [allPosts, featuredPost]);

  const categories = useMemo<string[]>(() => {
    const unique = Array.from(new Set(allPosts.map((p) => p.category)));
    return ["All", ...unique];
  }, [allPosts]);

  const filteredPosts = useMemo<BlogPostMeta[]>(() => {
    const withoutFeatured = allPosts.filter((p) => p._id !== featuredPost?._id);
    if (activeCategory === "All") return withoutFeatured;
    return withoutFeatured.filter((p) => p.category === activeCategory);
  }, [allPosts, featuredPost, activeCategory]);

  // ── Loading skeleton (first load) ─────────────────────────────────────────
  const isFirstLoad = loading && allPosts.length === 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar tone="light" />

      <main className="pt-16 bg-[#fbfbf8] min-h-screen">
        {/* Category pills */}
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onSelect={(cat) => setActiveCategory(cat)}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── First-load skeleton ── */}
          {isFirstLoad && (
            <div className="py-10 space-y-6">
              <div className="grid lg:grid-cols-[1fr_320px] gap-8">
                <div className="animate-pulse bg-[#e6e6e3] rounded-2xl h-80" />
                <div className="animate-pulse bg-[#e6e6e3] rounded-2xl h-80" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-[#e6e6e3] rounded-2xl h-64" />
                ))}
              </div>
            </div>
          )}

          {/* ── Hero row ── */}
          {!isFirstLoad && featuredPost && (
            <section className="py-10">
              <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
                <div>
                  <FeaturedPost post={featuredPost} />
                  <NewsletterBox />
                </div>
                <SidebarTopPosts posts={topPosts} />
              </div>
            </section>
          )}

          {/* ── Recent posts grid ── */}
          {!isFirstLoad && (
            <section className="pb-16">
              {filteredPosts.length > 0 ? (
                <PostsGrid
                  posts={filteredPosts}
                  onClearFilter={() => setActiveCategory("All")}
                />
              ) : (
                /* Empty state: no posts match active filter */
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <p className="text-xl font-semibold text-[#0b0b0b]">
                    You&apos;re all caught up.
                  </p>
                  <p className="text-sm text-[#6b6b6b] max-w-sm">
                    Explore more career resources or check back soon for new articles.
                  </p>
                  <button
                    onClick={() => setActiveCategory("All")}
                    className="mt-2 border border-amber-500 text-amber-600 hover:bg-amber-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    ← Browse all topics
                  </button>
                </div>
              )}

              {/* Load More */}
              {filteredPosts.length > 0 && currentPage < totalPages && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-8 py-3 bg-white border border-[#e6e6e3] text-[#0b0b0b] text-sm font-medium rounded-full hover:border-[#0b0b0b] hover:shadow-sm transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-[#0b0b0b] border-t-transparent rounded-full animate-spin" />
                        Loading…
                      </span>
                    ) : (
                      "Load more articles"
                    )}
                  </button>
                </div>
              )}

              {/* Caught-up state: last page loaded, posts exist */}
              {filteredPosts.length > 0 && currentPage === totalPages && !loading && (
                <p className="text-center text-sm text-[#6b6b6b] italic mt-12">
                  — You&apos;ve read everything in this category —
                </p>
              )}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors across the whole project**

```powershell
npx tsc --noEmit 2>&1
```

Expected: no errors. If errors appear, they are in the newly created files — fix the specific type mismatches shown.

- [ ] **Step 3: Start the dev server and open /blog/feed**

```powershell
npm run dev
```

Open `http://localhost:3000/blog/feed` in a browser.

**Expected visual at desktop (≥1024px):**
- Navbar present at top
- Amber category pills below navbar
- Hero card: text/excerpt on left, large image on right
- Right sidebar: "Top Posts" vertical list
- Newsletter box below the hero (left column)
- "Recent posts" heading + 3-column card grid
- "Load more articles" button at bottom (if more pages exist)

**Verify the following work:**
- Clicking a category pill filters the grid (client-side, instant, no spinner)
- Clicking "VIEW ALL POSTS →" resets to "All"
- Clicking any PostCard navigates to `/blog/{slug}`
- Clicking the hero FeaturedPost navigates to its slug
- Submitting the newsletter form shows "Thanks, you're in!" and no network request fires
- "Load more articles" appends new cards and increments the page count
- No "No Image" text anywhere (gradient placeholders render for imageless posts)

---

## Task 8: Playwright Validation

**Files:**
- Create: `playwright-blog-feed-validation.ts` in the scratchpad (temp, not committed)

**Purpose:** Capture screenshots at three viewports and verify the layout matches the Reado reference structure.

- [ ] **Step 1: Verify Playwright is available**

```powershell
npx playwright --version
```

If Playwright is not installed, skip to Step 6 (manual screenshot checklist).

- [ ] **Step 2: Capture desktop screenshot (1440px)**

```powershell
npx playwright screenshot --browser chromium --viewport-size "1440,900" "http://localhost:3000/blog/feed" "blog-feed-desktop.png"
```

Open `blog-feed-desktop.png`. Verify:
- [ ] Navbar visible at top
- [ ] Category pills row below navbar (amber active pill)
- [ ] Featured post: text LEFT, image RIGHT
- [ ] Right sidebar "Top Posts" list
- [ ] Newsletter box in left column below featured post
- [ ] "Recent posts" heading with 3-column card grid
- [ ] No "No Image" text in any card
- [ ] No blue, purple, or teal colours

- [ ] **Step 3: Capture tablet screenshot (768px)**

```powershell
npx playwright screenshot --browser chromium --viewport-size "768,1024" "http://localhost:3000/blog/feed" "blog-feed-tablet.png"
```

Open `blog-feed-tablet.png`. Verify:
- [ ] Featured post stacks vertically (image above text OR text above image — single column)
- [ ] Sidebar becomes horizontal strip (3 items visible, 4th and 5th hidden)
- [ ] Grid switches to 2 columns
- [ ] Category pills still visible (may wrap)

- [ ] **Step 4: Capture mobile screenshot (390px)**

```powershell
npx playwright screenshot --browser chromium --viewport-size "390,844" "http://localhost:3000/blog/feed" "blog-feed-mobile.png"
```

Open `blog-feed-mobile.png`. Verify:
- [ ] Everything single column
- [ ] Category pills scroll horizontally (no wrap, no overflow-x visible)
- [ ] Featured post image above text
- [ ] 1-column post grid
- [ ] Load More button full-width or centered

- [ ] **Step 5: Full verification checklist**

Run through every item in the spec's §12 checklist:

| Item | Pass? |
|------|-------|
| Desktop: hero text left / image right, sidebar on right | |
| Tablet: hero stacks, sidebar becomes horizontal strip | |
| Mobile: fully single-column, pills scroll horizontally | |
| Active category pill highlighted in amber | |
| Clicking category filters the grid (client-side, no re-fetch) | |
| "Browse all topics" on empty state resets to "All" | |
| Load More fetches next page and appends cards | |
| Caught-up text appears when last page loaded | |
| No "No Image" text anywhere | |
| Gradient placeholders render for imageless posts | |
| Newsletter submit shows inline confirmation only | |
| Existing post links (/blog/{slug}) still work | |
| Author, date, read time, category all render correctly | |
| No changes to /blog, /blog/all, or any backend file | |
| No infinite scroll (IntersectionObserver removed) | |

- [ ] **Step 6: Manual fallback (if Playwright not available)**

Use browser DevTools to resize to the three viewport widths above (1440, 768, 390) and take manual screenshots. Run through the same checklist in Step 5.

---

## Rollback Plan

The original `app/blog/feed/page.tsx` was backed up in Task 0 as `app/blog/feed/page.tsx.bak`.

To rollback completely:

```powershell
# From the resumeassist/ directory:
Copy-Item "app/blog/feed/page.tsx.bak" "app/blog/feed/page.tsx" -Force
Remove-Item "src/components/blog" -Recurse -Force
```

This restores the original infinite-scroll feed and removes all new components. The rest of the application is unaffected — no other files were modified.

**Partial rollback (keep components, restore feed page only):**

```powershell
Copy-Item "app/blog/feed/page.tsx.bak" "app/blog/feed/page.tsx" -Force
```

---

## Implementation Order

Execute tasks in order — each task's output is a dependency for the next:

```
Task 0 → Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6 → Task 7 → Task 8
 Setup    Tabs    PostCard Featured Sidebar  Letter   Grid   Orchestr.  Validate
```

Tasks 1–6 (components) can be implemented in parallel if using subagent-driven development, since they all consume from `types.ts` (Task 0) but do not depend on each other. Task 7 depends on all of 1–6 being complete. Task 8 depends on Task 7.
