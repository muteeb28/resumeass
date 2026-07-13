"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Linkedin, Globe, Search, ChevronLeft, ChevronRight, Lock, Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { TABLE_ROW } from "@/lib/motion";

export interface HrContact {
  id: string;
  name: string;
  email: string;
  title: string;
  company: string;
  status: string;
  website: string;
  linkedIn: string;
  location: string;
  phone: string;
  social: string;
  twitter: string;
  createdAt: string;
  updateAt: string;
}

interface HrEmailsTableProps {
  className?: string;
  tableClassName?: string;
  contacts: HrContact[];
  loading: boolean;
  hasAccess: boolean;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onSearchSubmit: (searchTerm: string) => void;
  userLoggedIn: boolean;
  loginHref?: string;
  membershipHref?: string;
}

const STATUS_MAP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  replied: {
    label: "Replied",
    bg: "bg-[#EAF0EF]",
    color: "text-[#0FA573]",
    border: "border-[#0FA573]/20",
  },
  opened: {
    label: "Opened",
    bg: "bg-[#FFF9E6]",
    color: "text-[#C77414]",
    border: "border-[#C77414]/20",
  },
  sent: {
    label: "Sent",
    bg: "bg-[#F5F8F7]",
    color: "text-[#647B8E]",
    border: "border-[#EEF2F1]",
  },
};

function getStatus(raw: string) {
  return STATUS_MAP[(raw || "sent").toLowerCase()] ?? STATUS_MAP.sent;
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-[#EEF2F1] animate-pulse bg-white">
          <td className="px-5 py-4">
            <div className="space-y-2">
              <div className="h-3.5 w-28 bg-[#F5F8F7] rounded-lg" />
              <div className="h-3 w-20 bg-[#F5F8F7]/70 rounded-lg" />
            </div>
          </td>
          <td className="px-5 py-4"><div className="h-3.5 w-24 bg-[#F5F8F7] rounded-lg" /></td>
          <td className="px-5 py-4"><div className="h-3.5 w-36 bg-[#F5F8F7] rounded-lg" /></td>
          <td className="px-5 py-4"><div className="h-3.5 w-20 bg-[#F5F8F7] rounded-lg" /></td>
          <td className="px-5 py-4"><div className="h-3.5 w-10 bg-[#F5F8F7] rounded-lg" /></td>
          <td className="px-5 py-4"><div className="h-6 w-14 bg-[#F5F8F7] rounded-full" /></td>
        </tr>
      ))}
    </>
  );
}

function StatusBadge({ raw }: { raw: string }) {
  const { label, bg, color, border } = getStatus(raw);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm", bg, color, border)}>
      <span className={cn("w-1 h-1 rounded-full flex-shrink-0 animate-pulse bg-current")} />
      {label}
    </span>
  );
}

function LinkIcon({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  if (!href || href === "-") return null;
  const url = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="p-1.5 rounded-lg text-[#647B8E] hover:text-[#0B2A3C] hover:bg-[#F5F8F7] border border-transparent hover:border-[#EEF2F1] transition-all"
    >
      <Icon size={14} strokeWidth={2} />
    </a>
  );
}

export default function HrEmailsTable({
  className,
  tableClassName,
  contacts,
  loading,
  hasAccess,
  page,
  totalPages,
  onPageChange,
  onSearchSubmit,
  userLoggedIn,
  loginHref = "#",
  membershipHref = "/pricing",
}: HrEmailsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedEmails, setRevealedEmails] = useState<Record<string, boolean>>({});
  const [searchInput, setSearchInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchInput);
  };

  const toggleEmailVisibility = (id: string) => {
    setRevealedEmails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={cn("bg-white border border-[#EEF2F1] rounded-2xl overflow-hidden flex flex-col relative", className)}>
      
      {/* Search Input Vector bar */}
      {hasAccess && (
        <div className="p-4 border-b border-[#EEF2F1] bg-[#F8FAFA]">
          <form onSubmit={handleSubmit} className="relative max-w-sm flex gap-2">
            <div className="relative flex-grow group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#647B8E]/50 group-focus-within:text-[#2F7BE0] transition-colors" size={14} />
              <input
                type="text"
                placeholder="Type company name (e.g. Stripe)..."
                className="w-full bg-white border border-[#EEF2F1] rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-[#0B2A3C] outline-none focus:ring-2 focus:ring-[#2F7BE0] focus:border-transparent transition-all placeholder:text-[#647B8E]/30"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-[#0B2A3C] hover:bg-[#163F8C] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors">
              Search
            </button>
          </form>
        </div>
      )}

      {/* Main Framework Table Body */}
      <div className={cn("overflow-x-auto overflow-y-auto flex-grow relative minimal-scrollbar", tableClassName)}>
        <table className="min-w-full text-left table-fixed md:table-auto border-collapse">
          <thead className="sticky top-0 z-20 bg-[#F8FAFA] border-b border-[#EEF2F1]">
            <tr>
              {["Contact", "Company", "Email Destination", "Location Node", "External Links", "Pipeline Status"].map((col) => (
                <th key={col} className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-[#647B8E] whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EEF2F1]">
            {loading ? (
              <TableSkeleton />
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-20 text-center text-xs font-semibold text-[#647B8E]">
                  No matching production contacts located in active pipeline.
                </td>
              </tr>
            ) : (
              contacts.map((row, index) => {
                const shouldBlurRow = !hasAccess && index >= 4;
                const isDemoRow = String(row.id)?.startsWith("demo-") || !hasAccess;
                const isRevealed = revealedEmails[row.id] || false;
                const displayEmail = isDemoRow ? row.email : isRevealed ? row.email : "••••••••••••••••";

                return (
                  <motion.tr
                    key={row.id ?? index}
                    variants={TABLE_ROW}
                    initial="hidden"
                    animate="show"
                    className={cn(
                      "hover:bg-[#F8FAFA]/60 transition-colors group/row",
                      shouldBlurRow && (index === 4 ? "blur-[2.5px] opacity-40 select-none pointer-events-none" : "blur-[7px] opacity-15 select-none pointer-events-none")
                    )}
                  >
                    <td className="px-5 py-3.5 min-w-[180px]">
                      <span className="block text-xs font-bold text-[#0B2A3C] tracking-tight">{row.name || "—"}</span>
                      {row.title && <span className="block text-[11px] font-medium text-[#647B8E] mt-0.5 max-w-[180px] truncate">{row.title}</span>}
                    </td>
                    <td className="px-5 py-3.5 min-w-[140px]"><span className="text-xs font-bold text-[#0B2A3C]">{row.company || "—"}</span></td>
                    <td className="px-5 py-3.5 min-w-[240px]">
                      <div className="flex items-center gap-2 group/email">
                        <span className={cn(
                          "text-xs font-semibold transition-all",
                          !isDemoRow && !isRevealed ? "text-[#647B8E]/40 tracking-widest font-mono select-none" : "text-[#163F8C]"
                        )}>
                          {displayEmail || "—"}
                        </span>
                        {row.email && row.email !== "-" && !shouldBlurRow && (
                          <div className="flex items-center gap-1 opacity-0 group-hover/email:opacity-100 transition-opacity">
                            {!isDemoRow && (
                              <button
                                type="button"
                                onClick={() => toggleEmailVisibility(row.id)}
                                className="p-1 rounded-md text-[#647B8E] hover:text-[#0B2A3C] hover:bg-[#F5F8F7] transition-colors"
                                title={isRevealed ? "Hide Email" : "Show Email"}
                              >
                                {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            )}
                            {(isDemoRow || isRevealed) && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(row.email);
                                  setCopiedId(row.id);
                                  setTimeout(() => setCopiedId(null), 1500);
                                }}
                                className="p-1 rounded-md text-[#647B8E] hover:text-[#0B2A3C] hover:bg-[#F5F8F7] transition-colors"
                              >
                                {copiedId === row.id ? <Check size={13} className="text-[#0FA573]" /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 min-w-[130px]"><span className="text-xs font-medium text-[#647B8E]">{row.location || "—"}</span></td>
                    <td className="px-5 py-3.5 min-w-[90px]">
                      <div className="flex items-center gap-1">
                        <LinkIcon href={(hasAccess || !shouldBlurRow) ? row.linkedIn : "#"} icon={Linkedin} label="LinkedIn" />
                        <LinkIcon href={(hasAccess || !shouldBlurRow) ? row.website : "#"} icon={Globe} label="Website" />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 min-w-[110px]"><StatusBadge raw={row.status} /></td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Dynamic Interactive Blur Lock Overlay Banner */}
        {!hasAccess && !loading && (
          <div className="absolute inset-x-0 bottom-0 top-1/4 z-30 flex items-end justify-center bg-gradient-to-t from-white via-white/95 to-transparent p-6 pb-8 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.97 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.1 }} 
              className="w-full max-w-2xl rounded-2xl border border-[#CFE0FB] bg-white p-5 sm:p-6 shadow-[0_30px_70px_rgba(47,123,224,0.12)] backdrop-blur-md pointer-events-auto relative overflow-hidden group/modal"
            >
              {/* Dynamic decorative backdrop rings */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#CFE0FB]/20 rounded-full blur-2xl transition-transform duration-700 group-hover/modal:scale-125 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2F7BE0] via-[#2FA1DC] to-[#0FA573]" />
              
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between relative z-10">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0B2A3C] text-white shadow-md relative">
                    <Lock className="h-4 w-4" />
                    <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2F7BE0] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2F7BE0]"></span>
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2F7BE0]">
                      <Sparkles className="h-3 w-3 text-[#C77414] animate-spin-slow" /> Premium Vault Index
                    </div>
                    <p className="mt-1 text-sm font-extrabold text-[#0B2A3C] tracking-tight">
                      {userLoggedIn ? "Unlock full candidate pipeline parameters" : "Initialize authentication for complete database access"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-[#647B8E] leading-relaxed">
                      You are utilizing a preview layout tier. Active structural memberships remove verification blockades instantly.
                    </p>
                  </div>
                </div>
                
                <div className="flex shrink-0">
                  <a 
                    href={userLoggedIn ? membershipHref : loginHref} 
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#2F7BE0] hover:bg-[#1D5FD8] px-5 h-11 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#2F7BE0]/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {userLoggedIn ? "Upgrade Node" : "Sign In Gateway"} 
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/modal:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Pagination Footer Controls */}
      {hasAccess && !loading && contacts.length > 0 && (
        <div className="px-5 py-3 border-t border-[#EEF2F1] flex items-center justify-between bg-[#F8FAFA]">
          <span className="text-xs font-semibold text-[#647B8E]">
            Displaying structural index <strong>{page}</strong> of <strong>{totalPages}</strong> nodes
          </span>
          <div className="flex items-center gap-2">
            <button 
              type="button"
              disabled={page === 1} 
              onClick={() => onPageChange(page - 1)} 
              className="p-1.5 rounded-xl border border-[#EEF2F1] bg-white text-[#0B2A3C] disabled:opacity-40 disabled:hover:bg-white hover:bg-[#F5F8F7] transition-all"
            >
              <ChevronLeft size={15} strokeWidth={2.5} />
            </button>
            <button 
              type="button"
              disabled={page >= totalPages} 
              onClick={() => onPageChange(page + 1)} 
              className="p-1.5 rounded-xl border border-[#EEF2F1] bg-white text-[#0B2A3C] disabled:opacity-40 disabled:hover:bg-white hover:bg-[#F5F8F7] transition-all"
            >
              <ChevronRight size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}