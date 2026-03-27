"use client";


import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "요금제 안내",
  description = "매장 성장에 맞는 최적의 플랜을 선택하세요.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);

  const handleToggle = (monthly: boolean) => {
    setIsMonthly(monthly);
    if (!monthly) {
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#60a5fa", "#93c5fd"],
      });
    }
  };



  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-slate-900 dark:text-white [text-wrap:balance]">
          {title}
        </h2>
        <p className="text-muted-foreground text-lg whitespace-pre-line max-w-2xl mx-auto [text-wrap:balance]">
          {description}
        </p>
      </div>

      {/* Segmented Control Toggle */}
      <div className="flex justify-center mb-12">
        <div className="relative w-full max-w-[400px] p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center shadow-inner border border-slate-200 dark:border-slate-700/50">
          <motion.div
            className="absolute top-1 bottom-1 left-1 rounded-lg bg-white dark:bg-blue-600 shadow-sm"
            initial={false}
            animate={{
              x: isMonthly ? "0%" : "100%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ width: "calc(50% - 4px)" }}
          />
          <button
            onClick={() => handleToggle(true)}
            className={cn(
              "relative z-10 flex-1 py-3 text-sm font-bold transition-colors duration-300 rounded-lg text-center whitespace-nowrap",
              isMonthly ? "text-blue-600 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            월간 결제
          </button>
          <button
            onClick={() => handleToggle(false)}
            className={cn(
              "relative z-10 flex-1 py-3 text-sm font-bold transition-colors duration-300 rounded-lg flex items-center justify-center gap-2 whitespace-nowrap",
              !isMonthly ? "text-blue-600 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            연간 결제
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-500 text-blue-600 dark:text-white rounded-md">
              -20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "relative flex flex-col p-8 rounded-3xl transition-all duration-500",
              plan.isPopular 
                ? "bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/10 scale-105 z-10" 
                : "bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg">
                가장 인기 있는 선택
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tight">
                <NumberFlow
                  value={Number(isMonthly ? plan.price : plan.yearlyPrice)}
                  format={{ style: "decimal" }}
                  transformTiming={{ duration: 600, easing: "ease-out" }}
                />
              </span>
              <span className="text-2xl font-bold">만원</span>
              <span className="text-muted-foreground text-sm ml-2">/ {plan.period}</span>
            </div>

            <ul className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 bg-blue-500/10 dark:bg-blue-500/20 p-0.5 rounded-full">
                    <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={cn(
                "w-full py-4 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2",
                plan.isPopular
                  ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95"
              )}
            >
              {plan.buttonText}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
