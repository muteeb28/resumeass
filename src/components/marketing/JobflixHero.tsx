// src/components/marketing/JobflixHero.tsx
import { ArrowRight } from "lucide-react";
import { Container, MonoLabel, Button, LogoStrip } from "./primitives";
import { HeroCardCluster } from "./hero/HeroCardCluster";

const hiredAt = ["Google", "Stripe", "Airbnb", "Figma", "Notion", "Spotify"];

export function JobflixHero() {
  return (
    <section className="relative overflow-hidden bg-surface-alt pt-20 pb-6">
      <Container width="wide">
        <div className="grid items-start gap-[var(--jf-gap-hero)] lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left Column — content and CTA */}
          <div className="max-w-lg">
            <MonoLabel tone="accent">Career Operating System</MonoLabel>

            <h1 className="mt-6 text-[2.75rem] font-medium leading-[1.05] tracking-[-0.03em] text-ink-900 sm:text-[3.75rem] lg:text-[4.75rem]">
              Where recruiters start replying
            </h1>

            <p className="mt-6 max-w-[480px] text-lg leading-[1.5] text-ink-600">
              The interviews you&rsquo;ve been chasing. The companies you thought
              wouldn&rsquo;t look twice. Every move you make here brings that offer
              closer — until it&rsquo;s real.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="/find-jobs" size="lg" className="shadow-[var(--jf-shadow-panel)]">
                Apply to Jobs
                <ArrowRight size={18} />
              </Button>
              <Button href="/optimize" variant="ghost" size="lg" className="border border-border-frame text-ink-700 bg-page hover:bg-surface-alt">
                Optimize Resume
              </Button>
            </div>

            {/* Social Proof Metrics Band */}
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-ink-500">
              <div className="flex items-center gap-1">
                <span className="text-amber-500 text-sm leading-none">★★★★★</span>
                <span className="font-semibold text-ink-900">4.9 Rating</span>
              </div>
              <span className="text-ink-300 select-none">|</span>
              <span>4k+ successful candidates</span>
              <span className="text-ink-300 select-none">|</span>
              <span>100+ hiring partners</span>
            </div>
          </div>

          {/* Right Column — 3-card cluster visual */}
          <div className="relative w-full">
            <HeroCardCluster />
          </div>
        </div>

        {/* Trust section immediately below the content */}
        <div className="mt-10 border-t border-border-soft pt-6 pb-2">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-ink-400">
            JobFlix members have been hired at ↗
          </p>
          <LogoStrip names={hiredAt} tone="light" spread className="mt-4" />
        </div>
      </Container>
    </section>
  );
}
