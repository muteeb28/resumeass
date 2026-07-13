// src/components/marketing/hero/HeroCardCluster.tsx
"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, Compass, GraduationCap, Calendar, Zap, 
  Send, ShoppingBag, Layers, Flame, ArrowUpRight
} from "lucide-react";

const floatAnimation = (delay: number, duration: number = 5) => ({
  y: [0, -10, 0],
  transition: {
    duration: duration,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut",
    delay: delay,
  }
} as any);

export function HeroCardCluster() {
  return (
    <div className="relative h-[600px] w-full max-w-[640px] select-none scale-[0.72] sm:scale-[0.85] md:scale-100 origin-center lg:origin-right flex items-center justify-center">
      
      {/* BACKGROUND GRAPHIC INTERACTION GLOW */}
      <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 via-transparent to-transparent pointer-events-none blur-3xl" />

      {/* CARD 1: DYNAMIC JOB MATCH PIPELINE (Find Jobs) - Moved Up and Left */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
        style={{ x: -160, y: -160 }}
        className="absolute z-20 w-[220px] rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-[0_20px_40px_rgba(99,102,241,0.05)] backdrop-blur-md"
      >
        <motion.div animate={floatAnimation(0, 4.5)}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 shadow-sm">
                <Briefcase size={11} />
              </span>
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">AI Matches</h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8.5px] font-bold text-emerald-600">
              <Zap size={8} className="fill-current" /> Live
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5">
            {[
              { role: "Staff Engineer", company: "Stripe", match: "98%", color: "bg-emerald-50 text-emerald-600" },
              { role: "AI Architect", company: "Google", match: "94%", color: "bg-indigo-50 text-indigo-600" },
            ].map((job, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-2">
                <div className="min-w-0 leading-none">
                  <div className="truncate text-[10px] font-bold text-slate-800">{job.role}</div>
                  <div className="text-[8.5px] text-slate-400 mt-0.5 font-medium">{job.company}</div>
                </div>
                <span className={`rounded-lg px-1.5 py-0.5 text-[8.5px] font-bold ${job.color}`}>
                  {job.match}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* CARD 2: REAL-TIME REFERRAL BUS (Referrals) - Moved Up and Right */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
        style={{ x: 160, y: -140 }}
        className="absolute z-10 w-[230px] rounded-2xl border border-purple-100 bg-white/95 p-3.5 shadow-[0_15px_35px_rgba(147,51,234,0.04)] backdrop-blur-md"
      >
        <motion.div animate={floatAnimation(0.5, 5)}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-50 text-purple-600 shadow-sm">
                <Compass size={11} />
              </span>
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">Referrals</h3>
            </div>
            <span className="text-[8.5px] font-bold font-mono text-purple-500">ROUTING</span>
          </div>

          <div className="mt-2.5 space-y-2">
            <div className="rounded-xl bg-slate-950 p-2 text-white">
              <div className="flex items-center justify-between text-[8px] font-semibold opacity-80">
                <span>Stripe Infra Node</span>
                <span className="text-emerald-400">Vouched</span>
              </div>
              <p className="text-[9.5px] text-slate-300 mt-0.5 font-medium leading-tight">
                Connected with Lead Systems Engineer.
              </p>
            </div>
            <button className="w-full flex items-center gap-1 rounded-xl border border-dashed border-purple-200 bg-purple-50/30 p-1.5 text-[9px] text-purple-600 font-bold justify-center">
              <Send size={9} /> Request Figma Drop
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* CARD 3: THE RE-DESIGNED WEB TEMPLATE SHOP (Center-Stage Feature Anchor) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.25, type: "spring" }}
        style={{ x: 0, y: -10 }} // Root center positions the shop cleanly between layers
        className="absolute z-50 w-[270px] rounded-2xl border-2 border-indigo-600 bg-white p-4 shadow-[0_30px_60px_rgba(99,102,241,0.18)]"
      >
        <motion.div animate={floatAnimation(1, 4.2)}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white shadow-sm">
                <ShoppingBag size={11} />
              </span>
              <h3 className="text-xs font-black text-slate-900 tracking-tight">Premium Site Shop</h3>
            </div>
            <span className="inline-flex items-center gap-0.5 text-[8.5px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
              <Flame size={10} className="fill-current" /> Live Marketplace
            </span>
          </div>

          {/* New Clean UI Grid Style instead of cluttered visual screen */}
          <div className="mt-3 space-y-2">
            {[
              { name: "SaaS Matrix Kit", tag: "Startup Production", price: "$49", activeColors: ["bg-indigo-500", "bg-purple-500"] },
              { name: "Minimal Portfolio Pro", tag: "Personal / Creator", price: "$39", activeColors: ["bg-emerald-500", "bg-teal-500"] },
            ].map((item, i) => (
              <div 
                key={i} 
                className="group relative flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 hover:bg-white hover:border-indigo-200 hover:shadow-xs transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Abstract clean presentation dots mimicking code packages */}
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 group-hover:border-indigo-200 shadow-2xs">
                    <Layers size={12} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="min-w-0 leading-none">
                    <div className="text-[11px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">{item.name}</div>
                    <div className="text-[8.5px] text-slate-400 font-semibold mt-0.5">{item.tag}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Miniature Swatch Previews */}
                  <div className="hidden sm:flex gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    {item.activeColors.map((color, cIdx) => (
                      <span key={cIdx} className={`h-1.5 w-1.5 rounded-full ${color}`} />
                    ))}
                  </div>
                  <div className="text-right leading-none">
                    <div className="text-[11px] font-bold text-slate-900 font-mono">{item.price}</div>
                    <div className="text-[7.5px] font-bold text-indigo-600 group-hover:underline mt-0.5 flex items-center gap-0.5 justify-end">
                      Get <ArrowUpRight size={8} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Footer Call-out */}
          <div className="mt-2.5 bg-indigo-50/50 rounded-lg p-1.5 border border-indigo-100/50 text-[9px] font-medium text-indigo-700 text-center">
            Deploy portfolios & business systems in 1-click.
          </div>
        </motion.div>
      </motion.div>

      {/* CARD 4: 1:1 STRATEGY SCHEDULER (Mentorship) - Moved Down and Left */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.35, type: "spring" }}
        style={{ x: -150, y: 140 }}
        className="absolute z-40 w-[210px] rounded-2xl border border-pink-100 bg-white/95 p-3.5 shadow-[0_25px_45_rgba(219,39,119,0.04)] backdrop-blur-md"
      >
        <motion.div animate={floatAnimation(1.2, 4.8)}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-pink-50 text-pink-600 shadow-sm">
                <Calendar size={11} />
              </span>
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">Mock Rounds</h3>
            </div>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="mt-2 flex items-center gap-2 rounded-xl bg-slate-50 p-1.5">
            <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white font-black text-[9px]">
              AM
            </div>
            <div className="min-w-0 leading-none">
              <div className="text-[9.5px] font-bold text-slate-900 truncate">Aris Moore</div>
              <div className="text-[8px] text-slate-400 mt-0.5 font-bold">Recruiter @ Figma</div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-1 text-center text-[8.5px] font-bold">
            <div className="rounded-lg bg-pink-600 text-white py-1">Today 4PM</div>
            <div className="rounded-lg border border-slate-200 bg-white py-1 text-slate-500">More</div>
          </div>
        </motion.div>
      </motion.div>

      {/* CARD 5: ADAPTIVE WORKSPACE STATUS (Tracker/Readiness) - Moved Down and Right */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.4, type: "spring" }}
        style={{ x: 160, y: 120 }}
        className="absolute z-10 w-[220px] rounded-2xl border border-amber-100 bg-white/95 p-3.5 shadow-[0_20px_40px_rgba(245,158,11,0.03)] backdrop-blur-md"
      >
        <motion.div animate={floatAnimation(0.8, 5.2)}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-50 text-amber-600 shadow-sm">
                <GraduationCap size={11} />
              </span>
              <h3 className="text-xs font-bold text-slate-900 tracking-tight">Readiness</h3>
            </div>
            <span className="text-[8px] font-bold text-slate-400 font-mono">KPI</span>
          </div>

          <div className="mt-2.5 space-y-2">
            {[
              { label: "Systems Architecture", val: 80, grad: "from-amber-400 to-orange-500" },
              { label: "Fullstack Execution", val: 95, grad: "from-emerald-400 to-teal-500" },
            ].map((track, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center justify-between text-[8.5px] font-bold text-slate-700">
                  <span className="truncate">{track.label}</span>
                  <span className="font-mono">{track.val}%</span>
                </div>
                <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${track.grad}`} style={{ width: `${track.val}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
}