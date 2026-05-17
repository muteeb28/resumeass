// Virtual Vocations — DISABLED
// Reason: HTML scraper with no reliable postedAt (datetime attribute absent in practice).
// Paywalled listings behind login. Stale data common.

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Virtual Vocations';
export const sourceKey = 'virtualvocations';
export const disabled = true;
export const disabledReason = 'no reliable postedAt; paywalled listings; stale data';

export async function fetch() {
  const res = await globalThis.fetch(
    'https://www.virtualvocations.com/jobs?s=product+manager&telecommute=1',
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
  );
  if (!res.ok) return [];
  const html = await res.text();
  const $ = load(html);
  const jobs = [];

  $('.job-listing, .job-post, [class*="job-result"]').each((_i, el) => {
    const title = $(el).find('h2, h3, .job-title, [class*="title"]').first().text().trim();
    const company = $(el).find('[class*="company"], .employer').first().text().trim();
    const href = $(el).find('a').first().attr('href') ?? '';
    if (!title) return;
    const url = href.startsWith('http') ? href : `https://www.virtualvocations.com${href}`;
    const date = $(el).find('time, [class*="date"]').first().attr('datetime') ?? '';
    jobs.push({
      sourceId: `vv-${Buffer.from(url || title).toString('base64').slice(0, 22)}`,
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
