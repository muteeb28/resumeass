import { guessJobType } from '../classifier.js';

export const name = 'Jobicy';
export const sourceKey = 'jobicy';

const TAGS = ['product', 'product-management', 'product-manager'];

export async function fetch() {
  const seen = new Set();
  const jobs = [];

  for (const tag of TAGS) {
    try {
      const res = await globalThis.fetch(
        `https://jobicy.com/api/v2/remote-jobs?count=100&tag=${tag}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of data.jobs ?? []) {
        const id = `jobicy-${item.id}`;
        if (seen.has(id)) continue;
        seen.add(id);
        jobs.push({
          sourceId: id,
          title: item.jobTitle ?? '',
          company: item.companyName ?? '',
          location: item.jobGeo || 'Remote',
          url: item.url ?? `https://jobicy.com/jobs/${item.jobSlug}`,
          salary: item.annualSalaryMin
            ? `$${item.annualSalaryMin}–${item.annualSalaryMax}`
            : undefined,
          jobType: item.jobType?.[0] ?? guessJobType(item.jobTitle),
          tags: Array.isArray(item.jobIndustry) ? item.jobIndustry : [],
          remote: true,
          source: sourceKey,
          sourceLabel: name,
          sourcePostedAt: item.pubDate ? new Date(item.pubDate) : undefined,
        });
      }
    } catch {}
  }

  return jobs;
}
