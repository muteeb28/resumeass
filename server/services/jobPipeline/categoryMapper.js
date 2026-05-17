// Evidence-based category mapper for India-board sources.
// Returns only categories from the fixed app category set.
// When in doubt, omit the category — under-tagging beats mis-tagging.

const INTERNSHIP_RE = /\b(intern|internship|apprentice|trainee)\b/i;

const FRESHER_RE =
  /\b(fresher|fresh\s+graduate|new\s+grad(?:uate)?|entry[- ]level|campus\s+hire|early\s+career)\b/i;

// Role-based IT/Software signals — safe to match in both title and tags
const IT_SOFTWARE_ROLE_RE =
  /\b(software|developer|programmer|devops|sre\b|qa\s+(?:engineer|lead|analyst|tester)|test(?:ing)?\s+engineer|automation\s+engineer|machine\s+learning\s+engineer|ml\s+engineer|ai\s+engineer|data\s+(?:engineer|scientist|analyst)|cloud\s+(?:engineer|architect)|backend|front[- ]?end|full[- ]?stack|mobile\s+(?:developer|engineer)|android\s+(?:developer|engineer)|ios\s+(?:developer|engineer)|web\s+developer|api\s+(?:developer|engineer)|microservices|kubernetes|docker)\b/i;

// Framework/language tokens — only checked in tags[] where they are structured data,
// never in free-form titles (avoids "Spring Festival", "Rails Conductor", "React to feedback")
const IT_SOFTWARE_LANG_TAGS_RE =
  /\b(react|vue|angular|node(?:\.?js)?|python|django|flask|rails|spring|kotlin|flutter|typescript|javascript)\b/i;

// Core Engineering — physical disciplines, not software
const CORE_ENGINEERING_RE =
  /\b(mechanical\s+engineer|electrical\s+engineer|electronics\s+engineer|civil\s+engineer|manufacturing\s+engineer|hardware\s+engineer|embedded\s+(?:engineer|developer|systems))\b/i;

const DESIGN_RE =
  /\b(designer|ui\s*\/?\s*ux|ux\s+designer|ui\s+designer|product\s+design|graphic\s+design|visual\s+design)\b/i;

const SALES_RE =
  /\b(sales|marketing|growth\s+(?:hacker|manager|lead)|business\s+development|bdr\b|sdr\b|content\s+market|seo\b|digital\s+market)\b/i;

// Batch: only when year is explicitly cited alongside "batch", "class of", "graduating in", etc.
const BATCH_2025_RE =
  /\b(batch\s*2025|class\s+of\s+2025|2025\s+batch|graduating\s+in\s+2025|2025\s*(?:eligible|passout|grad(?:uate)?))\b/i;
const BATCH_2026_RE =
  /\b(batch\s*2026|class\s+of\s+2026|2026\s+batch|graduating\s+in\s+2026|2026\s*(?:eligible|passout|grad(?:uate)?))\b/i;

/**
 * Maps a raw job from any India-board source to app categories[].
 *
 * Fields read from `raw`:
 *   title, tags[], location, remote, jobType, employment_type, description
 *
 * Returns string[] — a subset of the fixed app category list.
 * May return an empty array when no evidence supports any category.
 */
export function mapToCategories(raw) {
  const cats = new Set();

  const title   = raw.title   ?? '';
  const tags    = Array.isArray(raw.tags) ? raw.tags.join(' ') : '';
  const jobType = raw.jobType ?? raw.employment_type ?? '';

  // Internship — title, jobType, or tags provide evidence
  const isIntern =
    INTERNSHIP_RE.test(title) ||
    /intern/i.test(jobType)  ||
    INTERNSHIP_RE.test(tags);
  if (isIntern) cats.add('Internship');

  // Fresher — title or tags only (description is too noisy for inference)
  if (FRESHER_RE.test(title) || FRESHER_RE.test(tags)) cats.add('Fresher');

  // Remote
  const isRemote =
    raw.remote === true ||
    /remote|worldwide|anywhere/i.test(raw.location ?? '') ||
    /remote/i.test(jobType);
  if (isRemote) cats.add('Remote');

  // Core Engineering — must match before IT/Software check to avoid overlap
  if (CORE_ENGINEERING_RE.test(title)) cats.add('Core Engineering');

  // IT/Software — role tokens checked against title+tags; language tokens checked against tags only
  if (!cats.has('Core Engineering') &&
      (IT_SOFTWARE_ROLE_RE.test(`${title} ${tags}`) || IT_SOFTWARE_LANG_TAGS_RE.test(tags))) {
    cats.add('IT/Software');
  }

  // Design
  if (DESIGN_RE.test(`${title} ${tags}`)) cats.add('Design');

  // Sales & Marketing
  if (SALES_RE.test(`${title} ${tags}`)) cats.add('Sales & Marketing');

  // Full Time — only when employment type is explicit AND the role is not an internship
  if (!isIntern && /full[- ]?time|permanent/i.test(jobType)) cats.add('Full Time');

  // Batch 2025 / 2026 — title and tags only; explicit year+batch language required
  const batchTarget = `${title} ${tags}`;
  if (BATCH_2025_RE.test(batchTarget)) cats.add('Batch 2025');
  if (BATCH_2026_RE.test(batchTarget)) cats.add('Batch 2026');

  return [...cats];
}
