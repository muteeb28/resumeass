"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { TabHeader } from "@/components/jobs-hub/TabHeader";
import { LiveReadyBadge } from "@/components/jobs-hub/LiveReadyBadge";
import HrEmailsTable, { HrContact } from "@/components/hr-emails-table";
import { TABS } from "@/components/jobs-hub/tabs.config";
import { TAB_PANEL } from "@/lib/motion";
import axiosInstance from "@/lib/axios";
import { useUserStore } from "@/stores/useUserStore";

const TABLE_CLASS = "border border-border-soft bg-page rounded-(--jf-radius-frame)";
const config = TABS.find((t) => t.id === "dubai-hr")!;

export default function DubaiHrPage() {
  const { user, membership } = useUserStore();
  const [contacts, setContacts] = useState<HrContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const hasAccess =
    membership?.status === "active" &&
    ["premium", "ultra"].includes(membership.tier?.toLowerCase());

  const demoContactsPlaceholder: HrContact[] = Array.from({ length: 6 }).map((_, i) => ({
    id: `demo-${i}`,
    name: i === 0 ? "Sarah Jenkins" : i === 1 ? "David Chen" : "John Doe",
    title: i === 0 ? "Lead Recruiter" : i === 1 ? "Talent Acquisition Specialist" : "Senior Talent Acquisition Specialist",
    company: i === 0 ? "Google" : i === 1 ? "Stripe" : "Acme Corporation",
    email: i === 0 ? "sarah.j@google.com" : i === 1 ? "dchen@stripe.com" : "john.doe@acme.com",
    location: "Dubai, UAE",
    linkedIn: "#",
    website: "#",
    status: i % 2 === 0 ? "opened" : "sent",
    phone: "", social: "", twitter: "", createdAt: "", updateAt: ""
  }));

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      let url = "";

      if (!membership || membership.status !== "active") {
        // Updated to use your explicit fallback route for Dubai
        url = "/hr/list/demo/dubai";
      } else {
        // Authenticated route alignment for Dubai
        const shouldCount = page === 1 ? "&count=true" : "";
        url = `/hr/list/purchased/dubai?page=${page}&company=${searchTerm}${shouldCount}`;
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
      console.error("Dubai Fetch Error:", err);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, [membership, page, searchTerm, hasAccess]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleSearchSubmit = (term: string) => {
    setPage(1);
    setSearchTerm(term);
  };

  const jobflixViewBase = process.env.NEXT_PUBLIC_JOBFLIX_VIEW || "";
  const loginHref =
    typeof window !== "undefined"
      ? `${jobflixViewBase}/login?next=${encodeURIComponent(window.location.href)}`
      : `${jobflixViewBase}/login`;

  const renderedRows = hasAccess ? contacts : contacts.length > 0 ? contacts : demoContactsPlaceholder;

  return (
    <div className="min-h-screen bg-page pt-[74px]">
      <Navbar tone="light" />
      <main className="max-w-7xl mx-auto px-5 pt-7 pb-20">
        <motion.div {...TAB_PANEL}>
          <TabHeader config={config} badge={<LiveReadyBadge text="Live" />} />
          <HrEmailsTable
            className={TABLE_CLASS}
            tableClassName="max-h-[520px]"
            contacts={renderedRows}
            loading={loading}
            hasAccess={hasAccess}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onSearchSubmit={handleSearchSubmit}
            userLoggedIn={!!user}
            loginHref={loginHref}
            membershipHref="/pricing"
          />
        </motion.div>
      </main>
    </div>
  );
}