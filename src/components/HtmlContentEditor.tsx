"use client";

import React, { useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Monitor, Code } from "lucide-react";

interface HtmlContentEditorProps {
  postId: string;
  postTitle: string;
  initialHtml: string;
  onClose: () => void;
  onUpdateSuccess: (updatedHtml: string) => void;
}

export default function HtmlContentEditor({
  postId,
  postTitle,
  initialHtml,
  onClose,
  onUpdateSuccess,
}: HtmlContentEditorProps): React.JSX.Element {
  const [htmlCode, setHtmlCode] = useState<string>(initialHtml);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const compiledSource = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <style>
          body { margin: 0; padding: 0; background-color: #ffffff; }
          /* Custom scrollbar handling inside visual container */
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div id="canvas-preview-root">${htmlCode}</div>
      </body>
    </html>
  `;

  const handleCommitHtmlChanges = async () => {
    if (!htmlCode.trim()) {
      return toast.error("HTML payload matrix cannot be empty.");
    }

    setIsSaving(true);
    try {
      // Production pattern: Send ONLY the changed field over the network
      const res = await api.put(`/blog/posts/${postId}`, {
        htmlContent: htmlCode,
      });

      if (res.data.success) {
        toast.success("HTML architecture updated successfully!");
        onUpdateSuccess(htmlCode); // Sync state up to parent table array seamlessly
        onClose(); // Exit back to main directory tracking control index view
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed syncing canvas structural properties.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`flex flex-col h-screen w-screen font-sans antialiased overflow-hidden ${
      isDarkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* Workspace Header Toolbar Controls */}
      <header className={`flex items-center justify-between px-6 py-3 border-b transition-colors ${
        isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-lg transition-all ${
              isDarkMode 
                ? "border-slate-700 hover:bg-slate-800 text-slate-300" 
                : "border-slate-200 hover:bg-slate-100 text-slate-700"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </button>
          
          <div className="h-4 w-[1px] bg-slate-700" />
          
          <div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-500">HTML Content Sandbox</div>
            <h1 className="text-sm font-bold tracking-tight truncate max-w-md">Editing: {postTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Editor Theme Switcher */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isDarkMode 
                ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-amber-400" 
                : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
            }`}
          >
            {isDarkMode ? "☀️ Light Mode UI" : "🌙 Dark Mode UI"}
          </button>

          {/* Core Commit Action Trigger button */}
          <button
            onClick={handleCommitHtmlChanges}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white text-xs font-semibold rounded-lg shadow-sm shadow-blue-500/10 transition-all active:scale-95"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isSaving ? "Syncing Canvas..." : "Save Canvas Code"}
          </button>
        </div>
      </header>

      {/* Main Split Interface Viewport Screen */}
      <main className="flex-1 flex overflow-hidden">
        <div className="w-1/2 h-full flex flex-col">
          <div className={`px-6 py-2 text-[10px] font-mono font-bold uppercase tracking-widest border-b flex items-center gap-1.5 ${
            isDarkMode ? "bg-slate-900/40 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-500 border-slate-200"
          }`}>
            <Code className="h-3.5 w-3.5 text-blue-500" /> Source Code Editor
          </div>
          <textarea
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            className={`flex-1 w-full p-6 font-mono text-sm leading-relaxed focus:outline-none resize-none tracking-wide transition-colors ${
              isDarkMode 
                ? "bg-slate-950 text-blue-300 placeholder-slate-700 focus:bg-slate-950" 
                : "bg-white text-blue-950 placeholder-slate-300 focus:bg-white"
            }`}
            spellCheck="false"
            placeholder=""
          />
        </div>

        <div className={`w-1/2 h-full flex flex-col border-l ${
          isDarkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-100"
        }`}>
          <div className={`px-6 py-2 text-[10px] font-mono font-bold uppercase tracking-widest border-b flex items-center gap-1.5 ${
            isDarkMode ? "bg-slate-900/40 text-slate-400 border-slate-800" : "bg-slate-100 text-slate-500 border-slate-200"
          }`}>
            <Monitor className="h-3.5 w-3.5 text-emerald-500" /> Live Compiled Frame Preview
          </div>
          <div className="flex-1 p-4 relative">
            <iframe
              title="Tailwind Live Compiled Frame"
              className="w-full h-full border-none bg-white rounded-xl shadow-md"
              sandbox="allow-scripts"
              srcDoc={compiledSource}
            />
          </div>
        </div>

      </main>
    </div>
  );
}