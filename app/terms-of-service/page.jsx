import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  Bot,
  BriefcaseBusiness,
  CreditCard,
  Download,
  FileText,
  Globe2,
  Mail,
  Scale,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Terms of Service | ResumeAssist AI",
  description:
    "The terms that govern access to and use of ResumeAssist AI services, products, AI tools, payments, portfolios, and account features.",
};

const lastUpdated = "May 24, 2026";

const summaryItems = [
  {
    icon: UserCheck,
    title: "Your account",
    text: "You are responsible for your account, credentials, resume content, portfolio content, job tracker entries, and activity under your login.",
  },
  {
    icon: Bot,
    title: "AI tools",
    text: "AI-generated resumes, ATS scores, suggestions, and portfolio content are drafts and estimates. Review all output before using it.",
  },
  {
    icon: CreditCard,
    title: "Paid services",
    text: "Payments, subscriptions, credits, renewals, taxes, cancellations, and refunds are governed by these terms and checkout disclosures.",
  },
  {
    icon: ShieldCheck,
    title: "Fair use",
    text: "Do not misuse the platform, scrape it, overload it, upload unlawful content, or use it to violate third-party rights.",
  },
];

const sections = [
  {
    title: "1. Agreement to These Terms",
    body: [
      "These Terms of Service govern your access to and use of ResumeAssist AI, including our website, web application, resume builder, ATS optimization tools, AI generation features, portfolio tools, job tracker, account services, support channels, APIs, templates, downloads, paid features, and related services.",
      "By accessing or using ResumeAssist AI, creating an account, uploading content, generating a resume, publishing a portfolio, making a purchase, or otherwise using the services, you agree to be bound by these Terms and our Privacy Policy.",
      "If you use ResumeAssist AI on behalf of a company, school, employer, client, or other organization, you represent that you have authority to bind that organization to these Terms. In that case, \"you\" includes both you and that organization.",
      "If you do not agree to these Terms, you may not access or use ResumeAssist AI.",
    ],
  },
  {
    title: "2. Who May Use the Services",
    body: [
      "You must be legally able to enter into a binding agreement in your jurisdiction. If you are below the age of majority, you may use the services only with involvement and consent of a parent, guardian, school, or other authorized adult where permitted by law.",
      "You may not use ResumeAssist AI if you are prohibited from receiving the services under applicable law, if we previously suspended or terminated your account for serious violations, or if your use would cause ResumeAssist AI to violate law or third-party rights.",
      "You are responsible for ensuring that your use of ResumeAssist AI complies with the laws, rules, regulations, employer policies, school policies, professional obligations, and platform terms that apply to you.",
    ],
  },
  {
    title: "3. Accounts and Security",
    body: [
      "Some features require an account. You agree to provide accurate, current, and complete account information and to keep it updated.",
      "You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us promptly if you suspect unauthorized access, misuse, or a security issue.",
      "You may not share, sell, rent, transfer, or sublicense your account unless we expressly allow it in writing. We may reject, reclaim, or require changes to usernames, portfolio slugs, display names, or account identifiers that are misleading, infringing, offensive, inactive, or otherwise inappropriate.",
      "We may suspend or restrict access to your account if we believe your account has been compromised, used unlawfully, used to abuse the service, or used in violation of these Terms.",
    ],
  },
  {
    title: "4. Description of Services",
    body: [
      "ResumeAssist AI provides career productivity tools that may include resume creation, resume upload and parsing, ATS score estimates, resume optimization, job-specific resume generation, resume polishing, template selection, PDF and DOCX generation, public portfolio creation, job tracking, profile management, blog content, and contact/support features.",
      "The services may rely on frontend software, backend APIs, database systems, document processing services, payment processors, and artificial intelligence providers to process your requests.",
      "We may add, remove, modify, limit, suspend, or discontinue features at any time. Some features may be experimental, beta, region-limited, usage-limited, paid, or dependent on third-party providers.",
      "We do not guarantee that the services will result in interviews, job offers, admissions, promotions, hiring outcomes, ATS acceptance, recruiter responses, salary increases, or any specific career result.",
    ],
  },
  {
    title: "5. AI Output, ATS Scores, and Career Guidance",
    body: [
      "ResumeAssist AI uses automated systems and artificial intelligence to parse resumes, analyze job descriptions, estimate ATS compatibility, identify keywords, suggest improvements, generate resume text, polish writing, and create portfolio-ready content.",
      "AI output may be inaccurate, incomplete, outdated, repetitive, biased, unsuitable for your circumstances, or inconsistent with a particular employer's applicant tracking system. ATS scores and keyword analyses are estimates, not guarantees.",
      "You are responsible for reviewing, editing, verifying, and approving all AI-generated output before submitting it to employers, publishing it, relying on it, or sharing it with others.",
      "ResumeAssist AI does not provide legal, financial, immigration, tax, professional licensing, employment law, or human resources compliance advice. Any career guidance, resume suggestions, ATS analysis, or job-related content is informational and drafting assistance only.",
      "You should not use the services to create false employment history, fake credentials, fabricated education, misleading achievements, impersonation materials, or content that violates employer, school, government, or professional rules.",
    ],
  },
  {
    title: "6. User Content",
    body: [
      "User Content means any information, files, documents, resumes, CVs, cover letters, profile details, job descriptions, job tracker entries, portfolio content, usernames, images, links, messages, feedback, or other materials you upload, submit, paste, generate, save, publish, or otherwise provide through the services.",
      "You retain ownership of your User Content, subject to the license you grant us in these Terms. You are responsible for your User Content and for ensuring that you have all rights, permissions, and consents needed to provide it to ResumeAssist AI.",
      "You represent and warrant that your User Content does not violate law, infringe intellectual property rights, violate privacy or publicity rights, breach confidentiality obligations, contain malware, or include unlawful, deceptive, harassing, defamatory, discriminatory, sexually explicit, exploitative, or harmful material.",
      "If you upload or process another person's resume or personal information, you represent that you are authorized to do so and that your use complies with applicable privacy, employment, and data protection laws.",
    ],
  },
  {
    title: "7. License You Grant ResumeAssist AI",
    body: [
      "You grant ResumeAssist AI a worldwide, non-exclusive, royalty-free, transferable, sublicensable license to host, store, reproduce, process, transmit, display, format, modify, analyze, create derivative works from, and otherwise use User Content as necessary to operate, provide, secure, support, improve, and maintain the services.",
      "This license includes the right to process User Content through AI providers, document processing services, payment-related systems, hosting providers, support tools, analytics, security systems, and other service providers described in our Privacy Policy.",
      "For public portfolio features, you grant us the right to publish, display, distribute, index, and make available the portfolio content you choose to publish until you delete, unpublish, or disable it, subject to operational and caching limitations.",
      "We may use feedback, suggestions, bug reports, ideas, and recommendations you provide without restriction or compensation to you, provided we do not identify you publicly without permission.",
    ],
  },
  {
    title: "8. Public Portfolios and Sharing",
    body: [
      "If you create or publish a portfolio, public profile, or shareable page, the information you choose to publish may be visible to anyone with the link, searchable by third parties, copied, saved, screenshotted, or indexed by search engines.",
      "You are responsible for reviewing public content before publishing it. Do not publish confidential employer information, personal information of others, private documents, trade secrets, offensive content, copyrighted materials you do not have rights to use, or information you do not want public.",
      "Deleting or unpublishing content from ResumeAssist AI may remove it from active display in our service, but third-party caches, search indexes, archives, saved copies, browser caches, screenshots, and links outside our control may persist.",
    ],
  },
  {
    title: "9. Templates, Downloads, and Generated Documents",
    body: [
      "Resume templates, layouts, styles, UI elements, documents, previews, generated PDFs, generated DOCX files, and related materials are provided for personal career use unless we expressly state otherwise.",
      "You may use generated resumes, cover letters, and portfolio content for your personal job search, career development, professional profile, and application materials, subject to these Terms and your responsibility to verify accuracy.",
      "You may not resell, redistribute, scrape, copy, clone, or commercialize our templates, template gallery, design system, generated layout assets, source code, or platform features as a competing or standalone product without written permission.",
      "Download availability may depend on account status, payment status, usage limits, browser compatibility, third-party services, file type, and technical constraints.",
    ],
  },
  {
    title: "10. Payments, Subscriptions, Credits, and Refunds",
    body: [
      "Some services may be free, paid, subscription-based, usage-based, credit-based, promotional, or subject to feature limits. Prices, features, quotas, plan names, taxes, discounts, and billing periods may change from time to time.",
      "By starting a paid transaction, you authorize ResumeAssist AI and its payment processors to charge the payment method you provide for the applicable fees, taxes, renewals, and other charges disclosed at checkout.",
      "Payment processing may be handled by third-party processors such as Razorpay, Cashfree, banks, card networks, UPI providers, wallets, or similar providers. Their own terms and privacy policies may apply to payment processing.",
      "Unless stated otherwise at checkout or required by law, fees are non-refundable after a paid feature, credit, download, generation, subscription period, or digital service has been delivered, consumed, activated, or made available.",
      "If we offer subscriptions, they may renew automatically unless canceled before the renewal date. Canceling a subscription stops future renewals but may not refund the current billing period unless required by law or stated in a specific refund policy.",
      "We may correct pricing errors, reject or cancel orders, disable access for failed or disputed payments, and recover chargebacks, taxes, gateway fees, fraud losses, or collection costs where permitted by law.",
    ],
  },
  {
    title: "11. Acceptable Use",
    body: [
      "You may use ResumeAssist AI only for lawful, authorized, and career-related purposes consistent with these Terms.",
      "You may not use the services to violate law, infringe rights, deceive employers, impersonate others, fabricate credentials, submit fraudulent information, harass or harm others, distribute malware, send spam, scrape data, overload infrastructure, bypass security, reverse engineer the service, abuse AI systems, evade usage limits, or interfere with other users.",
      "You may not upload content that is unlawful, defamatory, hateful, discriminatory, explicit, exploitative, violent, threatening, privacy-invasive, confidential without authorization, or otherwise harmful.",
      "You may not use automated systems, bots, crawlers, scripts, or bulk tools to access, copy, mine, test, stress, or extract data from the services unless we provide written permission or an official API that permits the activity.",
      "You may not use ResumeAssist AI to build, benchmark, train, improve, or market a competing product or service without written permission.",
    ],
  },
  {
    title: "12. Third-Party Services and Links",
    body: [
      "ResumeAssist AI may include or rely on third-party services, including AI providers, hosting providers, database providers, payment processors, document processors, analytics tools, support tools, authentication services, job sources, course links, employer links, and external websites.",
      "Third-party services are not controlled by ResumeAssist AI. We are not responsible for their content, availability, security, accuracy, payment processing, privacy practices, terms, or decisions.",
      "Your use of third-party services may be governed by their own terms, privacy policies, payment rules, model terms, acceptable use policies, and support processes.",
    ],
  },
  {
    title: "13. Intellectual Property",
    body: [
      "ResumeAssist AI and its software, source code, interfaces, design, templates, branding, logos, documentation, databases, workflows, prompts, systems, graphics, and other materials are owned by ResumeAssist AI or its licensors and are protected by intellectual property and other laws.",
      "Except for the limited rights expressly granted to you, we reserve all rights in the services. You may not copy, modify, distribute, sell, lease, sublicense, reverse engineer, decompile, or create derivative works from the services unless permitted by law or authorized in writing.",
      "ResumeAssist AI names, logos, marks, product names, and brand elements may not be used without permission, except for truthful references to the service in accordance with applicable law.",
      "If you believe content on ResumeAssist AI infringes your intellectual property rights, contact us with sufficient detail for us to investigate and respond.",
    ],
  },
  {
    title: "14. Privacy",
    body: [
      "Our Privacy Policy explains how we collect, use, disclose, retain, and protect personal information. By using ResumeAssist AI, you acknowledge the processing described in the Privacy Policy.",
      "Because resumes and portfolios may contain sensitive personal information, you should review files and generated content carefully before uploading, saving, downloading, publishing, or sharing them.",
      "You can review the Privacy Policy at /privacy-policy.",
    ],
  },
  {
    title: "15. Service Availability and Changes",
    body: [
      "We aim to provide a useful and reliable service, but we do not guarantee uninterrupted, error-free, secure, or always-available operation.",
      "The services may be unavailable, delayed, degraded, or limited due to maintenance, updates, outages, third-party provider issues, network failures, security incidents, payment processor issues, AI provider limits, high demand, legal restrictions, or events beyond our control.",
      "We may modify, suspend, discontinue, rate-limit, or restrict any feature, plan, API, template, model, output format, storage limit, or service at any time. Where reasonable, we may provide notice of material changes.",
    ],
  },
  {
    title: "16. Suspension and Termination",
    body: [
      "You may stop using the services at any time. You may request account deletion or closure by contacting us or using account tools where available.",
      "We may suspend, restrict, or terminate your access to the services if we believe you violated these Terms, created risk or legal exposure, failed to pay amounts owed, abused the platform, infringed rights, compromised security, or used the services unlawfully.",
      "After termination, your right to use the services ends immediately. We may delete, retain, or disable access to account data and User Content in accordance with our Privacy Policy, legal obligations, backup practices, and legitimate business needs.",
      "Sections that by their nature should survive termination will survive, including payment obligations, intellectual property, licenses, disclaimers, limitations of liability, indemnity, dispute terms, and general provisions.",
    ],
  },
  {
    title: "17. Disclaimers",
    body: [
      "The services are provided on an \"as is\" and \"as available\" basis. To the fullest extent permitted by law, ResumeAssist AI disclaims all warranties, express, implied, statutory, or otherwise, including warranties of merchantability, fitness for a particular purpose, title, non-infringement, accuracy, availability, security, and uninterrupted operation.",
      "We do not warrant that AI output, ATS scores, resume suggestions, generated documents, job recommendations, portfolio pages, templates, or support responses will be accurate, complete, current, lawful, suitable, error-free, or accepted by any employer, recruiter, school, platform, or applicant tracking system.",
      "You are responsible for professional judgment, review, compliance, and final decisions about any resume, application, portfolio, job tracker entry, generated document, or career action.",
    ],
  },
  {
    title: "18. Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, ResumeAssist AI and its owners, employees, contractors, affiliates, licensors, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, punitive, or enhanced damages, including lost profits, lost revenue, lost opportunities, lost job prospects, lost data, business interruption, reputational harm, or cost of substitute services.",
      "To the fullest extent permitted by law, ResumeAssist AI's total liability for all claims arising from or related to the services or these Terms will not exceed the greater of the amount you paid to ResumeAssist AI for the services giving rise to the claim during the three months before the claim arose or INR 5,000.",
      "Some jurisdictions do not allow certain limitations of liability. In those jurisdictions, our liability is limited to the maximum extent permitted by law.",
    ],
  },
  {
    title: "19. Indemnity",
    body: [
      "You agree to defend, indemnify, and hold harmless ResumeAssist AI and its owners, employees, contractors, affiliates, licensors, and service providers from and against claims, liabilities, damages, losses, costs, and expenses, including reasonable legal fees, arising from or related to your use of the services, User Content, violation of these Terms, violation of law, infringement of rights, public portfolio content, payment disputes, or misuse of AI output.",
      "We reserve the right to control the defense of any matter subject to indemnification, and you agree to cooperate with our defense of those claims.",
    ],
  },
  {
    title: "20. Governing Law and Disputes",
    body: [
      "These Terms are governed by the laws of India, without regard to conflict of law principles, unless mandatory law in your jurisdiction requires otherwise.",
      "You agree that courts located in India will have jurisdiction over disputes arising from or related to these Terms or the services, unless applicable law requires a different forum.",
      "Before bringing a formal claim, you agree to first contact us at support@resumeassist.ai and attempt to resolve the dispute informally. We will also try to resolve disputes with you in good faith.",
      "Nothing in these Terms prevents either party from seeking urgent injunctive or equitable relief for misuse of intellectual property, confidentiality breaches, security threats, or unauthorized access.",
    ],
  },
  {
    title: "21. Changes to These Terms",
    body: [
      "We may update these Terms from time to time to reflect service changes, legal requirements, business practices, new features, or risk controls.",
      "When we update these Terms, we will revise the \"Last updated\" date. If changes are material, we may provide additional notice through the website, account notices, email, or other reasonable means.",
      "Your continued use of ResumeAssist AI after updated Terms become effective means you accept the updated Terms. If you do not agree, you must stop using the services.",
    ],
  },
  {
    title: "22. General Terms",
    body: [
      "These Terms, together with the Privacy Policy and any checkout, plan, or feature-specific terms, form the entire agreement between you and ResumeAssist AI regarding the services.",
      "If any provision is found unenforceable, the remaining provisions will remain in effect, and the unenforceable provision will be interpreted to the maximum extent permitted by law.",
      "Our failure to enforce any provision is not a waiver of our right to enforce it later. You may not assign these Terms without our consent. We may assign these Terms in connection with a merger, acquisition, financing, restructuring, sale of assets, or operation of law.",
      "Headings are for convenience only. The words \"including\" and \"such as\" mean \"including without limitation.\"",
    ],
  },
  {
    title: "23. Contact",
    body: [
      "For questions about these Terms, account issues, billing concerns, takedown requests, or legal notices, contact ResumeAssist AI at support@resumeassist.ai.",
      "Please include your name, account email, request type, and enough information for us to understand and respond to your request.",
    ],
  },
];

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              These terms govern access to ResumeAssist AI's resume builder,
              ATS optimizer, AI tools, templates, public portfolios, job
              tracker, account features, payments, and downloads.
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
                <Scale className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Binding agreement
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Using the service, creating an account, uploading content,
                    publishing a portfolio, or paying for features means you
                    agree to these terms.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border border-slate-200 bg-white/95 p-4">
                <AlertTriangle className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    No outcome guarantee
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    We do not guarantee interviews, job offers, ATS acceptance,
                    recruiter responses, or employment outcomes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border border-slate-200 bg-white/95 p-4">
                <Globe2 className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Public content
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Portfolio pages and public profile content may be visible,
                    indexed, copied, saved, and shared outside the platform.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border border-slate-200 bg-white/95 p-4">
                <Ban className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Misuse prohibited
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Do not scrape, attack, reverse engineer, overload, resell,
                    or use the platform to create deceptive career materials.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 border border-slate-200 bg-white/95 p-4 text-sm font-medium text-slate-700">
                <FileText className="h-5 w-5 text-teal-700" />
                Resume and document tools
              </div>
              <div className="flex items-center gap-3 border border-slate-200 bg-white/95 p-4 text-sm font-medium text-slate-700">
                <BriefcaseBusiness className="h-5 w-5 text-teal-700" />
                Job tracker workflows
              </div>
              <div className="flex items-center gap-3 border border-slate-200 bg-white/95 p-4 text-sm font-medium text-slate-700">
                <Download className="h-5 w-5 text-teal-700" />
                PDF and DOCX downloads
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
                    Terms Contact
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    For questions about these terms, billing, account access, or
                    legal notices, email support@jobflix.in
                  </p>
                </div>
                <Link
                  href="mailto:support@resumeassist.ai"
                  className="inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
                >
                  Email Support
                </Link>
              </div>
            </section>

            <p className="text-xs leading-6 text-slate-500">
              These Terms are drafted for product readiness and should be
              reviewed against ResumeAssist AI's final legal entity, pricing
              model, refund policy, vendor contracts, and operating
              jurisdictions before publication.
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
