import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'Dynamite Jobs';
export const sourceKey = 'dynamitejobs';

// The site is Vue 3 SSR. The old collector used broken template URLs that return
// "No available jobs at the moment in this location" with zero job HTML.
// Correct URL: /category/remote-product-jobs — returns 20 server-rendered job cards.
//
// HTML structure confirmed via live fetch:
//   Title:   <a href="/company/{slug}/remote-job/{slug}" class="...text-dc-mint-500...">
//   Company: <a href="/company/{slug}" class="...text-dc-gold-700...">
//   Date:    <span class="...text-xs...leading-6...truncate">Opened X days/hours ago</span>
//   Salary:  <span class="truncate">$Xk - $Yk per year</span>
//
// No pagination — 20 jobs is the full listing per page.
// RSS feed at /feed/rss.xml is blog-only, not jobs.

const FETCH_URLS = [
  'https://dynamitejobs.com/category/remote-product-jobs',
];

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  Accept: 'text/html',
};

function parseRelativeDate(text) {
  if (!text) return undefined;
  const m = text.match(/Opened\s+(\d+)\s+(hour|day|week|month)/i);
  if (!m) return undefined;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  const ms =
    unit === 'hour'  ? n * 3_600_000 :
    unit === 'day'   ? n * 86_400_000 :
    unit === 'week'  ? n * 604_800_000 :
    unit === 'month' ? n * 2_592_000_000 : 0;
  return ms > 0 ? new Date(Date.now() - ms) : undefined;
}

export async function fetch() {
  const seen = new Set();
  const jobs = [];

  for (const pageUrl of FETCH_URLS) {
    try {
      const res = await globalThis.fetch(pageUrl, { headers: HEADERS });
      if (!res.ok) {
        console.warn(`[dynamitejobs] ${pageUrl} → HTTP ${res.status}`);
        continue;
      }
      const html = await res.text();
      const $ = load(html);

      // Each job card has a unique anchor whose href matches /company/*/remote-job/*
      $('a[href*="/remote-job/"]').each((_i, el) => {
        const href = $(el).attr('href') ?? '';
        if (!href.includes('/remote-job/')) return;

        const jobUrl = `https://dynamitejobs.com${href}`;
        if (seen.has(jobUrl)) return;
        seen.add(jobUrl);

        const title = $(el).text().trim();
        if (!title) return;

        // Company link is in the same parent container, identified by the gold class
        const parent = $(el).parent();
        const company =
          parent.find('a[href^="/company/"]:not([href*="/remote-job/"])').first().text().trim() ||
          'Unknown';

        // Date span is in the sibling div — 2 levels up from the <a> tag.
        // Confirmed structure: a → parent[1](inner div) → parent[2](outer card div with "Opened")
        const dateSpan = $(el)
          .parent()
          .parent()
          .find('span')
          .filter((_j, s) => /Opened\s+\d+/i.test($(s).text()))
          .first();
        const sourcePostedAt = parseRelativeDate(dateSpan.text().trim());

        // Salary — first span.truncate whose text looks like money
        const salary = parent
          .find('span.truncate')
          .filter((_j, s) => /\$/.test($(s).text()))
          .first()
          .text()
          .trim() || undefined;

        jobs.push({
          sourceId:       `dynamitejobs-${Buffer.from(href).toString('base64').slice(0, 24)}`,
          title,
          company,
          location:       'Remote',
          url:            jobUrl,
          salary,
          jobType:        guessJobType(title),
          remote:         true,
          source:         sourceKey,
          sourceLabel:    name,
          sourcePostedAt,
        });
      });

      console.log(`[dynamitejobs] ${pageUrl} → ${jobs.length - seen.size + seen.size} raw (running total ${jobs.length})`);
    } catch (err) {
      console.error(`[dynamitejobs] Error fetching ${pageUrl}:`, err.message);
    }
  }

  console.log(`[dynamitejobs] Total raw jobs: ${jobs.length}`);
  return jobs;
}
