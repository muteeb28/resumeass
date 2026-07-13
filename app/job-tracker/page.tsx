"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { TabHeader } from "@/components/jobs-hub/TabHeader"
import SidebarDemo from "@/components/sidebar-demo"
import { TABS } from "@/components/jobs-hub/tabs.config"
import { TAB_PANEL } from "@/lib/motion"

const config = TABS.find((t) => t.id === "tracker")!

export default function JobTrackerPage() {
  return (
    <div className="min-h-screen bg-page pt-[74px]">
      <Navbar tone="light" />
      <main className="max-w-7xl mx-auto px-5 pt-7 pb-20">
        <motion.div {...TAB_PANEL}>
          <TabHeader config={config} />
          <SidebarDemo />
        </motion.div>
      </main>
    </div>
  )
}
