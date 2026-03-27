"use client";

import React from "react";
import HeroSection from "./HeroSection";
import SocialProof from "./SocialProof";
import PersonaTabs from "./PersonaTabs";
import DetailedFeatures from "./DetailedFeatures";
import ProcessSection from "./ProcessSection";
import CTASection from "./CTASection";

export default function LandingPageV7() {
  return (
    <div className="w-full min-h-screen bg-[#050505] text-[#F7F8F9] antialiased selection:bg-blue-500/30">
        {/* Navigation Placeholder */}
        <nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
            <div className="font-bold text-xl tracking-tight">D-PLOG</div>
            <div className="flex gap-6 text-sm text-gray-400 font-medium">
                <a href="#" className="hover:text-white transition-colors">Pricing</a>
                <a href="#" className="hover:text-white transition-colors">Blog</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <button className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-200 transition-colors">
                무료 진단하기
            </button>
        </nav>

        <main className="pt-0"> {/* Remove top padding to let Hero go to top */}
            <HeroSection />
            <SocialProof />
            <PersonaTabs />
            <DetailedFeatures />
            <ProcessSection />
            <CTASection />
        </main>

        <footer className="py-20 border-t border-white/5 mt-20">
             <div className="container mx-auto px-6 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} D-PLOG. All rights reserved.
            </div>
        </footer>
    </div>
  );
}
