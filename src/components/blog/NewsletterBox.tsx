"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div className="border border-dashed border-border-frame rounded-(--jf-radius-frame) p-5 mt-10">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink-500 mb-1">
        Newsletter
      </p>
      <h3 className="text-[15px] font-semibold text-ink-900 mb-1">
        Don&apos;t miss a thing
      </h3>
      <p className="text-xs text-ink-500 mb-4 leading-relaxed">
        Subscribe to get career resources straight to your inbox.
      </p>

      {submitted ? (
        <p className="text-sm font-medium text-sapphire-brand">
          Thanks, you&apos;re in!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 min-w-0 px-3 py-2 text-[13px] border border-border-soft rounded-(--jf-radius-mini) bg-page text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-sapphire-bright transition-colors"
          />
          <Button type="submit" size="sm" variant="primary" className="flex-shrink-0">
            Subscribe
          </Button>
        </form>
      )}
    </div>
  );
}
