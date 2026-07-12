"use client";

import { Navbar } from "./navbar";
import { BackgroundRippleLayout } from "./background-ripple-layout";
import { JobflixHero } from "./marketing/JobflixHero";
import { Container, SectionHeader, Stat, Button } from "./marketing/primitives";
import { FeatureRow } from "./marketing/FeatureRow";
import { TestimonialQuote } from "./marketing/TestimonialQuote";
import { Footer } from "./marketing/Footer";
import { ResumeATSPanel } from "./marketing/panels/ResumeATSPanel";
import { JobsReferralsPanel } from "./marketing/panels/JobsReferralsPanel";
import { InterviewPrepPanel } from "./marketing/panels/InterviewPrepPanel";
import { CareerTrackerPanel } from "./marketing/panels/CareerTrackerPanel";

const stats = [
  { value: "3×", label: "more recruiter callbacks with an ATS-optimized resume" },
  { value: "92", label: "average resume readiness score after one pass" },
  { value: "2.4k", label: "warm referral paths unlocked each week" },
  { value: "21 days", label: "median time from first match to offer" },
];

export function AnimatedPinDemo() {
  return (
    <BackgroundRippleLayout tone="dark">
      <Navbar tone="light" />

      {/* Onest applies to the whole migrated marketing body (not Navbar,
          which stays out of font-migration scope until its own sprint). */}
      <div>
      <JobflixHero />

      {/* Why JobFlix */}
      <section className="bg-page py-[var(--jf-space-section)]" id="features">
        <Container width="prose">
          <SectionHeader
            align="center"
            eyebrow="Why JobFlix"
            heading="A job search is not a to-do list. It's a system — and most people are running it by hand."
            intro="JobFlix connects every moving part — resume, portfolio, applications, referrals, interview prep — into one operating system, so progress compounds instead of scattering across a dozen tabs."
          />
        </Container>
      </section>

      <FeatureRow
        eyebrow="Resume & ATS"
        heading="A resume that clears the filter, every time"
        copy="JobFlix scores your resume against the exact job description, then rewrites the weak lines — so a human actually sees it."
        checklist={[
          "Real-time ATS match scoring",
          "AI rewrites with quantified impact",
          "Tailored per application, in one click",
        ]}
        linkHref="/optimize"
        linkLabel="Explore the resume builder"
        panel={<ResumeATSPanel />}
      />

      <FeatureRow
        reverse
        eyebrow="Jobs & Referrals"
        heading="Discover roles — and the people who can vouch for you"
        copy="Matches ranked by fit, each surfacing the warm referral paths hidden in your extended network."
        checklist={[
          "Fit-ranked role discovery",
          "Warm intro paths from the JobFlix network",
          "One-tap referral requests",
        ]}
        linkHref="/find-jobs"
        linkLabel="See job discovery"
        panel={<JobsReferralsPanel />}
      />

      <FeatureRow
        eyebrow="Interview Prep"
        heading="Rehearse the hard rounds before they count"
        copy="Mock interviews and coding practice with an AI that probes like a senior interviewer and tells you exactly where you fell short."
        checklist={[
          "Role-specific mock interviews",
          "Live coding practice with hints",
          "Actionable feedback after every round",
        ]}
        linkHref="/interview-questions"
        linkLabel="Practice an interview"
        panel={<InterviewPrepPanel />}
      />

      <FeatureRow
        reverse
        eyebrow="Career Tracker"
        heading="Every application, in one calm view"
        copy="A single board tracks every role, stage, and follow-up — so nothing slips and momentum stays visible."
        checklist={[
          "Kanban stages from applied to offer",
          "Automatic follow-up reminders",
          "Progress you can actually measure",
        ]}
        linkHref="/job-tracker"
        linkLabel="Open the tracker"
        panel={<CareerTrackerPanel />}
      />

      {/* Stats band */}
      <section className="bg-surface-alt py-[var(--jf-space-section)]">
        <Container width="content">
          <h3 className="text-center text-2xl font-medium tracking-[-0.018em] text-ink-900 sm:text-3xl">
            Measurable momentum, not busywork
          </h3>
          <div className="mt-[var(--jf-gap-stats)] grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {stats.map((s) => (
              <Stat key={s.label} value={s.value} label={s.label} className="text-center" />
            ))}
          </div>
        </Container>
      </section>

      <TestimonialQuote
        eyebrow="From our members"
        quote="I went from rewriting my resume for every posting to running one system that told me exactly what to fix. Three weeks later I had two offers — one through a referral I didn't know I could reach."
        name="Elena Ramírez"
        role="Product Designer, hired at Stripe"
      />

      {/* Final CTA */}
      <section className="bg-navy-900 py-[var(--jf-space-section)] text-center">
        <Container width="prose">
          <h2 className="text-3xl font-medium tracking-[-0.025em] text-white sm:text-4xl">
            Your next role is a system away
          </h2>
          <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-dark-body">
            Bring your resume, or build one in minutes. JobFlix runs the
            system from there — every step, until it&rsquo;s real.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/create" size="lg">
              Create Resume
            </Button>
            <Button href="/optimize" variant="ghost" size="lg" className="text-white hover:bg-white/10">
              Optimize Resume
            </Button>
          </div>
        </Container>
      </section>

      <Footer />
      </div>
    </BackgroundRippleLayout>
  );
}
