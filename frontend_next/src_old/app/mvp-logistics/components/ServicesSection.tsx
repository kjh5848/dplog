"use client";

import { motion } from "framer-motion";
import { Truck, Package, MapPin, Anchor, Clock, FileCheck } from "lucide-react";

const services = [
    { id: "01", title: "INTERNATIONAL FREIGHT", icon: Truck },
    { id: "02", title: "SORTING & HANDLING", icon: Package },
    { id: "03", title: "DOOR-TO-DOOR DELIVERY", icon: MapPin },
    { id: "04", title: "INTEGRATED LOGISTICS", icon: Anchor },
    { id: "05", title: "TRACKING & CONTROL", icon: Clock },
    { id: "06", title: "CUSTOMS CLEARANCE", icon: FileCheck },
];

export default function ServicesSection() {
  return (
    <section className="bg-[#F4F4F7] py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
                <div>
                    <span className="text-[#1F1F61] font-bebas text-xl tracking-wider mb-2 block">WHAT WE DO</span>
                    <h2 className="text-[#1F1F61] font-bebas text-5xl md:text-7xl leading-none">
                        OUR LOGISTICS <br /> SERVICES
                    </h2>
                </div>
                <p className="max-w-md text-gray-600 font-roboto leading-relaxed">
                    We offer comprehensive logistics solutions designed to optimize your supply chain and ensure timely delivery of your goods.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => (
                    <motion.div 
                        key={service.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-8 group hover:shadow-xl transition-shadow duration-300 border-l-4 border-transparent hover:border-[#1F1F61]"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <span className="font-bebas text-4xl text-gray-200 group-hover:text-[#1F1F61] transition-colors">
                                {service.id}
                            </span>
                            <service.icon className="w-8 h-8 text-[#1F1F61]" strokeWidth={1.5} />
                        </div>
                        <h3 className="font-bebas text-2xl text-[#1F1F61] mb-4">
                            {service.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-roboto leading-relaxed mb-6">
                            Professional handling and efficient transport solutions tailored to your specific requirements.
                        </p>
                        <a href="#" className="inline-flex items-center text-sm font-bold text-[#1F1F61] group-hover:tracking-wider transition-all">
                            READ MORE <span className="ml-2">→</span>
                        </a>
                    </motion.div>
                ))}
            </div>
        </div>
    </section>
  );
}
