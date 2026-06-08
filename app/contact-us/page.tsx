"use client";

import { useState } from "react";
import { Mail, MessageSquareText, MapPin, Clock, Send, Sparkles } from "lucide-react";
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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

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
    <BackgroundRippleLayout tone="light" contentClassName="min-h-screen">
      <Navbar tone="light" />
      
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-32">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3 h-3" />
            Support Center
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight">
            Let’s build your <span className="text-blue-600">career together.</span>
          </h1>
          <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
            Whether you have a question about features, trials, or pricing, our team is ready to help you land your dream job.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Contact Info Bento */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="p-8 rounded-3xl bg-neutral-900 text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <MessageSquareText size={120} />
               </div>
               <h3 className="text-xl font-bold mb-2">Contact Details</h3>
               <p className="text-neutral-400 text-sm mb-8">Reach out via email or follow our support hours.</p>
               
               <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase font-bold">Email us</p>
                      <a href="mailto:contact@jobflix.in" className="text-white hover:text-blue-400 transition-colors">
                        contact@jobflix.in
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase font-bold">Response Time</p>
                      <p className="text-white">Under 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 uppercase font-bold">Location</p>
                      <p className="text-white">Remote First, India</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Quick Link Card */}
            <div className="p-6 rounded-3xl border border-neutral-200 bg-white shadow-sm">
              <h4 className="font-bold text-neutral-900 mb-1">Help Center</h4>
              <p className="text-sm text-neutral-500 mb-4">Check out our frequently asked questions.</p>
              <Button variant="outline" className="w-full rounded-xl border-neutral-200">Visit Documentation</Button>
            </div>
          </motion.div>

          {/* Right Side: Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Jane Doe"
                      className="rounded-xl border-neutral-200 focus:ring-blue-500 h-11"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jane@jobflix.in"
                      className="rounded-xl border-neutral-200 focus:ring-blue-500 h-11"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-semibold">Subject</Label>
                  <Select value={formData.subject} onValueChange={(val) => setFormData({...formData, subject: val})}>
                    <SelectTrigger className="h-11 rounded-xl border-neutral-200">
                      <SelectValue placeholder="How can we help?" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-semibold">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    className="min-h-[160px] rounded-xl border-neutral-200 focus:ring-blue-500 p-4"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <Button 
                  disabled={submitting}
                  className="w-full md:w-auto px-10 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all transform active:scale-95"
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
      </main>
    </BackgroundRippleLayout>
  );
}