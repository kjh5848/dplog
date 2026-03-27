'use client';

import React from 'react';
import { SectionContainer, Button } from './ui/Common';
import { FEATURES, ICONS_LIST } from '../constants';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

export const VideoSection: React.FC = () => {
  return (
    <section className="py-12 md:py-24">
      <SectionContainer>
        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-900 group cursor-pointer">
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-white/20">
              <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
            </div>
          </div>
          <video 
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
            autoPlay 
            muted 
            loop 
            playsInline
            poster="https://picsum.photos/1920/1080"
          >
             {/* Placeholder video source */}
             <source src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
          </video>
          
          <div className="absolute bottom-8 left-8 text-white z-20 max-w-lg">
            <h3 className="text-2xl font-bold mb-2">AI 에이전트가 만드는 매출의 변화</h3>
            <p className="text-gray-200">원인 분석에서 마케팅 실행까지, D-PLOG의 10분 루틴을 확인하세요.</p>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
};

export const AgentFirst: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <SectionContainer className="text-center">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            D-PLOG is <span className="text-blue-600">Action-First</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            단순한 조회(Dashboard)에서 벗어나 실질적인 산출물(Artifacts)을 제공합니다. <br/>
            플랫폼 알고리즘과 고비용 대행사에 의존하지 않는, 데이터 주권과 자생력을 키우세요.
          </p>
        </div>

        {/* Floating Icons Grid */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-5xl mx-auto opacity-80">
          {ICONS_LIST.map((Item, idx) => (
            <motion.div 
              key={idx} 
              className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center"
              initial={{ y: 0 }}
              animate={{ y: -10 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
              whileHover={{ y: -5, scale: 1.05 }}
            >
              <Item.Icon className="w-8 h-8 text-gray-700" strokeWidth={1.5} />
            </motion.div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
};

export const FeatureExplorer: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <SectionContainer>
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 [text-wrap:balance]">
            AI 중심 경영, <span className="text-blue-600">이제 사장님이 직접</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto [text-wrap:balance]">
            데이터 분석부터 콘텐츠 생성까지, D-PLOG의 핵심 기능을 확인하세요.
          </p>
        </div>

        <div className="flex flex-col gap-32">
          {FEATURES.map((feature, index) => (
            <div key={index} className={`flex flex-col lg:flex-row gap-12 lg:gap-24 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="flex-1 space-y-6">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-xl text-gray-600 leading-relaxed text-balance">
                  {feature.description}
                </p>
                <div className="pt-4">
                  <Button variant="text" className="text-lg font-semibold flex items-center gap-2">
                    자세히 보기 <Play className="w-4 h-4 fill-current" />
                  </Button>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-inner border border-gray-200 group">
                   <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                      {/* Simple illustration if video fails or placeholder */}
                      <video 
                        className="w-full h-full object-cover"
                        autoPlay muted loop playsInline
                        src={feature.videoSrc}
                      />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>
    </section>
  );
};
