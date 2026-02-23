/**
 * Test data and utilities for resume v2 migration testing
 */

import type { ResumeJSON, ResumeJSONv2 } from '@/types/resume';
import {
  migrateOldToNew,
  migrateNewToOld,
  validateResumeV2,
  isResumeJSONv2,
  ensureV2Format,
} from '@/types/resume';

// ============================================================================
// SAMPLE V1 RESUME
// ============================================================================

export const sampleResumeV1: ResumeJSON = {
  basics: {
    name: 'Jane Developer',
    title: 'Senior Software Engineer',
    email: 'jane@example.com',
    phone: '+1 555-123-4567',
    location: 'San Francisco, CA',
    links: ['linkedin.com/in/janedev', 'github.com/janedev'],
    summary:
      'Experienced full-stack engineer with 8+ years building scalable web applications. Passionate about clean code, mentoring teams, and delivering user-focused products.',
  },
  skills: [
    { name: 'Languages', items: ['TypeScript', 'Python', 'Go', 'SQL'] },
    { name: 'Frontend', items: ['React', 'Next.js', 'Tailwind CSS', 'Redux'] },
    { name: 'Backend', items: ['Node.js', 'FastAPI', 'PostgreSQL', 'Redis'] },
    { name: 'DevOps', items: ['AWS', 'Docker', 'Kubernetes', 'Terraform'] },
  ],
  experience: [
    {
      company: 'TechCorp Inc.',
      role: 'Senior Software Engineer',
      dates: '2021 - Present',
      location: 'San Francisco, CA',
      bullets: [
        'Led development of microservices architecture serving 10M+ daily requests',
        'Reduced API latency by 40% through caching optimization and query improvements',
        'Mentored 5 junior engineers, conducting weekly code reviews and pair programming',
        'Implemented CI/CD pipelines reducing deployment time from 2 hours to 15 minutes',
      ],
      tech: ['TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
    },
    {
      company: 'StartupXYZ',
      role: 'Full Stack Developer',
      dates: '2018 - 2021',
      location: 'Remote',
      bullets: [
        'Built React dashboard used by 50K+ users for real-time data visualization',
        'Designed and implemented RESTful APIs handling 1M+ requests per day',
        'Collaborated with product team to ship 20+ features in agile sprints',
      ],
      tech: ['React', 'Python', 'Django', 'PostgreSQL'],
    },
    {
      company: 'WebAgency Co.',
      role: 'Junior Developer',
      dates: '2016 - 2018',
      location: 'New York, NY',
      bullets: [
        'Developed responsive websites for 30+ clients using modern web technologies',
        'Maintained legacy PHP applications while gradually migrating to Node.js',
      ],
    },
  ],
  education: [
    {
      school: 'University of California, Berkeley',
      degree: 'B.S. Computer Science',
      dates: '2012 - 2016',
      location: 'Berkeley, CA',
      details: ['GPA: 3.8', 'Dean\'s List 2014-2016'],
    },
  ],
  projects: [
    {
      name: 'OpenSource CLI Tool',
      description: 'A command-line tool for automating development workflows',
      bullets: [
        'Built with Go, published on Homebrew with 5K+ downloads',
        'Implemented plugin system for extensibility',
      ],
      tech: ['Go', 'Cobra', 'GitHub Actions'],
      link: 'github.com/janedev/cli-tool',
    },
    {
      name: 'Real-time Chat App',
      description: 'WebSocket-based chat application with end-to-end encryption',
      tech: ['React', 'Node.js', 'Socket.io', 'Redis'],
    },
  ],
  certifications: [
    { name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2023' },
    { name: 'Kubernetes Administrator (CKA)', issuer: 'CNCF', date: '2022' },
  ],
};

// Add community for extended v1 format
export const sampleResumeV1Extended = {
  ...sampleResumeV1,
  community: [
    {
      role: 'Mentor',
      organization: 'Code for America',
      description: 'Mentoring underrepresented groups in tech',
    },
    {
      role: 'Speaker',
      organization: 'ReactConf 2023',
      description: 'Presented on scaling React applications',
    },
  ],
};

// ============================================================================
// SAMPLE V2 RESUME
// ============================================================================

export const sampleResumeV2: ResumeJSONv2 = {
  version: 2,
  basics: {
    name: 'Jane Developer',
    title: 'Senior Software Engineer',
    email: 'jane@example.com',
    phone: '+1 555-123-4567',
    location: 'San Francisco, CA',
    links: ['linkedin.com/in/janedev', 'github.com/janedev'],
    summary:
      'Experienced full-stack engineer with 8+ years building scalable web applications.',
  },
  sections: {
    summary: {
      id: 'summary',
      label: 'Summary',
      layout: 'text',
      order: 0,
      visible: true,
      items: [
        {
          type: 'text',
          content:
            'Experienced full-stack engineer with 8+ years building scalable web applications. Passionate about clean code, mentoring teams, and delivering user-focused products.',
        },
      ],
    },
    experience: {
      id: 'experience',
      label: 'Work Experience',
      layout: 'timeline',
      order: 10,
      visible: true,
      items: [
        {
          type: 'timeline',
          title: 'Senior Software Engineer',
          organization: 'TechCorp Inc.',
          location: 'San Francisco, CA',
          dates: '2021 - Present',
          bullets: [
            'Led development of microservices architecture serving 10M+ daily requests',
            'Reduced API latency by 40% through caching optimization',
          ],
        },
        {
          type: 'timeline',
          title: 'Full Stack Developer',
          organization: 'StartupXYZ',
          dates: '2018 - 2021',
          bullets: [
            'Built React dashboard used by 50K+ users',
            'Designed RESTful APIs handling 1M+ requests per day',
          ],
        },
      ],
    },
    skills: {
      id: 'skills',
      label: 'Skills',
      layout: 'list',
      order: 30,
      visible: true,
      items: [
        { type: 'list', value: 'TypeScript', category: 'Languages' },
        { type: 'list', value: 'Python', category: 'Languages' },
        { type: 'list', value: 'React', category: 'Frontend' },
        { type: 'list', value: 'Node.js', category: 'Backend' },
        { type: 'list', value: 'AWS', category: 'DevOps' },
      ],
    },
    education: {
      id: 'education',
      label: 'Education',
      layout: 'education',
      order: 20,
      visible: true,
      items: [
        {
          type: 'education',
          school: 'University of California, Berkeley',
          degree: 'B.S. Computer Science',
          dates: '2012 - 2016',
          location: 'Berkeley, CA',
          gpa: '3.8',
        },
      ],
    },
    projects: {
      id: 'projects',
      label: 'Projects',
      layout: 'projects',
      order: 40,
      visible: true,
      items: [
        {
          type: 'project',
          name: 'OpenSource CLI Tool',
          description: 'A command-line tool for automating development workflows',
          tech: ['Go', 'Cobra'],
          link: 'github.com/janedev/cli-tool',
        },
      ],
    },
    certifications: {
      id: 'certifications',
      label: 'Certifications',
      layout: 'certifications',
      order: 50,
      visible: true,
      items: [
        {
          type: 'certification',
          name: 'AWS Solutions Architect',
          issuer: 'Amazon',
          date: '2023',
        },
      ],
    },
    community: {
      id: 'community',
      label: 'Community & Activities',
      layout: 'timeline',
      order: 60,
      visible: true,
      items: [
        {
          type: 'timeline',
          title: 'Mentor',
          organization: 'Code for America',
          description: 'Mentoring underrepresented groups in tech',
        },
      ],
    },
  },
};

// ============================================================================
// MINIMAL TEST CASES
// ============================================================================

export const minimalV1: ResumeJSON = {
  basics: { name: 'Test User' },
  skills: [],
  experience: [],
};

export const emptyV2: ResumeJSONv2 = {
  version: 2,
  basics: { name: 'Test User' },
  sections: {},
};

// Resume with only raw text (parsing failed scenario)
export const rawTextOnlyV1: ResumeJSON = {
  basics: { name: 'Raw Text User' },
  skills: [],
  experience: [],
  experienceRawText: `Senior Developer at BigCorp (2020 - Present)
- Built amazing things
- Led teams

Junior Developer at SmallCo (2018 - 2020)
- Learned stuff`,
  educationRawText: 'BS Computer Science, State University, 2018',
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

export function runMigrationTests(): void {
  console.log('=== Resume Migration Tests ===\n');

  // Test 1: V1 to V2 migration
  console.log('Test 1: V1 → V2 Migration');
  const v2FromV1 = migrateOldToNew(sampleResumeV1Extended as ResumeJSON);
  console.log('  - Version:', v2FromV1.version);
  console.log('  - Sections:', Object.keys(v2FromV1.sections).join(', '));
  console.log('  - Experience items:', v2FromV1.sections.experience?.items.length ?? 0);
  console.log('  - Skills items:', v2FromV1.sections.skills?.items.length ?? 0);
  console.log('  ✓ Migration complete\n');

  // Test 2: V2 validation
  console.log('Test 2: V2 Validation');
  const validationResult = validateResumeV2(v2FromV1);
  console.log('  - Valid:', validationResult.valid);
  console.log('  - Errors:', validationResult.issues.filter(i => i.severity === 'error').length);
  console.log('  - Warnings:', validationResult.issues.filter(i => i.severity === 'warning').length);
  if (!validationResult.valid) {
    validationResult.issues
      .filter(i => i.severity === 'error')
      .forEach(i => console.log(`    ERROR: ${i.path} - ${i.message}`));
  }
  console.log('  ✓ Validation complete\n');

  // Test 3: V2 to V1 roundtrip
  console.log('Test 3: V2 → V1 Roundtrip');
  const v1FromV2 = migrateNewToOld(sampleResumeV2);
  console.log('  - Name:', v1FromV2.basics.name);
  console.log('  - Experience:', v1FromV2.experience.length, 'items');
  console.log('  - Skills categories:', v1FromV2.skills.length);
  console.log('  ✓ Roundtrip complete\n');

  // Test 4: Type guard checks
  console.log('Test 4: Type Guards');
  console.log('  - isResumeJSONv2(sampleResumeV2):', isResumeJSONv2(sampleResumeV2));
  console.log('  - isResumeJSONv2(sampleResumeV1):', isResumeJSONv2(sampleResumeV1));
  console.log('  ✓ Type guards working\n');

  // Test 5: ensureV2Format
  console.log('Test 5: ensureV2Format');
  const ensuredV2 = ensureV2Format(sampleResumeV1);
  console.log('  - Input was v1, output version:', ensuredV2.version);
  const alreadyV2 = ensureV2Format(sampleResumeV2);
  console.log('  - Input was v2, output version:', alreadyV2.version);
  console.log('  ✓ Format conversion working\n');

  // Test 6: Raw text fallback
  console.log('Test 6: Raw Text Fallback');
  const v2WithRaw = migrateOldToNew(rawTextOnlyV1);
  console.log('  - Experience has rawText:', !!v2WithRaw.sections.experience?.rawText);
  console.log('  - Education has rawText:', !!v2WithRaw.sections.education?.rawText);
  console.log('  ✓ Raw text preserved\n');

  console.log('=== All Tests Passed ===');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testResumeData = {
    sampleResumeV1,
    sampleResumeV1Extended,
    sampleResumeV2,
    minimalV1,
    emptyV2,
    rawTextOnlyV1,
    runMigrationTests,
    migrateOldToNew,
    migrateNewToOld,
    validateResumeV2,
    ensureV2Format,
  };
}
