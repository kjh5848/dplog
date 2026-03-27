"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/mvp-logistics" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#1F1F61] text-white flex items-center justify-center font-bold text-xl rounded-sm">
                MVP
            </div>
            <span className={`font-bebas text-3xl tracking-wide ${isScrolled ? "text-[#1F1F61]" : "text-[#1F1F61]"}`}>
                LOGISTICS
            </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
            {["Services", "About Us", "Blog", "Contacts"].map((item) => (
                <Link
                    key={item}
                    href="#"
                    className="font-bebas text-xl tracking-wider text-[#1F1F61] hover:text-[#5B5B9E] transition-colors relative group"
                >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#1F1F61] transition-all duration-300 group-hover:w-full"></span>
                </Link>
            ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-6">
            <button className="flex items-center gap-1 text-[#1F1F61] font-bebas text-lg hover:opacity-70 transition-opacity">
                <Globe size={18} />
                <span>EN</span>
            </button>
            <button className="bg-[#1F1F61] text-white font-bebas text-xl px-6 py-2 rounded shadow-lg hover:bg-[#323280] transition-transform hover:scale-105 active:scale-95">
                Contact Us
            </button>
        </div>

        {/* Mobile Menu Button */}
        <button
            className="md:hidden text-[#1F1F61]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-full left-0 w-full bg-white shadow-lg p-6 flex flex-col gap-6 md:hidden"
            >
                {["Services", "About Us", "Blog", "Contacts"].map((item) => (
                    <Link
                        key={item}
                        href="#"
                        className="font-bebas text-2xl text-[#1F1F61] hover:text-[#5B5B9E]"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        {item}
                    </Link>
                ))}
                <div className="flex flex-col gap-4 mt-4">
                     <button className="flex items-center gap-2 text-[#1F1F61] font-bebas text-xl">
                        <Globe size={20} />
                        <span>EN</span>
                    </button>
                    <button className="bg-[#1F1F61] text-white font-bebas text-xl px-6 py-3 rounded text-center">
                        Contact Us
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
