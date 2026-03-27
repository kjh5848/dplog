"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

interface BentoItemProps {
  title: string;
  description: string;
  className?: string;
  index: number;
  image?: string;
}

const BentoItem = ({ title, description, className, index, image }: BentoItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        delay: index * 0.05,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 hover:bg-white/[0.06] transition-all duration-500",
        className
      )}
    >
      {image && (
        <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
          <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>
      )}
      
      <div className="relative z-10 flex h-full flex-col justify-end">
        <h3 className="text-lg font-bold mb-2 group-hover:translate-x-1 transition-transform duration-300">
          {title}
        </h3>
        <p className="opacity-60 text-xs leading-relaxed max-w-[200px] group-hover:opacity-100 transition-opacity">
          {description}
        </p>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.05),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
};

export const BentoGrid = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-6 gap-3", className)}>
      {children}
    </div>
  );
};

export default BentoItem;
