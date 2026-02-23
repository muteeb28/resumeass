"use client";

import { motion } from "motion/react";
import { Navbar } from "./navbar";
import { Button } from "./button";
import { useState, useEffect } from "react";
import "../styles/blog-prose.css";

interface BlogPostProps {
  slug: string;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string;
  readTime: string;
  author: {
    name: string;
    bio: string;
  };
  tags: string[];
  views: number;
}

interface RelatedPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: string;
}

export default function BlogPost({ slug }: BlogPostProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blog/posts/${slug}`);
      const data = await response.json();

      if (data.success) {
        setPost(data.data.post);
        setRelatedPosts(data.data.relatedPosts || []);
      } else {
        setError(data.error || 'Post not found');
      }
    } catch (err) {
      setError('Failed to load blog post');
      console.error('Error fetching blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar tone="light" />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
            <p>Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar tone="light" />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-slate-600 mb-6">{error}</p>
            <Button
              onClick={() => window.location.href = "/blog"}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar tone="light" />

      {/* Article Header */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
              <a
                href="/blog"
                className="hover:text-slate-700 transition-colors"
              >
                Blog
              </a>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-slate-700">{post.category}</span>
            </div>

            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              {post.category}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-slate-900">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {post.author.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span className="font-medium text-slate-900">{post.author.name}</span>
              </div>
              <span>•</span>
              <span>{formatDate(post.publishedAt)}</span>
              <span>•</span>
              <span>{post.readTime}</span>
              {post.views > 0 && (
                <>
                  <span>•</span>
                  <span>{post.views} views</span>
                </>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm border border-slate-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-lg max-w-none prose-slate"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Author Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">
                  {post.author.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  About {post.author.name}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {post.author.bio}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 text-center"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Share this article
            </h3>
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      text: post.excerpt,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share
              </Button>
              <Button
                variant="outline"
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 px-4 border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">
                Related Articles
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.div
                    key={relatedPost._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-slate-300 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md"
                    onClick={() => window.location.href = `/blog/${relatedPost.slug}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-slate-700 text-sm">{relatedPost.category}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 text-sm">{relatedPost.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-slate-700 font-medium text-sm group-hover:gap-3 transition-all">
                      Read article
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Button
                  onClick={() => window.location.href = "/blog"}
                  className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-3"
                >
                  View All Articles
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

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
