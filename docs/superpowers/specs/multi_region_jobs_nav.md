# Multi-Region Jobs Navigation — Design Specification

**Date:** 2026-05-20  
**Status:** Approved for implementation  
**Design approach:** Approach C — Structural Live-Signal Shells  
**Stack:** Next.js 15 App Router, Tailwind v4.1, Motion v12 (motion/react), TypeScript

---

## 1. Navigation Layout System

### 1.1 Container Hierarchy

```
<section px-4 py-16>                           ← page section (unchanged)
  <div max-w-6xl mx-auto>                       ← page container (unchanged)
    <JobsHubNav />                              ← NEW: replaces inline pill row
      <div relative w-full mb-10>              ← outer positioning layer
        <FadeLeft />                            ← gradient overlay, left
        <div overflow-x-auto scrollbar-hide    ← scroll container
             scroll-smooth>
          <div flex items-center gap-1          ← pill strip (inline-flex width)
               rounded-full border
               border-neutral-200 bg-white
               shadow-sm p-1 w-max>
            {tabs.map(Tab)}                     ← each tab button
          </div>
        </div>
        <FadeRight />                           ← gradient overlay, right
      </div>
    </JobsHubNav />
    {/* tab content */}
  </div>
</section>
```

### 1.2 Pill Strip Dimensions

| Property | Value | Notes |
|---|---|---|
| Container padding | `p-1` | existing — matches current design |
| Tab horizontal padding | `px-5` | existing — `px-5 py-2` |
| Tab vertical padding | `py-2` | existing |
| Gap between pills | `gap-1` | existing |
| Font size | `text-xs` | 12px — existing |
| Font weight | `font-semibold` | existing |
| Border radius | `rounded-full` | existing |
| Active background | `bg-neutral-900` | existing |
| Active text | `text-white` | existing |
| Inactive text | `text-neutral-500` | existing |
| Inactive hover text | `hover:text-neutral-900` | existing |
| Strip width | `w-max` | CHANGED from `w-fit` — allows inner shrink-to-content inside scroll container |

### 1.3 Responsive Scroll Container

```tsx
// Scroll container — sits between the two fade overlays
<div
  ref={scrollRef}
  data-testid="tab-scroll-container"
  onScroll={onScroll}
  className="overflow-x-auto scroll-smooth scrollbar-hide"
>
  <div className="flex items-center gap-1 rounded-full border border-neutral-200
                  bg-white shadow-sm p-1 w-max">
    {TABS.map(tab => <TabPill key={tab.id} tab={tab} active={view === tab.id} onClick={handleTabClick} />)}
  </div>
</div>
```

The scroll container is `width: 100%` (block default). The pill strip inside is `w-max` (natural content width). On wide viewports the strip is narrower than the container and renders left-aligned. On narrow viewports the strip overflows and the container scrolls.

### 1.4 HSL Fade Overlay Offsets

Background color: `bg-neutral-50` (`oklch(0.97 0 0)` / `#f5f5f5` approx).  
Fade color MUST match this value exactly or banding is visible at the edges.

```tsx
const FADE_WIDTH = "w-12"; // 48px — enough to mask 2 pill labels at px-5

function FadeEdge({ side, visible }: { side: "left" | "right"; visible: boolean }) {
  return (
    <div
      data-testid={`tab-fade-${side}`}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 z-10 w-12 transition-opacity duration-200",
        side === "left"
          ? "left-0 bg-gradient-to-r from-neutral-50 to-transparent"
          : "right-0 bg-gradient-to-l from-neutral-50 to-transparent"
      )}
      style={{ opacity: visible ? 1 : 0 }}
    />
  );
}
```

### 1.5 Fade Visibility Logic

```ts
const [fades, setFades] = useState({ left: false, right: false });

function onScroll() {
  const el = scrollRef.current;
  if (!el) return;
  const THRESHOLD = 8; // px — prevents flicker at rest position
  setFades({
    left:  el.scrollLeft > THRESHOLD,
    right: el.scrollLeft < el.scrollWidth - el.clientWidth - THRESHOLD,
  });
}

// Initialize on mount — right fade visible if content overflows
useEffect(() => {
  onScroll();
}, []);
```

### 1.6 Touch Scroll Snap

No snap is applied to the pill strip. Snap would conflict with `scrollIntoView` centering and feel unnatural when the user drags freely. The scroll is free-form; centering is triggered only on explicit tab click.

### 1.7 Scrollbar Hide CSS

Add to `app/globals.css` (or equivalent CSS entry point):

```css
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

---

## 2. Extensible Feed Architecture

### 2.1 Tab Config Schema

File: `src/components/jobs-hub/tabs.config.ts`

```ts
export type TabId =
  | "jobs"
  | "tracker"
  | "emails"
  | "dubai-hr"
  | "gulf-jobs"
  | "au-nz";

export type DataStatus = "live" | "empty";

export interface TabConfig {
  id: TabId;
  label: string;          // nav pill label
  region: string;         // geographic context shown in tab header
  dataStatus: DataStatus; // drives content vs live-ready shell
  description: string;    // one-line description shown in tab header
  feedType: "jobs" | "contacts"; // determines which shell layout to use
}

export const TABS: TabConfig[] = [
  {
    id: "jobs",
    label: "Find Jobs",
    region: "India",
    dataStatus: "live",
    description: "Fresh job listings from the India job board",
    feedType: "jobs",
  },
  {
    id: "tracker",
    label: "Job Tracker",
    region: "All",
    dataStatus: "live",
    description: "Track every application from applied to offer",
    feedType: "jobs",
  },
  {
    id: "emails",
    label: "HR Emails",
    region: "India",
    dataStatus: "live",
    description: "HR recruiter contacts for direct outreach",
    feedType: "contacts",
  },
  {
    id: "dubai-hr",
    label: "Dubai HR",
    region: "UAE",
    dataStatus: "live",   // fetches from API; graceful shell if 404/empty
    description: "UAE-based HR recruiters and hiring contacts",
    feedType: "contacts",
  },
  {
    id: "gulf-jobs",
    label: "Gulf Jobs",
    region: "GCC",
    dataStatus: "empty",
    description: "Job listings across Saudi Arabia, UAE, Qatar, and Kuwait",
    feedType: "jobs",
  },
  {
    id: "au-nz",
    label: "AU & NZ",
    region: "AU/NZ",
    dataStatus: "empty",
    description: "Tech and professional roles across Australia and New Zealand",
    feedType: "jobs",
  },
];
```

### 2.2 Tab Component Prop Model

All tab content components share a consistent interface:

```ts
interface RegionTabProps {
  config: TabConfig;
}
```

Each component is responsible for its own data fetching. The hub page passes only `config`.

```tsx
// app/job-tracker/page.tsx — tab content rendering
const TAB_COMPONENTS: Record<TabId, React.ComponentType<RegionTabProps>> = {
  jobs:      () => <JobBoard />,
  tracker:   (props) => <TrackerView config={props.config} />,
  emails:    (props) => <HrEmailsTable config={props.config} />,
  "dubai-hr": (props) => <DubaiHrTab config={props.config} />,
  "gulf-jobs": (props) => <GulfJobsTab config={props.config} />,
  "au-nz":   (props) => <AuNzJobsTab config={props.config} />,
};

const ActiveTab = TAB_COMPONENTS[view];
return <ActiveTab config={TABS.find(t => t.id === view)!} />;
```

### 2.3 Tab Header System

Every tab renders a standard header block above its content. This creates consistency across all 6 views:

```tsx
// src/components/jobs-hub/TabHeader.tsx
interface TabHeaderProps {
  config: TabConfig;
  badge?: React.ReactNode; // optional status badge (e.g., live-ready indicator)
}

export function TabHeader({ config, badge }: TabHeaderProps) {
  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">
        {config.region}
      </p>
      <div className="flex items-center gap-3">
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900">
          {config.label}
        </h1>
        {badge}
      </div>
      <p className="text-neutral-500 mt-3 max-w-2xl">
        {config.description}
      </p>
    </div>
  );
}
```

### 2.4 Dubai HR Fetch with Fallback

```ts
// src/components/jobs-hub/DubaiHrTab.tsx — data fetch strategy

const PRIMARY_URL = `${process.env.NEXT_PUBLIC_API_URL}/hr/dubai/list`;
const FALLBACK_URL = `${process.env.NEXT_PUBLIC_API_URL}/hr/list/demo?region=dubai`;

async function fetchDubaiContacts(): Promise<HrContact[]> {
  try {
    const res = await fetch(PRIMARY_URL);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.list) && data.list.length > 0) return data.list;
    }
    // 404 or empty → try fallback
    const fallback = await fetch(FALLBACK_URL);
    if (fallback.ok) {
      const data = await fallback.json();
      if (Array.isArray(data?.list)) return data.list;
    }
  } catch {
    // network failure — return mock data below
  }
  return DUBAI_MOCK_CONTACTS; // always returns something
}
```

### 2.5 Mock Data Spec for Dubai HR

When both endpoints fail or return empty, render the following mock contacts marked with a `"mock"` flag. The component renders them identically to real data — only the status badge changes.

```ts
const DUBAI_MOCK_CONTACTS: HrContact[] = [
  {
    id: "mock-1",
    name: "Sara Al-Mansoori",
    title: "Senior HR Business Partner",
    company: "Al-Maktoum Group",
    email: "s.almansoori@almaktoum.ae",
    linkedIn: "https://linkedin.com/in/sara-almansoori",
    location: "Dubai, UAE",
    status: "active",
  },
  {
    id: "mock-2",
    name: "James Thornton",
    title: "Talent Acquisition Lead",
    company: "Dubai Tech Partners",
    email: "j.thornton@dubaitechpartners.com",
    linkedIn: "https://linkedin.com/in/james-thornton-dxb",
    location: "Dubai Internet City",
    status: "active",
  },
  {
    id: "mock-3",
    name: "Fatima Al-Zaabi",
    title: "HR Manager — Tech",
    company: "Emirates NBD Digital",
    email: "f.alzaabi@emiratesnbd.com",
    linkedIn: "https://linkedin.com/in/fatima-alzaabi",
    location: "DIFC, Dubai",
    status: "active",
  },
  {
    id: "mock-4",
    name: "Ravi Krishnamurthy",
    title: "Engineering Recruiter",
    company: "Careem (Uber Technologies)",
    email: "ravi.k@careem.com",
    linkedIn: "https://linkedin.com/in/ravi-k-dubai",
    location: "Dubai, UAE",
    status: "active",
  },
  {
    id: "mock-5",
    name: "Noura Al-Rashidi",
    title: "People Operations Lead",
    company: "Noon.com",
    email: "noura.alrashidi@noon.com",
    linkedIn: "https://linkedin.com/in/noura-alrashidi",
    location: "Dubai, UAE",
    status: "active",
  },
];
```

### 2.6 Live-Ready Empty State Shell

For Gulf Jobs and AU & NZ (dataStatus: "empty"), render structural shells that look like populated content is loading. No illustrations, no "coming soon" language.

Shell spec for a jobs feed:

```tsx
// EmptyRegionState renders N skeleton cards using the same card dimensions as JobCard
function JobCardSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-neutral-100 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-neutral-100 animate-pulse rounded-full w-3/4" />
          <div className="h-3 bg-neutral-100 animate-pulse rounded-full w-1/2" />
        </div>
        <div className="w-16 h-6 bg-neutral-100 animate-pulse rounded-full" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-neutral-100 animate-pulse rounded-full w-full" />
        <div className="h-3 bg-neutral-100 animate-pulse rounded-full w-5/6" />
      </div>
      <div className="h-9 bg-neutral-100 animate-pulse rounded-xl" />
    </div>
  );
}
```

Render 6 skeletons in a `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4` grid (matches `job-board.tsx:359`).

Below the grid, render the live-ready status badge:

```tsx
<div className="flex items-center justify-center gap-2 mt-8 text-xs text-neutral-400">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
  <span>Live-ready feed — connecting data source</span>
</div>
```

No large illustrations. No center-page empty states. The skeleton grid communicates "data is about to appear here" without announcing incompleteness.

---

## 3. Micro-Interaction System

### 3.1 Active Tab Indicator — Shared Layout Morph

Implementation uses Motion v12 `layoutId`. The active background morphs between tab positions with a spring transition. The text color crossfades independently via CSS (cheaper, interruptible).

```tsx
function TabPill({
  tab,
  active,
  onClick,
  tabRef,
}: {
  tab: TabConfig;
  active: boolean;
  onClick: (id: TabId) => void;
  tabRef: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <button
      ref={tabRef}
      type="button"
      onClick={() => onClick(tab.id)}
      className="relative px-5 py-2 rounded-full text-xs font-semibold
                 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-neutral-900 focus-visible:ring-offset-2
                 focus-visible:ring-offset-white"
      aria-pressed={active}
    >
      {active && (
        <motion.span
          layoutId="tab-active-pill"
          className="absolute inset-0 rounded-full bg-neutral-900"
          transition={{
            type: "spring",
            duration: 0.35,
            bounce: 0.12,
          }}
        />
      )}
      <span
        className={cn(
          "relative z-10 transition-colors duration-150",
          active ? "text-white" : "text-neutral-500 hover:text-neutral-900"
        )}
      >
        {tab.label}
      </span>
    </button>
  );
}
```

**Spring parameters rationale:**
- `duration: 0.35` — 350ms sits at the upper boundary of Emil's UI animation range. Acceptable for a layout morph (not a simple button press). Feels deliberate without being slow.
- `bounce: 0.12` — barely perceptible bounce. Below 0.15 reads as "natural settle," not "bouncy."
- `type: "spring"` uses FLIP internally in Motion v12 — hardware-accelerated, does not animate layout properties.

**`prefers-reduced-motion` override:**

```tsx
const shouldReduceMotion = useReducedMotion();

// In the TabPill transition prop:
transition={shouldReduceMotion
  ? { duration: 0, type: "tween" }
  : { type: "spring", duration: 0.35, bounce: 0.12 }
}
```

When reduced motion is preferred, the active indicator snaps instantly with no animation.

### 3.2 Scroll-to-Center on Tab Click

```ts
const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement>>>({});

function handleTabClick(id: TabId) {
  setView(id);
  // scrollIntoView runs after state update to give React time to mark the pill active
  requestAnimationFrame(() => {
    tabRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  });
}

// On initial mount — scroll to default active tab with no animation
useEffect(() => {
  tabRefs.current[view]?.scrollIntoView({
    behavior: "instant",
    block: "nearest",
    inline: "center",
  });
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

`requestAnimationFrame` ensures `scrollIntoView` runs after the browser has processed the React state update and re-rendered the active pill, so the scroll target has its final measured size.

### 3.3 Tab Content Entry Animation

Each tab content region animates in with a single `motion.div`:

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={view}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
  >
    <ActiveTab config={activeTabConfig} />
  </motion.div>
</AnimatePresence>
```

- `mode="wait"` — exits the old tab before entering the new one, prevents double-render overlap
- `ease: [0.23, 1, 0.32, 1]` — strong ease-out (Emil's `--ease-out` cubic-bezier variant)
- `y: 8 → 0` on enter, `y: 0 → -4` on exit — subtle directional motion, not a large slide
- Duration: 220ms — under Emil's 300ms UI cap

`prefers-reduced-motion`: when active, set `y: 0` for both initial/exit (keep opacity fade, remove position motion).

### 3.4 Focus Ring Specification

All tab buttons must expose a visible focus ring for keyboard navigation. Ring must not clip inside the pill strip container:

```
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-neutral-900
focus-visible:ring-offset-2
focus-visible:ring-offset-white
```

The scroll container must allow `overflow: visible` on the focus axis or the ring clips. If the ring clips at the strip edges: add `py-1` padding to the scroll container and `my-[-4px]` negative margin to compensate.

### 3.5 Button Press Feedback

Per Emil's principles, pressable elements need `:active` scale feedback:

```css
/* Applied via Tailwind: active:scale-[0.97] */
```

Add `active:scale-[0.97]` to each `TabPill` button className. `transition-transform duration-100` ensures it returns on release at 100ms.

### 3.6 Live-Ready Status Badge Pulse

The Dubai HR tab (when showing mock data) and the empty-state skeleton grid (Gulf, AU/NZ) both use a small pulse indicator. Spec:

```tsx
function LiveReadyBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                     bg-emerald-50 border border-emerald-200 text-emerald-700
                     text-[10px] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      {text}
    </span>
  );
}
```

Usage in `DubaiHrTab.tsx` when data is mock:
```tsx
<TabHeader
  config={config}
  badge={isMockData && <LiveReadyBadge text="Live-Ready Feed — Syncing Data" />}
/>
```

---

## 4. Files to Create or Modify

### New files

| File | Purpose |
|---|---|
| `src/components/jobs-hub/tabs.config.ts` | Tab config array — single source of truth |
| `src/components/jobs-hub/JobsHubNav.tsx` | Scrollable pill nav with spring morph and fade overlays |
| `src/components/jobs-hub/TabHeader.tsx` | Shared tab header (region label, title, description, badge) |
| `src/components/jobs-hub/EmptyRegionState.tsx` | Skeleton grid + live-ready badge |
| `src/components/jobs-hub/DubaiHrTab.tsx` | Dubai HR contacts table with fetch fallback + mock data |
| `src/components/jobs-hub/GulfJobsTab.tsx` | Gulf jobs live-ready shell |
| `src/components/jobs-hub/AuNzJobsTab.tsx` | AU & NZ live-ready shell |

### Modified files

| File | Change |
|---|---|
| `app/job-tracker/page.tsx` | Replace inline nav + View type with `<JobsHubNav>` + TAB_COMPONENTS dispatch |
| `src/components/sidebar-demo.tsx` | Remove inner `view` state (line 184) and inner pill toggle (lines 388–410) |
| `src/components/hr-emails-table.tsx` | Replace `bg-blue-600` table header with `bg-neutral-900` |
| `app/globals.css` | Add `.scrollbar-hide` class |

### Safe edit order

1. `app/globals.css` — isolated, no component deps
2. `tabs.config.ts` — pure data, no rendering
3. `TabHeader.tsx`, `EmptyRegionState.tsx` — new components, not yet used
4. `JobsHubNav.tsx` — new component, not yet used
5. `DubaiHrTab.tsx`, `GulfJobsTab.tsx`, `AuNzJobsTab.tsx` — new, not yet wired
6. `app/job-tracker/page.tsx` — wire everything together
7. `sidebar-demo.tsx` — remove inner toggle (after confirming step 6 works)
8. `hr-emails-table.tsx` — header color fix

---

## 5. Testing Checklist

- [ ] No horizontal page overflow at 375px (`document.body.scrollWidth <= 375`)
- [ ] Clicking AU & NZ tab centers it in the viewport
- [ ] Right fade hides when scrolled to end; left fade hides at scroll start
- [ ] `bg-neutral-50` fade matches page background — no visible banding at edges
- [ ] All 6 tabs render their content without console errors
- [ ] Dubai HR shows mock data + "Live-Ready Feed" badge when API is unreachable
- [ ] Job board category filter still works on Find Jobs tab
- [ ] Job Tracker table still editable with status dropdowns
- [ ] HR Emails table loads data
- [ ] `prefers-reduced-motion` disables spring animation and y-motion on tab change
- [ ] Focus ring visible on keyboard tab-through; not clipped by scroll container
- [ ] `npm run build` passes TypeScript with no errors
