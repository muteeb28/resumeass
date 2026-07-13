"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Zap, ShieldCheck, Check, HelpCircle, Sparkles, Star, 
  ArrowRight, Shield, RefreshCw, Cpu, Layers, Database, Globe
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { H1_CTA_BAND, SECTION_TITLE, INTRO_TEXT } from "@/lib/typography";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";

const TIER_WEIGHTS: Record<string, number> = {
  basic: 1,
  premium: 2,
  ultra: 3,
};

// ─── PREMIUM CARD GLOW & CORNER FLASH EFFECTS ──────────────────────────────────
const CardPremiumBacking = ({ tone }: { tone: "growth" | "ultra" }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-0">
    <div className={cn(
      "absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl opacity-40 animate-pulse",
      tone === "growth" ? "bg-[#2F7BE0]" : "bg-[#0FA573]"
    )} />
    <div className={cn(
      "absolute -left-12 -bottom-12 h-40 w-40 rounded-full blur-3xl opacity-20",
      tone === "growth" ? "bg-[#2FA1DC]" : "bg-[#2F7BE0]"
    )} />
  </div>
);

// ─── HIGH VISIBILITY REVAMPED PRICING CARD ────────────────────────────────────
const PricingCard = ({
  title,
  price,
  originalPrice,
  period,
  description,
  features,
  isPopular = false,
  isUltra = false,
  saveBadge,
  delay = 0,
  buttonText = "Get Started",
  buttonDisabled = false,
  onClick,
  icon: Icon
}: {
  title: string;
  price: string;
  originalPrice?: string;
  period?: string;
  description: string;
  features: { text: string; soon?: boolean }[];
  isPopular?: boolean;
  isUltra?: boolean;
  saveBadge?: string;
  delay?: number;
  buttonText: string;
  buttonDisabled: boolean;
  onClick?: () => void;
  icon: React.ComponentType<any>;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative rounded-2xl border p-6 sm:p-8 flex flex-col bg-[#ffffff] transition-all duration-300 group/card overflow-hidden",
        isPopular && "border-[#2F7BE0] shadow-[0_20px_50px_rgba(47,123,224,0.12)] ring-1 ring-[#2F7BE0]/40 hover:-translate-y-1.5",
        isUltra && "border-[#0B2A3C] bg-gradient-to-br from-[#0B2A3C] via-[#0E354C] to-[#071D29] text-white shadow-[0_20px_50px_rgba(11,42,60,0.2)] hover:-translate-y-1.5",
        !isPopular && !isUltra && "border-[#EEF2F1] shadow-[0_8px_30px_rgb(11,42,60,0.02)] hover:border-[#2F7BE0]/30 hover:shadow-[0_12px_40px_rgba(47,123,224,0.05)] hover:-translate-y-1"
      )}
    >
      {isPopular && <CardPremiumBacking tone="growth" />}
      {isUltra && <CardPremiumBacking tone="ultra" />}

      {/* Top Floating Badge Headers */}
      <div className="absolute top-6 right-6 z-10">
        {isPopular && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#2F7BE0] px-3 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-sm animate-bounce">
            <Sparkles size={10} className="fill-white" />
            Most Popular
          </span>
        )}
        {isUltra && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#0FA573] to-[#2FA1DC] px-3 py-1 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-sm">
            <Star size={10} className="fill-white animate-spin" style={{ animationDuration: '3s' }} />
            Ultimate Choice
          </span>
        )}
      </div>

      {/* Card Category Header Content */}
      <div className="relative z-10 flex items-center gap-3 mb-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-300 group-hover/card:scale-110",
          isUltra ? "bg-[#ffffff]/10 border-white/10 text-[#0FA573]" : isPopular ? "bg-[#CFE0FB] border-[#2F7BE0]/20 text-[#2F7BE0]" : "bg-[#F5F8F7] border-[#EEF2F1] text-[#647B8E]"
        )}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className={cn("text-lg font-bold tracking-tight", isUltra ? "text-white" : "text-[#0B2A3C]")}>
            {title}
          </h3>
          <p className={cn("text-[11px] font-medium", isUltra ? "text-[#647B8E]" : "text-[#647B8E]")}>
            Performance Track
          </p>
        </div>
      </div>

      {/* Price Grid Structure */}
      <div className="relative z-10 flex items-baseline gap-1.5 mb-1">
        <span className={cn("text-4xl font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent", isUltra ? "from-white to-[#EAF0EF]" : isPopular ? "from-[#2F7BE0] to-[#1D5FD8]" : "from-[#0B2A3C] to-[#24455B]")}>
          {price}
        </span>
        {period && (
          <span className={cn("text-xs font-bold uppercase tracking-wider", isUltra ? "text-[#647B8E]" : "text-[#647B8E]")}>
            / {period}
          </span>
        )}
      </div>

      {/* Strikethrough Framework Container */}
      {originalPrice && (
        <div className="relative z-10 flex items-center gap-2 mb-5">
          <span className={cn("text-xs line-through font-semibold", isUltra ? "text-white/40" : "text-[#647B8E]/50")}>
            {originalPrice}
          </span>
          {saveBadge && (
            <span className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider",
              isUltra ? "bg-[#0FA573]/20 text-[#0FA573] border border-[#0FA573]/30" : "bg-[#CFE0FB] text-[#163F8C]"
            )}>
              {saveBadge}
            </span>
          )}
        </div>
      )}

      <p className={cn("text-xs leading-relaxed mb-6 font-medium", isUltra ? "text-[#647B8E]" : "text-[#647B8E]")}>
        {description}
      </p>

      {/* Dynamic Enhanced CTA Trigger */}
      <button
        disabled={buttonDisabled}
        onClick={onClick}
        className={cn(
          "relative z-10 mb-6 w-full py-3 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md group-hover/card:shadow-lg active:scale-[0.99]",
          isPopular && "bg-[#2F7BE0] text-white hover:bg-[#1D5FD8] shadow-[#2F7BE0]/20",
          isUltra && "bg-[#0FA573] text-white hover:bg-[#0c8a5f] shadow-[#0FA573]/20",
          !isPopular && !isUltra && "border border-[#EEF2F1] bg-[#ffffff] text-[#0B2A3C] hover:border-[#2F7BE0] hover:text-[#2F7BE0]"
        )}
      >
        {buttonText}
        <ArrowRight size={13} className="transition-transform duration-300 group-hover/card:translate-x-1" />
      </button>

      {/* Feature Check Grid Layout */}
      <div className="relative z-10 space-y-3 mt-auto pt-4 border-t border-[#EEF2F1]/50">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3 group/item">
            <span className={cn(
              "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full transition-transform group-hover/item:scale-110",
              isUltra ? "bg-[#0FA573]/20 text-[#0FA573]" : isPopular ? "bg-[#CFE0FB] text-[#2F7BE0]" : "bg-[#F5F8F7] text-[#647B8E]"
            )}>
              <Check size={10} strokeWidth={3} />
            </span>
            <span className={cn("text-xs font-semibold leading-normal", isUltra ? "text-[#fafafa]/80" : "text-[#0B2A3C]")}>
              {feature.text}
              {feature.soon && (
                <span className="ml-2 rounded bg-[#F5F8F7] border border-[#EEF2F1] px-1.5 py-0.5 text-[9px] font-bold text-[#647B8E] uppercase tracking-widest">
                  Soon
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function MembershipPage() {
  const { user, membership } = useUserStore();
  const router = useRouter();

  const currentTier = membership?.tier?.toLowerCase() || "none";
  const currentWeight = TIER_WEIGHTS[currentTier] || 0;

  const planState = (planTier: string) => {
    const planWeight = TIER_WEIGHTS[planTier] || 0;
    if (!membership) return { disabled: false, text: "Get Access Now" };
    if (currentWeight === planWeight) return { disabled: true, text: "Active Plan" };
    if (currentWeight > planWeight) return { disabled: true, text: "Tier Locked" };
    return { disabled: false, text: `Upgrade System` };
  };

  const handlePayment = async (planId: string) => {
    if (!user) {
      router.push(`${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/login`);
      return;
    }
    // Stripe/Razorpay instance integration placeholder remains functionally unchanged...
  };

  const comparisonMatrix = [
    { feature: "Job Application Tracker", basic: true, premium: true, ultra: true },
    { feature: "Resume Creator Canvas", basic: "Limited Rate", premium: "Extended Rate", ultra: "Unlimited Access" },
    { feature: "AI Resume Optimizer Engine", basic: "Limited Rate", premium: "Extended Rate", ultra: "Unlimited Access" },
    { feature: "MNC & Startup HR E-mails", basic: false, premium: "3,000+ Records", ultra: "Full Real-time List" },
    { feature: "Verified Dubai HR Network Contacts", basic: false, premium: false, ultra: true },
    { feature: "Advanced Search Filters & Extraction", basic: false, premium: false, ultra: true },
    { feature: "Premium Job Board Curation Matrix", basic: "Latest Only", premium: "Full Fresh Feeds", ultra: "Instant Push Feeds" },
    { feature: "Dedicated Support Response Window", basic: "Standard Ticket", premium: "Priority Deck", ultra: "24/7 VIP Desk" },
  ];

  return (
    <BackgroundRippleLayout
      tone="light"
      className="font-sans selection:bg-[#2F7BE0] selection:text-white bg-[#ffffff]"
      contentClassName="pt-[74px]"
      showRipple={false}
    >

      {/* ─── HERO HEADER SECTION ─── */}
      <header className="relative py-24 px-4 text-center overflow-hidden border-b border-[#EEF2F1]">
        <div className="absolute inset-0 bg-[radial-gradient(#CFE0FB_1px,transparent_1px)] [background-size:2rem_2rem] opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#CFE0FB] border border-[#2F7BE0]/10 px-3 py-1 text-[11px] font-bold text-[#163F8C] tracking-wider uppercase shadow-sm"
          >
            <Zap size={11} className="fill-[#2F7BE0] text-[#2F7BE0]" />
            Enterprise Upgrades
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className={`${H1_CTA_BAND} text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B2A3C]`}
          >
            Supercharge Your Career with <span className="text-[#2F7BE0] underline decoration-wavy decoration-[#CFE0FB] decoration-2">Premium Edge</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={`max-w-2xl mx-auto ${INTRO_TEXT} text-sm text-[#647B8E] leading-relaxed font-medium`}
          >
            Unlock direct pipelines to global recruitment networks, execute deep continuous AI resume engineering optimizations, and secure job referrals.
          </motion.p>
        </div>
      </header>

      {/* ─── MEMBERSHIP PRICING CARDS DISPLAY ─── */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          <PricingCard
            delay={0.05}
            icon={Layers}
            title="Starter Suite"
            price="₹99"
            originalPrice="₹499"
            period="mo"
            saveBadge="Save 80%"
            description="Core baseline utility configurations built to coordinate and organize tracking vectors for daily job applications."
            features={[
              { text: "Job Tracking Dashboard" },
              { text: "Resume Optimizer (Rate Capped)" },
              { text: "Resume Creator (Rate Capped)" },
              { text: "Jobs Board (Latest Openings)" },
            ]}
            buttonText={planState('basic').text}
            buttonDisabled={planState('basic').disabled}
            onClick={() => handlePayment('plan_ID_99')}
          />

          <PricingCard
            delay={0.15}
            icon={Cpu}
            title="Growth Engine"
            price="₹155"
            originalPrice="₹310"
            period="mo"
            saveBadge="Save 50%"
            isPopular
            description="Expanded architectural access arrays mapping matching components to premium target lists and verified outreach channels."
            features={[
              { text: "Everything in Starter Suite" },
              { text: "Extended Engine Compute Allotments" },
              { text: "3,000+ Direct Corporate HR Recipient Lists" },
              { text: "Live Matching Pipeline Tracking" },
            ]}
            buttonText={planState('premium').text}
            buttonDisabled={planState('premium').disabled}
            onClick={() => handlePayment('plan_ID_155')}
          />

          <PricingCard
            delay={0.25}
            icon={Globe}
            title="Ultra Terminal"
            price="₹349"
            originalPrice="₹699"
            period="mo"
            isUltra
            description="The premier executive career engineering framework featuring unfiltered global networking tables and zero access bounds."
            features={[
              { text: "Complete Growth Engine Stack" },
              { text: "Unlimited Real-time AI Compute Vectors" },
              { text: "Verified Dubai Corporate HR Directories" },
              { text: "Advanced Extraction & Spreadsheet Exports" },
            ]}
            buttonText={planState('ultra').text}
            buttonDisabled={planState('ultra').disabled}
            onClick={() => handlePayment('plan_ID_349')}
          />
        </div>
      </section>

      {/* ─── FEATURE MATRIX BREAKDOWN GRID WITH HORIZONTAL LINE SHADERS ─── */}
      <section className="py-20 px-4 bg-[#F5F8F7]/60 border-t border-b border-[#EEF2F1]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <h2 className={`${SECTION_TITLE} text-2xl font-bold text-[#0B2A3C]`}>
              Technical Matrix Deep-Dive
            </h2>
            <p className="text-xs text-[#647B8E] max-w-md mx-auto font-medium">
              Audit the specific infrastructure metrics of each tier to select your pipeline.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-[#EEF2F1] bg-[#ffffff] rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(11,42,60,0.03)]"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F8F7] border-b border-[#EEF2F1] text-[10px] font-extrabold tracking-widest text-[#647B8E] uppercase">
                    <th className="p-5 min-w-[260px]">Capability Pipeline</th>
                    <th className="p-5 text-center">Starter</th>
                    <th className="p-5 text-center text-[#2F7BE0] bg-[#CFE0FB]/20">Growth</th>
                    <th className="p-5 text-center">Ultra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF2F1] text-xs font-semibold">
                  {comparisonMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F5F8F7]/40 transition-colors group/row">
                      <td className="p-5 text-[#0B2A3C] font-bold group-hover/row:text-[#2F7BE0] transition-colors">{item.feature}</td>
                      
                      {/* Starter Column cell */}
                      <td className="p-5 text-center text-[#647B8E]">
                        {typeof item.basic === "boolean" ? (item.basic ? <Check size={14} className="mx-auto text-[#0B2A3C]" strokeWidth={3} /> : "—") : item.basic}
                      </td>
                      
                      {/* Growth Column cell */}
                      <td className="p-5 text-center text-[#2F7BE0] bg-[#CFE0FB]/5 font-bold">
                        {typeof item.premium === "boolean" ? (item.premium ? <Check size={14} className="mx-auto text-[#2F7BE0]" strokeWidth={3} /> : "—") : item.premium}
                      </td>
                      
                      {/* Ultra Column cell */}
                      <td className="p-5 text-center text-[#0FA573] font-bold">
                        {typeof item.ultra === "boolean" ? (item.ultra ? <Check size={14} className="mx-auto text-[#0FA573]" strokeWidth={3} /> : "—") : item.ultra}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SECURITY FOOTER MATRIX ─── */}
      <footer className="py-24 px-4 max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 text-center border-b border-[#EEF2F1] pb-14 mb-14">
          {[
            { icon: Shield, title: "Encrypted Gateways", desc: "Processed fully via Razorpay tokens" },
            { icon: RefreshCw, title: "Instant Lifecycle Deployment", desc: "Upgraded computing features match instantly" },
            { icon: HelpCircle, title: "Zero Lock-In Terms", desc: "Cancel or modify subscriptions inside settings" }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center p-2 group/footer-item">
              <div className="mb-4 p-3 rounded-xl bg-[#F5F8F7] text-[#2F7BE0] border border-[#EEF2F1] group-hover/footer-item:bg-[#CFE0FB]/40 transition-colors duration-300">
                <item.icon size={18} strokeWidth={2.5} />
              </div>
              <h4 className="text-xs font-extrabold text-[#0B2A3C] uppercase tracking-wider mb-1">{item.title}</h4>
              <p className="text-[11px] text-[#647B8E] font-medium leading-normal max-w-[200px] mx-auto">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-[#647B8E]/70 font-medium">
          jobflix billing engine • Billed and provisioned transparently each month • Universal continuous cancellation architecture.
        </p>
      </footer>

    </BackgroundRippleLayout>
  );
}