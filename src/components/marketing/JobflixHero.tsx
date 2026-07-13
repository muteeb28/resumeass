// src/components/marketing/JobflixHero.tsx
"use client";

import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Container, MonoLabel, Button, LogoStrip } from "./primitives";
import { HeroCardCluster } from "./hero/HeroCardCluster";
import { motion } from "framer-motion";

const hiredAt = ["Google", "Stripe", "Airbnb", "Figma", "Notion", "Spotify"];

export function JobflixHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 pt-24 pb-16 lg:pt-32">
      {/* Ambient background glow flares */}
      <div className="absolute top-0 left-1/4 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-200/20 blur-[120px]" />
      <div className="absolute top-20 right-10 -z-10 h-[350px] w-[500px] rounded-full bg-emerald-200/10 blur-[100px]" />

      <Container width="wide">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          
          {/* Left Column — Content and Call to Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-xl space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/60 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles size={12} className="animate-pulse text-indigo-500" />
              <span>The Autonomous Career Operating System</span>
            </div>

            <h1 className="text-[2.85rem] font-bold leading-[1.02] tracking-[-0.03em] text-slate-900 sm:text-[4rem] lg:text-[4.85rem]">
              Where recruiters <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                start replying.
              </span>
            </h1>

            <p className="max-w-[500px] text-base leading-[1.6] text-slate-600 sm:text-lg">
              Stop chasing applications down black holes. Track active pipelines, source verified employee referrals, access elite 1:1 mentorship, and stream algorithmic matches inside a single high-octane workspace.
            </p>

            <div className="flex flex-col gap-3.5 pt-2 sm:flex-row sm:items-center">
              <Button href="/find-jobs" size="lg" className="group shadow-lg shadow-indigo-600/10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                Explore Job Matching
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Button>
              <Button href="/optimize" variant="ghost" size="lg" className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl shadow-xs">
                Book 1:1 Strategy Call
              </Button>
            </div>

            {/* Social Proof Badges Row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5 border-t border-slate-100 pt-6 text-[13px] font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-500 text-base leading-none">★★★★★</span>
                <span className="font-bold text-slate-900">4.9 System Rating</span>
              </div>
              <span className="text-slate-300 select-none">|</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-indigo-500" />
                <span>4k+ Landed Offers</span>
              </div>
              <span className="text-slate-300 select-none">|</span>
              <span>100+ Network Partners</span>
            </div>
          </motion.div>

          {/* Right Column — Animated Core Canvas Cluster */}
          <div className="relative w-full flex items-center justify-center lg:justify-end">
            <HeroCardCluster />
          </div>
        </div>

        {/* Global Trust Logo Strip Section */}
        <div className="mt-16 border-t border-slate-200/60 pt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
            Our members secure infrastructure nodes at ↗
          </p>
          <LogoStrip names={hiredAt} tone="light" spread className="mt-5 filter grayscale opacity-70 contrast-125" />
        </div>
      </Container>
    </section>
  );
}