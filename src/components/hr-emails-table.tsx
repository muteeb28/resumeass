"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Linkedin, Globe, Search, ChevronLeft, ChevronRight, Lock, Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/utils";
import { TABLE_ROW } from "../lib/motion";

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Status system ────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  replied: {
    label: "Replied",
    bg: "color-mix(in oklab, var(--color-success) 10%, transparent)",
    color: "var(--color-success)",
    border: "color-mix(in oklab, var(--color-success) 20%, transparent)",
  },
  opened: {
    label: "Opened",
    bg: "color-mix(in oklab, var(--color-warning) 10%, transparent)",
    color: "var(--color-warning)",
    border: "color-mix(in oklab, var(--color-warning) 20%, transparent)",
  },
  sent: {
    label: "Sent",
    bg: "var(--color-surface-alt)",
    color: "var(--color-ink-500)",
    border: "var(--color-border-soft)",
  },
};

function getStatus(raw: string) {
  const key = (raw || "active").toLowerCase();
  return (
    STATUS_MAP[key] ?? {
      label: raw || "Active",
      bg: "var(--color-surface-alt)",
      color: "var(--color-ink-500)",
      border: "var(--color-border-soft)",
    }
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <tr key={i} className="border-b border-border-soft animate-pulse">
          <td className="px-4 py-[11px]">
            <div className="space-y-[5px]">
              <div className="h-[13px] w-28 bg-surface-alt rounded" />
              <div className="h-[11px] w-20 bg-surface-alt rounded" />
            </div>
          </td>
          <td className="px-4 py-[11px]"><div className="h-[13px] w-24 bg-surface-alt rounded" /></td>
          <td className="px-4 py-[11px]"><div className="h-[13px] w-36 bg-surface-alt rounded" /></td>
          <td className="px-4 py-[11px]"><div className="h-[13px] w-20 bg-surface-alt rounded" /></td>
          <td className="px-4 py-[11px]"><div className="h-[13px] w-10 bg-surface-alt rounded" /></td>
          <td className="px-4 py-[11px]"><div className="h-[19px] w-14 bg-surface-alt rounded-(--jf-radius-mini)" /></td>
        </tr>
      ))}
    </>
  );
}

function StatusBadge({ raw }: { raw: string }) {
  const { label, bg, color, border } = getStatus(raw);
  return (
    <span
      className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-0.5 rounded-(--jf-radius-mini)"
      style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
    >
      <span className="w-[4px] h-[4px] rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
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
      className="p-1 rounded-(--jf-radius-mini) text-ink-500 outline-none transition-colors hover:text-ink-900 hover:bg-surface-alt"
    >
      <Icon size={13} strokeWidth={1.8} />
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
    <div className={cn("bg-page border border-border-soft rounded-(--jf-radius-frame) overflow-hidden flex flex-col relative", className)}>
      
      {/* ─── Search Bar ─── */}
      {hasAccess && (
        <div className="p-3 border-b border-border-soft bg-surface-alt/30">
          <form onSubmit={handleSubmit} className="relative max-w-sm flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-500" size={14} />
              <input
                type="text"
                placeholder="Type company name (e.g. Infosys)..."
                className="w-full bg-page border border-border-soft rounded-md pl-9 pr-3 py-1.5 text-[13px] outline-none focus:border-ink-500 transition-colors"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="px-3 py-1.5 bg-ink-900 text-page rounded-md text-[12.5px] font-medium hover:opacity-90 transition-opacity">
              Search
            </button>
          </form>
        </div>
      )}

      {/* ─── Table Container ─── */}
      <div className={cn("overflow-x-auto overflow-y-auto flex-grow relative", tableClassName)}>
        <table className="min-w-full text-left table-fixed md:table-auto">
          <thead className="sticky top-0 z-20 bg-surface-alt">
            <tr className="border-b border-border-soft">
              {["Contact", "Company", "Email", "Location", "Links", "Status"].map((col) => (
                <th key={col} className="px-4 py-[9px] text-[11.5px] font-semibold text-ink-500 whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableSkeleton />
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-[13px] text-ink-500">No contacts found.</td>
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
                      "border-b border-border-soft last:border-b-0 hover:bg-surface-alt transition-colors",
                      shouldBlurRow && (index === 4 ? "blur-[3px] opacity-50 select-none pointer-events-none" : "blur-[8px] opacity-20 select-none pointer-events-none")
                    )}
                  >
                    <td className="px-4 py-[11px] min-w-[160px]">
                      <span className="block text-[13px] font-semibold text-ink-900 leading-snug">{row.name || "—"}</span>
                      {row.title && <span className="block text-[12px] text-ink-500 mt-[2px] leading-snug">{row.title}</span>}
                    </td>
                    <td className="px-4 py-[11px] min-w-[140px]"><span className="text-[13px] text-ink-900">{row.company || "—"}</span></td>
                    <td className="px-4 py-[11px] min-w-[220px]">
                      <div className="flex items-center gap-2 group/email">
                        <span className={cn("text-[12.5px] truncate max-w-[160px]", !isDemoRow && !isRevealed ? "text-ink-500 tracking-widest font-mono select-none" : "text-ink-600")}>
                          {displayEmail || "—"}
                        </span>
                        {row.email && row.email !== "-" && !shouldBlurRow && (
                          <div className="flex items-center gap-1">
                            {!isDemoRow && (
                              <button
                                onClick={() => toggleEmailVisibility(row.id)}
                                className="p-0.5 rounded-(--jf-radius-mini) text-ink-500 hover:text-ink-900 transition-colors"
                                title={isRevealed ? "Hide Email" : "Show Email"}
                              >
                                {isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                            )}
                            {(isDemoRow || isRevealed) && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(row.email);
                                  setCopiedId(row.id);
                                  setTimeout(() => setCopiedId(null), 1500);
                                }}
                                className="p-0.5 rounded-(--jf-radius-mini) text-ink-500 hover:text-ink-900 transition-colors"
                              >
                                {copiedId === row.id ? <Check size={11} className="text-green-500" /> : <Copy size={11} className="opacity-40 group-hover/email:opacity-100" />}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-[11px] min-w-[120px]"><span className="text-[12.5px] text-ink-500">{row.location || "—"}</span></td>
                    <td className="px-4 py-[11px] min-w-[80px]">
                      <div className="flex items-center gap-0.5">
                        <LinkIcon href={(hasAccess || !shouldBlurRow) ? row.linkedIn : "#"} icon={Linkedin} label="LinkedIn" />
                        <LinkIcon href={(hasAccess || !shouldBlurRow) ? row.website : "#"} icon={Globe} label="Website" />
                      </div>
                    </td>
                    <td className="px-4 py-[11px] min-w-[100px]"><StatusBadge raw={row.status} /></td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* ─── Blur Lock Overlay ─── */}
        {!hasAccess && !loading && (
          <div className="absolute left-0 right-0 bottom-0 top-auto h-[45%] z-30 flex items-end justify-center bg-gradient-to-t from-page via-page/90 to-transparent p-4 pb-6 pointer-events-none">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }} className="w-full max-w-xl rounded-(--jf-radius-panel) border border-border-soft bg-page p-4 shadow-[0_16px_48px_rgba(15,23,42,0.1)] backdrop-blur-sm sm:p-5 pointer-events-auto">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white shadow-sm">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <div className="max-w-xs sm:max-w-sm">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-400">
                      <Sparkles className="h-3 w-3 text-amber-500" /> Members Only
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-ink-900">{userLoggedIn ? "Unlock remaining HR contacts" : "Sign in to access more contacts"}</p>
                    <p className="mt-0.5 text-[11px] leading-4 text-ink-500">You are previewing live items. Active tier removes the bottom fade constraint instantly.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0 sm:items-end">
                  {!userLoggedIn ? (
                    <a href={loginHref} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-ink-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-ink-700 transition-colors">
                      Login <ArrowRight className="h-3 w-3" />
                    </a>
                  ) : (
                    <a href={membershipHref} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
                      Unlock List <ArrowRight className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ─── Pagination Footer ─── */}
      {hasAccess && !loading && contacts.length > 0 && (
        <div className="px-4 py-3 border-t border-border-soft flex items-center justify-between bg-surface-alt/10">
          <span className="text-[12px] text-ink-500">Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
          <div className="flex items-center gap-2">
            <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="p-1.5 rounded-md border border-border-soft bg-page disabled:opacity-40 hover:bg-surface-alt transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="p-1.5 rounded-md border border-border-soft bg-page disabled:opacity-40 hover:bg-surface-alt transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}