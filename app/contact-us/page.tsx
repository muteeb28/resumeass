"use client";

import { useState } from "react";
import { H1_CTA_BAND, INTRO_TEXT, SECTION_TITLE } from "@/lib/typography";
import { Mail, Briefcase, HelpCircle, ChevronDown, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";

const SUBJECT_OPTIONS = [
  "Technical Support",
  "Premium Membership",
  "Business Partnership",
  "Feature Suggestion",
  "Report a Bug",
  "Other",
];

const FAQ_ITEMS = [
  {
    q: "How long does support take?",
    a: "We typically respond within 24 hours on business days. Membership inquiries are often faster.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — eligible cases are covered under our refund policy. Select 'Premium Membership' above and describe your situation.",
  },
  {
    q: "Can companies partner with ResumeAssist?",
    a: "Absolutely. Choose 'Business Partnership' as the subject and tell us about your company.",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.values(formData).some((val) => !val.trim())) {
      toast.error("Please complete all fields to help us assist you better.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axiosInstance.post("/contact-us", formData);
      if (res.data?.success) {
        toast.success("Message sent! Our team will get back to you shortly.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BackgroundRippleLayout tone="light" contentClassName="min-h-screen" showRipple={false}>
      <Navbar tone="light" />

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sapphire-50 border border-sapphire-100 text-sapphire-brand text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3 h-3" />
            Support Center
          </div>
          <h1 className={H1_CTA_BAND}>
            Let's build your <span className="text-sapphire-brand">career together.</span>
          </h1>
          <p className={`mt-4 max-w-2xl mx-auto ${INTRO_TEXT}`}>
            Whether you have a question about features, trials, or pricing, our team is ready to help you land your dream job.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: 3 info cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="p-5 rounded-(--jf-radius-frame) border border-border-soft bg-page shadow-[var(--jf-shadow-frame)]">
              <div className="w-9 h-9 rounded-(--jf-radius-tile) bg-sapphire-50 flex items-center justify-center mb-3">
                <Mail className="w-4 h-4 text-sapphire-brand" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1">Email Support</p>
              <a
                href="mailto:contact@jobflix.in"
                className="text-sm font-semibold text-ink-900 hover:text-sapphire-brand transition-colors"
              >
                contact@jobflix.in
              </a>
              <p className="text-xs text-ink-400 mt-1">Under 24 hours</p>
            </div>

            <div className="p-5 rounded-(--jf-radius-frame) border border-border-soft bg-page shadow-[var(--jf-shadow-frame)]">
              <div className="w-9 h-9 rounded-(--jf-radius-tile) bg-surface-alt flex items-center justify-center mb-3">
                <Briefcase className="w-4 h-4 text-ink-600" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1">Partnerships</p>
              <p className="text-sm font-semibold text-ink-900">For hiring &amp; collaborations</p>
              <p className="text-xs text-ink-400 mt-1">Reach out via the form</p>
            </div>

            <div className="p-5 rounded-(--jf-radius-frame) border border-border-soft bg-page shadow-[var(--jf-shadow-frame)]">
              <div className="w-9 h-9 rounded-(--jf-radius-tile) bg-surface-alt flex items-center justify-center mb-3">
                <HelpCircle className="w-4 h-4 text-ink-600" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500 mb-1">Product Support</p>
              <p className="text-sm font-semibold text-ink-900">ResumeAssist &amp; Job Tracker</p>
              <p className="text-xs text-ink-400 mt-1">Technical help &amp; bug reports</p>
            </div>
          </motion.div>

          {/* Right: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-page border border-border-soft rounded-(--jf-radius-panel) p-8 shadow-[var(--jf-shadow-frame)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-ink-700">Name</Label>
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      className="rounded-(--jf-radius-frame) border-border-soft bg-white text-ink-900 focus-visible:ring-sapphire-bright/15 h-11"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-ink-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@jobflix.in"
                      className="rounded-(--jf-radius-frame) border-border-soft bg-white text-ink-900 focus-visible:ring-sapphire-bright/15 h-11"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-semibold text-ink-700">Subject</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(val) => setFormData({ ...formData, subject: val })}
                  >
                    <SelectTrigger className="h-11 rounded-(--jf-radius-frame) border-border-soft bg-white text-ink-900">
                      <SelectValue placeholder="How can we help?" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border-soft text-ink-900">
                      {SUBJECT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-ink-900 focus:bg-surface-alt focus:text-ink-900">{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-semibold text-ink-700">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    className="min-h-[160px] rounded-(--jf-radius-frame) border-border-soft bg-white text-ink-900 focus-visible:ring-sapphire-bright/15 p-4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button
                  variant="primary"
                  disabled={submitting}
                  className="w-full md:w-auto px-10 h-12 rounded-(--jf-radius-pill) font-medium"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin text-lg">◌</span> Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send Message <Send className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Inline FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16"
        >
          <h2 className={`${SECTION_TITLE} mb-6 text-center`}>
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                className="rounded-(--jf-radius-frame) border border-border-soft bg-page shadow-[var(--jf-shadow-frame)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-ink-900 hover:bg-surface-alt transition-colors"
                >
                  {item.q}
                  <ChevronDown
                    className={`w-4 h-4 text-ink-400 shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-ink-600 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </BackgroundRippleLayout>
  );
}
