"use client";
import React from "react";
import { cn } from "../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group",
          {
            // Primary white button with premium glow effect
            "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:bg-slate-100 transform hover:-translate-y-0.5 active:scale-95 transition-all duration-300":
              variant === "default",
            // Outline button with white border and hover state
            "border-2 border-white/20 bg-transparent text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]":
              variant === "outline",
            // Ghost button for a clean look
            "text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-300":
              variant === "ghost",
            // Secondary button for contrast
            "bg-white/10 text-white hover:bg-white/20 border border-white/10 backdrop-blur-md transition-all duration-300":
              variant === "secondary",
          },
          {
            "h-9 px-4 text-sm rounded-lg": size === "sm",
            "h-11 px-6 text-base rounded-xl": size === "md",
            "h-14 px-8 text-lg rounded-xl": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{props.children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";