// Jobgether — DISABLED
// Reason: React SPA, no SSR data. __NEXT_DATA__ path is empty (pageProps.jobs = undefined).
// HTML fallback returns 0 jobs. No public API or RSS feed available.
// Re-enable only if a stable JSON endpoint is discovered.

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Jobgether';
export const sourceKey = 'jobgether';
export const disabled = true;
export const disabledReason = 'React SPA — no SSR data; HTML fallback returns 0 jobs';

export async function fetch() {
  const res = await globalThis.fetch(
    'https://jobgether.com/jobs?categories=product&remote=true',
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
  );
  if (!res.ok) return [];
  const html = await res.text();
  const $ = load(html);
  const jobs = [];

  // Try __NEXT_DATA__
  const nd = $('#__NEXT_DATA__').html();
  if (nd) {
    try {
      const json = JSON.parse(nd);
      const items =
        json?.props?.pageProps?.jobs ??
        json?.props?.pageProps?.jobOffers ??
        [];
      if (items.length > 0) {
        return items.map((item) => ({
          sourceId: `jobgether-${item.id}`,
          title: item.title ?? '',
          company: item.company?.name ?? item.companyName ?? '',
          location: item.location || 'Remote',
          url: item.url ?? `https://jobgether.com/offer/${item.id}`,
          jobType: guessJobType(item.title),
          remote: true,
          source: sourceKey,
          sourceLabel: name,
          sourcePostedAt: item.publishedAt ? new Date(item.publishedAt) : undefined,
        }));
      }
    } catch {}
  }

  $('.job-list [class*="job"], .job-list [class*="offer"], article.job-card').each((_i, el) => {
    const title = $(el).find('h2, h3, [class*="title"]').first().text().trim();
    const company = $(el).find('[class*="company"]').first().text().trim();
    const href = $(el).find('a').first().attr('href') ?? '';
    if (!title) return;
    const url = href.startsWith('http') ? href : `https://jobgether.com${href}`;
    jobs.push({
      sourceId: `jobgether-${Buffer.from(url || title).toString('base64').slice(0, 22)}`,
      title,
      company: company || 'Unknown',
      location: 'Remote',
      url,
      jobType: guessJobType(title),
      remote: true,
      source: sourceKey,
      sourceLabel: name,
    });
  });

  return jobs;
}
