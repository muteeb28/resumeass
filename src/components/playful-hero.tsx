"use client";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import React from "react";

export const PlayfulHero = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden pt-16",
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export const AnimatedText = ({ 
  text, 
  className,
  delay = 0 
}: { 
  text: string;
  className?: string;
  delay?: number;
}) => {
  const words = text.split(" ");
  
  return (
    <div className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.3,
            delay: delay + index * 0.1,
            ease: "easeInOut"
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};
