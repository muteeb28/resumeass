import Link from "next/link";
import { cn } from "@/lib/utils";
import { BlogPostMeta, getCategoryGradient } from "./types";

interface PostCardProps {
  post: BlogPostMeta;
}

export default function PostCard({ post }: PostCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article>
        {/* Image — no card border, just clean rounded image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-(--jf-radius-frame) mb-4">
          {post.image?.url ? (
            <img
              src={post.image.url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
          ) : (
            <div
              className={cn(
                "w-full h-full bg-gradient-to-br",
                getCategoryGradient(post.category)
              )}
            />
          )}
          {/* Category chip overlay */}
          <span className="absolute bottom-3 left-3 bg-page/90 backdrop-blur-sm text-ink-900 text-[9px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-(--jf-radius-mini)">
            {post.category}
          </span>
        </div>

        {/* Text — open, no container */}
        <div className="space-y-2">
          {/* Meta: author · date · read time */}
          <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
            <span className="font-medium">{post.author.name}</span>
            <span className="text-ink-400">·</span>
            <span>{formattedDate}</span>
            <span className="text-ink-400">·</span>
            <span>{post.readTime}</span>
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-semibold text-ink-900 line-clamp-2 leading-snug group-hover:text-sapphire-bright transition-colors">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-[13px] text-ink-500 line-clamp-2 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
