# Job Tracker Routing Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the single `/job-tracker?tab=` client page into six real Next.js App Router routes under `/job-tracker/*`, sharing a layout that renders the hub nav.

**Architecture:** A new `app/job-tracker/layout.tsx` owns the `Navbar` + `JobsHubNav` shell; each tab section becomes an independent page. `JobsHubNav` is converted from a callback-driven tab component into a link-driven nav using `usePathname`. Query-param URLs are handled by redirects in `next.config.ts`.

**Tech Stack:** Next.js App Router, React 18, Framer Motion, Tailwind, TypeScript.

## Global Constraints

- Do NOT touch: `app/referrals/**`, any referral/referrer file, backend, jobflix frontend, auth logic, API logic, env vars, package files, or components not in the allowed list.
- Do NOT rewrite: `JobBoard`, `SidebarDemo`, `HrEmailsTable`, `RegionalEmptyState`, `TabHeader`, `LiveReadyBadge`.
- Routing refactor only — no visual redesign.
- TypeScript must compile clean; dev server must have no errors.
- All redirects must use valid Next.js `has`-based format (not raw query strings in `source`).

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/components/jobs-hub/tabs.config.ts` | Add `path` field to `TabConfig` and each entry |
| Modify | `src/components/jobs-hub/JobsHubNav.tsx` | Replace `active`/`onChange` with `usePathname` + `<Link>` |
| Create | `app/job-tracker/layout.tsx` | Shared shell: `Navbar` + `JobsHubNav` + `<main>` wrapper |
| Modify | `app/job-tracker/page.tsx` | Strip all tab logic; render tracker content only |
| Create | `app/job-tracker/find-jobs/page.tsx` | Find Jobs — `<JobBoard />` |
| Create | `app/job-tracker/hr-emails/page.tsx` | India HR Emails — `<HrEmailsTable country="india" />` |
| Create | `app/job-tracker/dubai-hr/page.tsx` | Dubai HR — `<HrEmailsTable country="dubai" />` |
| Create | `app/job-tracker/gulf-jobs/page.tsx` | Gulf Jobs coming soon — `<RegionalEmptyState tabId="gulf-jobs" />` |
| Create | `app/job-tracker/au-nz/page.tsx` | AU & NZ coming soon — `<RegionalEmptyState tabId="au-nz" />` |
| Modify | `src/components/navbar.tsx` | Update "Jobs" href from `?tab=jobs` to `/job-tracker/find-jobs` |
| Modify | `next.config.ts` | Add `redirects()` for all `?tab=` query-param URLs |

---

## Task 1: Add `path` to tab config

**Files:**
- Modify: `src/components/jobs-hub/tabs.config.ts`

**Interfaces:**
- Produces: `TabConfig.path: string` — consumed by all subsequent tasks

- [ ] **Step 1: Update `tabs.config.ts`**

Replace the entire file with:

```typescript
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
  path: string;
}

export const TABS: TabConfig[] = [
  {
    id: "jobs",
    label: "Find Jobs",
    region: "India",
    dataStatus: "live",
    description: "Fresh job listings updated every 48 hours",
    feedType: "jobs",
    path: "/job-tracker/find-jobs",
  },
  {
    id: "tracker",
    label: "Job Tracker",
    region: "Workspace",
    dataStatus: "live",
    description: "Track stages, export to Sheets, and manage every application",
    feedType: "jobs",
    path: "/job-tracker",
  },
  {
    id: "emails",
    label: "HR Emails",
    region: "India",
    dataStatus: "live",
    description: "HR recruiter contacts for direct outreach",
    feedType: "contacts",
    path: "/job-tracker/hr-emails",
  },
  {
    id: "dubai-hr",
    label: "Dubai HR",
    region: "UAE",
    dataStatus: "live",
    description: "UAE-based HR recruiters and hiring contacts",
    feedType: "contacts",
    path: "/job-tracker/dubai-hr",
  },
  {
    id: "gulf-jobs",
    label: "Gulf Jobs",
    region: "GCC",
    dataStatus: "empty",
    description: "Job listings across Saudi Arabia, UAE, Qatar, and Kuwait",
    feedType: "jobs",
    path: "/job-tracker/gulf-jobs",
  },
  {
    id: "au-nz",
    label: "AU & NZ",
    region: "AU/NZ",
    dataStatus: "empty",
    description: "Tech and professional roles across Australia and New Zealand",
    feedType: "jobs",
    path: "/job-tracker/au-nz",
  },
];
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `resumeassist/`:
```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors relating to `tabs.config.ts`. (Other pre-existing errors are OK at this stage.)

---

## Task 2: Convert `JobsHubNav` to link-based routing

**Files:**
- Modify: `src/components/jobs-hub/JobsHubNav.tsx`

**Interfaces:**
- Consumes: `TABS[n].path: string` from Task 1
- Produces: `JobsHubNav()` — no props; active state from `usePathname()`

- [ ] **Step 1: Replace `JobsHubNav.tsx`**

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
      className="sticky top-16 z-[100] bg-hub-surface border-b border-hub-border"
      style={{ fontFamily: 'var(--font-hub)' }}
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
                  'focus-visible:ring-2 focus-visible:ring-hub-accent/30 focus-visible:rounded-t-[4px]',
                  isActive
                    ? 'text-hub-text-1 font-semibold'
                    : 'text-hub-text-3 font-medium hover:text-hub-text-2',
                ].join(' ')}
              >
                <span>{tab.label}</span>

                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key="dot"
                      className="w-[5px] h-[5px] rounded-full bg-hub-accent flex-shrink-0"
                      initial={reduced ? { opacity: 0 } : TAB_DOT.initial}
                      animate={reduced ? { opacity: 1 } : TAB_DOT.animate}
                      exit={reduced ? { opacity: 0 } : { scale: 0.3, opacity: 0 }}
                      transition={TAB_DOT.transition}
                    />
                  )}
                </AnimatePresence>

                {tab.dataStatus === 'empty' && (
                  <span className="text-[9px] font-semibold text-hub-text-3 bg-hub-bg-subtle border border-hub-border px-[5px] py-px rounded-[3px] leading-none">
                    soon
                  </span>
                )}

                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-x-0 bottom-0 h-[2px] rounded-t-[2px] bg-hub-accent"
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

Key changes from the old version:
- Props removed: `active`, `onChange`, `listRef`, `focusTab`, `handleKeyDown`
- `<button>` → `<Link href={tab.path}>`
- `tab.id === active` → `pathname === tab.path`
- `aria-selected` / `role="tab"` → `aria-current="page"`
- `role="tablist"` on the wrapper → removed (no longer a tab widget)

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -i "jobshub\|tabsnav\|tabs.config" | head -20
```
Expected: no errors.

---

## Task 3: Create shared layout

**Files:**
- Create: `app/job-tracker/layout.tsx`

**Interfaces:**
- Consumes: `JobsHubNav()` (no props) from Task 2, `Navbar` (existing, unchanged)
- Produces: layout shell wrapping all `/job-tracker/*` children

- [ ] **Step 1: Create `app/job-tracker/layout.tsx`**

```tsx
import { Navbar } from "@/components/navbar"
import { JobsHubNav } from "@/components/jobs-hub/JobsHubNav"

export default function JobTrackerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen bg-hub-bg pt-16"
      style={{ fontFamily: "var(--font-hub)" }}
    >
      <Navbar tone="light" />
      <JobsHubNav />
      <main className="max-w-[940px] mx-auto px-5 pt-7 pb-20">
        {children}
      </main>
    </div>
  )
}
```

Note: This is a server component — no `"use client"` needed. `Navbar` and `JobsHubNav` are themselves client components and declare their own `"use client"` boundaries.

---

## Task 4: Simplify `/job-tracker` page to tracker-only

**Files:**
- Modify: `app/job-tracker/page.tsx`

**Interfaces:**
- Consumes: `SidebarDemo` (existing, unchanged), `TabHeader`, `TABS` from Task 1
- The layout (Task 3) now owns `Navbar` + `JobsHubNav`; this page owns only the tracker content

- [ ] **Step 1: Replace `app/job-tracker/page.tsx`**

```tsx
"use client"

import { motion } from "framer-motion"
import { TabHeader } from "@/components/jobs-hub/TabHeader"
import SidebarDemo from "@/components/sidebar-demo"
import { TABS } from "@/components/jobs-hub/tabs.config"
import { TAB_PANEL } from "@/lib/motion"

const config = TABS.find((t) => t.id === "tracker")!

export default function JobTrackerPage() {
  return (
    <motion.div {...TAB_PANEL}>
      <TabHeader config={config} />
      <SidebarDemo />
    </motion.div>
  )
}
```

Removed from old file:
- `Suspense` (no longer uses `useSearchParams`)
- `useSearchParams`, `useState`, `AnimatePresence`, tab state machine
- `Navbar` and `JobsHubNav` (now in layout)
- All conditional tab render blocks except tracker

---

## Task 5: Create the five new route pages

**Files:**
- Create: `app/job-tracker/find-jobs/page.tsx`
- Create: `app/job-tracker/hr-emails/page.tsx`
- Create: `app/job-tracker/dubai-hr/page.tsx`
- Create: `app/job-tracker/gulf-jobs/page.tsx`
- Create: `app/job-tracker/au-nz/page.tsx`

**Interfaces:**
- Consumes: `TABS` (Task 1), `TabHeader`, `LiveReadyBadge`, `JobBoard`, `HrEmailsTable`, `RegionalEmptyState` (all existing, unchanged)

- [ ] **Step 1: Create `app/job-tracker/find-jobs/page.tsx`**

```tsx
"use client"

import { motion } from "framer-motion"
import { TabHeader } from "@/components/jobs-hub/TabHeader"
import { LiveReadyBadge } from "@/components/jobs-hub/LiveReadyBadge"
import JobBoard from "@/components/job-board"
import { TABS } from "@/components/jobs-hub/tabs.config"
import { TAB_PANEL } from "@/lib/motion"

const config = TABS.find((t) => t.id === "jobs")!

export default function FindJobsPage() {
  return (
    <motion.div {...TAB_PANEL}>
      <TabHeader config={config} badge={<LiveReadyBadge text="Live" />} />
      <JobBoard />
    </motion.div>
  )
}
```

- [ ] **Step 2: Create `app/job-tracker/hr-emails/page.tsx`**

```tsx
"use client"

import { motion } from "framer-motion"
import { TabHeader } from "@/components/jobs-hub/TabHeader"
import { LiveReadyBadge } from "@/components/jobs-hub/LiveReadyBadge"
import HrEmailsTable from "@/components/hr-emails-table"
import { TABS } from "@/components/jobs-hub/tabs.config"
import { TAB_PANEL } from "@/lib/motion"

const TABLE_CLASS = "border border-hub-border bg-hub-surface rounded-[14px]"
const config = TABS.find((t) => t.id === "emails")!

export default function HrEmailsPage() {
  return (
    <motion.div {...TAB_PANEL}>
      <TabHeader config={config} badge={<LiveReadyBadge text="Live" />} />
      <HrEmailsTable
        className={TABLE_CLASS}
        tableClassName="max-h-[520px]"
        country="india"
      />
    </motion.div>
  )
}
```

- [ ] **Step 3: Create `app/job-tracker/dubai-hr/page.tsx`**

```tsx
"use client"

import { motion } from "framer-motion"
import { TabHeader } from "@/components/jobs-hub/TabHeader"
import { LiveReadyBadge } from "@/components/jobs-hub/LiveReadyBadge"
import HrEmailsTable from "@/components/hr-emails-table"
import { TABS } from "@/components/jobs-hub/tabs.config"
import { TAB_PANEL } from "@/lib/motion"

const TABLE_CLASS = "border border-hub-border bg-hub-surface rounded-[14px]"
const config = TABS.find((t) => t.id === "dubai-hr")!

export default function DubaiHrPage() {
  return (
    <motion.div {...TAB_PANEL}>
      <TabHeader config={config} badge={<LiveReadyBadge text="Live" />} />
      <HrEmailsTable
        className={TABLE_CLASS}
        tableClassName="max-h-[520px]"
        country="dubai"
      />
    </motion.div>
  )
}
```

- [ ] **Step 4: Create `app/job-tracker/gulf-jobs/page.tsx`**

```tsx
"use client"

import { motion } from "framer-motion"
import { TabHeader } from "@/components/jobs-hub/TabHeader"
import { RegionalEmptyState } from "@/components/jobs-hub/RegionalEmptyState"
import { TABS } from "@/components/jobs-hub/tabs.config"
import { TAB_PANEL } from "@/lib/motion"

const config = TABS.find((t) => t.id === "gulf-jobs")!

export default function GulfJobsPage() {
  return (
    <motion.div {...TAB_PANEL}>
      <TabHeader config={config} />
      <RegionalEmptyState tabId="gulf-jobs" />
    </motion.div>
  )
}
```

- [ ] **Step 5: Create `app/job-tracker/au-nz/page.tsx`**

```tsx
"use client"

import { motion } from "framer-motion"
import { TabHeader } from "@/components/jobs-hub/TabHeader"
import { RegionalEmptyState } from "@/components/jobs-hub/RegionalEmptyState"
import { TABS } from "@/components/jobs-hub/tabs.config"
import { TAB_PANEL } from "@/lib/motion"

const config = TABS.find((t) => t.id === "au-nz")!

export default function AuNzPage() {
  return (
    <motion.div {...TAB_PANEL}>
      <TabHeader config={config} />
      <RegionalEmptyState tabId="au-nz" />
    </motion.div>
  )
}
```

---

## Task 6: Update navbar Jobs link

**Files:**
- Modify: `src/components/navbar.tsx`

**Interfaces:**
- Change: one href value in `navItems` array (line ~26)
- Do NOT change: any auth redirect logic, `?next=` params, login behavior

- [ ] **Step 1: Update the Jobs nav item href**

In `src/components/navbar.tsx`, find the `navItems` array and change:

```tsx
// Before
{ name: "Jobs", href: "/job-tracker?tab=jobs" },

// After
{ name: "Jobs", href: "/job-tracker/find-jobs" },
```

That is the only change in this file.

---

## Task 7: Add query-param redirects to `next.config.ts`

**Files:**
- Modify: `next.config.ts`

**Interfaces:**
- Adds `redirects()` async function alongside existing `rewrites()`
- Uses Next.js `has` array to match query params — required because Next.js `source` strings do not support inline `?param=value` matching

- [ ] **Step 1: Add `redirects()` to `next.config.ts`**

Add a `redirects()` async function inside the `nextConfig` object, immediately after the closing brace of `rewrites()`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {},

  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/.next/**',
          '**/node_modules/**',
          '**/.superpowers/**',
          '**/.claude/**',
          '**/skills-lock.json',
          '**/.agents/**',
          '**/.cursor/**',
          '**/.gemini/**',
          '**/.kiro/**',
          '**/.pi/**',
          '**/.qoder/**',
          '**/.playwright-mcp/**',
        ],
      }
    }
    return config
  },

  async redirects() {
    return [
      {
        source: '/job-tracker',
        has: [{ type: 'query', key: 'tab', value: 'jobs' }],
        destination: '/job-tracker/find-jobs',
        permanent: false,
      },
      {
        source: '/job-tracker',
        has: [{ type: 'query', key: 'tab', value: 'tracker' }],
        destination: '/job-tracker',
        permanent: false,
      },
      {
        source: '/job-tracker',
        has: [{ type: 'query', key: 'tab', value: 'emails' }],
        destination: '/job-tracker/hr-emails',
        permanent: false,
      },
      {
        source: '/job-tracker',
        has: [{ type: 'query', key: 'tab', value: 'dubai-hr' }],
        destination: '/job-tracker/dubai-hr',
        permanent: false,
      },
      {
        source: '/job-tracker',
        has: [{ type: 'query', key: 'tab', value: 'gulf-jobs' }],
        destination: '/job-tracker/gulf-jobs',
        permanent: false,
      },
      {
        source: '/job-tracker',
        has: [{ type: 'query', key: 'tab', value: 'au-nz' }],
        destination: '/job-tracker/au-nz',
        permanent: false,
      },
    ]
  },

  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: '/api/:path*',
          destination: `${(process.env.NEXT_PUBLIC_JOBFILX_APIURL || 'http://localhost:9001/api').replace(/\/api\/?$/, '')}/api/:path*`,
        },
      ],
    }
  },
}

export default nextConfig
```

Note: `has` with `type: 'query'` is the documented Next.js format for matching query parameters in redirects. The `tab=tracker` redirect is safe — it strips the query param on arrival at `/job-tracker`, so no loop occurs.

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -i "next.config" | head -10
```
Expected: no errors.

---

## Task 8: Start dev server and validate all routes

**Prerequisite:** Tasks 1–7 complete.

- [ ] **Step 1: Start dev server**

```bash
cd resumeassist
npm run dev
```

Wait for "Ready" in the terminal output.

- [ ] **Step 2: Validate each route directly**

Open each URL and verify the correct content renders:

| URL | Expected content |
|-----|-----------------|
| `http://localhost:3000/job-tracker` | Job Tracker workspace (SidebarDemo Kanban) |
| `http://localhost:3000/job-tracker/find-jobs` | Find Jobs — JobBoard |
| `http://localhost:3000/job-tracker/hr-emails` | HR Emails — India HR contacts table |
| `http://localhost:3000/job-tracker/dubai-hr` | Dubai HR — UAE HR contacts table |
| `http://localhost:3000/job-tracker/gulf-jobs` | Gulf Jobs coming soon (RegionalEmptyState) |
| `http://localhost:3000/job-tracker/au-nz` | AU & NZ coming soon (RegionalEmptyState) |

For each route, verify:
- JobsHubNav is present with correct active item highlighted (active dot + underline indicator on the correct tab)
- `TabHeader` shows correct region label and section title
- Page content matches the expected component

- [ ] **Step 3: Validate JobsHubNav active state per route**

Click through each nav item and verify:
- Clicking "Find Jobs" → URL changes to `/job-tracker/find-jobs`, active dot appears on "Find Jobs"
- Clicking "Job Tracker" → URL changes to `/job-tracker`, active dot appears on "Job Tracker"
- Clicking "HR Emails" → URL changes to `/job-tracker/hr-emails`, active on "HR Emails"
- Clicking "Dubai HR" → URL changes to `/job-tracker/dubai-hr`, active on "Dubai HR"
- Clicking "Gulf Jobs" → URL changes to `/job-tracker/gulf-jobs`, active on "Gulf Jobs"
- Clicking "AU & NZ" → URL changes to `/job-tracker/au-nz`, active on "AU & NZ"

- [ ] **Step 4: Validate browser back/forward**

Navigate: `find-jobs` → `hr-emails` → `dubai-hr`  
Press browser Back twice → should be at `find-jobs`.  
Press Forward → should be at `hr-emails`.  
Each step: URL and active nav item must match.

- [ ] **Step 5: Validate hard refresh**

Navigate to `/job-tracker/hr-emails`, then press Ctrl+R (or Cmd+R).  
Expected: page reloads on the HR Emails route, nav shows "HR Emails" as active. (Not tab=emails or any old state.)

- [ ] **Step 6: Validate query-param redirects**

Visit each old URL and confirm redirect to the new route:

| Old URL | Expected redirect destination |
|---------|------------------------------|
| `http://localhost:3000/job-tracker?tab=jobs` | `/job-tracker/find-jobs` |
| `http://localhost:3000/job-tracker?tab=tracker` | `/job-tracker` |
| `http://localhost:3000/job-tracker?tab=emails` | `/job-tracker/hr-emails` |
| `http://localhost:3000/job-tracker?tab=dubai-hr` | `/job-tracker/dubai-hr` |
| `http://localhost:3000/job-tracker?tab=gulf-jobs` | `/job-tracker/gulf-jobs` |
| `http://localhost:3000/job-tracker?tab=au-nz` | `/job-tracker/au-nz` |

Check browser address bar after each navigation to confirm the URL changed.

- [ ] **Step 7: Validate navbar Jobs link**

From any page, click "Jobs" in the top navbar.  
Expected: navigates to `/job-tracker/find-jobs` (not `/job-tracker?tab=jobs`).

- [ ] **Step 8: Confirm no referrals files changed**

```bash
git diff --name-only | grep -i referr
```
Expected: empty output (no referrals files modified).

- [ ] **Step 9: Check browser console for errors**

Open browser DevTools → Console.  
Navigate through all six routes.  
Expected: no TypeScript errors, no React hydration warnings, no missing module errors.
