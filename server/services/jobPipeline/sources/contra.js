// Contra — DISABLED
// Reason: Freelance/independent contractor platform. Job category is wrong for PM/APM.
// React SPA with no SSR data. Even if scraped, near-zero PM/APM yield.

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Contra';
export const sourceKey = 'contra';
export const disabled = true;
export const disabledReason = 'freelance platform — wrong job category for PM/APM; React SPA';

export async function fetch() {
  const res = await globalThis.fetch(
    'https://contra.com/opportunity?search=product+manager&remote=true',
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
  );
  if (!res.ok) return [];
  const html = await res.text();
  const $ = load(html);
  const jobs = [];

  const nd = $('#__NEXT_DATA__').html();
  if (nd) {
    try {
      const json = JSON.parse(nd);
      const items =
        json?.props?.pageProps?.opportunities ??
        json?.props?.pageProps?.jobs ??
        [];
      if (items.length > 0) {
        return items.map((item) => ({
          sourceId: `contra-${item.id}`,
          title: item.title ?? item.name ?? '',
          company: item.company?.name ?? item.employer?.name ?? 'Independent',
          location: 'Remote',
          url: item.url ?? `https://contra.com/opportunity/${item.slug ?? item.id}`,
          jobType: guessJobType(item.title ?? item.name),
          remote: true,
          source: sourceKey,
          sourceLabel: name,
          sourcePostedAt: item.createdAt ? new Date(item.createdAt) : undefined,
        }));
      }
    } catch {}
  }

  $('[class*="opportunity"], [class*="job"], [class*="gig"]').each((_i, el) => {
    const title = $(el).find('h2, h3, [class*="title"]').first().text().trim();
    const href = $(el).find('a').first().attr('href') ?? '';
    if (!title) return;
    const url = href.startsWith('http') ? href : `https://contra.com${href}`;
    jobs.push({
      sourceId: `contra-${Buffer.from(url || title).toString('base64').slice(0, 22)}`,
      title,
      company: 'Independent',
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
