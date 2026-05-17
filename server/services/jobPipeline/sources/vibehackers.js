// VibeHackers — DISABLED
// Reason: No reliable postedAt field. React SPA with near-zero PM/APM yield.
// Obscure board; not worth ingestion budget.

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'VibeHackers';
export const sourceKey = 'vibehackers';
export const disabled = true;
export const disabledReason = 'no reliable postedAt; near-zero PM/APM yield; React SPA';

export async function fetch() {
  const res = await globalThis.fetch(
    'https://vibehackers.io/jobs?q=product+manager',
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
      const items = json?.props?.pageProps?.jobs ?? [];
      if (items.length > 0) {
        return items.map((item) => ({
          sourceId: `vibehackers-${item.id}`,
          title: item.title ?? '',
          company: item.company ?? '',
          location: item.location || 'Remote',
          url: item.url ?? `https://vibehackers.io/jobs/${item.id}`,
          jobType: guessJobType(item.title),
          remote: true,
          source: sourceKey,
          sourceLabel: name,
          sourcePostedAt: item.postedAt ? new Date(item.postedAt) : undefined,
        }));
      }
    } catch {}
  }

  $('[class*="job"], article').each((_i, el) => {
    const title = $(el).find('h2, h3, [class*="title"]').first().text().trim();
    const company = $(el).find('[class*="company"]').first().text().trim();
    const href = $(el).find('a').first().attr('href') ?? '';
    if (!title) return;
    const url = href.startsWith('http') ? href : `https://vibehackers.io${href}`;
    jobs.push({
      sourceId: `vibehackers-${Buffer.from(url || title).toString('base64').slice(0, 22)}`,
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
