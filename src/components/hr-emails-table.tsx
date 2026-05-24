"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Copy, Check, Linkedin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { TABLE_ROWS, TABLE_ROW } from "@/lib/motion";

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
}: {
  className?: string;
  tableClassName?: string;
}) {
  const [contacts, setContacts] = useState<HrContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_JOBFILX_APIURL}/hr/list/demo`
        );
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        setContacts(data?.list ?? []);
      } catch {
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  function copyEmail(id: string, email: string) {
    if (!email || email === "-") return;
    navigator.clipboard.writeText(email).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div
      className={cn(
        "bg-hub-surface border border-hub-border rounded-[14px] overflow-hidden",
        className
      )}
      style={{ fontFamily: "var(--font-hub)" }}
    >
      <div className={cn("overflow-x-auto overflow-y-auto", tableClassName)}>
        <table className="min-w-full text-left">
          <thead className="sticky top-0 z-10 bg-hub-bg-subtle">
            <tr className="border-b border-hub-border">
              {["Contact", "Company", "Email", "Location", "Links", "Status"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-4 py-[9px] text-[11.5px] font-semibold text-hub-text-3 whitespace-nowrap"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>

          {loading ? (
            <tbody>
              <TableSkeleton />
            </tbody>
          ) : contacts.length === 0 ? (
            <tbody>
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-16 text-center text-[13px] text-hub-text-3"
                >
                  No contacts found.
                </td>
              </tr>
            </tbody>
          ) : (
            <motion.tbody
              variants={TABLE_ROWS}
              initial="hidden"
              animate="show"
            >
              {contacts.map((row, index) => (
                <motion.tr
                  key={row.id ?? `row-${index}`}
                  variants={TABLE_ROW}
                  className="border-b border-hub-border last:border-b-0"
                  style={{ transition: "background-color 100ms" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--color-hub-bg-subtle)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "";
                  }}
                >
                  {/* Contact: name + title */}
                  <td className="px-4 py-[11px] min-w-[160px]">
                    <span className="block text-[13px] font-semibold text-hub-text-1 leading-snug">
                      {row.name || "—"}
                    </span>
                    {row.title && (
                      <span className="block text-[12px] text-hub-text-3 mt-[2px] leading-snug">
                        {row.title}
                      </span>
                    )}
                  </td>

                  {/* Company */}
                  <td className="px-4 py-[11px] min-w-[140px]">
                    <span className="text-[13px] text-hub-text-1">
                      {row.company || "—"}
                    </span>
                  </td>

                  {/* Email + copy */}
                  <td className="px-4 py-[11px] min-w-[200px]">
                    <div className="flex items-center gap-1.5 group/email">
                      <span className="text-[12.5px] text-hub-text-2 truncate max-w-[180px]">
                        {row.email || "—"}
                      </span>
                      {row.email && row.email !== "-" && (
                        <button
                          onClick={() => copyEmail(row.id ?? `row-${index}`, row.email)}
                          aria-label="Copy email"
                          className="flex-shrink-0 p-0.5 rounded-[3px] text-hub-text-3 outline-none"
                          style={{ transition: "color 130ms, opacity 130ms" }}
                        >
                          {copiedId === (row.id ?? `row-${index}`) ? (
                            <Check size={11} strokeWidth={2.5} style={{ color: "var(--color-hub-salary)" }} />
                          ) : (
                            <Copy size={11} strokeWidth={1.8} className="opacity-40 group-hover/email:opacity-100" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-[11px] min-w-[120px]">
                    <span className="text-[12.5px] text-hub-text-3">
                      {row.location || "—"}
                    </span>
                  </td>

                  {/* Links: LinkedIn + Website */}
                  <td className="px-4 py-[11px] min-w-[80px]">
                    <div className="flex items-center gap-0.5">
                      <LinkIcon href={row.linkedIn} icon={Linkedin} label="LinkedIn" />
                      <LinkIcon href={row.website} icon={Globe} label="Website" />
                      {!row.linkedIn && !row.website && (
                        <span className="text-[12px] text-hub-text-3">—</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-[11px] min-w-[100px]">
                    <StatusBadge raw={row.status} />
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          )}
        </table>
      </div>
    </div>
  );
}
