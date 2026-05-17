import { load } from 'cheerio';
import { guessJobType } from '../classifier.js';

export const name = 'SkipTheDrive';
export const sourceKey = 'skipthedrive';

// The site uses WordPress with a custom job post type.
// RSS feed URLs all redirect to the homepage HTML (not XML) — unusable.
// The /jobs/ path returns 404.
// Working approach: use the site search form (?s=<query>) which returns
// article-based job listings with title, company, URL, and date.
const QUERIES = [
  'product+manager',
  'associate+product+manager',
  'junior+product+manager',
  'entry+level+product+manager',
];

export async function fetch() {
  const seen = new Set();
  const jobs = [];

  for (const q of QUERIES) {
    try {
      const url = `https://www.skipthedrive.com/?s=${q}`;
      const res = await globalThis.fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
          Accept: 'text/html',
        },
      });
      if (!res.ok) continue;

      const html = await res.text();
      const $    = load(html);

      $('article').each((_i, el) => {
        const titleEl = $(el).find('.entry-title a, h2.post-title a').first();
        const title   = titleEl.text().trim();
        const jobUrl  = titleEl.attr('href') ?? '';
        if (!title || !jobUrl || seen.has(jobUrl)) return;
        seen.add(jobUrl);

        // Company is in a dedicated span (has a nbsp prefix from the favicon layout)
        const company = $(el)
          .find('.custom_fields_company_name_display_search_results')
          .text()
          .replace(/ /g, '') // strip non-breaking spaces
          .trim() || 'Unknown';

        // Date comes from the <time datetime="YYYY-MM-DD"> attribute
        const datetime = $(el).find('time[datetime]').attr('datetime') ?? '';
        const postId   = jobUrl.match(/-(\d+)\/?$/)?.[1];

        jobs.push({
          sourceId:       `skipthedrive-${postId ?? Buffer.from(jobUrl).toString('base64').slice(0, 16)}`,
          title,
          company,
          location:       'Remote',
          url:            jobUrl,
          jobType:        guessJobType(title),
          remote:         true,
          source:         sourceKey,
          sourceLabel:    name,
          sourcePostedAt: datetime ? new Date(datetime) : undefined,
        });
      });
    } catch {}
  }

  return jobs;
}
