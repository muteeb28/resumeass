// EchoJobs — DISABLED
// Cloudflare blocks ALL server/datacenter requests with HTTP 403.
// Confirmed: robots.txt, sitemap.xml, /api/*, feed.xml — every endpoint returns 403 + cf-ray header.
// WebFetch also fails with 403. Stricter than RemoteRocketship (which allowed robots.txt).
// Re-enable only if paid residential proxy or headless browser infrastructure is available.

export const name = 'EchoJobs';
export const sourceKey = 'echojobs';
export const disabled = true;

export async function fetch() {
  console.log('[echojobs] SKIPPED — Cloudflare 403 on all endpoints (datacenter IP blocked)');
  return [];
}
