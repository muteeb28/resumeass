import { guessJobType } from '../classifier.js';

export const name = 'Working Nomads';
export const sourceKey = 'workingnomads';

const ENDPOINTS = [
  // Public exposed jobs endpoint (no auth, paginated)
  'https://www.workingnomads.com/api/exposed_jobs/?category=management&limit=100',
  'https://www.workingnomads.com/api/exposed_jobs/?limit=100',
];

export async function fetch() {
  for (const url of ENDPOINTS) {
    try {
      const res = await globalThis.fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(25000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.jobs ?? data.results ?? []);
      if (items.length === 0) continue;

      return items.map((item) => ({
        sourceId: `workingnomads-${item.id}`,
        title: item.title ?? '',
        company: item.company_name ?? item.company ?? '',
        location: item.location || 'Remote',
        url: item.url ?? `https://www.workingnomads.com/jobs/${item.id}`,
        jobType: guessJobType(item.title),
        tags: Array.isArray(item.tags) ? item.tags : [],
        remote: true,
        source: sourceKey,
        sourceLabel: name,
        sourcePostedAt: item.pub_date ? new Date(item.pub_date) : undefined,
      }));
    } catch {}
  }

  return [];
}
