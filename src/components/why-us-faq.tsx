"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Search, Zap, MessageCircle, Briefcase, ChevronDown } from "lucide-react";

// ─── Why Us ───────────────────────────────────────────────────────────────────

const WHY_ITEMS = [
  {
    icon: Search,
    title: "Discover hidden jobs",
    desc: "We scan the internet every day and find jobs not posted on LinkedIn or other job boards.",
    stat: "10,000+",
    statLabel: "extra jobs found",
  },
  {
    icon: Zap,
    title: "Head start against the competition",
    desc: "We find jobs as soon as they're posted, so you can apply before everyone else.",
    stat: "< 1hr",
    statLabel: "average job age",
  },
  {
    icon: MessageCircle,
    title: "More interviews, faster",
    desc: "Most members hear back within the first week.",
    stat: "83%",
    statLabel: "get interviews in week 1",
  },
  {
    icon: Briefcase,
    title: "10,000+ more jobs than other job boards",
    desc: "We find jobs other job boards miss — from company career pages, niche boards, and direct postings.",
    stat: "Daily",
    statLabel: "internet-wide scans",
  },
];

export function WhyUsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-14 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Why us</p>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900">
            The job board that works harder
          </h2>
          <p className="text-neutral-500 mt-3 max-w-xl mx-auto">
            While other boards wait for companies to post, we go out and find the jobs ourselves.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: "easeOut" }}
                className="group bg-neutral-50 border border-neutral-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-200"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
                  <Icon size={18} className="text-teal-600" />
                </div>

                {/* Stat */}
                <p className="text-2xl font-bold text-neutral-900 mb-0.5">{item.stat}</p>
                <p className="text-xs text-teal-600 font-semibold mb-3">{item.statLabel}</p>

                {/* Text */}
                <h3 className="text-sm font-semibold text-neutral-900 mb-2 group-hover:text-teal-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Why does ResumeAssist Jobs cost money?",
    a: "We use powerful scraping AI to scan the internet daily for thousands of remote jobs. It operates 24/7 and costs us to operate, so we charge for access to keep the site running.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Of course! You can cancel your subscription at any time with no hidden fees or penalties. Once canceled, you'll still have access until the end of your current billing period.",
  },
  {
    q: "What is the difference between ResumeAssist and other job boards?",
    a: "We find jobs other job boards miss. Most job boards only list what companies post directly to them. We actively crawl company career pages, niche boards, and direct postings across the internet every single day.",
  },
  {
    q: "How often are new jobs posted?",
    a: "New jobs are constantly being posted. We check each company website multiple times a day to ensure we have the most up-to-date job listings.",
  },
];

function FAQItem({ q, a, delay }: { q: string; a: string; delay: number }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="border border-neutral-200 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white hover:bg-neutral-50 transition-colors"
      >
        <span className="text-sm font-semibold text-neutral-900">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={16} className="text-neutral-400" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-5 text-sm text-neutral-500 leading-relaxed border-t border-neutral-100 pt-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-14 px-4 bg-neutral-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900">
            Frequently asked questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} delay={0.05 * i} />
          ))}
        </div>
      </div>
    </section>
  );
}
