"use client";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { Zap } from "lucide-react";
import { useNavigation } from "./hooks/useNavigation";
import { useUserStore } from "@/stores/useUserStore";

const PricingCard = ({
  title,
  price,
  originalPrice,
  period,
  description,
  features,
  isPopular = false,
  comingSoon = false,
  buttonText = "Get Started",
  delay = 0,
  className,
  onClick
}: {
  title: string;
  price: string;
  originalPrice?: string;
  period?: string;
  description: string;
  features: { text: string; soon?: boolean }[];
  isPopular?: boolean;
  comingSoon?: boolean;
  buttonText?: string;
  delay?: number;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className={cn(
        "relative rounded-2xl border bg-white p-7 flex flex-col",
        isPopular
          ? "border-teal-300 shadow-xl shadow-teal-500/10"
          : comingSoon
          ? "border-neutral-200 shadow-md opacity-80"
          : "border-neutral-200 shadow-md"
      )}
    >
      {/* Top badges */}
      <div className="absolute top-5 right-5 flex flex-col items-end gap-1.5">
        {isPopular && (
          <span className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white tracking-wide">
            Most Popular
          </span>
        )}
        {comingSoon && (
          <span className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500 flex items-center gap-1">
            <Zap size={10} />
            Coming Soon
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mb-3 text-lg font-semibold text-neutral-900">
        {title}
      </h3>

      {/* Price */}
      <div className="flex items-end gap-1.5 mb-1">
        <span className="text-4xl font-bold text-neutral-900">{price}</span>
        {period && (
          <span className="text-sm text-neutral-500 mb-1">/{period}</span>
        )}
      </div>

      {/* Strikethrough + Save badge */}
      {originalPrice && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-neutral-400 line-through">{originalPrice}</span>
          <span className="rounded-full bg-teal-50 border border-teal-200 px-2 py-0.5 text-xs font-semibold text-teal-700">
            Save 50%
          </span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
        {description}
      </p>

      {/* CTA Button */}
      <button
        disabled={comingSoon}
        onClick={onClick}
        className={cn(
          "mb-6 w-full py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200",
          isPopular
            ? "bg-neutral-900 text-white hover:bg-teal-600"
            : comingSoon
            ? "border border-neutral-200 bg-neutral-50 text-neutral-400 cursor-not-allowed"
            : "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white"
        )}
      >
        {buttonText}
      </button>

      {/* Features list */}
      <div className="space-y-3 mt-auto">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className={cn(
              "mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full",
              isPopular
                ? "bg-teal-600"
                : comingSoon
                ? "bg-neutral-300"
                : "bg-neutral-900"
            )}>
              <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white">
                <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="text-sm text-neutral-600 flex items-center gap-2 flex-wrap">
              {feature.text}
              {feature.soon && (
                <span className="rounded-full bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400">
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

export const PaymentSection = () => {

  const { navigate } = useNavigation();
  const { user } = useUserStore();

  const onClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      alert('user found');
    }
  }

  return (
    <section className="relative bg-neutral-50 py-24 px-4 text-neutral-900">
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2 text-center"
        >
          Pricing
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
          className="mb-4 text-center text-3xl font-bold text-neutral-900 md:text-5xl"
        >
          Choose Your Plan
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
          className="mx-auto mb-12 max-w-2xl text-center text-base text-neutral-500"
        >
          Simple pricing for resume optimization and job tracking. Pay once for a resume or go monthly for tracking and outreach.
        </motion.p>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <PricingCard
            delay={0.1}
            title="Resume Optimization"
            price="₹50"
            originalPrice="₹100"
            description="One-time payment per resume optimization."
            features={[
              { text: "ATS-ready resume (2 professional templates)" },
              { text: "Job description matching" },
              { text: "Built-in job tracker" },
              { text: "ATS-friendly formatting" },
              { text: "PDF + DOCX downloads" },
              { text: "One-time payment" },
            ]}
            buttonText="Pay ₹50"
            onClick={onClick}
          />

          <PricingCard
            delay={0.2}
            title="Resume + HR Outreach"
            price="₹199"
            originalPrice="₹399"
            description="Full access with a one-time payment per resume optimization."
            features={[
              { text: "Resume optimization (ATS-ready)" },
              { text: "Job tracker dashboard" },
              { text: "50 Dubai HR email contacts" },
              { text: "1800+ India HR email contacts" },
              { text: "LinkedIn profiles of HRs" },
              { text: "Cold email templates (ready to send)" },
              { text: "Application tracking & follow-ups" },
            ]}
            isPopular
            buttonText="Unlock Full Access"
            onClick={onClick}
          />

          <PricingCard
            delay={0.3}
            title="Pro Weekly"
            price="₹999"
            originalPrice="₹1,999"
            period="week"
            description="Best for short-term job search sprints."
            features={[
              { text: "Everything in HR Outreach" },
              { text: "Unlimited resume optimizations" },
              { text: "Priority support" },
              { text: "AI Auto Apply", soon: true },
            ]}
            comingSoon
            buttonText="Notify Me"
          />
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-neutral-400">
            Secure payment · 24/7 support · Pricing is per resume optimization
          </p>
        </motion.div>
      </div>
    </section>
  );
};
