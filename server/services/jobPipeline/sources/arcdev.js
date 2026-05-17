import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Arc.dev';
export const sourceKey = 'arcdev';

const SEARCH_QUERIES = ['product+manager', 'associate+product+manager'];

function parseNextData(json) {
  // Walk the common paths Arc.dev uses — add more if structure changes
  const candidates = [
    json?.props?.pageProps?.arcJobs,
    json?.props?.pageProps?.externalJobs,
    json?.props?.pageProps?.jobs,
    json?.props?.pageProps?.jobListings,
    json?.props?.pageProps?.initialJobs,
    json?.props?.pageProps?.data?.jobs,
    json?.props?.pageProps?.dehydratedState?.queries?.[0]?.state?.data?.jobs,
  ];
  
  // Flatten all arrays found
  const result = [];
  for (const c of candidates) {
    if (Array.isArray(c)) result.push(...c);
  }
  return result.length > 0 ? result : null;
}

function mapItem(item) {
  const slug = item.slug ?? item.id ?? item.urlString ?? item.randomKey;
  const url = item.url ?? item.applyUrl ?? (item.urlString ? (item.urlString.startsWith('http') ? item.urlString : `https://arc.dev/remote-jobs/${item.urlString}`) : `https://arc.dev/remote-jobs/${slug}`);
  
  // Some items have company as an object, some as a string, some as companyName
  let company = 'Unknown';
  if (typeof item.company === 'string') {
    company = item.company;
  } else if (item.company?.name) {
    company = item.company.name;
  } else if (item.companyName) {
    company = item.companyName;
  } else if (item.organization?.name) {
    company = item.organization.name;
  }

  return {
    sourceId: `arcdev-${slug}`,
    title: item.title ?? item.name ?? '',
    company: company,
    location: item.location ?? item.remote_location ?? 'Remote',
    url: url,
    jobType: guessJobType(item.title ?? item.name ?? ''),
    remote: true,
    source: sourceKey,
    sourceLabel: name,
    sourcePostedAt: item.postedAt 
      ? new Date(Number(item.postedAt) < 1e12 ? Number(item.postedAt) * 1000 : Number(item.postedAt))
      : (item.createdAt || item.publishedAt || item.posted_at ? new Date(item.createdAt || item.publishedAt || item.posted_at) : undefined),
  };
}

const PM_QUERIES = ['product manager', 'associate product manager'];

export async function fetch() {
  const seen = new Set();
  const jobs = [];

  for (const q of PM_QUERIES) {
    try {
      const res = await globalThis.fetch(
        `https://arc.dev/remote-jobs?keyword=${encodeURIComponent(q)}&remote=true`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml',
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      if (!res.ok) {
        console.warn(`[Arc.dev] HTTP ${res.status} for "${q}"`);
        continue;
      }

      const html = await res.text();
      const $ = load(html);

      const nd = $('#__NEXT_DATA__').html();
      if (nd) {
        try {
          const json = JSON.parse(nd);
          const items = parseNextData(json);

          if (items) {
            console.log(`[Arc.dev] __NEXT_DATA__ found ${items.length} items for "${q}"`);

            for (const item of items) {
              const slug = item.urlString ?? item.slug ?? item.id;
              const id = `arcdev-${slug}`;
              if (!slug || seen.has(id)) continue;
              seen.add(id);
              jobs.push(mapItem(item));
            }
          }
        } catch (e) {
          console.warn(`[Arc.dev] __NEXT_DATA__ parse failed:`, e.message);
        }
      }
    } catch (err) {
      console.error(`[Arc.dev] failed for "${q}":`, err.message);
    }
  }

  console.log(`[Arc.dev] returning ${jobs.length} jobs total`);
  return jobs;
}
