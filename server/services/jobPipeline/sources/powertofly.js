import { guessJobType } from '../classifier.js';

export const name = 'PowerToFly';
export const sourceKey = 'powertofly';

// Investigation results:
// - The main /jobs page is a React SPA — no SSR job data.
// - Public REST API confirmed: GET /api/v1/jobs/?title=<query> returns real job JSON.
//   Response: { data: [...], meta: { per_page:50, total:150, pages:3, page:1, next_page:2 } }
// - The API returns 150 PM jobs across 3 pages, sorted ascending by ID (oldest first).
//   Page 3 has the highest IDs = most recently added. Confirmed IDs 253xxxx from today.
// - NO datePosted field in the API response — it's only in JSON-LD on individual detail pages.
//   Example: <script type="application/ld+json">{"datePosted":"Tue, 28 Apr 2026 ..."}
// - Job URL pattern: https://powertofly.com/jobs/detail/{id}
// - Old collector used CSS selectors that don't exist (React SPA, no static job HTML).
//
// Strategy: fetch last page (newest jobs) → batch-fetch detail pages for datePosted.
// Concurrency: 8 parallel detail requests to stay polite.

const API_BASE = 'https://powertofly.com/api/v1/jobs/';
const DETAIL_BASE = 'https://powertofly.com/jobs/detail/';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json',
};
const HTML_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html',
};
const CONCURRENCY = 8;

async function fetchApi(title, page) {
  const url = `${API_BASE}?title=${encodeURIComponent(title)}&page=${page}`;
  const res = await globalThis.fetch(url, { headers: HEADERS });
  if (!res.ok) {
    console.warn(`[powertofly] API ${url} → HTTP ${res.status}`);
    return null;
  }
  return res.json();
}

async function fetchDate(id) {
  try {
    const res = await globalThis.fetch(`${DETAIL_BASE}${id}`, { headers: HTML_HEADERS });
    if (!res.ok) return undefined;
    const html = await res.text();
    const m = html.match(/"datePosted"\s*:\s*"([^"]+)"/);
    return m ? new Date(m[1]) : undefined;
  } catch {
    return undefined;
  }
}

async function batchFetchDates(jobs) {
  const results = new Map();
  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    const batch = jobs.slice(i, i + CONCURRENCY);
    const dates = await Promise.all(batch.map(j => fetchDate(j.id)));
    batch.forEach((j, idx) => results.set(j.id, dates[idx]));
  }
  return results;
}

export async function fetch() {
  // Step 1: get meta to find last page
  const firstPage = await fetchApi('product manager', 1);
  if (!firstPage) return [];

  const totalPages = firstPage.meta?.pages ?? 1;
  console.log(`[powertofly] Total PM jobs: ${firstPage.meta?.total}, pages: ${totalPages}`);

  // Step 2: fetch last page (highest IDs = newest jobs)
  let candidates = [];
  const lastPage = totalPages > 1 ? await fetchApi('product manager', totalPages) : firstPage;
  if (lastPage?.data?.length) {
    candidates = lastPage.data;
  }

  // Sort by ID descending so we process newest first
  candidates.sort((a, b) => b.id - a.id);

  console.log(`[powertofly] Fetching dates for ${candidates.length} jobs (batch size ${CONCURRENCY})...`);

  // Step 3: batch-fetch detail pages for datePosted
  const dateMap = await batchFetchDates(candidates);

  // Step 4: normalize
  const jobs = [];
  for (const item of candidates) {
    const title = item.title ?? '';
    if (!title) continue;

    const company = item.company?.name ?? 'Unknown';
    const jobUrl = `${DETAIL_BASE}${item.id}`;
    const sourcePostedAt = dateMap.get(item.id);

    jobs.push({
      sourceId:       `powertofly-${item.id}`,
      title,
      company,
      location:       item.location === 'Remote' ? 'Remote' : (item.location ?? 'Remote'),
      url:            jobUrl,
      jobType:        guessJobType(title),
      remote:         item.location === 'Remote',
      source:         sourceKey,
      sourceLabel:    name,
      sourcePostedAt,
    });
  }

  console.log(`[powertofly] Raw jobs: ${jobs.length}, with dates: ${jobs.filter(j => j.sourcePostedAt).length}`);
  return jobs;
}
