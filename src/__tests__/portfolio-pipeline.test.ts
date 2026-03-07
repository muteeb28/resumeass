/**
 * TDD tests for the portfolio extraction pipeline:
 *   server response → parserToV2 → convertToPortfoliolyFormat → ResumeData
 *
 * The server returns data like:
 *   { basics, experience, education, projects, skills, achievements, ... }
 *
 * These tests lock down expected behavior so bugs are visible before code changes.
 */

import { describe, it, expect } from 'vitest';
import { parserToV2 } from '@/types/resume';
import { convertToPortfoliolyFormat } from '@/utils/resume-converter';

// ─── Realistic server response (python-gemini-pipeline format) ────────────────
const MOCK_SERVER_RESPONSE = {
  basics: {
    name: 'Aadil Jabar',
    email: 'javaidadil2@gmail.com',
    phone: '+91 9682615789',
    title: 'ERP Business Analyst',
    location: 'Srinagar, India',
    links: ['https://linkedin.com/in/aadiljabar', 'https://github.com/aadiljabar'],
    summary: 'Expertise in end-to-end ERP implementation.',
  },
  // Experience items sometimes include a "link" field from Mistral extraction.
  // Bug: parserToV2 uses `isProject` heuristic before `key === 'experience'` check,
  // so any experience item with link/tech gets misclassified as type:'project'.
  experience: [
    {
      company: 'Horizons ERP',
      role: 'Business Analyst',
      dates: 'Jan 2022 – Present',
      location: 'Srinagar',
      bullets: ['Led ERP rollout for 3 enterprise clients.'],
      link: 'https://horizons.example.com', // <-- triggers isProject heuristic
    },
    {
      company: 'TechCorp',
      role: 'Junior Analyst',
      dates: 'Jun 2020 – Dec 2021',
      bullets: ['Managed procurement module.'],
      // no link field
    },
  ],
  education: [
    {
      school: 'AAA Memorial Degree College',
      degree: 'Bachelor of Commerce (B.Com)',
      dates: '2021 – Present',
      location: 'Srinagar, India',
      gpa: '8.5',
    },
  ],
  projects: [
    {
      name: 'ERP Dashboard',
      description: 'Custom analytics dashboard for ERP data.',
      tech: ['React', 'Node.js'],
      link: 'https://github.com/aadiljabar/erp-dashboard',
      bullets: ['Built real-time data views.'],
    },
  ],
  skills: [
    {
      name: 'Business Skills',
      items: ['SERVICE REQUEST MANAGEMENT', 'CRM', 'ERP Implementation', 'Procurement'],
    },
    {
      name: 'Technical Skills',
      items: ['SQL', 'Excel', 'Power BI'],
    },
  ],
  achievements: ['Top performer Q3 2023', 'Certified SAP Consultant'],
  certifications: [
    { name: 'SAP Certified Associate', issuer: 'SAP', date: '2022' },
  ],
  volunteer: [
    {
      organization: 'Code For Good',
      role: 'Mentor',
      dates: '2021 – Present',
      bullets: ['Mentored 10 students in web development.'],
    },
  ],
  coursework: ['Business Analytics', 'Operations Management'],
  _parser: 'python-gemini-pipeline',
  rawText: 'Aadil Jabar ERP Business Analyst...',
};

// ─── parserToV2 tests ──────────────────────────────────────────────────────────

describe('parserToV2', () => {
  const v2 = parserToV2(MOCK_SERVER_RESPONSE);

  it('produces version:2 output', () => {
    expect(v2.version).toBe(2);
  });

  it('preserves basics correctly', () => {
    expect(v2.basics.name).toBe('Aadil Jabar');
    expect(v2.basics.email).toBe('javaidadil2@gmail.com');
    expect(v2.basics.phone).toBe('+91 9682615789');
    expect(v2.basics.title).toBe('ERP Business Analyst');
  });

  it('creates an experience section', () => {
    expect(v2.sections).toHaveProperty('experience');
  });

  it('experience items are type:timeline (not project), even when items have a link field', () => {
    const expSection = v2.sections['experience'];
    expect(expSection).toBeDefined();
    expect(expSection.layout).toBe('timeline');
    for (const item of expSection.items) {
      expect(item.type).toBe('timeline');
    }
  });

  it('captures all 2 experience entries', () => {
    const expSection = v2.sections['experience'];
    expect(expSection.items).toHaveLength(2);
  });

  it('experience items have correct organization and title', () => {
    const expSection = v2.sections['experience'];
    const first = expSection.items[0] as any;
    expect(first.organization).toBe('Horizons ERP');
    expect(first.title).toBe('Business Analyst');
  });

  it('creates an education section with correct layout', () => {
    expect(v2.sections).toHaveProperty('education');
    expect(v2.sections['education'].layout).toBe('education');
  });

  it('creates a projects section with correct layout', () => {
    expect(v2.sections).toHaveProperty('projects');
    expect(v2.sections['projects'].layout).toBe('projects');
  });

  it('creates a skills section with all keywords as list items', () => {
    expect(v2.sections).toHaveProperty('skills');
    const skillItems = v2.sections['skills'].items;
    // 4 Business Skills + 3 Technical Skills = 7 total
    expect(skillItems).toHaveLength(7);
    expect(skillItems.every(i => i.type === 'list')).toBe(true);
  });

  it('captures achievements section', () => {
    expect(v2.sections).toHaveProperty('achievements');
  });

  it('captures certifications section', () => {
    expect(v2.sections).toHaveProperty('certifications');
  });

  it('captures volunteer section', () => {
    expect(v2.sections).toHaveProperty('volunteer');
  });

  it('captures coursework section', () => {
    expect(v2.sections).toHaveProperty('coursework');
  });

  it('does not include _parser, rawText, or basics as sections', () => {
    expect(v2.sections).not.toHaveProperty('_parser');
    expect(v2.sections).not.toHaveProperty('rawText');
    expect(v2.sections).not.toHaveProperty('basics');
  });
});

// ─── Full pipeline tests ───────────────────────────────────────────────────────

describe('parserToV2 → convertToPortfoliolyFormat (full pipeline)', () => {
  const v2 = parserToV2(MOCK_SERVER_RESPONSE);
  const portfolio = convertToPortfoliolyFormat(v2);

  it('basics.name is populated', () => {
    expect(portfolio.basics.name).toBe('Aadil Jabar');
  });

  it('basics.email is populated', () => {
    expect(portfolio.basics.email).toBe('javaidadil2@gmail.com');
  });

  it('basics.phone is populated', () => {
    expect(portfolio.basics.phone).toBe('+91 9682615789');
  });

  it('basics.profiles contains linkedin and github links', () => {
    const urls = portfolio.basics.profiles.map(p => p.url);
    expect(urls).toContain('https://linkedin.com/in/aadiljabar');
    expect(urls).toContain('https://github.com/aadiljabar');
  });

  it('work has 2 entries', () => {
    expect(portfolio.work).toHaveLength(2);
  });

  it('work[0] has correct company and position', () => {
    expect(portfolio.work[0].company).toBe('Horizons ERP');
    expect(portfolio.work[0].position).toBe('Business Analyst');
  });

  it('work[0] has highlights', () => {
    expect(portfolio.work[0].highlights).toContain('Led ERP rollout for 3 enterprise clients.');
  });

  it('education has 1 entry', () => {
    expect(portfolio.education).toHaveLength(1);
  });

  it('education[0] has correct institution', () => {
    expect(portfolio.education[0].institution).toBe('AAA Memorial Degree College');
  });

  it('projects has 1 entry', () => {
    expect(portfolio.projects).toHaveLength(1);
  });

  it('project[0] has correct name', () => {
    expect(portfolio.projects[0].name).toBe('ERP Dashboard');
  });

  it('skills are flattened into keyword arrays', () => {
    const allKeywords = portfolio.skills.flatMap(s => s.keywords);
    expect(allKeywords).toContain('SERVICE REQUEST MANAGEMENT');
    expect(allKeywords).toContain('CRM');
    expect(allKeywords).toContain('SQL');
  });

  it('awards (achievements) are captured', () => {
    expect(portfolio.awards).toHaveLength(2);
    expect(portfolio.awards[0].title).toBe('Top performer Q3 2023');
  });

  it('volunteer entries are captured', () => {
    expect(portfolio.volunteer).toHaveLength(1);
    expect(portfolio.volunteer[0].organization).toBe('Code For Good');
  });

  it('coursework is captured', () => {
    expect(portfolio.coursework).toContain('Business Analytics');
  });

  it('certifications appear in extraSections', () => {
    const certSection = portfolio.extraSections?.find(s => s.title === 'Certifications');
    expect(certSection).toBeDefined();
    expect(certSection!.items.length).toBeGreaterThan(0);
  });
});
