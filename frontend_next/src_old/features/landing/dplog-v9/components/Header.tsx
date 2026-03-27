'use client';

import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ASSETS } from '../assets';
import { Menu } from 'lucide-react';

interface HeaderProps {
  onOpenRegister: () => void;
}

export const Header = ({ onOpenRegister }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="relative z-50">
          <img 
            src={ASSETS.images.logoWhite} 
            alt="Soyo Hannam" 
            className={`transition-all duration-500 ${isScrolled ? 'h-6' : 'h-8'}`}
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-12">
          {['BRAND', 'HANNAM', 'LOCATION', 'PARTNERS'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-white/70 hover:text-white text-xs tracking-[0.15em] transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-8">
          <button className="hidden md:block text-white/70 hover:text-white text-xs tracking-[0.15em] transition-colors">
            LOGIN
          </button>
          <button 
            onClick={onOpenRegister}
            className="hidden md:flex items-center justify-center px-6 py-2 border border-white/30 hover:bg-white hover:text-black transition-all duration-300 text-xs tracking-widest"
          >
            REGISTER
          </button>
          <button className="md:hidden text-white">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </motion.header>
  );
};
