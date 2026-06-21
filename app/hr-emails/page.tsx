"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { TabHeader } from "@/components/jobs-hub/TabHeader"
import { LiveReadyBadge } from "@/components/jobs-hub/LiveReadyBadge"
import HrEmailsTable from "@/components/hr-emails-table"
import { TABS } from "@/components/jobs-hub/tabs.config"
import { TAB_PANEL } from "@/lib/motion"

const TABLE_CLASS = "border border-hub-border bg-hub-surface rounded-[14px]"
const config = TABS.find((t) => t.id === "emails")!

export default function HrEmailsPage() {
  return (
    <div className="min-h-screen bg-hub-bg pt-16" style={{ fontFamily: "var(--font-hub)" }}>
      <Navbar tone="light" />
      <main className="max-w-7xl mx-auto px-5 pt-7 pb-20">
        <motion.div {...TAB_PANEL}>
          <TabHeader config={config} badge={<LiveReadyBadge text="Live" />} />
          <HrEmailsTable
            className={TABLE_CLASS}
            tableClassName="max-h-[520px]"
            country="india"
          />
        </motion.div>
      </main>
    </div>
  )
}
