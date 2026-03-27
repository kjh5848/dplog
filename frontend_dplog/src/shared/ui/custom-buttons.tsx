"use client";

import React from "react";
import { cn } from "@/shared/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

// --- Primary Button: Shiny Blue ---
// A high-contrast, attention-grabbing button with a subtle shimmer effect on hover.

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
}

export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        initial={{ "--x": "100%", scale: 1 } as any}
        whileHover={{ "--x": "-100%", scale: 1.02 } as any}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={cn(
          "relative overflow-hidden rounded-full bg-blue-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/30 transition-shadow hover:shadow-blue-500/50",
          className
        )}
        {...props}
      >
        <span
          className="absolute inset-0 block h-full w-full -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20"
          style={{ transform: "translateX(var(--x))" }}
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </motion.button>
    );
  }
);
ShinyButton.displayName = "ShinyButton";

// --- Secondary Button: Clean Gradient Border ---
// A clean, white/dark button with a subtle gradient border that suggests premium content (like an ebook).

interface GradientButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
}

export const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative flex items-center justify-center rounded-full bg-gradient-to-br from-blue-300 via-purple-300 to-pink-300 p-[1px] text-lg font-bold shadow-lg shadow-slate-200/50 dark:shadow-none", // The border gradient
          className
        )}
        {...props}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-white px-8 py-4 transition-colors group-hover:bg-slate-50 dark:bg-slate-900 dark:group-hover:bg-slate-800">
          <span className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
            {children}
          </span>
        </div>
      </motion.button>
    );
  }
);
GradientButton.displayName = "GradientButton";
