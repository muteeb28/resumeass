"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, ShieldCheck, Check, HelpCircle, Sparkles, Star, ChevronDown, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/useUserStore";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { H1_CTA_BAND, SECTION_TITLE, INTRO_TEXT } from "@/lib/typography";
import { Navbar } from "@/components/navbar";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";

const TIER_WEIGHTS: Record<string, number> = {
  basic: 1,
  premium: 2,
  ultra: 3,
};

// ─── Glow wash (For Premium/Ultra Cards) ───────────────────────────────────────
// ADL v1.0 motion rule: never animate glow washes/scale/transform — static now.
const SparkleEffect = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-(--jf-radius-frame)">
    <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-sapphire-bright/15 blur-2xl" />
    <div className="absolute -left-20 -bottom-20 h-44 w-44 rounded-full bg-sapphire-bright/10 blur-2xl" />
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
      className={cn(
        "relative rounded-(--jf-radius-frame) border p-7 flex flex-col bg-page transition-all",
        isPopular && "border-sapphire-bright shadow-xl shadow-sapphire-bright/5 ring-1 ring-sapphire-bright/30",
        isUltra && "border-navy-900 shadow-xl bg-navy-900 text-white",
        !isPremiumTheme && "border-border-frame shadow-[var(--jf-shadow-frame)]"
      )}
    >
      {isPremiumTheme && <SparkleEffect />}

      {/* Top badges */}
      <div className="absolute top-5 right-5 flex flex-col items-end gap-1.5 z-10">
        {isPopular && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sapphire-bright px-3 py-1 text-[11px] font-medium text-white uppercase tracking-wider shadow-sm">
            <Sparkles size={11} className="fill-white animate-pulse" />
            Most Popular
          </span>
        )}
        {isUltra && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-sapphire-mid to-sapphire-bright px-3 py-1 text-[11px] font-medium text-white uppercase tracking-wider">
            <Star size={11} className="fill-white" />
            Ultimate
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className={cn(
        "mb-3 text-xl font-medium tracking-tight",
        isUltra ? "text-white" : "text-ink-900"
      )}>
        {title}
      </h3>

      {/* Price */}
      <div className="flex items-end gap-1.5 mb-1 z-10">
        <span className={cn("text-4xl font-medium tracking-tight", isUltra ? "text-white" : "text-ink-900")}>
          {price}
        </span>
        {period && (
          <span className={cn("text-sm mb-1 font-medium", isUltra ? "text-ink-400" : "text-ink-500")}>
            /{period}
          </span>
        )}
      </div>

      {/* Strikethrough + Save badge */}
      {originalPrice && (
        <div className="flex items-center gap-2 mb-4 z-10">
          <span className={cn("text-sm line-through font-medium", isUltra ? "text-ink-500" : "text-ink-400")}>
            {originalPrice}
          </span>
          {saveBadge && (
            <span className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium shadow-sm",
              isUltra ? "bg-sapphire-bright/10 border border-sapphire-bright/30 text-sapphire-sky" : "bg-sapphire-50 border border-sapphire-100 text-sapphire-brand"
            )}>
              {saveBadge}
            </span>
          )}
        </div>
      )}

      {/* Description */}
      <p className={cn("text-sm mb-6 leading-relaxed", isUltra ? "text-ink-400" : "text-ink-500")}>
        {description}
      </p>

      {/* CTA Button */}
      <button
        disabled={buttonDisabled}
        onClick={onClick}
        className={cn(
          "mb-6 w-full py-2.5 rounded-(--jf-radius-pill) text-sm font-medium transition-colors z-10 shadow-sm",
          isPopular && "bg-sapphire-bright text-white hover:bg-sapphire-brand",
          isUltra && "bg-white text-ink-900 hover:bg-sapphire-50",
          !isPremiumTheme && "border border-border-frame bg-page text-ink-900 hover:bg-sapphire-brand hover:text-white"
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
              isPremiumTheme ? "bg-sapphire-bright" : "bg-ink-900"
            )}>
              <Check size={10} strokeWidth={3} className="text-white" />
            </span>
            <span className={cn("text-sm font-medium leading-normal", isUltra ? "text-ink-400" : "text-ink-600")}>
              {feature.text}
              {feature.soon && (
                <span className="ml-1.5 rounded-full bg-surface-alt border border-border-soft px-1.5 py-0.5 text-[10px] font-medium text-ink-400 uppercase tracking-wider">
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
          color: '#2F7BE0',
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
    <BackgroundRippleLayout
      tone="light"
      className="font-sans selection:bg-sapphire-bright selection:text-white"
      contentClassName="pt-[74px]"
      showRipple={false}
    >
      <Navbar tone="light" />

      {/* ─── SECTION 1: HERO HEADER ─── */}
      <header className="relative py-20 px-4 text-center overflow-hidden border-b border-border-soft">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-sapphire-bright/10 border border-sapphire-bright/20 px-3 py-1 text-xs font-medium text-sapphire-brand tracking-wide mb-4"
          >
            <Zap size={12} className="fill-sapphire-bright text-sapphire-brand" />
            JOBFLIX PRO UPGRADES
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className={`${H1_CTA_BAND} mb-6`}
          >
            Supercharge Your Career with <span className="relative inline-block text-sapphire-brand">Premium Edge</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`max-w-2xl mx-auto ${INTRO_TEXT}`}
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
      <section className="py-16 px-4 bg-page border-t border-b border-border-soft">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`${SECTION_TITLE} mb-3`}>
              Feature Matrix Deep-Dive
            </h2>
            <p className="text-sm text-ink-500 max-w-md mx-auto">
              Compare architectural metrics side by side to choose the optimal setup for your search.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-border-soft rounded-(--jf-radius-frame) overflow-hidden shadow-[var(--jf-shadow-frame)]"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-alt border-b border-border-soft text-[12px] font-medium tracking-wider text-ink-400 uppercase">
                    <th className="p-4 min-w-[240px]">Capability Pipeline</th>
                    <th className="p-4 text-center">Starter</th>
                    <th className="p-4 text-center text-sapphire-brand bg-sapphire-500/5">Growth</th>
                    <th className="p-4 text-center">Ultra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft text-[13.5px]">
                  {comparisonMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-alt/50 transition-colors">
                      <td className="p-4 font-semibold text-ink-700">{item.feature}</td>
                      
                      {/* Starter Value */}
                      <td className="p-4 text-center font-medium text-ink-500">
                        {typeof item.basic === "boolean" ? (item.basic ? <Check size={16} className="mx-auto text-ink-700" strokeWidth={3} /> : "—") : item.basic}
                      </td>
                      
                      {/* Growth Value */}
                      <td className="p-4 text-center font-medium text-sapphire-brand bg-sapphire-bright/[0.02]">
                        {typeof item.premium === "boolean" ? (item.premium ? <Check size={16} className="mx-auto text-sapphire-brand" strokeWidth={3} /> : "—") : item.premium}
                      </td>
                      
                      {/* Ultra Value */}
                      <td className="p-4 text-center font-semibold text-ink-900">
                        {typeof item.ultra === "boolean" ? (item.ultra ? <Check size={16} className="mx-auto text-ink-900" strokeWidth={3} /> : "—") : item.ultra}
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
        <div className="grid sm:grid-cols-3 gap-6 text-center border-b border-border-soft pb-12 mb-12">
          {[
            { icon: ShieldCheck, title: "Secure Checkout", desc: "Encoded via Razorpay systems" },
            { icon: Zap, title: "Instant Provisioning", desc: "Upgraded tokens active immediately" },
            { icon: HelpCircle, title: "Flexible Terms", desc: "One-click anytime subscription cancel" }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center p-4">
              <div className="mb-3 p-2.5 rounded-full bg-sapphire-bright/10 text-sapphire-brand">
                <item.icon size={20} />
              </div>
              <h4 className="text-sm font-medium text-ink-900 mb-1">{item.title}</h4>
              <p className="text-xs text-ink-400">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-ink-400">
          Secure execution ecosystem · Billed and provisioned monthly · Cancel cleanly at any lifecycle point.
        </p>
      </footer>

    </BackgroundRippleLayout>
  );
}