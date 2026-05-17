import { guessJobType } from '../classifier.js';

export const name = 'The Muse';
export const sourceKey = 'themuse';

const BASE_URL = 'https://www.themuse.com/api/public/jobs';
const RESULTS_PER_PAGE = 100;
const MAX_PAGES = 3;

// The Muse has no native freshness filter — fetch top pages and post-filter

export async function fetch() {
  const apiKey = process.env.THEMUSE_API_KEY; // optional

  const searches = [
    { category: 'Product', level: undefined },
    { category: 'Product', level: 'Entry Level' },
  ];

  const seen = new Set();
  const jobs = [];

  for (const { category, level } of searches) {
    for (let page = 0; page < MAX_PAGES; page++) {
      try {
        const params = new URLSearchParams({ category, page: String(page) });
        if (level) params.set('level', level);
        if (apiKey) params.set('api_key', apiKey);
        params.set('descending', 'true');

        const res = await globalThis.fetch(`${BASE_URL}?${params}`);
        if (!res.ok) break;

        const data = await res.json();
        const results = data.results ?? [];
        if (results.length === 0) break;

        for (const item of results) {
          const id = `themuse-${item.id}`;
          if (seen.has(id)) continue;
          seen.add(id);

          const applyUrl = item.refs?.landing_page ?? '';
          if (!applyUrl) continue;

          const location = Array.isArray(item.locations) && item.locations.length > 0
            ? item.locations[0].name
            : 'Remote';

          const level0 = Array.isArray(item.levels) && item.levels.length > 0
            ? item.levels[0].name : undefined;

          const postedAt = item.publication_date ? new Date(item.publication_date) : null;

          jobs.push({
            sourceId:      id,
            title:         item.name ?? '',
            company:       item.company?.name ?? '',
            location,
            url:           applyUrl,
            jobType:       level0?.toLowerCase().includes('intern') ? 'Internship' : guessJobType(item.name ?? ''),
            remote:        /remote/i.test(location),
            source:        sourceKey,
            sourceLabel:   name,
            sourcePostedAt: postedAt,
          });
        }
      } catch (err) {
        console.error(`[TheMuse] error page ${page}:`, err.message);
        break;
      }
    }
  }

  console.log(`[TheMuse] returned ${jobs.length} jobs`);
  return jobs;
}
