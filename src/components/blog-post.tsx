"use client";

import { motion } from "motion/react";
import { ArrowRight, Lock, Sparkles } from "lucide-react";
import { Navbar } from "./navbar";
import { Button } from "./button";
import { useUserStore } from "@/stores/useUserStore";
import { useState, useEffect, useMemo } from "react";
import "../styles/blog-prose.css";

interface BlogPostProps {
  slug: string;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  htmlContent?: string | null;
  demoContent?: string | null;
  category: string;
  publishedAt: { $date: string } | string;
  readTime: string;
  author: {
    name: string;
    bio: string;
    avatar?: string;
  };
  image: {
    url: string,
    size: string,
    type: string,
  };
  tags: string[];
  views: number;
  premium?: boolean;
  access?: {
    locked: boolean;
    canReadFullPost: boolean;
    requiresLogin: boolean;
    requiresMembership: boolean;
    cta: "login" | "membership";
  };
}

interface RelatedPost {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  category: string;
  publishedAt: string;
  readTime: string;
}

interface RenderHtmlProps {
  html: string;
  className?: string;
}
function RenderHtml({ html, className = "" }: RenderHtmlProps) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function BlogPost({ slug }: BlogPostProps) {
  const { user, membership } = useUserStore((state) => ({
    user: state.user,
    membership: state.membership,
  }));

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
        setPost(data.data.post || data.data);
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

  const formatDate = (dateInput: any) => {
    const dateString = dateInput?.$date ? dateInput.$date : dateInput;
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasPremiumAccess = useMemo(() => {
    if (!membership || membership.status !== 'active') return false;
    return ['premium', 'ultra'].includes(membership.tier?.toLowerCase() ?? '');
  }, [membership]);

  const access = post?.access;
  const isLocked = access?.locked ?? (!!post?.premium && !hasPremiumAccess);
  const previewContent = isLocked
    ? post?.demoContent || `<p class="text-slate-600">This article preview is locked. Sign in or upgrade to continue reading.</p>`
    : post?.htmlContent || "";
  const jobflixViewBase = process.env.NEXT_PUBLIC_JOBFLIX_VIEW || "";
  const loginHref =
    typeof window !== "undefined"
      ? `${jobflixViewBase}/login?next=${encodeURIComponent(window.location.href)}`
      : `${jobflixViewBase}/login`;
  const membershipHref =
    jobflixViewBase
      ? `${jobflixViewBase}/my-account/membership`
      : "/my-account/membership";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
        <Navbar tone="light" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-900 border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm font-medium text-slate-500 tracking-wide animate-pulse">Gathering the insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar tone="light" />
        <div className="pt-32 flex items-center justify-center px-4">
          <div className="text-center max-w-md bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Article Not Found</h1>
            <p className="text-slate-500 text-sm mb-6">{error}</p>
            <Button
              onClick={() => window.location.href = "/blog"}
              className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-sm"
            >
              Back to Blog Feed
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/60 to-white text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      <Navbar tone="light" />

      {/* Decorative Warm Backlight Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-slate-100/40 via-amber-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Article Header Section */}
      <section className="pt-32 pb-12 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Breadcrumb navigation with precise micro-spacing */}
            <nav className="flex items-center gap-2 text-xs font-medium tracking-wider text-slate-400 uppercase">
              <a href="/blog" className="hover:text-slate-800 transition-colors">
                Blog
              </a>
              <svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-slate-600 font-semibold">{post.category}</span>
            </nav>

            {/* Title / Main Headline */}
            <h1 className="text-3xl md:text-5xl lg:text-[52px] font-black tracking-tight text-slate-900 leading-[1.12] md:leading-[1.15]">
              {post.title}
            </h1>

            {/* Author Meta Details Dashboard Line */}
            <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-sm text-slate-500 pt-2 border-b border-slate-200/70 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center border-2 border-white ring-1 ring-slate-200 shadow-sm relative flex-shrink-0">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold text-xs uppercase tracking-wider">
                      {post.author.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                <div>
                  <span className="block font-semibold text-slate-900 hover:underline cursor-pointer">{post.author.name}</span>
                </div>
              </div>

              <span className="hidden md:inline text-slate-300">|</span>

              <div className="flex items-center gap-5">
                <span className="flex items-center gap-1.5 font-medium">
                  <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 3V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5 font-medium bg-slate-100 px-2.5 py-0.5 rounded-md text-slate-600 text-xs">
                  <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
                  </svg>
                  {post.readTime}
                </span>
                {post.views > 0 && (
                  <span className="font-medium text-slate-400">{post.views.toLocaleString()} views</span>
                )}
              </div>
            </div>

            {/* Inline Hashtag badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-white hover:bg-slate-100/80 cursor-pointer text-slate-600 px-3 py-1 rounded-lg text-xs font-semibold border border-slate-200/80 shadow-2xs transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Dynamic HTML Content Body */}
      <section className="pb-20 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="w-full lg:max-w-5xl mx-auto relative">
            <div
              className={
                isLocked
                  ? "relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-sm"
                  : ""
              }
            >
              <RenderHtml
                html={previewContent}
                className={`w-full ${isLocked ? "max-h-[920px] overflow-hidden px-6 md:px-10 pt-8 pb-24" : ""}`}
              />

              {isLocked && (
                <>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-[1.5px]" />
                  <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-5 md:px-8 md:pb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.15 }}
                      className="mx-auto max-w-4xl rounded-[1.75rem] border border-slate-200/90 bg-white/92 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl md:p-6"
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          {/* FIXED: Changed rounded-2xl to rounded-full and added shrink-0 */}
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
                            <Lock className="h-5 w-5" />
                          </div>
                          <div className="max-w-xl">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                              Members Only
                            </div>
                            <p className="mt-2 text-base font-semibold text-slate-900">
                              {user ? "Unlock the rest of this article" : "Sign in to continue reading"}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {user
                                ? "Your preview ends here. Upgrade your membership to remove the lock, reveal the full article, and keep reading."
                                : "This is only a demo preview. Log in to unlock the full article and finish reading it."}
                            </p>
                          </div>
                        </div>

                        {/* FIXED: Added items-center to keep buttons neat on mobile */}
                        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                          {!user ? (
                            <a
                              href={loginHref}
                              /* FIXED: Added whitespace-nowrap and increased padding to px-6 */
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-transform hover:-translate-y-0.5 hover:bg-slate-800"
                            >
                              Login
                              <ArrowRight className="h-4 w-4" />
                            </a>
                          ) : (
                            <a
                              href={membershipHref}
                              /* FIXED: Added whitespace-nowrap and increased padding to px-6 */
                              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/25 transition-transform hover:-translate-y-0.5 hover:bg-amber-400"
                            >
                              Purchase Membership
                              <ArrowRight className="h-4 w-4" />
                            </a>
                          )}
                          <div className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-medium text-slate-500 whitespace-nowrap">
                            {user ? "Lock fades once your plan is active." : "No account needed to create one."}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Footer Dashboard Block (Bio + Actions Interaction Layer) */}
        <div className="max-w-4xl mx-auto mt-20 space-y-12">

          {/* Luxury Card Author Bio block */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 md:p-10 bg-white border border-slate-200/80 rounded-2xl shadow-xs relative overflow-hidden group hover:shadow-sm transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900 group-hover:bg-indigo-600 transition-colors duration-300" />
            <div className="flex flex-col sm:flex-row items-start gap-6 relative">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-200 shadow-sm relative flex-shrink-0">
                {post.author.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {post.author.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Written by {post.author.name}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                  {post.author.bio}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Share Article Section Container */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center bg-slate-100/50 border border-slate-200/40 rounded-2xl py-8 px-4"
          >
            <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase mb-4">
              Enjoyed the read? Share it forward
            </h3>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                className="bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 text-sm font-medium transition-all shadow-2xs active:scale-98"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      text: post.summary,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Share Content
              </Button>
              <Button
                variant="outline"
                className="bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 text-sm font-medium transition-all shadow-2xs active:scale-98"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Recommended Articles Recommendation Module */}
      {relatedPosts.length > 0 && (
        <section className="py-20 px-4 border-t border-slate-200/80 bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-10">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 text-center">
                More Articles You Might Love
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost, index) => (
                  <div
                    key={relatedPost._id}
                    className="bg-white rounded-2xl p-6 border border-slate-200/70 hover:border-slate-300/90 transition-all duration-300 cursor-pointer group shadow-2xs hover:shadow-md hover:-translate-y-1 flex flex-col justify-between"
                    onClick={() => window.location.href = `/blog/${relatedPost.slug}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <span className="text-slate-700 capitalize">{relatedPost.category}</span>
                        <span>•</span>
                        <span>{relatedPost.readTime}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                        {relatedPost.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                        {relatedPost.summary}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs pt-5 group-hover:text-indigo-600 transition-colors mt-auto">
                      Read now
                      <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-4">
                <Button
                  onClick={() => window.location.href = "/blog"}
                  className="bg-slate-900 text-white hover:bg-slate-800 px-8 py-3 rounded-xl font-medium shadow-sm hover:shadow transition-all"
                >
                  Explore All Articles
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Global Application Footer */}
      <footer className="border-t border-slate-200/80 py-16 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <div className="flex items-center justify-center">
            <img
              src="/logo.png"
              alt="ResumeAssistAI"
              className="h-12 w-auto object-contain brightness-95 opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-normal font-medium">
            AI-powered resume optimization for systematic career success.
          </p>
          <div className="flex justify-center gap-6 text-slate-400 font-medium text-xs tracking-wider uppercase pt-2">
            <a href="#" className="hover:text-slate-800 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-800 transition-colors">Support</a>
          </div>
          <p className="text-slate-400/80 text-xs font-medium pt-4">
            © 2026 ResumeAssistAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
