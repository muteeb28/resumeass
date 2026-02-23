"use client";

import { motion } from "motion/react";
import { Navbar } from "./navbar";
import { useState, useEffect } from "react";
import { Button } from "./button";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: string;
  author: {
    name: string;
    bio: string;
  };
  featured?: boolean;
  views: number;
}

interface Category {
  name: string;
  count: number;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch posts with category filter
      const postsQuery = selectedCategory === "All" ? "" : `?category=${encodeURIComponent(selectedCategory)}`;
      const postsResponse = await fetch(`/api/blog/posts${postsQuery}&page=${currentPage}`);
      const postsData = await postsResponse.json();

      if (postsData.success) {
        setPosts(postsData.data.posts);
        setTotalPages(postsData.data.pagination.pages);
      }

      // Fetch other data only on initial load
      if (currentPage === 1) {
        const [featuredResponse, categoriesResponse] = await Promise.all([
          fetch('/api/blog/featured'),
          fetch('/api/blog/categories')
        ]);

        const [featuredData, categoriesData] = await Promise.all([
          featuredResponse.json(),
          categoriesResponse.json()
        ]);

        if (featuredData.success) setFeaturedPosts(featuredData.data);
        if (categoriesData.success) setCategories([{ name: "All", count: 0 }, ...categoriesData.data]);
      }
    } catch (error) {
      console.error('Error fetching blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar tone="light" />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p>Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar tone="light" />

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header - Minimal like the image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">Blog</h1>
            <p className="text-slate-600 text-lg mb-4">
              Career insights, resume tips, and job search strategies from Muteeb Masoodi.
            </p>
            <p className="text-slate-500 text-sm">
              Follow us{" "}
              <a href="#" className="text-slate-700 hover:text-slate-900 underline">
                @resumeassistai
              </a>{" "}
              &{" "}
              <a href="#" className="text-slate-700 hover:text-slate-900 underline">
                LinkedIn
              </a>
            </p>
          </motion.div>

          {/* Category Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${selectedCategory === category.name
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                >
                  {category.name}
                  {category.count > 0 && (
                    <span className="ml-2 text-xs opacity-60">({category.count})</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Featured Posts - Only show if "All" category is selected */}
          {selectedCategory === "All" && featuredPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-8 text-center text-slate-900">Featured</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredPosts.slice(0, 2).map((post, index) => (
                  <motion.article
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="group cursor-pointer"
                    onClick={() => window.location.href = `/blog/${post.slug}`}
                  >
                    <div className="bg-white rounded-lg p-6 h-full border border-slate-200 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </span>
                        <span className="text-slate-500 text-sm">
                          {post.category}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-slate-700 transition-colors">
                        {post.title}
                      </h3>

                      <p className="text-slate-600 mb-6 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <span>{post.author.name}</span>
                        <div className="flex items-center gap-4">
                          <span>{formatDate(post.publishedAt)}</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          )}

          {/* Blog Posts List - Minimal style like the image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-8"
          >
            {posts.map((post, index) => (
              <motion.article
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                className="group cursor-pointer border-b border-slate-200 pb-8 last:border-b-0"
                onClick={() => window.location.href = `/blog/${post.slug}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2 text-sm text-slate-500">
                      <span>{formatDate(post.publishedAt)}</span>
                      <span className="text-slate-400">•</span>
                      <span>{post.readTime}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-700">{post.category}</span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold mb-3 text-slate-900 group-hover:text-slate-700 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-slate-600 mb-4 leading-relaxed">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>By {post.author.name}</span>
                      {post.views > 0 && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span>{post.views} views</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex justify-center items-center gap-4 mt-16"
            >
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Previous
              </Button>

              <span className="text-slate-600">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Next
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/logo.png"
              alt="ResumeAssistAI"
              className="h-16 w-auto object-contain"
            />
          </div>
          <p className="text-slate-500 mb-8">
            AI-powered resume optimization for career success
          </p>
          <div className="flex justify-center gap-8 text-slate-500 text-sm">
            <a href="#" className="hover:text-slate-700 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Support</a>
          </div>
          <p className="text-slate-400 text-sm mt-8">
            © 2026 ResumeAssistAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
