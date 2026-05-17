// Remote Impact — DISABLED
// Reason: Mission/impact-driven niche board. React SPA with no SSR data.
// Near-zero PM/APM yield. No reliable postedAt from HTML fallback.

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Remote Impact';
export const sourceKey = 'remoteimpact';
export const disabled = true;
export const disabledReason = 'mission-niche board; React SPA; near-zero PM/APM yield; no reliable postedAt';

const ATTEMPTS = [
  'https://www.remoteimpact.io/jobs?q=product',
  'https://remoteimpact.io/jobs?q=product+manager',
  'https://remoteimpact.io/',
];

export async function fetch() {
  for (const url of ATTEMPTS) {
    try {
      const res = await globalThis.fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
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
              sourceId: `remoteimpact-${item.id ?? item.slug}`,
              title: item.title ?? '',
              company: item.company ?? item.org ?? '',
              location: 'Remote',
              url: item.url ?? `https://remoteimpact.io/job/${item.id}`,
              jobType: guessJobType(item.title),
              remote: true,
              source: sourceKey,
              sourceLabel: name,
              sourcePostedAt: item.postedAt ? new Date(item.postedAt) : undefined,
            }));
          }
        } catch {}
      }

      $('[class*="job"], [class*="listing"], article').each((_i, el) => {
        const title = $(el).find('h2, h3, [class*="title"]').first().text().trim();
        const company = $(el).find('[class*="company"], [class*="org"]').first().text().trim();
        const href = $(el).find('a').first().attr('href') ?? '';
        if (!title) return;
        const jobUrl = href.startsWith('http') ? href : `https://remoteimpact.io${href}`;
        jobs.push({
          sourceId: `remoteimpact-${Buffer.from(jobUrl || title).toString('base64').slice(0, 22)}`,
          title,
          company: company || 'Unknown',
          location: 'Remote',
          url: jobUrl,
          jobType: guessJobType(title),
          remote: true,
          source: sourceKey,
          sourceLabel: name,
        });
      });

      if (jobs.length > 0) return jobs;
    } catch {}
  }

  return [];
}
