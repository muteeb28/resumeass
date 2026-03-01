import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

// Uses curl (bypasses Cloudflare TLS fingerprinting that blocks Node.js fetch).
// Arguments passed as array — no shell injection risk.
async function curlFetch(url: string): Promise<string> {
  const { stdout } = await execFileAsync("curl", [
    "-s", "-L", "--max-time", "15",
    "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "-H", "Accept-Language: en-US,en;q=0.9",
    url,
  ]);
  return stdout;
}

export const runtime = "nodejs";
export const revalidate = 0;

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

const FALLBACK_JOBS: ScrapedJob[] = [
  { id: "fallback-1", title: "Frontend Engineer", company: "Razorpay", location: "Bangalore, India", platform: "LinkedIn", postedDate: "45m ago", postedAtMs: Date.now() - 45 * 60 * 1000, freshnessMinutes: 45, url: "https://www.linkedin.com/jobs/", type: "Full-time" },
  { id: "fallback-2", title: "React Developer", company: "Swiggy", location: "Hyderabad, India", platform: "LinkedIn", postedDate: "30m ago", postedAtMs: Date.now() - 30 * 60 * 1000, freshnessMinutes: 30, url: "https://www.linkedin.com/jobs/", type: "Full-time" },
  { id: "fallback-3", title: "Software Engineer – Full Stack", company: "Flipkart", location: "Bangalore, India", platform: "LinkedIn", postedDate: "55m ago", postedAtMs: Date.now() - 55 * 60 * 1000, freshnessMinutes: 55, url: "https://www.linkedin.com/jobs/", type: "Full-time" },
  { id: "fallback-4", title: "Backend Developer (Node.js)", company: "CRED", location: "Bangalore, India", platform: "LinkedIn", postedDate: "20m ago", postedAtMs: Date.now() - 20 * 60 * 1000, freshnessMinutes: 20, url: "https://www.linkedin.com/jobs/", type: "Full-time" },
  { id: "fallback-5", title: "Associate Product Manager", company: "Zomato", location: "Gurgaon, India", platform: "LinkedIn", postedDate: "50m ago", postedAtMs: Date.now() - 50 * 60 * 1000, freshnessMinutes: 50, url: "https://www.linkedin.com/jobs/", type: "Full-time" },
  { id: "fallback-6", title: "SDE Intern", company: "Amazon", location: "Hyderabad, India", platform: "LinkedIn", postedDate: "10m ago", postedAtMs: Date.now() - 10 * 60 * 1000, freshnessMinutes: 10, url: "https://www.linkedin.com/jobs/", type: "Internship" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function guessJobType(title: string): string {
  const l = title.toLowerCase();
  if (l.includes("intern")) return "Internship";
  if (l.includes("contract") || l.includes("freelance")) return "Contract";
  if (l.includes("part-time") || l.includes("part time")) return "Part-time";
  return "Full-time";
}

function parseAgeMinutes(text: string): number {
  const t = text.toLowerCase().trim();
  if (!t || t === "recently" || t.includes("just now") || t.includes("moment")) return 0;
  const min = t.match(/(\d+)\s*min/);   if (min)  return parseInt(min[1]);
  const hr  = t.match(/(\d+)\s*h/);    if (hr)   return parseInt(hr[1]) * 60;
  const day = t.match(/(\d+)\s*day/);  if (day)  return parseInt(day[1]) * 1440;
  const wk  = t.match(/(\d+)\s*week/); if (wk)   return parseInt(wk[1]) * 10080;
  return Infinity;
}

function msToPastMinutes(ms: number): number {
  return Math.max(0, Math.round((Date.now() - ms) / 60_000));
}

function msToPostedDate(ms: number): string {
  const m = msToPastMinutes(ms);
  if (m < 1)   return "Just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

async function scrapeLinkedInJobs(query: string | string[]): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  const keywords = Array.from(new Set(Array.isArray(query) ? query : [query]));

  for (const keyword of keywords) {
    const enc = encodeURIComponent(keyword);
    for (const start of [0, 25]) {
      const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${enc}&geoId=102713980&f_TPR=r3600&start=${start}&sortBy=DD`;
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "*/*",
          },
        });
        if (!res.ok) { console.error(`LinkedIn: ${res.status} for "${keyword}" start=${start}`); continue; }

        const $ = cheerio.load(await res.text());
        let found = 0;

        $("li").each((_i, el) => {
          const card = $(el);
          const title    = card.find(".base-search-card__title").text().trim();
          const company  = card.find(".base-search-card__subtitle").text().trim();
          const location = card.find(".job-search-card__location").text().trim();
          const link     = card.find("a.base-card__full-link").attr("href") || card.find("a").attr("href");
          const time     = card.find("time").text().trim();

          if (!title || !company || !link) return;
          const cleanUrl = link.split("?")[0];
          if (jobs.some((j) => j.url === cleanUrl)) return;

          const freshnessMinutes = parseAgeMinutes(time);
          jobs.push({
            id: `li-${jobs.length}-${Date.now()}`,
            title, company,
            location: location || "Remote",
            platform: "LinkedIn",
            postedDate: time || "Recently",
            postedAtMs: Date.now() - freshnessMinutes * 60_000,
            freshnessMinutes,
            url: cleanUrl,
            type: guessJobType(title),
          });
          found++;
        });

        console.log(`LinkedIn: ${found} jobs for "${keyword}" start=${start}`);
        if (found === 0) break;
        await new Promise((r) => setTimeout(r, 800));
      } catch (err) {
        console.error(`LinkedIn error "${keyword}" start=${start}:`, err);
      }
    }
  }
  return jobs;
}

// ─── Remotive ─────────────────────────────────────────────────────────────────
// Free public API — no key needed.
// https://remotive.com/api/remote-jobs?category=software-dev&search={q}&limit=20

// ─── RemoteRocketship ─────────────────────────────────────────────────────────
// Uses their category-specific job pages which have tech-filtered listings
// in __NEXT_DATA__ JSON. Jobs are posted throughout the day in batches.

const RRS_CATEGORY_MAP: Record<string, string> = {
  software: "software-engineer",
  engineer: "software-engineer",
  developer: "software-engineer",
  frontend: "software-engineer",
  backend: "software-engineer",
  fullstack: "software-engineer",
  react: "software-engineer",
  node: "software-engineer",
  devops: "software-engineer",
  data: "data-analyst",
  design: "product-designer",
  ux: "product-designer",
  product: "product-manager",
  marketing: "marketing",
  sales: "sales",
};

function queryToRRSCategory(query: string): string {
  const q = query.toLowerCase();
  for (const [kw, cat] of Object.entries(RRS_CATEGORY_MAP)) {
    if (q.includes(kw)) return cat;
  }
  return "software-engineer";
}

async function scrapeRemoteRocketshipJobs(query: string): Promise<ScrapedJob[]> {
  const jobs: ScrapedJob[] = [];
  try {
    const category = queryToRRSCategory(query);
    const url = `https://www.remoterocketship.com/jobs/${category}/`;
    console.log(`RemoteRocketship: fetching "${category}" (query="${query}")`);

    // Node.js fetch gets 403 (Cloudflare TLS fingerprint block) — use curl instead.
    const html = await curlFetch(url);
    const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) { console.warn("RemoteRocketship: __NEXT_DATA__ not found"); return jobs; }

    const data = JSON.parse(match[1]);
    const listings: any[] = data?.props?.pageProps?.initialJobOpenings ?? [];

    for (const job of listings) {
      const title    = job.roleTitle ?? "";
      const company  = job.company?.name ?? "Unknown";
      const location = job.location ?? (job.locationType === "remote" ? "Remote" : "Unknown");
      const applyUrl = job.url || (job.slug ? `https://www.remoterocketship.com/jobs/${job.slug}` : "");
      if (!title || !applyUrl) continue;

      const postedAtMs = job.created_at ? new Date(job.created_at).getTime() : Date.now();

      if (!jobs.some((j) => j.url === applyUrl)) {
        jobs.push({
          id: `rrs-${jobs.length}-${Date.now()}`,
          title, company, location,
          platform: "RemoteRocketship",
          postedDate: msToPostedDate(postedAtMs),
          postedAtMs,
          freshnessMinutes: msToPastMinutes(postedAtMs),
          url: applyUrl,
          type: guessJobType(title),
        });
      }
    }

    console.log(`RemoteRocketship: ${jobs.length} jobs for category "${category}"`);
  } catch (err) {
    console.error("RemoteRocketship error:", err);
  }
  return jobs;
}

// ─── JSearch ──────────────────────────────────────────────────────────────────
// Tries two RapidAPI endpoints with the same key (JSEARCH_API_KEY in .env):
//
//  1. letscrape JSearch  → Google Jobs + Naukri + Glassdoor + LinkedIn
//     Subscribe free at: rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
//
//  2. Advanced JSearch   → Adzuna job listings (fallback if #1 not subscribed)
//     rapidapi.com/webhostpay/api/advanced-jsearch-job-search-salary-intelligence-api

async function scrapeJSearchJobs(query: string): Promise<ScrapedJob[]> {
  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) { console.log("JSearch: JSEARCH_API_KEY not set — skipping"); return []; }

  const jobs: ScrapedJob[] = [];

  // ── Attempt 1: letscrape JSearch (Google Jobs / Naukri / Glassdoor) ─────────
  try {
    const q = query === "all" ? "software engineer in India" : `${query} in India`;
    console.log(`JSearch (letscrape): fetching "${q}"`);
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(q)}&num_pages=1&date_posted=today`,
      { headers: { "X-RapidAPI-Key": apiKey, "X-RapidAPI-Host": "jsearch.p.rapidapi.com" } }
    );

    if (res.ok) {
      const data = await res.json();
      for (const job of (data?.data ?? []) as any[]) {
        const title    = job.job_title ?? "";
        const company  = job.employer_name ?? "Unknown";
        const location = [job.job_city, job.job_country].filter(Boolean).join(", ") || "India";
        const applyUrl = job.job_apply_link ?? "";
        if (!title || !applyUrl || jobs.some((j) => j.url === applyUrl)) continue;

        const empType = (job.job_employment_type ?? "").toUpperCase();
        let type = "Full-time";
        if (empType === "INTERN" || title.toLowerCase().includes("intern")) type = "Internship";
        else if (empType === "PARTTIME") type = "Part-time";
        else if (empType === "CONTRACTOR") type = "Contract";

        const postedAtMs = job.job_posted_at_timestamp
          ? job.job_posted_at_timestamp * 1000 : Date.now();

        jobs.push({
          id: `jsearch-${jobs.length}-${Date.now()}`,
          title, company, location,
          platform: job.job_publisher ?? "Google Jobs",
          postedDate: msToPostedDate(postedAtMs),
          postedAtMs, freshnessMinutes: msToPastMinutes(postedAtMs),
          url: applyUrl, type,
        });
      }
      if (jobs.length > 0) {
        console.log(`JSearch (letscrape): ${jobs.length} jobs`);
        return jobs;
      }
      console.warn("JSearch (letscrape): 0 results or not subscribed — trying Advanced JSearch");
    } else {
      console.warn(`JSearch (letscrape): status ${res.status} — trying Advanced JSearch`);
    }
  } catch (err) {
    console.warn("JSearch (letscrape) error:", err);
  }

  // ── Attempt 2: Advanced JSearch (Adzuna) ─────────────────────────────────────
  try {
    const keyword = query === "all" ? "software engineer" : query;
    console.log(`JSearch (Advanced): fetching "${keyword}"`);
    const res = await fetch(
      `https://advanced-jsearch-job-search-salary-intelligence-api.p.rapidapi.com/job-search?keyword=${encodeURIComponent(keyword)}`,
      {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "advanced-jsearch-job-search-salary-intelligence-api.p.rapidapi.com",
        },
      }
    );

    if (!res.ok) { console.error(`JSearch (Advanced): status ${res.status}`); return jobs; }

    const data = await res.json();
    for (const job of (data?.jobs ?? []) as any[]) {
      const title    = job.job_title ?? "";
      const company  = job.company_name ?? "Unknown";
      const location = job.location ?? "Remote";
      const applyUrl = job.job_url ?? "";
      if (!title || !applyUrl || jobs.some((j) => j.url === applyUrl)) continue;

      const jt = (job.job_type ?? "").toLowerCase();
      let type = "Full-time";
      if (jt.includes("intern") || title.toLowerCase().includes("intern")) type = "Internship";
      else if (jt.includes("contract")) type = "Contract";
      else if (jt.includes("part")) type = "Part-time";

      const postedAtMs = job.posted_date ? new Date(job.posted_date).getTime() : Date.now();

      jobs.push({
        id: `adv-jsearch-${jobs.length}-${Date.now()}`,
        title, company, location,
        platform: "Adzuna",
        postedDate: msToPostedDate(postedAtMs),
        postedAtMs, freshnessMinutes: msToPastMinutes(postedAtMs),
        url: applyUrl, type,
      });
    }
    console.log(`JSearch (Advanced): ${jobs.length} jobs`);
  } catch (err) {
    console.error("JSearch (Advanced) error:", err);
  }

  return jobs;
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

async function loadJobs(query: string): Promise<ScrapedJob[]> {
  // For "all", use 2 keywords so LinkedIn doesn't return 40+ jobs and bury other platforms
  const baseKeywords =
    query === "all"
      ? ["frontend developer", "software engineer"]
      : [query];

  // All scrapers run in parallel
  const [linkedInResult, rrsResult, jsearchResult] = await Promise.allSettled([
    scrapeLinkedInJobs(baseKeywords),
    scrapeRemoteRocketshipJobs(query),
    scrapeJSearchJobs(query),
  ]);

  const scraped: ScrapedJob[] = [
    ...(linkedInResult.status === "fulfilled" ? linkedInResult.value : []),
    ...(rrsResult.status      === "fulfilled" ? rrsResult.value      : []),
    ...(jsearchResult.status  === "fulfilled" ? jsearchResult.value  : []),
  ];

  // Deduplicate by URL
  const unique = scraped.filter(
    (job, i, arr) => arr.findIndex((j) => j.url === job.url) === i
  );

  if (unique.length === 0) return FALLBACK_JOBS;

  // Per-platform freshness rules:
  //  • LinkedIn       → strict 60-minute window (real-time feed)
  //  • RemoteRocketship → any job posted today (since UTC midnight) — user wants these "no matter what"
  //  • Everything else → 60-minute window
  const todayStartMs = (() => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime();
  })();

  const fresh = unique.filter((j) => {
    if (j.platform === "RemoteRocketship") return j.postedAtMs >= todayStartMs;
    return j.freshnessMinutes <= 60;
  });

  return fresh.length > 0 ? fresh : FALLBACK_JOBS;
}

// ─── Interleave by platform ───────────────────────────────────────────────────
// Round-robins across platforms so every page shows a mix, instead of LinkedIn
// filling every slot because its jobs are freshest.

function interleaveByPlatform(jobs: ScrapedJob[]): ScrapedJob[] {
  // Group by platform, sorted newest-first within each group
  const groups = new Map<string, ScrapedJob[]>();
  for (const job of jobs) {
    if (!groups.has(job.platform)) groups.set(job.platform, []);
    groups.get(job.platform)!.push(job);
  }
  for (const g of groups.values()) g.sort((a, b) => b.postedAtMs - a.postedAtMs);

  const queues = Array.from(groups.values());
  const result: ScrapedJob[] = [];
  while (queues.some((q) => q.length > 0)) {
    for (const q of queues) {
      if (q.length > 0) result.push(q.shift()!);
    }
  }
  return result;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "all";
    const page  = Math.max(1, parseInt(searchParams.get("page")  || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "9", 10));

    const jobs   = await loadJobs(query);
    const sorted = [...jobs].sort((a, b) => a.freshnessMinutes - b.freshnessMinutes);
    const start  = (page - 1) * limit;

    return NextResponse.json({ jobs: sorted.slice(start, start + limit), total: sorted.length });
  } catch (err) {
    console.error("Jobs API error:", err);
    return NextResponse.json({ jobs: FALLBACK_JOBS, total: FALLBACK_JOBS.length });
  }
}
