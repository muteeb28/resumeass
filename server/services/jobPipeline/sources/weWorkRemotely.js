import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'We Work Remotely';
export const sourceKey = 'weworkremotely';

// Broad feeds — ingestion classifier handles role filtering
const FEED_URLS = [
  'https://weworkremotely.com/categories/remote-management-business-jobs.rss',
  'https://weworkremotely.com/categories/remote-product-jobs.rss',
  'https://weworkremotely.com/remote-jobs.rss',
];

function extractCompanyFromTitle(title) {
  // WWR titles are often "Company Name: Job Title"
  const colonIdx = title.indexOf(':');
  if (colonIdx > 0 && colonIdx < 60) return title.slice(0, colonIdx).trim();
  return 'Unknown';
}

function extractJobTitle(title) {
  const colonIdx = title.indexOf(':');
  if (colonIdx > 0 && colonIdx < 60) return title.slice(colonIdx + 1).trim();
  return title;
}

export async function fetch() {
  const seen = new Set();
  const jobs = [];

  for (const url of FEED_URLS) {
    try {
      const res = await globalThis.fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const xml = await res.text();
      const $ = load(xml, { xmlMode: true });

      $('item').each((_i, el) => {
        const rawTitle = $(el).find('title').text().trim();
        const link = $(el).find('link').text().trim() || $(el).find('guid').text().trim();
        if (!rawTitle || !link) return;

        const id = `wwr-${Buffer.from(link).toString('base64').slice(0, 24)}`;
        if (seen.has(id)) return;
        seen.add(id);

        const pubDate = $(el).find('pubDate').text();
        const company =
          $(el).find('dc\\:creator').text().trim() ||
          $(el).find('author').text().trim() ||
          extractCompanyFromTitle(rawTitle);
        const title = extractJobTitle(rawTitle);

        jobs.push({
          sourceId: id,
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
    } catch {}
  }

  return jobs;
}
