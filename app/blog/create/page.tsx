// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import LiveEditor from "@/components/Editor";

export default function Page() {
  const [initialCode, setInitialCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetch("/api/layout");
        if (res.ok) {
          const json = await res.json();
          // Provide default structural placeholder if document query yields empty strings
          setInitialCode(json.htmlContent || `<div class="p-8 text-center text-gray-500 font-sans"><h2>Empty Canvas Workspace</h2><p>Begin writing custom code blocks inside the left panel editor track.</p></div>`);
        }
      } catch (err) {
        console.error("Failed loading data", err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspace();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-xs text-slate-400">
        INITIALIZING SPLIT PREVIEW ENGINE CONFIGURATIONS...
      </div>
    );
  }

  return <LiveEditor initialCode={initialCode || ""} />;
}