import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          <div className="col-span-2">
            <div className="text-2xl font-extrabold text-white flex items-center gap-2 mb-6">
              <span className="material-icons-round text-primary text-3xl">hub</span>
              D-PLOG
            </div>
            <p className="text-sm max-w-xs leading-relaxed">
              외식업 소상공인을 위한 데이터 기반 진단 & 솔루션 플랫폼.<br/>
              사장님의 성공을 데이터로 증명합니다.
            </p>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6">서비스</h5>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">실시간 진단</a></li>
              <li><a href="#" className="hover:text-white transition-colors">성공 사례</a></li>
              <li><a href="#" className="hover:text-white transition-colors">요금 안내</a></li>
              <li><a href="#" className="hover:text-white transition-colors">파트너십</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6">회사</h5>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">회사 소개</a></li>
              <li><a href="#" className="hover:text-white transition-colors">채용</a></li>
              <li><a href="#" className="hover:text-white transition-colors">블로그</a></li>
              <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6">고객 지원</h5>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">도움말 센터</a></li>
              <li><a href="#" className="hover:text-white transition-colors">개인정보 처리방침</a></li>
              <li><a href="#" className="hover:text-white transition-colors">커뮤니티</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-bold mb-6">Legal</h5>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">이용약관</a></li>
              <li><a href="#" className="hover:text-white transition-colors">개인정보</a></li>
              <li><a href="#" className="hover:text-white transition-colors">사업자 정보</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2024 D-PLOG INC. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
