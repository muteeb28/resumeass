"use client";
import { cn } from "../lib/utils";

type SpotlightProps = {
  className?: string;
  fill?: string;
};

export const Spotlight = ({ className, fill }: SpotlightProps) => {
  return (
    <svg
      className={cn(
        "animate-pulse animate-duration-[3000ms] ease-linear absolute pointer-events-none opacity-0 animate-in fade-in duration-1000",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3584 2048"
      fill="none"
    >
      <defs>
        <linearGradient
          id="spotlightGradient"
          gradientUnits="userSpaceOnUse"
          x1="1792"
          y1="128"
          x2="1792"
          y2="1920"
        >
          <stop stopColor={fill || "#3b82f6"} stopOpacity="0.6" />
          <stop offset="1" stopColor={fill || "#3b82f6"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="m1792,128c0,1051.48 -851.49,1792 -1792,1792s1792,-740.52 1792,-1792Z"
        fill="url(#spotlightGradient)"
      />
    </svg>
  );
};