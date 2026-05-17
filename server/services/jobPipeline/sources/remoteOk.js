import { guessJobType } from '../classifier.js';

export const name = 'RemoteOK';
export const sourceKey = 'remoteok';

const TAGS = ['product-manager', 'product', 'pm'];

export async function fetch() {
  const seen = new Set();
  const jobs = [];

  for (const tag of TAGS) {
    try {
      const res = await globalThis.fetch(`https://remoteok.com/api?tag=${encodeURIComponent(tag)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of data.slice(1)) {
        if (!item?.id || !item?.position) continue;
        const id = `remoteok-${item.id}`;
        if (seen.has(id)) continue;
        seen.add(id);
        jobs.push({
          sourceId: id,
          title: item.position,
          company: item.company ?? '',
          location: item.location || 'Remote',
          url: item.url ?? `https://remoteok.com/remote-jobs/${item.id}`,
          salary: item.salary ?? undefined,
          jobType: guessJobType(item.position),
          tags: Array.isArray(item.tags) ? item.tags : [],
          remote: true,
          source: sourceKey,
          sourceLabel: name,
          sourcePostedAt: item.date
            ? new Date(Number(item.date) < 1e12 ? Number(item.date) * 1000 : Number(item.date))
            : undefined,
        });
      }
    } catch {}
  }

  return jobs;
}
