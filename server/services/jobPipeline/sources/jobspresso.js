import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Jobspresso';
export const sourceKey = 'jobspresso';

const FEEDS = [
  'https://jobspresso.co/feed/?post_type=job_listing',
  'https://jobspresso.co/feed/',
];

export async function fetch() {
  for (const url of FEEDS) {
    try {
      const res = await globalThis.fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const xml = await res.text();
      const $ = load(xml, { xmlMode: true });
      const jobs = [];

      $('item').each((_i, el) => {
        const title = $(el).find('title').text().trim();
        const link = $(el).find('link').text().trim() || $(el).find('guid').text().trim();
        if (!title || !link) return;
        const pubDate = $(el).find('pubDate').text();
        const company =
          $(el).find('dc\\:creator, creator').text().trim() || 'Unknown';
        jobs.push({
          sourceId: `jobspresso-${Buffer.from(link).toString('base64').slice(0, 22)}`,
          title,
          company,
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
  return [];
}
