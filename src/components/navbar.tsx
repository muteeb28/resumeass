"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth-modal";
import { useUserStore } from "@/stores/useUserStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JOB_LINKS, LEARN_LINKS } from "@/components/marketing/nav-links";

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
  const [jobsOpen, setJobsOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);

  const router = useRouter();

  // Color Mapping Tokens for Colorful Dynamic Dropdown Icons
  const iconColors = [
    "bg-[#CFE0FB] text-[#2F7BE0]", // Cyan blue
    "bg-[#EAF0EF] text-[#0FA573]", // Mint success green
    "bg-[#F5F8F7] text-[#C77414]", // Warm warning amber
    "bg-[#CFE0FB] text-[#2FA1DC]", // Info bright blue
  ];

  const linkCls = cn(
    "flex items-center gap-1 transition-all duration-300 relative py-2 text-sm font-semibold tracking-tight rounded-lg px-1",
    isLight ? "text-[#0B2A3C] hover:text-[#2F7BE0]" : "text-[#fafafa]/80 hover:text-white"
  );

  const underline = cn(
    "absolute bottom-0 left-0 w-0 h-[2px] transition-all duration-300 group-hover:w-full rounded-full",
    isLight ? "bg-[#2F7BE0]" : "bg-white"
  );

  const mobileLinkCls = cn(
    "block px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-bold",
    isLight
      ? "text-[#0B2A3C] hover:text-[#2F7BE0] hover:bg-[#F5F8F7]"
      : "text-[#fafafa] hover:text-white hover:bg-white/10"
  );

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b transition-colors duration-300",
        isLight ? "bg-[#ffffff]/90 border-[#EEF2F1]" : "bg-[#09090b]/90 border-white/10",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[76px]">
          
          {/* Logo Container */}
          <Link href="/" className="flex items-center cursor-pointer gap-2 group">
            <img
              src="/logo.png"
              alt="jobflix logo"
              className="h-9 w-auto object-contain py-0.5 group-hover:scale-102 transition-transform duration-300"
            />
          </Link>

          {/* Desktop Navigation Link Cluster */}
          <div className="hidden md:flex items-center space-x-7">
            
            {/* Job Referrals */}
            <Link href="/referrals" className={cn(linkCls, "group")}>
              Job Referrals
              <span className={underline} />
            </Link>

            {/* JOBS MEGA DROPDOWN */}
            <div className="relative group">
              <button className={linkCls} type="button">
                Jobs
                <ChevronDown size={14} className="opacity-60 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              
              {/* Dropdown Wrapper */}
              <div className="absolute top-full left-1/2 -translate-x-1/4 w-[580px] pt-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                <div
                  className={cn(
                    "rounded-2xl border p-4 shadow-[0_30px_60px_rgba(11,42,60,0.1)] grid grid-cols-12 gap-4 relative overflow-hidden backdrop-blur-xl",
                    isLight ? "bg-[#ffffff] border-[#EEF2F1]" : "bg-[#09090b] border-white/10"
                  )}
                >
                  {/* Left Main Content Layout Column */}
                  <div className="col-span-8 grid grid-cols-1 gap-1">
                    {JOB_LINKS.map((link, idx) => {
                      const Icon = link.icon;
                      const dynamicBg = iconColors[idx % iconColors.length];
                      return (
                        <Link
                          key={link.name}
                          href={link.href}
                          className={cn(
                            "group/item flex items-start gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-200",
                            isLight ? "hover:bg-[#F5F8F7]" : "hover:bg-white/5"
                          )}
                        >
                          <div className={cn("flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover/item:scale-110 duration-200", dynamicBg)}>
                            <Icon size={17} strokeWidth={2.5} />
                          </div>
                          <div className="min-w-0">
                            <div className={cn("text-xs font-bold tracking-tight", isLight ? "text-[#0B2A3C] group-hover/item:text-[#2F7BE0]" : "text-white")}>
                              {link.name}
                            </div>
                            <div className={cn("text-[11px] mt-0.5 leading-normal font-medium", isLight ? "text-[#647B8E]" : "text-[#a1a1aa]")}>
                              {link.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Right Accent Banner Section */}
                  <div className={cn("col-span-4 rounded-xl p-3.5 flex flex-col justify-between text-xs font-medium", isLight ? "bg-[#F5F8F7]" : "bg-white/5")}>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 text-[#2F7BE0] font-bold text-[10px] uppercase tracking-wider">
                        <Sparkles size={11} /> Featured Update
                      </div>
                      <p className={cn("text-[11px] leading-relaxed font-bold", isLight ? "text-[#0B2A3C]" : "text-white")}>
                        Direct internal pipelines are active now.
                      </p>
                    </div>
                    <Link href="/referrals" className="text-[11px] font-bold text-[#2F7BE0] hover:underline mt-4 block">
                      Explore matching →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* LEARN MEGA DROPDOWN */}
            <div className="relative group">
              <button className={linkCls} type="button">
                Learn
                <ChevronDown size={14} className="opacity-60 group-hover:rotate-180 transition-transform duration-300" />
              </button>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-[620px] pt-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                <div
                  className={cn(
                    "rounded-2xl border p-4 shadow-[0_30px_60px_rgba(11,42,60,0.1)] grid grid-cols-2 gap-2 backdrop-blur-xl",
                    isLight ? "bg-[#ffffff] border-[#EEF2F1]" : "bg-[#09090b] border-white/10"
                  )}
                >
                  {LEARN_LINKS.map((link, idx) => {
                    const Icon = link.icon;
                    const dynamicBg = iconColors[(idx + 2) % iconColors.length];
                    const inner = (
                      <>
                        <div className={cn("flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover/item:scale-110 duration-200", dynamicBg)}>
                          <Icon size={17} strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0">
                          <div className={cn("text-xs font-bold tracking-tight", isLight ? "text-[#0B2A3C] group-hover/item:text-[#2F7BE0]" : "text-white")}>
                            {link.name}
                          </div>
                          <div className={cn("text-[11px] mt-0.5 leading-normal font-medium", isLight ? "text-[#647B8E]" : "text-[#a1a1aa]")}>
                            {link.description}
                          </div>
                        </div>
                      </>
                    );
                    const itemCls = cn(
                      "group/item flex items-start gap-3.5 px-3 py-3 rounded-xl transition-all duration-200",
                      isLight ? "hover:bg-[#F5F8F7]" : "hover:bg-white/5"
                    );

                    return link.external ? (
                      <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className={itemCls}>
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
            </div>

            {/* Pricing */}
            <Link href="/pricing" className={cn(linkCls, "group")}>
              Pricing
              <span className={underline} />
            </Link>

            {/* Blog */}
            <Link href="/blog" className={cn(linkCls, "group")}>
              Blog
              <span className={underline} />
            </Link>
          </div>

          {/* Action Buttons Right Side */}
          <div className="hidden md:flex items-center space-x-3.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/contact-us")}
              className={cn(
                "font-semibold text-xs px-4 rounded-xl transition-all h-9",
                isLight ? "text-[#0B2A3C] hover:bg-[#F5F8F7]" : "text-white hover:bg-white/10"
              )}
            >
              Contact Us
            </Button>
            
            {user ? (
              <div className="relative group">
                <button
                  type="button"
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full text-white text-xs font-bold transition-all border",
                    isLight ? "bg-[#0B2A3C] border-[#0B2A3C]" : "bg-white/15 border-white/10"
                  )}
                >
                  {user.email ? user.email.split("@")[0].slice(0, 2).toUpperCase() : "?"}
                </button>

                <div
                  className={cn(
                    "absolute right-0 mt-2.5 w-44 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transform translate-y-1 group-hover:translate-y-0 transition-all duration-200 z-50 border p-1",
                    isLight ? "bg-[#ffffff] border-[#EEF2F1]" : "bg-[#09090b] border-white/10"
                  )}
                >
                  <a href={`${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/my-account/dashboard/me`} className={cn("block px-4 py-2 text-xs font-semibold rounded-lg", isLight ? "text-[#0B2A3C] hover:bg-[#F5F8F7]" : "text-[#fafafa] hover:bg-white/10")}>Profile</a>
                  <a href={`${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/my-account/membership`} className={cn("block px-4 py-2 text-xs font-semibold rounded-lg", isLight ? "text-[#0B2A3C] hover:bg-[#F5F8F7]" : "text-[#fafafa] hover:bg-white/10")}>Memberships</a>
                  <Link href="/resume" className={cn("block px-4 py-2 text-xs font-semibold rounded-lg", isLight ? "text-[#0B2A3C] hover:bg-[#F5F8F7]" : "text-[#fafafa] hover:bg-white/10")}>My resume</Link>
                  <button type="button" onClick={async () => { await logout(); router.replace("/"); }} className={cn("w-full text-left px-4 py-2 text-xs font-bold text-[#D6455B] rounded-lg", isLight ? "hover:bg-[#F5F8F7]" : "hover:bg-white/10")}>Logout</button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => router.push('/login')}
                className="bg-[#2F7BE0] hover:bg-[#1D5FD8] text-white font-bold text-xs px-4 rounded-xl shadow-md h-9 transition-all"
              >
                Login
              </Button>
            )}
          </div>

          {/* Mobile Navigation Interface Panel Trigger */}
          <div className="md:hidden flex items-center gap-3">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className={cn("p-2 rounded-lg transition-colors", isLight ? "text-[#0B2A3C] hover:bg-[#F5F8F7]" : "text-[#fafafa] hover:bg-white/5")}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Flyout Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="md:hidden overflow-hidden pb-4">
              <div className={cn("p-3 space-y-1.5 rounded-2xl border", isLight ? "bg-[#ffffff] border-[#EEF2F1]" : "bg-[#09090b] border-white/10")}>
                <Link href="/referrals" className={mobileLinkCls} onClick={() => setIsOpen(false)}>Job Referrals</Link>
                
                {/* Mobile Expandable Jobs Section */}
                <div>
                  <button type="button" onClick={() => setJobsOpen(!jobsOpen)} className={cn("w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold", isLight ? "text-[#0B2A3C] hover:bg-[#F5F8F7]" : "text-[#fafafa] hover:bg-white/10")}>
                    <span>Jobs</span><ChevronDown size={14} className={cn("transition-transform duration-200", jobsOpen && "rotate-180")} />
                  </button>
                  {jobsOpen && (
                    <div className="mt-1 ml-4 space-y-1 border-l pl-3 border-[#EEF2F1]">
                      {JOB_LINKS.map((link) => (
                        <Link key={link.name} href={link.href} className="block px-3 py-2 rounded-lg text-xs font-semibold text-[#647B8E] hover:text-[#2F7BE0]" onClick={() => setIsOpen(false)}>{link.name}</Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Expandable Learn Section */}
                <div>
                  <button type="button" onClick={() => setLearnOpen(!learnOpen)} className={cn("w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold", isLight ? "text-[#0B2A3C] hover:bg-[#F5F8F7]" : "text-[#fafafa] hover:bg-white/10")}>
                    <span>Learn</span><ChevronDown size={14} className={cn("transition-transform duration-200", learnOpen && "rotate-180")} />
                  </button>
                  {learnOpen && (
                    <div className="mt-1 ml-4 space-y-1 border-l pl-3 border-[#EEF2F1]">
                      {LEARN_LINKS.map((link) => {
                        return link.external ? (
                          <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 rounded-lg text-xs font-semibold text-[#647B8E] hover:text-[#2F7BE0]" onClick={() => setIsOpen(false)}>{link.name}</a>
                        ) : (
                          <Link key={link.name} href={link.href} className="block px-3 py-2 rounded-lg text-xs font-semibold text-[#647B8E] hover:text-[#2F7BE0]" onClick={() => setIsOpen(false)}>{link.name}</Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Link href="/pricing" className={mobileLinkCls} onClick={() => setIsOpen(false)}>Pricing</Link>
                <Link href="/blog/feed" className={mobileLinkCls} onClick={() => setIsOpen(false)}>Blog</Link>
                
                {!user && (
                  <div className="pt-2 px-2">
                    <Button size="sm" className="w-full bg-[#2F7BE0] rounded-xl text-xs font-bold" onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login?next=${encodeURIComponent(window.location.origin)}`}>Login</Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </motion.nav>
  );
};