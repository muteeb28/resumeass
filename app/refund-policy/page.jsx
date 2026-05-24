import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  Mail,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Refund Policy | ResumeAssist AI",
  description:
    "Refund, cancellation, billing, duplicate charge, failed payment, and dispute policy for ResumeAssist AI paid services.",
};

const lastUpdated = "May 24, 2026";

const summaryItems = [
  {
    icon: Ban,
    title: "Strict No-Refunds",
    text: "All subscription fees, purchases, and renewals are entirely non-refundable. All sales are final.",
  },
  {
    icon: Download,
    title: "Instant Delivery",
    text: "As a digital product, credits, AI generations, optimizations, and downloads are fully consumed instantly upon execution.",
  },
  {
    icon: CreditCard,
    title: "Duplicate Charges",
    text: "Verified technical errors resulting in double payments will be reviewed and corrected to ensure accurate billing.",
  },
  {
    icon: CalendarClock,
    title: "Subscription Renewal",
    text: "Canceling your plan terminates future billing cycles. Past, current, and automatically processed renewals are non-refundable.",
  },
];

const sections = [
  {
    title: "1. Overview",
    body: [
      "This Refund Policy governs the financial terms, cancellation parameters, and billing guidelines for ResumeAssist (https://resumeassist.jobflix.in), a proprietary product fully owned and operated by jobflix.in ('the Company', 'we', 'our', or 'us').",
      "By purchasing a premium license, subscribing to a recurrent billing plan, or consuming digital tokens on ResumeAssist, you explicitly agree to match this Refund Policy alongside our general Terms of Service.",
      "CRITICAL DISCLAIMER: ResumeAssist maintains a strict, unconditional zero-refund framework for any and all subscription products, unless explicitly mandated otherwise by absolute statutory law.",
    ],
  },
  {
    title: "2. Digital Products and Service Delivery",
    body: [
      "Our infrastructure delivers instant data processing, machine-learning outputs, resume parsing, ATS optimizations, and export permissions the exact second a transaction authenticates.",
      "Because resources are provisioned on-demand, all subscription fees and one-time payments are fundamentally considered spent upon processing. Your choice to purchase implies formal consent that digital fulfillment initiates immediately.",
      "Users are strictly advised to review available tools, design rules, tier capacities, and output samples via our free tiers prior to authorizing a premium commitment.",
    ],
  },
  {
    title: "3. Scope of Non-Refundable Subscriptions",
    body: [
      "Subscriptions are completely non-refundable. No pro-rated refunds, balance carry-overs, or cash reversals will be initiated for partially spent monthly, quarterly, or annual recurring periods.",
      "We strictly do not issue refunds or credits because an AI suggestion, optimized format, ATS score variation, or exported file failed to result in employment, recruiter callbacks, corporate interviews, or specific career milestones.",
      "User-end errors—including but not limited to: omitting or inputting wrong personal records, selecting an unintended billing scale, neglecting to read tier caps, choosing poor templates, or simple change-of-mind—remain entirely ineligible for any payment clawbacks.",
      "Technical issues arising out of a user’s local setup, custom web browser extensions, intermittent ISPs, incompatible file inputs, or workplace firewalls are outside our platform's liabilities and will not support a compensation dispute.",
      "Any account restricted, banned, or deleted due to an explicit breach of our security rules, scraping protocols, or Terms of Service waives all rights to remaining paid service balances.",
    ],
  },
  {
    title: "4. Permitted Exceptions & Payment Anomalies",
    body: [
      "The Company will actively verify and approve adjustments exclusively for confirmed merchant gateway technical failures, such as double-charging an identical plan to the exact same customer profile within a 24-hour cycle.",
      "If a core payment processing gateway logs a successful charge capture, but our underlying server database fundamentally fails to deliver the corresponding feature credentials due to an internal system bug, we reserve the target right to manually fix the user entitlement or issue a systemic credit in lieu of cash.",
      "In administrative scenarios where statutory consumer frameworks (e.g., specific European Union consumer rights directives regarding digital items consumed immediately) override private standard terms, our liability is strictly capped at the lowest legal statutory boundary.",
    ],
  },
  {
    title: "5. Subscription Renewals and Cancellation Rules",
    body: [
      "Subscriptions self-renew automatically at the closing of your active billing sequence unless canceled natively by the user. You can stop auto-renewals at any moment by navigating directly into your Profile/Billing Dashboard, or providing a minimum 48-hour written notice to support@resumeassist.ai.",
      "Terminating a subscription strictly blocks future automated invoices. The current paid term remains functional and unlocked for you until the active timeline runs out. Cancellation does not yield retroactive payouts.",
      "The management of recurring timelines falls strictly on the user. Jobflix.in assumes zero accountability for renewal fees resulting from a user’s failure to complete a native cancellation prior to their billing cycle reset.",
    ],
  },
  {
    title: "6. Usage Balance and Token Provisions",
    body: [
      "System allocations, token quotas, design variants, and query balances are bounded to the designated subscription tier and might not roll over into subsequential months depending on your exact plan architecture.",
      "All consumed AI data pools or resume rendering runs are completely final. Should an internal systemic malfunction swallow an operational credit line without emitting any asset file, our engineering staff will audit the system log and replenish the specific credit line to your wallet profile.",
    ],
  },
  {
    title: "7. Payment Clearing and Dispute Interception",
    body: [
      "Your financial institution or UPI application may place temporary holds, processing authorizations, or pending markers on your account interface. These reflect typical bank processes rather than active revenue captures by our platform.",
      "If a payment goes through but your profile access does not change, please safely forward your Merchant Transaction ID, payment reference screenshots, and primary user email to our support center for manual ledger reconciliation.",
    ],
  },
  {
    title: "8. Chargebacks and Bank Reversals",
    body: [
      "Users are strictly required to approach our internal help desk to investigate billing conflicts prior to pursuing a formal bank chargeback or dispute claim.",
      "Initiating an unverified chargeback or merchant dispute immediately triggers an automated freeze across your entire jobflix.in and resumeassist.jobflix.in profile to secure data integrity during formal banking review.",
      "We aggressively defend against fraudulent chargebacks by supplying complete operational logs, active login IP histories, download receipts, and timestamped configuration trees directly to your card network or payment processor.",
    ],
  },
  {
    title: "9. Documented Changes and Support Lines",
    body: [
      "Jobflix.in reserves the absolute right to modify, add, or subtract rules within this Refund Policy at any chosen milestone to track technical products or payment provider compliance updates. All purchases fall under the active policy published live at that exact moment.",
      "For comprehensive billing tracking, duplicate transaction reports, and cancellation issues, reach out natively to support@resumeassist.ai.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <BackgroundRippleLayout tone="light" contentClassName="min-h-screen">
      <Navbar tone="light" />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <section className="border-b border-slate-200 pb-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              ResumeAssist &mdash; A Product of Jobflix.in
            </p>
            <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
              Refund Policy
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              This framework outlines the absolute terms regarding subscription processing, non-refundable structures, payment errors, and automated billing protocols for ResumeAssist.
            </p>
            <p className="mt-4 text-sm font-medium text-slate-700">
              Last updated: {lastUpdated}
            </p>
          </div>
        </section>

        <section className="grid gap-4 py-8 md:grid-cols-2 lg:grid-cols-4">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border-slate-200 bg-white/95">
                <CardHeader className="space-y-3 pb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-base text-slate-950">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-slate-600">{item.text}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 border-l border-slate-200 pl-5">
              <p className="text-sm font-semibold text-slate-950">Contents</p>
              <nav className="mt-3 space-y-2">
                {sections.map((section) => (
                  <a
                    key={section.title}
                    href={`#${slugify(section.title)}`}
                    className="block text-sm leading-5 text-slate-500 transition hover:text-teal-700"
                  >
                    {section.title.replace(/^\d+\.\s*/, "")}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 border border-slate-200 bg-white/95 p-4">
                <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Subscriptions Are Final
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    No pro-rated refunds are offered for current cycles or recurring automated subscription renewals.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border border-slate-200 bg-white/95 p-4">
                <XCircle className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Delivered Digital Content
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Completed AI generations, tracking analysis, configurations, and document assets are non-refundable.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border border-slate-200 bg-white/95 p-4">
                <Clock className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Cancel Responsibly
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    You must stop recurring plans prior to the renewal execution timestamp directly in your billing hub.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border border-slate-200 bg-white/95 p-4">
                <Ban className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Dispute Mitigation
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Fraudulent chargebacks initiate comprehensive profile locks and immediate data log submission to banks.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 border border-slate-200 bg-white/95 p-4 text-sm font-medium text-slate-700">
                <ReceiptText className="h-5 w-5 text-teal-700" />
                Strict Zero-Refund Model
              </div>
              <div className="flex items-center gap-3 border border-slate-200 bg-white/95 p-4 text-sm font-medium text-slate-700">
                <FileText className="h-5 w-5 text-teal-700" />
                Immediate Resource Delivery
              </div>
              <div className="flex items-center gap-3 border border-slate-200 bg-white/95 p-4 text-sm font-medium text-slate-700">
                <AlertTriangle className="h-5 w-5 text-teal-700" />
                Chargeback Log Submissions
              </div>
            </div>

            {sections.map((section) => (
              <article
                key={section.title}
                id={slugify(section.title)}
                className="scroll-mt-24 border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6"
              >
                <h2 className="text-xl font-semibold text-slate-950">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-sm leading-7 text-slate-600"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}

            <section className="border border-teal-200 bg-teal-50/90 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
                    <Mail className="h-5 w-5 text-teal-700" />
                    Billing Operational Inquiries
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    For verification of double-charging or internal technical account validation issues, message us directly.
                  </p>
                </div>
                <Link
                  href="mailto:support@jobflix.in"
                  className="inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
                >
                  Email Support
                </Link>
              </div>
            </section>

            <p className="text-xs leading-6 text-slate-500">
              This text constitutes the definitive billing policy for ResumeAssist (https://resumeassist.jobflix.in). All system terms, billing engine behaviors, and customer onboarding loops operate strictly in dynamic synchronization with these rules.
            </p>
          </div>
        </section>
      </main>
    </BackgroundRippleLayout>
  );
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}