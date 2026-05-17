import { PM_KEYWORDS, PM_REJECT_KEYWORDS, ROLE_TYPE } from './constants.js';

/**
 * Normalizes text for comparison by lowercasing, removing special characters,
 * and collapsing whitespace.
 */
export function normalizeText(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Classifies a job role based on its title.
 * Returns ROLE_TYPE.APM, ROLE_TYPE.PM, or null if it doesn't match.
 */
const APM_SIGNALS = [
  'associate product manager',
  'junior product manager',
  'entry level product manager',
  'entry-level product manager',
  'rotational product manager',
  'rpm program',
  'apm program',
  'new grad product manager',
];

const APM_TECH_SIGNALS = [
  'apm - observability',
  'apm observability',
  'application performance monitoring',
  'application performance management',
  'observability platform',
];

const INTERN_SIGNALS = /\b(intern|internship|trainee|apprentice)\b/i;

export function classifyRoleType(title = '', description = '') {
  const normalTitle = normalizeText(title);
  const normalDesc = normalizeText(description);

  // Internship check runs FIRST — "Product Manager Intern" is INTERN not PM
  if (INTERN_SIGNALS.test(title)) return ROLE_TYPE.INTERN;

  const hasApmWord = /\bapm\b/.test(normalTitle);
  const hasOtherPM = PM_KEYWORDS.filter(k => k !== 'apm').some(k => normalTitle.includes(k));

  const hasPMSignal = hasApmWord || hasOtherPM;
  if (!hasPMSignal) return null;

  const hasRejected = PM_REJECT_KEYWORDS.some(k =>
    normalTitle.includes(k) && !normalTitle.includes('product')
  );
  if (hasRejected) return null;

  // Exclusion for technical APM (monitoring/observability)
  const isTechAPM = APM_TECH_SIGNALS.some(s =>
    normalTitle.includes(s) || normalDesc.includes(s)
  );
  if (isTechAPM) return ROLE_TYPE.PM;

  // Tightened APM program/role detection
  let isAPM = APM_SIGNALS.some(s => normalTitle.includes(s));
  
  if (!isAPM && hasApmWord) {
    // Only count standalone "apm" if context confirms it's a role/program
    isAPM = normalDesc.includes('associate product manager') ||
            normalDesc.includes('entry level') ||
            normalDesc.includes('rotational') ||
            normalDesc.includes('new grad');
  }

  return isAPM ? ROLE_TYPE.APM : ROLE_TYPE.PM;
}

/**
 * Guesses the job type (Full-time, Internship, etc.) from the title.
 */
export function guessJobType(title = '') {
  const t = title.toLowerCase();
  if (t.includes('intern')) return 'Internship';
  if (t.includes('contract')) return 'Contract';
  if (t.includes('part time') || t.includes('part-time')) return 'Part-time';
  return 'Full-time';
}
