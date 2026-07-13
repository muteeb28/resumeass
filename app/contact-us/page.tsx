"use client";

import React, { useState } from "react";
import { H1_CTA_BAND, INTRO_TEXT, SECTION_TITLE } from "@/lib/typography";
import { Mail, Briefcase, HelpCircle, ChevronDown, Send, Sparkles, User, FileText, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { cn } from "@/lib/utils";

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
    a: "We typically respond within 24 hours on business days. Membership and premium billing inquiries are prioritized on our quick-triage desk and often receive a resolution within hours.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes — valid and eligible cases are fully covered under our transparent refund guidelines. To expedite this, select 'Premium Membership' from the form dropdown and include your receipt information.",
  },
  {
    q: "Can companies partner with Jobflix?",
    a: "Absolutely. We routinely collaborate with enterprise hiring teams, specialized campus recruitment portals, and high-impact bootcamps. Select 'Business Partnership' to start the dialogue.",
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

      <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 pt-32 text-[#0B2A3C]">
        
        {/* HERO TITLE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20 relative"
        >
          {/* Subtle grid mesh backing */}
          <div className="absolute inset-0 -top-12 bg-[radial-gradient(#CFE0FB_1px,transparent_1px)] [background-size:1.5rem_1.5rem] opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] -z-10" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CFE0FB] border border-[#2F7BE0]/10 text-[#163F8C] text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#2F7BE0]" />
            Jobflix Core Concierge
          </div>
          <h1 className={`${H1_CTA_BAND} text-3xl sm:text-4xl font-extrabold tracking-tight`}>
            Let's scale your <span className="text-[#2F7BE0] underline decoration-[#CFE0FB] decoration-4">career architecture</span>
          </h1>
          <p className={`mt-4 max-w-2xl mx-auto ${INTRO_TEXT} text-sm font-medium text-[#647B8E] leading-relaxed`}>
            Have operational questions about your premium membership, platform APIs, or specialized pipeline matchmaking? Our dispatch team is deployed to help.
          </p>
        </motion.div>

        {/* INTERFACE SPLIT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: BRAND PIPELINE CARDS (Takes 4 Blocks) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4 space-y-4"
          >
            {/* Mail Support Card */}
            <div className="group p-5 rounded-2xl border border-[#EEF2F1] bg-[#ffffff] shadow-[0_8px_30px_rgb(11,42,60,0.02)] hover:shadow-[0_12px_40px_rgba(47,123,224,0.06)] hover:border-[#2F7BE0]/20 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-[#CFE0FB] text-[#2F7BE0] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
                <Mail className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#647B8E] mb-1">Direct Help Desk</p>
              <a
                href="mailto:contact@jobflix.in"
                className="text-sm font-bold text-[#0B2A3C] hover:text-[#2F7BE0] transition-colors inline-flex items-center gap-1"
              >
                contact@jobflix.in <ArrowUpRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
              </a>
              <p className="text-[11px] font-medium text-[#647B8E] mt-1">Monitored hourly by support leaders.</p>
            </div>

            {/* Partnerships Card */}
            <div className="group p-5 rounded-2xl border border-[#EEF2F1] bg-[#ffffff] shadow-[0_8px_30px_rgb(11,42,60,0.02)] hover:shadow-[0_12px_40px_rgba(47,123,224,0.06)] hover:border-[#2F7BE0]/20 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-[#EAF0EF] text-[#0FA573] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
                <Briefcase className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#647B8E] mb-1">Collaborations</p>
              <p className="text-sm font-bold text-[#0B2A3C]">Corporate Partnerships &amp; Enterprise</p>
              <p className="text-[11px] font-medium text-[#647B8E] mt-1">Custom pipelines for high-velocity recruiting.</p>
            </div>

            {/* Product Support Card */}
            <div className="group p-5 rounded-2xl border border-[#EEF2F1] bg-[#ffffff] shadow-[0_8px_30px_rgb(11,42,60,0.02)] hover:shadow-[0_12px_40px_rgba(47,123,224,0.06)] hover:border-[#2F7BE0]/20 transition-all duration-300">
              <div className="w-9 h-9 rounded-xl bg-[#F5F8F7] text-[#C77414] flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
                <HelpCircle className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#647B8E] mb-1">Technical Stack</p>
              <p className="text-sm font-bold text-[#0B2A3C]">AI Optimization Engine Inquiries</p>
              <p className="text-[11px] font-medium text-[#647B8E] mt-1">Report real-time canvas errors or pipeline drops.</p>
            </div>
          </motion.div>

          {/* RIGHT COLUMN: PREMIUM USER COMPLAINT FORM (Takes 8 Blocks) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-8"
          >
            <div className="bg-[#ffffff] border border-[#EEF2F1] rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(11,42,60,0.03)] hover:shadow-[0_25px_60px_rgba(47,123,224,0.05)] transition-shadow duration-300 relative overflow-hidden group/form">
              
              {/* Form accent line top */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2F7BE0] via-[#2FA1DC] to-[#0FA573]" />

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Name Input */}
                  <div className="space-y-1 group">
                    <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-[#647B8E] group-focus-within:text-[#2F7BE0] transition-colors">
                      Your Name
                    </Label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-[#647B8E]/40 absolute left-3.5 pointer-events-none" />
                      <Input
                        id="name"
                        placeholder="Jane Doe"
                        className="pl-10 rounded-xl border-[#EEF2F1] bg-[#ffffff] text-[#0B2A3C] placeholder:text-[#647B8E]/30 focus-visible:ring-2 focus-visible:ring-[#2F7BE0] focus-visible:border-transparent h-11 text-xs font-semibold transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1 group">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[#647B8E] group-focus-within:text-[#2F7BE0] transition-colors">
                      Email Address
                    </Label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-[#647B8E]/40 absolute left-3.5 pointer-events-none" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@jobflix.in"
                        className="pl-10 rounded-xl border-[#EEF2F1] bg-[#ffffff] text-[#0B2A3C] placeholder:text-[#647B8E]/30 focus-visible:ring-2 focus-visible:ring-[#2F7BE0] focus-visible:border-transparent h-11 text-xs font-semibold transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Subject Selector drop menu */}
                <div className="space-y-1 group">
                  <Label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-[#647B8E] group-focus-within:text-[#2F7BE0] transition-colors">
                    Inquiry Vector (Subject)
                  </Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(val) => setFormData({ ...formData, subject: val })}
                  >
                    <SelectTrigger className="h-11 w-full rounded-xl border-[#EEF2F1] bg-[#ffffff] text-[#0B2A3C] text-xs font-semibold focus:ring-2 focus:ring-[#2F7BE0] focus:border-transparent outline-none transition-all">
                      <SelectValue placeholder="Identify how our team can help you today" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#ffffff] border-[#EEF2F1] text-[#0B2A3C] rounded-xl shadow-xl">
                      {SUBJECT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-xs font-semibold focus:bg-[#F5F8F7] focus:text-[#2F7BE0] cursor-pointer py-2.5 rounded-lg">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Box */}
                <div className="space-y-1 group">
                  <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-[#647B8E] group-focus-within:text-[#2F7BE0] transition-colors">
                    Detailed Communication Matrix
                  </Label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-[#647B8E]/30 absolute left-3.5 top-3.5 pointer-events-none" />
                    <Textarea
                      id="message"
                      placeholder="Describe your requirement, issue specifications, or collaboration ideas with absolute detail..."
                      className="min-h-[140px] pl-10 pt-3.5 rounded-xl border-[#EEF2F1] bg-[#ffffff] text-[#0B2A3C] placeholder:text-[#647B8E]/30 focus-visible:ring-2 focus-visible:ring-[#2F7BE0] focus-visible:border-transparent text-xs font-semibold leading-relaxed transition-all"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                </div>

                {/* Dispatch Button */}
                <Button
                  disabled={submitting}
                  className="w-full md:w-auto px-8 h-11 bg-[#2F7BE0] hover:bg-[#1D5FD8] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-[#2F7BE0]/15 hover:scale-[1.01] active:scale-[0.99]"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin text-sm">◌</span> Dispatching Securely...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Submit Transmission <Send className="w-3.5 h-3.5 transition-transform group-hover/form:translate-x-0.5 group-hover/form:-translate-y-0.5" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* ─── SECTION 3: EXPANDABLE ACCORDION FAQ ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-24 pt-16 border-t border-[#EEF2F1]"
        >
          <div className="text-center mb-12">
            <h2 className={`${SECTION_TITLE} text-2xl font-bold text-[#0B2A3C]`}>
              Frequently Asked Support Pipelines
            </h2>
            <p className="text-xs text-[#647B8E] mt-1 font-medium">
              Immediate operational answers compiled by the platform operations deck.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQ_ITEMS.map((item, i) => {
              const isCurrentlyOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-xl border transition-all duration-300 overflow-hidden bg-[#ffffff]",
                    isCurrentlyOpen ? "border-[#2F7BE0] shadow-[0_8px_25px_rgba(47,123,224,0.05)]" : "border-[#EEF2F1]"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isCurrentlyOpen ? null : i)}
                    className={cn(
                      "w-full flex items-center justify-between px-5 py-4 text-left text-xs font-bold tracking-tight text-[#0B2A3C] transition-colors duration-200",
                      isCurrentlyOpen ? "bg-[#CFE0FB]/20 text-[#2F7BE0]" : "hover:bg-[#F5F8F7]"
                    )}
                  >
                    {item.q}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-[#647B8E] shrink-0 transition-transform duration-300",
                        isCurrentlyOpen && "rotate-180 text-[#2F7BE0]"
                      )}
                    />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isCurrentlyOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 pt-3 text-xs font-semibold text-[#647B8E] leading-relaxed border-t border-[#EEF2F1]/40 bg-[#ffffff]">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </BackgroundRippleLayout>
  );
}