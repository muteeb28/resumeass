import { describe, it, expect } from 'vitest';
import { HERO_CLUSTER_CARDS } from '../components/marketing/hero/hero-cluster-data';

describe('hero card cluster data', () => {
  it('has exactly 3 cards, in Mentorship / Latest Jobs / Courses order', () => {
    expect(HERO_CLUSTER_CARDS.map((c) => c.title)).toEqual([
      'Mentorship & referrals',
      'Latest jobs',
      'Courses',
    ]);
  });

  it('each card links to an existing nav destination (no invented routes)', () => {
    expect(HERO_CLUSTER_CARDS.map((c) => c.href)).toEqual([
      '/referrals',
      '/find-jobs',
      'https://jobflix.in/courses',
    ]);
  });

  it('every card has exactly 4 rows (uniform across all 3 cards) and a footer caption', () => {
    for (const card of HERO_CLUSTER_CARDS) {
      expect(card.rows.length).toBe(4);
      expect(card.footer.length).toBeGreaterThan(0);
      expect(card.step.length).toBeGreaterThan(0);
    }
  });

  it('Mentorship & referrals has the specified row titles, in order', () => {
    expect(HERO_CLUSTER_CARDS[0].rows.map((r) => r.title)).toEqual([
      'Resume Reviews', 'Mock Interviews', 'Professional Referrals', 'Career Mentorship',
    ]);
  });

  it('Latest jobs has the specified row titles, in order', () => {
    expect(HERO_CLUSTER_CARDS[1].rows.map((r) => r.title)).toEqual([
      'Software Engineer', 'Frontend Developer', 'Backend Developer', 'AI Engineer',
    ]);
  });

  it('Courses has the specified row titles, in order', () => {
    expect(HERO_CLUSTER_CARDS[2].rows.map((r) => r.title)).toEqual([
      'React', 'System Design', 'DSA', 'AI Interview Prep',
    ]);
  });
});
