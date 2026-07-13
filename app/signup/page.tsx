"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function SignupPage() {
  const services = [
    { id: "01", title: "Resume Optimization & Custom Templating", color: "bg-[#2F7BE0]" },
    { id: "02", title: "Job Posting & Referrals", color: "bg-[#0FA573]" },
    { id: "03", title: "Premium Mentorship", color: "bg-[#C77414]" },
    { id: "04", title: "1:1 Live Consulting Sessions", color: "bg-[#2FA1DC]" },
  ];

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#ffffff] text-[#0B2A3C] font-sans antialiased overflow-hidden">
      
      {/* LEFT SIDE: The Signup Box Container (Takes up 5 columns) */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-10 md:p-16 relative z-10 overflow-y-auto max-h-screen mt-38">
        
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[60%] bg-gradient-to-tr from-[#CFE0FB]/20 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* SIGNUP ENHANCED BOX */}
        <div className="w-full max-w-md group/box relative bg-[#ffffff] border border-[#EEF2F1] rounded-2xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(11,42,60,0.04)] hover:shadow-[0_20px_50px_rgba(47,123,224,0.08)] transition-all duration-500 ease-out my-8">
          
          {/* Accent top border highlight */}
          <div className="absolute top-0 left-6 right-6 h-[3px] bg-gradient-to-r from-[#2F7BE0] via-[#1D5FD8] to-[#2F7BE0] rounded-b-full transform scale-x-[0.3] group-hover/box:scale-x-100 transition-transform duration-500 ease-out" />

          {/* Header */}
          <div className="space-y-1 mb-6">
            <div className="flex items-center gap-2.5 font-bold text-lg text-[#0B2A3C]">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#2F7BE0] to-[#1D5FD8] flex items-center justify-center shadow-md shadow-[#2F7BE0]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </div>
              <span className="tracking-tight font-extrabold bg-gradient-to-r from-[#0B2A3C] to-[#24455B] bg-clip-text text-transparent">jobflix</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#0B2A3C] pt-3">
              Create your account
            </h1>
            <p className="text-xs text-[#647B8E]">
              Join the ecosystem and fast-track your career.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            
            {/* Full Name */}
            <div className="space-y-1 group">
              <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-[#647B8E] group-focus-within:text-[#2F7BE0] transition-colors">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                required
                className="border-[#EEF2F1] bg-[#ffffff] focus-visible:ring-2 focus-visible:ring-[#2F7BE0] focus-visible:border-transparent h-10 transition-all rounded-xl placeholder:text-[#647B8E]/40"
              />
            </div>

            {/* Email */}
            <div className="space-y-1 group">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#647B8E] group-focus-within:text-[#2F7BE0] transition-colors">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                className="border-[#EEF2F1] bg-[#ffffff] focus-visible:ring-2 focus-visible:ring-[#2F7BE0] focus-visible:border-transparent h-10 transition-all rounded-xl placeholder:text-[#647B8E]/40"
              />
            </div>

            {/* Phone Number with Custom Country Prefix Dropdown Element */}
            <div className="space-y-1 group">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-[#647B8E] group-focus-within:text-[#2F7BE0] transition-colors">
                Phone Number
              </Label>
              <div className="relative flex items-center">
                <select 
                  className="absolute left-1 bg-[#F5F8F7] border border-transparent hover:border-[#EEF2F1] rounded-l-lg h-[34px] px-2 text-xs font-medium text-[#0B2A3C] focus:outline-none cursor-pointer z-10 transition-all"
                  defaultValue="+1"
                >
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1ca">🇨🇦 +1</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+65">🇸🇬 +65</option>
                </select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 000-000end"
                  required
                  className="pl-24 border-[#EEF2F1] bg-[#ffffff] focus-visible:ring-2 focus-visible:ring-[#2F7BE0] focus-visible:border-transparent h-10 transition-all rounded-xl placeholder:text-[#647B8E]/40 w-full"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1 group">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#647B8E] group-focus-within:text-[#2F7BE0] transition-colors">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="border-[#EEF2F1] bg-[#ffffff] focus-visible:ring-2 focus-visible:ring-[#2F7BE0] focus-visible:border-transparent h-10 transition-all rounded-xl placeholder:text-[#647B8E]/40"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 group">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-[#647B8E] group-focus-within:text-[#2F7BE0] transition-colors">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                className="border-[#EEF2F1] bg-[#ffffff] focus-visible:ring-2 focus-visible:ring-[#2F7BE0] focus-visible:border-transparent h-10 transition-all rounded-xl placeholder:text-[#647B8E]/40"
              />
            </div>

            {/* COMPLIANCE & CONSENT CHECKBOXES */}
            <div className="space-y-3 pt-2 text-xs">
              
              {/* Terms and Conditions Consent */}
              <div className="flex items-start gap-2.5">
                <Checkbox id="terms" required className="mt-0.5 border-[#EEF2F1] data-[state=checked]:bg-[#2F7BE0] data-[state=checked]:border-[#2F7BE0]" />
                <label htmlFor="terms" className="text-[#647B8E] font-medium leading-none cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms" className="text-[#2F7BE0] font-bold hover:underline">
                    Terms and Conditions
                  </Link>
                </label>
              </div>

              {/* Privacy Policy Consent */}
              <div className="flex items-start gap-2.5">
                <Checkbox id="privacy" required className="mt-0.5 border-[#EEF2F1] data-[state=checked]:bg-[#2F7BE0] data-[state=checked]:border-[#2F7BE0]" />
                <label htmlFor="privacy" className="text-[#647B8E] font-medium leading-none cursor-pointer">
                  I agree to the{" "}
                  <Link href="/privacy" className="text-[#2F7BE0] font-bold hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Phone Communications Consent */}
              <div className="flex items-start gap-2.5">
                <Checkbox id="phoneConsent" required className="mt-0.5 border-[#EEF2F1] data-[state=checked]:bg-[#2F7BE0] data-[state=checked]:border-[#2F7BE0]" />
                <label htmlFor="phoneConsent" className="text-[#647B8E] font-medium leading-tight cursor-pointer">
                  I consent to receive automated updates and transactional phone calls/SMS regarding my account status as detailed in our{" "}
                  <Link href="/phone-policy" className="text-[#2F7BE0] font-bold hover:underline">
                    Communication Guidelines
                  </Link>.
                </label>
              </div>

              {/* Marketing Communications Consent (OPTIONAL) */}
              <div className="flex items-start gap-2.5">
                <Checkbox id="marketing" className="mt-0.5 border-[#EEF2F1] data-[state=checked]:bg-[#2F7BE0] data-[state=checked]:border-[#2F7BE0]" />
                <label htmlFor="marketing" className="text-[#647B8E] font-medium leading-tight cursor-pointer selection:bg-transparent">
                  <span className="text-[#0B2A3C] font-semibold">[Optional]</span> I want to receive emails about platform insights, mentorship opportunities, and job matchmaking reports.
                </label>
              </div>

            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#2F7BE0] hover:bg-[#1D5FD8] text-[#ffffff] font-semibold transition-all duration-300 rounded-xl shadow-lg shadow-[#2F7BE0]/15 hover:shadow-[#1D5FD8]/20 hover:scale-[1.01] active:scale-[0.99] mt-4"
            >
              Create Account
            </Button>
            
            {/* CLOUDFLARE TURNSTILE NOTICE NOTE */}
            <div className="text-[10px] text-center text-[#647B8E]/70 leading-normal px-2 pt-1">
              By continuing, you agree and acknowledge that this interaction is secured by standard verification engines governed explicitly by the{" "}
              <Link href="https://www.cloudflare.com/privacypolicy/" target="_blank" className="underline hover:text-[#2F7BE0] transition-colors">
                Cloudflare Turnstile Policies
              </Link> 
              {" "}and privacy conditions.
            </div>
          </form>

          {/* Footer Navigation link */}
          <p className="text-center text-xs text-[#647B8E] mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-[#2F7BE0] font-bold hover:text-[#1D5FD8] underline decoration-2 decoration-[#CFE0FB] hover:decoration-[#2F7BE0] transition-all">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Dynamic Animated Platform Summary View */}
      <div className="hidden lg:flex lg:col-span-7 relative overflow-hidden bg-gradient-to-br from-[#F5F8F7] via-[#EAF0EF] to-[#CFE0FB]/40 items-center justify-center p-12 border-l border-[#EEF2F1]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#EAF0EF_1px,transparent_1px),linear-gradient(to_bottom,#EAF0EF_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute top-12 right-12 w-96 h-96 bg-[#CFE0FB]/60 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-[#2FA1DC]/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

        <div className="relative w-full max-w-xl bg-[#ffffff]/80 backdrop-blur-md rounded-2xl shadow-[0_30px_60px_rgba(11,42,60,0.06)] border border-[#ffffff] p-6 space-y-5 animate-float">
          <div className="flex items-center justify-between border-b border-[#EEF2F1] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F7BE0] animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-[#0B2A3C] uppercase">jobflix features onboarding</span>
            </div>
            <div className="text-[10px] font-mono font-semibold text-[#647B8E] bg-[#EAF0EF] px-2.5 py-0.5 rounded">SYSTEM_READY</div>
          </div>
          
          <div className="space-y-3">
            {services.map((svc, idx) => (
              <div key={svc.id} className="group/item relative bg-[#ffffff] border border-[#EEF2F1] rounded-xl p-3.5 transition-all duration-300 hover:border-[#2F7BE0]/40 hover:translate-x-1 overflow-hidden">
                <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#2F7BE0] to-[#2FA1DC] w-0 group-hover/item:w-full transition-all duration-500 ease-out" />
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold text-white ${svc.color}`}>{svc.id}</div>
                  <h4 className="text-xs font-bold text-[#0B2A3C] group-hover/item:text-[#2F7BE0] transition-colors">{svc.title}</h4>
                </div>
                <div className="mt-2 h-[2px] bg-[#F5F8F7] w-full relative overflow-hidden">
                  <div className={`absolute inset-y-0 left-0 ${svc.color} rounded-full animate-slideRight`} style={{ animationDelay: `${idx * 200}ms` }} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-1 flex items-center justify-between text-[10px] text-[#647B8E] border-t border-[#EEF2F1]">
            <span>Continuous Automation Suite</span>
            <span className="text-[#0FA573] flex items-center gap-1 font-bold">● Pipelines Synchronized</span>
          </div>
        </div>
      </div>

    </div>
  );
}