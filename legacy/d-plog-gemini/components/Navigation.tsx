import React from 'react';

const Navigation: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-6 mix-blend-difference text-white">
      <div className="text-2xl font-black tracking-tighter cursor-pointer" onClick={() => scrollToSection('hero')}>
        D-PLOG
      </div>
      <div className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
        <button onClick={() => scrollToSection('problem')} className="hover:opacity-60 transition-opacity uppercase">Reality</button>
        <button onClick={() => scrollToSection('solution')} className="hover:opacity-60 transition-opacity uppercase">Solution</button>
        <button onClick={() => scrollToSection('features')} className="hover:opacity-60 transition-opacity uppercase">Features</button>
        <button onClick={() => scrollToSection('conclusion')} className="hover:opacity-60 transition-opacity uppercase">Contact</button>
      </div>
    </nav>
  );
};

export default Navigation;