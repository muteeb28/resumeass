"use client"

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import SidebarDemo from "@/components/sidebar-demo";
import HrEmailsTable from "@/components/hr-emails-table";
import JobBoard from "@/components/job-board";

type View = "jobs" | "tracker" | "emails";

function JobTrackerContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as View | null;
  const [view, setView] = useState<View>(tabParam === "jobs" || tabParam === "emails" ? tabParam : "tracker");

  const tabs: { id: View; label: string }[] = [
    { id: "jobs", label: "Find Jobs" },
    { id: "tracker", label: "Job Tracker" },
    { id: "emails", label: "HR Emails" },
  ];

  return (
    <BackgroundRippleLayout tone="light" contentClassName="pt-16">
      <Navbar tone="light" />

      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Tab switcher */}
          <div className="flex items-center gap-1 rounded-full bg-white border border-neutral-200 p-1 shadow-sm w-fit mb-10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition ${
                  view === tab.id
                    ? "bg-neutral-900 text-white shadow"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {view === "jobs" && <JobBoard />}

          {view === "tracker" && (
            <>
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">
                  Job Tracker
                </p>
                <h1 className="text-3xl md:text-5xl font-bold text-neutral-900">
                  Keep every application organized
                </h1>
                <p className="text-neutral-500 mt-3 max-w-2xl">
                  Track stages, export to Google Sheets, and manage HR outreach from a single
                  workspace.
                </p>
              </div>
              <SidebarDemo />
            </>
          )}

          {view === "emails" && (
            <>
              <div className="mb-8">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">
                  HR Emails
                </p>
                <h1 className="text-3xl md:text-5xl font-bold text-neutral-900">
                  Your outreach inbox
                </h1>
                <p className="text-neutral-500 mt-3 max-w-2xl">
                  Review and manage all HR email communications in one place.
                </p>
              </div>
              <HrEmailsTable
                className="border border-neutral-200 bg-white shadow-sm rounded-lg"
                tableClassName="max-h-[520px]"
              />
            </>
          )}
        </div>
      </section>
    </BackgroundRippleLayout>
  );
}

export default function JobTrackerRoute() {
  return (
    <Suspense>
      <JobTrackerContent />
    </Suspense>
  );
}
