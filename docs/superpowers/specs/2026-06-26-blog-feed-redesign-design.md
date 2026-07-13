# Blog Feed Redesign — Design Spec

**Date:** 2026-06-26
**Route:** `/blog/feed`
**Reference:** Reado magazine layout (Framer)
**Stack:** Next.js App Router · Tailwind (v4 `@theme`) · React

---

## 1. Goal

Redesign `/blog/feed` from a plain infinite-scroll list into a magazine-style editorial page that mirrors the Reado reference layout while expressing the ResumeAssist design language. UI only. No backend, API, schema, or data-model changes.

---

## 2. Constraints (Hard Rules)

- Do NOT modify any backend API, controller, route, or schema.
- Do NOT change `src/lib/axios.ts`.
- Do NOT touch `/blog/all` (it is an admin panel, not a public route).
- Do NOT add new API endpoints.
- Do NOT install new dependencies unless a package is already in the project.
- Do NOT modify `app/blog/page.tsx`, `src/components/blog-page.tsx`, or any file outside the blog feed scope.
- Do NOT commit or push.

---

## 3. Files Changed

### Modified
- `app/blog/feed/page.tsx` — full rewrite; becomes a thin data-orchestration shell (~80 lines)

### Created
- `src/components/blog/CategoryTabs.tsx`
- `src/components/blog/FeaturedPost.tsx`
- `src/components/blog/SidebarTopPosts.tsx`
- `src/components/blog/NewsletterBox.tsx`
- `src/components/blog/PostCard.tsx`
- `src/components/blog/PostsGrid.tsx`

---

## 4. Data Architecture

### Source
All data comes from a single existing API call:
```ts
axiosInstance.get("/blog/posts", { params: { page: number } })
```
The API already supports `page` pagination (confirmed: the feed's existing code uses `pagination.current` and `pagination.pages`).

### BlogPostMeta type (existing, unchanged)
```ts
interface BlogPostMeta {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: { url?: string; size?: string; type?: string };
  author: { name: string; bio?: string; avatar?: string };
  category: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
  readTime: string;
  views: number;
  likes: number;
  premium?: boolean;
}
```

### State (in `app/blog/feed/page.tsx`)
```ts
const [allPosts, setAllPosts]           // accumulated across pages
const [currentPage, setCurrentPage]     // current page number
const [totalPages, setTotalPages]       // from API pagination.pages
const [loading, setLoading]             // fetch in-flight
const [activeCategory, setActiveCategory]  // selected pill, default "All"
```

### Derived (memoised with useMemo)
| Derived | Logic |
|---|---|
| `featuredPost` | First post where `featured === true`; fallback: `allPosts[0]` |
| `topPosts` | `allPosts` sorted descending by `views`, excluding `featuredPost._id`, first 5 |
| `categories` | `["All", ...new Set(allPosts.map(p => p.category))]` |
| `filteredPosts` | `allPosts` excluding `featuredPost._id`, filtered by `activeCategory` |

**Load More:** calls the API with `currentPage + 1`, appends to `allPosts`. When `currentPage === totalPages`, the button is hidden and the empty-state footer shown.

**Category filter change:** resets to first loaded page only (no re-fetch; filtering is client-side on `allPosts`).

---

## 5. Component Spec

### 5.1 `app/blog/feed/page.tsx` (orchestrator)
- `'use client'`
- Renders: `<Navbar tone="light" />` → `<CategoryTabs>` → hero row → newsletter → `<PostsGrid>` → load-more / empty state
- Holds all state and derived values
- Passes only what each child needs (no prop drilling beyond one level)

### 5.2 `CategoryTabs`
```
Props: categories: string[], active: string, onSelect: (cat: string) => void
```
- Horizontal scrollable pill row
- `overflow-x-auto scrollbar-hide` on mobile
- Active pill: `bg-amber-500 text-slate-950 font-semibold`
- Inactive pill: `bg-white border border-[#e6e6e3] text-[#6b6b6b] hover:border-[#0b0b0b]`
- Border-bottom separator: `border-b border-[#e6e6e3]`
- Sticky: `sticky top-16 z-40 bg-[#fbfbf8]` (sits below the 64 px fixed navbar)

### 5.3 `FeaturedPost`
```
Props: post: BlogPostMeta
```
Desktop layout (two-column, `lg:grid lg:grid-cols-[1fr_1.1fr]`):
- **Left column:** category chip (amber, uppercase, small) → large headline (Space Grotesk 700, ~2.8rem) → excerpt (Manrope, secondary text colour) → author row (avatar circle + name + date + read time)
- **Right column:** large image, aspect-ratio `16/9`, `object-cover`, rounded-xl; if no image, gradient placeholder (see §7)

Mobile: image above, text below.

Wraps in a `<Link href={/blog/${post.slug}}>` block.

Card treatment: `bg-white rounded-2xl border border-[#e6e6e3] overflow-hidden` with `p-8` on the left column.

### 5.4 `SidebarTopPosts`
```
Props: posts: BlogPostMeta[]
```
- Heading: "Top Posts" in Space Grotesk 600
- Each item: `<Link>` row — 56×56 thumbnail (`rounded-lg object-cover flex-shrink-0`; gradient placeholder if no image) + right column: title (2-line clamp, 14px, font-medium) + date + read time (12px, secondary colour)
- Divider between items: `border-b border-[#e6e6e3]`
- `pt-5 pb-4` padding per item
- Wraps in `bg-white rounded-2xl border border-[#e6e6e3] p-5`

### 5.5 `NewsletterBox`
```
Props: none
```
- `bg-white border border-[#e6e6e3] rounded-2xl p-6 mt-6`
- Heading: "Don't miss a thing" (Space Grotesk 600, ~1.1rem)
- Sub-copy: "Subscribe to get career resources straight to your inbox."
- Email input: full-width, border `#e6e6e3`, rounded-lg
- Submit button: `bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-lg`
- **No backend integration.** `onSubmit` only calls `e.preventDefault()` and shows a brief inline "Thanks, you're in!" confirmation text.

### 5.6 `PostCard`
```
Props: post: BlogPostMeta
```
- `bg-white rounded-2xl border border-[#e6e6e3] overflow-hidden group cursor-pointer`
- Hover: `hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`
- Image: aspect `4/3`, `object-cover`; on hover: `group-hover:scale-105 transition-transform duration-300`
- Category chip: absolute overlay on image, `bg-white/90 text-[#0b0b0b] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bottom-2 left-2`
- Body padding: `p-5`
- Title: Space Grotesk 600, 1rem, 2-line clamp
- Excerpt: Manrope 400, 0.875rem, 3-line clamp, secondary colour
- Footer: author name · date · read time, 12px, secondary colour, `flex items-center gap-2`

### 5.7 `PostsGrid`
```
Props: posts: BlogPostMeta[], onClearFilter: () => void
```
- CSS grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`
- Renders `<PostCard>` for each post
- Section header row: left "Recent posts" heading (Space Grotesk 700, ~1.5rem) + right `<button>` "VIEW ALL POSTS →" (`border border-[#e6e6e3] text-[#6b6b6b] text-xs px-3 py-1.5 rounded-full hover:border-[#0b0b0b]`); `onClick` calls `onClearFilter` (which calls `setActiveCategory("All")` in the orchestrator — it is NOT a `<Link>`, it is a callback button)

---

## 6. Page Layout Skeleton

```
<Navbar tone="light" />                          ← existing, unchanged

<main className="pt-16 bg-[#fbfbf8] min-h-screen">

  <CategoryTabs ... />                            ← sticky below navbar

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* Hero row — only rendered once featuredPost is defined */}
    {featuredPost && (
      <section className="grid lg:grid-cols-[1fr_320px] gap-8 py-10">
        <div>
          <FeaturedPost post={featuredPost} />
          <NewsletterBox />
        </div>
        <SidebarTopPosts posts={topPosts} />
      </section>
    )}

    {/* Recent posts */}
    <section className="pb-16">
      <PostsGrid posts={filteredPosts} />

      {/* Load More */}
      {currentPage < totalPages && (
        <button onClick={loadMore} ...>
          {loading ? <spinner /> : "Load more articles"}
        </button>
      )}

      {/* Empty / caught-up state */}
      {!loading && filteredPosts.length === 0 && <EmptyState />}
      {currentPage === totalPages && filteredPosts.length > 0 && <CaughtUpState />}
    </section>

  </div>
</main>
```

---

## 7. Image Placeholder System

When `post.image?.url` is falsy, render a gradient swatch. Seed the gradient from the category string.

```ts
const CATEGORY_GRADIENTS: Record<string, string> = {
  "Jobs":          "from-amber-100 to-amber-200",
  "Resume":        "from-stone-100 to-stone-200",
  "Career Tips":   "from-orange-100 to-amber-100",
  "Scholarships":  "from-sky-100 to-blue-100",
  "Study Abroad":  "from-indigo-100 to-sky-100",
  "Interviews":    "from-rose-100 to-pink-100",
  "Remote Work":   "from-teal-100 to-emerald-100",
  "Internships":   "from-yellow-100 to-amber-100",
};
const DEFAULT_GRADIENT = "from-stone-100 to-neutral-200";

function getCategoryGradient(category: string): string {
  return CATEGORY_GRADIENTS[category] ?? DEFAULT_GRADIENT;
}
```

Rendered as: `<div className={cn("w-full h-full bg-gradient-to-br", getCategoryGradient(category))} />`. No text. No "No Image".

---

## 8. Empty & Caught-Up States

### Empty state (no posts match filter)
```
You're all caught up.
Explore more career resources or check back soon for new articles.

[← Browse all topics]   ← onClick: setActiveCategory("All")
```
Button style: `border border-amber-500 text-amber-600 hover:bg-amber-50 px-5 py-2.5 rounded-lg text-sm font-medium`

### Caught-up state (last page loaded, posts exist)
```
— You've read everything in this category —
```
Single line, centred, italic, secondary colour. No CTA needed.

---

## 9. Loading State

First-load skeleton (while `loading && allPosts.length === 0`):
- Show the Navbar + CategoryTabs as normal
- Hero area: two grey shimmer blocks (left ~70%, right ~30%) using `animate-pulse bg-[#e6e6e3] rounded-2xl`
- Grid: 6 shimmer cards in the 3-column grid

Load More spinner: replace button text with a 20px `animate-spin` ring while loading.

---

## 10. Responsive Breakpoints

| Viewport | Hero | Grid | Category pills |
|---|---|---|---|
| `< 640px` (mobile) | Single column, image above text | 1 col | Horizontal scroll, no wrap |
| `640–1023px` (tablet) | Single column, image above text; sidebar collapses to horizontal strip below featured | 2 col | Wrapped or scroll |
| `≥ 1024px` (desktop) | Left text + right image; right sidebar 320px | 3 col | Full row, no scroll |

Sidebar collapse on tablet/mobile: `SidebarTopPosts` becomes a horizontal strip showing the first 3 of its 5 items (`flex overflow-x-auto gap-4 [&>*:nth-child(n+4)]:hidden`) placed below the featured post instead of beside it.

---

## 11. Design Token Reference

| Token | Value | CSS var |
|---|---|---|
| Page bg | `#fbfbf8` | `--app-bg` |
| Card surface | `#ffffff` | — |
| Primary text | `#0b0b0b` | `--app-ink` |
| Secondary text | `#6b6b6b` | approx `--app-muted` |
| Border | `#e6e6e3` | `--app-border` |
| Active/CTA | `bg-amber-500 text-slate-950` | — |
| Heading font | Space Grotesk | `--font-display` |
| Body font | Manrope | `--font-body` |

No blue. No purple. No teal. No new CSS variables. No new font imports (both fonts already loaded in `app/layout.tsx`).

---

## 12. Verification Checklist

After implementation, verify each of the following:

- [ ] Desktop: hero text left / image right, sidebar on the right
- [ ] Tablet: hero stacks, sidebar becomes horizontal strip
- [ ] Mobile: fully single-column, pills scroll horizontally
- [ ] Active category pill highlighted in amber
- [ ] Clicking category filters the grid (client-side, no API re-fetch)
- [ ] "Browse all topics" on empty state resets category to "All"
- [ ] Load More fetches next page and appends cards
- [ ] Caught-up text appears when last page loaded
- [ ] No "No Image" text anywhere
- [ ] Gradient placeholders render for imageless posts
- [ ] Newsletter submit shows inline confirmation only (no API call)
- [ ] Existing post links (`/blog/${slug}`) still work
- [ ] Author, date, read time, category all render correctly
- [ ] No changes to `/blog`, `/blog/all`, or any backend file
- [ ] No infinite scroll (IntersectionObserver removed)
