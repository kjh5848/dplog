"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// Main reusable FAQ component
export const FAQ = ({ 
  title = "FAQs",
  subtitle = "Frequently Asked Questions",
  categories,
  faqData,
  className,
  ...props 
}: {
  title?: string;
  subtitle?: string;
  categories: Record<string, string>;
  faqData: Record<string, { question: string, answer: string }[]>;
  className?: string;
}) => {
  const categoryKeys = Object.keys(categories);
  const [selectedCategory, setSelectedCategory] = useState(categoryKeys[0]);

  return (
    <section 
      className={cn(
        "relative overflow-hidden bg-background px-4 py-24 text-foreground",
        className
      )}
      {...props}
    >
      <FAQHeader title={title} subtitle={subtitle} />
      <FAQTabs 
        categories={categories}
        selected={selectedCategory} 
        setSelected={setSelectedCategory} 
      />
      <FAQList 
        faqData={faqData}
        selected={selectedCategory} 
      />
    </section>
  );
};

const FAQHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="relative z-10 flex flex-col items-center justify-center text-center mb-16">
    <span className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text font-bold tracking-widest text-transparent uppercase text-xs">
      {subtitle}
    </span>
    <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{title}</h2>
    <span className="absolute -top-[350px] left-[50%] z-0 h-[500px] w-[600px] -translate-x-[50%] rounded-full bg-blue-500/5 blur-3xl" />
  </div>
);

const FAQTabs = ({ categories, selected, setSelected }: any) => (
  <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
    {Object.entries(categories).map(([key, label]: [string, any]) => (
      <button
        key={key}
        onClick={() => setSelected(key)}
        className={cn(
          "relative overflow-hidden whitespace-nowrap rounded-xl border px-6 py-3 text-sm font-bold transition-all duration-300",
          selected === key
            ? "border-blue-600 text-white"
            : "border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:border-slate-300"
        )}
      >
        <span className="relative z-10">{label}</span>
        <AnimatePresence>
          {selected === key && (
            <motion.span
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 z-0 bg-blue-600"
            />
          )}
        </AnimatePresence>
      </button>
    ))}
  </div>
);

const FAQList = ({ faqData, selected }: any) => (
  <div className="mx-auto mt-16 max-w-4xl px-4">
    <AnimatePresence mode="wait">
      {Object.entries(faqData).map(([category, questions]: [string, any]) => {
        if (selected === category) {
          return (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {questions.map((faq: any, index: number) => (
                <FAQItem key={index} {...faq} />
              ))}
            </motion.div>
          );
        }
        return null;
      })}
    </AnimatePresence>
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      animate={isOpen ? "open" : "closed"}
      className={cn(
        "rounded-2xl border transition-all duration-300",
        isOpen ? "bg-slate-50 border-blue-100 shadow-sm" : "bg-white border-slate-100 hover:border-slate-200"
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-6 p-6 text-left"
      >
        <span
          className={cn(
            "text-lg font-bold transition-colors",
            isOpen ? "text-slate-900" : "text-slate-600"
          )}
        >
          {question}
        </span>
        <motion.div
          variants={{
            open: { rotate: "45deg" },
            closed: { rotate: "0deg" },
          }}
          transition={{ duration: 0.3 }}
          className={cn(
            "p-1 rounded-full transition-colors",
            isOpen ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
          )}
        >
          <Plus className="h-5 w-5" />
        </motion.div>
      </button>
      <motion.div
        initial={false}
        animate={{ 
          height: isOpen ? "auto" : "0px", 
          opacity: isOpen ? 1 : 0,
          marginBottom: isOpen ? "24px" : "0px" 
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden px-8"
      >
        <p className="text-slate-500 leading-relaxed font-medium pb-4">{answer}</p>
      </motion.div>
    </motion.div>
  );
};

