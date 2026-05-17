// Wellfound — DISABLED (direct scraping)
// Reason: Anti-bot measures on all job listing endpoints. No public API.
// Next.js app — __NEXT_DATA__ is present but pageProps contains no job data
// (Apollo state only contains user session, not job listings).
// Re-enable only if:
//   Option A — Wellfound grants partner API access (contact partnerships@wellfound.com).
//   Option B — Headless browser + residential proxy infrastructure is in place.
// Some Wellfound-originated jobs appear via JSearch (Google Jobs) — that is the
// current coverage path for Wellfound ecosystem.

import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Wellfound';
export const sourceKey = 'wellfound';
export const disabled = true;
export const disabledReason = 'anti-bot on all endpoints; no public API; Next.js __NEXT_DATA__ contains no job listings';

export async function fetch() {
  // Using the SEO-friendly URL pattern identified during investigation
  const res = await globalThis.fetch(
    'https://wellfound.com/role/l/product-manager/remote',
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }
  );
  if (!res.ok) {
    console.warn(`[Wellfound] HTTP ${res.status}`);
    return [];
  }
  const html = await res.text();
  console.log('[Wellfound] HTML snippet:', html.slice(0, 300));
  const $ = load(html);
  const jobs = [];

  // Wellfound uses Next.js — try __NEXT_DATA__
  const nd = $('#__NEXT_DATA__').html();
  if (nd) {
    try {
      const json = JSON.parse(nd);
      
      console.log('[Wellfound] Top-level keys:', Object.keys(json));
      console.log('[Wellfound] Props keys:', Object.keys(json.props ?? {}));
      console.log('[Wellfound] pageProps keys:', Object.keys(json.props?.pageProps ?? {}));

      const pageProps = json?.props?.pageProps;
      
      // Attempt to extract jobs from common Next.js/Apollo patterns
      let roles = [];
      
      if (Array.isArray(pageProps?.jobListings)) {
        roles = pageProps.jobListings;
      } else if (Array.isArray(pageProps?.roles)) {
        roles = pageProps.roles;
      } else if (pageProps?.apolloState) {
        // Extract from Apollo cache if present
        const state = pageProps.apolloState;
        roles = Object.values(state).filter(val => val.__typename === 'JobListing' || val.__typename === 'Role');
      } else if (pageProps?.talentData?.jobListings) {
        roles = pageProps.talentData.jobListings;
      }

      if (roles.length > 0) {
        return roles.map((item) => {
          const id = item.id ?? item.randomKey;
          return {
            sourceId: `wellfound-${id}`,
            title: item.title ?? item.name ?? '',
            company: item.startup?.name ?? item.company?.name ?? item.company ?? 'Unknown',
            location: item.locationNames?.[0] ?? item.location ?? 'Remote',
            url: item.url ?? `https://wellfound.com/jobs/${id}`,
            salary: item.compensation ?? item.salary ?? undefined,
            jobType: guessJobType(item.title ?? item.name),
            remote: true,
            source: sourceKey,
            sourceLabel: name,
            sourcePostedAt: item.liveStartAt ? new Date(item.liveStartAt * 1000) : (item.createdAt ? new Date(item.createdAt) : undefined),
          };
        });
      }
    } catch (e) {
      console.warn(`[Wellfound] __NEXT_DATA__ parse failed:`, e.message);
    }
  }

  // Fallback: HTML parsing (updated selectors based on common Wellfound patterns)
  $('[class*="styles_jobListing"], [class*="styles_role"], [data-test="JobListing"]').each((_i, el) => {
    const title = $(el).find('h2, h3, [class*="title"], [class*="jobTitle"]').first().text().trim();
    const company = $(el).find('[class*="startupName"], [class*="companyName"]').first().text().trim();
    const href = $(el).find('a[href*="/jobs/"]').first().attr('href') ?? '';
    if (!title) return;
    const url = href.startsWith('http') ? href : `https://wellfound.com${href}`;
    jobs.push({
      sourceId: `wellfound-${Buffer.from(url || title).toString('base64').slice(0, 22)}`,
      title,
      company: company || 'Unknown',
      location: 'Remote',
      url,
      jobType: guessJobType(title),
      remote: true,
      source: sourceKey,
      sourceLabel: name,
    });
  });

  return jobs;
}
