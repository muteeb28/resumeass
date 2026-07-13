// src/components/marketing/hero/HeroCardCluster.tsx
import Link from "next/link";
import { ChevronDown, Video, FileText, Users, Code, Server, Laptop, BookOpen, GraduationCap, Compass, Circle } from "lucide-react";

export function HeroCardCluster() {
  return (
    <div className="relative mx-auto h-[460px] w-[470px] select-none scale-[0.75] origin-center sm:scale-[0.9] md:scale-100 sm:origin-top-right lg:ml-auto">
      {/* SVG Connectors - Precise edge-to-edge curved lines */}
      <svg
        viewBox="0 0 470 450"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-70"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="card-arrowhead"
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="4"
            orient="auto"
          >
            <path
              d="M 1 1 L 6 4 L 1 7"
              stroke="var(--color-ink-400)"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </marker>
        </defs>

        {/* Arrow 1: Card 1 (Grow) Right Edge -> Card 2 (Apply) Bottom Edge */}
        <path
          d="M 210 180 C 245 180, 245 200, 285 200"
          stroke="var(--color-ink-400)"
          strokeWidth="1.3"
          markerEnd="url(#card-arrowhead)"
        />

        {/* Arrow 2: Card 2 (Apply) Bottom Edge -> Card 3 (Learn) Top Edge */}
        <path
          d="M 430 200 C 430 215, 450 205, 450 215"
          stroke="var(--color-ink-400)"
          strokeWidth="1.3"
          markerEnd="url(#card-arrowhead)"
        />

        {/* Arrow 3: Card 3 (Learn) Bottom-Left Edge -> Card 1 (Grow) Right Edge */}
        <path
          d="M 200 435 C 160 435, 160 330, 210 330"
          stroke="var(--color-ink-400)"
          strokeWidth="1.3"
          markerEnd="url(#card-arrowhead)"
        />
      </svg>

      {/* CARD 2: Latest Jobs (Top Right, Smallest, z-10) */}
      <div className="absolute top-0 left-[270px] z-10 w-[190px] h-[200px]">
        <div className="flex flex-col h-full rounded-[14px] border border-border-frame bg-page p-3 shadow-[var(--jf-shadow-frame)] transition-shadow duration-200 hover:shadow-[var(--jf-shadow-panel)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-soft pb-2">
            <div className="flex items-center gap-1.5">
              <span className="rounded-[4px] bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 uppercase tracking-wide">
                2. Apply
              </span>
              <h3 className="text-[11px] font-bold text-ink-900 tracking-tight">Latest Jobs</h3>
            </div>
            <BriefcaseIcon />
          </div>

          {/* Job Rows */}
          <div className="mt-2 flex-1 space-y-1.5">
            {[
              { role: "Frontend Engineer", company: "Stripe", score: "95%", logo: "S", bg: "bg-indigo-50 text-indigo-600" },
              { role: "AI Engineer", company: "Google", score: "92%", logo: "G", bg: "bg-red-50 text-red-600" },
              { role: "Software Engineer", company: "Notion", score: "88%", logo: "N", bg: "bg-gray-150 text-gray-900" },
            ].map((job, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-[8px] border border-border-soft/60 bg-surface-alt p-1.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md font-mono text-[9px] font-bold ${job.bg}`}>
                    {job.logo}
                  </div>
                  <div className="min-w-0 leading-none">
                    <div className="truncate text-[9.5px] font-semibold text-ink-900">{job.role}</div>
                    <div className="text-[8px] text-ink-500 mt-0.5">{job.company}</div>
                  </div>
                </div>
                <span className="rounded bg-emerald-50 px-1 py-0.5 text-[8px] font-bold text-emerald-600 leading-none">
                  {job.score}
                </span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-2 flex items-center justify-between border-t border-border-soft pt-1.5 text-[8.5px] font-medium text-ink-500 font-mono">
            <span>150+ new roles</span>
            <span className="text-emerald-500 font-semibold">Live Match →</span>
          </div>
        </div>
      </div>

      {/* CARD 1: Mentorship & Referrals (Center Left, Mid-size, z-30) */}
      <div className="absolute top-[120px] left-0 z-30 w-[210px] h-[250px]">
        <div className="flex flex-col h-full rounded-[14px] border border-border-frame bg-page p-3.5 shadow-[var(--jf-shadow-frame)] transition-shadow duration-200 hover:shadow-[var(--jf-shadow-panel)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-soft pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="rounded-[4px] bg-sapphire-50 px-1.5 py-0.5 text-[9px] font-bold text-sapphire-brand uppercase tracking-wide">
                1. Grow
              </span>
              <h3 className="text-[11.5px] font-bold text-ink-900 tracking-tight">Mentorship</h3>
            </div>
            <Compass size={12} className="text-sapphire-brand" />
          </div>

          {/* Content Dropdown Box */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between rounded-[8px] border border-border-soft bg-surface-alt px-2.5 py-1.5 text-[9.5px] font-medium text-ink-600">
              <span className="truncate">Select career service...</span>
              <ChevronDown size={11} className="text-ink-400" />
            </div>
          </div>

          {/* List of Services */}
          <div className="mt-3 flex-1 space-y-1.5">
            {[
              { name: "Resume Review", desc: "Expert feedback", icon: FileText },
              { name: "1:1 Mentorship", desc: "Book practice rounds", icon: Video },
              { name: "Referrals Finder", desc: "Stripe, Google, Notion", icon: Users },
            ].map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-[8px] border border-border-soft/60 bg-surface-alt px-2.5 py-2"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-sapphire-50 text-sapphire-brand">
                    <Icon size={11} />
                  </div>
                  <div className="leading-none min-w-0">
                    <div className="truncate text-[10px] font-semibold text-ink-900">{service.name}</div>
                    <div className="text-[8px] text-ink-500 mt-0.5">{service.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-2.5 flex items-center justify-between border-t border-border-soft pt-1.5 text-[8.5px] font-medium text-ink-500 font-mono">
            <span>500+ mock rounds</span>
            <span className="text-sapphire-brand font-semibold">Join Network →</span>
          </div>
        </div>
      </div>

      {/* CARD 3: Courses (Bottom Right, Largest, z-20 - overlaps behind Card 1) */}
      <div className="absolute top-[215px] left-[185px] z-20 w-[275px] h-[220px]">
        <div className="flex flex-col h-full rounded-[14px] border border-border-frame bg-page p-3.5 shadow-[var(--jf-shadow-frame)] transition-shadow duration-200 hover:shadow-[var(--jf-shadow-panel)]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-soft pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="rounded-[4px] bg-purple-50 px-1.5 py-0.5 text-[9px] font-bold text-purple-600 uppercase tracking-wide">
                3. Learn
              </span>
              <h3 className="text-[11.5px] font-bold text-ink-900 tracking-tight">Courses</h3>
            </div>
            {/* Small Profile circle icon on right side of header */}
            <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <GraduationCap size={11} />
            </div>
          </div>

          {/* Courses Progress Rows */}
          <div className="mt-3 flex-1 space-y-2.5">
            {[
              { name: "React Patterns & Ecosystem", desc: "10 modules", progress: 75 },
              { name: "System Design Blueprint", desc: "12 modules", progress: 40 },
              { name: "DSA Cracking Course", desc: "20 modules", progress: 90 },
            ].map((course, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-ink-900 truncate pr-2">{course.name}</span>
                  <span className="font-mono text-[8px] text-ink-500 shrink-0">{course.desc}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-track overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${course.progress}%`,
                        background: "var(--jf-grad-bar)",
                      }}
                    />
                  </div>
                  <span className="min-w-[20px] text-right font-mono text-[8px] font-semibold text-ink-900 leading-none">
                    {course.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-2.5 flex items-center justify-between border-t border-border-soft pt-1.5 text-[8.5px] font-medium text-ink-500 font-mono">
            <span>✓ 4k+ candidates active</span>
            <span className="text-purple-500 font-semibold">Start Prep →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple briefcase icon component
function BriefcaseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-ink-400)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-briefcase"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}
