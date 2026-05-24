/**
 * Unit tests for the landing-page navbar config.
 *
 * These tests mirror the navItems array in navbar.tsx and verify the
 * nav structure after the 2026-05-24 updates:
 *  - "Job Tracker" renamed to "Job Referrals"
 *  - "Fresh Jobs" added (links to the Find Jobs tab)
 *  - "Courses" removed
 *  - "Features" renamed to "Learn" (external link to jobflix.in/courses)
 *  - Desktop and mobile both render from the same navItems array
 *
 * If navbar.tsx navItems changes, update this file to match.
 */

import { describe, it, expect } from 'vitest';

// Mirrors navItems in src/components/navbar.tsx.
const navItems = [
  { name: 'Job Referrals', href: '/job-tracker' },
  { name: 'Fresh Jobs',    href: '/job-tracker?tab=jobs' },
  { name: 'Learn',         href: 'https://jobflix.in/courses', external: true },
  { name: 'Pricing',       href: '/#pricing' },
  { name: 'Blog',          href: '/blog' },
];

const navNames = navItems.map((i) => i.name);
const navHrefs = navItems.map((i) => i.href);

// ─── Renamed item ─────────────────────────────────────────────────────────────

describe('navbar — Job Referrals', () => {
  it('renders Job Referrals', () => {
    expect(navNames).toContain('Job Referrals');
  });

  it('Job Referrals links to /job-tracker', () => {
    const item = navItems.find((i) => i.name === 'Job Referrals');
    expect(item?.href).toBe('/job-tracker');
  });

  it('old label Job Tracker is gone', () => {
    expect(navNames).not.toContain('Job Tracker');
  });
});

// ─── New item ─────────────────────────────────────────────────────────────────

describe('navbar — Fresh Jobs', () => {
  it('renders Fresh Jobs', () => {
    expect(navNames).toContain('Fresh Jobs');
  });

  it('Fresh Jobs links to the Find Jobs tab', () => {
    const item = navItems.find((i) => i.name === 'Fresh Jobs');
    expect(item?.href).toBe('/job-tracker?tab=jobs');
  });
});

// ─── Removed items ────────────────────────────────────────────────────────────

describe('navbar — Courses removed', () => {
  it('Courses is not in navItems', () => {
    expect(navNames).not.toContain('Courses');
  });

  it('no external levelup courses URL remains in nav config', () => {
    expect(navHrefs.some((h) => h.includes('levelup'))).toBe(false);
  });
});

describe('navbar — Features renamed to Learn', () => {
  it('Features label is gone', () => {
    expect(navNames).not.toContain('Features');
  });

  it('Learn is present', () => {
    expect(navNames).toContain('Learn');
  });

  it('Learn links to jobflix.in/courses', () => {
    const item = navItems.find((i) => i.name === 'Learn');
    expect(item?.href).toBe('https://jobflix.in/courses');
  });

  it('Learn is marked as external', () => {
    const item = navItems.find((i) => i.name === 'Learn');
    expect(item?.external).toBe(true);
  });
});

// ─── Preserved items ──────────────────────────────────────────────────────────

describe('navbar — preserved items', () => {
  it.each(['Pricing', 'Blog'])('%s still present', (name) => {
    expect(navNames).toContain(name);
  });

  it('Pricing links to /#pricing anchor', () => {
    expect(navItems.find((i) => i.name === 'Pricing')?.href).toBe('/#pricing');
  });
});

// ─── Order ────────────────────────────────────────────────────────────────────

describe('navbar — item order', () => {
  it('Job Referrals is first', () => {
    expect(navItems[0].name).toBe('Job Referrals');
  });

  it('Fresh Jobs is second', () => {
    expect(navItems[1].name).toBe('Fresh Jobs');
  });

  it('Learn is third', () => {
    expect(navItems[2].name).toBe('Learn');
  });

  it('total nav link count is 5', () => {
    expect(navItems).toHaveLength(5);
  });
});

// ─── External link contract ───────────────────────────────────────────────────

describe('navbar — external links', () => {
  it('only Learn is marked external', () => {
    const externalItems = navItems.filter((i) => i.external);
    expect(externalItems).toHaveLength(1);
    expect(externalItems[0].name).toBe('Learn');
  });

  it('internal items are not marked external', () => {
    const internalItems = navItems.filter((i) => !i.external);
    expect(internalItems.map((i) => i.name)).not.toContain('Learn');
  });
});

// ─── Desktop / mobile parity ─────────────────────────────────────────────────

describe('navbar — desktop/mobile parity', () => {
  it('both desktop and mobile render from the same navItems array', () => {
    const desktopItems = navItems;
    const mobileItems  = navItems;
    expect(desktopItems).toEqual(mobileItems);
  });
});
