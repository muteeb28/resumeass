"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Search, Code, Settings2, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import EditMetaModal from "@/components/EditMetaModal";
import HtmlContentEditor from "@/components/HtmlContentEditor";

interface Author {
  name: string;
  bio?: string;
  avatar?: string;
}

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  category: string;
  htmlContent: string;
  views: number;
  likes: number;
  isPublished: boolean;
  author: Author;
  tags: string[];
  featured: boolean;
  readTime: string;
}

export default function AdminBlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Control tracks for separating HTML edits vs Metadata configurations
  const [editingHtmlPost, setEditingHtmlPost] = useState<BlogPost | null>(null);
  const [editingMetaPost, setEditingMetaPost] = useState<BlogPost | null>(null);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState<boolean>(false);

  const fetchAdminPosts = async (search: string = "") => {
    setLoading(true);
    try {
      const res = await api.get("/blog/admin/posts", {
        params: { limit: 20, ...(search && { search }) }
      });
      if (res.data.success) {
        setPosts(res.data.data.posts || []);
      }
    } catch (err) {
      console.error("Dashboard fetching failure", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeOutId = setTimeout(() => fetchAdminPosts(searchQuery), 400);
    return () => clearTimeout(timeOutId);
  }, [searchQuery]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await api.patch(`/blog/posts/${id}/status`, { isPublished: !currentStatus });
      if (res.data.success) {
        setPosts((prev) => prev.map((p) => (p._id === id ? { ...p, isPublished: !currentStatus } : p)));
      }
    } catch (err) {
      alert("Failed to adjust access matrix updates.");
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this item?")) return;
    try {
      const res = await api.delete(`/posts/${id}`);
      if (res.data.success) {
        setPosts((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (err) {
      alert("Failed operation routing execution parameters.");
    }
  };

  const handleMetaUpdateSuccess = (updatedPost: BlogPost) => {
    setPosts((prev) => prev.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

if (editingHtmlPost) {
  return (
    <HtmlContentEditor
      postId={editingHtmlPost._id}
      postTitle={editingHtmlPost.title}
      initialHtml={editingHtmlPost.htmlContent || ""}
      onClose={() => setEditingHtmlPost(null)}
      onUpdateSuccess={(newHtml: any) => {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === editingHtmlPost._id ? { ...p, htmlContent: newHtml } : p
          )
        );
      }}
    />
  );
}

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans antialiased">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Block banner */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Management Matrix</h1>
            <p className="text-xs text-slate-500">Isolate parameters, compile dynamic frontend layout sandboxes, or adjust data meta fields.</p>
          </div>
        </div>

        {/* Action Input Search Field bar panel box wrapper row */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text" placeholder="Search by title parameters..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
            />
          </div>
          {loading && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
        </div>

        {/* Data Grid Matrix Window Screen Container */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                <th className="py-3.5 px-6">Article Information</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Action Matrix Utilities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {posts.map((post) => (
                <tr key={post._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 max-w-xs">
                    <div className="font-semibold text-slate-900 truncate">{post.title}</div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">{post.slug}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100">
                      {post.category}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                      post.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {post.isPublished ? "Live" : "Disabled"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      
                      {/* ACTION 1: Click to trigger Full Screen Split Live HTML Engine Workspace */}
                      <button
                        onClick={() => setEditingHtmlPost(post)}
                        title="Edit Component HTML Split Engine Code"
                        className="p-1.5 flex items-center gap-1 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md text-xs font-semibold transition-all"
                      >
                        <Code className="h-3.5 w-3.5" /> HTML Workspace
                      </button>
                      <button
                        onClick={() => { setEditingMetaPost(post); setIsMetaModalOpen(true); }}
                        title="Edit Article Meta Data Parameters"
                        className="p-1.5 flex items-center gap-1 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md text-xs font-semibold transition-all"
                      >
                        <Settings2 className="h-3.5 w-3.5" /> Edit Info
                      </button>
                      <button
                        onClick={() => handleToggleStatus(post._id, post.isPublished)}
                        className="p-1.5 text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-md"
                      >
                        {post.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 rounded-md"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EditMetaModal
          isOpen={isMetaModalOpen}
          post={editingMetaPost}
          onClose={() => { setIsMetaModalOpen(false); setEditingMetaPost(null); }}
          onSuccess={handleMetaUpdateSuccess as any}
        />

      </div>
    </div>
  );
}