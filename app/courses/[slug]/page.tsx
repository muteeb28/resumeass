'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { BackgroundRippleLayout } from '@/components/background-ripple-layout';
import axiosInstance from '@/lib/axios';

interface Chapter {
  id: string;
  title: string;
  slug: string;
  order: number;
}

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  level: string;
  duration: string;
  tags: string[];
  chapters: Chapter[];
  prerequisites: string[];
  learningOutcomes: string[];
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'bg-[#EAF0EF] text-[#0FA573]',
  Intermediate: 'bg-[#CFE0FB] text-[#2F7BE0]',
  Advanced: 'bg-[#FEF3C7] text-[#D97706]',
  'All Levels': 'bg-[#F5F8F7] text-[#647B8E]',
};

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchCourse = async () => {
      try {
        const res = await axiosInstance(`/courses/${slug}`);
        const json = res.data;
        setCourse(json);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [slug]);

  return (
    <BackgroundRippleLayout tone="light" showRipple={false} contentClassName="pt-[76px]">
      <Navbar tone="light" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-[#2F7BE0] mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to courses
        </Link>

        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-border-soft rounded-xl w-2/3" />
            <div className="h-4 bg-border-soft rounded-xl w-1/3" />
            <div className="h-48 bg-border-soft rounded-2xl mt-6" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
            <p className="text-lg font-semibold text-ink-900">Course not found</p>
            <Link href="/courses" className="text-sm text-[#2F7BE0] hover:underline">Browse all courses</Link>
          </div>
        )}

        {!loading && !error && course && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
            {/* Left: Course info */}
            <div>
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${LEVEL_COLORS[course.level] ?? LEVEL_COLORS['All Levels']}`}>
                  {course.level}
                </span>
                {course.tags?.map((tag) => (
                  <span key={tag} className="text-[10px] bg-[#F5F8F7] text-[#647B8E] px-2.5 py-1 rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-2xl font-bold text-ink-900 tracking-tight leading-snug mb-3">
                {course.title}
              </h1>

              <div className="flex items-center gap-4 text-sm text-ink-500 mb-5">
                {course.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} /> {course.duration}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <BookOpen size={13} /> {course.chapters?.length ?? 0} chapters
                </span>
              </div>

              {course.description && (
                <p className="text-[15px] text-ink-600 leading-relaxed mb-6">{course.description}</p>
              )}

              {/* Course thumbnail */}
              {course.image && (
                <div className="aspect-video rounded-2xl overflow-hidden mb-6 border border-[#EEF2F1]">
                  <img src={`/courses/${course.slug}.jpg`} alt={course.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Learning outcomes */}
              {course.learningOutcomes?.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold text-ink-900 mb-3 uppercase tracking-wider">What you&apos;ll learn</h2>
                  <ul className="space-y-2">
                    {course.learningOutcomes.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                        <span className="mt-1 w-4 h-4 rounded-full bg-[#EAF0EF] text-[#0FA573] flex items-center justify-center flex-shrink-0 text-[9px] font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites?.length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-ink-900 mb-3 uppercase tracking-wider">Prerequisites</h2>
                  <ul className="space-y-1.5">
                    {course.prerequisites.map((item, i) => (
                      <li key={i} className="text-sm text-ink-500 flex items-start gap-2">
                        <span className="text-ink-300 mt-0.5">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Chapters sidebar */}
            <div className="border border-[#EEF2F1] rounded-2xl overflow-hidden bg-white sticky top-24">
              <div className="px-4 py-3 border-b border-[#EEF2F1]">
                <h2 className="text-sm font-bold text-ink-900">Course Content</h2>
                <p className="text-[11px] text-ink-400 mt-0.5">{course.chapters?.length ?? 0} chapters</p>
              </div>

              {course.chapters?.length === 0 ? (
                <p className="text-sm text-ink-400 px-4 py-6 text-center">No chapters yet</p>
              ) : (
                <ul className="divide-y divide-[#EEF2F1]">
                  {[...course.chapters]
                    .sort((a, b) => a.order - b.order)
                    .map((chapter, idx) => (
                      <li key={chapter.id}>
                        <Link
                          href={`/courses/${course.slug}/${chapter.slug}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F8F7] transition-colors group"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#F5F8F7] text-[#647B8E] text-[10px] font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-[#CFE0FB] group-hover:text-[#2F7BE0] transition-colors">
                            {idx + 1}
                          </span>
                          <span className="text-[13px] text-ink-700 group-hover:text-[#2F7BE0] transition-colors flex-1 leading-snug">
                            {chapter.title}
                          </span>
                          <ChevronRight size={13} className="text-ink-300 group-hover:text-[#2F7BE0] flex-shrink-0" />
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </BackgroundRippleLayout>
  );
}
