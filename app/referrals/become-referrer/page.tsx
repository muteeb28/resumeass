"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/stores/useUserStore";
import { useRouter } from "next/navigation";

function Field({
  label,
  children,
  required = false,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
  error?: string | null;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-neutral-800">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

function SkillsInput({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (s: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput("");
  };

  return (
    <div className="min-h-[44px] cursor-text rounded-xl border border-neutral-200 bg-white px-3 py-2 transition-colors focus-within:border-[#4353CF]/40 focus-within:ring-2 focus-within:ring-[#4353CF]/15">
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
          >
            {skill}
            <button
              type="button"
              onClick={() => onChange(skills.filter((s) => s !== skill))}
              className="ml-0.5 text-blue-400 hover:text-blue-700"
              aria-label={`Remove ${skill}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
            if (e.key === "Backspace" && !input && skills.length > 0) {
              onChange(skills.slice(0, -1));
            }
          }}
          onBlur={addSkill}
          placeholder={skills.length === 0 ? "Type a skill and press Enter" : "Add more..."}
          className="min-w-[140px] flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
        />
      </div>
    </div>
  );
}

const initialForm = {
  companyEmail: "",
  company: "",
  designation: "",
  skills: [] as string[],
  experience: "",
};

export default function BecomeReferrerPage() {
  const [formData, setFormData] = useState(initialForm);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { user } = useUserStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    if (!user) {
      router.replace(
        `${process.env.NEXT_PUBLIC_JOBFLIX_VIEW}/login?next=${encodeURIComponent(window.location.href)}`
      );
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post("/referrals/add-referrer", {
        companyEmail: formData.companyEmail,
        company: formData.company,
        designation: formData.designation,
        skills: formData.skills,
        experience: formData.experience || undefined,
      });
      setSuccess(true);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Something went wrong. Please try again.";
      setEmailError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BackgroundRippleLayout
      tone="light"
      contentClassName="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(67,83,207,0.08),_transparent_35%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]"
    >
      <Navbar tone="light" />

      <main className="mx-auto max-w-2xl px-4 pb-24 pt-28 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/referrals"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to referrals hub
          </Link>

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 rounded-[2rem] border border-neutral-200 bg-white p-10 text-center shadow-sm"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <BadgeCheck className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-neutral-950">
                You're now visible to job seekers
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                Job seekers looking for referrals at{" "}
                <span className="font-semibold text-neutral-900">{formData.company}</span>{" "}
                can now find and contact you.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  asChild
                  className="rounded-xl bg-[#4353CF] px-6 text-white hover:bg-[#3645b5]"
                >
                  <Link href="/referrals">Back to referrals hub</Link>
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-neutral-200 bg-white px-6 text-neutral-700 hover:bg-neutral-50"
                  onClick={() => {
                    setSuccess(false);
                    setEmailError(null);
                    setFormData(initialForm);
                  }}
                >
                  Update profile
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="mt-8 rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="mb-8 border-b border-neutral-100 pb-6">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#4353CF]">
                  Become a referrer
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950">
                  Help someone get their foot in the door
                </h1>
                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  Set up your referrer profile so job seekers targeting your company can find and reach out to you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Field
                  label="Company email"
                  required
                  hint="Use your work email — personal emails (Gmail, Yahoo, etc.) won't be accepted"
                  error={emailError}
                >
                  <Input
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => {
                      setFormData({ ...formData, companyEmail: e.target.value });
                      setEmailError(null);
                    }}
                    placeholder="you@yourcompany.com"
                    className="h-11 rounded-xl border-neutral-200 focus-visible:ring-[#4353CF]/30"
                    required
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Company name" required>
                    <Input
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      placeholder="Razorpay"
                      className="h-11 rounded-xl border-neutral-200 focus-visible:ring-[#4353CF]/30"
                      required
                    />
                  </Field>
                  <Field label="Your designation" required>
                    <Input
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({ ...formData, designation: e.target.value })
                      }
                      placeholder="Senior Software Engineer"
                      className="h-11 rounded-xl border-neutral-200 focus-visible:ring-[#4353CF]/30"
                      required
                    />
                  </Field>
                </div>

                <Field
                  label="Skills you can vouch for"
                  required
                  hint="Press Enter after each skill"
                >
                  <SkillsInput
                    skills={formData.skills}
                    onChange={(skills) => setFormData({ ...formData, skills })}
                  />
                </Field>

                <Field label="Experience" hint="Optional — e.g. 3 years">
                  <Input
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    placeholder="e.g. 3 years"
                    className="h-11 rounded-xl border-neutral-200 focus-visible:ring-[#4353CF]/30"
                  />
                </Field>

                <div className="flex flex-col-reverse gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="rounded-xl border-neutral-200 bg-white px-6 text-neutral-700 hover:bg-neutral-50"
                  >
                    <Link href="/referrals">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || formData.skills.length === 0}
                    className="rounded-xl bg-[#4353CF] px-6 text-white hover:bg-[#3645b5] disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : "Become a referrer"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </main>
    </BackgroundRippleLayout>
  );
}
