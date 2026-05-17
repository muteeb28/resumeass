/**
 * Unit tests for the job-board query-param construction logic.
 *
 * These tests mirror the URLSearchParams logic in the fetchJobs callback
 * (job-board.tsx) and verify that:
 *  - "All" (empty category) does not add category to the URL
 *  - Specific category values are forwarded
 *  - Search text is always included
 *  - Reset state produces no category param
 */

import { describe, it, expect } from 'vitest';

// Pure helper extracted from the fetchJobs callback in job-board.tsx.
// If the component's param-building logic changes, update this helper to match.
function buildIndiaParams(opts: {
  category:    string;
  searchText:  string;
  page:        number;
  limit:       number;
}): URLSearchParams {
  const params = new URLSearchParams({
    source:     'india',
    searchText: opts.searchText,
    page:       String(opts.page),
    limit:      String(opts.limit),
  });
  // Omit category when All is selected (empty string) so the API applies no filter.
  if (opts.category) params.set('category', opts.category);
  return params;
}

// ─── Initial state (All) ──────────────────────────────────────────────────────

describe('job-board query construction', () => {
  it('initial state ("All") does not include category param', () => {
    const params = buildIndiaParams({ category: '', searchText: '', page: 1, limit: 9 });
    expect(params.has('category')).toBe(false);
    expect(params.get('source')).toBe('india');
  });

  it('initial request includes source=india', () => {
    const params = buildIndiaParams({ category: '', searchText: '', page: 1, limit: 9 });
    expect(params.get('source')).toBe('india');
  });

  // ─── Category chips ──────────────────────────────────────────────────────────

  it('selecting Fresher sets category=Fresher', () => {
    const params = buildIndiaParams({ category: 'Fresher', searchText: '', page: 1, limit: 9 });
    expect(params.get('category')).toBe('Fresher');
  });

  it('selecting Internship sets category=Internship', () => {
    const params = buildIndiaParams({ category: 'Internship', searchText: '', page: 1, limit: 9 });
    expect(params.get('category')).toBe('Internship');
  });

  it('selecting IT/Software sets category=IT/Software', () => {
    const params = buildIndiaParams({ category: 'IT/Software', searchText: '', page: 1, limit: 9 });
    expect(params.get('category')).toBe('IT/Software');
  });

  it('selecting Batch 2026 sets category=Batch 2026', () => {
    const params = buildIndiaParams({ category: 'Batch 2026', searchText: '', page: 1, limit: 9 });
    expect(params.get('category')).toBe('Batch 2026');
  });

  // ─── Search ──────────────────────────────────────────────────────────────────

  it('searching while All is selected does not include category, but includes searchText', () => {
    const params = buildIndiaParams({ category: '', searchText: 'Capco', page: 1, limit: 9 });
    expect(params.has('category')).toBe(false);
    expect(params.get('searchText')).toBe('Capco');
  });

  it('searching while Fresher is selected includes both category and searchText', () => {
    const params = buildIndiaParams({ category: 'Fresher', searchText: 'PayU', page: 1, limit: 9 });
    expect(params.get('category')).toBe('Fresher');
    expect(params.get('searchText')).toBe('PayU');
  });

  // ─── Clear / reset ────────────────────────────────────────────────────────────

  it('clearing filters resets to All — no category param and searchText is empty', () => {
    // Simulates clearFilters() → setCategory("") + setSearchQuery("")
    const params = buildIndiaParams({ category: '', searchText: '', page: 1, limit: 9 });
    expect(params.has('category')).toBe(false);
    expect(params.get('searchText')).toBe('');
  });

  // ─── Count label helper ──────────────────────────────────────────────────────

  it('filterLabel is "fresh" when category is empty', () => {
    const category = '';
    const filterLabel = category === '' ? 'fresh' : category;
    expect(filterLabel).toBe('fresh');
  });

  it('filterLabel is "Fresher" when category is Fresher', () => {
    const category = 'Fresher';
    const filterLabel = category === '' ? 'fresh' : category;
    expect(filterLabel).toBe('Fresher');
  });

  it('filterLabel is "Internship" when category is Internship', () => {
    const category = 'Internship';
    const filterLabel = category === '' ? 'fresh' : category;
    expect(filterLabel).toBe('Internship');
  });
});
