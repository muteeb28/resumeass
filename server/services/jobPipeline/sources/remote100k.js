// Remote100K — DISABLED
// Reason: Salary-filtered niche ($100k+ only). React SPA, no SSR data.
// No reliable postedAt. Not broadly relevant to all PM/APM seekers.

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Remote100K';
export const sourceKey = 'remote100k';
export const disabled = true;
export const disabledReason = 'salary-gated niche; React SPA; no reliable postedAt';

export async function fetch() {
  const res = await globalThis.fetch(
    'https://remote100k.com/jobs?q=product+manager',
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
        json?.props?.pageProps?.jobs ??
        json?.props?.pageProps?.listings ??
        [];
      if (items.length > 0) {
        return items.map((item) => ({
          sourceId: `remote100k-${item.id ?? item.slug}`,
          title: item.title ?? '',
          company: item.company ?? item.companyName ?? '',
          location: 'Remote',
          url: item.url ?? `https://remote100k.com/jobs/${item.id}`,
          salary: item.salary ?? undefined,
          jobType: guessJobType(item.title),
          remote: true,
          source: sourceKey,
          sourceLabel: name,
          sourcePostedAt: item.postedAt ? new Date(item.postedAt) : undefined,
        }));
      }
    } catch {}
  }

  $('[class*="job"], article, li[class*="listing"]').each((_i, el) => {
    const title = $(el).find('h2, h3, [class*="title"]').first().text().trim();
    const company = $(el).find('[class*="company"]').first().text().trim();
    const href = $(el).find('a').first().attr('href') ?? '';
    if (!title) return;
    const url = href.startsWith('http') ? href : `https://remote100k.com${href}`;
    jobs.push({
      sourceId: `remote100k-${Buffer.from(url || title).toString('base64').slice(0, 22)}`,
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
