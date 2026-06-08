"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Copy, Check, Linkedin, Globe, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  country, // "india" or "dubai"
}: {
  className?: string;
  tableClassName?: string;
  country: string;
}) {
  const [contacts, setContacts] = useState<HrContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Pagination & Search States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // STATIC SEARCH LAYER
  const [searchInput, setSearchInput] = useState(""); // Track keystrokes raw
  const [searchTerm, setSearchTerm] = useState("");   // Only updates on form submission

  const { membership } = useUserStore();

  const hasAccess = 
  membership?.status === 'active' && 
  ['premium', 'ultra'].includes(membership.tier?.toLowerCase());

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      let url = "";
      
      if (!membership || membership.status !== 'active') {
        url = "/hr/list/demo";
      } else {
        let targetCountry = "";

        if (membership.tier === 'premium') {
          targetCountry = "india";
        } else if (membership.tier === 'ultra') {
          targetCountry = "dubai";
        }
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
        
        // Update pagination only if backend provides it (Page 1 or new search queries)
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
  }, [membership, page, searchTerm, country]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Fires ONLY when submit button is clicked or user hits Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Crucial: Reset to page 1 for new search results
    setSearchTerm(searchInput); // Syncing this states triggers the useCallback hook
  };

  return (
    <div className={cn("bg-hub-surface border border-hub-border rounded-[14px] overflow-hidden flex flex-col", className)}>
      
      {/* ─── Search Bar (Only for Members) ─── */}
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
                onChange={(e) => setSearchInput(e.target.value)} // Safe live input tracking
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

      {/* ─── Table Body ─── */}
      <div className={cn("overflow-x-auto overflow-y-auto flex-grow", tableClassName)}>
        <table className="min-w-full text-left">
          <thead className="sticky top-0 z-10 bg-hub-bg-subtle">
            <tr className="border-b border-hub-border">
              {["Contact", "Company", "Email", "Location", "Links", "Status"].map((col) => (
                <th key={col} className="px-4 py-[9px] text-[11.5px] font-semibold text-hub-text-3 whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <TableSkeleton />
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-[13px] text-hub-text-3">No contacts found.</td>
              </tr>
            ) : (
              contacts.map((row, index) => (
                <motion.tr key={row.id ?? index} variants={TABLE_ROW} initial="hidden" animate="show" className="border-b border-hub-border last:border-b-0 hover:bg-hub-bg-subtle transition-colors">
                  <td className="px-4 py-[11px] min-w-[160px]">
                    <span className="block text-[13px] font-semibold text-hub-text-1 leading-snug">{row.name || "—"}</span>
                    {row.title && <span className="block text-[12px] text-hub-text-3 mt-[2px] leading-snug">{row.title}</span>}
                  </td>
                  <td className="px-4 py-[11px] min-w-[140px]"><span className="text-[13px] text-hub-text-1">{row.company || "—"}</span></td>
                  <td className="px-4 py-[11px] min-w-[200px]">
                    <div className="flex items-center gap-1.5 group/email">
                      <span className="text-[12.5px] text-hub-text-2 truncate max-w-[180px]">{row.email || "—"}</span>
                      {row.email && row.email !== "-" && (
                        <button onClick={() => { navigator.clipboard.writeText(row.email); setCopiedId(row.id); setTimeout(() => setCopiedId(null), 1500); }} className="flex-shrink-0 p-0.5 rounded-[3px] text-hub-text-3">
                          {copiedId === row.id ? <Check size={11} className="text-green-500" /> : <Copy size={11} className="opacity-40 group-hover/email:opacity-100" />}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-[11px] min-w-[120px]"><span className="text-[12.5px] text-hub-text-3">{row.location || "—"}</span></td>
                  <td className="px-4 py-[11px] min-w-[80px]">
                    <div className="flex items-center gap-0.5">
                      <LinkIcon href={row.linkedIn} icon={Linkedin} label="LinkedIn" />
                      <LinkIcon href={row.website} icon={Globe} label="Website" />
                    </div>
                  </td>
                  <td className="px-4 py-[11px] min-w-[100px]"><StatusBadge raw={row.status} /></td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
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

      {/* ─── Upgrade Teaser ─── */}
      {/* {!membership && (
        <div className="p-4 bg-hub-bg-subtle/50 text-center border-t border-hub-border">
          <p className="text-[13px] text-hub-text-2 mb-2">Upgrade to Premium to access 5,000+ verified HR contacts with pagination and search.</p>
          <button className="text-[12px] font-bold text-blue-500 hover:underline">View Pricing →</button>
        </div>
      )} */}
    </div>
  );
}
