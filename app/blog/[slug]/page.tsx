"use client"

import { useParams } from 'next/navigation'
import BlogPost from '@/components/blog-post'

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  return <BlogPost slug={slug || "complete-guide-to-job-hunting-in-dubai-2026"} />
}
