"use client";

import React from 'react';
import { FAQ } from "@/shared/ui/faq-accordion";

export default function FAQAccordionV1Page() {
  const categories = {
    "web-dev": "Web Development",
    "mobile-dev": "Mobile Development", 
    "ui-ux": "UI/UX Design",
    "copywriting": "Copywriting"
  };

  const faqData = {
    "web-dev": [
      {
        question: "What is web development?",
        answer: "Web development is the process of building and maintaining websites. It involves a combination of client-side and server-side programming, database management, and other web-related technologies."
      },
      {
        question: "What programming languages are essential for web development?",
        answer: "Essential languages for web development include HTML, CSS, and JavaScript for front-end development. For back-end development, popular languages include Python, Ruby, PHP, Java, and Node.js."
      },
      {
        question: "What's the difference between front-end and back-end development?",
        answer: "Front-end development focuses on the user interface and user experience of a website, while back-end development deals with server-side logic, databases, and application integration."
      }
    ],
    "mobile-dev": [
      {
        question: "What is mobile development?",
        answer: "Mobile development is the process of creating software applications that run on mobile devices such as smartphones and tablets. It involves designing, coding, and testing applications for mobile operating systems like iOS and Android."
      }
    ],
    "ui-ux": [
      {
        question: "What is UI/UX design?",
        answer: "UI (User Interface) design focuses on the visual elements of a digital product, while UX (User Experience) design deals with the overall feel and functionality of the product."
      }
    ],
    "copywriting": [
      {
        question: "What is copywriting?",
        answer: "Copywriting is the act of writing text for the purpose of advertising or other forms of marketing. The product, called copy, is written content that aims to increase brand awareness."
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-7xl mx-auto border border-slate-200 rounded-[3rem] overflow-hidden bg-white shadow-2xl">
        <FAQ 
          title="Frequently Asked Questions"
          subtitle="Accordion Design V1"
          categories={categories}
          faqData={faqData}
        />
      </div>
    </div>
  );
}

