import Link from "next/link";
import { cn } from "@/lib/utils";
import { BlogPostMeta, getCategoryGradient } from "./types";

interface SidebarTopPostsProps {
  posts: BlogPostMeta[];
}

export default function SidebarTopPosts({ posts }: SidebarTopPostsProps) {
  const formattedDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <aside className="mt-8 lg:mt-0 lg:pl-10 lg:border-l-2 lg:border-border-soft">
      {/* Section label */}
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-500 mb-3">
        Top Posts
      </p>

      {/*
        Desktop (lg+): vertical list, all items, border-b between items
        Below lg: horizontal scrollable strip; items 4+ hidden; compact card width
      */}
      <ul className="flex lg:flex-col gap-3 lg:gap-0 overflow-x-auto scrollbar-hide lg:overflow-visible">
        {posts.map((post, index) => (
          <li
            key={post._id}
            className={cn(
              // Horizontal card width on mobile/tablet; auto on desktop
              "flex-shrink-0 w-[200px] sm:w-56 lg:w-auto",
              // Hide items 4+ on non-desktop
              index >= 3 ? "hidden lg:flex" : "flex",
              // Divider only on vertical desktop list
              "lg:border-b lg:border-border-soft lg:last:border-b-0"
            )}
          >
            <Link
              href={`/blog/${post.slug}`}
              className="flex lg:flex-row gap-3 lg:gap-3.5 py-3 lg:py-4 w-full group hover:opacity-75 transition-opacity"
            >
              {/* Thumbnail — 56px on mobile/tablet, 72px on desktop */}
              <div className="flex-shrink-0 w-14 h-14 lg:w-[72px] lg:h-[72px] rounded-(--jf-radius-frame) overflow-hidden">
                {post.image?.url ? (
                  <img
                    src={post.image.url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full h-full bg-gradient-to-br",
                      getCategoryGradient(post.category)
                    )}
                  />
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col justify-center gap-1 min-w-0">
                <p className="text-[12px] lg:text-[13px] font-semibold text-ink-900 line-clamp-2 leading-snug group-hover:text-sapphire-bright transition-colors">
                  {post.title}
                </p>
                <p className="text-[10px] lg:text-[11px] text-ink-500 leading-none whitespace-nowrap">
                  {formattedDate(post.publishedAt)}&nbsp;·&nbsp;{post.readTime}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
