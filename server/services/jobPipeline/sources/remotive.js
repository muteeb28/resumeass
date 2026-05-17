import { guessJobType } from '../classifier.js';

export const name = 'Remotive';
export const sourceKey = 'remotive';

export async function fetch() {
  const queries = ['associate product manager', 'product manager'];
  const seen = new Set();
  const jobs = [];

  for (const q of queries) {
    const res = await globalThis.fetch(
      `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(q)}&limit=100`
    );
    if (!res.ok) continue;
    const data = await res.json();

    for (const item of data.jobs ?? []) {
      const id = `remotive-${item.id}`;
      if (seen.has(id)) continue;
      seen.add(id);

      jobs.push({
        sourceId: id,
        title: item.title ?? '',
        company: item.company_name ?? '',
        location: item.candidate_required_location || 'Remote',
        url: item.url ?? '',
        description: item.description ? item.description.slice(0, 500) : undefined,
        salary: item.salary ?? undefined,
        jobType: item.job_type || guessJobType(item.title),
        tags: Array.isArray(item.tags) ? item.tags : [],
        remote: true,
        source: sourceKey,
        sourceLabel: name,
        sourcePostedAt: item.publication_date ? new Date(item.publication_date) : undefined,
      });
    }
  }

  return jobs;
}
