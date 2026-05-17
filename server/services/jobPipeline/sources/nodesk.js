// NoDesk — DISABLED
// Reason: RSS feeds return general remote jobs, near-zero PM/APM yield.
// No reliable postedAt in HTML fallback. Not worth ingestion budget.
// Re-enable only if RSS feed proves stable and PM yield > 2 fresh jobs/run.

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'NoDesk';
export const sourceKey = 'nodesk';
export const disabled = true;
export const disabledReason = 'near-zero PM/APM yield; no reliable postedAt in HTML fallback';

const FEEDS = [
  'https://nodesk.co/remote-jobs/product-manager/feed/',
  'https://nodesk.co/remote-jobs/feed/',
  'https://nodesk.co/feed/',
  'https://nodesk.co/remote-jobs/?feed=rss2',
];

const PAGES = [
  'https://nodesk.co/remote-jobs/product-manager/',
  'https://nodesk.co/remote-jobs/?search=product+manager',
];

export async function fetch() {
  // Try RSS feeds first
  for (const url of FEEDS) {
    try {
      const res = await globalThis.fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const xml = await res.text();
      if (!xml.includes('<item>') && !xml.includes('<entry>')) continue;
      const $ = load(xml, { xmlMode: true });
      const jobs = [];

      $('item, entry').each((_i, el) => {
        const title = $(el).find('title').text().trim();
        const link =
          $(el).find('link').text().trim() ||
          $(el).find('guid').text().trim() ||
          ($(el).find('link').attr('href') ?? '');
        if (!title || !link) return;
        const pubDate = $(el).find('pubDate, published, updated').text();
        jobs.push({
          sourceId: `nodesk-${Buffer.from(link).toString('base64').slice(0, 24)}`,
          title,
          company: $(el).find('dc\\:creator, creator, author name').text().trim() || 'Unknown',
          location: 'Remote',
          url: link,
          jobType: guessJobType(title),
          remote: true,
          source: sourceKey,
          sourceLabel: name,
          sourcePostedAt: pubDate ? new Date(pubDate) : undefined,
        });
      });

      if (jobs.length > 0) return jobs;
    } catch {}
  }

  // Fallback: HTML listing pages
  for (const url of PAGES) {
    try {
      const res = await globalThis.fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = load(html);
      const jobs = [];

      $('.jobs article, .jobs .job, .job-listings article').each((_i, el) => {
        const titleEl = $(el).find('h2 a, h3 a, .job-title a').first();
        const title = titleEl.text().trim() || $(el).find('h2, h3').first().text().trim();
        const href = titleEl.attr('href') ?? $(el).find('a').first().attr('href') ?? '';
        if (!title) return;
        const url = href.startsWith('http') ? href : `https://nodesk.co${href}`;
        jobs.push({
          sourceId: `nodesk-${Buffer.from(url || title).toString('base64').slice(0, 24)}`,
          title,
          company: $(el).find('[class*="company"], .company').first().text().trim() || 'Unknown',
          location: 'Remote',
          url,
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
