# Manual Resume Editor (Post-AI-Generation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user manually edit AI-generated resume data (experience, education, projects, skills, certifications, awards/achievements) in the optimizer flow — add/edit/delete/reorder — with preview and export (DOCX/PDF) immediately reflecting the edits, without any backend persistence in v1.

**Architecture:** The manual editor (`ResumeDataEditor` + per-section forms in `src/components/edit/`) already exists and is already wired into `OptimizerPage.tsx`'s Edit/Preview tabs. This plan extends it rather than replacing it: add stable `id`s to array items at conversion time, add a real `certifications` field to `ResumeData` (currently flattened into lossy `extraSections` strings), confirm achievements already map cleanly onto the existing `awards` field (they do — just relabel for clarity), add up/down reorder buttons to every editable list, and fix `docxExport` to read the *edited* state (`portfoliolyResume`) instead of the stale AI-output state (`optimizedResume`).

**Tech Stack:** Next.js 16 (App Router), React 18, TypeScript, Tailwind, `zustand` (unrelated to this feature — resume data is local `useState`, not a store), `vitest` (node environment, `*.test.ts` only — no component/RTL test infra exists).

## Global Constraints

- **No backend persistence.** Do not add a save/update route, do not touch `jobflix-backend-js/routes/resumeassist/resume.route.js` or `models/resume.model.js`. Edits remain client-side React state, same as today.
- **No code changes are to be made yet.** This document is the plan only; wait for explicit approval before executing any task.
- **`src/types/portfolioly-resume.ts` is documented as "EXTREMELY STRICT... deviating by one character will cause site failure"** — this schema is POSTed to `/portfolio` and rendered by a separate "portfolioly" consumer. All new fields (`id`, `certifications`) MUST be optional (`?`) so existing payloads without them remain valid, and no existing field name/shape may change.
- **Do not touch `src/components/create-resume-simple.tsx`** or any of the other ~40 files that construct/consume `ResumeData` outside the optimizer flow. New fields are optional specifically so those call sites keep compiling untouched. They simply won't get certification-editing until a follow-up pass.
- **No new test framework.** `vitest.config.js` runs `environment: 'node'` and only includes `src/**/*.test.ts` (not `.tsx`) — there is no jsdom/React Testing Library in this repo. Pure-logic changes (types, `resume-converter.ts`, new utils) get real `vitest` unit tests. React component/JSX changes (form footers, sidebar nav) are **not** unit-testable here; they get a manual QA checklist instead. Do not fabricate component tests that can't actually run.
- Reuse the existing `ActionButton` / `FormSection` components and the established per-form CRUD pattern (`add`/`remove`/`update` closures, `items.map((it, idx) => ...)`) — every one of the 6 target forms already follows this exact pattern; stay consistent with it rather than introducing a new pattern.
- Achievements and Awards are **intentionally merged** into one `ResumeData.awards` field already (`resume-converter.ts:156, 277-295`) and this is locked by an existing passing test (`portfolio-pipeline.test.ts:233-236`). Do not split them into separate fields in v1.

---

## File Map

| File | Action | Reason |
|---|---|---|
| `src/utils/id.ts` | Create | Stable ID generator (`crypto.randomUUID()`), no new dependency |
| `src/utils/arrayReorder.ts` | Create | Generic `moveItem` up/down helper, shared by all 6 forms |
| `src/types/portfolioly-resume.ts` | Modify | Add optional `id?` to every item interface; add `ResumeCertification` + `certifications?`; extend `SectionType` |
| `src/utils/resume-converter.ts` | Modify | Assign ids in `convertToPortfoliolyFormat`; populate structured `certifications` (both v1 & v2 branches) instead of `extraSections`; add new `convertPortfoliolyToResumeJSON` reverse-converter |
| `src/components/edit/ActionButton.tsx` | Modify | Add `moveUp` / `moveDown` action types (icons only, reuses existing button) |
| `src/components/edit/WorkExperienceForm.tsx` | Modify | id-on-add, `key={id}`, reorder buttons |
| `src/components/edit/EducationForm.tsx` | Modify | Same |
| `src/components/edit/ProjectsForm.tsx` | Modify | Same |
| `src/components/edit/SkillsForm.tsx` | Modify | Same (reorders skill *groups*, not individual tags) |
| `src/components/edit/AwardsForm.tsx` | Modify | Same + relabel "Awards" → "Awards & Achievements" |
| `src/components/edit/CertificationsForm.tsx` | Modify | Switch type import to `portfolioly-resume`, id-on-add, reorder buttons, wire in |
| `src/components/edit/sectionConfig.ts` | Modify | Register `certifications` section |
| `src/components/edit/NavigationSidebar.tsx` | Modify | Add "Certifications" nav item + `hasData` case; relabel Awards |
| `src/components/edit/ResumeDataEditor.tsx` | Modify | Register `CertificationsForm` in `formComponents` |
| `src/components/optimizer/OptimizerPage.tsx` | Modify | `handleDownloadDocx` uses edited `portfoliolyResume` via new converter; PDF filename sync |
| `src/__tests__/portfolio-pipeline.test.ts` | Modify | Update certifications assertions (extraSections → structured field); add id + achievements-section regression tests |
| `src/__tests__/docx-export-roundtrip.test.ts` | Create | Unit tests for `convertPortfoliolyToResumeJSON` |

---

### Task 1: Stable IDs at conversion time

**Files:**
- Create: `src/utils/id.ts`
- Modify: `src/types/portfolioly-resume.ts`
- Modify: `src/utils/resume-converter.ts`
- Modify: `src/components/edit/WorkExperienceForm.tsx`
- Modify: `src/components/edit/EducationForm.tsx`
- Modify: `src/components/edit/ProjectsForm.tsx`
- Modify: `src/components/edit/SkillsForm.tsx`
- Modify: `src/components/edit/AwardsForm.tsx`
- Test: `src/__tests__/portfolio-pipeline.test.ts`

**Interfaces:**
- Produces: `generateId(): string` from `src/utils/id.ts`, used by every later task that creates a new array item.
- Produces: `id?: string` field on `ResumeWork`, `ResumeEducation`, `ResumeSkill`, `ResumeProject`, `ResumeAward`, `ResumeVolunteer` (in `src/types/portfolioly-resume.ts`).

- [ ] **Step 1: Write the failing test**

Add to `src/__tests__/portfolio-pipeline.test.ts`, inside the existing `describe('parserToV2 → convertToPortfoliolyFormat (full pipeline)', ...)` block (reuses the `portfolio` const already computed at the top of that block):

```ts
  it('assigns a unique id to every work, education, project, skill and award item', () => {
    const allIds = [
      ...portfolio.work.map(w => w.id),
      ...portfolio.education.map(e => e.id),
      ...portfolio.projects.map(p => p.id),
      ...portfolio.skills.map(s => s.id),
      ...portfolio.awards.map(a => a.id),
    ];
    expect(allIds.every(id => typeof id === 'string' && id.length > 0)).toBe(true);
    expect(new Set(allIds).size).toBe(allIds.length); // all unique
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/portfolio-pipeline.test.ts`
Expected: FAIL — `portfolio.work[0].id` etc. are `undefined` (property doesn't exist on the type yet, or is `undefined` at runtime).

- [ ] **Step 3: Create the id utility**

`src/utils/id.ts` (new file):

```ts
export function generateId(): string {
  return crypto.randomUUID();
}
```

- [ ] **Step 4: Add optional `id` to every portfolioly item interface**

In `src/types/portfolioly-resume.ts`, modify each interface (add the `id?: string;` line shown, keep every other field as-is):

```ts
export interface ResumeWork {
  id?: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export interface ResumeSkill {
  id?: string;
  name: string;
  keywords: string[];
}

export interface ResumeProject {
  id?: string;
  name: string;
  description: string;
  entity: string;
  type: string;
  liveUrl?: string;
  sourceUrl?: string;
  highlights?: string[];
  keywords?: string[];
  startDate?: string;
  endDate?: string;
  role?: string;
}

export interface ResumeEducation {
  id?: string;
  institution: string;
  area: string;
  studyType: string;
  score: string;
  highlights?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface ResumeAward {
  id?: string;
  title: string;
  date: string;
  awarder: string;
  summary: string;
}

export interface ResumeVolunteer {
  id?: string;
  organization: string;
  position: string;
  url: string;
  startDate: string;
  endDate: string;
  summary: string;
  highlights: string[];
}
```

- [ ] **Step 5: Assign ids in `convertToPortfoliolyFormat`**

In `src/utils/resume-converter.ts`, add the import at the top:

```ts
import { generateId } from "./id";
```

Then add `id: generateId(),` to every object literal produced inside `convertToPortfoliolyFormat` — both the V2 branch and the V1 branch. Concretely:

V2 branch (`if ('sections' in resume)` block):
- `work = items.filter(...).map(item => ({ id: generateId(), company: ... }))`
- `education = items.filter(...).map(item => { ...; return { id: generateId(), institution: ... }; })`
- `skills = Object.entries(grouped).map(([name, keywords]) => ({ id: generateId(), name, keywords }))`
- `projects = items.filter(...).map(item => ({ id: generateId(), name: ... }))`
- the `awards` map's two inner branches (`item.type === 'list'` and `item.type === 'timeline'`) each get `id: generateId(),` added to their returned object
- `volunteer = items.filter(...).map(item => ({ id: generateId(), organization: ... }))`

V1 branch (`else` block):
- `work = (resume.experience || []).map(exp => ({ id: generateId(), company: ... }))`
- `education = (resume.education || []).map(edu => { ...; return { id: generateId(), institution: ... }; })`
- `skills = (resume.skills || []).map(s => ({ id: generateId(), name: ..., keywords: ... }))`
- `projects = (resume.projects || []).map(p => { ...; return { id: generateId(), name: ... }; })`
- the `awards` map's two inner branches (`typeof item === "string"` and `item && typeof item === "object"`) each get `id: generateId(),` added
- `volunteer = rawVolunteer.filter(...).map(v => ({ id: generateId(), organization: ... }))`

Every existing field in every one of these object literals stays exactly as it is today — this step only adds one new `id: generateId(),` key to each.

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/__tests__/portfolio-pipeline.test.ts`
Expected: PASS

- [ ] **Step 7: Wire id-on-add and stable keys into the 6 forms**

For each of `WorkExperienceForm.tsx`, `EducationForm.tsx`, `ProjectsForm.tsx`, `SkillsForm.tsx`, `AwardsForm.tsx`, make two changes (shown for `WorkExperienceForm.tsx`; the same shape of edit applies to the other four, substituting their own `empty*` constant and map variable name):

```tsx
import { generateId } from "@/utils/id";
// ...
const add = () => onChange([...items, { ...emptyWork, id: generateId() }]);
// ...
{items.map((exp, idx) => (
  <div key={exp.id ?? idx} className="grid gap-4 p-4 rounded-md border">
```

(`?? idx` is a deliberate fallback for `ResumeData` that arrives from a flow other than the optimizer's `convertToPortfoliolyFormat` — see Risks.)

- [ ] **Step 8: Manual QA**

Run: `npm run dev` (starts on port 3002 per `package.json`), open the optimizer, upload a resume, optimize, switch to the Edit tab, add a new work experience entry, confirm no console errors and the new row renders. This confirms `id` generation doesn't break existing add/edit/remove behavior — reorder itself is verified in Task 4.

- [ ] **Step 9: Commit**

```bash
git add src/utils/id.ts src/types/portfolioly-resume.ts src/utils/resume-converter.ts src/components/edit/WorkExperienceForm.tsx src/components/edit/EducationForm.tsx src/components/edit/ProjectsForm.tsx src/components/edit/SkillsForm.tsx src/components/edit/AwardsForm.tsx src/__tests__/portfolio-pipeline.test.ts
git commit -m "feat(optimizer): assign stable ids to resume array items at conversion time"
```

---

### Task 2: Certifications support

**Files:**
- Modify: `src/types/portfolioly-resume.ts`
- Modify: `src/utils/resume-converter.ts`
- Modify: `src/components/edit/sectionConfig.ts`
- Modify: `src/components/edit/NavigationSidebar.tsx`
- Modify: `src/components/edit/ResumeDataEditor.tsx`
- Modify: `src/components/edit/CertificationsForm.tsx`
- Test: `src/__tests__/portfolio-pipeline.test.ts`

**Interfaces:**
- Consumes: `generateId()` from Task 1.
- Produces: `ResumeData.certifications?: ResumeCertification[]` — consumed by Task 4 (reorder) and Task 5 (docx reverse-converter).

- [ ] **Step 1: Write the failing test**

In `src/__tests__/portfolio-pipeline.test.ts`, **replace** the existing test (lines ~247-251):

```ts
  it('certifications appear in extraSections', () => {
    const certSection = portfolio.extraSections?.find(s => s.title === 'Certifications');
    expect(certSection).toBeDefined();
    expect(certSection!.items.length).toBeGreaterThan(0);
  });
```

with:

```ts
  it('certifications are captured as structured data, not flattened into extraSections', () => {
    expect(portfolio.certifications).toHaveLength(1);
    expect(portfolio.certifications![0]).toMatchObject({
      name: 'SAP Certified Associate',
      issuer: 'SAP',
      date: '2022',
    });
    expect(typeof portfolio.certifications![0].id).toBe('string');
    const certSection = portfolio.extraSections?.find(s => s.title === 'Certifications');
    expect(certSection).toBeUndefined();
  });
```

This is an intentional behavior change (structured field replaces lossy string flattening) — not a regression. Note it as such in the commit message.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/portfolio-pipeline.test.ts`
Expected: FAIL — `portfolio.certifications` is `undefined`.

- [ ] **Step 3: Add `ResumeCertification` type and `certifications` field**

In `src/types/portfolioly-resume.ts`, add after `ResumeAward`:

```ts
export interface ResumeCertification {
  id?: string;
  name: string;
  issuer?: string;
  date?: string;
}
```

Update `SectionType` and `ResumeData`:

```ts
export type SectionType =
  | "basics"
  | "work"
  | "skills"
  | "projects"
  | "education"
  | "awards"
  | "volunteer"
  | "certifications";

export interface ResumeData {
  basics: ResumeBasics;
  work: ResumeWork[];
  skills: ResumeSkill[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  awards: ResumeAward[];
  volunteer: ResumeVolunteer[];
  coursework?: string[];
  certifications?: ResumeCertification[];
  extraSections?: Array<{ title: string; items: string[] }>;
}
```

- [ ] **Step 4: Populate `certifications` structurally in the converter**

In `src/utils/resume-converter.ts`, add the import:

```ts
import type { ResumeData, ResumeWork, ResumeEducation, ResumeSkill, ResumeProject, ResumeAward, ResumeVolunteer, ResumeCertification } from "@/types/portfolioly-resume";
```

Add a `certifications: ResumeCertification[] = [];` declaration alongside the other `let` declarations near the top of the function.

Replace the V2 branch's certifications handling (currently pushes into `extraSections`):

```ts
      } else if (id === 'certifications') {
        certifications = items
          .filter((item): item is CertificationItem => item.type === 'certification')
          .map(item => ({
            id: generateId(),
            name: item.name || "",
            issuer: item.issuer,
            date: item.date,
          }));
```

(This requires `CertificationItem` in the existing `import type { ResumeJSON, ResumeJSONv2, TimelineItem, ProjectItem, EducationItem, ListItem }` line at the top of the file — add `CertificationItem` to that list.)

Replace the V1 branch's certifications handling (currently pushes into `extraSections`):

```ts
    const rawCertifications = Array.isArray(dynamicResume.certifications) ? dynamicResume.certifications : [];
    certifications = rawCertifications
      .map((c: any): ResumeCertification | null => {
        if (typeof c === "string") {
          const name = c.trim();
          return name ? { id: generateId(), name } : null;
        }
        const name = (c.name || "").toString().trim();
        return name ? {
          id: generateId(),
          name,
          issuer: (c.issuer || "").toString() || undefined,
          date: (c.date || "").toString() || undefined,
        } : null;
      })
      .filter((c: ResumeCertification | null): c is ResumeCertification => c !== null);
```

Finally, add `certifications: certifications.length > 0 ? certifications : undefined,` to the function's return object, next to `coursework`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/__tests__/portfolio-pipeline.test.ts`
Expected: PASS

- [ ] **Step 6: Register the section**

`src/components/edit/sectionConfig.ts` — add after the `awards` entry:

```ts
  {
    id: "certifications",
    getValue: (d) => d.certifications ?? [],
    applyChange: (d, v) => ({ ...d, certifications: v }),
  },
```

`src/components/edit/NavigationSidebar.tsx` — add `BadgeCheck` to the lucide-react import, add a nav item, and add a `hasData` case:

```ts
import {
  User,
  Camera,
  Globe,
  Briefcase,
  Wrench,
  FolderKanban,
  GraduationCap,
  Award,
  BadgeCheck,
} from "lucide-react";
```

```ts
export const navItems: SectionNavItem[] = [
  { id: "basics", label: "Personal Info", icon: User },
  { id: "photo", label: "Profile Photo", icon: Camera },
  { id: "profiles", label: "Social Links", icon: Globe },
  { id: "work", label: "Work Experience", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "certifications", label: "Certifications", icon: BadgeCheck },
  { id: "awards", label: "Awards & Achievements", icon: Award },
];
```

```ts
    case "certifications":
      return (data.certifications?.length ?? 0) > 0;
```
(add this `case` inside `hasData`, alongside the existing `case "awards":`)

`src/components/edit/ResumeDataEditor.tsx` — import and register:

```ts
import { CertificationsForm } from "./CertificationsForm";
```

```ts
const formComponents: Record<string, React.ComponentType<{ value: any; onChange: (v: any) => void }>> = {
  basics: PersonalInfoForm,
  profiles: ProfilesForm,
  work: WorkExperienceForm,
  skills: SkillsForm,
  projects: ProjectsForm,
  education: EducationForm,
  certifications: CertificationsForm,
  awards: AwardsForm,
};
```

- [ ] **Step 7: Repoint `CertificationsForm` at the portfolioly type and add id-on-add**

In `src/components/edit/CertificationsForm.tsx`, change:

```tsx
import type { ResumeCertification } from "@/types/resume";
```

to:

```tsx
import type { ResumeCertification } from "@/types/portfolioly-resume";
import { generateId } from "@/utils/id";
```

Change the `add` handler and the map's `key`:

```tsx
  const add = () => onChange([...(items || []), { ...emptyCert, id: generateId() }]);
  // ...
  {items.map((c, idx) => (
    <div key={c.id ?? idx} className="grid gap-4 p-4 rounded-md border">
```

- [ ] **Step 8: Manual QA**

Run `npm run dev`, go through Upload → Optimize → Edit tab, confirm "Certifications" appears in the sidebar between Education and Awards, add/edit/delete a certification, switch to Preview and confirm it renders (note: whichever template component is active must already read `data.certifications` — if a template doesn't render it yet, that's expected; template rendering is not in this plan's scope, only data + editing).

- [ ] **Step 9: Commit**

```bash
git add src/types/portfolioly-resume.ts src/utils/resume-converter.ts src/components/edit/sectionConfig.ts src/components/edit/NavigationSidebar.tsx src/components/edit/ResumeDataEditor.tsx src/components/edit/CertificationsForm.tsx src/__tests__/portfolio-pipeline.test.ts
git commit -m "feat(optimizer): add structured certifications editing instead of extraSections flattening"
```

---

### Task 3: Achievements support (verify + relabel, no schema change)

**Files:**
- Modify: `src/components/edit/AwardsForm.tsx`
- Test: `src/__tests__/portfolio-pipeline.test.ts`

**Rationale:** `ResumeData` has no separate `achievements` field, and it doesn't need one — `convertToPortfoliolyFormat` already merges v1 `achievements[]` (resume-converter.ts:277-295) and v2 `achievements` sections (resume-converter.ts:156) into `ResumeData.awards`, and this is already locked by a passing test (`portfolio-pipeline.test.ts:233-236`, `awards (achievements) are captured`). "Map cleanly to awards" (the option the spec offered) is already the shipped design. This task only (a) adds one more regression test proving the *v2-native* achievements-section path doesn't lose data (today's test only exercises it via v1→v2 migration), and (b) relabels the UI so "Achievements" isn't invisible to users looking for it.

**Interfaces:**
- Consumes: existing `ResumeAward` / `resume-converter.ts` merge logic (Task 1's `id` addition already applies to it).

- [ ] **Step 1: Write the regression test**

Add to `src/__tests__/portfolio-pipeline.test.ts`:

```ts
describe('convertToPortfoliolyFormat — native v2 achievements section merges into awards without loss', () => {
  const v2Resume = {
    version: 2 as const,
    basics: { name: 'Test User' },
    sections: {
      achievements: {
        id: 'achievements',
        label: 'Achievements',
        layout: 'list' as const,
        order: 60,
        visible: true,
        items: [
          { type: 'list' as const, value: 'Winner, National Hackathon 2024' },
          { type: 'list' as const, value: 'Published 2 IEEE papers' },
        ],
      },
    },
  };

  it('both achievement entries appear in portfolio.awards with no data loss', () => {
    const portfolio = convertToPortfoliolyFormat(v2Resume);
    expect(portfolio.awards).toHaveLength(2);
    expect(portfolio.awards.map(a => a.title)).toEqual([
      'Winner, National Hackathon 2024',
      'Published 2 IEEE papers',
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails or passes**

Run: `npx vitest run src/__tests__/portfolio-pipeline.test.ts`
Expected: PASS already (this locks down existing, correct behavior — no production code change is required for this step). If it fails, that reveals a real pre-existing bug in the `id === 'achievements'` branch; stop and report rather than proceeding, since fixing an undiscovered bug is outside this plan's scope.

- [ ] **Step 3: Relabel the UI**

In `src/components/edit/AwardsForm.tsx`, change:

```tsx
    <FormSection
      title="Awards"
      actions={<ActionButton action="add" label="Add award" onClick={add} />}
    >
```

to:

```tsx
    <FormSection
      title="Awards & Achievements"
      actions={<ActionButton action="add" label="Add award or achievement" onClick={add} />}
    >
```

(The `NavigationSidebar.tsx` label was already updated to "Awards & Achievements" in Task 2, Step 6.)

- [ ] **Step 4: Commit**

```bash
git add src/components/edit/AwardsForm.tsx src/__tests__/portfolio-pipeline.test.ts
git commit -m "test(optimizer): lock down v2 achievements→awards merge; relabel Awards section"
```

---

### Task 4: Reorder controls (up/down, no drag-and-drop)

**Files:**
- Create: `src/utils/arrayReorder.ts`
- Modify: `src/components/edit/ActionButton.tsx`
- Modify: `src/components/edit/WorkExperienceForm.tsx`
- Modify: `src/components/edit/EducationForm.tsx`
- Modify: `src/components/edit/ProjectsForm.tsx`
- Modify: `src/components/edit/SkillsForm.tsx`
- Modify: `src/components/edit/AwardsForm.tsx`
- Modify: `src/components/edit/CertificationsForm.tsx`
- Test: `src/__tests__/array-reorder.test.ts`

**Interfaces:**
- Consumes: `id?` fields and `key={item.id ?? idx}` pattern from Task 1/2.
- Produces: `moveItem<T>(items: T[], index: number, direction: "up" | "down"): T[]` — pure function, used identically by all 6 forms.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/array-reorder.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { moveItem } from '@/utils/arrayReorder';

describe('moveItem', () => {
  it('swaps an item with its predecessor when moving up', () => {
    expect(moveItem(['a', 'b', 'c'], 1, 'up')).toEqual(['b', 'a', 'c']);
  });

  it('swaps an item with its successor when moving down', () => {
    expect(moveItem(['a', 'b', 'c'], 1, 'down')).toEqual(['a', 'c', 'b']);
  });

  it('is a no-op when moving the first item up', () => {
    const items = ['a', 'b', 'c'];
    expect(moveItem(items, 0, 'up')).toEqual(items);
  });

  it('is a no-op when moving the last item down', () => {
    const items = ['a', 'b', 'c'];
    expect(moveItem(items, 2, 'down')).toEqual(items);
  });

  it('does not mutate the input array', () => {
    const items = ['a', 'b', 'c'];
    moveItem(items, 0, 'down');
    expect(items).toEqual(['a', 'b', 'c']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/array-reorder.test.ts`
Expected: FAIL — `@/utils/arrayReorder` doesn't exist.

- [ ] **Step 3: Implement `moveItem`**

`src/utils/arrayReorder.ts` (new file):

```ts
export function moveItem<T>(items: T[], index: number, direction: "up" | "down"): T[] {
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const next = [...items];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/array-reorder.test.ts`
Expected: PASS

- [ ] **Step 5: Add `moveUp`/`moveDown` to `ActionButton`**

In `src/components/edit/ActionButton.tsx`:

```tsx
import { Plus, Trash2, Pencil, Upload, Save, Loader2, ArrowUp, ArrowDown } from "lucide-react";
```

```tsx
type ActionType = "add" | "remove" | "edit" | "upload" | "save" | "moveUp" | "moveDown";
```

```tsx
const actionConfig: Record<
  ActionType,
  {
    icon: typeof Plus;
    defaultVariant: VariantProps<typeof buttonVariants>["variant"];
  }
> = {
  add: { icon: Plus, defaultVariant: "secondary" },
  remove: { icon: Trash2, defaultVariant: "destructive" },
  edit: { icon: Pencil, defaultVariant: "outline" },
  upload: { icon: Upload, defaultVariant: "outline" },
  save: { icon: Save, defaultVariant: "default" },
  moveUp: { icon: ArrowUp, defaultVariant: "outline" },
  moveDown: { icon: ArrowDown, defaultVariant: "outline" },
};
```

- [ ] **Step 6: Add reorder buttons to all 6 forms**

For each of `WorkExperienceForm.tsx`, `EducationForm.tsx`, `ProjectsForm.tsx`, `SkillsForm.tsx`, `AwardsForm.tsx`, `CertificationsForm.tsx`, add the import and replace the footer (shown for `WorkExperienceForm.tsx`; identical shape for the other five, substituting their own `remove`/`items` names):

```tsx
import { moveItem } from "@/utils/arrayReorder";
```

```tsx
            <div className="flex justify-between items-center">
              <div className="flex gap-1">
                <ActionButton
                  action="moveUp"
                  label="Move up"
                  onClick={() => onChange(moveItem(items, idx, "up"))}
                  disabled={idx === 0}
                />
                <ActionButton
                  action="moveDown"
                  label="Move down"
                  onClick={() => onChange(moveItem(items, idx, "down"))}
                  disabled={idx === items.length - 1}
                />
              </div>
              <ActionButton
                action="remove"
                label="Remove"
                onClick={() => remove(idx)}
              />
            </div>
```

(replacing the existing `<div className="flex justify-end">...<ActionButton action="remove" .../></div>` footer in each file.)

- [ ] **Step 7: Manual QA**

Run `npm run dev`, in the Edit tab add 3 work experience entries with distinct company names, use the up/down buttons to reorder them, confirm: (a) order changes correctly, (b) the first item's "up" button is disabled, (c) the last item's "down" button is disabled, (d) switching to the Preview tab shows the new order. Repeat spot-check on Education and Certifications (the two most recently touched forms).

- [ ] **Step 8: Commit**

```bash
git add src/utils/arrayReorder.ts src/__tests__/array-reorder.test.ts src/components/edit/ActionButton.tsx src/components/edit/WorkExperienceForm.tsx src/components/edit/EducationForm.tsx src/components/edit/ProjectsForm.tsx src/components/edit/SkillsForm.tsx src/components/edit/AwardsForm.tsx src/components/edit/CertificationsForm.tsx
git commit -m "feat(optimizer): add up/down reorder controls to all editable resume sections"
```

---

### Task 5: Fix DOCX export to reflect manual edits

**Files:**
- Modify: `src/utils/resume-converter.ts`
- Modify: `src/components/optimizer/OptimizerPage.tsx`
- Test: `src/__tests__/docx-export-roundtrip.test.ts` (create)

**Context:** `OptimizerPage.tsx:327` currently calls `exportResumeDocx(optimizedResume, ...)` — `optimizedResume` is the raw AI output (`ResumeJSON`, v1) and is **never updated** when the user edits via `ResumeDataEditor` (which only mutates `portfoliolyResume`). The backend's `generateResumeDocxBuffer` (`jobflix-backend-js/services/docxGenerator.js:34-153`) reads `resume.experience[].role/company/dates/bullets`, `resume.education[].degree/school/dates/location`, `resume.certifications[].name/issuer/date`, etc. — the v1 shape. No backend change is needed; we need a frontend adapter that converts the edited `ResumeData` back into that v1 shape before export.

**Interfaces:**
- Consumes: `ResumeData` (with `certifications` from Task 2).
- Produces: `convertPortfoliolyToResumeJSON(data: ResumeData): ResumeJSON` in `src/utils/resume-converter.ts`.

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/docx-export-roundtrip.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { convertPortfoliolyToResumeJSON } from '@/utils/resume-converter';
import type { ResumeData } from '@/types/portfolioly-resume';

const SAMPLE: ResumeData = {
  basics: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '555-1234',
    headline: 'Software Engineer',
    summary: 'Builds things.',
    location: 'Remote',
    profiles: [{ network: 'GitHub', username: '', url: 'https://github.com/janedoe' }],
  },
  work: [
    { id: '1', company: 'Acme', position: 'Engineer', startDate: 'Jan 2022', endDate: 'Present', highlights: ['Shipped X'] },
  ],
  skills: [{ id: '2', name: 'Languages', keywords: ['TypeScript', 'Go'] }],
  projects: [
    { id: '3', name: 'Widget', description: 'A widget', entity: 'Personal', type: 'Project', highlights: ['Built it'], liveUrl: 'https://widget.example.com', sourceUrl: 'https://github.com/janedoe/widget' },
  ],
  education: [
    { id: '4', institution: 'State University', area: 'CS', studyType: 'Degree', score: '3.9', startDate: '2018', endDate: '2022', location: 'Somewhere', highlights: ["Dean's List"] },
  ],
  awards: [],
  volunteer: [],
  certifications: [{ id: '5', name: 'AWS Certified', issuer: 'Amazon', date: '2023' }],
};

describe('convertPortfoliolyToResumeJSON', () => {
  const result = convertPortfoliolyToResumeJSON(SAMPLE);

  it('maps basics correctly, including headline -> title', () => {
    expect(result.basics.name).toBe('Jane Doe');
    expect(result.basics.title).toBe('Software Engineer');
    expect(result.basics.links).toContain('https://github.com/janedoe');
  });

  it('maps work -> experience with role/company/bullets', () => {
    expect(result.experience).toHaveLength(1);
    expect(result.experience[0]).toMatchObject({
      company: 'Acme',
      role: 'Engineer',
      bullets: ['Shipped X'],
    });
    expect(result.experience[0].dates).toContain('Jan 2022');
  });

  it('maps education -> school/degree/details', () => {
    expect(result.education?.[0]).toMatchObject({
      school: 'State University',
      degree: 'CS',
      details: ["Dean's List"],
    });
  });

  it('maps certifications through unchanged', () => {
    expect(result.certifications).toEqual([
      { name: 'AWS Certified', issuer: 'Amazon', date: '2023' },
    ]);
  });

  it('maps projects -> link/github', () => {
    expect(result.projects?.[0]).toMatchObject({
      name: 'Widget',
      link: 'https://widget.example.com',
      github: 'https://github.com/janedoe/widget',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/docx-export-roundtrip.test.ts`
Expected: FAIL — `convertPortfoliolyToResumeJSON` is not exported.

- [ ] **Step 3: Implement the reverse converter**

Append to `src/utils/resume-converter.ts`:

```ts
/**
 * Reverse of convertToPortfoliolyFormat — used so DOCX export reflects
 * manual edits made via ResumeDataEditor (which only mutates ResumeData).
 */
export function convertPortfoliolyToResumeJSON(data: ResumeData): ResumeJSON {
  return {
    basics: {
      name: data.basics.name || "",
      title: data.basics.headline || "",
      email: data.basics.email || "",
      phone: data.basics.phone || "",
      location: data.basics.location || "",
      links: (data.basics.profiles || []).map((p) => p.url).filter(Boolean),
      summary: data.basics.summary || "",
    },
    skills: (data.skills || []).map((s) => ({
      name: s.name || "Skills",
      items: s.keywords || [],
    })),
    experience: (data.work || []).map((w) => ({
      company: w.company || "",
      role: w.position || "",
      dates: [w.startDate, w.endDate].filter(Boolean).join(" - "),
      bullets: w.highlights || [],
    })),
    projects: (data.projects || []).map((p) => ({
      name: p.name || "",
      description: p.description || "",
      bullets: p.highlights || [],
      link: p.liveUrl || undefined,
      github: p.sourceUrl || undefined,
    })),
    education: (data.education || []).map((e) => ({
      school: e.institution || "",
      degree: e.area || "",
      dates: [e.startDate, e.endDate].filter(Boolean).join(" - "),
      location: e.location || "",
      details: e.highlights || [],
    })),
    certifications: (data.certifications || []).map((c) => ({
      name: c.name || "",
      issuer: c.issuer,
      date: c.date,
    })),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/docx-export-roundtrip.test.ts`
Expected: PASS

- [ ] **Step 5: Wire it into `OptimizerPage.tsx`**

Change the import (line 6):

```tsx
import { convertToPortfoliolyFormat, convertPortfoliolyToResumeJSON } from "@/utils/resume-converter";
```

Change `handleDownloadDocx` (currently lines 323-333):

```tsx
  const handleDownloadDocx = useCallback(async () => {
    if (!portfoliolyResume || docxGenerating) return;
    setDocxGenerating(true);
    try {
      await exportResumeDocx(convertPortfoliolyToResumeJSON(portfoliolyResume), "optimized-resume.docx");
    } catch (err: any) {
      alert(err.message || "DOCX download failed");
    } finally {
      setDocxGenerating(false);
    }
  }, [portfoliolyResume, docxGenerating]);
```

- [ ] **Step 6: Manual QA**

Run `npm run dev`, Upload → Optimize → Edit tab → change the company name on the first work experience entry and add a certification → click "Download DOCX" → open the downloaded file → confirm the edited company name and the new certification both appear.

- [ ] **Step 7: Commit**

```bash
git add src/utils/resume-converter.ts src/components/optimizer/OptimizerPage.tsx src/__tests__/docx-export-roundtrip.test.ts
git commit -m "fix(optimizer): DOCX export now reflects manually edited resume data"
```

---

### Task 6: Keep PDF export working (filename sync + regression check)

**Files:**
- Modify: `src/components/optimizer/OptimizerPage.tsx`

**Context:** PDF export (`handleDownloadPdf`, `OptimizerPage.tsx:335-395`) already reflects manual edits correctly — it serializes `resumePreviewRef.current.outerHTML` (the live rendered DOM, which is driven by `portfoliolyResume`) and posts that HTML to the backend `/generate-pdf` Puppeteer route. No structural fix is needed. The one cosmetic gap: the downloaded filename is derived from `optimizedResume.basics.name` (line 373), so if the user edits their name in the editor, the PDF *content* updates but the *filename* doesn't.

**Interfaces:**
- Consumes: `portfoliolyResume` (already in scope in `OptimizerPage.tsx`).

- [ ] **Step 1: Sync the filename**

In `src/components/optimizer/OptimizerPage.tsx`, change line 373 from:

```tsx
    const name = (optimizedResume.basics.name || "resume").replace(/[^a-z0-9]/gi, "_").toLowerCase();
```

to:

```tsx
    const name = (portfoliolyResume?.basics.name || optimizedResume.basics.name || "resume").replace(/[^a-z0-9]/gi, "_").toLowerCase();
```

- [ ] **Step 2: Manual QA (full regression pass)**

Run `npm run dev` and walk the entire flow once, end to end:
1. Upload a resume, run optimize.
2. Edit tab: edit work, education, projects, skills, add a certification, add an award/achievement, reorder at least one list.
3. Switch to Preview tab for every template (`jake`, `two-column`, `sidebar`, `dark-sidebar`) and confirm no crashes and edits are visible.
4. Click "Download PDF" — confirm it downloads, opens, and reflects the edits, and the filename matches the edited name.
5. Click "Download DOCX" — confirm same as above (re-verifies Task 5).
6. Refresh the page — confirm edits are lost (expected, since persistence is explicitly out of scope) and this doesn't throw any error, just returns to the empty/upload state.

- [ ] **Step 3: Commit**

```bash
git add src/components/optimizer/OptimizerPage.tsx
git commit -m "fix(optimizer): PDF export filename reflects edited resume name"
```

---

## Validation Checklist

Automated (run from `resumeassist/`):
- [ ] `npx vitest run` — all tests pass, including the 3 new/modified files (`portfolio-pipeline.test.ts`, `array-reorder.test.ts`, `docx-export-roundtrip.test.ts`) and every pre-existing test (`portfolio-accuracy.test.ts`, `portfolio-timeout.test.ts`, etc. must still pass unchanged).
- [ ] `npx tsc --noEmit` (or `npm run build`) — confirms the optional `id`/`certifications` fields don't break any of the ~40 other `ResumeData` consumers, and that `create-resume-simple.tsx` still compiles untouched.
- [ ] `npm run lint` — no new lint errors introduced.

Manual (browser, `npm run dev`, port 3002):
- [ ] Each of the 6 sections (Work, Education, Projects, Skills, Certifications, Awards & Achievements) supports add / edit / delete.
- [ ] Reorder up/down works in each section; boundary buttons (first item's "up", last item's "down") are disabled.
- [ ] Certifications section is visible in the sidebar and editable (previously dead code).
- [ ] Achievements entered anywhere (AI-generated or manually added) show up under "Awards & Achievements", none silently dropped.
- [ ] Preview tab (all 4 templates) reflects edits and reorder immediately.
- [ ] DOCX download reflects edits (Task 5 fix).
- [ ] PDF download reflects edits and uses the edited name for the filename.
- [ ] No new console errors/warnings during the above.

---

## Risks

1. **`portfolioly-resume.ts` strict-schema warning is unverified against the actual `/portfolio` consumer.** New fields are optional and additive, which is the safest possible change, but nobody has confirmed whether the downstream "portfolioly" site does strict/exact-shape validation on the JSON it receives. Recommend a quick check with whoever owns that consumer before this ships, even though the change is additive-only.
2. **`id` is optional, not guaranteed.** `ResumeData` created outside `convertToPortfoliolyFormat` (e.g. `create-resume-simple.tsx`, ~40 other files not touched by this plan) will have items without `id`. The forms fall back to `key={item.id ?? idx}`, which is correct but can cause React to remount rows (losing focus mid-edit) during reorder in those *other* flows specifically — not in the optimizer flow, which always gets fresh ids. Acceptable for v1; a follow-up could backfill ids on editor mount if this becomes a real complaint.
3. **The `portfolio-pipeline.test.ts` certifications test is intentionally changed, not just extended.** A reviewer scanning the diff should see this is deliberate (extraSections flattening was the bug being fixed), not an accidentally weakened test.
4. **Achievements/Awards stay merged.** If product later wants achievements visually distinct from awards in the UI (not just in data), that's a larger schema change (new `ResumeData.achievements` field, template updates, sectionConfig split) explicitly deferred out of this plan.
5. **No component test coverage for the 6 form files or `NavigationSidebar`/`ResumeDataEditor` wiring**, since the repo has no jsdom/RTL setup. Regressions in this UI layer can only be caught by the manual QA checklist above, not CI. Flagged as a gap, not fixed here (adding a component-test harness is a separate, larger decision).

---

## Rollback Plan

Every change in this plan is additive and confined to the frontend (`resumeassist/`); no backend, no database, no migrations. If something goes wrong after merging:
- `git revert` the merge commit (or the individual task commits, since each is self-contained and independently revertable in reverse order: 6 → 5 → 4 → 3 → 2 → 1).
- No data cleanup is needed anywhere — nothing is persisted server-side by this feature (persistence is explicitly out of scope), and the new `ResumeData` fields are optional so removing them doesn't strand any stored documents.
- If only the DOCX fix (Task 5) turns out to be problematic while the rest is fine, it can be reverted alone — `handleDownloadDocx` reverting to `optimizedResume` doesn't depend on anything from Tasks 1-4.

'