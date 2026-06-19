"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { TabHeader } from "@/components/jobs-hub/TabHeader"
import { RegionalEmptyState } from "@/components/jobs-hub/RegionalEmptyState"
import { TABS } from "@/components/jobs-hub/tabs.config"
import { TAB_PANEL } from "@/lib/motion"

const config = TABS.find((t) => t.id === "gulf-jobs")!

export default function GulfJobsPage() {
  return (
    <div className="min-h-screen bg-hub-bg pt-16" style={{ fontFamily: "var(--font-hub)" }}>
      <Navbar tone="light" />
      <main className="max-w-[940px] mx-auto px-5 pt-7 pb-20">
        <motion.div {...TAB_PANEL}>
          <TabHeader config={config} />
          <RegionalEmptyState tabId="gulf-jobs" />
        </motion.div>
      </main>
    </div>
  )
}
