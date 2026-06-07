"use client"

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { JobsHubNav } from "@/components/jobs-hub/JobsHubNav";
import { TabHeader } from "@/components/jobs-hub/TabHeader";
import { LiveReadyBadge } from "@/components/jobs-hub/LiveReadyBadge";
import { RegionalEmptyState } from "@/components/jobs-hub/RegionalEmptyState";
import SidebarDemo from "@/components/sidebar-demo";
import HrEmailsTable from "@/components/hr-emails-table";
import JobBoard from "@/components/job-board";
import { TABS, type TabId } from "@/components/jobs-hub/tabs.config";
import { TAB_PANEL } from "@/lib/motion";
import { useUserStore } from "@/stores/useUserStore";

const TABLE_CLASS = "border border-hub-border bg-hub-surface rounded-[14px]";

function JobTrackerContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as TabId | null;
  const validIds = TABS.map((t) => t.id);
  const [tab, setTab] = useState<TabId>(
    tabParam && validIds.includes(tabParam) ? tabParam : "tracker"
  );

  const cfg = (id: TabId) => TABS.find((t) => t.id === id)!;

  const { membership } = useUserStore();

  return (
    <div className="min-h-screen bg-hub-bg pt-16" style={{ fontFamily: "var(--font-hub)" }}>
      <Navbar tone="light" />

      <JobsHubNav active={tab} onChange={setTab} />

      <main className="max-w-[940px] mx-auto px-5 pt-7 pb-20">
        <AnimatePresence initial={false}>
          <motion.div key={tab} {...TAB_PANEL}>

            {tab === "jobs" && (
              <div role="tabpanel" id="panel-jobs" aria-labelledby="tab-jobs">
                <TabHeader config={cfg("jobs")} badge={<LiveReadyBadge text="Live" />} />
                <JobBoard />
              </div>
            )}

            {tab === "tracker" && (
              <div role="tabpanel" id="panel-tracker" aria-labelledby="tab-tracker">
                <TabHeader config={cfg("tracker")} />
                <SidebarDemo />
              </div>
            )}

            {tab === "emails" && (
              <div role="tabpanel" id="panel-emails" aria-labelledby="tab-emails">
                <TabHeader config={cfg("emails")} badge={<LiveReadyBadge text="Live" />} />
                <HrEmailsTable className={TABLE_CLASS} tableClassName="max-h-[520px]" country="india" />
              </div>
            )}

            {tab === "dubai-hr" && (
              <div role="tabpanel" id="panel-dubai-hr" aria-labelledby="tab-dubai-hr">
                <TabHeader config={cfg("dubai-hr")} badge={<LiveReadyBadge text="Live" />} />
                <HrEmailsTable className={TABLE_CLASS} tableClassName="max-h-[520px]" country="dubai" />
              </div>
            )}

            {tab === "gulf-jobs" && (
              <div role="tabpanel" id="panel-gulf-jobs" aria-labelledby="tab-gulf-jobs">
                <TabHeader config={cfg("gulf-jobs")} />
                <RegionalEmptyState tabId="gulf-jobs" />
              </div>
            )}

            {tab === "au-nz" && (
              <div role="tabpanel" id="panel-au-nz" aria-labelledby="tab-au-nz">
                <TabHeader config={cfg("au-nz")} />
                <RegionalEmptyState tabId="au-nz" />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function JobTrackerRoute() {
  return (
    <Suspense>
      <JobTrackerContent />
    </Suspense>
  );
}
