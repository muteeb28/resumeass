"use client";

import { useState } from "react";
import { Mail, MessageSquareText, UserRound } from "lucide-react";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  "General Inquiry",
  "Sales Question",
  "Product Information",
  "Technical Support",
  "Billing & Payments",
  "Account Assistance",
  "Order Status",
  "Returns & Refunds",
  "Partnership / Collaboration",
  "Feedback & Suggestions",
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      setSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
      const res = await axiosInstance.post("/contact-us", {name, email, subject, message});
      if (res.data && res.data.success) {
          toast.success("Your message has been submitted.");
          setName("");
          setEmail("");
          setSubject("");
          setMessage("");
          return;
      }
      toast.success(res.data?.message || "some error occured");
    } catch (error: any) {
        toast.error(error?.response?.data?.message || "some error occured. Try again later");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BackgroundRippleLayout tone="light" contentClassName="min-h-screen">
      <Navbar tone="light" />
      <main className="mx-auto max-w-4xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border border-neutral-200 bg-white/95 p-6 shadow-lg backdrop-blur">
          <h1 className="text-3xl font-bold text-neutral-800">Contact Us</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Have a question, bug report, or feature request? Send us a message.
          </p>
        </div>

        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
              <MessageSquareText className="h-5 w-5" />
              Contact Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="contact-name">Full Name</Label>
                <Input
                  id="contact-name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email Address</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact-subject">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="contact-subject" className="h-10 w-full rounded-lg border-neutral-200">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECT_OPTIONS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact-message">Message</Label>
                <Textarea
                  id="contact-message"
                  className="min-h-32"
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="border-emerald-200">
            <CardContent className="flex items-center gap-3 pt-6 text-sm text-neutral-700">
              <Mail className="h-4 w-4 text-emerald-700" />
              support@resumeassist.ai
            </CardContent>
          </Card>
          <Card className="border-violet-200">
            <CardContent className="flex items-center gap-3 pt-6 text-sm text-neutral-700">
              <UserRound className="h-4 w-4 text-violet-700" />
              Typical response time: within 24 hours
            </CardContent>
          </Card>
        </div>
      </main>
    </BackgroundRippleLayout>
  );
}

