"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "../../lib/utils";

interface TickerPost {
  title: string;
  slug: string;
  category: string;
}

const FALLBACK_POSTS: TickerPost[] = [
  {
    title: "How to Build an ATS-Optimized Resume That Recruiter Filters Won't Ignore",
    slug: "ats-optimized-resume-guide",
    category: "Resume",
  },
  {
    title: "10 Direct cold email scripts that landed Software Engineering interviews in 2026",
    slug: "cold-email-scripts-engineering",
    category: "Career Tips",
  },
  {
    title: "From 0 to Offer: The Ultimate Off-Campus Placement Checklist",
    slug: "off-campus-placement-checklist",
    category: "Jobs",
  },
  {
    title: "Crucial System Design concepts you need to clear Senior/Staff Engineer loops",
    slug: "system-design-interview-concepts",
    category: "Interviews",
  },
  {
    title: "The complete guide to landing high-paying remote roles from Asia & Europe",
    slug: "remote-roles-guide",
    category: "Remote Work",
  },
];

function getCategoryColor(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("resume")) return "text-purple-400";
  if (c.includes("tips") || c.includes("guide")) return "text-sky-400";
  if (c.includes("job")) return "text-emerald-400";
  if (c.includes("interview")) return "text-amber-400";
  if (c.includes("remote")) return "text-pink-400";
  return "text-indigo-400";
}

export function BlogTicker() {
  const [posts, setPosts] = useState<TickerPost[]>(FALLBACK_POSTS);

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const response = await fetch("/api/blog/posts?page=1");
        const data = await response.json();
        if (data.success && Array.isArray(data.data?.posts) && data.data.posts.length > 0) {
          const formatted: TickerPost[] = data.data.posts.map((p: any) => ({
            title: p.title,
            slug: p.slug,
            category: p.category || "Blog",
          }));
          setPosts(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch blog posts for ticker:", err);
      }
    }
    fetchBlogPosts();
  }, []);

  const tickerItems = [...posts, ...posts, ...posts, ...posts];

  return (
    <div className="relative z-40 w-full overflow-hidden border-b border-white/10 bg-navy-900 py-1.5 text-white">
      <style jsx global>{`
        @keyframes ticker-marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.333%, 0, 0);
          }
        }
        .animate-ticker-marquee {
          display: flex;
          width: max-content;
          animation: ticker-marquee 60s linear infinite;
        }
        .animate-ticker-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
      
      <div className="relative flex w-full items-center">
        <div className="animate-ticker-marquee flex items-center gap-16 pl-4">
          {tickerItems.map((post, idx) => (
            <Link
              key={`${post.slug}-${idx}`}
              href={`/blog/${post.slug}`}
              className="group flex w-[280px] shrink-0 items-center justify-between gap-3 text-white transition-opacity hover:opacity-90"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span className={cn(
                  "text-[12px] font-bold tracking-tight shrink-0 select-none",
                  getCategoryColor(post.category)
                )}>
                  {post.category}
                </span>
                <span className="text-[11px] leading-[1.25] font-semibold text-white/90 group-hover:text-white line-clamp-2 min-w-0 overflow-hidden text-ellipsis whitespace-normal">
                  {post.title}
                </span>
              </div>
              <span className="text-white/40 shrink-0 text-[10px] select-none transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
