"use client";

import { Bebas_Neue, Roboto } from "next/font/google";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import ServicesSection from "./components/ServicesSection";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export default function MvpLogisticsPage() {
  return (
    <div className={`${bebasNeue.variable} ${roboto.variable} font-sans min-h-screen bg-[#F4F4F7] text-[#1F1F61]`}>
        <Navbar />
      <main className="flex flex-col">
          <HeroSection />
          <ServicesSection />
          <AboutSection />
      </main>
        <Footer />
    </div>
  );
}
