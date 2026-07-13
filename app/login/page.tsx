"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const services = [
    {
      id: "01",
      title: "Resume Optimization & Custom Templating",
      desc: "ATS-proof engineering with modern professional structures.",
      badge: "AI Powered",
      color: "bg-[#2F7BE0]",
    },
    {
      id: "02",
      title: "Job Posting & Referrals",
      desc: "Direct corporate pipeline and internal employee matching.",
      badge: "Direct Access",
      color: "bg-[#0FA573]",
    },
    {
      id: "03",
      title: "Premium Mentorship",
      desc: "Long-term guidance from industry leaders and tech executives.",
      badge: "1-on-1 Growth",
      color: "bg-[#C77414]",
    },
    {
      id: "04",
      title: "1:1 Live Consulting Sessions",
      desc: "Instant on-demand strategy booking and interview preparation.",
      badge: "Instant Booking",
      color: "bg-[#2FA1DC]",
    },
  ];

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#ffffff] text-[#0B2A3C] font-sans antialiased overflow-hidden">
      
      {/* LEFT SIDE: The Login Box Container (Takes up 5 columns) */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-10 md:p-16 relative z-10">
        
        {/* Decorative background glow behind the login box */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[60%] bg-gradient-to-tr from-[#CFE0FB]/20 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* LOGIN BOX */}
        <div className="w-full max-w-md group/box relative bg-[#ffffff] border border-[#EEF2F1] rounded-2xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(11,42,60,0.04)] hover:shadow-[0_20px_50px_rgba(47,123,224,0.08)] transition-all duration-500 ease-out hover:-translate-y-1">
          
          {/* Accent top border highlight */}
          <div className="absolute top-0 left-6 right-6 h-[3px] bg-gradient-to-r from-[#2F7BE0] via-[#1D5FD8] to-[#2F7BE0] rounded-b-full transform scale-x-[0.3] group-hover/box:scale-x-100 transition-transform duration-500 ease-out" />

          {/* Header */}
          <div className="space-y-2 mb-8">
            <div className="flex items-center gap-2.5 font-bold text-lg text-[#0B2A3C]">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#2F7BE0] to-[#1D5FD8] flex items-center justify-center shadow-md shadow-[#2F7BE0]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </div>
              <span className="tracking-tight font-extrabold bg-gradient-to-r from-[#0B2A3C] to-[#24455B] bg-clip-text text-transparent">jobflix</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#0B2A3C] pt-4">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-[#647B8E]">
              Securely sign into your executive workspace.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5 group">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#647B8E] group-focus-within:text-[#2F7BE0] transition-colors">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                className="border-[#EEF2F1] bg-[#ffffff] focus-visible:ring-2 focus-visible:ring-[#2F7BE0] focus-visible:border-transparent h-11 transition-all rounded-xl placeholder:text-[#647B8E]/50"
              />
            </div>
            
            <div className="space-y-1.5 group">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#647B8E] group-focus-within:text-[#2F7BE0] transition-colors">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#2F7BE0] hover:text-[#1D5FD8] transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="border-[#EEF2F1] bg-[#ffffff] focus-visible:ring-2 focus-visible:ring-[#2F7BE0] focus-visible:border-transparent h-11 transition-all rounded-xl placeholder:text-[#647B8E]/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-[#2F7BE0] hover:bg-[#1D5FD8] text-[#ffffff] font-semibold transition-all duration-300 rounded-xl shadow-lg shadow-[#2F7BE0]/15 hover:shadow-[#1D5FD8]/20 hover:scale-[1.01] active:scale-[0.99] mt-2"
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#EEF2F1]" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#ffffff] px-3 text-[#647B8E]/60 font-medium tracking-widest">or</span></div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs sm:text-sm text-[#647B8E]">
            New to our platform?{" "}
            <Link href="/register" className="text-[#2F7BE0] font-bold hover:text-[#1D5FD8] underline decoration-2 decoration-[#CFE0FB] hover:decoration-[#2F7BE0] transition-all">
              Create free account
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Animated Pure CSS Service Architecture Suite */}
      <div className="hidden lg:flex lg:col-span-7 relative overflow-hidden bg-gradient-to-br from-[#F5F8F7] via-[#EAF0EF] to-[#CFE0FB]/40 items-center justify-center p-12 border-l border-[#EEF2F1]">
        
        {/* Grid pattern backing */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#EAF0EF_1px,transparent_1px),linear-gradient(to_bottom,#EAF0EF_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Ambient blur blobs */}
        <div className="absolute top-12 right-12 w-96 h-96 bg-[#CFE0FB]/60 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 bg-[#2FA1DC]/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

        {/* ECOSYSTEM HOVER HUB */}
        <div className="relative w-full max-w-xl bg-[#ffffff]/80 backdrop-blur-md rounded-2xl shadow-[0_30px_60px_rgba(11,42,60,0.06)] border border-[#ffffff] p-6 space-y-6 animate-float">
          
          {/* Top Panel Bar */}
          <div className="flex items-center justify-between border-b border-[#EEF2F1] pb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F7BE0] animate-pulse" />
              <span className="text-xs font-bold tracking-wider text-[#0B2A3C] uppercase">
                jobflix platform ecosystem
              </span>
            </div>
            <div className="text-[10px] font-mono font-semibold tracking-wider text-[#647B8E] bg-[#EAF0EF] px-2.5 py-1 rounded-md">
              SYSTEM_ACTIVE
            </div>
          </div>
          
          {/* Services Stack Wrapper */}
          <div className="space-y-3.5">
            {services.map((svc, idx) => (
              <div 
                key={svc.id} 
                className="group/item relative bg-[#ffffff] border border-[#EEF2F1] rounded-xl p-4 transition-all duration-300 hover:border-[#2F7BE0]/40 hover:shadow-[0_10px_25px_rgba(11,42,60,0.03)] hover:translate-x-1 overflow-hidden"
              >
                {/* Horizontal progress accent line on bottom card hover */}
                <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#2F7BE0] to-[#2FA1DC] w-0 group-hover/item:w-full transition-all duration-500 ease-out" />
                
                <div className="flex items-start gap-3.5">
                  {/* Icon Block Indicator */}
                  <div className={`mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold text-white shadow-inner ${svc.color} bg-opacity-90 group-hover/item:scale-105 transition-transform`}>
                    {svc.id}
                  </div>
                  
                  {/* Text Details */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-[#0B2A3C] group-hover/item:text-[#2F7BE0] transition-colors truncate">
                        {svc.title}
                      </h4>
                      <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 bg-[#F5F8F7] text-[#647B8E] border border-[#EEF2F1] rounded-md group-hover/item:border-[#CFE0FB] group-hover/item:bg-[#CFE0FB]/30 group-hover/item:text-[#163F8C] transition-all">
                        {svc.badge}
                      </span>
                    </div>
                    <p className="text-xs text-[#647B8E] leading-relaxed">
                      {svc.desc}
                    </p>
                  </div>
                </div>

                {/* Subtle embedded status simulation loading bar */}
                <div className="mt-2.5 h-[3px] bg-[#F5F8F7] rounded-full w-full relative overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 ${svc.color} rounded-full animate-slideRight`}
                    style={{ animationDelay: `${idx * 200}ms` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Platform Footer Counter */}
          <div className="pt-2 flex items-center justify-between text-[11px] text-[#647B8E] font-medium border-t border-[#EEF2F1]">
            <span>Continuous Automation Suite</span>
            <span className="text-[#0FA573] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0FA573] animate-ping" />
              All Pipelines Synchronized
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}