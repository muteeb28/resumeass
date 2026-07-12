import Link from "next/link";
import { cn } from "@/lib/utils";
import { BlogPostMeta, getCategoryGradient } from "./types";

interface FeaturedPostProps {
  post: BlogPostMeta;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article>
        {/*
          Mobile (<lg):   flex-col — image on top (order-1), text below (order-2)
          Desktop (lg+):  flex-row — text left, image right
          1024px:  text col 55%, image col 45% (narrower image so text has room)
          1280px+: text col 48%, image col 52% (full editorial proportion)
        */}
        <div className="flex flex-col lg:flex-row gap-0 lg:items-stretch lg:min-h-[440px] xl:min-h-[500px]">

          {/* LEFT — Editorial text */}
          <div className="flex flex-col justify-center gap-5 lg:gap-6 pt-7 lg:pt-0 lg:pr-8 xl:pr-14 order-2 lg:order-1 lg:w-[55%] xl:w-[48%]">

            {/* Category label — "Featured ●" only shown at xl+ to avoid wrap at 1024px */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-[0.2em] text-ink-500 flex-shrink-0">
                Featured
              </span>
              <span className="hidden xl:inline w-1 h-1 rounded-full bg-sapphire-bright flex-shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sapphire-brand">
                {post.category}
              </span>
            </div>

            {/*
              Fluid headline scaling:
              - Mobile single col → large but not huge
              - md (768px) single col → biggest, most room
              - lg (1024px) text col is ~337px → scale back
              - xl (1280px) text col is ~424px → scale up
              - 2xl (1536px) constrained by max-w-7xl → same column, slightly larger
            */}
            <h2 className="
              text-[1.875rem] leading-[1.08]
              sm:text-[2.2rem]
              md:text-[2.6rem]
              lg:text-[1.875rem]
              xl:text-[2.4rem]
              2xl:text-[2.9rem]
              font-medium text-ink-900 tracking-[-0.02em]
              group-hover:text-ink-700 transition-colors
            ">
              {post.title}
            </h2>

            {/* Excerpt — hidden at lg to avoid overflow in the narrow column */}
            {post.excerpt && (
              <p className="hidden sm:block text-[14px] xl:text-[15px] text-ink-500 leading-relaxed line-clamp-2 xl:line-clamp-3">
                {post.excerpt}
              </p>
            )}

            {/* Author row — flex-wrap so metadata wraps gracefully at 1024px */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 pt-1">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-6 h-6 rounded-full object-cover border border-border-soft flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-surface-alt flex items-center justify-center text-[10px] font-bold text-ink-500 uppercase flex-shrink-0">
                  {post.author.name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-medium text-ink-900 whitespace-nowrap">{post.author.name}</span>
              <span className="text-ink-400 flex-shrink-0">·</span>
              <span className="text-sm text-ink-500 whitespace-nowrap">{formattedDate}</span>
              <span className="text-ink-400 flex-shrink-0">·</span>
              <span className="text-sm text-ink-500 whitespace-nowrap">{post.readTime}</span>
            </div>
          </div>

          {/* RIGHT — Image */}
          <div className="relative order-1 lg:order-2 lg:w-[45%] xl:w-[52%] aspect-[16/10] lg:aspect-auto overflow-hidden rounded-(--jf-radius-panel)">
            {post.image?.url ? (
              <img
                src={post.image.url}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
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

        </div>
      </article>
    </Link>
  );
}
