
import React from 'react';
import { SectionContainer } from './ui/Common';
import { FOOTER_LINKS } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="pt-20 pb-12 bg-white">
      <SectionContainer>
        <div className="flex flex-col md:flex-row justify-between mb-20 gap-12">
          <div className="md:w-1/3">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">위기를 기회로, D-PLOG</h3>
            <p className="text-gray-500">소상공인을 위한 AI 경영 파트너</p>
          </div>
          
          <div className="flex gap-16 md:gap-32">
            <div className="flex flex-col gap-3">
              {FOOTER_LINKS.primary.map(link => (
                <a key={link.label} href={link.href} className="text-gray-600 hover:text-black font-medium transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {FOOTER_LINKS.secondary.map(link => (
                <a key={link.label} href={link.href} className="text-gray-600 hover:text-black font-medium transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Big D-PLOG Text SVG Representation */}
        <div className="w-full mb-12 overflow-hidden select-none pointer-events-none opacity-5">
           <svg viewBox="0 0 1000 120" className="w-full h-auto">
             <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="100" fontWeight="900" fontFamily="Inter, sans-serif" fill="currentColor">
               D-PLOG
             </text>
           </svg>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-gray-500 font-medium">
             <span className="text-gray-400 font-bold">D-PLOG Inc.</span>
          </div>
          
          <div className="flex gap-6 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-gray-900">개인정보처리방침</a>
            <a href="#" className="hover:text-gray-900">이용약관</a>
            <a href="#" className="hover:text-gray-900">회사 소개</a>
            <a href="#" className="hover:text-gray-900">고객센터</a>
          </div>
        </div>
      </SectionContainer>
    </footer>
  );
};

export default Footer;
