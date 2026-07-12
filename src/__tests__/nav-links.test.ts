import { describe, it, expect } from 'vitest';
import { JOB_LINKS, LEARN_LINKS } from '../components/marketing/nav-links';

describe('shared nav-link data', () => {
  it('JOB_LINKS has the 6 existing job destinations, in order', () => {
    expect(JOB_LINKS.map((l) => l.name)).toEqual([
      'Find Jobs', 'Job Tracker', 'HR Emails', 'Dubai HR', 'Gulf Jobs', 'AU & NZ',
    ]);
  });

  it('LEARN_LINKS has the 4 existing learn destinations, in order, with Courses first', () => {
    expect(LEARN_LINKS.map((l) => l.name)).toEqual([
      'Courses', 'Opportunities', 'Prepare', 'Interview Questions',
    ]);
  });

  it('Courses links to the external jobflix.in destination used by the hero card cluster', () => {
    const courses = LEARN_LINKS.find((l) => l.name === 'Courses');
    expect(courses?.href).toBe('https://jobflix.in/courses');
    expect(courses?.external).toBe(true);
  });

  it('Find Jobs links to /find-jobs, used by the hero card cluster', () => {
    const findJobs = JOB_LINKS.find((l) => l.name === 'Find Jobs');
    expect(findJobs?.href).toBe('/find-jobs');
  });
});
