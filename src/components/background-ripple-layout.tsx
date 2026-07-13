"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

type RippleTone = "dark" | "light";

const toneClasses: Record<RippleTone, string> = {
  dark: "bg-navy-900 text-white dark",
  light: "bg-page text-ink-900"
};

export const BackgroundRippleLayout = ({
  children,
  className,
  contentClassName,
  tone = "dark",
  showRipple = true,
}: {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  tone?: RippleTone;
  showRipple?: boolean;
}) => {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-hidden",
        toneClasses[tone],
        className
      )}
    >
      {showRipple && (
        <div className="absolute inset-0 z-0">
          <BackgroundRippleEffect />
        </div>
      )}
      <div className={cn("relative z-10 w-full", contentClassName)}>
        {children}
      </div>
    </div>
  );
};
