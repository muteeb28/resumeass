import { guessJobType } from '../classifier.js';
import { INTENTS, freshnessToAdzunaDays, cutoffFromHours } from '../intentTemplates.js';

export const name = 'Adzuna';
export const sourceKey = 'adzuna';

const BASE_URL = 'https://api.adzuna.com/v1/api/jobs/us/search';
const FRESHNESS_HOURS = 48;
const RESULTS_PER_PAGE = 50;
const MAX_PAGES = 2;

export async function fetch() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn('[Adzuna] ADZUNA_APP_ID or ADZUNA_APP_KEY not set — skipping');
    return [];
  }

  const allQueries = [...INTENTS.APM_48H.queries, ...INTENTS.PM_48H.queries];
  const maxDaysOld = freshnessToAdzunaDays(FRESHNESS_HOURS);
  const cutoff = cutoffFromHours(FRESHNESS_HOURS);

  const seen = new Set();
  const jobs = [];
  let rawCount = 0;
  let datedCount = 0;
  let freshCount = 0;

  for (const query of allQueries) {
    for (let page = 1; page <= MAX_PAGES; page++) {
      try {
        const params = new URLSearchParams({
          app_id: appId,
          app_key: appKey,
          what: query,
          max_days_old: String(maxDaysOld),
          results_per_page: String(RESULTS_PER_PAGE),
          content_type: 'application/json',
        });
        const url = `${BASE_URL}/${page}?${params}`;

        console.log(`[Adzuna] fetching page ${page} for "${query}" max_days_old=${maxDaysOld}`);

        const res = await globalThis.fetch(url);
        if (!res.ok) {
          console.error(`[Adzuna] HTTP ${res.status} for "${query}" page ${page}`);
          break;
        }

        const data = await res.json();
        const results = data.results ?? [];
        rawCount += results.length;

        if (results.length === 0) break;

        for (const item of results) {
          const createdStr = item.created;
          const postedAt = createdStr ? new Date(createdStr) : null;

          if (postedAt) datedCount++;

          // strict 48h post-fetch filter — exclude jobs without a date
          if (!postedAt || postedAt.getTime() < cutoff) continue;

          freshCount++;

          const id = `adzuna-${item.id}`;
          if (seen.has(id)) continue;
          seen.add(id);

          const applyUrl = item.redirect_url ?? '';
          if (!applyUrl) continue;

          const salary = item.salary_min && item.salary_max
            ? `$${Math.round(item.salary_min / 1000)}k–$${Math.round(item.salary_max / 1000)}k`
            : undefined;

          jobs.push({
            sourceId: id,
            title: item.title ?? '',
            company: item.company?.display_name ?? '',
            location: item.location?.display_name ?? 'Remote',
            url: applyUrl,
            description: item.description ? item.description.slice(0, 500) : undefined,
            salary,
            jobType: item.contract_time
              ? item.contract_time.replace(/_/g, '-')
              : guessJobType(item.title ?? ''),
            remote: true,
            source: sourceKey,
            sourceLabel: name,
            sourcePostedAt: postedAt,
          });
        }
      } catch (err) {
        console.error(`[Adzuna] error for "${query}" page ${page}:`, err.message);
        break;
      }
    }
  }

  console.log(`[Adzuna] dry summary — raw=${rawCount} dated=${datedCount} fresh=${freshCount} returned=${jobs.length}`);
  if (jobs.length > 0) {
    console.log('[Adzuna] sample titles:', jobs.slice(0, 5).map((j) => j.title));
    if (jobs[0]) console.log('[Adzuna] sample job:', JSON.stringify(jobs[0], null, 2));
  }

  return jobs;
}
