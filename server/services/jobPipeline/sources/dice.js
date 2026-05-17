// Dice — DEFERRED
//
// Investigation results:
// - Main jobs page (/jobs?q=...) returns 200 but is a React SPA shell — zero SSR job data.
//   No __NEXT_DATA__, no JSON-LD JobPosting, no jobTitle in HTML. Jobs load client-side only.
// - Search API at job-search-api.svc.dhigroupinc.com/v1/dice/jobs/search returns 403 {"message":"Forbidden"}.
//   Requires an authenticated x-api-key embedded in their private JS bundles.
// - No public API documentation page (/hiring/technology-jobs-api/ → 404).
// - rss.dice.com is partner-only (directory listing, generic/ subfolder is 404).
// - robots.txt accessible; sitemap.xml returns 404.
//
// Re-enable when:
//   Option A — Dice API key obtained via registration (check https://www.dice.com/hiring).
//   Option B — Headless browser infrastructure available to intercept XHR calls.

export const name = 'Dice';
export const sourceKey = 'dice';
export const disabled = true;

export async function fetch() {
  console.log('[dice] SKIPPED — React SPA, no SSR data; search API requires registered x-api-key (403 Forbidden)');
  return [];
}
