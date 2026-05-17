// Instahyre — DISABLED
// Reason: India-only job board (remote=false hardcoded). No postedAt field.
// Outside product scope (ResumeAssist targets global/remote PM/APM roles).

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Instahyre';
export const sourceKey = 'instahyre';
export const disabled = true;
export const disabledReason = 'India-only; outside global/remote product scope; no postedAt';

export async function fetch() {
  const res = await globalThis.fetch(
    'https://www.instahyre.com/search-jobs/?q=associate+product+manager',
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html',
      },
    }
  );
  if (!res.ok) return [];
  const html = await res.text();
  const $ = load(html);
  const jobs = [];

  $('.job-title, .jd-header, [class*="job-card"]').each((_i, el) => {
    const titleEl = $(el).find('a.job-title-text, h2, h3, .position').first();
    const title = titleEl.text().trim();
    const company = $(el).find('.company-name, [class*="company"]').first().text().trim();
    const href =
      titleEl.attr('href') ??
      $(el).find('a').first().attr('href') ??
      '';
    if (!title) return;
    const url = href.startsWith('http') ? href : `https://www.instahyre.com${href}`;
    jobs.push({
      sourceId: `instahyre-${Buffer.from(url || title).toString('base64').slice(0, 22)}`,
      title,
      company: company || 'Unknown',
      location: 'India',
      url,
      jobType: guessJobType(title),
      remote: false,
      source: sourceKey,
      sourceLabel: name,
    });
  });

  return jobs;
}
