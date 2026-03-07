"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { buildApiUrl } from "../services/resumeOptimizerApi";
import type { ResumeData } from "@/types/portfolioly-resume";
import { AlertCircle } from "lucide-react";
import PortfolioPreview from "./portfolio-preview";

type PortfolioState = "loading" | "loaded" | "not-found" | "error";

export default function PortfolioPage() {
  const { username } = useParams<{ username: string }>();
  const [state, setState] = useState<PortfolioState>("loading");
  const [data, setData] = useState<ResumeData | null>(null);
  const [_theme, setTheme] = useState("default");

  useEffect(() => {
    if (!username) {
      setState("not-found");
      return;
    }

    const fetchPortfolio = async () => {
      try {
        const res = await fetch(buildApiUrl(`/portfolio/${username}`), {
          credentials: "include",
        });
        if (res.status === 404) {
          setState("not-found");
          return;
        }
        if (!res.ok) {
          setState("error");
          return;
        }
        const json = await res.json();
        setData(json.data);
        setTheme(json.theme || "default");
        setState("loaded");
      } catch {
        setState("error");
      }
    };

    fetchPortfolio();
  }, [username]);

  // ─── Loading State ──────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin border-2 border-neutral-300 border-t-neutral-900 rounded-full" />
          <span className="text-neutral-500">Loading portfolio...</span>
        </div>
      </div>
    );
  }

  // ─── Not Found ──────────────────────────────────────────────────
  if (state === "not-found") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-white">
        <div className="max-w-md w-full space-y-6 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-neutral-100 p-6">
              <AlertCircle className="h-12 w-12 text-neutral-400" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
              Portfolio Not Found
            </h1>
            <p className="text-base text-neutral-500 leading-relaxed">
              This portfolio doesn't exist or is not publicly accessible.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium text-sm"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────
  if (state === "error" || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-white">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-neutral-900">Failed to Load Portfolio</h1>
            <p className="text-neutral-500">Something went wrong. Please try again.</p>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors text-sm font-medium"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-5 py-2 border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <PortfolioPreview data={data} />;
}
