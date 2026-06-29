'use client';

import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '@/lib/axios';
import { Navbar } from '@/components/navbar';
import CategoryTabs from '@/components/blog/CategoryTabs';
import FeaturedPost from '@/components/blog/FeaturedPost';
import SidebarTopPosts from '@/components/blog/SidebarTopPosts';
import NewsletterBox from '@/components/blog/NewsletterBox';
import PostsGrid from '@/components/blog/PostsGrid';
import { BlogPostMeta, ApiResponse } from '@/components/blog/types';

export default function BlogFeedPage() {
  const [allPosts, setAllPosts] = useState<BlogPostMeta[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchPage = async (page: number) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get<ApiResponse>('/blog/posts', {
        params: { page },
      });
      if (res.data.success) {
        const { posts, pagination } = res.data.data;
        setAllPosts((prev) => (page === 1 ? posts : [...prev, ...posts]));
        setTotalPages(pagination.pages);
        setCurrentPage(pagination.current);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const handleLoadMore = () => {
    if (!loading && currentPage < totalPages) {
      fetchPage(currentPage + 1);
    }
  };

  // ── Derived state (client-side) ────────────────────────────────────────────
  const featuredPost = useMemo<BlogPostMeta | undefined>(() => {
    return allPosts.find((p) => p.featured) ?? allPosts[0];
  }, [allPosts]);

  const topPosts = useMemo<BlogPostMeta[]>(() => {
    return [...allPosts]
      .filter((p) => p._id !== featuredPost?._id)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [allPosts, featuredPost]);

  const categories = useMemo<string[]>(() => {
    const unique = Array.from(new Set(allPosts.map((p) => p.category)));
    return ['All', ...unique];
  }, [allPosts]);

  const filteredPosts = useMemo<BlogPostMeta[]>(() => {
    const withoutFeatured = allPosts.filter((p) => p._id !== featuredPost?._id);
    if (activeCategory === 'All') return withoutFeatured;
    return withoutFeatured.filter((p) => p.category === activeCategory);
  }, [allPosts, featuredPost, activeCategory]);

  const isFirstLoad = loading && allPosts.length === 0;
  const isLastPage = currentPage >= totalPages;

  return (
    <>
      <Navbar tone="light" />

      <main className="pt-16 bg-[#fbfbf8] min-h-screen">

        {/* ── Category navigation — editorial strip ───────────────────── */}
        <CategoryTabs
          categories={categories}
          active={activeCategory}
          onSelect={setActiveCategory}
        />

        {/* ── First-load skeleton ─────────────────────────────────────── */}
        {isFirstLoad && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
            <div className="grid lg:grid-cols-[1fr_300px] gap-12">
              <div className="animate-pulse bg-[#e6e6e3] rounded-2xl h-[420px]" />
              <div className="animate-pulse bg-[#e6e6e3] rounded-2xl h-[420px]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-[#e6e6e3] rounded-xl h-64" />
              ))}
            </div>
          </div>
        )}

        {/* ── Hero section ────────────────────────────────────────────── */}
        {!isFirstLoad && featuredPost && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 lg:pt-14 pb-6 lg:pb-14">
            {/* Two-column: [featured content] [sidebar] */}
            <div className="grid lg:grid-cols-[1fr_300px] gap-12 items-start">

              {/* Left: large featured post + newsletter */}
              <div>
                <FeaturedPost post={featuredPost} />
                <NewsletterBox />
              </div>

              {/* Right: top posts sidebar */}
              <SidebarTopPosts posts={topPosts} />
            </div>
          </section>
        )}

        {/* Thin section divider */}
        {!isFirstLoad && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-t border-[#e6e6e3]" />
          </div>
        )}

        {/* ── Recent posts ────────────────────────────────────────────── */}
        {!isFirstLoad && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-16 lg:pb-20">

            {filteredPosts.length > 0 ? (
              <PostsGrid
                posts={filteredPosts}
                onClearFilter={() => setActiveCategory('All')}
              />
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
                <p className="text-xl font-bold text-[#0b0b0b] tracking-tight">
                  You&apos;re all caught up.
                </p>
                <p className="text-sm text-[#6b6b6b] max-w-sm leading-relaxed">
                  Explore more career resources or check back soon for new articles.
                </p>
                <button
                  onClick={() => setActiveCategory('All')}
                  className="mt-1 border border-amber-500 text-amber-600 hover:bg-amber-50 px-6 py-2.5 text-sm font-medium transition-colors"
                >
                  ← Browse all topics
                </button>
              </div>
            )}

            {/* Load More */}
            {filteredPosts.length > 0 && !isLastPage && (
              <div className="flex justify-center mt-16">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-10 py-3.5 border border-[#0b0b0b] text-[#0b0b0b] text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-[#0b0b0b] hover:text-white transition-all disabled:opacity-40"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Loading
                    </span>
                  ) : (
                    'Load more articles'
                  )}
                </button>
              </div>
            )}

            {/* Caught-up */}
            {filteredPosts.length > 0 && isLastPage && !loading && (
              <p className="text-center text-xs text-[#6b6b6b] italic tracking-wide mt-16">
                — You&apos;ve read everything in this category —
              </p>
            )}

          </section>
        )}

      </main>
    </>
  );
}
