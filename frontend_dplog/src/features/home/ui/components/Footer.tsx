'use client';

import React from 'react';
import { SectionContainer } from './ui/Common';
import Link from 'next/link';
import Image from 'next/image';

/* Legacy Footer Information Ported to v13 Design */
const FOOTER_DATA = {
  services: [
    { label: "순위 조회", href: "/realtime" },
    { label: "순위 추적", href: "/track" },
    { label: "멤버십", href: "/membership" },
  ],
  support: [
    { label: "문의하기 (준비 중)", href: "#" },
    { label: "자주 묻는 질문 (준비 중)", href: "#" },
    { label: "이용 가이드 (준비 중)", href: "#" },
  ],
  company: [
    { label: "서비스 이용약관", href: "/terms" },
    { label: "개인정보처리방침", href: "/privacy" },
    { label: "마케팅 정보활용 동의", href: "/marketing" },
  ],
  businessInfo: [
    "상호: 이오 | 대표자: 황승준 | 사업자등록번호: 203-53-02281 | 채널명: 디플로그",
    "사업장 소재지: 부산광역시 연제구 연제로 24, 207호 이오",
    "유선전화번호 : 070-7701-7735",
    "이메일 : eo25.kr@gmail.com"
  ]
};

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 pt-20 pb-12 bg-white">
      <SectionContainer>
        <div className="flex flex-col md:flex-row justify-between mb-20 gap-12">
          {/* Brand Column */}
          <div className="md:w-1/3">
             <div className="flex items-center mb-4">
               {/* Logo Placeholder if image not available, or use text */}
               <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                D-PLOG
               </h3>
            </div>
            <p className="text-gray-500">
              네이버 플레이스 순위 추적의 새로운 기준
            </p>
          </div>
          
          {/* Links Columns */}
          <div className="flex flex-wrap gap-12 md:gap-24">
            {/* Service */}
            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-gray-900 mb-2">서비스</h4>
              {FOOTER_DATA.services.map(link => (
                <Link key={link.label} href={link.href} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Support */}
             <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-gray-900 mb-2">지원</h4>
              {FOOTER_DATA.support.map(link => (
                <span key={link.label} className="text-gray-400 font-medium cursor-not-allowed">
                  {link.label}
                </span>
              ))}
            </div>

             {/* Company */}
             <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-gray-900 mb-2">회사</h4>
              {FOOTER_DATA.company.map(link => (
                <Link key={link.label} href={link.href} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Big D-PLOG Text SVG Representation (Kept from v12 as requested) */}
        <div className="w-full mb-12 overflow-hidden select-none pointer-events-none opacity-5">
           <svg viewBox="0 0 1000 120" className="w-full h-auto">
             <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="100" fontWeight="900" fontFamily="Inter, sans-serif" fill="currentColor">
               D-PLOG
             </text>
           </svg>
        </div>

        <div className="pt-8 border-t border-gray-200">
          {/* Business Info */}
          <div className="text-center md:text-left mb-6">
             <div className="text-sm text-gray-800 font-bold mb-2">사업자 정보</div>
             <div className="text-xs text-gray-500 space-y-1">
               {FOOTER_DATA.businessInfo.map((info, idx) => (
                 <div key={idx}>{info}</div>
               ))}
             </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
             <p className="text-sm text-gray-400">
               &copy; {currentYear} D-PLOG. All rights reserved.
             </p>
          </div>
        </div>
      </SectionContainer>
    </footer>
  );
};
