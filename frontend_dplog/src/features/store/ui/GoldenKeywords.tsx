import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import * as storeApi from '@/entities/store/api/storeApi';
import * as keywordApi from '@/entities/store/api/keywordApi';
import * as rankingApi from '@/features/ranking/api/rankingApi';
import { useRouter } from 'next/navigation';

interface GoldenKeywordsProps {
  storeId: number;
  storeName: string;
  /** 여러 개 선택된 시드 키워드 배열 */
  presetKeywords?: string[];
}

export function GoldenKeywords({ storeId, storeName, presetKeywords }: GoldenKeywordsProps) {
  const [seedKeyword, setSeedKeyword] = useState('');
  const router = useRouter();
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const cleanStoreName = storeName.replace(' 랭킹 추이', '').trim();

  // 선택된 프리셋 키워드들 반영 (쉼표 구분)
  useEffect(() => {
    if (presetKeywords && presetKeywords.length > 0) {
      setSeedKeyword(presetKeywords.join(', '));
    }
  }, [presetKeywords]);

  // 컴포넌트 마운트 시 로컬스토리지 쿨다운 확인
  useEffect(() => {
    const lastRun = localStorage.getItem(`keyword_cooldown_${storeId}`);
    if (lastRun) {
      const diff = Math.floor((Date.now() - parseInt(lastRun)) / 1000);
      if (diff < 180) { // 3분 대기
        setCooldownRemaining(180 - diff);
      }
    }
  }, [storeId]);

  // 1초 단위 쿨다운 감소 타이머
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // 최초 진입 시 이전 태스크 확인
  useEffect(() => {
    let active = true;
    const fetchStatus = async () => {
      try {
        const res = await storeApi.getKeywordStatus(storeId);
        if (res.status === 'IN_PROGRESS' || res.status === 'PENDING') {
          setTaskId(res.task_id);
          setIsDiscovering(true);
        } else if (res.status === 'COMPLETED' && res.result) {
          processResultData(res.result);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStatus();
    return () => {
      active = false;
    };
  }, [storeId]);

  // 폴링
  useEffect(() => {
    if (!taskId || !isDiscovering) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await storeApi.getKeywordStatus(storeId);
        if (res.status === 'COMPLETED') {
          setIsDiscovering(false);
          setTaskId(null);
          localStorage.setItem(`keyword_cooldown_${storeId}`, Date.now().toString());
          setCooldownRemaining(180);
          showToast('🔥 데이터 발굴이 완료되었습니다!');
          if (res.result) {
            processResultData(res.result);
          }
        } else if (res.status === 'FAILED') {
          setIsDiscovering(false);
          setTaskId(null);
          localStorage.setItem(`keyword_cooldown_${storeId}`, Date.now().toString());
          setCooldownRemaining(180);
          showToast(`발굴 오류: ${res.error || '서버 타임아웃'}`);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [taskId, isDiscovering, storeId]);

  const processResultData = (data: any) => {
    const allItems: any[] = [];
    const kws = data.keywords || data;

    if (kws.high) kws.high.forEach((item: any) => allItems.push({ ...item, level: 'high' }));
    if (kws.mid) kws.mid.forEach((item: any) => allItems.push({ ...item, level: 'mid' }));
    if (kws.low) kws.low.forEach((item: any) => allItems.push({ ...item, level: 'low' }));

    setResults(allItems);
  };

  const handleDiscover = async () => {
    if (!seedKeyword.trim()) {
      showToast('💡 고객 검색 동선을 파악할 대표 메인 키워드를 입력해주세요.');
      return;
    }
    setIsDiscovering(true);
    setResults([]);

    try {
      const res = await storeApi.discoverKeywords(storeId, seedKeyword.trim());
      setTaskId(res.task_id);
      showToast('황금키워드 자동 발굴이 시작되었습니다. (최대 3분 소요)');
    } catch (err) {
      console.error(err);
      setIsDiscovering(false);
      showToast('네트워크 API 통신 에러가 발생했습니다.');
    }
  };

  const handleAddKeyword = (kw: string) => {
    // 백그라운드로 API 요청 (결과를 기다리지 않음)
    rankingApi.registerTrack(storeId, kw, '서울').catch(err => console.error(err));
    
    const msg = `✅ '${kw}' 키워드 추적을 실행합니다!\n\n순위 대시보드로 이동합니다.`;
    window.alert(msg);
    router.push('/dashboard/ranking');
  };

  return (
    <div className="bg-white border border-orange-200 rounded-2xl shadow-sm relative mt-8 overflow-hidden">
      {/* 토스트 메시지 */}
      {toastMessage && (
        <div className="absolute top-4 right-4 bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
          {toastMessage}
        </div>
      )}

      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
          🔥 고객 동선 기반 SEO 황금 키워드 발굴 (BETA)
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          실제 마케팅(SEO) 타겟이 될 핵심 키워드들을 발굴하고 모바일 검색 시 내 가게의 노출 현황을 한눈에 점검합니다.
        </p>
      </div>

      <div className="p-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={seedKeyword}
            onChange={(e) => setSeedKeyword(e.target.value)}
            placeholder="대표 메인 키워드 1개 입력 (예: 서면 고기집)"
            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-slate-900 placeholder-slate-400 disabled:opacity-50"
            disabled={isDiscovering || cooldownRemaining > 0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isDiscovering && cooldownRemaining <= 0) handleDiscover();
            }}
          />
          <button
            onClick={handleDiscover}
            disabled={isDiscovering || cooldownRemaining > 0}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center min-w-[140px]
              ${
                isDiscovering || cooldownRemaining > 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md hover:shadow-orange-200 hover:shadow-lg'
              }`}
          >
            {isDiscovering ? (
              <span className="flex items-center text-xs sm:text-sm">
                분석 중 (최대 3분 소요)
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              </span>
            ) : cooldownRemaining > 0 ? (
              `⏳ ${Math.floor(cooldownRemaining / 60)}분 ${String(cooldownRemaining % 60).padStart(2, '0')}초 대기`
            ) : (
              '발굴 시작 🚀'
            )}
          </button>
        </div>
        
        {/* V2 프로모션 안내 */}
        {cooldownRemaining > 0 && (
          <div className="flex justify-end md:pr-2 mt-2 -mb-2">
            <span className="text-[11px] md:text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded flex items-center gap-1.5">
              <span>⚡</span> 지연 없이 여러 키워드를 연속 발굴하는 기능은 V2(Pro)에서 지원 예정입니다.
            </span>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="overflow-x-auto border-t border-slate-100">
          <table className="w-full text-left text-sm">
            {/* ── 헤더 ── */}
            <thead className="bg-slate-50 border-b-2 border-slate-200">
              <tr>
                <th className="px-4 py-3 text-center text-slate-500 font-semibold text-xs tracking-wider w-20">강도</th>
                <th className="px-4 py-3 text-slate-700 font-bold text-xs tracking-wider">추천 키워드</th>
                <th className="px-4 py-3 text-slate-500 font-semibold text-xs tracking-wider whitespace-nowrap">발생 출처</th>
                <th className="px-4 py-3 text-right text-slate-800 font-bold text-xs tracking-wider bg-amber-50">총 검색량</th>
                <th className="px-4 py-3 text-center text-emerald-700 font-bold text-xs tracking-wider">노출 상태</th>
                <th className="px-4 py-3 text-center text-orange-600 font-bold text-xs tracking-wider whitespace-nowrap">PLACE 순위</th>
                <th className="px-4 py-3 text-right text-teal-700 font-semibold text-xs tracking-wider">출현 빈도</th>
                <th className="px-4 py-3 text-right text-blue-700 font-semibold text-xs tracking-wider whitespace-nowrap">PC 검색</th>
                <th className="px-4 py-3 text-right text-pink-700 font-semibold text-xs tracking-wider whitespace-nowrap">MO 검색</th>
                <th className="px-4 py-3 text-right text-blue-600 font-semibold text-xs tracking-wider">PC 클릭</th>
                <th className="px-4 py-3 text-right text-pink-600 font-semibold text-xs tracking-wider">MO 클릭</th>
                <th className="px-4 py-3 text-right text-blue-600 font-semibold text-xs tracking-wider">PC CTR</th>
                <th className="px-4 py-3 text-right text-pink-600 font-semibold text-xs tracking-wider">MO CTR</th>
                <th className="px-4 py-3 text-center text-purple-700 font-semibold text-xs tracking-wider">경쟁정도</th>
                <th className="px-4 py-3 text-right text-slate-600 font-semibold text-xs tracking-wider">광고수</th>
                <th className="px-4 py-3 text-center text-slate-500 font-semibold text-xs tracking-wider">동작</th>
              </tr>
            </thead>
            {/* ── 바디 ── */}
            <tbody className="divide-y divide-slate-100">
              {results.map((item, idx) => (
                <tr key={idx} className="hover:bg-orange-50/50 transition-colors">
                  {/* 강도 뱃지 */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {item.level === 'high' && (
                      <span className="inline-flex items-center justify-center gap-1 py-1 px-3 text-xs font-bold bg-red-100 text-red-600 border border-red-200 rounded-full">
                        🔥 상
                      </span>
                    )}
                    {item.level === 'mid' && (
                      <span className="inline-flex items-center justify-center gap-1 py-1 px-3 text-xs font-bold bg-orange-100 text-orange-600 border border-orange-200 rounded-full">
                        🚀 중
                      </span>
                    )}
                    {item.level === 'low' && (
                      <span className="inline-flex items-center justify-center gap-1 py-1 px-3 text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full">
                        ⭐ 하
                      </span>
                    )}
                  </td>
                  {/* 추천 키워드 */}
                  <td className="px-4 py-3 font-bold text-slate-900 break-keep lg:min-w-[180px] text-sm cursor-pointer hover:text-orange-500 transition-colors select-all">
                    {(() => {
                      if (!seedKeyword.trim()) return item.keyword;
                      const parts = item.keyword.split(new RegExp(`(${seedKeyword})`, 'gi'));
                      return (
                        <span>
                          {parts.map((part: string, i: number) =>
                            part.toLowerCase() === seedKeyword.toLowerCase() ? (
                              <span key={i} className="text-red-500 font-black">{part}</span>
                            ) : (
                              part
                            )
                          )}
                        </span>
                      );
                    })()}
                  </td>
                  {/* 발생 출처 */}
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="truncate max-w-[110px] text-slate-500" title={item.parent || ''}>
                        {item.parent || '-'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 border border-slate-200 font-mono">
                        D{item.depth || 1}
                      </span>
                    </div>
                  </td>
                  {/* 총 검색량 — 가장 중요한 숫자, 강조 */}
                  <td className="px-4 py-3 text-right bg-amber-50/50">
                    <span className="text-base font-black text-amber-700 font-mono">
                      {(item.total_vol || 0).toLocaleString()}
                    </span>
                  </td>
                  {/* 노출 상태 */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    {item.is_exposed ? (
                      <span className="bg-emerald-100 text-emerald-700 border border-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold">노출 ⭕</span>
                    ) : (
                      <span className="bg-red-50 text-red-400 border border-red-200 px-2.5 py-1 rounded-full text-xs font-medium">미노출 ❌</span>
                    )}
                  </td>
                  {/* PLACE 순위 */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex flex-col items-center gap-1">
                      {item.place_rank > 0 ? (
                        <span className="bg-orange-100 text-orange-700 border border-orange-300 px-2.5 py-1 rounded-full text-xs font-bold">
                          {item.place_rank}위
                        </span>
                      ) : (
                        <span className="text-slate-300 font-medium text-sm">—</span>
                      )}
                      {item.ad_rank > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full text-xs font-bold">
                          광고 {item.ad_rank}위
                        </span>
                      )}
                    </div>
                  </td>
                  {/* 출현 빈도 */}
                  <td className="px-4 py-3 text-right">
                    {item.exposure_count > 0 ? (
                      <span className="text-teal-600 font-bold text-sm">{item.exposure_count}회</span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  {/* PC 검색량 */}
                  <td className="px-4 py-3 text-right font-mono font-bold text-blue-600 text-sm">
                    {(item.pc_vol || 0).toLocaleString()}
                  </td>
                  {/* MO 검색량 */}
                  <td className="px-4 py-3 text-right font-mono font-bold text-pink-600 text-sm">
                    {(item.mobile_vol || 0).toLocaleString()}
                  </td>
                  {/* PC 클릭 */}
                  <td className="px-4 py-3 text-right font-mono text-blue-500 text-sm">
                    {(item.pc_click_cnt || 0)}
                  </td>
                  {/* MO 클릭 */}
                  <td className="px-4 py-3 text-right font-mono text-pink-500 text-sm">
                    {(item.mobile_click_cnt || 0)}
                  </td>
                  {/* PC CTR */}
                  <td className="px-4 py-3 text-right font-mono text-blue-600 text-sm font-semibold">
                    {(item.pc_click_rate || 0)}%
                  </td>
                  {/* MO CTR */}
                  <td className="px-4 py-3 text-right font-mono text-pink-600 text-sm font-bold">
                    {(item.mobile_click_rate || 0)}%
                  </td>
                  {/* 경쟁정도 */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        item.comp_level === '높음'
                          ? 'bg-red-100 text-red-600 border-red-200'
                          : item.comp_level === '낮음'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.comp_level || '보통'}
                    </span>
                  </td>
                  {/* 광고수 */}
                  <td className="px-4 py-3 text-right font-mono text-slate-600 text-sm font-semibold">
                    {item.ads_count || 0}
                  </td>
                  {/* 동작 버튼 */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleAddKeyword(item.keyword)}
                      className="px-4 py-1.5 bg-white hover:bg-indigo-600 text-indigo-600 hover:text-white text-xs font-bold rounded-lg border-2 border-indigo-300 hover:border-indigo-600 transition-all shadow-sm"
                    >
                      + 추가
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

