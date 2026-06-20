// components/LiveEditor.tsx
"use client";

import axiosInstance from "@/lib/axios";
import React, { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Save, Globe, Eye, EyeOff } from "lucide-react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface LiveEditorProps {
  initialCode: string;
}

// 1. Structure the form interface matching your production database schema
interface BlogMetadata {
  title: string;
  summary: string;
  category: string;
  tags: string; // Comma separated string on input, split into array on submit
  authorName: string;
  authorBio: string;
  authorAvatar: string;
  featured: boolean;
  isPublished: boolean;
  readTime: string;
}

export default function LiveEditor({ initialCode }: LiveEditorProps) {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Editor Workspace | Step 2: Meta Specifications Form
  const [htmlCode, setHtmlCode] = useState(initialCode);
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize your schema's supporting fields
  const [metadata, setMetadata] = useState<BlogMetadata>({
    title: "",
    summary: "",
    category: "",
    tags: "",
    authorName: "",
    authorBio: "",
    authorAvatar: "",
    featured: false,
    isPublished: false,
    readTime: "5 min read",
  });

  // Compile the HTML document layout structurally as a string
  const compiledSource = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <style>body { margin: 0; padding: 0; background-color: #f8fafc; }</style>
      </head>
      <body>
        <div id="preview-root">${htmlCode}</div>
      </body>
    </html>
  `;

  // Standard handler for metadata form elements
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setMetadata(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const saveToDatabase = async () => {
    // 1. Client-Side Validations
    if (!metadata.title.trim()) return toast.error("Blog title is required.");
    if (!metadata.authorName.trim()) return toast.error("Author name is required.");
    if (!metadata.category.trim()) return toast.error("Please assign a category.");
    if (!htmlCode.trim()) return toast.error("HTML content payload is completely empty.");

    setIsSaving(true);
    try {
      const finalPayload = {
        title: metadata.title.trim(),
        htmlContent: htmlCode,
        summary: metadata.summary.trim(),
        category: metadata.category.trim(),
        tags: metadata.tags ? metadata.tags.split(",").map(t => t.trim()) : [],
        featured: metadata.featured,
        isPublished: metadata.isPublished,
        readTime: metadata.readTime || "5 min read",
        author: {
          name: metadata.authorName.trim(),
          bio: metadata.authorBio.trim(),
          avatar: metadata.authorAvatar.trim(),
        }
      };

      const res = await axiosInstance.post('/blog/posts', finalPayload);
      if (res.data.success) {
        toast.success('Blog post successfully synced with MongoDB!');
        setStep(1);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to sync structural configurations.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`flex flex-col h-screen w-screen font-sans antialiased overflow-hidden transition-colors duration-200 ${
      isDarkMode ? "bg-slate-900 text-slate-100" : "bg-blue-50 text-slate-800"
    }`}>
      
      {/* Header Controller Bar */}
      <header className={`flex items-center justify-between px-6 py-3 border-b shadow-sm transition-colors duration-200 ${
        isDarkMode ? "bg-slate-950 border-slate-800" : "bg-white border-blue-100"
      }`}>
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 bg-blue-600 text-white rounded font-mono font-bold text-xs shadow-sm shadow-blue-500/20">
            {step === 1 ? "STEP 1/2" : "STEP 2/2"}
          </div>
          <h1 className={`font-bold text-sm ${isDarkMode ? "text-white" : "text-blue-950"}`}>
            {step === 1 ? "HTML + Tailwind Studio Workspace" : "Publishing Metadata Matrix"}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium border transition-all active:scale-95 ${
              isDarkMode 
                ? "bg-slate-900 border-slate-700 hover:bg-slate-800 text-amber-400" 
                : "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
            }`}
          >
            {isDarkMode ? "☀️ Light UI" : "🌙 Dark UI"}
          </button>

          {/* Wizard Stepper Controls */}
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded shadow transition-all"
            >
              Configure Meta Settings <ArrowRight className="h-3 w-3" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(1)}
                disabled={isSaving}
                className={`flex items-center gap-1.5 px-4 py-1.5 border text-xs font-semibold rounded transition-all ${
                  isDarkMode 
                    ? "border-slate-700 hover:bg-slate-800 text-slate-300" 
                    : "border-blue-200 hover:bg-blue-100/50 text-blue-700"
                }`}
              >
                <ArrowLeft className="h-3 w-3" /> Back to Editor
              </button>
              <button
                onClick={saveToDatabase}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-400 text-white text-xs font-semibold rounded shadow transition-all active:scale-95"
              >
                <Save className="h-3.5 w-3.5" /> {isSaving ? "Syncing MongoDB..." : "Publish & Commit Post"}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Studio Viewport Windows */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* VIEW 1: Live Split Code Screen */}
        {step === 1 && (
          <>
            {/* LEFT SIDE: Code Editor */}
            <div className={`w-1/2 h-full flex flex-col border-r transition-colors duration-200 ${
              isDarkMode ? "border-slate-800 bg-slate-950" : "border-blue-100 bg-blue-50/50"
            }`}>
              <div className={`px-6 py-2 text-[11px] font-mono font-semibold uppercase tracking-wider border-b ${
                isDarkMode ? "bg-slate-900/50 text-slate-400 border-slate-800" : "bg-blue-100/50 text-blue-600 border-blue-100"
              }`}>
                Source Code Editor
              </div>
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className={`flex-1 w-full p-6 font-mono text-sm leading-relaxed focus:outline-none resize-none tracking-wide transition-colors duration-200 ${
                  isDarkMode ? "bg-slate-950 text-blue-300" : "bg-white text-blue-900"
                }`}
                spellCheck="false"
                placeholder=""
              />
            </div>

            {/* RIGHT SIDE: Visual Render Sandbox */}
            <div className={`w-1/2 h-full flex flex-col ${isDarkMode ? "bg-slate-900" : "bg-blue-50"}`}>
              <div className={`px-6 py-2 text-[11px] font-mono font-semibold uppercase tracking-wider border-b ${
                isDarkMode ? "bg-slate-900/50 text-slate-400 border-slate-800" : "bg-blue-100/50 text-blue-600 border-blue-100"
              }`}>
                Live Render Sandbox
              </div>
              <div className="flex-1 bg-white relative p-4">
                <iframe
                  title="Tailwind Live Compiled Frame"
                  className="w-full h-full border-none bg-white rounded-lg shadow-sm"
                  sandbox="allow-scripts"
                  srcDoc={compiledSource}
                />
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: Production Metadata Settings Form Screen */}
        {step === 2 && (
          <div className={`flex-1 overflow-y-auto p-12 flex justify-center ${isDarkMode ? "bg-slate-950" : "bg-blue-50/30"}`}>
            <div className={`w-full max-w-3xl p-8 rounded-xl border shadow-sm h-fit space-y-6 ${
              isDarkMode ? "bg-slate-900 border-slate-800" : "bg-white border-blue-100"
            }`}>
              
              <div>
                <h2 className="text-lg font-bold tracking-tight">Article Configurations</h2>
                <p className="text-xs text-slate-400">Complete the required schema properties to optimize lookups, SEO tags, and indices.</p>
              </div>

              <hr className={isDarkMode ? "border-slate-800" : "border-slate-100"} />

              {/* Form Matrix */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                
                {/* Title */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Post Title *</label>
                  <Input
                    type="text" name="title" value={metadata.title} onChange={handleInputChange}
                    placeholder="e.g., Mastering Tailwind CSS v4 Layout Engines"
                    className={`px-3 py-2 rounded-md border focus:outline-none text-sm ${
                      isDarkMode ? "bg-slate-950 border-slate-700 focus:border-blue-500" : "bg-slate-50 border-slate-200 focus:border-blue-600"
                    }`}
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category *</label>
                  <Input
                    type="text" name="category" value={metadata.category} onChange={handleInputChange}
                    placeholder="e.g., Frontend, UI Design"
                    className={`px-3 py-2 rounded-md border focus:outline-none text-sm ${
                      isDarkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>

                {/* Read Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estimated Read Time</label>
                  <Input
                    type="text" name="readTime" value={metadata.readTime} onChange={handleInputChange}
                    placeholder="e.g., 5 min read"
                    className={`px-3 py-2 rounded-md border focus:outline-none text-sm ${
                      isDarkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>

                {/* Tags */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tags (Comma Separated)</label>
                  <Input
                    type="text" name="tags" value={metadata.tags} onChange={handleInputChange}
                    placeholder="html, tailwind, backend, nextjs"
                    className={`px-3 py-2 rounded-md border focus:outline-none text-sm ${
                      isDarkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>

                {/* Summary / Description Excerpt */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Summary / SEO Description</label>
                  <Textarea
                    name="summary" value={metadata.summary} onChange={handleInputChange} rows={3}
                    placeholder="Brief description summarizing the content context of this component canvas..."
                    className={`p-3 rounded-md border focus:outline-none text-sm resize-none ${
                      isDarkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>

                {/* Sub-Section Divider: Author Data */}
                <div className="col-span-2 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500">Author Metadata Scope</h3>
                </div>

                {/* Author Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Author Name *</label>
                  <Input
                    type="text" name="authorName" value={metadata.authorName} onChange={handleInputChange}
                    placeholder="e.g., John Doe"
                    className={`px-3 py-2 rounded-md border focus:outline-none text-sm ${
                      isDarkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>

                {/* Author Avatar URL */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avatar Image Link</label>
                  <Input
                    type="text" name="authorAvatar" value={metadata.authorAvatar} onChange={handleInputChange}
                    placeholder="https://example.com/avatar.png"
                    className={`px-3 py-2 rounded-md border focus:outline-none text-sm ${
                      isDarkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>

                {/* Author Bio */}
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Author Short Bio</label>
                  <Input
                    type="text" name="authorBio" value={metadata.authorBio} onChange={handleInputChange}
                    placeholder="Fullstack engineer specializing in layout automation tracks..."
                    className={`px-3 py-2 rounded-md border focus:outline-none text-sm ${
                      isDarkMode ? "bg-slate-950 border-slate-700" : "bg-slate-50 border-slate-200"
                    }`}
                  />
                </div>

                {/* Status Toggles Checkboxes */}
                <div className="col-span-2 flex items-center gap-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
                  
                  {/* Status Toggle 1: Publish */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Input
                      type="checkbox" name="isPublished" checked={metadata.isPublished} onChange={handleInputChange}
                      className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <div className="flex items-center gap-1">
                      {metadata.isPublished ? <Globe className="h-3.5 w-3.5 text-emerald-500" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                      <span className="text-xs font-medium">Instantly Publish to Production Feed</span>
                    </div>
                  </label>

                  {/* Status Toggle 2: Featured */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <Input
                      type="checkbox" name="featured" checked={metadata.featured} onChange={handleInputChange}
                      className="h-4 w-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Set as Featured Post Tracker</span>
                  </label>

                </div>

              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}