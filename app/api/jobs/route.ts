import "server-only";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// Suppress scraper logs in development — Next.js patches console in dev mode
// and detects every log call as "new output", triggering an HMR re-evaluation
// cycle that causes the Fast Refresh infinite loop.
const log = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== "development") console.log(...args);
};

export const runtime = "nodejs";
export const revalidate = 0;
export const maxDuration = 30; // Allow up to 30s for all scrapers to complete

// ─── Per-scraper freshness windows ────────────────────────────────────────────
//
// Each platform key must match job.platform exactly as set in its scraper.
//
// Special cases handled in getFreshnessWindow():
//   • GitHub repos  → job.platform is "GitHub/{repo-name}" (prefix match)
//   • JSearch       → job.platform is the publisher name from the API
//                     ("Google Jobs", "Adzuna", "Naukri", "Glassdoor", etc.)
//                     These all fall through to the "JSearch" key via default.

const SCRAPER_FRESHNESS_MINUTES: Record<string, number> = {
  LinkedIn:           120,    // 2h  — URL-level f_TPR=r7200, genuinely real-time
  RemoteRocketship:   120,    // 2h  — created_at timestamp, real-time feed
  Remotive:           10080,  // 7d  — posts in batches, jobs are naturally 1–7d old
  RemoteOK:           10080,  // 7d  — epoch timestamps span multiple days
  "Working Nomads":   10080,  // 7d  — infrequent batch updates
  "We Work Remotely": 10080,  // 7d  — RSS posts spread across days/weeks per category
  Jobspresso:         10080,  // 7d  — WordPress RSS, low-volume board
  "Remote.co":        10080,  // 7d  — WordPress RSS, batch
  SimplyHired:        10080,  // 7d  — HTML scrape, no time filter in URL
  "Europe Remotely":  10080,  // 7d  — HTML scrape
  NoDesk:             10080,  // 7d  — HTML scrape
  GitHub:             10080,  // 7d  — commit-based, already filtered to 2h in scraper
  "Instahyre":          720,   // 12h — JSON API with timestamps
  "Internshala":        720,   // 12h — RSS feed, updated daily
};

/**
 * Returns the freshness window for a given job.platform value.
 * Handles GitHub's "GitHub/{repo}" prefix and unknown platforms (default 7d).
 */
function getFreshnessWindow(platform: string): number {
  if (SCRAPER_FRESHNESS_MINUTES[platform] !== undefined) {
    return SCRAPER_FRESHNESS_MINUTES[platform];
  }
  // GitHub repos store platform as "GitHub/repo-name"
  if (platform.startsWith("GitHub/")) return SCRAPER_FRESHNESS_MINUTES["GitHub"]!;
  // Unknown platforms (e.g. new ATS hosts not yet in the map) — treat as 7d
  return 10080;
}

/** Per-scraper enable/disable. Set SCRAPER_<NAME>=false in .env to turn off. */
function isEnabled(name: string): boolean {
  return process.env[`SCRAPER_${name}`] !== "false";
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScrapedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  platform: string;
  postedDate: string;
  postedAtMs: number;
  freshnessMinutes: number;
  url: string;
  type: string;
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

const FALLBACK_JOBS: ScrapedJob[] = [
  { id: "f1", title: "Frontend Engineer",           company: "Razorpay", location: "Bangalore, India", platform: "LinkedIn", postedDate: "45m ago", postedAtMs: Date.now()-45*60e3, freshnessMinutes:45,  url:"https://www.linkedin.com/jobs/", type:"Full-time"  },
  { id: "f2", title: "React Developer",             company: "Swiggy",   location: "Hyderabad, India", platform: "LinkedIn", postedDate: "30m ago", postedAtMs: Date.now()-30*60e3, freshnessMinutes:30,  url:"https://www.linkedin.com/jobs/", type:"Full-time"  },
  { id: "f3", title: "Software Engineer – Full Stack", company: "Flipkart", location: "Bangalore, India", platform: "LinkedIn", postedDate: "55m ago", postedAtMs: Date.now()-55*60e3, freshnessMinutes:55, url:"https://www.linkedin.com/jobs/", type:"Full-time"  },
  { id: "f4", title: "Backend Developer (Node.js)", company: "CRED",     location: "Bangalore, India", platform: "LinkedIn", postedDate: "20m ago", postedAtMs: Date.now()-20*60e3, freshnessMinutes:20,  url:"https://www.linkedin.com/jobs/", type:"Full-time"  },
  { id: "f5", title: "Associate Product Manager",   company: "Zomato",   location: "Gurgaon, India",   platform: "LinkedIn", postedDate: "50m ago", postedAtMs: Date.now()-50*60e3, freshnessMinutes:50,  url:"https://www.linkedin.com/jobs/", type:"Full-time"  },
  { id: "f6", title: "SDE Intern",                  company: "Amazon",   location: "Hyderabad, India", platform: "LinkedIn", postedDate: "10m ago", postedAtMs: Date.now()-10*60e3, freshnessMinutes:10,  url:"https://www.linkedin.com/jobs/", type:"Internship" },
];

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

/**
 * curl bypasses Cloudflare TLS fingerprinting that blocks Node.js fetch.
 * Arguments are an array — no shell-injection risk.
 * Default timeout is 30 s (increased from 20 s to fix Remote.co code-28 errors).
 */
async function curlFetch(url: string, extraArgs: string[] = [], timeoutSecs = 30): Promise<string> {
  const { stdout } = await execFileAsync("curl", [
    "-s", "-L",
    "--max-time", String(timeoutSecs),
    "--connect-timeout", "10",
    "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "-H", "Accept-Language: en-US,en;q=0.9",
    "-H", "Cache-Control: no-cache",
    ...extraArgs,
    url,
  ]);
  return stdout;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function guessJobType(title: string): string {
  const l = title.toLowerCase();
  if (l.includes("intern"))                          return "Internship";
  if (l.includes("contract") || l.includes("freelance")) return "Contract";
  if (l.includes("part-time") || l.includes("part time")) return "Part-time";
  return "Full-time";
}

function parseAgeMinutes(text: string): number {
  const t = text.toLowerCase().trim();
  if (!t || t === "recently" || t.includes("just now") || t.includes("moment")) return 0;
  const min = t.match(/(\d+)\s*min/);  if (min)  return parseInt(min[1]);
  const hr  = t.match(/(\d+)\s*h(?:our)?s?/); if (hr) return parseInt(hr[1]) * 60;
  const day = t.match(/(\d+)\s*day/);  if (day)  return parseInt(day[1]) * 1440;
  const wk  = t.match(/(\d+)\s*week/); if (wk)   return parseInt(wk[1]) * 10080;
  return 10080; // unparseable → treat as 7d old, sinks to bottom
}

function msToPastMinutes(ms: number): number {
  return Math.max(0, Math.round((Date.now() - ms) / 60_000));
}

function msToPostedDate(ms: number): string {
  const m = msToPastMinutes(ms);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

/**
 * Parse a date string to milliseconds.
 * For date-only strings like "2026-03-14" (no time component), treat as
 * noon UTC of that day rather than midnight — halves the average error for
 * platforms that publish throughout the day.
 */
const UNKNOWN_DATE_MS = () => Date.now() - 7 * 24 * 60 * 60_000; // 7 days ago — sinks to bottom

function parseDateMs(dateStr: string): number {
  if (!dateStr) return UNKNOWN_DATE_MS();
  // Relative dates (e.g. "Just now", "2 hours ago", "3 days ago")
  const lower = dateStr.toLowerCase().trim();
  if (lower === "just now") return Date.now();
  const minsM = lower.match(/^(\d+)\s*m(?:in(?:utes?)?)?\s*ago$/);
  if (minsM) return Date.now() - Number(minsM[1]) * 60_000;
  const hoursM = lower.match(/^(\d+)\s*h(?:ours?)?\s*ago$/);
  if (hoursM) return Date.now() - Number(hoursM[1]) * 60 * 60_000;
  const daysM = lower.match(/^(\d+)\s*d(?:ays?)?\s*ago$/);
  if (daysM) return Date.now() - Number(daysM[1]) * 24 * 60 * 60_000;
  const weeksM = lower.match(/^(\d+)\s*w(?:eeks?)?\s*ago$/);
  if (weeksM) return Date.now() - Number(weeksM[1]) * 7 * 24 * 60 * 60_000;
  const monthsM = lower.match(/^(\d+)\s*mo(?:nth(?:s?)?)?\s*ago$/);
  if (monthsM) return Date.now() - Number(monthsM[1]) * 30 * 24 * 60 * 60_000;
  const ms = Date.parse(dateStr);
  if (isNaN(ms)) return UNKNOWN_DATE_MS();
  // If the string had no time component, Date.parse returns midnight UTC.
  // Shift to noon to avoid over-aging same-day jobs.
  const hasTime = /T\d{2}:\d{2}/.test(dateStr) || /\d{2}:\d{2}:\d{2}/.test(dateStr);
  return hasTime ? ms : ms + 12 * 60 * 60_000;
}

/** Strip RSS CDATA wrappers */
function cdataText(s: string): string {
  return s.replace(/<!\[CDATA\[|\]\]>/g, "").trim();
}

/**
 * Extract the text URL from an RSS <link> element.
 * In cheerio xmlMode, <link> is treated as a void element (no closing tag),
 * so its text content ends up as the *next sibling* text node.
 * We handle both that and a normal <link>text</link> form.
 */
function rssLink(item: cheerio.Cheerio<any>): string {
  // Strategy 1: text sibling after <link> (standard RSS in cheerio xmlMode)
  const sibling = item.find("link").get(0);
  if (sibling) {
    const next = (sibling as any).next;
    if (next && next.type === "text" && next.data?.trim()) return next.data.trim();
  }
  // Strategy 2: <link> has inner text (Atom-style or non-standard)
  const inner = item.find("link").first().text().trim();
  if (inner) return inner;
  // Strategy 3: <guid> as fallback (many WordPress RSS feeds set guid = permalink)
  const guid = item.find("guid").text().trim();
  if (guid?.startsWith("http")) return guid;
  return "";
}

// ─── SCRAPER 1: LinkedIn ──────────────────────────────────────────────────────
// f_TPR=r7200 = posted in last 2 hours. This is a LinkedIn URL param — it's why
// LinkedIn is the only source that can reliably honour a strict 2h window.

async function scrapeLinkedInJobs(query: string | string[]): Promise<ScrapedJob[]> {
  if (!isEnabled("LINKEDIN")) return [];
  const jobs: ScrapedJob[] = [];
  const keywords = Array.from(new Set(Array.isArray(query) ? query : [query]));

  for (const keyword of keywords) {
    const enc = encodeURIComponent(keyword);
    for (const start of [0, 25, 50, 75]) {
      const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${enc}&geoId=102713980&f_TPR=r7200&start=${start}&sortBy=DD`;
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "*/*",
          },
        });
        if (!res.ok) { console.error(`LinkedIn ${res.status} for "${keyword}" start=${start}`); continue; }

        const $ = cheerio.load(await res.text());
        let found = 0;

        $("li").each((_i, el) => {
          const card     = $(el);
          const title    = card.find(".base-search-card__title").text().trim();
          const company  = card.find(".base-search-card__subtitle").text().trim();
          const location = card.find(".job-search-card__location").text().trim();
          const link     = card.find("a.base-card__full-link").attr("href") || card.find("a").attr("href");
          const time     = card.find("time").text().trim();
          if (!title || !company || !link) return;

          const cleanUrl         = link.split("?")[0];
          if (jobs.some(j => j.url === cleanUrl)) return;
          const freshnessMinutes = parseAgeMinutes(time);

          jobs.push({ id:`li-${jobs.length}-${Date.now()}`, title, company,
            location: location || "Remote", platform: "LinkedIn",
            postedDate: time || "Recently",
            postedAtMs: Date.now() - freshnessMinutes * 60_000,
            freshnessMinutes, url: cleanUrl, type: guessJobType(title) });
          found++;
        });

        log(`LinkedIn: ${found} jobs for "${keyword}" start=${start}`);
        if (found === 0) break;
        await new Promise(r => setTimeout(r, 800));
      } catch (err) { console.error(`LinkedIn error "${keyword}":`, err); }
    }
  }
  return jobs;
}

// ─── SCRAPER 2: RemoteRocketship ─────────────────────────────────────────────

const RRS_CATEGORY_MAP: Record<string, string> = {
  software:"software-engineer", engineer:"software-engineer", developer:"software-engineer",
  frontend:"software-engineer", backend:"software-engineer",  fullstack:"software-engineer",
  react:"software-engineer",    node:"software-engineer",     devops:"software-engineer",
  data:"data-analyst",          design:"product-designer",    ux:"product-designer",
  product:"product-manager",    marketing:"marketing",        sales:"sales",
};

async function scrapeRemoteRocketshipJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("REMOTEROCKETSHIP")) return [];
  const jobs: ScrapedJob[] = [];
  try {
    const category = Object.entries(RRS_CATEGORY_MAP).find(([k]) => query.toLowerCase().includes(k))?.[1] ?? "software-engineer";
    const html = await curlFetch(`https://www.remoterocketship.com/jobs/${category}/`);
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) { console.warn("RemoteRocketship: __NEXT_DATA__ not found"); return jobs; }

    const listings: any[] = JSON.parse(match[1])?.props?.pageProps?.initialJobOpenings ?? [];
    for (const job of listings) {
      const title    = job.roleTitle ?? "";
      const company  = job.company?.name ?? "Unknown";
      const location = job.location ?? (job.locationType === "remote" ? "Remote" : "Unknown");
      const applyUrl = job.url || (job.slug ? `https://www.remoterocketship.com/jobs/${job.slug}` : "");
      if (!title || !applyUrl || jobs.some(j => j.url === applyUrl)) continue;

      const postedAtMs = job.created_at ? new Date(job.created_at).getTime() : Date.now();
      jobs.push({ id:`rrs-${jobs.length}-${Date.now()}`, title, company, location,
        platform:"RemoteRocketship", postedDate: msToPostedDate(postedAtMs),
        postedAtMs, freshnessMinutes: msToPastMinutes(postedAtMs), url: applyUrl, type: guessJobType(title) });
    }
    log(`RemoteRocketship: ${jobs.length} jobs for category "${category}"`);
  } catch (err) { console.error("RemoteRocketship error:", err); }
  return jobs;
}

// ─── SCRAPER 3: Remotive ──────────────────────────────────────────────────────
// Free public JSON API. publication_date is often date-only ("2026-03-14"),
// so parseDateMs() shifts it to noon UTC to avoid false "stale" detection.
// ROOT CAUSE of "0 fresh": old code called isFresh(2h) but Remotive posts
// jobs once/day. FIX: removed per-scraper filter; orchestrator uses 24h window.

async function scrapeRemotiveJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("REMOTIVE")) return [];
  const jobs: ScrapedJob[] = [];
  try {
    const search = query === "all" ? "" : encodeURIComponent(query);
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${search}&limit=100`,
      { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`Status ${res.status}`);

    const data = await res.json();
    for (const job of (data?.jobs ?? []) as any[]) {
      const applyUrl = job.url ?? "";
      if (!applyUrl || jobs.some(j => j.url === applyUrl)) continue;
      const postedAtMs = parseDateMs(job.publication_date ?? "");
      jobs.push({ id:`remotive-${jobs.length}-${Date.now()}`,
        title: job.title ?? "", company: job.company_name ?? "Unknown",
        location: job.candidate_required_location || "Remote",
        platform:"Remotive", postedDate: msToPostedDate(postedAtMs), postedAtMs,
        freshnessMinutes: msToPastMinutes(postedAtMs), url: applyUrl,
        type: guessJobType(job.title ?? "") });
    }
    log(`Remotive: ${jobs.length} jobs`);
  } catch (err) { console.error("Remotive error:", err); }
  return jobs;
}

// ─── SCRAPER 5: RemoteOK ──────────────────────────────────────────────────────
// Free JSON API. epoch field is Unix seconds — reliable timestamp.
// ROOT CAUSE of "0 fresh": jobs are 4–12 h old → failed 2h inline filter.
// FIX: removed per-scraper filter; orchestrator uses 24h window.

async function scrapeRemoteOKJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("REMOTEOK")) return [];
  const jobs: ScrapedJob[] = [];
  try {
    const tag = query === "all" ? "dev" : encodeURIComponent(query.toLowerCase().replace(/ /g, "-"));
    const res = await fetch(`https://remoteok.com/api?tags=${tag}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; JobScraper/1.0)", Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);

    const data = await res.json() as any[];
    for (const job of data.slice(1)) { // first element is a legal notice object
      if (!job.position || !job.company || !job.url) continue;
      if (jobs.some(j => j.url === job.url)) continue;
      const postedAtMs = job.epoch > 0 ? job.epoch * 1000 : Date.now();
      jobs.push({ id:`remoteok-${jobs.length}-${Date.now()}`,
        title: job.position, company: job.company,
        location: job.location || "Remote", platform:"RemoteOK",
        postedDate: msToPostedDate(postedAtMs), postedAtMs,
        freshnessMinutes: msToPastMinutes(postedAtMs), url: job.url,
        type: guessJobType(job.position) });
    }
    log(`RemoteOK: ${jobs.length} jobs`);
  } catch (err) { console.error("RemoteOK error:", err); }
  return jobs;
}

// ─── SCRAPER 6: Working Nomads ────────────────────────────────────────────────
// Free JSON API. pub_date is ISO string.

async function scrapeWorkingNomadsJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("WORKINGNOMADS")) return [];
  const jobs: ScrapedJob[] = [];
  try {
    const res = await fetch("https://www.workingnomads.com/api/exposed_jobs/",
      { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`Status ${res.status}`);

    const data = await res.json() as any[];
    const q = query.toLowerCase();
    for (const job of data) {
      const title = job.title ?? "";
      if (query !== "all" && !title.toLowerCase().includes(q)) continue;
      const applyUrl = job.url ?? "";
      if (!applyUrl || jobs.some(j => j.url === applyUrl)) continue;
      const postedAtMs = parseDateMs(job.pub_date ?? "");
      jobs.push({ id:`workingnomads-${jobs.length}-${Date.now()}`,
        title, company: job.company ?? "Unknown",
        location: job.location || "Remote", platform:"Working Nomads",
        postedDate: msToPostedDate(postedAtMs), postedAtMs,
        freshnessMinutes: msToPastMinutes(postedAtMs), url: applyUrl,
        type: guessJobType(title) });
    }
    log(`Working Nomads: ${jobs.length} jobs`);
  } catch (err) { console.error("Working Nomads error:", err); }
  return jobs;
}

// ─── SCRAPER 7: We Work Remotely (RSS) ────────────────────────────────────────
// ROOT CAUSE of "0 fresh": two bugs.
//   1. inline isFresh(2h) filter — WWR posts 1–2x/day, all jobs fail 2h check.
//   2. rssLink() parsing bug — cheerio xmlMode treats <link> as void element,
//      so item.find("link").next().text() returns "" for most items.
// FIX: use the rssLink() helper that checks the sibling text node + guid fallback;
//      removed per-scraper filter; orchestrator uses 24h window.

async function scrapeWeWorkRemotelyJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("WEWORKREMOTELY")) return [];
  const jobs: ScrapedJob[] = [];

  const feeds = [
    "https://weworkremotely.com/categories/remote-programming-jobs.rss",
    "https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss",
    "https://weworkremotely.com/categories/remote-design-jobs.rss",
    "https://weworkremotely.com/categories/remote-product-jobs.rss",
  ];
  const q = query.toLowerCase();

  for (const feedUrl of feeds) {
    try {
      const xml = await curlFetch(feedUrl);
      const $ = cheerio.load(xml, { xmlMode: true });

      $("item").each((_i, el) => {
        const item      = $(el);
        const rawTitle  = cdataText(item.find("title").first().text());
        const link      = rssLink(item);
        const pubDate   = item.find("pubDate").text().trim();
        const region    = cdataText(item.find("region").text());
        const companyEl = cdataText(item.find("company").text());

        if (!rawTitle || !link) return;
        if (query !== "all" && !rawTitle.toLowerCase().includes(q)) return;
        if (jobs.some(j => j.url === link)) return;

        const postedAtMs = pubDate ? parseDateMs(pubDate) : Date.now();
        // WWR title format: "Company | Job Title"
        const parts   = rawTitle.split(" | ");
        const company = companyEl || (parts.length > 1 ? parts[0] : "Unknown");
        const title   = parts.length > 1 ? parts.slice(1).join(" | ") : rawTitle;

        jobs.push({ id:`wwr-${jobs.length}-${Date.now()}`, title, company,
          location: region || "Remote", platform:"We Work Remotely",
          postedDate: msToPostedDate(postedAtMs), postedAtMs,
          freshnessMinutes: msToPastMinutes(postedAtMs), url: link,
          type: guessJobType(title) });
      });
    } catch (err) { console.error(`WWR feed ${feedUrl} error:`, err); }
  }

  log(`We Work Remotely: ${jobs.length} jobs`);
  return jobs;
}

// ─── SCRAPER 8: Jobspresso (WordPress RSS) ────────────────────────────────────
// ROOT CAUSE of "0 fresh": batch posts + 2h inline filter. FIX: removed filter.

async function scrapeJobspressoJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("JOBSPRESSO")) return [];
  const jobs: ScrapedJob[] = [];
  try {
    const xml = await curlFetch("https://jobspresso.co/feed/");
    const $ = cheerio.load(xml, { xmlMode: true });
    const q = query.toLowerCase();

    $("item").each((_i, el) => {
      const item    = $(el);
      const title   = cdataText(item.find("title").first().text());
      const link    = rssLink(item);
      const pubDate = item.find("pubDate").text().trim();
      const creator = cdataText(item.find("creator").text());
      if (!title || !link) return;
      if (query !== "all" && !title.toLowerCase().includes(q)) return;
      if (jobs.some(j => j.url === link)) return;

      const postedAtMs = pubDate ? parseDateMs(pubDate) : Date.now();
      // "Company – Job Title" or "Job Title at Company"
      const dashParts = title.split(/\s[–—-]\s/);
      const atParts   = title.split(/\s(?:at|@)\s/i);
      let company: string, jobTitle: string;
      if (dashParts.length > 1) { company = dashParts[0]; jobTitle = dashParts.slice(1).join(" – "); }
      else if (atParts.length > 1) { jobTitle = atParts.slice(0,-1).join(" at "); company = atParts[atParts.length-1]; }
      else { jobTitle = title; company = creator || "Unknown"; }

      jobs.push({ id:`jobspresso-${jobs.length}-${Date.now()}`, title: jobTitle, company,
        location:"Remote", platform:"Jobspresso",
        postedDate: msToPostedDate(postedAtMs), postedAtMs,
        freshnessMinutes: msToPastMinutes(postedAtMs), url: link,
        type: guessJobType(jobTitle) });
    });
    log(`Jobspresso: ${jobs.length} jobs`);
  } catch (err) { console.error("Jobspresso error:", err); }
  return jobs;
}

// ─── SCRAPER 9: Remote.co (WordPress RSS) ────────────────────────────────────
// ROOT CAUSE of "curl code 28" (timeout): default --max-time 20 s was too short
// for WordPress RSS on shared hosting. FIX: pass timeoutSecs=40 to curlFetch.
// Also removed inline 2h filter; orchestrator uses 24h window.

async function scrapeRemoteCoJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("REMOTECO")) return [];
  const jobs: ScrapedJob[] = [];
  const feeds = [
    "https://remote.co/remote-jobs/developer/feed/",
    "https://remote.co/remote-jobs/designer/feed/",
    "https://remote.co/remote-jobs/product/feed/",
    "https://remote.co/remote-jobs/data-science/feed/",
  ];
  const q = query.toLowerCase();

  for (const feedUrl of feeds) {
    try {
      // 40 s timeout — Remote.co WordPress RSS is slow on shared hosting
      const xml = await curlFetch(feedUrl, [], 40);
      const $ = cheerio.load(xml, { xmlMode: true });

      $("item").each((_i, el) => {
        const item    = $(el);
        const title   = cdataText(item.find("title").first().text());
        const link    = rssLink(item);
        const pubDate = item.find("pubDate").text().trim();
        const creator = cdataText(item.find("creator").text());
        if (!title || !link) return;
        if (query !== "all" && !title.toLowerCase().includes(q)) return;
        if (jobs.some(j => j.url === link)) return;

        const postedAtMs = pubDate ? parseDateMs(pubDate) : Date.now();
        // "Job Title at Company"
        const parts   = title.split(/\s(?:at|@)\s/i);
        const company = (parts.length > 1 ? parts[parts.length-1] : creator) || "Unknown";
        const jobTitle = parts.length > 1 ? parts.slice(0,-1).join(" at ") : title;

        jobs.push({ id:`remoteco-${jobs.length}-${Date.now()}`, title: jobTitle, company,
          location:"Remote", platform:"Remote.co",
          postedDate: msToPostedDate(postedAtMs), postedAtMs,
          freshnessMinutes: msToPastMinutes(postedAtMs), url: link,
          type: guessJobType(jobTitle) });
      });
    } catch (err) { console.error(`Remote.co ${feedUrl} error:`, err); }
  }
  log(`Remote.co: ${jobs.length} jobs`);
  return jobs;
}

// ─── SCRAPER 10: GitHub Repos ─────────────────────────────────────────────────
// Checks if README.md had commits in the last 2 hours. If yes, parses the git
// diff to extract only the newly added table rows. This is the correct signal
// for "job posted in last 2 hours" for GitHub-based job boards.
// GITHUB_TOKEN strongly recommended (60 req/h without it, 5000/h with).

const GITHUB_REPOS_LIST = [
  { owner:"SimplifyJobs",    repo:"Summer2026-Internships",      defaultType:"Internship" },
  { owner:"SimplifyJobs",    repo:"New-Grad-Positions",          defaultType:"Full-time"  },
  { owner:"speedyapply",     repo:"2026-SWE-College-Jobs",       defaultType:"Full-time"  },
  { owner:"speedyapply",     repo:"2026-AI-College-Jobs",        defaultType:"Full-time"  },
  { owner:"remoteintech",    repo:"remote-jobs",                 defaultType:"Full-time"  },
  { owner:"poteto",          repo:"hiring-without-whiteboards",  defaultType:"Full-time"  },
  { owner:"AndrewStetsenko", repo:"tech-jobs-with-relocation",   defaultType:"Full-time"  },
  { owner:"emredurukn",      repo:"awesome-job-boards",          defaultType:"Full-time"  },
  { owner:"lukasz-madon",    repo:"awesome-remote-job",          defaultType:"Full-time"  },
];

function parseGHRow(raw: string): { cells: string[]; url: string | null } {
  const cells = raw.split("|").map(c => c.trim()).filter(Boolean)
    .map(c => c.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/<[^>]+>/g,"").trim());
  const urlMatch = raw.match(/\]\((https?:\/\/[^)]+)\)/);
  return { cells, url: urlMatch?.[1] ?? null };
}

async function scrapeGitHubRepoJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("GITHUB_REPOS")) return [];
  const jobs: ScrapedJob[] = [];
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string,string> = {
    Accept:"application/vnd.github+json", "User-Agent":"JobScraper/1.0",
    "X-GitHub-Api-Version":"2022-11-28",
    ...(token ? { Authorization:`Bearer ${token}` } : {}),
  };
  const since = new Date(Date.now() - 2 * 60 * 60_000).toISOString();
  const q = query.toLowerCase();

  for (const { owner, repo, defaultType } of GITHUB_REPOS_LIST) {
    try {
      const cr = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?since=${since}&path=README.md&per_page=5`,
        { headers });
      if (!cr.ok) {
        if (cr.status === 403 || cr.status === 429)
          console.warn(`GitHub rate limit ${owner}/${repo} — set GITHUB_TOKEN in .env`);
        else console.warn(`GitHub ${owner}/${repo}: ${cr.status}`);
        continue;
      }
      const commits = await cr.json() as any[];
      if (!commits.length) { log(`GitHub ${owner}/${repo}: no recent commits — skipping`); continue; }

      const sha = commits[0].sha;
      const postedAtMs = new Date(commits[0].commit.committer.date).getTime();
      const dr = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`,
        { headers: { ...headers, Accept:"application/vnd.github.diff" } });
      if (!dr.ok) continue;

      const diff = await dr.text();
      let added = 0;
      for (const line of diff.split("\n")) {
        if (!line.startsWith("+") || line.startsWith("+++") || !line.includes("|")) continue;
        const { cells, url: extractedUrl } = parseGHRow(line.slice(1).trim());
        if (cells.length < 2) continue;
        if (cells.some(c => /^[-:]+$/.test(c))) continue;
        if (cells[0].toLowerCase().includes("company")) continue;

        const company  = cells[0];
        const title    = cells[1] || "Software Engineer";
        const location = cells[2] || "Remote";
        if (!company || company.length < 2) continue;
        if (query !== "all" && !title.toLowerCase().includes(q) && !company.toLowerCase().includes(q)) continue;

        const applyUrl = extractedUrl || `https://github.com/${owner}/${repo}`;
        const key = `${company.toLowerCase()}|${title.toLowerCase()}`;
        if (jobs.some(j => j.url === applyUrl || `${j.company.toLowerCase()}|${j.title.toLowerCase()}` === key)) continue;

        jobs.push({ id:`gh-${owner}-${added}-${Date.now()}`, title, company, location,
          platform:`GitHub/${repo}`, postedDate: msToPostedDate(postedAtMs),
          postedAtMs, freshnessMinutes: msToPastMinutes(postedAtMs), url: applyUrl, type: defaultType });
        if (++added >= 15) break;
      }
      log(`GitHub ${owner}/${repo}: ${added} new jobs from ${commits.length} commit(s)`);
    } catch (err) { console.error(`GitHub ${owner}/${repo} error:`, err); }
  }
  return jobs;
}

// ─── SCRAPER 11: SimplyHired ─────────────────────────────────────────────────
// HTML scraping. Selectors are best-effort — SimplyHired may block curl or
// change their markup. If consistently 0, use JSearch which aggregates them.

async function scrapeSimplyHiredJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("SIMPLYHIRED")) return [];
  const jobs: ScrapedJob[] = [];
  try {
    const q = query === "all" ? "software engineer" : query;
    const html = await curlFetch(
      `https://www.simplyhired.com/search?q=${encodeURIComponent(q)}&t=2`, // t=2 = last 24h
      ["-H", "Referer: https://www.simplyhired.com/"]
    );
    const $ = cheerio.load(html);

    // Try multiple selector strategies as SimplyHired updates their markup
    const cards = $("[data-testid='searchSerpJob']").length
      ? $("[data-testid='searchSerpJob']")
      : $(".SerpJob-jobCard, .jobposting-title, article[data-id]");

    cards.each((_i, el) => {
      const card     = $(el);
      const title    = (card.find("[data-testid='jobTitle'], .jobposting-title, h3").first().text().trim());
      const company  = (card.find("[data-testid='companyName'], .jobposting-company, [class*='company']").first().text().trim());
      const location = (card.find("[data-testid='searchSerpJobLocation'], [class*='location']").first().text().trim());
      const timeText = (card.find("[data-testid='jobPostedDate'], [class*='date']").first().text().trim());
      const href     = card.find("a[data-testid='jobTitle'], a[class*='title'], a").first().attr("href");
      const applyUrl = href ? (href.startsWith("http") ? href : `https://www.simplyhired.com${href}`) : "";
      if (!title || !applyUrl) return;

      const freshnessMinutes = parseAgeMinutes(timeText);
      if (jobs.some(j => j.url === applyUrl)) return;
      jobs.push({ id:`simplyhired-${jobs.length}-${Date.now()}`, title,
        company: company || "Unknown", location: location || "Remote",
        platform:"SimplyHired", postedDate: timeText || "Recently",
        postedAtMs: Date.now() - freshnessMinutes * 60_000, freshnessMinutes,
        url: applyUrl, type: guessJobType(title) });
    });
    log(`SimplyHired: ${jobs.length} jobs`);
  } catch (err) { console.error("SimplyHired error:", err); }
  return jobs;
}

// ─── SCRAPER 12: Europe Remotely ─────────────────────────────────────────────

async function scrapeEuropeRemotelyJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("EUROPEREMOTELY")) return [];
  const jobs: ScrapedJob[] = [];
  try {
    const html = await curlFetch("https://europeremotely.com/");
    const $ = cheerio.load(html);
    const q = query.toLowerCase();

    $("article, .job-card, [class*='job']").each((_i, el) => {
      const card     = $(el);
      const title    = card.find("h2, h3, [class*='title']").first().text().trim();
      const company  = card.find("[class*='company'], [class*='employer']").first().text().trim();
      const href     = card.find("a").first().attr("href");
      const timeText = card.find("time, [class*='date'], [class*='time']").first().text().trim();
      if (!title || !href) return;
      if (query !== "all" && !title.toLowerCase().includes(q)) return;

      const applyUrl = href.startsWith("http") ? href : `https://europeremotely.com${href}`;
      const freshnessMinutes = parseAgeMinutes(timeText);
      if (jobs.some(j => j.url === applyUrl)) return;
      jobs.push({ id:`europeremotely-${jobs.length}-${Date.now()}`, title,
        company: company || "Unknown", location:"Europe / Remote",
        platform:"Europe Remotely", postedDate: timeText || "Recently",
        postedAtMs: Date.now() - freshnessMinutes * 60_000, freshnessMinutes,
        url: applyUrl, type: guessJobType(title) });
    });
    log(`Europe Remotely: ${jobs.length} jobs`);
  } catch (err) { console.error("Europe Remotely error:", err); }
  return jobs;
}

// ─── SCRAPER 13: NoDesk ───────────────────────────────────────────────────────

async function scrapeNoDeskJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("NODESK")) return [];
  const jobs: ScrapedJob[] = [];
  try {
    const q = query === "all" ? "remote" : encodeURIComponent(query);
    const html = await curlFetch(`https://nodesk.co/remote-jobs/?s=${q}`);
    const $ = cheerio.load(html);
    const qL = query.toLowerCase();

    $("article, .job, [class*='job-card']").each((_i, el) => {
      const card     = $(el);
      const title    = card.find("h2, h3, [class*='title']").first().text().trim();
      const company  = card.find("[class*='company'], [class*='employer']").first().text().trim();
      const timeText = card.find("time, [class*='date']").first().text().trim();
      if (!title) return;
      // Reject section headings / nav cards that aren't actual job listings.
      // "Discover remote companies", "Level up your career", "Browse remote jobs", etc.
      const NON_JOB_PATTERNS = /^(discover|browse|explore|view all|see all|find|search|level up|sign up|join|get|start|learn|read|connect)\b/i;
      if (NON_JOB_PATTERNS.test(title)) return;
      // Also reject cards that don't contain at least one role-like keyword
      const HAS_ROLE_KEYWORD = /engineer|developer|designer|manager|analyst|scientist|intern|lead|director|specialist|devops|recruiter|marketer|coordinator|consultant|architect/i;
      if (!HAS_ROLE_KEYWORD.test(title)) return;
      if (query !== "all" && !title.toLowerCase().includes(qL)) return;

      // Find the job-detail link — prefer links whose href contains "/remote-jobs/"
      // (the NoDesk job-page path) over generic links (logo, company, homepage).
      const allHrefs = card.find("a").toArray()
        .map(a => $(a).attr("href") ?? "")
        .filter(Boolean);
      const href = allHrefs.find(h => h.includes("/remote-jobs/")) ?? allHrefs[0] ?? "";
      if (!href) return;

      const applyUrl = href.startsWith("http") ? href : `https://nodesk.co${href}`;
      const freshnessMinutes = parseAgeMinutes(timeText);
      if (jobs.some(j => j.url === applyUrl)) return;
      jobs.push({ id:`nodesk-${jobs.length}-${Date.now()}`, title,
        company: company || "Unknown", location:"Remote",
        platform:"NoDesk", postedDate: timeText || "Recently",
        postedAtMs: Date.now() - freshnessMinutes * 60_000, freshnessMinutes,
        url: applyUrl, type: guessJobType(title) });
    });
    log(`NoDesk: ${jobs.length} jobs`);
  } catch (err) { console.error("NoDesk error:", err); }
  return jobs;
}

// ─── Category → job title mapping ────────────────────────────────────────────
// Keys must match the `label` values used in job-board.tsx CATEGORIES.
// Used by: LinkedIn (always passes full list).

const CATEGORY_TITLE_MAP: Record<string, string[]> = {
  "All Roles":            ["software engineer", "software developer", "frontend developer"],
  "Software Engineering": ["software engineer", "software developer"],
  "Frontend":             ["frontend developer", "frontend engineer", "react developer"],
  "Backend":              ["backend developer", "backend engineer", "node developer"],
  "Data Science":         ["data scientist", "data analyst", "machine learning engineer"],
  "Product Management":   ["product manager", "product owner", "associate product", "group product manager", "chief product", "VP product", "head of product", "product lead", "APM"],
  "Project Management":   ["project manager", "program manager", "scrum master"],
  "DevOps":               ["devops engineer", "site reliability engineer", "platform engineer"],
  "Mobile":               ["flutter developer", "react native developer", "mobile developer"],
  "Network Support":      ["network engineer", "network administrator", "IT support"],
  "Marketing":            ["marketing manager", "growth manager", "digital marketing manager"],
  "Sales":                ["sales manager", "account executive", "business development manager"],
  "Design":               ["product designer", "UX designer", "UI designer"],
  "Gulf Jobs":            ["software engineer", "frontend developer", "backend developer"],
};


// ─── Deduplication ────────────────────────────────────────────────────────────

// Two-pass dedup:
//   Pass 1 — URL: catches the same posting linked from multiple sources.
//   Pass 2 — company|title: collapses the same role when the same company
//             posts to multiple ATS platforms (e.g. Greenhouse + Lever).
//             Skipped when company is "Unknown" — poor ATS parsing would
//             otherwise collapse all anonymous ATS jobs into a single entry.
function deduplicate(jobs: ScrapedJob[]): ScrapedJob[] {
  const seenUrls = new Set<string>();
  const seenKeys = new Set<string>();
  return jobs.filter(job => {
    if (seenUrls.has(job.url)) return false;
    seenUrls.add(job.url);
    if (job.company && job.company !== "Unknown") {
      const key = `${job.company.toLowerCase().trim()}|${job.title?.toLowerCase().trim()}`;
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
    }
    return true;
  });
}

// ─── Per-scraper timeout ──────────────────────────────────────────────────────
// Hard 12-second limit per scraper. Timed-out scrapers are treated as rejected
// by Promise.allSettled → contribute [] to the result pool.
// Increased from 8s → 12s because JSearch (RapidAPI) was timing out at 8s
// and getting cut from the response (visible in logs: it appeared after the 200).

const SCRAPER_TIMEOUT_MS = 12_000;

function withTimeout(promise: Promise<ScrapedJob[]>, name: string, timeoutMs = SCRAPER_TIMEOUT_MS): Promise<ScrapedJob[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${name} scraper timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    promise.then(
      val => { clearTimeout(timer); resolve(val); },
      err => { clearTimeout(timer); reject(err); }
    );
  });
}

// ─── SCRAPER: Instahyre ───────────────────────────────────────────────────────

async function scrapeInstahyreJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("INSTAHYRE")) return [];
  const jobs: ScrapedJob[] = [];
  try {
    const res = await fetch("https://instahyre.com/api/v1/opportunity/?format=json", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) { console.warn(`Instahyre: HTTP ${res.status}`); return []; }
    const data = await res.json();
    // API may return { results: [...] } or a plain array
    const items: any[] = Array.isArray(data) ? data : (data?.results ?? data?.opportunities ?? []);
    const queryLower = query.toLowerCase();
    for (const item of items) {
      const title   = item?.title ?? item?.job_title ?? item?.role ?? "";
      if (!title) continue;
      // Soft-filter by query — show all if query=all
      if (query !== "all" && !title.toLowerCase().includes(queryLower.split(" ")[0])) continue;
      const company  = item?.company?.name ?? item?.company_name ?? item?.company ?? "Unknown";
      const location = item?.location ?? item?.city ?? "";
      const url      = item?.apply_url ?? item?.url ?? item?.job_url
        ?? `https://www.instahyre.com/jobs/${item?.id ?? ""}`;
      if (!url || jobs.some(j => j.url === url)) continue;
      const rawDate  = item?.created_at ?? item?.posted_at ?? item?.date ?? "";
      const postedAtMs = rawDate ? parseDateMs(String(rawDate)) : UNKNOWN_DATE_MS();
      jobs.push({
        id:               `instahyre-${jobs.length}-${Date.now()}`,
        title,
        company,
        location:         location || "India",
        platform:         "Instahyre",
        postedDate:       msToPostedDate(postedAtMs),
        postedAtMs,
        freshnessMinutes: msToPastMinutes(postedAtMs),
        url,
        type:             guessJobType(title),
      });
    }
    log(`Instahyre: ${jobs.length} jobs for "${query}"`);
  } catch (err) { console.error("Instahyre error:", err); }
  return jobs;
}

// ─── SCRAPER: Internshala ─────────────────────────────────────────────────────

async function scrapeInternshalaJobs(query: string): Promise<ScrapedJob[]> {
  if (!isEnabled("INTERNSHALA")) return [];
  const jobs: ScrapedJob[] = [];
  try {
    const html = await curlFetch("https://internshala.com/jobs/");
    const $ = cheerio.load(html);
    const q = query.toLowerCase();

    $(".individual_internship, [class*='individual_internship']").each((_i, el) => {
      const card    = $(el);
      const title   = card.find(".job-internship-name, .profile, [class*='profile']").first().text().trim();
      const company = card.find(".company_name, [class*='company_name']").first().text().trim();
      const loc     = card.find(".location_link, [class*='location']").first().text().trim();
      const timeText = card.find(".status-inactive, [class*='posted'], [class*='date']").first().text().trim();
      const href    = card.find("a.view_detail_button, a[href*='/job-detail/'], a[href*='/jobs/']").first().attr("href")
                   ?? card.find("a").first().attr("href");
      if (!title || !href) return;
      if (query !== "all" && !title.toLowerCase().includes(q)) return;
      const applyUrl = href.startsWith("http") ? href : `https://internshala.com${href}`;
      if (jobs.some(j => j.url === applyUrl)) return;
      const freshnessMinutes = parseAgeMinutes(timeText);
      jobs.push({
        id:               `internshala-${jobs.length}-${Date.now()}`,
        title,
        company:          company || "Unknown",
        location:         loc || "India",
        platform:         "Internshala",
        postedDate:       timeText || "Recently",
        postedAtMs:       Date.now() - freshnessMinutes * 60_000,
        freshnessMinutes,
        url:              applyUrl,
        type:             guessJobType(title),
      });
    });
    log(`Internshala: ${jobs.length} jobs`);
  } catch (err) { console.error("Internshala error:", err); }
  return jobs;
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

async function loadJobs(query: string, category: string): Promise<ScrapedJob[]> {
  // Resolve job-title list for the selected category.
  // Used by LinkedIn (full title list, always).
  const categoryTitles = CATEGORY_TITLE_MAP[category] ?? CATEGORY_TITLE_MAP["Software Engineering"]!;

  const results = await Promise.allSettled([
    // LinkedIn always uses the full category title list regardless of the query param.
    // Other scrapers use `query` for text-based filtering.
    withTimeout(scrapeLinkedInJobs(categoryTitles),                 "LinkedIn"),
    withTimeout(scrapeRemoteRocketshipJobs(query),                  "RemoteRocketship"),
    withTimeout(scrapeRemotiveJobs(query),                          "Remotive"),
    withTimeout(scrapeRemoteOKJobs(query),                          "RemoteOK"),
    withTimeout(scrapeWorkingNomadsJobs(query),                     "WorkingNomads"),
    withTimeout(scrapeWeWorkRemotelyJobs(query),                    "WeWorkRemotely"),
    withTimeout(scrapeJobspressoJobs(query),                        "Jobspresso"),
    withTimeout(scrapeRemoteCoJobs(query),                          "RemoteCo"),
    withTimeout(scrapeGitHubRepoJobs(query),                        "GitHubRepos"),
    withTimeout(scrapeSimplyHiredJobs(query),                       "SimplyHired"),
    withTimeout(scrapeEuropeRemotelyJobs(query),                    "EuropeRemotely"),
    withTimeout(scrapeNoDeskJobs(query),                            "NoDesk"),
    withTimeout(scrapeInstahyreJobs(query),                         "Instahyre"),
    withTimeout(scrapeInternshalaJobs(query),                       "Internshala"),
  ]);

  // ── Stage 1: raw counts straight out of Promise.allSettled ────────────────
  const SCRAPER_NAMES = [
    "LinkedIn", "RemoteRocketship", "Remotive", "RemoteOK",
    "WorkingNomads", "WeWorkRemotely", "Jobspresso", "RemoteCo",
    "GitHubRepos", "SimplyHired", "EuropeRemotely", "NoDesk",
    "Instahyre", "Internshala",
  ];
  const rawCounts: Record<string, number> = {};
  results.forEach((r, i) => {
    const name = SCRAPER_NAMES[i] ?? `scraper-${i}`;
    rawCounts[name] = r.status === "fulfilled" ? r.value.length : 0;
  });
  log("[SCRAPER AUDIT] RAW: " +
    SCRAPER_NAMES.map(n => `${n}: ${rawCounts[n] ?? 0}`).join(" | "));

  const scraped: ScrapedJob[] = results.flatMap(r => r.status === "fulfilled" ? r.value : []);
  const unique = deduplicate(scraped);
  if (unique.length === 0) return FALLBACK_JOBS;

  // ── Stage 1.5: category title guard ───────────────────────────────────────
  // For Product Management, require the job title to actually contain one of
  // the category terms. Prevents LinkedIn loose matches ("account manager",
  // "quality manager", "social media manager") from leaking through.
  const categoryGuarded = category === "Product Management"
    ? (() => {
        const passed: ScrapedJob[] = [];
        const rejected: string[] = [];
        for (const j of unique) {
          if (categoryTitles.some(term => j.title.toLowerCase().includes(term.toLowerCase()))) {
            passed.push(j);
          } else {
            rejected.push(j.title);
          }
        }
        if (rejected.length > 0) {
          log(`[PM FILTER] Rejected ${rejected.length}/${unique.length} jobs:`);
          rejected.forEach(t => log(`[PM FILTER]   REJECTED: "${t}"`));
        }
        return passed;
      })()
    : unique;

  // ── Stage 2: after freshness filter ───────────────────────────────────────
  const fresh = categoryGuarded
    .filter(j => (j.freshnessMinutes ?? 10080) <= getFreshnessWindow(j.platform))
    .sort((a, b) => (a.freshnessMinutes ?? 10080) - (b.freshnessMinutes ?? 10080));

  const freshCounts: Record<string, number> = {};
  for (const j of fresh) freshCounts[j.platform] = (freshCounts[j.platform] ?? 0) + 1;
  log("[SCRAPER AUDIT] AFTER FRESHNESS: " +
    SCRAPER_NAMES.map(n => {
      if (n === "WorkingNomads")   return `WorkingNomads: ${freshCounts["Working Nomads"] ?? 0}`;
      if (n === "WeWorkRemotely")  return `WeWorkRemotely: ${freshCounts["We Work Remotely"] ?? 0}`;
      return `${n}: ${freshCounts[n] ?? 0}`;
    }).join(" | "));

  return fresh.length > 0 ? fresh : FALLBACK_JOBS;
}

// ─── Global sort: freshest first ──────────────────────────────────────────────

function sortByFreshness(jobs: ScrapedJob[]): ScrapedJob[] {
  return [...jobs].sort((a, b) => (a.freshnessMinutes ?? 10080) - (b.freshnessMinutes ?? 10080));
}

// ─── Gulf location helper ─────────────────────────────────────────────────────

const GULF_KEYWORDS = /\b(uae|dubai|abu[\s-]?dhabi|qatar|saudi|bahrain|kuwait|oman|doha|riyadh|sharjah|muscat|jeddah|gulf)\b/i;

function isGulfLocation(job: ScrapedJob): boolean {
  if (job.platform === "NaukriGulf") return true;
  return GULF_KEYWORDS.test(job.location ?? "");
}

// ─── Post-scrape filters: search text + location ──────────────────────────────

const JUNIOR_SIGNALS = /\b(associate|junior|jr\.?|entry[\s-]?level|intern|fresher|trainee|graduate)\b/i;
const SENIOR_SIGNALS = /\b(senior|sr\.?|lead|principal|staff|head|director|vp|architect|chief|manager)\b/i;

function applyPostFilters(
  jobs: ScrapedJob[],
  searchText: string,
  locationFilter: string
): ScrapedJob[] {
  let result = jobs;

  if (searchText.trim()) {
    const words = searchText.trim().toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const isJuniorQuery = JUNIOR_SIGNALS.test(searchText);
    const isSeniorQuery = SENIOR_SIGNALS.test(searchText);

    result = result.filter(job => {
      const title = (job.title ?? "").toLowerCase();
      // All significant words must appear in the title
      if (!words.every(w => title.includes(w))) return false;
      // Seniority gate: junior query → reject senior titles, and vice versa
      if (isJuniorQuery && SENIOR_SIGNALS.test(title)) return false;
      if (isSeniorQuery && JUNIOR_SIGNALS.test(title)) return false;
      return true;
    });
  }

  if (locationFilter && locationFilter !== "Worldwide") {
    result = result.filter(job => {
      const loc = (job.location ?? "").toLowerCase();
      if (locationFilter === "Remote") {
        return !loc || loc.includes("remote") || loc.includes("anywhere") || loc.includes("worldwide");
      }
      if (locationFilter === "India") {
        return loc.includes("india");
      }
      if (locationFilter === "Gulf") {
        return isGulfLocation(job);
      }
      return true;
    });
  }

  return result;
}

// ─── Platform diversity: no more than N consecutive slots from one platform ───
// Jobs are already sorted by freshness. Any run longer than maxConsecutive is
// deferred to the end of the list (still returned, just not bunched together).

function diversifyPlatform(jobs: ScrapedJob[], maxConsecutive: number): ScrapedJob[] {
  const result: ScrapedJob[] = [];
  const deferred: ScrapedJob[] = [];
  let consecutive = 0;
  let lastPlatform = "";
  for (const job of jobs) {
    const wouldBe = job.platform === lastPlatform ? consecutive + 1 : 1;
    if (wouldBe > maxConsecutive) {
      deferred.push(job);
    } else {
      result.push(job);
      lastPlatform = job.platform;
      consecutive = wouldBe;
    }
  }
  return [...result, ...deferred];
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query          = searchParams.get("query")          || "all";
    const category       = searchParams.get("category")       || "All Roles";
    const searchText     = searchParams.get("searchText")     || "";
    const locationFilter = searchParams.get("locationFilter") || "Worldwide";
    const page           = Math.max(1, parseInt(searchParams.get("page")  || "1", 10));
    const limit          = Math.max(1, parseInt(searchParams.get("limit") || "9", 10));

    const scraped  = await loadJobs(query, category);
    const filtered = applyPostFilters(scraped, searchText, locationFilter);
    const filteredCounts: Record<string, number> = {};
    for (const j of filtered) filteredCounts[j.platform] = (filteredCounts[j.platform] ?? 0) + 1;
    log("[SCRAPER AUDIT] AFTER POST-FILTERS: " + [
      `LinkedIn: ${filteredCounts["LinkedIn"] ?? 0}`,
      `RemoteRocketship: ${filteredCounts["RemoteRocketship"] ?? 0}`,
      `Remotive: ${filteredCounts["Remotive"] ?? 0}`,
      `RemoteOK: ${filteredCounts["RemoteOK"] ?? 0}`,
      `WorkingNomads: ${filteredCounts["Working Nomads"] ?? 0}`,
      `WeWorkRemotely: ${filteredCounts["We Work Remotely"] ?? 0}`,
      `Jobspresso: ${filteredCounts["Jobspresso"] ?? 0}`,
      `RemoteCo: ${filteredCounts["RemoteCo"] ?? 0}`,
      `GitHubRepos: ${filteredCounts["GitHubRepos"] ?? 0}`,
      `SimplyHired: ${filteredCounts["SimplyHired"] ?? 0}`,
      `EuropeRemotely: ${filteredCounts["EuropeRemotely"] ?? 0}`,
      `NoDesk: ${filteredCounts["NoDesk"] ?? 0}`,
      `Instahyre: ${filteredCounts["Instahyre"] ?? 0}`,
      `Internshala: ${filteredCounts["Internshala"] ?? 0}`,
      `| total: ${filtered.length}`,
    ].join(" | "));

    const capped = diversifyPlatform(sortByFreshness(filtered), 3);
    const sorted = capped;
    const start  = (page - 1) * limit;

    return NextResponse.json({ jobs: sorted.slice(start, start + limit), total: sorted.length });
  } catch (err) {
    console.error("Jobs API error:", err);
    return NextResponse.json({ jobs: FALLBACK_JOBS, total: FALLBACK_JOBS.length });
  }
}
