"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, ShieldCheck, Check, HelpCircle, Sparkles, Star, ChevronDown, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TIER_WEIGHTS: Record<string, number> = {
  basic: 1,
  premium: 2,
  ultra: 3,
};

// ─── Sparkling Background FX (For Premium/Ultra Cards) ────────────────────────
const SparkleEffect = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
    <motion.div 
      animate={{ 
        opacity: [0.1, 0.3, 0.1],
        scale: [1, 1.05, 1],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-amber-400/20 blur-2xl"
    />
    <motion.div 
      animate={{ 
        opacity: [0.1, 0.2, 0.1],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-amber-500/10 blur-2xl"
    />
  </div>
);

// ─── Pricing Card Sub-component ──────────────────────────────────────────────
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
  onClick
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
}) => {
  const isPremiumTheme = isPopular || isUltra;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={cn(
        "relative rounded-2xl border p-7 flex flex-col bg-white transition-all",
        isPopular && "border-amber-400 shadow-xl shadow-amber-500/5 ring-1 ring-amber-400/30",
        isUltra && "border-slate-900 shadow-xl bg-slate-950 text-white",
        !isPremiumTheme && "border-slate-200 shadow-md"
      )}
    >
      {isPremiumTheme && <SparkleEffect />}

      {/* Top badges */}
      <div className="absolute top-5 right-5 flex flex-col items-end gap-1.5 z-10">
        {isPopular && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-slate-950 uppercase tracking-wider shadow-sm">
            <Sparkles size={11} className="fill-slate-950 animate-pulse" />
            Most Popular
          </span>
        )}
        {isUltra && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-[11px] font-bold text-slate-950 uppercase tracking-wider">
            <Star size={11} className="fill-slate-950" />
            Ultimate
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className={cn(
        "mb-3 text-xl font-bold tracking-tight",
        isUltra ? "text-white" : "text-slate-900"
      )}>
        {title}
      </h3>

      {/* Price */}
      <div className="flex items-end gap-1.5 mb-1 z-10">
        <span className={cn("text-4xl font-extrabold tracking-tight", isUltra ? "text-white" : "text-slate-900")}>
          {price}
        </span>
        {period && (
          <span className={cn("text-sm mb-1 font-medium", isUltra ? "text-slate-400" : "text-slate-500")}>
            /{period}
          </span>
        )}
      </div>

      {/* Strikethrough + Save badge */}
      {originalPrice && (
        <div className="flex items-center gap-2 mb-4 z-10">
          <span className={cn("text-sm line-through font-medium", isUltra ? "text-slate-500" : "text-slate-400")}>
            {originalPrice}
          </span>
          {saveBadge && (
            <span className={cn(
              "rounded-full px-2 py-0.5 text-xs font-bold shadow-sm",
              isUltra ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" : "bg-amber-50 border border-amber-200 text-amber-700"
            )}>
              {saveBadge}
            </span>
          )}
        </div>
      )}

      {/* Description */}
      <p className={cn("text-sm mb-6 leading-relaxed", isUltra ? "text-slate-400" : "text-slate-500")}>
        {description}
      </p>

      {/* CTA Button */}
      <button
        disabled={buttonDisabled}
        onClick={onClick}
        className={cn(
          "mb-6 w-full py-2.5 rounded-xl text-sm font-bold transition-all transform active:scale-[0.98] z-10 shadow-sm",
          isPopular && "bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold",
          isUltra && "bg-white text-slate-950 hover:bg-amber-400 font-extrabold",
          !isPremiumTheme && "border border-slate-300 bg-white text-slate-900 hover:bg-slate-900 hover:text-white"
        )}
      >
        {buttonText}
      </button>

      {/* Features list */}
      <div className="space-y-3.5 mt-auto z-10">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className={cn(
              "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full",
              isPremiumTheme ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-white"
            )}>
              <Check size={10} strokeWidth={3} className={isPremiumTheme ? "text-slate-950" : "text-white"} />
            </span>
            <span className={cn("text-sm font-medium leading-normal", isUltra ? "text-slate-300" : "text-slate-600")}>
              {feature.text}
              {feature.soon && (
                <span className="ml-1.5 rounded-full bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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

// ─── Main Page Export ────────────────────────────────────────────────────────
export default function MembershipPage() {
  const { user, membership } = useUserStore();
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const currentTier = membership?.tier?.toLowerCase() || "none";
  const currentWeight = TIER_WEIGHTS[currentTier] || 0;

  const planState = (planTier: string) => {
    const planWeight = TIER_WEIGHTS[planTier] || 0;
    if (!membership) return { disabled: false, text: "Get Started" };
    if (currentWeight === planWeight) return { disabled: true, text: "Current Plan" };
    if (currentWeight > planWeight) return { disabled: true, text: "Downgrade Unavailable" };
    return { disabled: false, text: `Upgrade to ${planTier.charAt(0).toUpperCase() + planTier.slice(1)}` };
  };

  const handlePayment = async (planId: string) => {
    if (!user) {
      router.push(`${process.env.NEXT_PUBLIC_AUTH_CLIENT_URL}/login`);
      return;
    }

    try {
      const response = await axiosInstance.post('/payment/resumeassist/subscription/create', {
        planId: planId,
        customerEmail: user.email,
      });

      const data = response.data;
      if (!data.success) {
        toast.error(data.message || 'Could not initialize membership.');
        return;
      }

      const options = {
        key: data.razorpayKeyId,
        subscription_id: data.subscriptionId,
        name: 'Jobflix Perks',
        description: `${planId} Membership`,
        image: '/logo.png',
        handler: async function (authResponse: any) {
          const toastId = 'verify-sub';
          toast.loading('Verifying your subscription activation...', { id: toastId });

          try {
            const verificationPayload = {
              razorpay_payment_id: authResponse.razorpay_payment_id,
              razorpay_subscription_id: authResponse.razorpay_subscription_id,
              razorpay_signature: authResponse.razorpay_signature,
              planId: planId
            };

            const verifyRes = await axiosInstance.post('/payment/subscription/verify', verificationPayload);

            if (verifyRes.data.success) {
              toast.success('Welcome to Jobflix Premium!', { id: toastId });
              router.refresh();
            }
          } catch (err: any) {
            console.error("Verification failed:", err);
            toast.error(err.response?.data?.message || 'Verification failed. Contact support.', { id: toastId });
          }
        },
        prefill: {
          email: user.email,
          contact: user.phone || '',
        },
        theme: {
          color: '#F59E0B',
        },
        modal: {
          ondismiss: function () {
            toast.info('Payment cancelled.');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Could not launch the checkout gateway.');
    }
  };

  // Matrix configurations for Deep Comparison Grid
  const comparisonMatrix = [
    { feature: "Job Application Tracker", basic: true, premium: true, ultra: true },
    { feature: "Resume Creator Canvas", basic: "Limited Rate", premium: "Extended Rate", ultra: "Unlimited Access" },
    { feature: "AI Resume Optimizer Engine", basic: "Limited Rate", premium: "Extended Rate", ultra: "Unlimited Access" },
    { feature: "MNC & Startup HR E-mails", basic: false, premium: "3,000+ Records", ultra: "Full Real-time List" },
    { feature: "Verified Dubai HR Network Contacts", basic: false, premium: false, ultra: true },
    { feature: "Advanced Search Filters & Extraction", basic: false, premium: false, ultra: true },
    { feature: "Premium Job Board Curation Matrix", basic: "Latest Only", premium: "Full Fresh Feeds", ultra: "Instant Push Feeds" },
    { feature: "Dedicated Support Response Window", basic: "Standard Ticket", premium: "Priority Deck", ultra: "24/7 VIP Dedicated Desk" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* ─── SECTION 1: HERO HEADER ─── */}
      <header className="relative py-20 px-4 text-center overflow-hidden bg-white border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.25]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-700 tracking-wide mb-4"
          >
            <Zap size={12} className="fill-amber-500 text-amber-600" />
            JOBFLIX PRO UPGRADES
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6"
          >
            Supercharge Your Career with <span className="relative inline-block text-amber-500">Premium Edge</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-base sm:text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Unlock direct channels to key executive decision-makers, execute advanced AI resume tailoring metrics, and master your career pathway.
          </motion.p>
        </div>
      </header>

      {/* ─── SECTION 2: MEMBERSHIP BOARDS ─── */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Starter Tier */}
          <PricingCard
            delay={0.05}
            title="Starter"
            price="₹99"
            originalPrice="₹499"
            period="month"
            saveBadge="Save 80%"
            description="Core baseline utility suites built to successfully pilot and monitor standard job applications."
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

          {/* Growth Tier */}
          <PricingCard
            delay={0.15}
            title="Growth"
            price="₹155"
            originalPrice="₹310"
            period="month"
            saveBadge="Save 50%"
            isPopular
            description="Expanded dynamic suite featuring premium target list access arrays and accelerated fresh job leads."
            features={[
              { text: "Everything in Starter" },
              { text: "Extended Resume Optimizations" },
              { text: "Extended Resume Layout Creator" },
              { text: "3000+ MNC & Startup HR Emails" },
              { text: "Fresh Job Pipeline Openings" },
            ]}
            buttonText={planState('premium').text}
            buttonDisabled={planState('premium').disabled}
            onClick={() => handlePayment('plan_ID_155')}
          />

          {/* Ultra Tier */}
          <PricingCard
            delay={0.25}
            title="Ultra"
            price="₹349"
            originalPrice="₹699"
            period="month"
            isUltra
            description="The premier career engineering stack offering unlimited compute configurations and global outreach channels."
            features={[
              { text: "Everything in Growth Core" },
              { text: "Unlimited AI Resume Optimizations" },
              { text: "Verified Dubai HR Network Database" },
              { text: "Advanced Filtering, Search, & Export" },
              { text: "Priority Support Response Desk" },
            ]}
            buttonText={planState('ultra').text}
            buttonDisabled={planState('ultra').disabled}
            onClick={() => handlePayment('plan_ID_349')}
          />
        </div>
      </section>

      {/* ─── SECTION 3: DEEP COMPARISON MATRIX ─── */}
      <section className="py-16 px-4 bg-white border-t border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
              Feature Matrix Deep-Dive
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Compare architectural metrics side by side to choose the optimal setup for your search.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-slate-200 rounded-xl overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[12px] font-bold tracking-wider text-slate-400 uppercase">
                    <th className="p-4 min-w-[240px]">Capability Pipeline</th>
                    <th className="p-4 text-center">Starter</th>
                    <th className="p-4 text-center text-amber-600 bg-amber-500/5">Growth</th>
                    <th className="p-4 text-center">Ultra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-[13.5px]">
                  {comparisonMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">{item.feature}</td>
                      
                      {/* Starter Value */}
                      <td className="p-4 text-center font-medium text-slate-500">
                        {typeof item.basic === "boolean" ? (item.basic ? <Check size={16} className="mx-auto text-slate-700" strokeWidth={3} /> : "—") : item.basic}
                      </td>
                      
                      {/* Growth Value */}
                      <td className="p-4 text-center font-bold text-amber-700 bg-amber-500/[0.02]">
                        {typeof item.premium === "boolean" ? (item.premium ? <Check size={16} className="mx-auto text-amber-500" strokeWidth={3} /> : "—") : item.premium}
                      </td>
                      
                      {/* Ultra Value */}
                      <td className="p-4 text-center font-semibold text-slate-900">
                        {typeof item.ultra === "boolean" ? (item.ultra ? <Check size={16} className="mx-auto text-slate-900" strokeWidth={3} /> : "—") : item.ultra}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── ADDITIONAL UTILITY: SECURITY & FAQ ─── */}
      <footer className="py-20 px-4 max-w-4xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-6 text-center border-b border-slate-200 pb-12 mb-12">
          {[
            { icon: ShieldCheck, title: "Secure Checkout", desc: "Encoded via Razorpay systems" },
            { icon: Zap, title: "Instant Provisioning", desc: "Upgraded tokens active immediately" },
            { icon: HelpCircle, title: "Flexible Terms", desc: "One-click anytime subscription cancel" }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center p-4">
              <div className="mb-3 p-2.5 rounded-full bg-amber-500/10 text-amber-600">
                <item.icon size={20} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400">
          Secure execution ecosystem · Billed and provisioned monthly · Cancel cleanly at any lifecycle point.
        </p>
      </footer>

    </div>
  );
}