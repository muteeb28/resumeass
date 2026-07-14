"use client";

import { useState, useEffect, use } from "react";
import ReactMarkdown from "react-markdown"; // Swapped out MDXRemote
import rehypeHighlight from "rehype-highlight"; // Handles syntax highlighting
import { notFound } from "next/navigation";
import axiosInstance from "@/lib/axios";
import "highlight.js/styles/github-dark.css"; 

const mdxComponents = {
  h1: (props: any) => <h1 {...props} className="text-3xl font-extrabold text-slate-900 dark:text-white mt-8 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2" />,
  h2: (props: any) => <h2 {...props} className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-8 mb-3" />,
  h3: (props: any) => <h3 {...props} className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2" />,
  p: (props: any) => <p {...props} className="text-base text-slate-700 dark:text-slate-300 leading-7 my-4" />,
  ul: (props: any) => <ul {...props} className="list-disc list-inside my-4 pl-4 space-y-2 text-slate-700 dark:text-slate-300" />,
  ol: (props: any) => <ol {...props} className="list-decimal list-inside my-4 pl-4 space-y-2 text-slate-700 dark:text-slate-300" />,
  li: (props: any) => <li {...props} className="text-base" />,
  table: (props: any) => (
    <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 dark:border-slate-800">
      <table {...props} className="w-full text-sm text-left text-slate-700 dark:text-slate-300 border-collapse" />
    </div>
  ),
  thead: (props: any) => <thead {...props} className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold uppercase text-slate-600 dark:text-slate-400" />,
  th: (props: any) => <th {...props} className="px-4 py-3 border-b border-slate-200 dark:border-slate-700" />,
  td: (props: any) => <td {...props} className="px-4 py-3 border-b border-slate-100 dark:border-slate-800" />,
  code: (props: any) => {
    const isInline = !props.className;
    if (isInline) {
      return <code {...props} className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-pink-600 dark:text-pink-400 font-mono text-sm" />;
    }
    return <code {...props} className={`${props.className} font-mono text-sm`} />;
  },
  pre: (props: any) => <pre {...props} className="bg-slate-950 text-slate-100 p-4 rounded-lg my-6 overflow-x-auto shadow-md font-mono" />,
};

interface PageProps {
  params: Promise<{
    slug: string;
    topic: string;
  }>;
}

export default function LessonPage({ params }: PageProps) {
  const { slug, topic } = use(params);

  const [mdxSource, setMdxSource] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/courses/content/${slug}/${topic}`);
        
        if (res.data && res.data.content) {
          setMdxSource(res.data.content);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed fetching MDX content:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [slug, topic]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <span className="text-slate-500">Loading content...</span>
      </div>
    );
  }

  if (error || !mdxSource) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-10">
        
        <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400 mb-6 border-b border-slate-100 dark:border-slate-900 pb-4">
          <span>{slug.replace(/-/g, " ")}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500 dark:text-slate-400">{topic.replace(/-/g, " ")}</span>
        </div>

        <article className="selection:bg-blue-200 dark:selection:bg-blue-800">
          {/* ReactMarkdown cleanly renders the raw string directly on the client */}
          <ReactMarkdown 
            components={mdxComponents}
            rehypePlugins={[rehypeHighlight]}
          >
            {mdxSource}
          </ReactMarkdown>
        </article>

      </div>
    </div>
  );
}