"use client";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "../../lib/utils";
import { Container, Button } from "./primitives";
import { JOB_LINKS, LEARN_LINKS } from "./nav-links";

function NavDropdown({
  label,
  links,
  open,
  onToggle,
}: {
  label: string;
  links: typeof JOB_LINKS;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="group relative">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center gap-1 text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-ink-900"
      >
        {label}
        <ChevronDown size={13} className="opacity-70 transition-transform duration-200 group-hover:rotate-180" />
      </button>
      <div className={cn("invisible absolute top-full left-1/2 z-50 w-[480px] -translate-x-1/2 translate-y-1 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100", open && "visible opacity-100 translate-y-0")}>
        <div className="grid grid-cols-2 gap-1 rounded-[var(--jf-radius-panel)] border border-border-soft bg-page p-3 shadow-[var(--jf-shadow-frame)]">
          {links.map((link) => {
            const Icon = link.icon;
            const inner = (
              <>
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-surface-alt text-ink-600">
                  <Icon size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold leading-tight text-ink-900">{link.name}</div>
                  <div className="mt-0.5 text-xs leading-snug text-ink-500">{link.description}</div>
                </div>
              </>
            );
            const itemCls = "flex items-start gap-3 rounded-lg px-3 py-3 transition-colors duration-150 hover:bg-surface-alt";
            return link.external ? (
              <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className={itemCls}>{inner}</a>
            ) : (
              <Link key={link.name} href={link.href} className={itemCls}>{inner}</Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MarketingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [jobsOpen, setJobsOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [mobileJobsOpen, setMobileJobsOpen] = useState(false);
  const [mobileLearnOpen, setMobileLearnOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loginHref =
    typeof window !== "undefined"
      ? `${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login?next=${encodeURIComponent(window.location.origin)}`
      : "#";

  return (
    <nav className={cn(
      "sticky top-0 z-50 bg-page transition-shadow duration-200",
      scrolled && "shadow-[var(--jf-shadow-frame)] border-b border-border-soft"
    )}>
      <Container width="wide">
        <div className="flex h-16 items-center justify-between">
          {/* Zone 1: Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="ResumeAssist AI" className="h-9 w-auto object-contain" />
          </Link>

          {/* Zone 2: Navigation Links */}
          <div className="hidden items-center gap-9 md:flex">
            <Link href="/referrals" className="text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-ink-900">
              Job Referrals
            </Link>
            <NavDropdown label="Jobs" links={JOB_LINKS} open={jobsOpen} onToggle={() => setJobsOpen((v) => !v)} />
            <NavDropdown label="Learn" links={LEARN_LINKS} open={learnOpen} onToggle={() => setLearnOpen((v) => !v)} />
            <Link href="/pricing" className="text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-ink-900">
              Pricing
            </Link>
            <Link href="/blog" className="text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-ink-900">
              Blog
            </Link>
            <Link href="/contact-us" className="text-sm font-medium text-ink-600 transition-colors duration-200 hover:text-ink-900">
              Contact Us
            </Link>
          </div>

          {/* Zone 3: Actions */}
          <div className="hidden items-center gap-5 md:flex">
            <Link href={loginHref} className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors duration-200">
              Log in
            </Link>
            <Button href="/create">Sign up ↗</Button>
          </div>

          {/* Mobile hamburger */}
          <button className="p-2 text-ink-700 md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden md:hidden"
            >
              <div className="space-y-1 rounded-lg border border-border-soft bg-page px-2 pt-2 pb-3 mb-3">
                <Link href="/referrals" className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-alt" onClick={() => setMobileOpen(false)}>Job Referrals</Link>

                <div>
                  <button onClick={() => setMobileJobsOpen((v) => !v)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-alt">
                    <span>Jobs</span>
                    <ChevronDown size={14} className={cn("transition-transform duration-200", mobileJobsOpen && "rotate-180")} />
                  </button>
                  {mobileJobsOpen && (
                    <div className="mt-1 ml-3 space-y-1">
                      {JOB_LINKS.map((link) => (
                        <Link key={link.name} href={link.href} className="block rounded-md px-3 py-2 text-sm text-ink-600 hover:bg-surface-alt" onClick={() => { setMobileOpen(false); setMobileJobsOpen(false); }}>
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <button onClick={() => setMobileLearnOpen((v) => !v)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-alt">
                    <span>Learn</span>
                    <ChevronDown size={14} className={cn("transition-transform duration-200", mobileLearnOpen && "rotate-180")} />
                  </button>
                  {mobileLearnOpen && (
                    <div className="mt-1 ml-3 space-y-1">
                      {LEARN_LINKS.map((link) =>
                        link.external ? (
                          <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="block rounded-md px-3 py-2 text-sm text-ink-600 hover:bg-surface-alt" onClick={() => { setMobileOpen(false); setMobileLearnOpen(false); }}>{link.name}</a>
                        ) : (
                          <Link key={link.name} href={link.href} className="block rounded-md px-3 py-2 text-sm text-ink-600 hover:bg-surface-alt" onClick={() => { setMobileOpen(false); setMobileLearnOpen(false); }}>{link.name}</Link>
                        )
                      )}
                    </div>
                  )}
                </div>

                <Link href="/pricing" className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-alt" onClick={() => setMobileOpen(false)}>Pricing</Link>
                <Link href="/blog" className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-alt" onClick={() => setMobileOpen(false)}>Blog</Link>
                <Link href="/contact-us" className="block rounded-md px-3 py-2 text-sm font-medium text-ink-700 hover:bg-surface-alt" onClick={() => setMobileOpen(false)}>Contact Us</Link>

                <div className="mt-2 space-y-2 border-t border-border-soft px-3 pt-3">
                  <Button href={loginHref} variant="ghost" className="w-full justify-center text-ink-700">
                    Log in
                  </Button>
                  <Button href="/create" className="w-full justify-center">
                    Sign up ↗
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </nav>
  );
}
