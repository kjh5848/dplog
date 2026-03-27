
import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown, Settings } from 'lucide-react';
import { NAV_LINKS } from '../constants';
import { Button } from './ui/Common';

interface HeaderProps {
  onNavigate?: (page: 'home' | 'buffer') => void;
  currentPage?: 'home' | 'buffer';
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage = 'home' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  const handleNavClick = (page: 'home' | 'buffer') => {
    if (onNavigate) {
      onNavigate(page);
      // Reset scroll position instantly
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Centered Floating Header Container */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none">
        <header 
          className={`
            pointer-events-auto
            relative w-full max-w-5xl 
            flex items-center justify-between 
            px-5 py-3 rounded-full 
            transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)]
            border
            ${isScrolled || mobileMenuOpen 
              ? 'bg-white/95 border-gray-200 shadow-xl' 
              : 'bg-white/70 border-white/40 shadow-sm backdrop-blur-md'
            }
          `}
        >
          {/* Logo & Service Name */}
          <div className="flex items-center gap-3 z-50">
            <button 
              onClick={() => handleNavClick('home')} 
              className="flex items-center gap-2 focus:outline-none relative group pl-1"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-gray-900 transition-transform group-hover:scale-110" fill="currentColor">
                 <path d="M12 2L2 19h20L12 2zm0 3.5L18.5 17h-13L12 5.5z"/>
              </svg>
              <span className="text-gray-900 font-bold text-lg tracking-tight">D-PLOG</span>
            </button>

            {/* Service Name Divider */}
            {currentPage !== 'home' && (
              <>
                <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
                <span className="text-gray-600 font-medium text-sm hidden sm:block">
                  {currentPage === 'buffer' ? 'Buffer Dashboard' : 'Service'}
                </span>
              </>
            )}
          </div>

          {/* Desktop Nav - Hidden on Tablets/Mobile */}
          <nav className="hidden xl:flex items-center gap-2">
            {currentPage === 'home' && NAV_LINKS.map((link) => (
              <div key={link.label} className="relative group">
                <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-full transition-all">
                  {link.label}
                  {link.hasDropdown && <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />}
                </button>
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 pr-1">
             <button 
                onClick={() => handleNavClick(currentPage === 'buffer' ? 'home' : 'buffer')}
                className="hidden xl:flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
             >
                {currentPage === 'buffer' ? 'Back to Home' : 'Buffer'}
             </button>

             {/* Mobile Menu Toggle */}
             <button 
               className="xl:hidden p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none transition-colors"
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               aria-label="Toggle menu"
             >
               {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
             </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-white/95 backdrop-blur-xl z-40 flex flex-col pt-32 px-6 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] xl:hidden ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <nav className="flex flex-col gap-2 max-w-lg mx-auto w-full">
          <button 
              onClick={() => handleNavClick('home')}
              className="w-full text-left font-semibold text-2xl text-gray-900 py-6 border-b border-gray-100 hover:pl-2 transition-all flex justify-between items-center group"
          >
              Home
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">→</span>
          </button>
          <button 
              onClick={() => handleNavClick('buffer')}
              className="w-full text-left font-semibold text-2xl text-gray-900 py-6 border-b border-gray-100 hover:pl-2 transition-all flex justify-between items-center group"
          >
              Buffer Dashboard
              <Settings className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </button>
        </nav>
      </div>
    </>
  );
};

export default Header;
