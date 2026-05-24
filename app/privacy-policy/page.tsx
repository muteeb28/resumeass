import Link from "next/link";
import {
  Bot,
  BriefcaseBusiness,
  Cookie,
  CreditCard,
  FileText,
  Globe2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { BackgroundRippleLayout } from "@/components/background-ripple-layout";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Privacy Policy | ResumeAssist AI",
  description:
    "How ResumeAssist AI collects, uses, protects, shares, and retains personal information.",
};

const lastUpdated = "May 24, 2026";

const summaryItems = [
  {
    icon: FileText,
    title: "Resume data",
    text: "We process resumes, job descriptions, portfolio content, and related career information to provide resume building, ATS optimization, portfolio, and job tracking features.",
  },
  {
    icon: Bot,
    title: "AI processing",
    text: "Resume and career content may be sent to trusted AI providers and backend services only to deliver requested analysis, extraction, generation, and optimization features.",
  },
  {
    icon: CreditCard,
    title: "Payments",
    text: "Payment details are handled by payment processors. ResumeAssist AI does not store full card, UPI, net banking, or wallet credentials.",
  },
  {
    icon: ShieldCheck,
    title: "Your controls",
    text: "You can request access, correction, export, deletion, consent withdrawal, or account closure by contacting us.",
  },
];

const sections = [
  {
    title: "1. Introduction",
    body: [
      "This Privacy Policy explains how ResumeAssist AI collects, uses, discloses, retains, and protects personal information when you access or use our website, web application, resume tools, ATS optimization tools, portfolio publishing features, job tracker, account services, support channels, payment flows, APIs, and related services.",
      "By using ResumeAssist AI, you acknowledge that we will process your information as described in this Privacy Policy. If you do not agree with this Privacy Policy, please do not use the services.",
      "For purposes of this policy, ResumeAssist AI is referred to as \"ResumeAssist AI,\" \"we,\" \"us,\" or \"our.\" Users, visitors, account holders, and customers are referred to as \"you\" or \"your.\"",
    ],
  },
  {
    title: "2. Information We Collect",
    body: [
      "Account information: name, email address, password or authentication credentials, profile information, account preferences, subscription status, purchase history, and user identifiers.",
      "Resume and career information: resumes, CVs, cover letters, uploaded files, pasted resume text, parsed resume data, education, work history, skills, certifications, projects, portfolio content, usernames or public portfolio slugs, job descriptions, target roles, ATS analysis results, optimization outputs, generated resume content, and downloadable document metadata.",
      "Job tracker information: jobs you save or track, application status, company names, roles, locations, notes, dates, and related workflow information you choose to enter.",
      "Contact and support information: messages submitted through contact forms, support requests, subject selections, attachments, email communications, feedback, bug reports, and records of our responses.",
      "Payment and billing information: order identifiers, transaction status, invoices, plan details, payment confirmation data, billing contact information, and limited payment metadata received from payment processors such as Razorpay, Cashfree, banks, card networks, UPI providers, wallet providers, or similar processors. We do not store full payment instrument credentials.",
      "Technical and usage information: IP address, device type, browser type, operating system, pages visited, referring URLs, session information, approximate location derived from IP address, feature usage, timestamps, logs, crash data, performance data, and security events.",
      "Cookies and local storage information: authentication state, preferences, session cookies, device identifiers, and similar technologies used to keep you signed in, remember settings, protect the service, measure performance, and improve the product.",
      "Information from third parties: authentication providers, payment processors, analytics or infrastructure providers, AI service providers, public job sources, portfolio viewers, and integrations you authorize may provide information needed to operate the service.",
    ],
  },
  {
    title: "3. Sensitive Information and Resume Content",
    body: [
      "Resumes and career documents may contain sensitive personal information, including contact details, employment history, education history, identification details, compensation expectations, immigration or work authorization information, demographic information, photographs, portfolio links, and other information you choose to include.",
      "Please avoid uploading information that is not necessary for resume, portfolio, ATS, job tracking, or related career purposes. You are responsible for ensuring that the information you upload or publish is accurate and that you have permission to share it.",
      "We do not intentionally request government identification numbers, financial account passwords, health records, biometric identifiers, or other highly sensitive information unless a feature clearly requires it. If such information is included in a resume or uploaded file, it may be processed as part of the file unless you remove it first.",
    ],
  },
  {
    title: "4. How We Use Information",
    body: [
      "To provide and operate the service, including account creation, login, authentication, profile management, resume parsing, resume generation, ATS analysis, AI optimization, portfolio creation, public portfolio hosting, job tracker workflows, downloads, exports, and customer support.",
      "To process uploaded files, extract resume text, normalize resume sections, generate structured resume data, create job-specific resumes, polish content, generate PDF or DOCX files, and display or publish portfolio pages when requested.",
      "To process payments, verify transactions, manage subscriptions or paid access, prevent billing fraud, issue receipts, and handle refunds or disputes where applicable.",
      "To personalize and improve the service, including remembering preferences, debugging product issues, measuring feature usage, improving templates, enhancing AI prompts and workflows, and developing new features.",
      "To communicate with you about your account, service notices, transactions, security alerts, support replies, policy updates, product changes, and, where permitted, marketing or educational content.",
      "To protect ResumeAssist AI, users, and the public from fraud, spam, abuse, unauthorized access, service misuse, security threats, illegal activity, and violations of our terms.",
      "To comply with legal obligations, enforce agreements, respond to lawful requests, establish or defend legal claims, and maintain business records.",
    ],
  },
  {
    title: "5. AI Processing and Automated Features",
    body: [
      "ResumeAssist AI uses artificial intelligence and automated processing to extract text from resumes, analyze ATS compatibility, suggest improvements, generate resume content, polish language, tailor resumes to job descriptions, and create portfolio-ready content.",
      "To provide these features, we may send resume content, job descriptions, prompts, structured resume data, and related metadata to AI infrastructure and model providers, including Google Gemini and other providers used by our backend services. These providers process information under their own security and data processing commitments.",
      "AI-generated output may be inaccurate, incomplete, or inappropriate for a particular job application. You should review all generated resumes, scores, recommendations, and portfolio content before using or publishing them.",
      "We do not use AI processing to make legally binding employment, credit, housing, insurance, or eligibility decisions about you. ResumeAssist AI provides drafting, analysis, optimization, and productivity assistance only.",
    ],
  },
  {
    title: "6. Legal Bases for Processing",
    body: [
      "Where applicable law requires a legal basis, we process your information to perform our contract with you, to provide requested services, to take steps before entering into a contract, and to operate account and payment features.",
      "We process information based on legitimate interests, such as securing the service, preventing fraud, improving performance, understanding usage, responding to support requests, maintaining records, and developing product features, provided those interests are not overridden by your rights.",
      "We process information with consent where required, including certain cookies, marketing communications, optional uploads, optional public portfolio publishing, and other consent-based features. You may withdraw consent where applicable.",
      "We process information when necessary to comply with legal obligations, tax obligations, payment rules, lawful requests, dispute resolution requirements, and regulatory duties.",
    ],
  },
  {
    title: "7. How We Share Information",
    body: [
      "Service providers: hosting providers, database providers, cloud infrastructure, email delivery services, logging and monitoring vendors, analytics providers, customer support tools, AI providers, document generation services, and security vendors that help operate ResumeAssist AI.",
      "Payment processors: payment, banking, wallet, UPI, card network, fraud prevention, tax, accounting, and invoicing partners that process purchases or verify transactions.",
      "Public portfolio viewers: if you publish a portfolio or public profile, the information you choose to publish may be visible to anyone with access to the public URL and may be indexed, copied, saved, or shared by third parties.",
      "Authorized integrations and user direction: we share information when you direct us to do so, such as downloading files, publishing a portfolio, opening external links, or using an integration.",
      "Legal and safety disclosures: we may disclose information to comply with law, court orders, subpoenas, regulatory requests, legal process, law enforcement requests, or to protect rights, safety, security, and property.",
      "Business transfers: if ResumeAssist AI is involved in a merger, acquisition, financing, restructuring, bankruptcy, sale of assets, or similar transaction, information may be transferred as part of that transaction subject to appropriate protections.",
      "We do not sell your resume content. We do not share full payment credentials because we do not receive or store them.",
    ],
  },
  {
    title: "8. Public Portfolios and User-Generated Content",
    body: [
      "ResumeAssist AI may allow you to create, save, publish, and share portfolio pages or public profile pages. Published content may include your name, role, biography, work history, education, skills, projects, links, contact information, images, and other details you choose to publish.",
      "You are responsible for reviewing public portfolio content before publishing. Do not publish confidential employer information, third-party personal information, private documents, or information you do not want public.",
      "If you delete or unpublish a portfolio, we will remove it from active public display in our service, but cached copies, search engine indexes, browser caches, screenshots, archived pages, or copies made by third parties may persist outside our control.",
    ],
  },
  {
    title: "9. Cookies and Similar Technologies",
    body: [
      "We use cookies, local storage, session storage, and similar technologies for authentication, account persistence, security, preferences, debugging, analytics, performance measurement, and product improvement.",
      "Some cookies are necessary for the service to function, such as keeping you signed in and protecting sessions. Other cookies or analytics technologies may be optional depending on your region and browser settings.",
      "You can control cookies through your browser settings. Blocking necessary cookies may prevent login, resume editing, checkout, account management, or other features from working correctly.",
      "ResumeAssist AI does not currently commit to responding to browser Do Not Track signals because there is no consistent industry standard for those signals.",
    ],
  },
  {
    title: "10. Data Retention",
    body: [
      "We retain personal information for as long as reasonably necessary to provide the service, maintain your account, operate product features, comply with legal obligations, resolve disputes, enforce agreements, prevent fraud, and maintain security.",
      "Account information is generally retained while your account remains active. Resume files, parsed data, generated content, portfolio data, and job tracker entries may be retained until you delete them, close your account, or request deletion, subject to legal and operational limits.",
      "Payment and billing records may be retained for tax, accounting, audit, fraud prevention, and legal compliance periods. Logs and security records may be retained for a limited period to protect the service and investigate issues.",
      "Backup copies may persist for a limited time after deletion until overwritten through normal backup cycles. We may retain anonymized or aggregated information that no longer identifies you.",
    ],
  },
  {
    title: "11. Security",
    body: [
      "We use reasonable administrative, technical, and organizational safeguards designed to protect personal information against unauthorized access, loss, misuse, alteration, and disclosure.",
      "Security measures may include access controls, authentication, encrypted transport, provider security controls, logging, monitoring, credential protection, least-privilege practices, and separation of production systems where appropriate.",
      "No website, internet transmission, cloud service, AI workflow, or storage system can be guaranteed to be completely secure. You should use a strong password, protect your devices, sign out of shared devices, and avoid uploading unnecessary sensitive information.",
    ],
  },
  {
    title: "12. International Transfers",
    body: [
      "ResumeAssist AI may process and store information in countries other than your country of residence, including locations where our hosting, AI, infrastructure, support, payment, and security providers operate.",
      "Where required, we rely on appropriate transfer mechanisms, contractual protections, provider safeguards, consent, or other lawful bases for cross-border transfers.",
    ],
  },
  {
    title: "13. Your Privacy Rights",
    body: [
      "Depending on your location, you may have rights to access, confirm processing, correct, update, delete, export, restrict, object to processing, withdraw consent, opt out of certain uses, close your account, or lodge a complaint with a data protection authority.",
      "Residents of India may have rights under the Digital Personal Data Protection Act, 2023, including the right to access information about processing, correction, erasure, grievance redressal, and nomination where applicable.",
      "Residents of the European Economic Area, United Kingdom, and similar jurisdictions may have GDPR-style rights, including access, rectification, erasure, restriction, portability, objection, and withdrawal of consent.",
      "Residents of California and other U.S. states with privacy laws may have rights to know, access, delete, correct, port, and opt out of certain sharing, targeted advertising, or sale of personal information where applicable. We do not sell your personal information as the term is commonly understood.",
      "To exercise rights, contact us at support@resumeassist.ai. We may need to verify your identity before fulfilling a request. We may decline or limit requests where permitted by law, such as when retention is required for security, fraud prevention, legal compliance, disputes, or another lawful reason.",
    ],
  },
  {
    title: "14. Marketing Communications",
    body: [
      "We may send product updates, educational content, promotional messages, or service announcements where permitted by law. You can opt out of marketing emails by using the unsubscribe link where provided or contacting us.",
      "Even if you opt out of marketing, we may still send non-marketing communications, such as account notices, payment confirmations, security alerts, support responses, and policy updates.",
    ],
  },
  {
    title: "15. Children",
    body: [
      "ResumeAssist AI is intended for users who are old enough to manage career documents and enter into binding agreements under applicable law. We do not knowingly collect personal information from children under 13 or the minimum age required by local law.",
      "If you believe a child has provided personal information without appropriate consent, contact us and we will take reasonable steps to delete the information where required.",
    ],
  },
  {
    title: "16. Third-Party Links and Services",
    body: [
      "The service may link to third-party websites, courses, job postings, employers, payment pages, portfolio links, social platforms, or other external services. Their privacy practices are governed by their own policies, not this Privacy Policy.",
      "We are not responsible for the privacy, security, accuracy, or content of third-party services that we do not control.",
    ],
  },
  {
    title: "17. Enterprise, Employer, and Shared Use",
    body: [
      "If you use ResumeAssist AI through an organization, employer, educational institution, partner, or administrator-managed account, that organization may have access to certain account, usage, billing, or content information according to the arrangement in place.",
      "If you upload or process another person's resume or personal information, you must have the authority or consent required to do so and must comply with applicable privacy, employment, and data protection laws.",
    ],
  },
  {
    title: "18. Changes to This Privacy Policy",
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in our services, technology, legal requirements, or business practices.",
      "When we update the policy, we will revise the \"Last updated\" date. If changes are material, we may provide additional notice, such as through the website, account notices, or email where appropriate.",
      "Your continued use of ResumeAssist AI after an updated Privacy Policy becomes effective means you acknowledge the updated policy.",
    ],
  },
  {
    title: "19. Contact Us and Grievance Requests",
    body: [
      "For privacy questions, rights requests, deletion requests, consent withdrawal, account closure, or grievance redressal, contact ResumeAssist AI at support@resumeassist.ai.",
      "Please include your name, account email, request type, and enough detail for us to understand and verify your request. Do not include sensitive documents in an email unless necessary for your request.",
    ],
  },
];

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              This policy explains how we handle personal information across our
              resume builder, ATS optimizer, AI tools, portfolio features, job
              tracker, payments, and support channels.
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
                <LockKeyhole className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Security-minded processing
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    We limit access to personal information to people and
                    providers who need it to operate, secure, and support the
                    service.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border border-slate-200 bg-white/95 p-4">
                <Cookie className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Cookies and storage
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    We use cookies and browser storage for login, preferences,
                    security, performance, and product improvement.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border border-slate-200 bg-white/95 p-4">
                <Globe2 className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Public publishing
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Portfolio pages you publish may be visible to anyone with
                    the link and may be indexed by search engines.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 border border-slate-200 bg-white/95 p-4">
                <BriefcaseBusiness className="mt-1 h-5 w-5 flex-none text-teal-700" />
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">
                    Career-focused use
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    We use your career content to provide resume, ATS,
                    portfolio, job tracker, and account features.
                  </p>
                </div>
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
                    Privacy Contact
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    For privacy requests, account deletion, or consent
                    withdrawal, email support@jobflix.in
                  </p>
                </div>
                <Link
                  href="mailto:support@resumeassist.ai"
                  className="inline-flex items-center justify-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
                >
                  Email Privacy Team
                </Link>
              </div>
            </section>

            <p className="text-xs leading-6 text-slate-500">
              This Privacy Policy is provided for transparency and general
              compliance readiness. It should be reviewed against ResumeAssist
              AI's final legal entity details, hosting stack, vendor contracts,
              and operating jurisdictions before publication.
            </p>
          </div>
        </section>
      </main>
    </BackgroundRippleLayout>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
