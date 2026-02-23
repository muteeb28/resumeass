"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "../lib/utils";

export const MacbookScroll = ({
  src,
  showGradient,
  title,
  badge,
}: {
  src?: string;
  showGradient?: boolean;
  title?: string | React.ReactNode;
  badge?: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  // Animations
  const scaleX = useTransform(scrollYProgress, [0, 0.3], [1.1, isMobile ? 1 : 1.4]);
  const scaleY = useTransform(scrollYProgress, [0, 0.3], [0.6, isMobile ? 1 : 1.4]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, 1200]);
  const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0]);
  const textTransform = useTransform(scrollYProgress, [0, 0.3], [0, 80]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div
      ref={ref}
      className="min-h-[180vh] md:min-h-[200vh] py-0 md:py-40 lg:py-80 overflow-hidden antialiased relative flex flex-col items-center"
    >
      {/* Title + Badge */}
      <motion.div
        style={{ translateY: textTransform, opacity: textOpacity }}
        className="max-w-5xl mx-auto text-center px-4"
      >
        {badge && <div className="mb-6 md:mb-10">{badge}</div>}
        {title && (
          <h1 className="text-xl md:text-5xl lg:text-7xl font-bold text-white dark:text-white">
            {title}
          </h1>
        )}
      </motion.div>

      {/* MacBook */}
      <div className="h-[22rem] md:h-[30rem] lg:h-[40rem] w-full py-10 md:py-20 overflow-hidden relative flex items-center justify-center">
        <motion.div
          style={{ scaleX, scaleY, rotate, translateY: translate }}
          className="w-[90%] sm:w-[26rem] md:w-[32rem] lg:max-w-6xl -mt-8 md:-mt-12 mx-auto h-full"
        >
          <Lid src={src} />
          <div className="h-[1px] w-full relative">
            <div className="absolute inset-x-0 mx-auto w-[70%] md:w-[80%] h-[2px] shadow-[0px_-1px_0px_0px_#d4d4d8,0px_1px_0px_0px_#a3a3a3] dark:shadow-[0px_-1px_0px_0px_#71717a,0px_1px_0px_0px_#3f3f46] rounded-full" />
          </div>

          {/* Keyboard + Trackpad */}
          <div className="h-[4rem] sm:h-[5rem] md:h-[5.5rem] w-[90%] sm:w-[26rem] md:w-[32rem] mx-auto rounded-md relative">
            <div className="h-full w-full bg-[#010101] rounded-md">
              <Keypad />
            </div>
            <Trackpad />
            <div className="h-2 w-16 sm:w-20 mx-auto absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#272729] to-[#050505] rounded-tr-3xl rounded-tl-3xl" />
            {showGradient && (
              <div className="h-20 sm:h-28 md:h-40 w-full absolute bottom-0 inset-x-0 bg-gradient-to-t dark:from-black from-white via-white dark:via-black to-transparent rounded-2xl pointer-events-none" />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const Lid = ({ src }: { src?: string }) => (
  <div className="h-[8rem] sm:h-[10rem] md:h-[12rem] w-full bg-[#010101] mx-auto rounded-t-3xl relative">
    <div className="h-2 w-full bg-[#050505] rounded-t-3xl" />
    <div className="flex relative">
      <div className="h-40 md:h-48 w-3 md:w-4 bg-[#050505]" />
      <div className="h-[calc(100%-0.2rem)] w-full bg-slate-500 rounded-xl p-2 relative overflow-hidden">
        {src ? (
          <img
            src={src}
            alt="MacBook Screen"
            className="w-full h-full rounded-lg object-cover object-top"
          />
        ) : (
          <div className="bg-black w-full h-full rounded-lg" />
        )}
      </div>
      <div className="h-40 md:h-48 w-3 md:w-4 bg-[#050505]" />
    </div>
  </div>
);

export const Trackpad = () => (
  <div
    className={cn(
      "w-[35%] sm:w-[40%] mx-auto h-20 sm:h-28 md:h-32 rounded-xl my-1",
      "bg-[#0E0E0E] absolute bottom-2 inset-x-0"
    )}
  >
    <div className="h-full w-full bg-[#161616] rounded-2xl flex items-center justify-center relative overflow-hidden">
      <div className="w-28 sm:w-32 md:w-40 h-20 sm:h-28 md:h-32 bg-gradient-to-tl from-gray-200 via-gray-400 to-gray-500 rounded-xl relative">
        <div className="w-full h-full bg-gradient-to-br from-gray-300 via-gray-600 to-gray-800 rounded-xl absolute inset-0 [mask-image:linear-gradient(1deg,transparent_0%,black_0.5%,black_99.4%,transparent_99.9%)] p-[1px]">
          <div className="bg-gray-200 rounded-xl w-full h-full" />
        </div>
      </div>
    </div>
  </div>
);

export const Keypad = () => (
  <div className="h-full mx-1 rounded-md bg-[#050505] p-1 overflow-hidden">
    <SpeakerGrid />
    <div className="flex flex-col gap-1 px-1 mt-2">
      {/* Function Row */}
      <div className="flex gap-1 w-full">
        {["esc", "f1", "f2", "f3", "f4", "f5"].map((key, i) => (
          <div
            key={i}
            className={cn(
              "rounded-sm bg-gradient-to-b from-[#5B5B5D] to-[#212124]",
              "shadow-[0px_-1px_0px_2px_#151517,0px_0.5px_0px_0px_#96969A,0px_-1.5px_0px_0px_#2F2F32,0px_-1px_0px_0px_#96969A]",
              "text-[5px] text-[#B5B5BA] flex items-center justify-center h-5 sm:h-6",
              i === 0 ? "flex-[2] px-1" : "flex-1"
            )}
          >
            {key}
          </div>
        ))}
      </div>

      {/* Row of Small Keys */}
      <div className="w-full h-3 sm:h-4 rounded-sm bg-gradient-to-b from-[#5B5B5D] to-[#212124] shadow-[0px_-1px_0px_2px_#151517,0px_0.5px_0px_0px_#96969A,0px_-1.5px_0px_0px_#2F2F32,0px_-1px_0px_0px_#96969A] flex items-center justify-center">
        <div className="flex gap-1 w-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm h-2 sm:h-3 bg-gradient-to-b from-[#5B5B5D] to-[#212124] shadow-[0px_-1px_0px_2px_#151517,0px_0.5px_0px_0px_#96969A,0px_-1.5px_0px_0px_#2F2F32,0px_-1px_0px_0px_#96969A]"
            />
          ))}
          <div className="flex-[8] rounded-sm h-2 sm:h-3 bg-gradient-to-b from-[#5B5B5D] to-[#212124] shadow-[0px_-1px_0px_2px_#151517,0px_0.5px_0px_0px_#96969A,0px_-1.5px_0px_0px_#2F2F32,0px_-1px_0px_0px_#96969A]" />
        </div>
      </div>
    </div>
  </div>
);

export const SpeakerGrid = () => (
  <div
    className="flex justify-center w-full"
    style={{
      backgroundImage: "radial-gradient(circle, #08080A 0.5px, transparent 0.5px)",
      backgroundSize: "3px 3px",
    }}
  >
    <div className="h-2 bg-[#050505] w-28 sm:w-32 md:w-40 rounded-md" />
  </div>
);
