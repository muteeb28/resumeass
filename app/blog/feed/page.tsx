'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

// 1. Types matching your Mongoose Schema metadata
interface BlogAuthor {
  name: string;
  bio?: string;
  avatar?: string;
}

interface BlogImage {
  url?: string;
  size?: string;
  type?: string;
}

interface BlogPostMeta {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  description: string;
  image?: BlogImage;
  isPublished: boolean;
  author: BlogAuthor;
  category: string;
  tags: string[];
  featured: boolean;
  publishedAt: string;
  readTime: string;
  views: number;
  likes: number;
  premium: boolean;
}

interface ApiResponse {
  success: boolean;
  data: BlogPostMeta[];
  hasMore: boolean;
  error?: string;
}

export default function BlogFeed() {
  const [blogs, setBlogs] = useState<BlogPostMeta[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const nextPageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const fetchBlogs = async (pageToLoad: number): Promise<void> => {
    if (loadingRef.current || (!hasMoreRef.current && pageToLoad !== 1)) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const res = await axiosInstance.get<ApiResponse>("/blog/feed", {
        params: { page: pageToLoad },
      });

      const result = res.data;

      if (result.success) {
        setBlogs((prev) =>
          pageToLoad === 1 ? result.data : [...prev, ...result.data]
        );
        setHasMore(result.hasMore);
        hasMoreRef.current = result.hasMore;
        nextPageRef.current = pageToLoad + 1;
      }
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  // Load the first page immediately, then let scroll fetch the rest.
  useEffect(() => {
    fetchBlogs(1);
  }, []);

  // Stable Intersection Observer setup
  useEffect(() => {
    const currentLoader = loaderRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchBlogs(nextPageRef.current);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Feed Stream */}
      <div className="space-y-6">
        {blogs.map((blog) => (
          <article 
            key={blog._id} 
            className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 ease-in-out"
          >
            <Link href={`/blog/${blog.slug}`} className="group block">
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-6">
                
                {/* Meta Text Content */}
                <div className="flex-1 space-y-3">
                  
                  {/* Author Header */}
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    {blog.author?.avatar ? (
                      <div className="relative w-6 h-6 rounded-full overflow-hidden border border-gray-100">
                        <img 
                          src={blog.author.avatar} 
                          alt={blog.author.name || 'Author'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      // Fallback Author Initial Avatar
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 uppercase">
                        {blog.author?.name?.charAt(0) || 'A'}
                      </div>
                    )}
                    <span className="font-medium hover:underline">{blog.author?.name}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500">
                      {new Date(blog.publishedAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    {blog.premium && (
                      <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                        ★ Premium
                      </span>
                    )}
                  </div>

                  {/* Title & Summary */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {blog.title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2 md:line-clamp-3 leading-relaxed">
                      {blog.summary || blog.description}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="bg-gray-100 px-2.5 py-1 rounded-full text-gray-700 font-medium">
                        {blog.category}
                      </span>
                      <span>{blog.readTime}</span>
                    </div>
                  </div>
                </div>

                {/* Cover Image / Dynamic Placeholder */}
                <div className="w-full sm:w-40 h-28 flex-shrink-0 bg-gray-50 overflow-hidden rounded-lg relative border border-gray-100">
                  {blog.image?.url ? (
                    <img 
                      src={blog.image.url} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    /* Minimalist Medium-Style Geometric Placeholder when image is missing */
                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 text-center select-none">
                      <span className="text-xs font-bold text-gray-400 tracking-wider uppercase opacity-60">
                        {blog.category || 'Read'}
                      </span>
                      <div className="w-6 h-[2px] bg-gray-300 my-1"></div>
                      <span className="text-[10px] text-gray-400 italic">No Image</span>
                    </div>
                  )}
                </div>

              </div>
            </Link>
          </article>
        ))}
      </div>

      {/* Trigger element for Infinite Scroll */}
      <div ref={loaderRef} className="w-full flex justify-center py-10 mt-4">
        {loading && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        )}
        {!hasMore && blogs.length > 0 && (
          <p className="text-sm text-gray-400 font-serif italic">You've caught up with everything.</p>
        )}
      </div>
    </div>
  );
}