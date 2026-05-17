// StillHiring Today — DISABLED
// Reason: No reliable postedAt field. Jobs are company-self-reported with no
// standardized date. Near-zero fresh PM/APM yield after 48h filter.

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'StillHiring Today';
export const sourceKey = 'stillhiring';
export const disabled = true;
export const disabledReason = 'no reliable postedAt; near-zero fresh PM/APM yield';

export async function fetch() {
  const res = await globalThis.fetch(
    'https://stillhiring.today/?q=product+manager',
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
      const items = json?.props?.pageProps?.jobs ?? json?.props?.pageProps?.listings ?? [];
      if (items.length > 0) {
        return items.map((item) => ({
          sourceId: `stillhiring-${item.id ?? item.slug}`,
          title: item.title ?? item.position ?? '',
          company: item.company ?? item.companyName ?? '',
          location: item.location || 'Remote',
          url: item.url ?? item.applyUrl ?? `https://stillhiring.today/job/${item.id}`,
          jobType: guessJobType(item.title ?? item.position),
          remote: true,
          source: sourceKey,
          sourceLabel: name,
          sourcePostedAt: item.postedAt ?? item.date ? new Date(item.postedAt ?? item.date) : undefined,
        }));
      }
    } catch {}
  }

  $('[class*="job"], [class*="listing"], article').each((_i, el) => {
    const title = $(el).find('h2, h3, [class*="title"], [class*="position"]').first().text().trim();
    const company = $(el).find('[class*="company"]').first().text().trim();
    const href = $(el).find('a').first().attr('href') ?? '';
    if (!title) return;
    const url = href.startsWith('http') ? href : `https://stillhiring.today${href}`;
    jobs.push({
      sourceId: `stillhiring-${Buffer.from(url || title).toString('base64').slice(0, 22)}`,
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
