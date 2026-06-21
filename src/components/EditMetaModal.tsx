"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { X, Save, Loader2 } from "lucide-react";
import api from "@/lib/axios";

interface Author {
  name: string;
  bio?: string;
  avatar?: string;
}

interface BlogPost {
  _id: string;
  title: string;
  category: string;
  summary?: string;
  demoContent?: string;
  tags: string[];
  author: Author;
  featured: boolean;
  isPublished: boolean;
  readTime: string;
}

interface EditMetaModalProps {
  isOpen: boolean;
  post: BlogPost | null;
  onClose: () => void;
  onSuccess: (updatedPost: BlogPost) => any;
}

export default function EditMetaModal({ isOpen, post, onClose, onSuccess }: EditMetaModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    demoContent: "",
    category: "",
    tags: "",
    authorName: "",
    authorBio: "",
    authorAvatar: "",
    featured: false,
    readTime: "5 min read",
  });

  // Sync state parameters cleanly when a post target passes down
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        summary: post.summary || "",
        demoContent: post.demoContent || "",
        category: post.category || "",
        tags: post.tags ? post.tags.join(", ") : "",
        authorName: post.author?.name || "",
        authorBio: post.author?.bio || "",
        authorAvatar: post.author?.avatar || "",
        featured: post.featured || false,
        readTime: post.readTime || "5 min read",
      });
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category.trim() || !formData.authorName.trim()) {
      return toast.error("Please fill in all required fields (*)");
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        demoContent: formData.demoContent.trim(),
        category: formData.category.trim(),
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        featured: formData.featured,
        readTime: formData.readTime,
        author: {
          name: formData.authorName.trim(),
          bio: formData.authorBio.trim(),
          avatar: formData.authorAvatar.trim(),
        },
      };

      // Updates only metadata fields using the edit endpoint
      const res = await api.put(`/blog/posts/${post._id}`, payload);
      
      if (res.data.success) {
        toast.success("Metadata configurations synced successfully!");
        onSuccess(res.data.data);
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed updating metadata profiles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Edit Article Properties</h2>
            <p className="text-xs text-slate-400">Modifying core schema indices, authors, and classification headers.</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content Scroll Frame */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm flex-1">
          <div className="grid grid-cols-2 gap-4">
            
            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none focus:border-blue-500" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Category *</label>
              <input type="text" name="category" value={formData.category} onChange={handleInputChange} className="px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Read Time</label>
              <input type="text" name="readTime" value={formData.readTime} onChange={handleInputChange} className="px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none" />
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tags (Comma Separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className="px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none" />
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Summary / Excerpt Description</label>
              <textarea name="summary" value={formData.summary} onChange={handleInputChange} rows={3} className="p-3 border rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none resize-none" />
            </div>

            <div className="col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Demo Content Preview</label>
              <textarea name="demoContent" value={formData.demoContent} onChange={handleInputChange} rows={4} className="p-3 border rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none resize-none" placeholder="Enter the content preview to show locked users when a premium post is restricted." />
            </div>

            {/* Author Configuration Nesting Box */}
            <div className="col-span-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-3">Author Structural Context</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Author Name *</label>
                  <input type="text" name="authorName" value={formData.authorName} onChange={handleInputChange} className="px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Avatar Image Link</label>
                  <input type="text" name="authorAvatar" value={formData.authorAvatar} onChange={handleInputChange} className="px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none" />
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Author Bio</label>
                  <input type="text" name="authorBio" value={formData.authorBio} onChange={handleInputChange} className="px-3 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-800 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleInputChange} className="h-4 w-4 accent-blue-600 rounded" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Highlight as Featured Article</span>
              </label>
            </div>

          </div>
        </form>

        {/* Modal Action Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-950/40">
          <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading} className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Information
          </button>
        </div>

      </div>
    </div>
  );
}