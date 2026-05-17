// Skillsire — DISABLED
// Reason: Obscure board with near-zero PM/APM yield. React SPA.
// No reliable postedAt. Not worth ingestion budget.

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Skillsire';
export const sourceKey = 'skillsire';
export const disabled = true;
export const disabledReason = 'obscure board; near-zero PM/APM yield; React SPA; no reliable postedAt';

export async function fetch() {
  const res = await globalThis.fetch(
    'https://skillsire.com/jobs?q=product+manager',
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
          sourceId: `skillsire-${item.id}`,
          title: item.title ?? '',
          company: item.company ?? '',
          location: item.location || 'Remote',
          url: item.url ?? `https://skillsire.com/jobs/${item.id}`,
          jobType: guessJobType(item.title),
          remote: true,
          source: sourceKey,
          sourceLabel: name,
          sourcePostedAt: item.postedAt ? new Date(item.postedAt) : undefined,
        }));
      }
    } catch {}
  }

  $('[class*="job"], article, li[class*="job"]').each((_i, el) => {
    const title = $(el).find('h2, h3, [class*="title"]').first().text().trim();
    const company = $(el).find('[class*="company"]').first().text().trim();
    const href = $(el).find('a').first().attr('href') ?? '';
    if (!title) return;
    const url = href.startsWith('http') ? href : `https://skillsire.com${href}`;
    jobs.push({
      sourceId: `skillsire-${Buffer.from(url || title).toString('base64').slice(0, 22)}`,
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
