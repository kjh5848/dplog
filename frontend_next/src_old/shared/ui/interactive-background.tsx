"use client";

import React, { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const InteractiveBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      mouseX.set(clientX);
      mouseY.set(clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-20 overflow-hidden bg-black pointer-events-none">
      {/* Interactive Light Spot */}
      <motion.div
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className="absolute h-[60vmax] w-[60vmax] rounded-full opacity-30 blur-[120px]"
        animate={{
            background: [
                "radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)",
                "radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)",
            ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Fluid Ripple Shapes - Stationary but animated */}
      <motion.div 
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] h-[80%] w-[80%] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-blue-900/10 blur-[100px]"
      />
      <motion.div 
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.05, 0.1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[-10%] h-[70%] w-[70%] rounded-[30%_70%_50%_50%/50%_30%_70%_40%] bg-indigo-900/10 blur-[120px]"
      />

      {/* Grid Overlay for Technical feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
};
