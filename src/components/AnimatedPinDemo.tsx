"use client";

import { PinContainer } from "./3d-pin";
import { ResumeOptimizationDemo } from "./resume-demo";
import { Navbar } from "./navbar";
import { PaymentSection } from "./payment-section";
import { BackgroundRippleLayout } from "./background-ripple-layout";
import SidebarDemo from "./sidebar-demo";
import { HeroSection } from "./hero-section";



export function AnimatedPinDemo() {
  return (
    <BackgroundRippleLayout tone="dark">
      {/* Navigation */}
      <Navbar tone="light" />
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section id="features" className="py-20 px-4 scroll-mt-24 bg-neutral-50 text-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4">
              Keep every application organized
            </h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
              Track stages, and manage HR outreach from a single workspace.
            </p>
          </div>

          <SidebarDemo />
        </div>
      </section>

      <ResumeOptimizationDemo />

      {/* Payment Section with Lamp Effect */}
      <div id="pricing" className="relative z-10 isolate scroll-mt-24">
        <PaymentSection />
      </div>

      {/* CTA Section with 3D Pin */}
      <div className="bg-white py-20 px-4 text-neutral-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto">
            Join thousands of professionals who have successfully landed interviews with ResumeAssist AI
          </p>
        </div>

        <div className="flex justify-center">
          <PinContainer
            title="careerSprint"
            href="https://levelup-8csx.vercel.app/jobs"
            cardClassName="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-white/10"
          >
            <div className="flex w-[26rem] flex-col gap-4 p-6 text-slate-100 sm:w-[28rem]">
              <div>
                <h3 className="text-2xl font-semibold text-white">
                  Our Career, End-to-End
                </h3>
                <p className="mt-2 text-sm text-slate-200">
                  Everything you need to build, prepare, and execute your
                  career - inside careerSprint.
                </p>
              </div>
              <div className="space-y-2 text-sm text-slate-200">
                <div>Courses - Learn skills that matter</div>
                <div>Prepare - Interview and assessment prep</div>
                <div>Hackathons & Study Abroad - Real challenges, real exposure</div>
                <div>Jobs - Curated opportunities</div>
                <div>Mentors - Learn from people who&apos;ve done it</div>
                <div>Ask - Instant AI help</div>
              </div>
            </div>
          </PinContainer>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-12 px-4 text-neutral-600">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/logo.png"
              alt="ResumeAssist AI"
              className="h-40 w-auto object-contain"
            />
          </div>
          <p className="text-neutral-500 mb-8">
            The future of resume building is here
          </p>
          <div className="flex justify-center gap-8 text-neutral-500 text-sm">
            <a href="#" className="hover:text-neutral-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Support</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Contact</a>
          </div>
          <div className="mt-8 text-neutral-400 text-xs">
            © 2024 ResumeAssist AI. All rights reserved.
          </div>
        </div>
      </footer>
    </BackgroundRippleLayout>
  );
}
