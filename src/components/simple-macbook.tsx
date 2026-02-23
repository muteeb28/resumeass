"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export const SimpleMacbook = ({
  src,
  title,
}: {
  src?: string;
  title?: string | React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Simple transforms
  const y = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const rotateX = useTransform(scrollYProgress, [0, 0.3], [-25, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.8, 1]);

  return (
    <div ref={containerRef} className="relative min-h-[150vh] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Title */}
      <div className="text-center mb-20 z-10">
        {title && (
          <h2 className="text-4xl md:text-6xl font-bold text-white max-w-4xl mx-auto">
            {title}
          </h2>
        )}
      </div>

      {/* MacBook */}
      <motion.div
        style={{
          y,
          rotateX,
          scale,
        }}
        className="relative z-20"
      >
        {/* MacBook Lid */}
        <div className="relative bg-gray-800 rounded-t-2xl p-2" style={{ width: "600px", height: "400px" }}>
          <div className="bg-black rounded-xl w-full h-full overflow-hidden border-4 border-gray-900">
            {src ? (
              <img
                src={src}
                alt="MacBook Screen"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                Resume Preview
              </div>
            )}
          </div>
        </div>

        {/* MacBook Base */}
        <div className="bg-gray-800 rounded-b-2xl" style={{ width: "600px", height: "40px" }}>
          {/* Trackpad */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-20 bg-gray-700 rounded-lg"></div>
        </div>
      </motion.div>

      {/* Debug info */}
      <div className="fixed top-4 left-4 text-white text-sm bg-black/50 p-2 rounded">
        Scroll Progress: {Math.round(scrollYProgress.get() * 100)}%
      </div>
    </div>
  );
};