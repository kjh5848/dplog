"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

import { cn } from "@/shared/lib/utils";

export const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface VelocityScrollProps {
  children: React.ReactNode;
  defaultVelocity?: number;
  className?: string;
}

function ParallaxRow({
  children,
  baseVelocity = 100,
  className,
}: {
  children: React.ReactNode;
  baseVelocity: number;
  className?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 400,
    stiffness: 100,
  });

  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 1.5], {
    clamp: false,
  });

  const [repetitions, setRepetitions] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.offsetWidth;
        const newRepetitions = Math.ceil(containerWidth / contentWidth) + 2;
        setRepetitions(newRepetitions);
      }
    };

    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [children]);

  const x = useTransform(baseX, (v) => `${wrap(-100 / repetitions, 0, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((_t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="w-full overflow-hidden whitespace-nowrap" ref={containerRef}>
      <motion.div className={cn("inline-flex", className)} style={{ x }}>
        {Array.from({ length: repetitions }).map((_, i) => (
          <div key={i} ref={i === 0 ? contentRef : null} className="inline-flex">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function VelocityScroll({
  children,
  defaultVelocity = 5,
  className,
}: VelocityScrollProps) {
  return (
    <section className={cn("relative w-full flex flex-col gap-6", className)}>
      <ParallaxRow baseVelocity={defaultVelocity}>
        {children}
      </ParallaxRow>
      <ParallaxRow baseVelocity={-defaultVelocity}>
        {children}
      </ParallaxRow>
    </section>
  );
}
