'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Globe, FileText, Camera, Edit3, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';

type InputMethod = 'url' | 'biz_num' | 'ocr' | 'manual';

export const StoreDataCollectionStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<InputMethod>('url');
  
  // Dummy Inputs
  const [url, setUrl] = useState('');
  const [bizNum, setBizNum] = useState('');
  
  const handleNext = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('data_method', method);
    
    // In a real app, we would validate/submit here
    // Route to Menu Info Step
    router.push(`/04-menu-info?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          매장 정보를 확인해볼까요?
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          정확한 진단을 위해 운영 중인 매장의 정보를 입력해주세요.<br/>
          네이버 플레이스 정보가 있다면 가장 빠르고 정확합니다.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex w-full mb-8 overflow-x-auto pb-2 md:pb-0 gap-2 md:gap-4 no-scrollbar">
        <TabButton 
          active={method === 'url'} 
          onClick={() => setMethod('url')} 
          icon={Globe} 
          label="네이버 플레이스" 
        />
        <TabButton 
          active={method === 'biz_num'} 
          onClick={() => setMethod('biz_num')} 
          icon={FileText} 
          label="사업자번호" 
        />
        <TabButton 
          active={method === 'ocr'} 
          onClick={() => setMethod('ocr')} 
          icon={Camera} 
          label="사업자등록증" 
        />
        <TabButton 
          active={method === 'manual'} 
          onClick={() => setMethod('manual')} 
          icon={Edit3} 
          label="직접 입력" 
        />
      </div>

      {/* Content Area */}
      <motion.div
        key={method}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg mb-8 min-h-[300px]"
      >
        {method === 'url' && (
          <div className="space-y-6">
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700 dark:text-slate-300">네이버 지도(플레이스) 주소</label>
               <Input 
                 placeholder="예: https://map.naver.com/p/entry/place/12345678" 
                 value={url}
                 onChange={(e) => setUrl(e.target.value)}
                 className="h-12"
               />
               <p className="text-xs text-slate-500">
                 * 플레이스 주소를 입력하시면 메뉴, 리뷰, 영업시간 등을 자동으로 분석합니다.
               </p>
             </div>
             
             <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
               <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
               <div className="text-sm text-blue-800 dark:text-blue-200">
                 <strong>추천!</strong> 가장 상세한 데이터를 기반으로 정확한 진단 리포트를 받아보실 수 있습니다.
               </div>
             </div>
          </div>
        )}

        {method === 'biz_num' && (
          <div className="space-y-6">
             <div className="space-y-2">
               <label className="text-sm font-bold text-slate-700 dark:text-slate-300">사업자등록번호 (10자리)</label>
               <Input 
                 placeholder="예: 123-45-67890" 
                 value={bizNum}
                 onChange={(e) => setBizNum(e.target.value)}
                 className="h-12"
               />
             </div>
             <p className="text-sm text-slate-500">
               * 국세청 홈택스 정보를 기반으로 업종과 소재지를 확인합니다.
             </p>
          </div>
        )}

        {method === 'ocr' && (
          <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 transition-colors cursor-pointer">
             <Camera className="w-12 h-12 text-slate-400 mb-4" />
             <p className="text-slate-600 dark:text-slate-300 font-medium">
               사업자등록증 사진을 업로드해주세요
             </p>
             <p className="text-xs text-slate-400 mt-2">
               또는 여기로 파일을 드래그하세요
             </p>
          </div>
        )}

        {method === 'manual' && (
          <div className="space-y-6">
             <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg flex items-start gap-3 border border-amber-200 dark:border-amber-800">
               <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
               <div className="text-sm text-amber-800 dark:text-amber-200">
                 <strong>주의:</strong> 직접 입력 시 데이터의 정확도가 떨어져 분석 결과가 실제와 다를 수 있습니다.
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-bold">상호명</label>
                 <Input placeholder="예: 맛있는 식당" />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-bold">업종</label>
                 <Input placeholder="예: 한식" />
               </div>
               <div className="space-y-2 md:col-span-2">
                 <label className="text-sm font-bold">주소</label>
                 <Input placeholder="매장 상세 주소" />
               </div>
             </div>
          </div>
        )}
      </motion.div>

      <Button
        onClick={handleNext}
        size="lg"
        className="w-full max-w-md h-12 text-lg rounded-xl"
      >
        다음 단계로
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}

const TabButton = ({ active, onClick, icon: Icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap",
      active
        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md font-bold"
        : "bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
    )}
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm">{label}</span>
  </button>
);
