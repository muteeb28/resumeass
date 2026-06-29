"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Briefcase, ClipboardList, Mail, Building2, Globe, Plane, BookOpen, GraduationCap } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import AuthModal from "./auth-modal";
import { useUserStore } from "../stores/useUserStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

const JOB_LINKS = [
  { name: "Find Jobs", href: "/find-jobs", description: "Browse fresh job openings.", icon: Briefcase },
  { name: "Job Tracker", href: "/job-tracker", description: "Track your applications.", icon: ClipboardList },
  { name: "HR Emails", href: "/hr-emails", description: "Find verified HR contacts.", icon: Mail },
  { name: "Dubai HR", href: "/dubai-hr", description: "UAE hiring contacts.", icon: Building2 },
  { name: "Gulf Jobs", href: "/gulf-jobs", description: "Gulf region opportunities.", icon: Globe },
  { name: "AU & NZ", href: "/au-nz", description: "Australia and New Zealand roles.", icon: Plane },
];

const LEARN_LINKS = [
  { name: "Courses", href: "https://jobflix.in/courses", description: "Video courses and learning paths.", icon: GraduationCap, external: true },
  { name: "Opportunities", href: "http://localhost:3000/opportunities", description: "Explore job and career opportunities.", icon: Briefcase, external: true },
  { name: "Prepare", href: "http://localhost:3000/prepare", description: "Practice problems and interview prep.", icon: ClipboardList, external: true },
  { name: "Interview Questions", href: "/interview-questions", description: "Practice company-wise interview questions.", icon: BookOpen, external: false },
];

export const Navbar = ({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, logout } = useUserStore();
  const isLight = tone === "light";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);

  const router = useRouter();

  const linkCls = cn(
    "transition-colors duration-200 relative group text-sm font-medium",
    isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white"
  );

  const underline = cn(
    "absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r transition-all duration-300 group-hover:w-full",
    isLight ? "from-teal-500 to-emerald-500" : "from-neutral-400 to-neutral-200"
  );

  const mobileLinkCls = cn(
    "block px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
    isLight
      ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
  );

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b",
        isLight ? "bg-white/85 border-slate-200" : "bg-black/80 border-slate-800",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center cursor-pointer"
            onClick={() => router.push("/")}
          >
            <img
              src="/logo.png"
              alt="ResumeAssist AI"
              className="h-10 w-auto object-contain py-1"
            />
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Job Referrals */}
            <motion.a
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              href="/referrals"
              onClick={(e) => { e.preventDefault(); router.push("/referrals"); }}
              className={linkCls}
            >
              Job Referrals
              <span className={underline} />
            </motion.a>

            {/* Jobs dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative group"
            >
              <button
                className={cn(
                  "flex items-center gap-1 transition-colors duration-200 text-sm font-medium",
                  isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white"
                )}
              >
                Jobs
                <ChevronDown
                  size={13}
                  className="opacity-70 group-hover:rotate-180 transition-transform duration-200"
                />
              </button>
              <div className="absolute top-full left-0 w-[480px] pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                <div
                  className={cn(
                    "rounded-xl border p-3 grid grid-cols-2 gap-1",
                    isLight
                      ? "bg-white border-slate-200 shadow-xl shadow-slate-200/60"
                      : "bg-slate-900 border-slate-700/80 shadow-xl shadow-black/30"
                  )}
                >
                  {JOB_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={cn(
                          "flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-150",
                          isLight ? "hover:bg-slate-50" : "hover:bg-slate-800/60"
                        )}
                      >
                        <div
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center mt-0.5",
                            isLight ? "bg-neutral-100 text-neutral-600" : "bg-neutral-500/10 text-neutral-400"
                          )}
                        >
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={cn(
                              "text-sm font-semibold leading-tight",
                              isLight ? "text-neutral-900" : "text-neutral-100"
                            )}
                          >
                            {link.name}
                          </div>
                          <div
                            className={cn(
                              "text-xs mt-0.5 leading-snug",
                              isLight ? "text-slate-500" : "text-slate-400"
                            )}
                          >
                            {link.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Learn dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative group"
            >
              <button
                className={cn(
                  "flex items-center gap-1 transition-colors duration-200 text-sm font-medium",
                  isLight ? "text-slate-600 hover:text-slate-900" : "text-slate-300 hover:text-white"
                )}
              >
                Learn
                <ChevronDown
                  size={13}
                  className="opacity-70 group-hover:rotate-180 transition-transform duration-200"
                />
              </button>
              <div className="absolute top-full left-0 w-[480px] pt-3 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                <div
                  className={cn(
                    "rounded-xl border p-3 grid grid-cols-2 gap-1",
                    isLight
                      ? "bg-white border-slate-200 shadow-xl shadow-slate-200/60"
                      : "bg-slate-900 border-slate-700/80 shadow-xl shadow-black/30"
                  )}
                >
                  {LEARN_LINKS.map((link) => {
                    const Icon = link.icon;
                    const inner = (
                      <>
                        <div
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center mt-0.5",
                            isLight ? "bg-neutral-100 text-neutral-600" : "bg-neutral-500/10 text-neutral-400"
                          )}
                        >
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={cn(
                              "text-sm font-semibold leading-tight",
                              isLight ? "text-neutral-900" : "text-neutral-100"
                            )}
                          >
                            {link.name}
                          </div>
                          <div
                            className={cn(
                              "text-xs mt-0.5 leading-snug",
                              isLight ? "text-slate-500" : "text-slate-400"
                            )}
                          >
                            {link.description}
                          </div>
                        </div>
                      </>
                    );
                    const itemCls = cn(
                      "flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-150",
                      isLight ? "hover:bg-slate-50" : "hover:bg-slate-800/60"
                    );
                    return link.external ? (
                      <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={itemCls}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link key={link.name} href={link.href} className={itemCls}>
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Pricing */}
            <motion.a
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              href="/pricing"
              onClick={(e) => { e.preventDefault(); router.push("/pricing"); }}
              className={linkCls}
            >
              Pricing
              <span className={underline} />
            </motion.a>

            {/* Blog */}
            <motion.a
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              href="/blog"
              onClick={(e) => { e.preventDefault(); router.push("/blog/feed"); }}
              className={linkCls}
            >
              Blog
              <span className={underline} />
            </motion.a>
          </div>

          {/* Desktop Action Buttons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="hidden md:flex items-center space-x-4"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/contact-us")}
              className={cn(
                isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : ""
              )}
            >
              Contact Us
            </Button>
            {user ? (
              <div className="relative group">
                <button
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-medium",
                    isLight ? "bg-slate-900" : "bg-neutral-700"
                  )}
                  aria-haspopup="true"
                  aria-expanded={false}
                >
                  {user.email ? user.email.split("@")[0].slice(0, 2).toUpperCase() : "?"}
                </button>

                <div
                  className={cn(
                    "absolute right-0 mt-2 w-40 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-1 group-hover:translate-y-0 transition-all duration-150 z-50 border",
                    isLight ? "bg-white border-neutral-200" : "bg-slate-800 border-slate-700"
                  )}
                >
                  <a
                    href={`${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/my-account/dashboard/me`}
                    className={cn("block px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}
                  >
                    Profile
                  </a>
                  <a
                    href={`${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/my-account/membership`}
                    className={cn("block px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}
                  >
                    Memberships
                  </a>
                  <Link
                    href="/resume"
                    className={cn("block px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}
                  >
                    My resume
                  </Link>
                  <button
                    onClick={async () => { await logout(); router.replace("/"); }}
                    className={cn("w-full text-left px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.location.href = `${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login?next=${encodeURIComponent(window.location.origin)}`
                }
                className={cn(
                  isLight ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100" : ""
                )}
              >
                Login
              </Button>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "transition-colors duration-200 p-2",
                isLight ? "text-slate-700 hover:text-slate-900" : "text-slate-300 hover:text-white"
              )}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-medium transition-transform active:scale-95",
                    isLight ? "bg-slate-900" : "bg-neutral-700"
                  )}
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                >
                  {user?.email ? user?.email?.split("@")[0].slice(0, 2).toUpperCase() : "?"}
                </button>

                <div
                  className={cn(
                    "absolute right-0 mt-2 w-40 rounded-md shadow-lg transform transition-all duration-150 z-50 border",
                    isLight ? "bg-white border-neutral-200" : "bg-slate-800 border-slate-700",
                    isMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-1"
                  )}
                >
                  <a
                    href={`${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/my-account/dashboard/me`}
                    className={cn("block px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </a>
                  <a
                    href={`${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/my-account/dashboard/me`}
                    className={cn("block px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Orders
                  </a>
                  <button
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await logout();
                      router.replace("/");
                    }}
                    className={cn("w-full text-left px-4 py-2 text-sm", isLight ? "text-neutral-700 hover:bg-neutral-100" : "text-slate-200 hover:bg-slate-700")}
                  >
                    Logout
                  </button>
                </div>

                {isMenuOpen && (
                  <div className="fixed inset-0 z-40 h-full w-full" onClick={() => setIsMenuOpen(false)} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div
                className={cn(
                  "px-2 pt-2 pb-3 space-y-1 rounded-lg mt-2 border",
                  isLight ? "bg-white/95 border-slate-200" : "bg-slate-900/50 border-slate-800"
                )}
              >
                {/* Job Referrals */}
                <a href="/referrals" className={mobileLinkCls} onClick={() => setIsOpen(false)}>
                  Job Referrals
                </a>

                {/* Jobs section — expandable */}
                <div>
                  <button
                    onClick={() => setJobsOpen(!jobsOpen)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                      isLight
                        ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    )}
                  >
                    <span>Jobs</span>
                    <ChevronDown
                      size={14}
                      className={cn("transition-transform duration-200", jobsOpen && "rotate-180")}
                    />
                  </button>
                  {jobsOpen && (
                    <div className="mt-1 ml-3 space-y-1">
                      {JOB_LINKS.map((link) => (
                        <a
                          key={link.name}
                          href={link.href}
                          className={cn(
                            "block px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                            isLight
                              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                          )}
                          onClick={() => { setIsOpen(false); setJobsOpen(false); }}
                        >
                          <span className="block">{link.name}</span>
                          <span className={cn("block text-xs font-normal mt-0.5", isLight ? "text-slate-400" : "text-slate-500")}>
                            {link.description}
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Learn section — expandable */}
                <div>
                  <button
                    onClick={() => setLearnOpen(!learnOpen)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                      isLight
                        ? "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    )}
                  >
                    <span>Learn</span>
                    <ChevronDown
                      size={14}
                      className={cn("transition-transform duration-200", learnOpen && "rotate-180")}
                    />
                  </button>
                  {learnOpen && (
                    <div className="mt-1 ml-3 space-y-1">
                      {LEARN_LINKS.map((link) =>
                        link.external ? (
                          <a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "block px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                              isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            )}
                            onClick={() => { setIsOpen(false); setLearnOpen(false); }}
                          >
                            <span className="block">{link.name}</span>
                            <span className={cn("block text-xs font-normal mt-0.5", isLight ? "text-slate-400" : "text-slate-500")}>
                              {link.description}
                            </span>
                          </a>
                        ) : (
                          <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                              "block px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
                              isLight
                                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                            )}
                            onClick={() => { setIsOpen(false); setLearnOpen(false); }}
                          >
                            <span className="block">{link.name}</span>
                            <span className={cn("block text-xs font-normal mt-0.5", isLight ? "text-slate-400" : "text-slate-500")}>
                              {link.description}
                            </span>
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <a href="/pricing" className={mobileLinkCls} onClick={() => setIsOpen(false)}>
                  Pricing
                </a>

                {/* Blog */}
                <a href="/blog" className={mobileLinkCls} onClick={() => setIsOpen(false)}>
                  Blog
                </a>

                <div className={cn("border-t pt-3 mt-3 space-y-2", isLight ? "border-slate-200" : "border-slate-700")}>
                  <a href="contact-us" className={mobileLinkCls} onClick={() => setIsOpen(false)}>
                    Contact Us
                  </a>
                  <div className="px-3 space-y-2">
                    {!user && (
                      <Button
                        size="sm"
                        className="w-full rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
                        onClick={() =>
                          window.location.href = `${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login?next=${encodeURIComponent(window.location.origin)}`
                        }
                      >
                        Login
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </motion.nav>
  );
};
