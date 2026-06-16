"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ChevronRight,
  Handshake,
  Mail,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUserStore } from "../../src/stores/useUserStore";
import { useRouter } from "next/navigation";

const benefits = [
  {
    icon: BadgeCheck,
    title: "Better shot at interviews",
    description: "Get your profile in front of the right people with a clean, human-first referral request.",
  },
  {
    icon: Handshake,
    title: "Trusted introductions",
    description: "A referral feels warmer than a cold application and can move your profile faster.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Roles that match your goals",
    description: "Tell us exactly what job you want and the kind of experience you bring to the table.",
  },
];

const highlights = [
  "Quick referral requests",
  "Curated opportunities",
  "Easy referral tracking",
  "Searchable referral board",
];

const initialForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  description: "",
  desiredJob: "",
  experience: "",
};

function StatCard({ value, label } : {value: string, label: string}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-sm text-white/70">{label}</div>
    </div>
  );
}

function Field({ label, children, required = false } : any) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-neutral-800">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

export default function ReferralsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const { user } = useUserStore();
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) {
      router.replace(`${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login`);
      return;
    }

    if (Object.values(formData).some((value) => !value.trim())) {
      toast.error("Please complete every field before sending your referral request.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axiosInstance.post("/referrals", formData);

      if (response.data?.success) {
        toast.success("Referral request sent successfully.");
        setFormData(initialForm);
        setIsModalOpen(false);
      } else {
        toast.error(response.data?.message || "Something went wrong.");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to submit referral request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BackgroundRippleLayout tone="light" contentClassName="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]">
      <Navbar tone="light" />

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="space-y-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Referral Hub
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
                Open the right doors with a referral that feels personal.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-neutral-600">
                Share your background, target role, and experience. We’ll help surface your request in a way that is simple, polished, and easy to act on.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="h-12 rounded-xl bg-neutral-950 px-6 text-white shadow-lg shadow-neutral-950/20 transition-transform hover:bg-neutral-800 active:scale-[0.98]"
              >
                Ask for referral
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-xl border-neutral-200 bg-white px-6 text-neutral-800 shadow-sm hover:bg-neutral-50"
              >
                <Link href="/referrals/list">
                  Show referrals
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-neutral-700">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -left-6 top-8 h-24 w-24 rounded-full bg-blue-200/40 blur-2xl" />
            <div className="absolute -right-6 bottom-8 h-28 w-28 rounded-full bg-emerald-200/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/40 bg-neutral-950 p-7 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/60">Referral spotlight</p>
                  <h2 className="mt-1 text-2xl font-black">Built for momentum</h2>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <Users className="h-6 w-6 text-cyan-300" />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <StatCard value="Fast" label="Request capture" />
                <StatCard value="Smart" label="Searchable board" />
                <StatCard value="Clear" label="Role targeting" />
                <StatCard value="Warm" label="Referral context" />
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Tell your story clearly</p>
                    <p className="mt-1 text-sm leading-6 text-white/65">
                      Include your experience and the job you want so the referral request feels relevant and easier to share.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-600">Benefits</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">Why people use referrals</h2>
            </div>
            <p className="hidden max-w-xl text-sm leading-6 text-neutral-500 md:block">
              A well-written referral request helps recruiters and referrers quickly understand what you do, what you want, and why you are worth introducing.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {benefits.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="rounded-[1.75rem] border border-neutral-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-neutral-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-600">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mt-20 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-600">More</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-neutral-950">Make the request easy to say yes to</h2>
            <p className="mt-4 text-sm leading-7 text-neutral-600">
              The strongest referral requests are short, specific, and respectful of someone’s time. This page is designed to help the user quickly submit the right details and browse existing referrals when needed.
            </p>

            <div className="mt-6 space-y-4">
              {[
                "Share exactly what role you want.",
                "Add experience that helps the referrer position you.",
                "Use the referrals list to review submissions in one place.",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-2xl bg-neutral-50 p-4">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm leading-6 text-neutral-700">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-neutral-950 p-8 text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3 text-cyan-300">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/60">Need help?</p>
                <h3 className="text-xl font-bold">Send a referral request in under a minute</h3>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/60">1. Open modal</p>
                <p className="mt-1 text-base font-semibold">Click Ask for referral</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/60">2. Submit details</p>
                <p className="mt-1 text-base font-semibold">Fill in your role and experience</p>
              </div>
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 h-12 w-full rounded-xl bg-white text-neutral-950 hover:bg-neutral-100"
            >
              Start referral request
            </Button>
          </div>
        </section>
      </main>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 px-4 py-6 backdrop-blur-md">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-2xl sm:p-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-full border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-800"
              aria-label="Close referral form"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="pr-10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-blue-600">Ask for referral</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">Tell us about the opportunity you want</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Share the basics and we’ll save it as a referral request.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" required>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Jane Doe"
                    className="h-11 rounded-xl border-neutral-200 focus-visible:ring-blue-500"
                  />
                </Field>
                <Field label="Email" required>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@example.com"
                    className="h-11 rounded-xl border-neutral-200 focus-visible:ring-blue-500"
                  />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone number" required>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="h-11 rounded-xl border-neutral-200 focus-visible:ring-blue-500"
                  />
                </Field>
                <Field label="Desired job" required>
                  <Input
                    value={formData.desiredJob}
                    onChange={(e) => setFormData({ ...formData, desiredJob: e.target.value })}
                    placeholder="Frontend Developer"
                    className="h-11 rounded-xl border-neutral-200 focus-visible:ring-blue-500"
                  />
                </Field>
              </div>

              <Field label="Experience" required>
                <Input
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="3 years in React and Next.js"
                  className="h-11 rounded-xl border-neutral-200 focus-visible:ring-blue-500"
                />
              </Field>

              <Field label="Description" required>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell us about your background, what roles you’re targeting, and any useful context."
                  className="min-h-[140px] rounded-2xl border-neutral-200 p-4 focus-visible:ring-blue-500"
                />
              </Field>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 rounded-xl border-neutral-200 bg-white px-5 text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 rounded-xl bg-neutral-950 px-5 text-white hover:bg-neutral-800"
                >
                  {submitting ? "Sending..." : "Submit referral request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </BackgroundRippleLayout>
  );
}
