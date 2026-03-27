import React from "react";

export default function Footer() {
  return (
    <footer className="bg-brand-inuri-brown text-white py-16">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-3xl font-bold mb-6">dplog<span className="text-brand-inuri-yellow">.net</span></h2>
            <p className="text-white/60 mb-6 leading-relaxed">
              아이의 몸과 마음을 함께 치유하는<br />
              따뜻한 한방 소아과입니다.
            </p>
            <div className="flex gap-4">
               {/* Social Icons Placeholder */}
               <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-inuri-yellow hover:text-brand-inuri-brown transition-colors cursor-pointer">Insta</div>
               <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-inuri-yellow hover:text-brand-inuri-brown transition-colors cursor-pointer">Blog</div>
               <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-brand-inuri-yellow hover:text-brand-inuri-brown transition-colors cursor-pointer">Youtube</div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-brand-inuri-yellow">진료 안내</h3>
            <ul className="space-y-4 text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">진료 철학</a></li>
              <li><a href="#" className="hover:text-white transition-colors">의료진 소개</a></li>
              <li><a href="#" className="hover:text-white transition-colors">오시는 길</a></li>
              <li><a href="#" className="hover:text-white transition-colors">진료 예약</a></li>
            </ul>
          </div>

          <div>
             <h3 className="text-lg font-bold mb-6 text-brand-inuri-yellow">고객 센터</h3>
             <ul className="space-y-4 text-white/60">
               <li>02-1234-5678</li>
               <li>support@dplog.net</li>
               <li>서울시 강남구 테헤란로 123</li>
             </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm">
          © 2026 dplog.net All rights reserved.
        </div>
      </div>
    </footer>
  );
}
