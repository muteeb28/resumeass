"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import AuthModal from "./auth-modal";
import { useUserStore } from "../stores/useUserStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JOB_LINKS, LEARN_LINKS } from "./marketing/nav-links";

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
    isLight ? "text-ink-600 hover:text-ink-900" : "text-dark-nav hover:text-white"
  );

  const underline = cn(
    "absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full",
    isLight ? "bg-sapphire-bright" : "bg-sapphire-sky"
  );

  const mobileLinkCls = cn(
    "block px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium",
    isLight
      ? "text-ink-700 hover:text-ink-900 hover:bg-surface-alt"
      : "text-dark-nav hover:text-white hover:bg-white/10"
  );

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b",
        isLight ? "bg-page/85 border-border-soft" : "bg-navy-900/90 border-white/10",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[74px]">
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
                  isLight ? "text-ink-600 hover:text-ink-900" : "text-dark-nav hover:text-white"
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
                    "rounded-[var(--jf-radius-panel)] border p-3 grid grid-cols-2 gap-1",
                    isLight
                      ? "bg-page border-border-soft shadow-[var(--jf-shadow-frame)]"
                      : "bg-navy-900 border-white/10 shadow-xl shadow-black/30"
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
                          isLight ? "hover:bg-surface-alt" : "hover:bg-white/10"
                        )}
                      >
                        <div
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center mt-0.5",
                            isLight ? "bg-surface-alt text-ink-600" : "bg-white/10 text-dark-muted"
                          )}
                        >
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={cn(
                              "text-sm font-semibold leading-tight",
                              isLight ? "text-ink-900" : "text-white"
                            )}
                          >
                            {link.name}
                          </div>
                          <div
                            className={cn(
                              "text-xs mt-0.5 leading-snug",
                              isLight ? "text-ink-500" : "text-dark-muted"
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
                  isLight ? "text-ink-600 hover:text-ink-900" : "text-dark-nav hover:text-white"
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
                    "rounded-[var(--jf-radius-panel)] border p-3 grid grid-cols-2 gap-1",
                    isLight
                      ? "bg-page border-border-soft shadow-[var(--jf-shadow-frame)]"
                      : "bg-navy-900 border-white/10 shadow-xl shadow-black/30"
                  )}
                >
                  {LEARN_LINKS.map((link) => {
                    const Icon = link.icon;
                    const inner = (
                      <>
                        <div
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center mt-0.5",
                            isLight ? "bg-surface-alt text-ink-600" : "bg-white/10 text-dark-muted"
                          )}
                        >
                          <Icon size={15} />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={cn(
                              "text-sm font-semibold leading-tight",
                              isLight ? "text-ink-900" : "text-white"
                            )}
                          >
                            {link.name}
                          </div>
                          <div
                            className={cn(
                              "text-xs mt-0.5 leading-snug",
                              isLight ? "text-ink-500" : "text-dark-muted"
                            )}
                          >
                            {link.description}
                          </div>
                        </div>
                      </>
                    );
                    const itemCls = cn(
                      "flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-150",
                      isLight ? "hover:bg-surface-alt" : "hover:bg-white/10"
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
                isLight ? "text-ink-600 hover:text-ink-900 hover:bg-surface-alt" : "text-white hover:bg-white/10"
              )}
            >
              Contact Us
            </Button>
            {user ? (
              <div className="relative group">
                <button
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full text-white text-sm font-medium",
                    isLight ? "bg-ink-900" : "bg-white/15"
                  )}
                  aria-haspopup="true"
                  aria-expanded={false}
                >
                  {user.email ? user.email.split("@")[0].slice(0, 2).toUpperCase() : "?"}
                </button>

                <div
                  className={cn(
                    "absolute right-0 mt-2 w-40 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-1 group-hover:translate-y-0 transition-all duration-150 z-50 border",
                    isLight ? "bg-page border-border-soft" : "bg-navy-900 border-white/10"
                  )}
                >
                  <a
                    href={`${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/my-account/dashboard/me`}
                    className={cn("block px-4 py-2 text-sm", isLight ? "text-ink-700 hover:bg-surface-alt" : "text-dark-nav hover:bg-white/10")}
                  >
                    Profile
                  </a>
                  <a
                    href={`${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/my-account/membership`}
                    className={cn("block px-4 py-2 text-sm", isLight ? "text-ink-700 hover:bg-surface-alt" : "text-dark-nav hover:bg-white/10")}
                  >
                    Memberships
                  </a>
                  <Link
                    href="/resume"
                    className={cn("block px-4 py-2 text-sm", isLight ? "text-ink-700 hover:bg-surface-alt" : "text-dark-nav hover:bg-white/10")}
                  >
                    My resume
                  </Link>
                  <button
                    onClick={async () => { await logout(); router.replace("/"); }}
                    className={cn("w-full text-left px-4 py-2 text-sm", isLight ? "text-ink-700 hover:bg-surface-alt" : "text-dark-nav hover:bg-white/10")}
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
                  isLight ? "text-ink-700 hover:text-ink-900 hover:bg-surface-alt" : "text-white hover:bg-white/10"
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
                isLight ? "text-ink-700 hover:text-ink-900" : "text-dark-nav hover:text-white"
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
                    isLight ? "bg-ink-900" : "bg-white/15"
                  )}
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                >
                  {user?.email ? user?.email?.split("@")[0].slice(0, 2).toUpperCase() : "?"}
                </button>

                <div
                  className={cn(
                    "absolute right-0 mt-2 w-40 rounded-md shadow-lg transform transition-all duration-150 z-50 border",
                    isLight ? "bg-page border-border-soft" : "bg-navy-900 border-white/10",
                    isMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-1"
                  )}
                >
                  <a
                    href={`${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/my-account/dashboard/me`}
                    className={cn("block px-4 py-2 text-sm", isLight ? "text-ink-700 hover:bg-surface-alt" : "text-dark-nav hover:bg-white/10")}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </a>
                  <a
                    href={`${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/my-account/dashboard/me`}
                    className={cn("block px-4 py-2 text-sm", isLight ? "text-ink-700 hover:bg-surface-alt" : "text-dark-nav hover:bg-white/10")}
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
                    className={cn("w-full text-left px-4 py-2 text-sm", isLight ? "text-ink-700 hover:bg-surface-alt" : "text-dark-nav hover:bg-white/10")}
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
                  isLight ? "bg-page/95 border-border-soft" : "bg-navy-900/80 border-white/10"
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
                        ? "text-ink-700 hover:text-ink-900 hover:bg-surface-alt"
                        : "text-dark-nav hover:text-white hover:bg-white/10"
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
                              ? "text-ink-600 hover:text-ink-900 hover:bg-surface-alt"
                              : "text-dark-muted hover:text-white hover:bg-white/10"
                          )}
                          onClick={() => { setIsOpen(false); setJobsOpen(false); }}
                        >
                          <span className="block">{link.name}</span>
                          <span className={cn("block text-xs font-normal mt-0.5", isLight ? "text-ink-400" : "text-dark-faint")}>
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
                        ? "text-ink-700 hover:text-ink-900 hover:bg-surface-alt"
                        : "text-dark-nav hover:text-white hover:bg-white/10"
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
                                ? "text-ink-600 hover:text-ink-900 hover:bg-surface-alt"
                                : "text-dark-muted hover:text-white hover:bg-white/10"
                            )}
                            onClick={() => { setIsOpen(false); setLearnOpen(false); }}
                          >
                            <span className="block">{link.name}</span>
                            <span className={cn("block text-xs font-normal mt-0.5", isLight ? "text-ink-400" : "text-dark-faint")}>
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
                                ? "text-ink-600 hover:text-ink-900 hover:bg-surface-alt"
                                : "text-dark-muted hover:text-white hover:bg-white/10"
                            )}
                            onClick={() => { setIsOpen(false); setLearnOpen(false); }}
                          >
                            <span className="block">{link.name}</span>
                            <span className={cn("block text-xs font-normal mt-0.5", isLight ? "text-ink-400" : "text-dark-faint")}>
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

                <div className={cn("border-t pt-3 mt-3 space-y-2", isLight ? "border-border-soft" : "border-white/10")}>
                  <a href="contact-us" className={mobileLinkCls} onClick={() => setIsOpen(false)}>
                    Contact Us
                  </a>
                  <div className="px-3 space-y-2">
                    {!user && (
                      <Button
                        size="sm"
                        className="w-full"
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
