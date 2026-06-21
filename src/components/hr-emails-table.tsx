"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Copy, Check, Linkedin, Globe, Search, ChevronLeft, ChevronRight, Lock, Sparkles, ArrowRight, Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/utils";
import { TABLE_ROWS, TABLE_ROW } from "../lib/motion";
import axiosInstance from "@/lib/axios";
import { useUserStore } from "@/stores/useUserStore";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HrContact {
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

// ─── Status system ────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  replied: {
    label: "Replied",
    bg: "var(--color-hub-salary-bg)",
    color: "var(--color-hub-salary)",
    border: "oklch(0.49 0.16 148 / 0.2)",
  },
  opened: {
    label: "Opened",
    bg: "var(--color-hub-warn-bg)",
    color: "var(--color-hub-warn)",
    border: "oklch(0.57 0.15 55 / 0.2)",
  },
  sent: {
    label: "Sent",
    bg: "var(--color-hub-bg-subtle)",
    color: "var(--color-hub-text-3)",
    border: "var(--color-hub-border)",
  },
}

function getStatus(raw: string) {
  const key = (raw || "active").toLowerCase();
  return (
    STATUS_MAP[key] ?? {
      label: raw || "Active",
      bg: "var(--color-hub-bg-subtle)",
      color: "var(--color-hub-text-3)",
      border: "var(--color-hub-border)",
    }
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <tr key={i} className="border-b border-hub-border animate-pulse">
          <td className="px-4 py-[11px]">
            <div className="space-y-[5px]">
              <div className="h-[13px] w-28 bg-hub-bg-subtle rounded" />
              <div className="h-[11px] w-20 bg-hub-bg-subtle rounded" />
            </div>
          </td>
          <td className="px-4 py-[11px]">
            <div className="h-[13px] w-24 bg-hub-bg-subtle rounded" />
          </td>
          <td className="px-4 py-[11px]">
            <div className="h-[13px] w-36 bg-hub-bg-subtle rounded" />
          </td>
          <td className="px-4 py-[11px]">
            <div className="h-[13px] w-20 bg-hub-bg-subtle rounded" />
          </td>
          <td className="px-4 py-[11px]">
            <div className="h-[13px] w-10 bg-hub-bg-subtle rounded" />
          </td>
          <td className="px-4 py-[11px]">
            <div className="h-[19px] w-14 bg-hub-bg-subtle rounded-[4px]" />
          </td>
        </tr>
      ))}
    </>
  );
}

function StatusBadge({ raw }: { raw: string }) {
  const { label, bg, color, border } = getStatus(raw);
  return (
    <span
      className="inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-0.5 rounded-[4px]"
      style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
    >
      <span
        className="w-[4px] h-[4px] rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function LinkIcon({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) {
  if (!href || href === "-") return null;
  const url = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="p-1 rounded-[4px] text-hub-text-3 outline-none"
      style={{ transition: "color 130ms, background-color 130ms" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.color = "var(--color-hub-text-1)";
        el.style.backgroundColor = "var(--color-hub-bg-subtle)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.color = "";
        el.style.backgroundColor = "";
      }}
    >
      <Icon size={13} strokeWidth={1.8} />
    </a>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HrEmailsTable({
  className,
  tableClassName,
  country,
  loginHref = "/login",
  membershipHref = "/pricing",
}: {
  className?: string;
  tableClassName?: string;
  country: string;
  loginHref?: string;
  membershipHref?: string;
}) {
  const [contacts, setContacts] = useState<HrContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Track which row IDs have manually revealed their email addresses
  const [revealedEmails, setRevealedEmails] = useState<Record<string, boolean>>({});

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { user, membership } = useUserStore();

  const hasAccess = 
    membership?.status === 'active' && 
    ['premium', 'ultra'].includes(membership.tier?.toLowerCase());

  // Demo fallback rows
  const demoContactsPlaceholder: HrContact[] = Array.from({ length: 6 }).map((_, i) => ({
    id: `demo-${i}`,
    name: i === 0 ? "Sarah Jenkins" : i === 1 ? "David Chen" : "John Doe",
    title: i === 0 ? "Lead Recruiter" : i === 1 ? "Talent Acquisition Specialist" : "Senior Talent Acquisition Specialist",
    company: i === 0 ? "Google" : i === 1 ? "Stripe" : "Acme Corporation",
    email: i === 0 ? "sarah.j@google.com" : i === 1 ? "dchen@stripe.com" : "john.doe@acme.com",
    location: country === "dubai" ? "Dubai, UAE" : "Bangalore, India",
    linkedIn: "#",
    website: "#",
    status: i % 2 === 0 ? "opened" : "sent",
    phone: "", social: "", twitter: "", createdAt: "", updateAt: ""
  }));

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      let url = "";
      
      if (!membership || membership.status !== 'active') {
        url = "/hr/list/demo";
      } else {
        let targetCountry = "";
        if (membership.tier === 'premium') targetCountry = "india";
        else if (membership.tier === 'ultra') targetCountry = "dubai";
        
        if (targetCountry) {
          const shouldCount = page === 1 ? "&count=true" : "";
          url = `/hr/list/purchased/${targetCountry}?page=${page}&company=${searchTerm}${shouldCount}`;
        } else {
          url = "/hr/list/demo";
        }
      }

      const res = await axiosInstance.get(url);
      
      if (res.data.success) {
        const data = hasAccess ? res.data.data : res.data.list;
        setContacts(data ?? []);
        if (membership && res.data.pagination && res.data.pagination.totalPages !== null) {
          setTotalPages(res.data.pagination.totalPages);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [membership, page, searchTerm, country, hasAccess]);

  useEffect(() => {
    fetchContacts();
    // Reset revealed maps when page transitions or keywords update
    setRevealedEmails({});
  }, [fetchContacts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearchTerm(searchInput);
  };

  const toggleEmailVisibility = (id: string) => {
    setRevealedEmails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderedRows = hasAccess ? contacts : (contacts.length > 0 ? contacts : demoContactsPlaceholder);

  return (
    <div className={cn("bg-hub-surface border border-hub-border rounded-[14px] overflow-hidden flex flex-col relative", className)}>
      
      {/* ─── Search Bar ─── */}
      {hasAccess && (
        <div className="p-3 border-b border-hub-border bg-hub-bg-subtle/30">
          <form onSubmit={handleSearchSubmit} className="relative max-w-sm flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-hub-text-3" size={14} />
              <input 
                type="text"
                placeholder="Type company name (e.g. Infosys)..."
                className="w-full bg-hub-surface border border-hub-border rounded-md pl-9 pr-3 py-1.5 text-[13px] outline-none focus:border-hub-text-3 transition-colors"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              className="px-3 py-1.5 bg-hub-text-1 text-hub-surface rounded-md text-[12.5px] font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* ─── Table Body Container ─── */}
      <div className={cn("overflow-x-auto overflow-y-auto flex-grow relative", tableClassName)}>
        <table className="min-w-full text-left table-fixed md:table-auto">
          <thead className="sticky top-0 z-20 bg-hub-bg-subtle">
            <tr className="border-b border-hub-border">
              {["Contact", "Company", "Email", "Location", "Links", "Status"].map((col) => (
                <th key={col} className="px-4 py-[9px] text-[11.5px] font-semibold text-hub-text-3 whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableSkeleton />
            ) : renderedRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-[13px] text-hub-text-3">No contacts found.</td>
              </tr>
            ) : (
              renderedRows.map((row, index) => {
                const shouldBlurRow = !hasAccess && index >= 4;
                const isDemoRow = row.id?.startsWith("demo-") || !hasAccess;
                
                // Determine layout string for email target
                const isRevealed = revealedEmails[row.id] || false;
                const displayEmail = isDemoRow 
                  ? row.email 
                  : (isRevealed ? row.email : "••••••••••••••••");

                return (
                  <motion.tr 
                    key={row.id ?? index} 
                    variants={TABLE_ROW} 
                    initial="hidden" 
                    animate="show" 
                    className={cn(
                      "border-b border-hub-border last:border-b-0 hover:bg-hub-bg-subtle transition-colors",
                      shouldBlurRow && (index === 4 ? "blur-[3px] opacity-50 select-none pointer-events-none" : "blur-[8px] opacity-20 select-none pointer-events-none")
                    )}
                  >
                    <td className="px-4 py-[11px] min-w-[160px]">
                      <span className="block text-[13px] font-semibold text-hub-text-1 leading-snug">{row.name || "—"}</span>
                      {row.title && <span className="block text-[12px] text-hub-text-3 mt-[2px] leading-snug">{row.title}</span>}
                    </td>
                    <td className="px-4 py-[11px] min-w-[140px]"><span className="text-[13px] text-hub-text-1">{row.company || "—"}</span></td>
                    
                    {/* ─── Email Column with Anti-Screenshot Eye Toggle ─── */}
                    <td className="px-4 py-[11px] min-w-[220px]">
                      <div className="flex items-center gap-2 group/email">
                        <span className={cn(
                          "text-[12.5px] truncate max-w-[160px]",
                          !isDemoRow && !isRevealed ? "text-hub-text-3 tracking-widest font-mono select-none" : "text-hub-text-2"
                        )}>
                          {displayEmail || "—"}
                        </span>
                        
                        {/* Control buttons inside dynamic validation parameters */}
                        {row.email && row.email !== "-" && !shouldBlurRow && (
                          <div className="flex items-center gap-1">
                            {/* Toggle Eye Switcher: Rendered strictly for actual premium accounts layout rows */}
                            {!isDemoRow && (
                              <button 
                                onClick={() => toggleEmailVisibility(row.id)}
                                className="p-0.5 rounded-[3px] text-hub-text-3 hover:text-hub-text-1 transition-colors"
                                title={isRevealed ? "Hide Email" : "Show Email"}
                              >
                                {isRevealed ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                            )}
                            
                            {/* Copy button appears if explicitly visible or if it is a demo environment row */}
                            {(isDemoRow || isRevealed) && (
                              <button 
                                onClick={() => { navigator.clipboard.writeText(row.email); setCopiedId(row.id); setTimeout(() => setCopiedId(null), 1500); }} 
                                className="p-0.5 rounded-[3px] text-hub-text-3 hover:text-hub-text-1 transition-colors"
                              >
                                {copiedId === row.id ? <Check size={11} className="text-green-500" /> : <Copy size={11} className="opacity-40 group-hover/email:opacity-100" />}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-[11px] min-w-[120px]"><span className="text-[12.5px] text-hub-text-3">{row.location || "—"}</span></td>
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

        {/* ─── Medium-style Bottom 30% Paywall Lock Overlay ─── */}
        {!hasAccess && !loading && (
          <div className="absolute left-0 right-0 bottom-0 top-auto h-[45%] z-30 flex items-end justify-center bg-gradient-to-t from-hub-surface via-hub-surface/90 to-transparent p-4 pb-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="w-full max-w-xl rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_16px_48px_rgba(15,23,42,0.1)] backdrop-blur-sm sm:p-5 pointer-events-auto"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <div className="max-w-xs sm:max-w-sm">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      Members Only
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-slate-900">
                      {user ? "Unlock remaining HR contacts" : "Sign in to access more contacts"}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                      You are previewing live items. Active tier removes the bottom fade constraint instantly.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 sm:items-end">
                  {!user ? (
                    <a
                      href={loginHref}
                      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                    >
                      Login
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  ) : (
                    <a
                      href={membershipHref}
                      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-sm hover:bg-amber-400 transition-colors"
                    >
                      Unlock List
                      <ArrowRight className="h-3 w-3" />
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
        <div className="px-4 py-3 border-t border-hub-border flex items-center justify-between bg-hub-bg-subtle/10">
          <span className="text-[12px] text-hub-text-3">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded-md border border-hub-border bg-hub-surface disabled:opacity-40 hover:bg-hub-bg-subtle transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-md border border-hub-border bg-hub-surface disabled:opacity-40 hover:bg-hub-bg-subtle transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}