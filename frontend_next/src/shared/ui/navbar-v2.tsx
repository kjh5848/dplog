"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/utils";

export const NavbarV2 = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex justify-center">
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        layout
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30
        }}
        className={cn(
          "relative flex items-center bg-white/10 backdrop-blur-2xl border border-white/10 overflow-hidden",
          isHovered ? "rounded-3xl p-2 px-6" : "rounded-full p-4"
        )}
      >
        <motion.div layout className="flex items-center gap-6">
          {/* Logo / Initial State Element */}
          <motion.div layout className="flex items-center justify-center">
             <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-sm rotate-45" />
             </div>
             {isHovered && (
               <motion.span 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="ml-3 font-bold tracking-tighter text-white"
               >
                 D-PLOG
               </motion.span>
             )}
          </motion.div>

          {/* Expanded Menu Items */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-6 overflow-hidden whitespace-nowrap border-l border-white/20 pl-6"
              >
                {["Projects", "Experience", "Contact"].map((item) => (
                  <motion.a
                    key={item}
                    href="#"
                    whileHover={{ scale: 1.1, color: "#fff" }}
                    className="text-sm font-medium text-white/50 transition-colors"
                  >
                    {item}
                  </motion.a>
                ))}
                <button className="rounded-full bg-white text-black px-4 py-2 text-xs font-bold hover:bg-white/90 transition-colors">
                  Join Us
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};
