"use client";

import { ArrowRight, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1F1F61] text-white pt-24 pb-12">
      <div className="container mx-auto px-6">
        {/* Top Section - CTA */}
        <div className="border-b border-white/10 pb-16 mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
                <span className="text-white/60 font-bebas text-xl tracking-wider mb-2 block">CONTACT US</span>
                <h2 className="font-bebas text-5xl md:text-7xl leading-none">
                    LEAVE A REQUEST <br /> FOR DELIVERY
                </h2>
            </div>
            <button className="bg-white text-[#1F1F61] font-bebas text-xl px-10 py-4 rounded hover:bg-[#F4F4F7] transition-colors flex items-center gap-3">
                GET A QUOTE <ArrowRight size={20} />
            </button>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div>
                 <div className="w-10 h-10 bg-white text-[#1F1F61] flex items-center justify-center font-bold text-xl rounded-sm mb-6">
                    MVP
                </div>
                <p className="text-white/60 font-roboto text-sm leading-relaxed max-w-xs">
                    Reliable logistics partner offering comprehensive solutions for your business needs globally.
                </p>
            </div>

            <div>
                <h4 className="font-bebas text-xl mb-6 tracking-wide">SERVICES</h4>
                <ul className="space-y-3 font-roboto text-sm text-white/60">
                    {["Road Freight", "Sea Freight", "Air Freight", "Warehousing", "Project Cargo"].map(item => (
                        <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
                    ))}
                </ul>
            </div>

            <div>
                <h4 className="font-bebas text-xl mb-6 tracking-wide">COMPANY</h4>
                <ul className="space-y-3 font-roboto text-sm text-white/60">
                    {["About Us", "Our Team", "News & Blog", "Careers", "Contact"].map(item => (
                        <li key={item} className="hover:text-white transition-colors cursor-pointer">{item}</li>
                    ))}
                </ul>
            </div>

             <div>
                <h4 className="font-bebas text-xl mb-6 tracking-wide">CONTACTS</h4>
                <ul className="space-y-3 font-roboto text-sm text-white/60">
                    <li className="flex gap-3">
                        <span className="text-white font-bold">A:</span> 
                        123 Logistics Way, Transport City, TC 90210
                    </li>
                    <li className="flex gap-3">
                        <span className="text-white font-bold">P:</span> 
                        +1 (555) 123-4567
                    </li>
                    <li className="flex gap-3">
                        <span className="text-white font-bold">E:</span> 
                        info@mvplogistics.com
                    </li>
                </ul>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10 text-xs text-white/40 font-roboto">
            <p>© 2024 MVP LOGISTICS. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-6">
                <span>PRIVACY POLICY</span>
                <span>TERMS & CONDITIONS</span>
                <div className="flex gap-4 ml-4">
                    <Facebook size={16} className="cursor-pointer hover:text-white" />
                    <Twitter size={16} className="cursor-pointer hover:text-white" />
                    <Linkedin size={16} className="cursor-pointer hover:text-white" />
                    <Instagram size={16} className="cursor-pointer hover:text-white" />
                </div>
            </div>
        </div>
      </div>
    </footer>
  );
}
