"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

type RippleTone = "dark" | "light";

const toneClasses: Record<RippleTone, string> = {
  dark: "bg-neutral-950 text-white dark",
  light: "bg-neutral-50 text-slate-900"
};

export const BackgroundRippleLayout = ({
  children,
  className,
  contentClassName,
  tone = "dark",
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  tone?: RippleTone;
}) => {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        toneClasses[tone],
        className
      )}
    >
      <div className="absolute inset-0 z-0">
        <BackgroundRippleEffect />
      </div>
      <div className={cn("relative z-10 w-full", contentClassName)}>
        {children}
      </div>
    </div>
  );
};
