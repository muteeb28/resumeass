"use client";
import { motion } from "motion/react";
import { Button } from "./button";
import { cn } from "../lib/utils";

const PricingCard = ({
  title,
  price,
  period,
  description,
  features,
  isPopular = false,
  buttonText = "Get Started",
  className,
}: {
  title: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText?: string;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative rounded-3xl border border-neutral-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,42,0.08)] md:p-8",
        isPopular &&
          "border-cyan-300 bg-gradient-to-b from-white via-cyan-50/60 to-white shadow-[0_24px_60px_rgba(14,165,233,0.16)]",
        className
      )}
    >
      {isPopular && (
        <div className="absolute top-5 right-5">
          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-700">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold text-neutral-900 md:text-2xl">
          {title}
        </h3>
        <div className="mb-3 flex items-end justify-center gap-2">
          <span className="text-4xl font-semibold text-neutral-900 md:text-5xl">
            {price}
          </span>
          {period && (
            <span className="text-sm text-neutral-500 md:text-base">/{period}</span>
          )}
        </div>
        <p className="mb-6 text-sm text-neutral-500 md:text-base">
          {description}
        </p>

        <Button
          variant={isPopular ? "default" : "outline"}
          className={cn(
            "mb-6 w-full focus-visible:ring-neutral-900 focus-visible:ring-offset-white",
            isPopular
              ? "border border-neutral-900 bg-neutral-900 text-white shadow-none hover:bg-neutral-800"
              : "border border-neutral-300 bg-white text-neutral-900 shadow-none hover:bg-neutral-900 hover:text-white"
          )}
          size="lg"
        >
          {buttonText}
        </Button>

        <div className="space-y-3 text-left">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50">
                <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
              </div>
              <span className="text-sm text-neutral-600">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export const PaymentSection = () => {
  return (
    <section className="relative bg-white py-24 px-4 text-neutral-900">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.12),_transparent_70%)]" />
        <div className="absolute left-1/2 top-10 h-24 w-[28rem] -translate-x-1/2 bg-cyan-300/30 blur-[90px]" />
        <div className="absolute left-1/2 top-0 h-px w-56 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0.5, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            ease: "easeInOut",
          }}
          className="mb-4 text-center text-3xl font-semibold tracking-tight text-neutral-900 md:text-5xl"
        >
          Choose Your Plan
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.35,
            duration: 0.6,
            ease: "easeInOut",
          }}
          className="mx-auto mb-12 max-w-2xl text-center text-base text-neutral-500 md:text-lg"
        >
          Simple pricing for resume optimization and job tracking. Pay once for a resume or go monthly for tracking and outreach.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          <PricingCard
            title="Resume Optimization"
            price="Rs 50"
            description="One-time payment per resume optimization."
            features={[
              "1 resume optimization (ATS-ready) with 2 professional resume templates",
              "Job description matching",
              "Built-in job tracker",
              "ATS-friendly formatting",
              "PDF + DOCX downloads",
              "One-time payment"
            ]}
            buttonText="Pay Rs 50"
          />

          <PricingCard
            title="Resume Optimization + HR Outreach"
            price="Rs 199"
            description="Unlock full access with a one-time payment per resume optimization."
            features={[
              "Resume optimization (ATS-ready)",
              "Job tracker dashboard",
              "50 Dubai HR email contacts",
              "1800+ India HR email contacts",
              "LinkedIn profiles of HRs",
              "Cold email templates (ready to send)",
              "Application tracking & follow-ups"
            ]}
            isPopular={true}
            buttonText="Unlock Full Access"
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="mb-4 text-sm text-neutral-500">
            Secure payment | 24/7 support | Pricing is per resume optimization
          </p>
          <div className="flex items-center justify-center gap-8 text-xs font-semibold text-neutral-400">
            <div>Stripe</div>
            <div>PayPal</div>
            <div>Apple Pay</div>
            <div>Google Pay</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
