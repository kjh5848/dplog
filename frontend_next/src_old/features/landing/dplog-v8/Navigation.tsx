import React, { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu } from "lucide-react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
           {/* Placeholder Logo similar to inurinet style */}
           <div className={`text-2xl font-bold tracking-tighter ${isScrolled ? 'text-brand-inuri-brown' : 'text-brand-inuri-brown'}`}>
              dplog<span className="text-brand-inuri-yellow">.net</span>
           </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {["브랜드 스토리", "진료 과목", "치료 프로그램", "커뮤니티", "예약하기"].map((item) => (
            <a
              key={item}
              href="#"
              className={`text-base font-medium transition-colors hover:text-brand-inuri-yellow ${
                isScrolled ? "text-gray-700" : "text-gray-800"
              }`}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="p-2 text-gray-700">
            <Menu />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
