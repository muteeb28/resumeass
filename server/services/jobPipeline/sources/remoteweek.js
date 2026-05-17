// Remoteweek — DISABLED
// Reason: Aggregator site, not a primary board. RSS feed is blog-only, not jobs.
// HTML scraper returns 0 jobs (no job listings page). No public API.

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Remoteweek';
export const sourceKey = 'remoteweek';
export const disabled = true;
export const disabledReason = 'RSS is blog-only; HTML scraper returns 0 jobs; no public API';

const ATTEMPTS = [
  { url: 'https://remoteweek.io/feed/', rss: true },
  { url: 'https://remoteweek.io/jobs/', rss: false },
];

export async function fetch() {
  for (const { url, rss } of ATTEMPTS) {
    try {
      const res = await globalThis.fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const text = await res.text();
      const $ = load(text, { xmlMode: rss });
      const jobs = [];

      if (rss) {
        $('item').each((_i, el) => {
          const title = $(el).find('title').text().trim();
          const link = $(el).find('link').text().trim() || $(el).find('guid').text().trim();
          if (!title || !link) return;
          const pubDate = $(el).find('pubDate').text();
          jobs.push({
            sourceId: `remoteweek-${Buffer.from(link).toString('base64').slice(0, 22)}`,
            title,
            company: $(el).find('dc\\:creator, creator').text().trim() || 'Unknown',
            location: 'Remote',
            url: link,
            jobType: guessJobType(title),
            remote: true,
            source: sourceKey,
            sourceLabel: name,
            sourcePostedAt: pubDate ? new Date(pubDate) : undefined,
          });
        });
      } else {
        // HTML scrape
        $('[class*="job"], article').each((_i, el) => {
          const title = $(el).find('h2, h3, [class*="title"]').first().text().trim();
          const href = $(el).find('a').first().attr('href') ?? '';
          if (!title) return;
          const link = href.startsWith('http') ? href : `https://remoteweek.io${href}`;
          jobs.push({
            sourceId: `remoteweek-${Buffer.from(link || title).toString('base64').slice(0, 22)}`,
            title,
            company: 'Unknown',
            location: 'Remote',
            url: link,
            jobType: guessJobType(title),
            remote: true,
            source: sourceKey,
            sourceLabel: name,
          });
        });
      }

      if (jobs.length > 0) return jobs;
    } catch {}
  }

  return [];
}
