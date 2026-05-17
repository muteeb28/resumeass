// RemoteRocketship is hard-blocked by Cloudflare (HTTP 403 on all endpoints,
// including /jobs, /api/jobs, /feed.xml, /graphql, /sitemap.xml).
// Every request from a datacenter IP gets a Cloudflare access-denied page.
// Cannot be fixed with headers or URL changes — requires residential proxy or
// headless browser with Cloudflare bypass (e.g., Apify, Bright Data).
// Disabled until infrastructure is in place.

export const name = 'RemoteRocketship';
export const sourceKey = 'remoterocketship';
export const disabled = true;
export const disabledReason = 'Cloudflare WAF 403 on all endpoints (jobs, /api/jobs, feed.xml, sitemap.xml) — requires residential proxy or headless browser';

export async function fetch() {
  throw new Error('UNSUPPORTED: Source blocked by Cloudflare; requires anti-bot scraping infrastructure');
}
