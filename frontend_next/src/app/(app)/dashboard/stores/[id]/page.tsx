'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { Sparkles, MapPin, Tag, Users, Star, BookOpen, Loader2 } from 'lucide-react';
import { fetchStoreKeywordsStatus, startKeywordDiscovery } from '@/entities/store/api/storeApi';

// Type definitions (usually in types.ts)
interface Store {
  id: number;
  name: string;
  category: string;
  address: string;
  placeUrl?: string;
  thumUrl?: string; // This was stored in DB? I will use shopImageUrl
  shopImageUrl?: string;
  visitor_reviews: number;
  blog_reviews: number;
  saves: number;
  rating: number;
}

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = Number(params.id);

  const [store, setStore] = useState<Store | null>(null);
  const [seedKeyword, setSeedKeyword] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('');
  const [status, setStatus] = useState<any>(null); // To store polling status
  const [isDiscovering, setIsDiscovering] = useState(false);

  // Example presets generator based on category/address
  const getPresets = (store: Store) => {
    if (!store) return [];
    
    // Simplistic text splitting for address
    const loc = store.address.split(' ')[0] + ' ' + (store.address.split(' ')[1] || '');
    const cat = store.category.split(',')[0] || store.category; // pick primary category
    
    return [
      `${loc} ${cat}`,
      `${loc} ${cat} 추천`,
      `${loc} 맛집`,
      `${store.name} 예약`,
      `${store.address.split(' ')[1]} 주변 ${cat}`
    ];
  };

  useEffect(() => {
    if (!storeId) return;

    // Fetch Store Detail
    fetch(`http://localhost:8000/v1/stores/${storeId}`)
      .then(res => res.json())
      .then(data => {
        setStore(data);
      })
      .catch(err => console.error("Failed to load store", err));
      
    // Initial status polling
    // Initial status polling
    pollStatus();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // Polling logic for keyword status
  async function pollStatus() {
    try {
      const data = await fetchStoreKeywordsStatus(storeId);
      setStatus(data);
      if (data && data.status === 'IN_PROGRESS') {
        setIsDiscovering(true);
        setTimeout(pollStatus, 5000); // Pool every 5 seconds
      } else {
        setIsDiscovering(false);
      }
    } catch {
      setIsDiscovering(false);
    }
  }

  const handleStartDiscovery = async () => {
    if (!seedKeyword.trim()) {
      alert("시드 키워드를 입력하거나 선택해주세요.");
      return;
    }
    
    setIsDiscovering(true);
    setLoadingMsg('황금키워드 모듈 가동 중... (약 1분 소요)');
    try {
      await startKeywordDiscovery(storeId, seedKeyword);
      pollStatus(); // start polling 
    } catch (e) {
      alert("API 오작동");
      setIsDiscovering(false);
    }
  };

  if (!store) {
    return <div className="p-8">Loading store information...</div>;
  }

  const presets = getPresets(store);

  return (
    <div className="space-y-8 pb-12 w-full max-w-5xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">황금키워드 자동 발굴 대시보드</h1>
          <p className="text-slate-500 font-medium italic">&quot;데이터 기반의 빈틈없는 SEO 타겟 키워드를 추천합니다.&quot;</p>
        </div>
      </div>

      {/* 1. STORE INFO WIDGET */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row gap-6 p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl shadow-lg"
      >
        <div className="relative w-48 h-48 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-white/10 bg-slate-100">
          {store.shopImageUrl ? (
            <img src={store.shopImageUrl} alt={store.name} className="object-cover w-full h-full" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-slate-400">No Image</div>
          )}
        </div>
        <div className="flex flex-col flex-grow py-2">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{store.name}</h2>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold flex items-center gap-1">
              <Tag className="size-3" />
              {store.category}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-6 font-medium">
            <MapPin className="size-4" />
            {store.address}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-auto">
            <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-100 dark:border-white/5">
              <div className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1"><Users className="size-3" /> 방문자리뷰</div>
              <div className="font-black text-lg">{store.visitor_reviews.toLocaleString()}</div>
            </div>
            <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-100 dark:border-white/5">
              <div className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1"><BookOpen className="size-3" /> 블로그리뷰</div>
              <div className="font-black text-lg">{store.blog_reviews.toLocaleString()}</div>
            </div>
            <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-100 dark:border-white/5">
              <div className="text-xs text-slate-400 font-bold mb-1 flex items-center gap-1"><Star className="size-3" /> 별점 평점</div>
              <div className="font-black text-lg">{store.rating > 0 ? store.rating : '-'}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. KEYWORD DISCOVERY ENGINE */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
        className="p-8 rounded-[40px] border border-blue-200 dark:border-blue-900 bg-white dark:bg-slate-900 shadow-xl shadow-blue-500/5 relative overflow-hidden"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
            <Sparkles className="size-5 text-blue-500" />
            추천 시드(Seed) 키워드 칩
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            AI가 분석한 가게 주소와 카테고리를 기반으로 조합된 추천 키워드입니다. 클릭 시 아래 입력 폼에 즉시 주입됩니다.
          </p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setSeedKeyword(preset)}
                className="px-4 py-2 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 rounded-full text-sm font-bold border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-all active:scale-95"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-8"></div>

        <div>
          <h3 className="text-xl font-bold mb-4">시드 키워드로 파생/황금 키워드 발굴</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="예: 대전 빵집 (또는 상단 추천 프리셋을 클릭하세요)"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              className="flex-grow px-5 py-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              disabled={isDiscovering}
            />
            <button
              onClick={handleStartDiscovery}
              disabled={isDiscovering || !seedKeyword}
              className="px-8 py-4 bg-blue-600 disabled:bg-slate-400 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 shrink-0"
            >
              {isDiscovering ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  {status?.status === 'IN_PROGRESS' ? '발굴 진행 중...' : '요청 중...'}
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  엔진 가동 (자동 추출)
                </>
              )}
            </button>
          </div>
          {isDiscovering && (
             <motion.div 
               initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
               className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-bold flex items-center gap-3 border border-blue-100 dark:border-blue-900/50"
             >
               <Loader2 className="size-5 animate-spin" />
               <p>백그라운드 환경에서 네이버 플레이스 심층 분석(1~2분 소요)이 가동됩니다. 잠시만 기다려주세요⏳</p>
             </motion.div>
          )}
        </div>
      </motion.div>

      {/* 3. RESULTS AREA (if COMPLETED) */}
      {status?.status === 'COMPLETED' && status.result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="p-8 rounded-[40px] bg-white dark:bg-black border border-emerald-200 dark:border-emerald-900 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black text-emerald-600 flex items-center gap-2">
              <Sparkles className="size-6" /> 발굴 성공
            </h3>
            <span className="text-sm text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">
              시드: {status.seed_keyword}
            </span>
          </div>

          {/* Just dumping the JSON results for now, wait we can show groups! */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['high', 'mid', 'low'].map((tier) => {
               const tierKeywords = status.result[tier] || [];
               return (
                 <div key={tier} className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5">
                   <h4 className="font-bold text-lg mb-3 uppercase flex items-center justify-between">
                     {tier} Tier
                     <span className="text-xs bg-white dark:bg-black px-2 py-1 rounded-md text-slate-500">{tierKeywords.length}건</span>
                   </h4>
                   <div className="space-y-2">
                     {tierKeywords.length > 0 ? tierKeywords.map((kw: any, i: number) => (
                       <div key={i} className="bg-white dark:bg-black/40 p-3 rounded-lg border border-slate-100 dark:border-white/5 shadow-sm text-sm flex justify-between font-medium">
                         <span>{kw.keyword}</span>
                         <span className="text-emerald-500">🏆 {kw.score || 0}점</span>
                       </div>
                     )) : (
                       <div className="text-slate-400 text-sm italic">해당 등급 키워드 없음</div>
                     )}
                   </div>
                 </div>
               )
            })}
          </div>
        </motion.div>
      )}

      {status?.status === 'FAILED' && (
        <motion.div className="p-6 bg-rose-50 text-rose-600 rounded-3xl border border-rose-200 font-bold">
          앗, 발굴 중 오류가 발생했습니다: {status.error}
        </motion.div>
      )}

    </div>
  );
}
