export const name = 'Lever';
export const sourceKey = 'lever';

const COMPANIES = [
  'aurora', 'watershed', 'anduril', 'scale-ai', 'cohere',
  'anthropic', 'mistral', 'perplexity', 'cursor', 'replit',
  'hex', 'retool', 'airplane', 'hightouch', 'census',
  'prefect', 'dagster', 'airbyte', 'fivetran', 'dbt-labs',
  'grafana', 'posthog', 'cal', 'liveblocks', 'trigger',
];

const PM_RE = /product\s+manager|product\s+owner/i;

async function fetchCompany(company) {
  try {
    const res = await globalThis.fetch(
      `https://api.lever.co/v0/postings/${company}?mode=json`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];

    const postings = await res.json();
    return postings
      .filter(j => PM_RE.test(j.text ?? ''))
      .map(j => {
        const loc = j.categories?.location ?? '';
        return {
          sourceId:      `lever-${j.id}`,
          title:         j.text,
          company:       j.company ?? company,
          location:      loc || 'Remote',
          url:           j.hostedUrl,
          remote:        j.workplaceType === 'remote' || /remote/i.test(loc),
          source:        sourceKey,
          sourceLabel:   name,
          sourcePostedAt: j.createdAt ? new Date(j.createdAt) : undefined,
        };
      });
  } catch {
    return [];
  }
}

export async function fetch() {
  // Parallel — all companies fetched simultaneously
  const results = await Promise.allSettled(COMPANIES.map(fetchCompany));
  const jobs = results.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  const byCompany = {};
  for (const j of jobs) byCompany[j.company ?? 'Unknown'] = (byCompany[j.company ?? 'Unknown'] ?? 0) + 1;
  console.log(`[Lever] ${jobs.length} PM jobs from ${Object.keys(byCompany).length} companies:`, byCompany);

  return jobs;
}
