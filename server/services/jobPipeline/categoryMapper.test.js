import { describe, it, expect } from 'vitest';
import { mapToCategories } from './categoryMapper.js';

// ─── Internship ───────────────────────────────────────────────────────────────

describe('mapToCategories — Internship', () => {
  it('assigns Internship when title contains "intern"', () => {
    expect(mapToCategories({ title: 'Software Engineer Intern' })).toContain('Internship');
  });

  it('assigns Internship when title is "Internship - Data Science"', () => {
    expect(mapToCategories({ title: 'Internship - Data Science' })).toContain('Internship');
  });

  it('assigns Internship when title contains "trainee"', () => {
    expect(mapToCategories({ title: 'Trainee Engineer' })).toContain('Internship');
  });

  it('assigns Internship when title contains "apprentice"', () => {
    expect(mapToCategories({ title: 'Apprentice Developer' })).toContain('Internship');
  });

  it('assigns Internship when jobType is "Internship"', () => {
    expect(mapToCategories({ title: 'Associate Engineer', jobType: 'Internship' })).toContain('Internship');
  });

  it('assigns Internship when tags include "intern"', () => {
    expect(mapToCategories({ title: 'Engineering Role', tags: ['intern', 'backend'] })).toContain('Internship');
  });

  it('does NOT assign Internship for a plain full-time role', () => {
    expect(mapToCategories({ title: 'Full Stack Developer', jobType: 'Full-time' })).not.toContain('Internship');
  });
});

// ─── Fresher ─────────────────────────────────────────────────────────────────

describe('mapToCategories — Fresher', () => {
  it('assigns Fresher when title contains "fresher"', () => {
    expect(mapToCategories({ title: 'Fresher - Java Developer' })).toContain('Fresher');
  });

  it('assigns Fresher when title contains "entry level"', () => {
    expect(mapToCategories({ title: 'Entry Level Software Engineer' })).toContain('Fresher');
  });

  it('assigns Fresher when title contains "entry-level"', () => {
    expect(mapToCategories({ title: 'Entry-Level Product Analyst' })).toContain('Fresher');
  });

  it('assigns Fresher when title contains "new grad"', () => {
    expect(mapToCategories({ title: 'New Grad Software Engineer' })).toContain('Fresher');
  });

  it('assigns Fresher when title contains "fresh graduate"', () => {
    expect(mapToCategories({ title: 'Fresh Graduate Developer' })).toContain('Fresher');
  });

  it('assigns Fresher when title contains "early career"', () => {
    expect(mapToCategories({ title: 'Early Career Engineer' })).toContain('Fresher');
  });

  it('does NOT assign Fresher for a senior title', () => {
    expect(mapToCategories({ title: 'Senior Software Engineer' })).not.toContain('Fresher');
  });

  it('does NOT assign Fresher from description alone — title is required', () => {
    // Fresher should not be inferred from description text; only title/tags matter
    const cats = mapToCategories({ title: 'Engineer', description: 'This role is ideal for freshers and new grads.' });
    expect(cats).not.toContain('Fresher');
  });
});

// ─── Remote ──────────────────────────────────────────────────────────────────

describe('mapToCategories — Remote', () => {
  it('assigns Remote when remote=true', () => {
    expect(mapToCategories({ title: 'Backend Developer', remote: true })).toContain('Remote');
  });

  it('assigns Remote when location contains "Remote"', () => {
    expect(mapToCategories({ title: 'Designer', location: 'Remote' })).toContain('Remote');
  });

  it('assigns Remote when location is "Worldwide"', () => {
    expect(mapToCategories({ title: 'Developer', location: 'Worldwide' })).toContain('Remote');
  });

  it('does NOT assign Remote when location is a city and remote is false', () => {
    const cats = mapToCategories({ title: 'Analyst', location: 'Bangalore', remote: false });
    expect(cats).not.toContain('Remote');
  });
});

// ─── IT/Software ─────────────────────────────────────────────────────────────

describe('mapToCategories — IT/Software', () => {
  it('assigns IT/Software when title contains "software"', () => {
    expect(mapToCategories({ title: 'Software Engineer' })).toContain('IT/Software');
  });

  it('assigns IT/Software when title contains "developer"', () => {
    expect(mapToCategories({ title: 'Backend Developer' })).toContain('IT/Software');
  });

  it('assigns IT/Software when title contains "full stack"', () => {
    expect(mapToCategories({ title: 'Full Stack Engineer' })).toContain('IT/Software');
  });

  it('assigns IT/Software when title contains "machine learning"', () => {
    expect(mapToCategories({ title: 'Machine Learning Engineer' })).toContain('IT/Software');
  });

  it('assigns IT/Software when title contains "devops"', () => {
    expect(mapToCategories({ title: 'DevOps Engineer' })).toContain('IT/Software');
  });

  it('assigns IT/Software when tags contain "backend"', () => {
    expect(mapToCategories({ title: 'Engineer', tags: ['backend', 'node'] })).toContain('IT/Software');
  });

  it('assigns IT/Software when tags contain "react"', () => {
    expect(mapToCategories({ title: 'Developer', tags: ['react', 'typescript'] })).toContain('IT/Software');
  });

  it('does NOT assign IT/Software for a Mechanical Engineer title', () => {
    expect(mapToCategories({ title: 'Mechanical Engineer' })).not.toContain('IT/Software');
  });

  it('does NOT assign IT/Software when title contains "Spring" as a season/modifier (not a tag)', () => {
    // "Spring" as a framework only tagged via tags[], not in free-form title
    expect(mapToCategories({ title: 'Spring 2026 Marketing Intern' })).not.toContain('IT/Software');
  });

  it('does NOT assign IT/Software when title contains "React to" (verb, not the framework)', () => {
    expect(mapToCategories({ title: 'React to Customer Feedback Specialist' })).not.toContain('IT/Software');
  });

  it('DOES assign IT/Software when tags contain "react" (structured tag, safe to match)', () => {
    expect(mapToCategories({ title: 'Frontend Role', tags: ['react', 'typescript'] })).toContain('IT/Software');
  });

  it('DOES assign IT/Software when tags contain "python" but NOT when "python" only in title', () => {
    const fromTitle = mapToCategories({ title: 'Python Instructor', tags: [] });
    const fromTags  = mapToCategories({ title: 'Software Instructor', tags: ['python'] });
    // Title alone is ambiguous (Python the snake / animal handler); should not trigger
    expect(fromTitle).not.toContain('IT/Software');
    // Tags confirm it's a tech role
    expect(fromTags).toContain('IT/Software');
  });
});

// ─── Full Time vs Internship ──────────────────────────────────────────────────

describe('mapToCategories — Full Time / Internship precedence', () => {
  it('assigns Full Time when jobType is "Full-time" and no intern signal', () => {
    expect(mapToCategories({ title: 'Backend Developer', jobType: 'Full-time' })).toContain('Full Time');
  });

  it('does NOT assign Full Time when title says "Intern" even if jobType is Full-time', () => {
    const cats = mapToCategories({ title: 'Software Engineering Intern', jobType: 'Full-time' });
    expect(cats).toContain('Internship');
    expect(cats).not.toContain('Full Time');
  });

  it('does NOT assign Full Time when jobType is absent', () => {
    expect(mapToCategories({ title: 'Backend Developer' })).not.toContain('Full Time');
  });
});

// ─── Batch 2025 / 2026 ───────────────────────────────────────────────────────

describe('mapToCategories — Batch 2025 / Batch 2026', () => {
  it('does NOT assign Batch 2025 or 2026 for a plain Fresher title', () => {
    const cats = mapToCategories({ title: 'Fresher Software Engineer' });
    expect(cats).not.toContain('Batch 2025');
    expect(cats).not.toContain('Batch 2026');
  });

  it('does NOT assign Batch from description alone', () => {
    const cats = mapToCategories({ title: 'Engineer', description: 'For graduates of batch 2026.' });
    expect(cats).not.toContain('Batch 2026');
  });

  it('assigns Batch 2026 when title contains "Batch 2026"', () => {
    expect(mapToCategories({ title: 'Software Engineer Fresher Batch 2026' })).toContain('Batch 2026');
  });

  it('assigns Batch 2025 when title contains "Batch 2025"', () => {
    expect(mapToCategories({ title: 'Trainee Engineer Batch 2025' })).toContain('Batch 2025');
  });

  it('assigns Batch 2026 when title contains "class of 2026"', () => {
    expect(mapToCategories({ title: 'Software Engineer - Class of 2026' })).toContain('Batch 2026');
  });

  it('assigns Batch 2026 when tags contain "batch 2026"', () => {
    expect(mapToCategories({ title: 'Developer', tags: ['batch 2026', 'fresher'] })).toContain('Batch 2026');
  });

  it('does NOT assign Batch for an unrelated year in title', () => {
    // "2024" is not 2025 or 2026
    const cats = mapToCategories({ title: 'Engineer Batch 2024' });
    expect(cats).not.toContain('Batch 2025');
    expect(cats).not.toContain('Batch 2026');
  });
});

// ─── Design ──────────────────────────────────────────────────────────────────

describe('mapToCategories — Design', () => {
  it('assigns Design when title contains "designer"', () => {
    expect(mapToCategories({ title: 'UI/UX Designer' })).toContain('Design');
  });

  it('assigns Design when title contains "product design"', () => {
    expect(mapToCategories({ title: 'Product Design Lead' })).toContain('Design');
  });

  it('does NOT assign Design for a developer role', () => {
    expect(mapToCategories({ title: 'Frontend Developer' })).not.toContain('Design');
  });
});

// ─── Sales & Marketing ────────────────────────────────────────────────────────

describe('mapToCategories — Sales & Marketing', () => {
  it('assigns Sales & Marketing when title contains "sales"', () => {
    expect(mapToCategories({ title: 'Sales Development Representative' })).toContain('Sales & Marketing');
  });

  it('assigns Sales & Marketing when title contains "marketing"', () => {
    expect(mapToCategories({ title: 'Digital Marketing Intern' })).toContain('Sales & Marketing');
  });

  it('does NOT assign Sales & Marketing for an engineering role', () => {
    expect(mapToCategories({ title: 'Backend Engineer' })).not.toContain('Sales & Marketing');
  });
});

// ─── Empty input ──────────────────────────────────────────────────────────────

describe('mapToCategories — edge cases', () => {
  it('returns empty array for empty title and no signals', () => {
    expect(mapToCategories({ title: '' })).toEqual([]);
  });

  it('returns empty array for undefined input fields', () => {
    expect(mapToCategories({})).toEqual([]);
  });
});
