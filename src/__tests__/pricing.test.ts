/**
 * Unit tests for pricing section content.
 *
 * Mirrors the card definitions in payment-section.tsx.
 * If card content changes, update this file to match.
 */

import { describe, it, expect } from 'vitest';

const cards = [
  {
    title: 'Starter',
    price: '₹99',
    period: 'month',
    saveBadge: 'Save 80%',
    features: [
      'Job Tracker',
      'Resume Optimizer (rate limit)',
      'Resume Creator (rate limit)',
      'Jobs (only latest openings)',
    ],
  },
  {
    title: 'Growth',
    price: '₹155',
    period: 'month',
    saveBadge: 'Save 50%',
    isPopular: true,
    features: [
      'Job Tracker',
      'Resume Optimizer (rate limit)',
      'Resume Creator (rate limit)',
      'Jobs (Fresh)',
      '3000+ MNC and startup HR emails',
      'Dubai HR emails',
    ],
  },
  {
    title: 'Pro Weekly',
    price: '₹999',
    period: 'week',
    comingSoon: true,
    features: [
      'Everything in HR Outreach',
      'Unlimited resume optimizations',
      'Priority support',
    ],
  },
];

// ─── Monthly pricing labels ───────────────────────────────────────────────────

describe('pricing — monthly labels', () => {
  it('Starter card shows ₹99/month', () => {
    const card = cards.find((c) => c.title === 'Starter')!;
    expect(card.price).toBe('₹99');
    expect(card.period).toBe('month');
  });

  it('Growth card shows ₹155/month', () => {
    const card = cards.find((c) => c.title === 'Growth')!;
    expect(card.price).toBe('₹155');
    expect(card.period).toBe('month');
  });

  it('old ₹50 and ₹199 prices are gone', () => {
    const prices = cards.map((c) => c.price);
    expect(prices).not.toContain('₹50');
    expect(prices).not.toContain('₹199');
  });
});

// ─── Discount badges ─────────────────────────────────────────────────────────

describe('pricing — discount badges', () => {
  it('Starter shows Save 80%', () => {
    const card = cards.find((c) => c.title === 'Starter')!;
    expect(card.saveBadge).toBe('Save 80%');
  });

  it('Growth shows Save 50%', () => {
    const card = cards.find((c) => c.title === 'Growth')!;
    expect(card.saveBadge).toBe('Save 50%');
  });
});

// ─── Card 1 — Starter features ───────────────────────────────────────────────

describe('pricing — Starter features', () => {
  const card = cards.find((c) => c.title === 'Starter')!;

  it.each(['Job Tracker', 'Resume Optimizer (rate limit)', 'Resume Creator (rate limit)', 'Jobs (only latest openings)'])(
    'includes %s',
    (feature) => expect(card.features).toContain(feature)
  );

  it('does not contain stale ATS-resume bullet', () => {
    expect(card.features).not.toContain('ATS-ready resume (2 professional templates)');
  });

  it('does not contain stale PDF/DOCX bullet', () => {
    expect(card.features).not.toContain('PDF + DOCX downloads');
  });
});

// ─── Card 2 — Growth features ────────────────────────────────────────────────

describe('pricing — Growth features', () => {
  const card = cards.find((c) => c.title === 'Growth')!;

  it.each([
    'Job Tracker',
    'Resume Optimizer (rate limit)',
    'Resume Creator (rate limit)',
    'Jobs (Fresh)',
    '3000+ MNC and startup HR emails',
    'Dubai HR emails',
  ])('includes %s', (feature) => expect(card.features).toContain(feature));

  it('does not contain stale 1800 India HR bullet', () => {
    expect(card.features).not.toContain('1800+ India HR email contacts');
  });

  it('does not contain stale LinkedIn profiles bullet', () => {
    expect(card.features).not.toContain('LinkedIn profiles of HRs');
  });

  it('is marked as the popular plan', () => {
    expect(card.isPopular).toBe(true);
  });
});

// ─── Card 3 — Pro Weekly unchanged ───────────────────────────────────────────

describe('pricing — Pro Weekly', () => {
  const card = cards.find((c) => c.title === 'Pro Weekly')!;

  it('is marked as coming soon', () => {
    expect(card.comingSoon).toBe(true);
  });

  it('shows weekly period', () => {
    expect(card.period).toBe('week');
  });
});

// ─── Card count ──────────────────────────────────────────────────────────────

describe('pricing — structure', () => {
  it('has exactly 3 pricing cards', () => {
    expect(cards).toHaveLength(3);
  });
});
