/**
 * Phase 3 — Failing tests: extraction accuracy and data integrity
 *
 * Priority 0 — phone preservation is tested via phoneValidator (backend)
 *
 * Priority 2 — Education CGPA display bug
 *   convertToPortfoliolyFormat sets edu.score = cgpaDetail (the full "CGPA: 7.69" label)
 *   portfolio-preview then renders `GPA: ${edu.score}` → "GPA: CGPA: 7.69" (doubled label)
 *   Fix: extract the numeric value from the CGPA label string.
 *
 * Priority 1 — Skill pipeline end-to-end (frontend converter)
 *   Verify that skills survive parserToV2 → convertToPortfoliolyFormat with correct names.
 */

import { describe, it, expect } from 'vitest';
import { parserToV2 } from '@/types/resume';
import { convertToPortfoliolyFormat } from '@/utils/resume-converter';

// ─── Realistic GPT-OSS-20B backend response (matches Jinesh Soni resume) ─────

const BACKEND_RESPONSE = {
  basics: {
    name: 'Jinesh Soni',
    title: 'Engineering Manager at Bijak',
    email: 'jinesh2025@gmail.com',
    phone: '+91-7878415078',
    location: 'India',
    summary: 'Experienced software developer.',
    links: ['https://jineshsoni.com'],
  },
  experience: [
    {
      company: 'Bijak | Krishiacharya Technologies Private Limited',
      role: 'Team Lead -> Engineering Manager',
      location: 'Gurugram, India (Remote)',
      dates: 'July 2020 - Present',
      bullets: ['Led cross-functional teams.'],
      tech: ['Flutter', 'Firebase'],
    },
  ],
  education: [
    {
      school: 'Gujarat Technological University',
      degree: 'Bachelor of engineering',
      location: '',
      dates: '2010-2014',
      details: ['CGPA: 7.69'],
    },
  ],
  projects: [],
  skills: [
    { name: 'Expert', items: ['Flutter', 'Dart', 'Firebase'] },
    { name: 'High Knowledge', items: ['A/B Testing', 'HTML/CSS', 'AWS'] },
    { name: 'Tinkering', items: ['Neo-6M GPS', '3D Printing', 'Go'] },
  ],
  certifications: [],
  volunteer: [],
  achievements: [],
  coursework: [],
  extraSections: [],
  _parser: 'mistral-ocr+gpt-oss-20b',
};

// ─── Priority 2: CGPA extraction ─────────────────────────────────────────────

describe('convertToPortfoliolyFormat — CGPA extraction (Priority 2)', () => {
  const v2 = parserToV2(BACKEND_RESPONSE);
  const portfolio = convertToPortfoliolyFormat(v2);

  it('edu.score is the numeric value only, not the full "CGPA: 7.69" label', () => {
    // Bug: currently returns "CGPA: 7.69". portfolio-preview then renders "GPA: CGPA: 7.69"
    expect(portfolio.education[0].score).toBe('7.69');
  });

  it('edu.score does not contain "CGPA:" or "GPA:" prefix', () => {
    expect(portfolio.education[0].score).not.toMatch(/^(cgpa|gpa):/i);
  });

  it('institution is preserved correctly', () => {
    expect(portfolio.education[0].institution).toBe('Gujarat Technological University');
  });

  it('degree is preserved correctly', () => {
    expect(portfolio.education[0].area).toBe('Bachelor of engineering');
  });
});

describe('convertToPortfoliolyFormat — education date split (Priority 2)', () => {
  const v2 = parserToV2(BACKEND_RESPONSE);
  const portfolio = convertToPortfoliolyFormat(v2);

  it('startDate is extracted from dates string', () => {
    expect(portfolio.education[0].startDate).toBe('2010');
  });

  it('endDate is extracted from dates string', () => {
    expect(portfolio.education[0].endDate).toBe('2014');
  });
});

// ─── Priority 1: Skill names preserved through full pipeline ─────────────────

describe('parserToV2 → convertToPortfoliolyFormat — skill name integrity (Priority 1)', () => {
  const v2 = parserToV2(BACKEND_RESPONSE);
  const portfolio = convertToPortfoliolyFormat(v2);
  const allKeywords = portfolio.skills.flatMap(s => s.keywords);

  it('contains Go (not split from A/B or any slash)', () => {
    expect(allKeywords).toContain('Go');
  });

  it('contains Flutter (no mutation)', () => {
    expect(allKeywords).toContain('Flutter');
  });

  it('contains Firebase (no mutation)', () => {
    expect(allKeywords).toContain('Firebase');
  });

  it('contains AWS (no mutation)', () => {
    expect(allKeywords).toContain('AWS');
  });

  it('contains 3D Printing (no mutation)', () => {
    expect(allKeywords).toContain('3D Printing');
  });
});

// ─── Priority 0: Phone preserved through V1 path ─────────────────────────────

describe('convertToPortfoliolyFormat — basics.phone preserved exactly (Priority 0)', () => {
  const v2 = parserToV2(BACKEND_RESPONSE);
  const portfolio = convertToPortfoliolyFormat(v2);

  it('phone is passed through unchanged', () => {
    expect(portfolio.basics.phone).toBe('+91-7878415078');
  });

  it('email is passed through unchanged', () => {
    expect(portfolio.basics.email).toBe('jinesh2025@gmail.com');
  });

  it('name is passed through unchanged', () => {
    expect(portfolio.basics.name).toBe('Jinesh Soni');
  });
});

// ─── Verify CGPA is also handled in raw V1 format (without parserToV2) ───────

describe('convertToPortfoliolyFormat V1 direct — CGPA label must be stripped', () => {
  const rawV1 = {
    basics: { name: 'Test', email: '', phone: '', title: '', location: '', summary: '', links: [] },
    experience: [],
    education: [
      {
        school: 'Some University',
        degree: 'B.Tech',
        dates: '2015-2019',
        details: ['CGPA: 8.5', 'Honors: Gold Medal'],
      },
    ],
    skills: [],
  } as any;

  const portfolio = convertToPortfoliolyFormat(rawV1);

  it('score is numeric string only', () => {
    expect(portfolio.education[0].score).toBe('8.5');
  });

  it('non-CGPA details land in highlights', () => {
    expect(portfolio.education[0].highlights).toContain('Honors: Gold Medal');
  });

  it('score does not contain "CGPA:" prefix', () => {
    expect(portfolio.education[0].score).not.toMatch(/cgpa/i);
  });
});

describe('convertToPortfoliolyFormat V1 direct — GPA: prefix also stripped', () => {
  const rawV1 = {
    basics: { name: 'Test', email: '', phone: '', title: '', location: '', summary: '', links: [] },
    experience: [],
    education: [
      {
        school: 'University',
        degree: 'B.S.',
        dates: '2016-2020',
        details: ['GPA: 3.9 / 4.0'],
      },
    ],
    skills: [],
  } as any;

  const portfolio = convertToPortfoliolyFormat(rawV1);

  it('score is just the numeric part "3.9"', () => {
    // Matches the first decimal number: 3.9
    expect(portfolio.education[0].score).toMatch(/^3\.9/);
    expect(portfolio.education[0].score).not.toMatch(/^gpa/i);
  });
});
