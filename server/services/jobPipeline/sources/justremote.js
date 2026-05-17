import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'JustRemote';
export const sourceKey = 'justremote';

export async function fetch() {
  const res = await globalThis.fetch(
    'https://justremote.co/remote-jobs/product-management-jobs',
    { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }
  );
  if (!res.ok) return [];
  const html = await res.text();
  const $ = load(html);
  const jobs = [];

  // JustRemote uses card-based layout
  $('.card-job, .job-card, [class*="job"], article').each((_i, el) => {
    const title =
      $(el).find('h2, h3, [class*="title"], [class*="position"]').first().text().trim();
    const company =
      $(el).find('[class*="company"], [class*="employer"]').first().text().trim();
    const href = $(el).find('a').first().attr('href') ?? '';
    if (!title) return;
    const url = href.startsWith('http') ? href : `https://justremote.co${href}`;
    jobs.push({
      sourceId: `justremote-${Buffer.from(url || title).toString('base64').slice(0, 22)}`,
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
