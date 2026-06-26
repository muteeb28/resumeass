"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
  Users,
  X,
  Lock,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUserStore } from "../../src/stores/useUserStore";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";

// ─── Constants ───────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  {
    quote: "Finally found a referral without awkward LinkedIn cold messages. Super easy and quick.",
    name: "Ajay",
    role: "Development Engineer",
    company: "Zebronics",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    quote: "Secured interviews at Microsoft within a week of asking. The community is incredibly helpful.",
    name: "Neha Sharma",
    role: "Software Engineer",
    company: "Microsoft",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    quote: "As a referrer, I love how easy it is to find high-quality candidates without the clutter.",
    name: "Rohan Gupta",
    role: "Senior PM",
    company: "Google",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    quote: "Simple, transparent, and direct. Got referred to Amazon and started my prep immediately.",
    name: "Priya Nair",
    role: "Data Scientist",
    company: "Amazon",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80",
  },
  {
    quote: "Highly recommend ResumeAssist referrals. Got referred to Razorpay and cracked the interview.",
    name: "Vikram Malhotra",
    role: "SDE-2",
    company: "Razorpay",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80",
  },
];




const initialForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  description: "",
  desiredJob: "",
  experience: "",
};

const AVATAR_PALETTES = [
  { bg: "bg-neutral-100", text: "text-neutral-700" },
  { bg: "bg-slate-100", text: "text-slate-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
  { bg: "bg-zinc-100", text: "text-zinc-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAvatarPalette(name: string) {
  const hash = [...(name || "?")].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTES[hash % AVATAR_PALETTES.length];
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="h-16 w-16 rounded-full bg-neutral-100" />
        <div className="h-4 w-3/4 rounded bg-neutral-100" />
        <div className="h-3 w-1/2 rounded bg-neutral-100" />
        <div className="h-3 w-2/3 rounded bg-neutral-100" />
      </div>
      <div className="mt-4 h-9 w-full rounded-xl bg-neutral-100" />
    </div>
  );
}

function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-neutral-800">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

type RevealData = { name: string | null; email: string; phone: string | null };
type RevealState = RevealData | "loading" | "error";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReferralsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const [searchInput, setSearchInput] = useState("");
  const [referrerQuery, setReferrerQuery] = useState("");
  const [referrers, setReferrers] = useState<any[]>([]);
  const [referrerLoading, setReferrerLoading] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, RevealState>>({});

  const { user, membership } = useUserStore();
  const router = useRouter();

  const hasFullAccess = membership?.status === "active" &&
    (membership?.tier === "premium" || membership?.tier === "ultra");
  const hasAccess = hasFullAccess;
  const loading = false;
  const loginHref = `${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login`;
  const membershipHref = "/pricing";

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [contactModalData, setContactModalData] = useState<{
    name: string;
    email?: string;
    phone?: string;
  } | null>(null);

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const handleContactClick = (profile: any) => {
    const revealState = revealed[profile._id];
    if (revealState && typeof revealState === "object") {
      setContactModalData({
        name: profile.name || revealState.name || "Referrer",
        email: revealState.email,
        phone: revealState.phone ?? undefined,
      });
    } else {
      revealContact(profile._id);
    }
  };

  const fetchReferrers = useCallback(async (search: string, page = 1) => {
    setReferrerLoading(true);
    try {
      const res = await axiosInstance.get("/referrers", {
        params: { search: search.trim(), limit: hasFullAccess ? 12 : 6, page, fetchFromFile: true },
      });
      setReferrers(res.data?.data?.referrers || []);
    } catch {
      setReferrers([]);
    } finally {
      setReferrerLoading(false);
    }
  }, [hasFullAccess]);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(
      () => fetchReferrers(referrerQuery),
      referrerQuery ? 300 : 0
    );
    return () => clearTimeout(timer);
  }, [referrerQuery, fetchReferrers, user]);

  const handleSearch = () => {
    setReferrerQuery(searchInput);
    setCurrentPage(1);
  };

  const revealContact = async (id: string) => {
    setRevealed((prev) => ({ ...prev, [id]: "loading" }));
    try {
      const res = await axiosInstance.post(`/referrers/${id}/reveal-contact`);
      const data = res.data.data;
      setRevealed((prev) => ({ ...prev, [id]: data }));
      setContactModalData({
        name: data.name || "Referrer",
        email: data.email,
        phone: data.phone,
      });
    } catch {
      setRevealed((prev) => ({ ...prev, [id]: "error" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.replace(loginHref);
      return;
    }
    if (!hasAccess) return; // Guard submission
    if (Object.values(formData).some((value) => !value.trim())) {
      toast.error("Please complete every field before sending your referral request.");
      return;
    }
    try {
      setSubmitting(true);
      const response = await axiosInstance.post("/referrals", formData);
      if (response.data?.success) {
        toast.success("Referral request sent successfully.");
        setFormData(initialForm);
        setIsModalOpen(false);
      } else {
        toast.error(response.data?.message || "Something went wrong.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit referral request.");
    } finally {
      setSubmitting(false);
    }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  const hasActiveFilters = Boolean(referrerQuery);
  const displayList = referrers;
  const totalPages = Math.ceil(displayList.length / PAGE_SIZE);
  const paginatedList = displayList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <BackgroundRippleLayout tone="light" contentClassName="pt-6 sm:pt-8">
      <Navbar tone="light" />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:pt-8 sm:px-6 lg:px-8">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="pt-4 pb-6 sm:pt-6 sm:pb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            <Link
              href="/referrals/list"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              Looking for open referral opportunities? Browse Referral Opportunities
              <ArrowRight className="h-3 w-3" />
            </Link>
            <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
              Connect with professionals who are willing to refer &amp; guide you
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-neutral-500">
              Browse referrers at top companies, or submit your own referral request and let the right people find you.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
                className="h-11 rounded-xl px-6"
              >
                Ask for referral
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl border-neutral-200 bg-white px-6 text-neutral-800 shadow-sm hover:bg-neutral-50"
              >
                <Link href="/referrals/list">
                  View referrals board
                </Link>
              </Button>
            </div>

            <p className="text-sm text-neutral-500">
              Work at a company and can refer?{" "}
              <Link
                href="/referrals/become-referrer"
                className="font-semibold text-neutral-900 underline-offset-2 hover:underline"
              >
                Become a referrer →
              </Link>
            </p>
          </motion.div>
        </section>

        {/* ── UNIFIED CENTER COLUMN ───────────────────────────────────── */}
        <div className="mx-auto max-w-3xl w-full mb-8 space-y-5">
          {/* Rotating Testimonials */}
          <div className="rounded-2xl border border-[#e6e6e3] bg-white px-6 py-5 text-center shadow-sm w-full min-h-[140px] sm:min-h-[120px] flex flex-col justify-between overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col h-full justify-between"
              >
                <p className="text-sm italic leading-relaxed text-neutral-600">
                  &ldquo;{TESTIMONIALS[currentTestimonial].quote}&rdquo;
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <img
                    src={TESTIMONIALS[currentTestimonial].avatar}
                    alt={TESTIMONIALS[currentTestimonial].name}
                    className="h-8 w-8 flex-shrink-0 rounded-full object-cover border border-neutral-100"
                  />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-neutral-900">
                      {TESTIMONIALS[currentTestimonial].name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {TESTIMONIALS[currentTestimonial].role} @ {TESTIMONIALS[currentTestimonial].company}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <Search className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${hasFullAccess ? "text-neutral-400" : "text-neutral-300"}`} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => hasFullAccess && setSearchInput(e.target.value)}
              onKeyDown={(e) => hasFullAccess && e.key === "Enter" && handleSearch()}
              placeholder={hasFullAccess ? "Skills/Designation/Company" : "Search requires Premium or Ultra membership"}
              disabled={!hasFullAccess}
              className={`h-14 w-full rounded-2xl border border-[#e6e6e3] bg-white pl-10 pr-24 sm:pl-12 sm:pr-36 text-sm placeholder:text-neutral-400 transition-colors focus:outline-none ${
                hasFullAccess
                  ? "text-neutral-900 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10"
                  : "text-neutral-300 cursor-not-allowed bg-neutral-50 select-none"
              }`}
            />
            {searchInput && hasFullAccess && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setReferrerQuery("");
                  setCurrentPage(1);
                }}
                className="absolute right-[4.5rem] sm:right-[7.5rem] top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-700"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {!hasFullAccess && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Lock className="h-4 w-4 text-neutral-300" />
              </div>
            )}
            {hasFullAccess && (
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-xl bg-amber-500 px-3 sm:px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-400 active:scale-[0.98]"
              >
                Search
              </button>
            )}
          </div>

          {/* Banner */}
          <div className="flex flex-col gap-3 rounded-2xl border border-[#e6e6e3] bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-neutral-900">
                  Got openings? Refer candidates in 30 seconds
                </p>
                <p className="text-xs text-neutral-500">
                  Share a referral, make an impact, earn recognition
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="primary"
              className="h-10 flex-shrink-0 rounded-xl px-5 text-sm"
            >
              <Link href="/referrals/become-referrer">
                + Become a Referrer
              </Link>
            </Button>
          </div>
        </div>

        {/* ── RESULTS AREA ──────────────────────────────────────────────── */}
        <div>
          {!hasFullAccess && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Lock className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {!user ? "Sign in to unlock the full referrer directory" : "Upgrade to Premium or Ultra to unlock the full directory"}
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {!user
                      ? "You're viewing 6 featured profiles. Log in and upgrade to search and browse all referrers."
                      : "You're viewing 6 profiles. Premium & Ultra members get full search access and the complete referrer list."}
                  </p>
                </div>
              </div>
              {!user ? (
                <a
                  href={loginHref}
                  className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-amber-500 px-4 h-9 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors"
                >
                  Log in <ArrowRight className="h-3 w-3" />
                </a>
              ) : (
                <Link
                  href={membershipHref}
                  className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-amber-500 px-4 h-9 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors"
                >
                  Upgrade now <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          )}

          {referrerLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : displayList.length === 0 ? (
            <div className="py-12 text-center">
              <UserCheck className="mx-auto h-8 w-8 text-neutral-300" />
              <p className="mt-3 text-sm font-medium text-neutral-900">
                No profiles relevant to this requirement found.
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Try different keywords or remove some filters.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setReferrerQuery("");
                    setCurrentPage(1);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:underline"
                  type="button"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedList.map((item: any, index: number) => {
                const itemId = item._id;
                const name = item.name || "Verified Referrer";
                const designation = item.designation;
                const company = item.company;
                const about = item.about || item.description || `Professional willing to refer and guide candidates at ${company}.`;

                const imageFile = item.imageFile || null;
                const hasImage = imageFile && !imageErrors[imageFile];
                const imagePath = imageFile ? `/refer/${encodeURIComponent(imageFile)}` : "";

                const palette = getAvatarPalette(company || "");
                const initial = (name?.[0] || company?.[0] || "?").toUpperCase();
                const revealState = revealed[item._id];

                return (
                  <motion.div
                    key={itemId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="h-1.5 w-full rounded-t-2xl -mt-5 -mx-5 mb-5 bg-gradient-to-r from-neutral-200 to-neutral-50" />
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="mb-3 h-16 w-16 flex-shrink-0">
                        {hasImage ? (
                          <img
                            src={imagePath}
                            alt={name}
                            onError={() =>
                              setImageErrors((prev) => ({ ...prev, [imageFile!]: true }))
                            }
                            className="h-16 w-16 rounded-full object-cover border-2 border-white ring-2 ring-neutral-100 shadow-sm"
                          />
                        ) : (
                          <div
                            className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold border-2 border-white ring-2 ring-neutral-100 shadow-sm ${palette.bg} ${palette.text}`}
                          >
                            {initial}
                          </div>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-neutral-900 line-clamp-1">
                        {name}
                      </h4>
                      {designation && (
                        <p className="text-xs font-semibold text-neutral-500 mt-0.5 line-clamp-1">
                          {designation}
                        </p>
                      )}
                      {company && (
                        <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                          {company}
                        </p>
                      )}

                      <p className="text-xs text-neutral-500 leading-relaxed mt-3 mb-4 line-clamp-3 text-center w-full min-h-[48px]">
                        {about}
                      </p>
                    </div>

                    <div className="mt-auto w-full">
                      {revealState === undefined && (
                        <button
                          onClick={() => handleContactClick(item)}
                          className="h-9 w-full rounded-xl bg-amber-500 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400 active:scale-[0.98]"
                        >
                          Contact
                        </button>
                      )}
                      {revealState === "loading" && (
                        <button
                          disabled
                          className="h-9 w-full rounded-xl bg-neutral-400 text-xs font-semibold text-white cursor-not-allowed"
                        >
                          Revealing...
                        </button>
                      )}
                      {revealState === "error" && (
                        <button
                          onClick={() => handleContactClick(item)}
                          className="h-9 w-full rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        >
                          Failed — Retry
                        </button>
                      )}
                      {revealState &&
                        revealState !== "loading" &&
                        revealState !== "error" && (
                          <button
                            onClick={() => handleContactClick(item)}
                            className="h-9 w-full rounded-xl bg-amber-500 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400 active:scale-[0.98]"
                          >
                            Contact
                          </button>
                        )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && !referrerLoading && displayList.length > 0 && hasFullAccess && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-9 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-neutral-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-9 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── SEEKER MODAL (ASK FOR REFERRAL) ───────────────────────────── */}
      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 px-4 py-6 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8 flex flex-col">
            
            {/* Clear Close Button (Always Active) */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 z-40 rounded-full border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-800"
              aria-label="Close referral form"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pr-10 flex-shrink-0">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-neutral-500">
                Ask for referral
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
                Tell us about the opportunity you want
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Share the basics and we&apos;ll save it as a referral request.
              </p>
            </div>

            {/* ── CONTAINER (Blurs and freezes input field stack if no membership) ── */}
            <div className="relative flex-1 overflow-y-auto mt-6 pr-1">
              <form 
                onSubmit={handleSubmit} 
                className={`space-y-5 pb-2 transition-all duration-300 ${!hasAccess && !loading ? 'blur-[1px] select-none opacity-70 pointer-events-none' : ''}`}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" required>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Jane Doe"
                      className="h-11 rounded-xl border-neutral-200 focus-visible:ring-neutral-900/10"
                    />
                  </Field>
                  <Field label="Email" required>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="h-11 rounded-xl border-neutral-200 focus-visible:ring-neutral-900/10"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Phone number" required>
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="h-11 rounded-xl border-neutral-200 focus-visible:ring-neutral-900/10"
                    />
                  </Field>
                  <Field label="Desired job" required>
                    <Input
                      value={formData.desiredJob}
                      onChange={(e) => setFormData({ ...formData, desiredJob: e.target.value })}
                      placeholder="Frontend Developer"
                      className="h-11 rounded-xl border-neutral-200 focus-visible:ring-neutral-900/10"
                    />
                  </Field>
                </div>

                <Field label="Experience" required>
                  <Input
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="3 years in React and Next.js"
                    className="h-11 rounded-xl border-neutral-200 focus-visible:ring-neutral-900/10"
                  />
                </Field>

                <Field label="Description" required>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about your background, what roles you're targeting, and any useful context."
                    className="min-h-[140px] rounded-2xl border-neutral-200 p-4 focus-visible:ring-neutral-900/10"
                  />
                </Field>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="h-11 rounded-xl border-neutral-200 bg-white px-5 text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 rounded-xl bg-neutral-900 px-5 text-white hover:bg-neutral-700"
                  >
                    {submitting ? "Sending..." : "Submit referral request"}
                  </Button>
                </div>
              </form>

              {/* ── LOCK OVERLAY CONTAINER ── */}
              {!hasAccess && !loading && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-t from-white via-white/80 to-white/20 p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white/90 p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur-md"
                  >
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-white shadow-md mb-3">
                      <Lock className="h-4 w-4" />
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600">
                      <Sparkles className="h-3 w-3 fill-amber-500 text-amber-500" />
                      Members Only
                    </div>

                    <h3 className="mt-2 text-base font-black tracking-tight text-neutral-950">
                      {user ? "Unlock Referral Matching" : "Sign in to request referrals"}
                    </h3>
                    
                    <p className="mt-2 text-xs leading-relaxed text-neutral-500 px-4">
                      Active membership tiers instantly lift the referral request constraint, matching your profile directly into the tracking pipeline of top internal referrers.
                    </p>

                    <div className="mt-5">
                      {!user ? (
                        <a
                          href={loginHref}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 h-11 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 transition-colors"
                        >
                          Login to Unlock
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      ) : (
                        <a
                          href={membershipHref}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 h-11 text-xs font-bold text-neutral-950 shadow-sm hover:bg-amber-400 transition-colors tracking-wide"
                        >
                          Upgrade Tier Instantly
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : null}

      {/* ── CONTACT DETAILS MODAL ─────────────────────────────────────── */}
      {contactModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 px-4 py-6 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-2xl overflow-hidden">
            <button
              onClick={() => setContactModalData(null)}
              className="absolute right-4 top-4 z-40 rounded-full border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-800"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mt-2 relative">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-neutral-500">
                Contact Referrer
              </p>
              <h3 className="mt-2 text-lg font-black tracking-tight text-neutral-950 truncate px-4">
                {contactModalData.name}
              </h3>

              {/* --- Added Book Appointment Header Feature --- */}
              <div className="mt-3 mb-12 flex items-center justify-center gap-2 px-4 py-1.5 bg-neutral-50 border border-neutral-100 rounded-full w-fit mx-auto">
                <span className="text-xs font-semibold text-neutral-600">Book Appointment</span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-neutral-900 text-white px-2 py-0.5 rounded-full scale-90">
                  Coming Soon
                </span>
              </div>

              {/* --- Blurred Contact Details Container --- */}
              <div
                className={`mt-6 space-y-4 text-left border-t border-neutral-100 pt-4 transition-all duration-500 ${!hasAccess && !loading
                    ? 'blur-md select-none opacity-40 pointer-events-none'
                    : ''
                  }`}
              >
                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Email
                  </p>
                  {contactModalData.email ? (
                    <a
                      href={`mailto:${contactModalData.email}`}
                      className="mt-1 block text-sm font-semibold text-neutral-900 hover:underline break-all"
                    >
                      {contactModalData.email}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-neutral-500 italic font-medium">
                      Not added yet
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Phone
                  </p>
                  {contactModalData.phone ? (
                    <p className="mt-1 text-sm font-semibold text-neutral-900 break-all">
                      {contactModalData.phone}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-neutral-500 italic font-medium">
                      Not added yet
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => setContactModalData(null)}
                  className="mt-8 w-full h-10 rounded-xl bg-neutral-900 text-xs font-semibold text-white hover:bg-neutral-700"
                >
                  Close
                </Button>
              </div>

              {/* --- Premium Paywall Overlay --- */}
              {!hasAccess && !loading && (
                <div className="absolute inset-x-0 bottom-0 top-24 z-30 flex flex-col items-center justify-end bg-gradient-to-t from-white via-white/95 to-transparent pt-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.08)] backdrop-blur-md text-center"
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-neutral-950 text-white shadow-md mb-3">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-amber-600">
                      <Sparkles className="h-3 w-3 fill-amber-500 text-amber-500" />
                      Premium Feature
                    </div>
                    <h4 className="mt-1 text-sm font-bold text-neutral-900">
                      {user ? "Unlock Contact Information" : "Sign in to view details"}
                    </h4>
                    <p className="mt-1 text-[11px] leading-relaxed text-neutral-500 px-2">
                      Gain instant access to verified direct emails, phone numbers, and hidden internal network tags.
                    </p>
                    <div className="mt-4">
                      {!user ? (
                        <a
                          href={loginHref}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-neutral-950 h-10 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 transition-colors"
                        >
                          Login to Unlock
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      ) : (
                        <a
                          href={membershipHref}
                          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-500 h-10 text-xs font-bold text-neutral-950 shadow-sm hover:bg-amber-400 transition-colors tracking-wide"
                        >
                          Upgrade Tier Now
                          <ArrowRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </BackgroundRippleLayout>
  );
}
