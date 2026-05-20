# Multi-Region Jobs Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Dubai HR, Gulf Jobs, and AU & NZ tabs to the jobs hub, replace the current static 3-tab pill row with a scrollable 6-tab nav that morphs the active indicator via spring animation, and unify all tab headers and empty states under one consistent design system.

**Architecture:** A new `src/components/jobs-hub/` directory holds all tab config, the nav component, and each tab's content component. `app/job-tracker/page.tsx` is the single orchestration point — it holds the view state and renders `<JobsHubNav>` plus the active tab's content wrapped in `<AnimatePresence>`. The inner duplicate toggle inside `sidebar-demo.tsx` is removed.

**Tech Stack:** Next.js 15 App Router, Tailwind v4, Motion v12 (`motion/react`), TypeScript, `cn` from `@/lib/utils`

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/components/jobs-hub/tabs.config.ts` | Single source of truth for all tab definitions and TabId type |
| Create | `src/components/jobs-hub/LiveReadyBadge.tsx` | Emerald pulse dot + status text badge |
| Create | `src/components/jobs-hub/TabHeader.tsx` | Consistent region/title/description header for all tabs |
| Create | `src/components/jobs-hub/EmptyRegionState.tsx` | Skeleton grid + badge for data-pending tabs |
| Create | `src/components/jobs-hub/JobsHubNav.tsx` | Scrollable pill nav with spring layoutId morph and fade overlays |
| Create | `src/components/jobs-hub/DubaiHrTab.tsx` | Dubai HR contacts table — fetches API with graceful mock fallback |
| Create | `src/components/jobs-hub/GulfJobsTab.tsx` | Gulf jobs live-ready shell |
| Create | `src/components/jobs-hub/AuNzJobsTab.tsx` | AU & NZ live-ready shell |
| Modify | `app/job-tracker/page.tsx` | Replace inline nav + View type; wire all 6 tabs with AnimatePresence |
| Modify | `src/components/sidebar-demo.tsx` | Remove inner view state + inner pill toggle + HrEmailsTable import |
| Modify | `src/components/hr-emails-table.tsx` | Replace `bg-blue-600` table header with `bg-neutral-900` |
| Modify | `src/index.css` | Add `.scrollbar-hide` CSS utility class |

---

## Task 1: Add scrollbar-hide CSS utility

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1.1: Find the CSS entry point**

```bash
grep -n "globals\|index.css\|App.css\|\.css" app/layout.tsx
```

Expected: line showing `import '@/index.css'` or `import '@/App.css'`

- [ ] **Step 1.2: Open `src/index.css` and append the utility**

At the end of `src/index.css`, add:

```css
/* Scrollbar utilities */
.scrollbar-hide {
  scrollbar-width: none;        /* Firefox */
  -ms-overflow-style: none;     /* IE / Edge legacy */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;                /* Chrome, Safari, Chromium Edge */
}
```

- [ ] **Step 1.3: Verify build still passes**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 1.4: Commit**

```bash
git add src/index.css
git commit -m "style: add scrollbar-hide utility class"
```

---

## Task 2: Create tab config

**Files:**
- Create: `src/components/jobs-hub/tabs.config.ts`

- [ ] **Step 2.1: Create the directory and file**

```bash
mkdir -p src/components/jobs-hub
```

Create `src/components/jobs-hub/tabs.config.ts` with this exact content:

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
  label: string;
  region: string;
  dataStatus: DataStatus;
  description: string;
  feedType: "jobs" | "contacts";
}

export const TABS: TabConfig[] = [
  {
    id: "jobs",
    label: "Find Jobs",
    region: "India",
    dataStatus: "live",
    description: "Fresh job listings updated every 48 hours",
    feedType: "jobs",
  },
  {
    id: "tracker",
    label: "Job Tracker",
    region: "Workspace",
    dataStatus: "live",
    description: "Track stages, export to Sheets, and manage every application",
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
    dataStatus: "live",
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

- [ ] **Step 2.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 2.3: Commit**

```bash
git add src/components/jobs-hub/tabs.config.ts
git commit -m "feat: add jobs hub tab config with 6-tab schema"
```

---

## Task 3: Create LiveReadyBadge and TabHeader

**Files:**
- Create: `src/components/jobs-hub/LiveReadyBadge.tsx`
- Create: `src/components/jobs-hub/TabHeader.tsx`

- [ ] **Step 3.1: Create `src/components/jobs-hub/LiveReadyBadge.tsx`**

```tsx
export function LiveReadyBadge({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                 bg-emerald-50 border border-emerald-200 text-emerald-700
                 text-[10px] font-semibold shrink-0"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      {text}
    </span>
  );
}
```

- [ ] **Step 3.2: Create `src/components/jobs-hub/TabHeader.tsx`**

```tsx
import type { ReactNode } from "react";
import type { TabConfig } from "./tabs.config";

interface TabHeaderProps {
  config: TabConfig;
  badge?: ReactNode;
}

export function TabHeader({ config, badge }: TabHeaderProps) {
  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">
        {config.region}
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-3xl md:text-5xl font-bold text-neutral-900">
          {config.label}
        </h1>
        {badge}
      </div>
      <p className="text-neutral-500 mt-3 max-w-2xl">{config.description}</p>
    </div>
  );
}
```

- [ ] **Step 3.3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3.4: Commit**

```bash
git add src/components/jobs-hub/LiveReadyBadge.tsx src/components/jobs-hub/TabHeader.tsx
git commit -m "feat: add LiveReadyBadge and TabHeader components"
```

---

## Task 4: Create EmptyRegionState

**Files:**
- Create: `src/components/jobs-hub/EmptyRegionState.tsx`

- [ ] **Step 4.1: Create `src/components/jobs-hub/EmptyRegionState.tsx`**

```tsx
import type { TabConfig } from "./tabs.config";
import { TabHeader } from "./TabHeader";
import { LiveReadyBadge } from "./LiveReadyBadge";

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

interface EmptyRegionStateProps {
  config: TabConfig;
}

export function EmptyRegionState({ config }: EmptyRegionStateProps) {
  return (
    <>
      <TabHeader
        config={config}
        badge={
          <LiveReadyBadge text="Live-Ready Feed — Connecting Data Source" />
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 mt-8 text-xs text-neutral-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Live-ready feed — connecting data source</span>
      </div>
    </>
  );
}
```

- [ ] **Step 4.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4.3: Commit**

```bash
git add src/components/jobs-hub/EmptyRegionState.tsx
git commit -m "feat: add EmptyRegionState skeleton shell for data-pending tabs"
```

---

## Task 5: Create JobsHubNav

**Files:**
- Create: `src/components/jobs-hub/JobsHubNav.tsx`

- [ ] **Step 5.1: Create `src/components/jobs-hub/JobsHubNav.tsx`**

```tsx
"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { TABS, type TabId, type TabConfig } from "./tabs.config";

interface JobsHubNavProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

function FadeEdge({
  side,
  visible,
}: {
  side: "left" | "right";
  visible: boolean;
}) {
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

function TabPill({
  tab,
  active,
  onClick,
  setRef,
  reduceMotion,
}: {
  tab: TabConfig;
  active: boolean;
  onClick: (id: TabId) => void;
  setRef: (el: HTMLButtonElement | null) => void;
  reduceMotion: boolean;
}) {
  return (
    <button
      ref={setRef}
      type="button"
      onClick={() => onClick(tab.id)}
      aria-pressed={active}
      className="relative px-5 py-2 rounded-full text-xs font-semibold
                 active:scale-[0.97] transition-transform duration-100
                 focus-visible:outline-none focus-visible:ring-2
                 focus-visible:ring-neutral-900 focus-visible:ring-offset-2
                 focus-visible:ring-offset-white"
    >
      {active && (
        <motion.span
          layoutId="tab-active-pill"
          className="absolute inset-0 rounded-full bg-neutral-900"
          transition={
            reduceMotion
              ? { duration: 0, type: "tween" }
              : { type: "spring", duration: 0.35, bounce: 0.12 }
          }
        />
      )}
      <span
        className={cn(
          "relative z-10 transition-colors duration-150",
          active
            ? "text-white"
            : "text-neutral-500 hover:text-neutral-900"
        )}
      >
        {tab.label}
      </span>
    </button>
  );
}

export function JobsHubNav({ active, onChange }: JobsHubNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<TabId, HTMLButtonElement>>>({});
  const [fades, setFades] = useState({ left: false, right: false });
  const reduceMotion = useReducedMotion() ?? false;

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const THRESHOLD = 8;
    setFades({
      left: el.scrollLeft > THRESHOLD,
      right: el.scrollLeft < el.scrollWidth - el.clientWidth - THRESHOLD,
    });
  }

  // Initialize fade state on mount
  useEffect(() => {
    handleScroll();
  }, []);

  // Scroll active tab to center on initial render (no animation)
  useEffect(() => {
    tabRefs.current[active]?.scrollIntoView({
      behavior: "instant" as ScrollBehavior,
      block: "nearest",
      inline: "center",
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTabClick(id: TabId) {
    onChange(id);
    // rAF gives React time to mark the new pill active before scrollIntoView runs
    requestAnimationFrame(() => {
      tabRefs.current[id]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    });
  }

  return (
    <div className="relative mb-10">
      <FadeEdge side="left" visible={fades.left} />
      <div
        ref={scrollRef}
        data-testid="tab-scroll-container"
        onScroll={handleScroll}
        className="overflow-x-auto scroll-smooth scrollbar-hide"
      >
        <div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white shadow-sm p-1 w-max">
          {TABS.map((tab) => (
            <TabPill
              key={tab.id}
              tab={tab}
              active={active === tab.id}
              onClick={handleTabClick}
              setRef={(el) => {
                if (el) tabRefs.current[tab.id] = el;
              }}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
      <FadeEdge side="right" visible={fades.right} />
    </div>
  );
}
```

- [ ] **Step 5.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5.3: Commit**

```bash
git add src/components/jobs-hub/JobsHubNav.tsx
git commit -m "feat: add JobsHubNav with spring morph, fade overlays, and scroll centering"
```

---

## Task 6: Create DubaiHrTab

**Files:**
- Create: `src/components/jobs-hub/DubaiHrTab.tsx`

- [ ] **Step 6.1: Create `src/components/jobs-hub/DubaiHrTab.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TabHeader } from "./TabHeader";
import { LiveReadyBadge } from "./LiveReadyBadge";
import type { TabConfig } from "./tabs.config";

interface HrContact {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  linkedIn: string;
  location: string;
}

const DUBAI_MOCK_CONTACTS: HrContact[] = [
  {
    id: "mock-1",
    name: "Sara Al-Mansoori",
    title: "Senior HR Business Partner",
    company: "Al-Maktoum Group",
    email: "s.almansoori@almaktoum.ae",
    phone: "+971 4 000 0001",
    linkedIn: "https://linkedin.com/in/sara-almansoori",
    location: "Dubai, UAE",
  },
  {
    id: "mock-2",
    name: "James Thornton",
    title: "Talent Acquisition Lead",
    company: "Dubai Tech Partners",
    email: "j.thornton@dubaitechpartners.com",
    phone: "+971 4 000 0002",
    linkedIn: "https://linkedin.com/in/james-thornton-dxb",
    location: "Dubai Internet City",
  },
  {
    id: "mock-3",
    name: "Fatima Al-Zaabi",
    title: "HR Manager — Tech",
    company: "Emirates NBD Digital",
    email: "f.alzaabi@emiratesnbd.com",
    phone: "+971 4 000 0003",
    linkedIn: "https://linkedin.com/in/fatima-alzaabi",
    location: "DIFC, Dubai",
  },
  {
    id: "mock-4",
    name: "Ravi Krishnamurthy",
    title: "Engineering Recruiter",
    company: "Careem (Uber Technologies)",
    email: "ravi.k@careem.com",
    phone: "+971 4 000 0004",
    linkedIn: "https://linkedin.com/in/ravi-k-dubai",
    location: "Dubai, UAE",
  },
  {
    id: "mock-5",
    name: "Noura Al-Rashidi",
    title: "People Operations Lead",
    company: "Noon.com",
    email: "noura.alrashidi@noon.com",
    phone: "+971 4 000 0005",
    linkedIn: "https://linkedin.com/in/noura-alrashidi",
    location: "Dubai, UAE",
  },
];

async function fetchDubaiContacts(): Promise<{
  contacts: HrContact[];
  isMock: boolean;
}> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  try {
    const primary = await fetch(`${base}/hr/dubai/list`);
    if (primary.ok) {
      const data = await primary.json();
      if (Array.isArray(data?.list) && data.list.length > 0) {
        return { contacts: data.list, isMock: false };
      }
    }
    const fallback = await fetch(`${base}/hr/list/demo?region=dubai`);
    if (fallback.ok) {
      const data = await fallback.json();
      if (Array.isArray(data?.list) && data.list.length > 0) {
        return { contacts: data.list, isMock: false };
      }
    }
  } catch {
    // network failure — use mock data below
  }
  return { contacts: DUBAI_MOCK_CONTACTS, isMock: true };
}

function renderCell(value: string | undefined) {
  if (!value) return <span className="text-slate-400">-</span>;
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 hover:underline"
      >
        View
      </a>
    );
  }
  return <span className="text-slate-700">{value}</span>;
}

interface DubaiHrTabProps {
  config: TabConfig;
}

export function DubaiHrTab({ config }: DubaiHrTabProps) {
  const [contacts, setContacts] = useState<HrContact[]>([]);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDubaiContacts().then(({ contacts, isMock }) => {
      setContacts(contacts);
      setIsMock(isMock);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <TabHeader
        config={config}
        badge={
          !loading && isMock ? (
            <LiveReadyBadge text="Live-Ready Feed — Syncing Data" />
          ) : undefined
        }
      />
      <div className="border border-neutral-200 bg-white shadow-sm rounded-lg overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-neutral-900 text-white sticky top-0 z-10">
            <tr>
              {["#", "Name", "Title", "Company", "Email", "Phone", "LinkedIn", "Location"].map(
                (h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-neutral-100">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-3 py-2.5">
                        <div className="h-3 bg-neutral-100 animate-pulse rounded-full w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : contacts.map((row, i) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-neutral-100 hover:bg-neutral-50 transition-colors",
                      i % 2 === 0 ? "bg-white" : "bg-neutral-50/50"
                    )}
                  >
                    <td className="px-3 py-2.5 text-slate-400">{i + 1}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                      {row.name}
                    </td>
                    <td className="px-3 py-2.5">{renderCell(row.title)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{renderCell(row.company)}</td>
                    <td className="px-3 py-2.5">{renderCell(row.email)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{renderCell(row.phone)}</td>
                    <td className="px-3 py-2.5">{renderCell(row.linkedIn)}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{renderCell(row.location)}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

- [ ] **Step 6.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6.3: Commit**

```bash
git add src/components/jobs-hub/DubaiHrTab.tsx
git commit -m "feat: add DubaiHrTab with API fallback and mock HR contacts"
```

---

## Task 7: Create GulfJobsTab and AuNzJobsTab

**Files:**
- Create: `src/components/jobs-hub/GulfJobsTab.tsx`
- Create: `src/components/jobs-hub/AuNzJobsTab.tsx`

- [ ] **Step 7.1: Create `src/components/jobs-hub/GulfJobsTab.tsx`**

```tsx
import type { TabConfig } from "./tabs.config";
import { EmptyRegionState } from "./EmptyRegionState";

interface GulfJobsTabProps {
  config: TabConfig;
}

export function GulfJobsTab({ config }: GulfJobsTabProps) {
  return <EmptyRegionState config={config} />;
}
```

- [ ] **Step 7.2: Create `src/components/jobs-hub/AuNzJobsTab.tsx`**

```tsx
import type { TabConfig } from "./tabs.config";
import { EmptyRegionState } from "./EmptyRegionState";

interface AuNzJobsTabProps {
  config: TabConfig;
}

export function AuNzJobsTab({ config }: AuNzJobsTabProps) {
  return <EmptyRegionState config={config} />;
}
```

- [ ] **Step 7.3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 7.4: Commit**

```bash
git add src/components/jobs-hub/GulfJobsTab.tsx src/components/jobs-hub/AuNzJobsTab.tsx
git commit -m "feat: add GulfJobsTab and AuNzJobsTab live-ready shells"
```

---

## Task 8: Update app/job-tracker/page.tsx

**Files:**
- Modify: `app/job-tracker/page.tsx`

- [ ] **Step 8.1: Replace the full contents of `app/job-tracker/page.tsx`**

```tsx
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import SidebarDemo from "@/components/sidebar-demo";
import HrEmailsTable from "@/components/hr-emails-table";
import JobBoard from "@/components/job-board";
import { JobsHubNav } from "@/components/jobs-hub/JobsHubNav";
import { TabHeader } from "@/components/jobs-hub/TabHeader";
import { DubaiHrTab } from "@/components/jobs-hub/DubaiHrTab";
import { GulfJobsTab } from "@/components/jobs-hub/GulfJobsTab";
import { AuNzJobsTab } from "@/components/jobs-hub/AuNzJobsTab";
import { TABS, type TabId } from "@/components/jobs-hub/tabs.config";

const VALID_TABS = new Set<TabId>(TABS.map((t) => t.id));

function JobTrackerContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabId | null;
  const [view, setView] = useState<TabId>(
    tabParam && VALID_TABS.has(tabParam) ? tabParam : "tracker"
  );
  const reduceMotion = useReducedMotion() ?? false;

  const activeConfig = TABS.find((t) => t.id === view)!;

  return (
    <BackgroundRippleLayout tone="light" contentClassName="pt-16">
      <Navbar tone="light" />
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <JobsHubNav active={view} onChange={setView} />

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -4 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            >
              {view === "jobs" && <JobBoard />}

              {view === "tracker" && (
                <>
                  <TabHeader config={activeConfig} />
                  <SidebarDemo />
                </>
              )}

              {view === "emails" && (
                <>
                  <TabHeader config={activeConfig} />
                  <HrEmailsTable
                    className="border border-neutral-200 bg-white shadow-sm rounded-lg"
                    tableClassName="max-h-[520px]"
                  />
                </>
              )}

              {view === "dubai-hr" && <DubaiHrTab config={activeConfig} />}
              {view === "gulf-jobs" && <GulfJobsTab config={activeConfig} />}
              {view === "au-nz" && <AuNzJobsTab config={activeConfig} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </BackgroundRippleLayout>
  );
}

export default function JobTrackerRoute() {
  return (
    <Suspense>
      <JobTrackerContent />
    </Suspense>
  );
}
```

- [ ] **Step 8.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 8.3: Start the dev server and open `/job-tracker` in a browser**

```bash
npm run dev
```

Verify:
- All 6 pill tabs visible (may need to scroll on narrow window)
- Clicking each tab switches content without console errors
- Active pill moves with spring morph animation
- Find Jobs, Job Tracker, HR Emails tabs show their existing content
- Dubai HR shows the mock contacts table with "Live-Ready Feed — Syncing Data" badge
- Gulf Jobs and AU & NZ show skeleton grids with live-ready badge

- [ ] **Step 8.4: Commit**

```bash
git add app/job-tracker/page.tsx
git commit -m "feat: wire 6-tab jobs hub with JobsHubNav and AnimatePresence transitions"
```

---

## Task 9: Remove inner toggle from sidebar-demo.tsx

**Files:**
- Modify: `src/components/sidebar-demo.tsx`

> The inner component inside `sidebar-demo.tsx` (around line 184) has its own `view` state and pill toggle for "Job Tracker UI" / "HR Emails". This is now superseded by the top-level nav. The component should only render the tracker table.

- [ ] **Step 9.1: Remove `import HrEmailsTable` from sidebar-demo.tsx**

Find and delete line 5:
```tsx
import HrEmailsTable from "./hr-emails-table";
```

- [ ] **Step 9.2: Remove the `view` state declaration**

Find and delete (around line 184):
```tsx
const [view, setView] = useState<"tracker" | "emails">("tracker");
```

- [ ] **Step 9.3: Remove the inner pill toggle div**

Find and delete this entire block (the toggle inside the workspace header, around lines 388–410):
```tsx
<div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1">
  <button
    onClick={() => setView("tracker")}
    className={cn(
      "rounded-full px-4 py-1.5 text-[11px] font-semibold transition",
      view === "tracker" ? "bg-neutral-900 text-white shadow" : "text-neutral-500 hover:text-neutral-700"
    )}
  >
    Job Tracker UI
  </button>
  <button
    onClick={() => setView("emails")}
    className={cn(
      "rounded-full px-4 py-1.5 text-[11px] font-semibold transition",
      view === "emails" ? "bg-neutral-900 text-white shadow" : "text-neutral-500 hover:text-neutral-700"
    )}
  >
    HR Emails
  </button>
</div>
```

- [ ] **Step 9.4: Remove the conditional render — keep only the tracker content**

Find the ternary:
```tsx
{view === "tracker" ? (
  <>
    {/* tracker content */}
  </>
) : (
  <HrEmailsTable className="mt-4" />
)}
```

Replace it with just the tracker content (remove the ternary wrapper and the HrEmailsTable branch):
```tsx
<>
  {/* tracker content — same JSX that was inside the view === "tracker" branch */}
</>
```

- [ ] **Step 9.5: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors. If `setView` or `view` references remain, remove them.

- [ ] **Step 9.6: Verify in browser**

Navigate to `/job-tracker`, click Job Tracker tab. Confirm: no inner toggle visible, tracker table renders correctly, application rows editable, no console errors.

- [ ] **Step 9.7: Commit**

```bash
git add src/components/sidebar-demo.tsx
git commit -m "refactor: remove redundant inner tab toggle from sidebar-demo"
```

---

## Task 10: Fix HR Emails table header + final verification

**Files:**
- Modify: `src/components/hr-emails-table.tsx`

- [ ] **Step 10.1: Replace `bg-blue-600` with `bg-neutral-900` in hr-emails-table.tsx**

Find (line 141):
```tsx
<thead className="bg-blue-600 text-white sticky top-0 z-10">
```

Replace with:
```tsx
<thead className="bg-neutral-900 text-white sticky top-0 z-10">
```

- [ ] **Step 10.2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 10.3: Full build check**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors

- [ ] **Step 10.4: Browser verification checklist**

With `npm run dev` running, verify at `http://localhost:3000/job-tracker`:

| Check | Expected |
|---|---|
| All 6 tabs visible | Pass |
| Pill morph animates on click | Pass |
| No horizontal page scroll at 375px wide (resize window) | Pass |
| Find Jobs tab: category chips work | Pass |
| Job Tracker tab: table editable, no inner toggle | Pass |
| HR Emails tab: dark header (not blue), data loads | Pass |
| Dubai HR tab: mock contacts visible, badge shown | Pass |
| Gulf Jobs tab: 6 skeleton cards, live-ready badge | Pass |
| AU & NZ tab: 6 skeleton cards, live-ready badge | Pass |
| No console errors on any tab | Pass |

- [ ] **Step 10.5: Commit**

```bash
git add src/components/hr-emails-table.tsx
git commit -m "style: replace blue-600 HR emails table header with neutral-900"
```

---

## Spec Coverage Check

| Spec requirement | Covered by task |
|---|---|
| Scrollable pill row | Task 5 (JobsHubNav) |
| `w-max` pill strip (not `w-fit`) | Task 5 |
| `bg-neutral-50` fade overlays | Task 5 |
| Fade show/hide logic with 8px threshold | Task 5 |
| `scrollbar-hide` CSS utility | Task 1 |
| `layoutId="tab-active-pill"` spring morph | Task 5 |
| `prefers-reduced-motion` override | Task 5 |
| `scrollIntoView` centering on click | Task 5 |
| `requestAnimationFrame` before scrollIntoView | Task 5 |
| `data-testid` attributes for Playwright | Task 5 |
| `TabConfig` interface + `TABS` array | Task 2 |
| `TabId` union type | Task 2 |
| `TabHeader` with region/title/description/badge | Task 3 |
| `LiveReadyBadge` emerald pulse | Task 3 |
| `EmptyRegionState` skeleton grid 6 cards | Task 4 |
| `AnimatePresence mode="wait"` content transitions | Task 8 |
| `ease: [0.23, 1, 0.32, 1]` exit/enter | Task 8 |
| Dubai HR fetch with primary + fallback URL | Task 6 |
| Dubai HR mock contacts (5 realistic entries) | Task 6 |
| Dubai HR inline table skeleton rows during loading | Task 6 |
| Gulf Jobs live-ready shell | Task 7 |
| AU & NZ live-ready shell | Task 7 |
| Remove inner sidebar-demo toggle | Task 9 |
| HR Emails header `bg-blue-600` → `bg-neutral-900` | Task 10 |
| URL param `?tab=` validation extended to 6 tabs | Task 8 |
