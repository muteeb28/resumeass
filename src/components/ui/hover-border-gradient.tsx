"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
  } & React.HTMLAttributes<HTMLElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>
>) {
  const [direction, setDirection] = useState<Direction>("TOP");

  const rotateDirection = (currentDirection: Direction): Direction => {
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const currentIndex = directions.indexOf(currentDirection);
    const nextIndex = clockwise
      ? (currentIndex - 1 + directions.length) % directions.length
      : (currentIndex + 1) % directions.length;
    return directions[nextIndex];
  };

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, #00B5A3 0%, rgba(0, 181, 163, 0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, #00B5A3 0%, rgba(0, 181, 163, 0) 100%)",
    BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, #00B5A3 0%, rgba(0, 181, 163, 0) 100%)",
    RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, #00B5A3 0%, rgba(0, 181, 163, 0) 100%)",
  };

  const highlight =
    "radial-gradient(75% 181.16% at 50% 50%, #00B5A3 0%, rgba(0, 181, 163, 0) 100%)";

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection((prev) => rotateDirection(prev));
    }, duration * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tag
      className={cn(
        "relative flex rounded-full border content-center bg-black/20 transition duration-500 dark:bg-white/20 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-auto text-white z-10 bg-black px-4 py-2 rounded-[inherit]",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className="flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: [movingMap[direction], highlight],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="bg-black absolute z-1 flex-none inset-[2px] rounded-[100px]" />
    </Tag>
  );
}
