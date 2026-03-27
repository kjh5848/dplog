import React from "react";
import Link from "next/link";

const Navigation: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="landing-v2-nav fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-6 mix-blend-difference text-white">
      <Link
        className="text-2xl font-black tracking-tighter cursor-pointer"
        href="/landing/dplog-alt"
        onClick={() => scrollToSection("hero")}
      >
        D-PLOG
      </Link>
      <div className="hidden md:flex space-x-8 text-sm font-medium tracking-wide">
        <button
          onClick={() => scrollToSection("problem")}
          className="hover:opacity-60 transition-opacity uppercase"
        >
          현실
        </button>
        <button
          onClick={() => scrollToSection("solution")}
          className="hover:opacity-60 transition-opacity uppercase"
        >
          해결
        </button>
        <button
          onClick={() => scrollToSection("features")}
          className="hover:opacity-60 transition-opacity uppercase"
        >
          기능
        </button>
        <button
          onClick={() => scrollToSection("conclusion")}
          className="hover:opacity-60 transition-opacity uppercase"
        >
          문의
        </button>
      </div>
      <div className="hidden md:flex items-center gap-5 text-sm uppercase tracking-wide">
        <a className="hover:opacity-60 transition-opacity" href="/pricing">
          요금제
        </a>
        <a className="hover:opacity-60 transition-opacity" href="/success-stories">
          사례
        </a>
        <a className="btn btn-outline btn-sm" href="/diagnosis/new">
          시작
        </a>
      </div>
    </nav>
  );
};

export default Navigation;
