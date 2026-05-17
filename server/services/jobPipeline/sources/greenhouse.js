export const name = 'Greenhouse';
export const sourceKey = 'greenhouse';

const COMPANIES = [
  'notion', 'figma', 'linear', 'vercel', 'loom', 'retool',
  'stripe', 'airtable', 'miro', 'amplitude', 'mixpanel',
  'intercom', 'brex', 'rippling', 'lattice', 'productboard',
  'pendo', 'heap', 'fullstory', 'hotjar', 'appcues',
  'postman', 'hasura', 'supabase', 'planetscale', 'neon',
  'clerk', 'resend', 'atlassian', 'asana', 'hubspot',
  'zendesk', 'twilio', 'datadog', 'elastic', 'mongodb',
  'confluent', 'cloudflare', 'fastly', 'netlify', 'render',
];

const PM_RE = /product\s+manager|product\s+owner/i;

async function fetchCompany(company) {
  try {
    const res = await globalThis.fetch(
      `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    const data = await res.json();

    return (data.jobs ?? [])
      .filter(j => PM_RE.test(j.title ?? ''))
      .map(j => {
        const loc = j.location?.name ?? '';
        return {
          sourceId:      `gh-${j.id}`,
          title:         j.title,
          company:       j.company_name ?? company,
          location:      loc || 'Remote',
          url:           j.absolute_url,
          remote:        /remote/i.test(loc),
          source:        sourceKey,
          sourceLabel:   name,
          sourcePostedAt: j.updated_at ? new Date(j.updated_at)
                        : j.created_at  ? new Date(j.created_at)
                        : undefined,
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
  for (const j of jobs) byCompany[j.company] = (byCompany[j.company] ?? 0) + 1;
  console.log(`[Greenhouse] ${jobs.length} PM jobs from ${Object.keys(byCompany).length} companies:`, byCompany);

  return jobs;
}
