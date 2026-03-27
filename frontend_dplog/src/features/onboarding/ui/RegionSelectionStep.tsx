'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, MapPin } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const RegionSelectionStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleNext = () => {
    if (!selectedRegion) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('region', selectedRegion);

    // Phase 4 Routing Logic
    const duration = params.get('duration');
    if (duration === 'prospective') {
      // Prospective users: Analysis (Region) -> Business Item Selection
      router.push(`/05-item-selection?${params.toString()}`);
    } else {
      // Existing User -> Store Data Collection
      router.push(`/03-store-data?${params.toString()}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const regions = [
    { id: 'seoul', label: '서울', icon: 'location_city' },
    { id: 'busan', label: '부산', icon: 'sailing' },
    { id: 'daegu', label: '대구', icon: 'temple_buddhist' },
    { id: 'incheon', label: '인천', icon: 'flight_takeoff' },
    { id: 'gwangju', label: '광주', icon: 'palette' },
    { id: 'daejeon', label: '대전', icon: 'science' },
    { id: 'ulsan', label: '울산', icon: 'factory' },
    { id: 'sejong', label: '세종', icon: 'account_balance' },
    { id: 'gyeonggi', label: '경기', icon: 'subway' },
    { id: 'gangwon', label: '강원', icon: 'landscape' },
    { id: 'chungbuk', label: '충북', icon: 'nature' },
    { id: 'chungnam', label: '충남', icon: 'agriculture' },
    { id: 'jeonbuk', label: '전북', icon: 'rice_bowl' },
    { id: 'jeonnam', label: '전남', icon: 'water_drop' },
    { id: 'gyeongbuk', label: '경북', icon: 'history_edu' },
    { id: 'gyeongnam', label: '경남', icon: 'precision_manufacturing' },
    { id: 'jeju', label: '제주', icon: 'sunny' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          어디서 시작하시나요?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          사업자 등록 예정지 혹은 현재 사업장 소재지를 선택해주세요.<br className="hidden md:block"/>
          해당 지역의 지원금 및 맞춤형 혜택을 찾아드립니다.
        </p>
      </div>

      {/* Region Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 w-full mb-10">
        {regions.map((region) => (
          <motion.div
            key={region.id}
            onClick={() => setSelectedRegion(region.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 aspect-[1/0.8]",
              "bg-white dark:bg-slate-800",
              selectedRegion === region.id
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400"
                : "border-transparent border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:shadow-lg"
            )}
          >
            {selectedRegion === region.id && (
              <div className="absolute top-2 right-2 text-blue-500 dark:text-blue-400">
                <CheckCircle className="w-4 h-4" />
              </div>
            )}
            
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shadow-sm mb-2 transition-colors",
              selectedRegion === region.id
                ? "bg-white dark:bg-slate-800 text-blue-500"
                : "bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:text-blue-500"
            )}>
              <MapPin className="w-5 h-5" />
            </div>

            <div className="text-center">
               <p className={cn(
                 "text-lg font-bold transition-colors",
                 selectedRegion === region.id ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white"
               )}>
                 {region.label}
               </p>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between w-full border-t border-slate-200 dark:border-slate-800 pt-6">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedRegion}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all",
            selectedRegion
              ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
              : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
          )}
        >
          다음 단계
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
