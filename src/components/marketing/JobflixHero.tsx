// src/components/marketing/JobflixHero.tsx
/**
 * JobFlix Marketing — Hero.
 * Reverse-engineered against Clay's composition (see
 * docs/superpowers/specs/2026-07-12-hero-navbar-clay-composition-design.md):
 * same eyebrow/headline/subhead/CTA/trust-line content as before, now on
 * ResumeAssist's light canvas. Right column is a temporary placeholder —
 * HeroCardCluster lands in Milestone 3.
 */
import { ArrowRight } from "lucide-react";
import { Container, MonoLabel, Button, LogoStrip } from "./primitives";

const hiredAt = ["Google", "Stripe", "Airbnb", "Figma", "Notion", "Spotify"];

export function JobflixHero() {
  return (
    <section className="relative overflow-hidden bg-surface-alt pt-[72px] pb-[var(--jf-space-hero-pad-bottom)]">
      <Container width="wide">
        <div className="grid items-start gap-[var(--jf-gap-hero)] lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left — proof-anchored copy, unchanged content */}
          <div className="max-w-lg">
            <MonoLabel tone="accent">Career Operating System</MonoLabel>

            <h1 className="mt-[26px] text-[2.75rem] font-medium leading-[0.94] tracking-[-0.032em] text-ink-900 sm:text-[3.75rem] lg:text-[5rem]">
              Where recruiters start replying
            </h1>

            <p className="mt-[26px] max-w-[480px] text-xl leading-[1.5] text-ink-600">
              The interviews you&rsquo;ve been chasing. The companies you thought
              wouldn&rsquo;t look twice. Every move you make here brings that offer
              closer — until it&rsquo;s real.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button href="/create" size="lg">
                Create Resume
                <ArrowRight size={18} />
              </Button>
              <Button href="/optimize" variant="ghost" size="lg" className="text-ink-700 hover:bg-surface-alt">
                Optimize Resume
              </Button>
            </div>

            <p className="mt-6 font-mono-data text-[13.5px] text-ink-500">
              Free to start · No credit card required
            </p>
          </div>

          {/* Right — TEMPORARY placeholder. Milestone 3 replaces this div
              with <HeroCardCluster />. Deliberately obvious/dashed so it
              reads as unfinished, not as a design decision. */}
          <div className="flex h-[560px] items-center justify-center rounded-[var(--jf-radius-frame)] border border-dashed border-border-frame text-sm text-ink-400">
            HeroCardCluster — Milestone 3
          </div>
        </div>

        <div className="mt-[var(--jf-space-section-tight)] border-t border-border-soft pt-8">
          <p className="text-[15px] font-semibold text-ink-900">
            JobFlix members have been hired at ↘
          </p>
          <LogoStrip names={hiredAt} tone="light" spread className="mt-6" />
        </div>
      </Container>
    </section>
  );
}
