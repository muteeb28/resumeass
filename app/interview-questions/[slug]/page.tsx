"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Brain, ArrowLeft, ExternalLink, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import axios from "@/lib/axios";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";

type Question = {
  title: string;
  question: string;
  topic: string | null;
  difficulty: string | null;
  answer: string | null;
};

export default function CompanyInterviewDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  // Question & Meta States
  const [companyName, setCompanyName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [activeTopicTab, setActiveTopicTab] = useState<string>("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter Settings
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination Parameters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal Control
  const [modal, setModal] = useState<{ open: boolean; topic?: string }>({ open: false });

  // Debounce processing to restrict backend chat alignment spikes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Primary API Data Sync
  useEffect(() => {
    if (!slug) return;

    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/interview/questions/prep/${slug}`, {
          params: {
            page: currentPage,
            limit: 5,
            search: debouncedSearch,
            topic: activeTopicTab,
          },
        });

        if (response.data.success) {
          setQuestions(response.data.questions);
          setCompanyName(response.data.company);
          setSourceUrl(response.data.sourceUrl);
          setTotalPages(response.data.meta.totalPages);
          setTotalItems(response.data.meta.totalQuestions);
          setAvailableTopics(response.data.meta.topics);
        }
      } catch (err) {
        console.error("Error connecting to the single company endpoint:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [slug, currentPage, debouncedSearch, activeTopicTab]);

  return (
    <BackgroundRippleLayout tone="light" contentClassName="pt-6 sm:pt-8">
      <Navbar tone="light" />

      <main className="mx-auto max-w-4xl px-4 pb-24 pt-6 sm:pt-8 sm:px-6 lg:px-8">
        
        {/* ── ACTION BANNER HEADER ──────────────────────────────────────── */}
        <div className="border-b border-neutral-200 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => router.push("/interview-questions")} 
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-neutral-900 flex items-center gap-2">
                {companyName || "Loading..."} <span className="text-xs font-normal text-neutral-400">Interview Hub</span>
              </h1>
              {sourceUrl && (
                <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-amber-700 hover:underline inline-flex items-center gap-0.5 mt-0.5">
                  View original dataset <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in questions..."
              className="h-9 w-full rounded-lg border border-neutral-200 pl-9 pr-3 text-xs focus:outline-none focus:border-neutral-400 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* ── SUB-ROUND FILTER BAR ──────────────────────────────────────── */}
        {availableTopics.length > 0 && (
          <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1.5 border-b border-neutral-100">
            <button
              onClick={() => { setActiveTopicTab(""); setCurrentPage(1); }}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border", !activeTopicTab ? "bg-neutral-900 border-neutral-900 text-white" : "bg-white border-neutral-200 text-neutral-600")}
            >
              All Topics ({totalItems})
            </button>
            {availableTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => { setActiveTopicTab(topic); setCurrentPage(1); }}
                className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border uppercase", activeTopicTab === topic ? "bg-amber-500 border-amber-500 text-slate-950" : "bg-white border-neutral-200 text-neutral-600")}
              >
                {topic}
              </button>
            ))}
          </div>
        )}

        {/* ── MAIN RENDER CORE ────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse bg-neutral-100 border border-neutral-200 rounded-xl" />
            ))}
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:border-neutral-300 transition-colors">
                <div className="flex justify-between items-start gap-4 mb-2.5">
                  <h4 className="text-sm font-bold text-neutral-900 leading-snug">{q.title}</h4>
                  {q.topic && (
                    <span className="shrink-0 text-[9px] font-extrabold tracking-wider border bg-neutral-50 px-2 py-0.5 rounded text-neutral-500 uppercase">
                      {q.topic}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 leading-relaxed bg-neutral-50/50 p-3 rounded-lg border border-neutral-100">
                  {q.question}
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setModal({ open: true, topic: q.topic || undefined })}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-600"
                  >
                    <Brain size={12} /> Simulate this question with AI Coach →
                  </button>
                </div>
              </div>
            ))}

            {/* ── INTERNAL PAGINATION ────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="pt-4 flex items-center justify-between text-xs font-semibold text-neutral-500">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="flex items-center gap-1 border px-3 py-1.5 bg-white rounded-lg disabled:opacity-30"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="flex items-center gap-1 border px-3 py-1.5 bg-white rounded-lg disabled:opacity-30"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed rounded-xl bg-white">
            <HelpCircle className="mx-auto text-neutral-300 mb-2" size={32} />
            <p className="text-xs font-bold text-neutral-700">No specific questions found fitting your criteria.</p>
            <button onClick={() => { setSearch(""); setActiveTopicTab(""); }} className="mt-3 text-xs font-semibold text-amber-700 hover:underline">
              Clear filters
            </button>
          </div>
        )}

        {/* ── INTERACTIVE MOCK COACH MODAL ──────────────────────────────── */}
        <AnimatePresence>
          {modal.open && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModal({ open: false })} border-sm>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} onClick={(e) => e.stopPropagation()} className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 border border-neutral-200 shadow-2xl">
                <button onClick={() => setModal({ open: false })} className="absolute right-4 top-4 text-neutral-400 hover:text-neutral-700">
                  <X size={16} />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Brain size={20} /></div>
                  <div>
                    <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">ResumeAssist Engine</span>
                    <h3 className="text-base font-black text-neutral-900">Adaptive Sandbox Coach</h3>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mb-4 leading-relaxed">
                  Initializing a tailored simulation for <strong className="text-neutral-800">{companyName}</strong> 
                  {modal.topic && <> targeting the <strong className="text-neutral-800 uppercase">{modal.topic}</strong> round blueprint</>}.
                </p>
                <div className="flex gap-2">
                  <Link href="/contact-us" className="flex-1 bg-amber-500 text-slate-950 text-xs font-bold h-10 rounded-lg flex items-center justify-center hover:bg-amber-400">Join Early Access</Link>
                  <button onClick={() => setModal({ open: false })} className="px-4 border text-xs text-neutral-600 font-semibold h-10 rounded-lg hover:bg-neutral-50">Dismiss</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </BackgroundRippleLayout>
  );
}