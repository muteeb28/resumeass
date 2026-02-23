"use client";
import { useState } from "react";
import { BackgroundRippleLayout } from "./background-ripple-layout";
import { Navbar } from "./navbar";
import SidebarDemo from "./sidebar-demo";
import HrEmailsTable from "./hr-emails-table";

export default function JobTrackerPage() {
  const [view, setView] = useState<"tracker" | "emails">("tracker");

  return (
    <BackgroundRippleLayout tone="light" contentClassName="pt-16">
      <Navbar tone="light" />

      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">
                Job Tracker
              </p>
              <h1 className="text-3xl md:text-5xl font-bold text-neutral-900">
                Keep every application organized
              </h1>
              <p className="text-neutral-500 mt-3 max-w-2xl">
                Track stages, export to Google Sheets, and manage HR outreach from a single workspace.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white border border-neutral-200 p-1 shadow-sm">
              <button
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                  view === "tracker"
                    ? "bg-neutral-900 text-white shadow"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
                onClick={() => setView("tracker")}
                type="button"
              >
                Job Tracker UI
              </button>
              <button
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                  view === "emails"
                    ? "bg-neutral-900 text-white shadow"
                    : "text-neutral-500 hover:text-neutral-900"
                }`}
                onClick={() => setView("emails")}
                type="button"
              >
                HR Emails
              </button>
            </div>
          </div>

          {view === "tracker" ? (
            <SidebarDemo />
          ) : (
            <HrEmailsTable
              className="border border-neutral-200 bg-white shadow-sm rounded-lg"
              tableClassName="max-h-[520px]"
            />
          )}
        </div>
      </section>
    </BackgroundRippleLayout>
  );
}
