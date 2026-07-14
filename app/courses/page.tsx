'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { BackgroundRippleLayout } from '@/components/background-ripple-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  status: string;
  chapters: Chapter[];
}

interface Meta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'bg-[#EAF0EF] text-[#0FA573]',
  Intermediate: 'bg-[#CFE0FB] text-[#2F7BE0]',
  Advanced: 'bg-[#FEF3C7] text-[#D97706]',
  'All Levels': 'bg-[#F5F8F7] text-[#647B8E]',
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchCourses = useCallback(async (p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (q) params.set('search', q);
      const res = await axiosInstance(`/courses?${params}`);
      const json = res.data;
      setCourses(json.data ?? []);
      setMeta(json.meta ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(page, query);
  }, [page, query, fetchCourses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  };

  return (
    <BackgroundRippleLayout tone="light" showRipple={false} contentClassName="pt-[76px]">
      <Navbar tone="light" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Courses</h1>
            {meta && (
              <p className="text-sm text-ink-500 mt-1">{meta.totalItems} courses available</p>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses..."
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button type="submit" size="sm" className="h-9 bg-[#2F7BE0] hover:bg-[#1D5FD8] text-white font-semibold">
              Search
            </Button>
          </form>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-border-soft rounded-2xl h-56" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
            <p className="text-lg font-semibold text-ink-900">No courses found</p>
            <p className="text-sm text-ink-500">Try a different search term</p>
            {query && (
              <Button variant="outline" size="sm" onClick={() => { setSearch(''); setQuery(''); setPage(1); }}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="group block">
                <div className="border border-[#EEF2F1] rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200 bg-white h-full flex flex-col">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-to-br from-sapphire-50 to-page overflow-hidden">
                    {course.image ? (
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[#2F7BE0]/20">
                        {course.title.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level] ?? LEVEL_COLORS['All Levels']}`}>
                        {course.level}
                      </span>
                      {course.duration && (
                        <span className="text-[11px] text-ink-400">{course.duration}</span>
                      )}
                    </div>

                    <h3 className="text-[15px] font-semibold text-ink-900 leading-snug group-hover:text-[#2F7BE0] transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    {course.description && (
                      <p className="text-[13px] text-ink-500 line-clamp-2 leading-relaxed flex-1">
                        {course.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#EEF2F1]">
                      <span className="text-[11px] text-ink-400">
                        {course.chapters?.length ?? 0} chapters
                      </span>
                      {course.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] bg-[#F5F8F7] text-[#647B8E] px-2 py-0.5 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-ink-500 px-2">
              Page {meta.currentPage} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </BackgroundRippleLayout>
  );
}
