"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function AboutSection() {
  return (
    <section className="bg-white py-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
            >
                <div className="aspect-[4/3] bg-gray-200 overflow-hidden relative">
                    <img 
                        src="https://images.unsplash.com/photo-1545558014-a69f980e2157?ixlib=rb-4.0.3&auto=format&fit=crop&w=1287&q=80" 
                        alt="Logistics Warehouse" 
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                    />
                     <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#F4F4F7] z-10 hidden md:block"></div>
                </div>
            </motion.div>

            {/* Content Side */}
            <div className="space-y-8">
                <div>
                     <span className="text-[#1F1F61] font-bebas text-xl tracking-wider mb-2 block">WHO WE ARE</span>
                     <h2 className="text-[#1F1F61] font-bebas text-5xl md:text-6xl leading-none mb-6">
                        WE PROVIDE RELIABLE <br /> LOGISTICS SOLUTIONS
                    </h2>
                     <div className="w-20 h-1 bg-[#1F1F61]"></div>
                </div>

                <p className="text-gray-600 font-roboto leading-relaxed text-lg">
                    With over 20 years of experience in the logistics industry, we have built a reputation for reliability, efficiency, and innovation. Our mission is to provide seamless supply chain solutions that help your business grow.
                </p>

                <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                    <div>
                        <span className="block font-bebas text-5xl text-[#1F1F61] mb-2">
                             <CountUp end={20} duration={2.5} enableScrollSpy />+
                        </span>
                        <span className="text-sm font-bold text-gray-500 tracking-wider">YEARS OF EXPERIENCE</span>
                    </div>
                    <div>
                        <span className="block font-bebas text-5xl text-[#1F1F61] mb-2">
                            <CountUp end={1500} duration={2.5} separator="," enableScrollSpy />+
                        </span>
                        <span className="text-sm font-bold text-gray-500 tracking-wider">SATISFIED CLIENTS</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
