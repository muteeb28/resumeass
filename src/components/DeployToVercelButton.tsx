"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Rocket, ExternalLink, Globe, Copy, Check, AlertCircle } from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────
// Replace with your public GitHub template repo once created.
// The template is a minimal Next.js app that fetches portfolio data from the API.
// Env vars it reads: NEXT_PUBLIC_USERNAME, NEXT_PUBLIC_API_BASE_URL
const TEMPLATE_REPO_URL = "https://github.com/muteeb28/resumeass-portfolio-template";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildVercelUrl(slug: string, apiBaseUrl: string): string {
  const url = new URL("https://vercel.com/new/clone");
  url.searchParams.set("repository-url", TEMPLATE_REPO_URL);
  url.searchParams.set("project-name", `${slug}-portfolio`);
  url.searchParams.set("repository-name", `${slug}-portfolio`);
  url.searchParams.set("env", "NEXT_PUBLIC_USERNAME,NEXT_PUBLIC_API_BASE_URL");
  url.searchParams.set("envDescription", "Connect your portfolio to the ResumeAssist API");
  url.searchParams.set(
    "envDefaults",
    JSON.stringify({
      NEXT_PUBLIC_USERNAME: slug,
      NEXT_PUBLIC_API_BASE_URL: apiBaseUrl,
    })
  );
  url.searchParams.set(
    "redirect-url",
    `${window.location.origin}/portfolio?vercel_deployed=true&slug=${slug}`
  );
  return url.toString();
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  slug: string;
}

export function DeployToVercelButton({ slug }: Props) {
  const [open, setOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_API_URL || "https://your-api.vercel.app/api"
  );
  const [copied, setCopied] = useState(false);

  function handleDeploy() {
    const vercelUrl = buildVercelUrl(slug, apiUrl);
    window.open(vercelUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  function copySlug() {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
      >
        {/* Vercel triangle logo */}
        <svg width="16" height="16" viewBox="0 0 76 65" fill="white">
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
        </svg>
        Deploy to Vercel
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
            >
              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 76 65" fill="white">
                    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">Deploy Your Portfolio</h3>
                  <p className="text-xs text-neutral-500">Get your own domain on Vercel — free</p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3 mb-5">
                {[
                  { n: "1", text: "Vercel clones your portfolio template to your GitHub" },
                  { n: "2", text: "Your portfolio data is fetched live from ResumeAssist" },
                  { n: "3", text: "You get a free yourname.vercel.app URL" },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-neutral-900 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {s.n}
                    </span>
                    <p className="text-sm text-neutral-600">{s.text}</p>
                  </div>
                ))}
              </div>

              {/* Portfolio slug */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
                  Your portfolio ID
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm font-mono text-neutral-700 truncate">
                    {slug}
                  </div>
                  <button
                    onClick={copySlug}
                    className="shrink-0 p-2 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    {copied ? <Check size={14} className="text-teal-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* API URL */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">
                  API base URL
                </label>
                <input
                  type="url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://your-api.vercel.app/api"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                />
                <p className="mt-1.5 flex items-start gap-1.5 text-xs text-neutral-400">
                  <AlertCircle size={11} className="mt-0.5 flex-shrink-0" />
                  Must be your deployed API URL, not localhost
                </p>
              </div>

              {/* Deploy button */}
              <button
                onClick={handleDeploy}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white text-sm font-semibold hover:bg-neutral-800 transition-colors group"
              >
                <svg width="16" height="16" viewBox="0 0 76 65" fill="white">
                  <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                </svg>
                Deploy to Vercel
                <ExternalLink size={13} className="opacity-60 group-hover:opacity-100" />
              </button>

              <p className="mt-3 text-center text-xs text-neutral-400">
                A Vercel account is required (free). Your portfolio data stays on ResumeAssist.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
