// Built In — DISABLED
// Reason: React SPA. HTML job cards are rendered client-side; server-side response
// contains no job data. No stable JSON endpoint confirmed. No postedAt in static HTML.
// Re-enable in Phase 3 if a stable JSON/API endpoint is found.

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Built In';
export const sourceKey = 'builtin';
export const disabled = true;
export const disabledReason = 'React SPA — no SSR job data; HTML scraper returns 0 jobs; no postedAt';

export async function fetch() {
  const res = await globalThis.fetch(
    'https://builtin.com/jobs/remote/product',
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
  );
  if (!res.ok) return [];
  const html = await res.text();
  const $ = load(html);
  const jobs = [];

  // Built In uses data attributes on job cards
  $('[data-id], .job-bounded-responsively, [class*="JobCard"], [class*="job-card"]').each((_i, el) => {
    const title = $(el).find('h2, h3, [class*="title"]').first().text().trim();
    const company = $(el).find('.company-title, .employer-name, [class*="company"], [class*="employer"]').first().text().trim();
    const href = $(el).find('a').first().attr('href') ?? '';
    const url = href.startsWith('http') ? href : `https://builtin.com${href}`;
    if (!title) return;
    const date = $(el).find('[class*="date"], time').first().attr('datetime') ?? '';

    // Use a composite ID base to ensure uniqueness even if Built In's data-id is generic
    const idBase = `${title}|${company}|${url}`;
    console.log(`[Built In Debug] Found: "${title}" at "${company}" (URL: ${url})`);
    
    jobs.push({
      sourceId: `builtin-${Buffer.from(idBase).toString('base64').slice(0, 32)}`,
      title,
      company: company || 'Unknown',
      location: 'Remote',
      url,
      jobType: guessJobType(title),
      remote: true,
      source: sourceKey,
      sourceLabel: name,
      sourcePostedAt: date ? new Date(date) : undefined,
    });
  });

  return jobs;
}
