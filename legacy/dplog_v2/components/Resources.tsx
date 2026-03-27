
import React, { useState } from 'react';
import { SectionContainer, Button, ParticleCanvas } from './ui/Common';
import { USE_CASES, BLOGS } from '../constants';
import { ArrowRight, ChevronLeft, ChevronRight, Apple, Cpu, MonitorPlay } from 'lucide-react';

export const UseCases: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % USE_CASES.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + USE_CASES.length) % USE_CASES.length);

  return (
    <section id="use-cases" className="py-24 border-t border-gray-100">
      <SectionContainer>
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">사장님 유형별<br/>맞춤형 성장 전략</h2>
          </div>
          <p className="text-gray-600 max-w-md mb-2">
            예비 창업자부터 프랜차이즈 본사까지, D-PLOG는 사업 단계별 최적화된 솔루션을 제공합니다.
          </p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-12 gap-8">
            {/* Image Area */}
            <div className="md:col-span-8 relative aspect-video rounded-2xl overflow-hidden group">
              <img 
                src={USE_CASES[activeSlide].image} 
                alt={USE_CASES[activeSlide].role}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="text-white">
                  <div className="inline-block px-3 py-1 bg-blue-600 rounded-full text-xs font-semibold mb-2">USE CASE</div>
                  <h3 className="text-3xl font-bold">{USE_CASES[activeSlide].role}</h3>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="md:col-span-4 flex flex-col justify-center space-y-6">
              <div key={activeSlide} className="animate-fade-in">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{USE_CASES[activeSlide].role}</h3>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {USE_CASES[activeSlide].description}
                </p>
                <Button variant="text" className="text-blue-600 font-medium">활용 사례 전체보기</Button>
              </div>

              {/* Controls */}
              <div className="flex gap-2 pt-8">
                <button onClick={prevSlide} className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                <button onClick={nextSlide} className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};

export const TrySolutions: React.FC = () => {
  return (
    <section className="py-12 border-t border-gray-100 bg-gray-50">
      <div className="grid md:grid-cols-2 min-h-[500px]">
        <div className="relative flex flex-col items-center justify-center p-12 text-center border-r border-gray-200 overflow-hidden group">
          <div className="absolute inset-0 z-0">
             <ParticleCanvas theme="light" />
          </div>
          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/80 backdrop-blur rounded-md border border-gray-200 text-xs font-semibold text-gray-500 mb-4">소상공인용</span>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">일반 사장님</h3>
            <p className="text-xl text-gray-500 mb-8">매출 상승을 위한 첫걸음</p>
            <Button variant="primary">무료로 시작하기</Button>
          </div>
        </div>
        <div className="relative flex flex-col items-center justify-center p-12 text-center overflow-hidden bg-white">
           <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-gray-100 rounded-md text-xs font-semibold text-gray-500 mb-4">기관 / 기업용</span>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">엔터프라이즈</h3>
            <p className="text-xl text-gray-500 mb-8">프랜차이즈 및 지자체 전용 솔루션</p>
            <Button variant="secondary">도입 문의하기</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export const LatestBlogs: React.FC = () => {
  return (
    <section id="blog" className="py-24 bg-white">
      <SectionContainer>
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">최신 인사이트</h2>
          <Button variant="secondary">블로그 보러가기</Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {BLOGS.map((blog, idx) => (
            <a key={idx} href="#" className="group block">
              <div className="aspect-square rounded-2xl overflow-hidden mb-6 bg-gray-100">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{blog.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{blog.date}</span>
                <span>•</span>
                <span>{blog.category}</span>
              </div>
            </a>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
};

export const DownloadSection: React.FC = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-[1400px] mx-auto rounded-3xl bg-[#121317] text-white relative overflow-hidden min-h-[500px] flex items-center">
        <div className="absolute inset-0 opacity-30">
           <ParticleCanvas theme="dark" />
        </div>
        
        <div className="relative z-10 px-8 md:px-24 py-12 w-full">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 max-w-2xl leading-tight">
            D-PLOG와 함께<br/>위기를 기회로<br/>바꾸세요
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-200 transition-colors">
              <Apple className="w-5 h-5" />
              App Store
            </button>
            <button className="flex items-center justify-center gap-3 bg-transparent border border-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm">
              <MonitorPlay className="w-5 h-5" />
              Web Console
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
