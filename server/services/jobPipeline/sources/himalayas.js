import { guessJobType } from '../classifier.js';

export const name = 'Himalayas';
export const sourceKey = 'himalayas';

export async function fetch() {
  const res = await globalThis.fetch(
    'https://himalayas.app/jobs/api/search?q=product+manager&limit=50',
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.jobs ?? []).map((item) => {
    const rawDate = item.pub_date ?? item.pubDate ?? item.publishedAt ?? null;
    return {
      sourceId: `himalayas-${item.id ?? item.slug ?? Math.random().toString(36).slice(2)}`,
      title: item.title ?? '',
      company: item.company_name ?? item.companyName ?? '',
      location: item.location || 'Remote',
      url: item.applicationUrl ?? item.application_url ?? item.url ?? '',
      salary: item.salary ?? undefined,
      jobType: item.jobType ?? item.job_type ?? guessJobType(item.title),
      tags: Array.isArray(item.tags) ? item.tags : [],
      remote: true,
      source: sourceKey,
      sourceLabel: name,
      sourcePostedAt: rawDate 
        ? new Date(Number(rawDate) < 1e11 ? Number(rawDate) * 1000 : Number(rawDate))
        : undefined,
    };
  });
}
