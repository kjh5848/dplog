'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Plus, X, Search, Sparkles, Loader2, TrendingUp, BarChart3 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import { useKeywordManager } from '@/entities/store/model/useKeywordManager';
import { useKeywordSuggestion } from '@/entities/store/model/useKeywordSuggestion';
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore';
import type { KeywordSuggestion } from '@/entities/store/model/types';

export const KeywordStrategyStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'prospective'; // 'prospective' | 'existing'
  const isExisting = userType === 'existing';

  // 온보딩 스토어에서 storeId 가져오기
  const { storeId } = useOnboardingStore();

  // 키워드 매니저 ViewModel (storeId가 있을 때만 실제 API 호출)
  const keywordManager = useKeywordManager(storeId ?? 0);

  // 연관 키워드 추천 ViewModel
  const suggestion = useKeywordSuggestion();

  // 추천 드롭다운 표시 여부
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Prospective 유저용 로컬 상태 (API 호출 없이 URL 파라미터로 전달)
  const [prospectiveKeywords, setProspectiveKeywords] = useState<string[]>([]);
  const [prospectiveInput, setProspectiveInput] = useState('');

  // Existing 유저용 추가 상태 (target 키워드는 로컬만)
  const [targetKeywords, setTargetKeywords] = useState<string[]>([]);
  const [targetInput, setTargetInput] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'target'>('current');
  
  // Prospective 전용 상태
  const [hasIdea, setHasIdea] = useState<boolean | null>(null);

  // 추천 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── 추천 키워드 선택 ──────────────────────────────────
  const handleSelectSuggestion = (kw: KeywordSuggestion) => {
    if (isExisting) {
      if (activeTab === 'current') {
        keywordManager.addKeyword(kw.keyword);
      } else {
        if (!targetKeywords.includes(kw.keyword) && targetKeywords.length < 5) {
          setTargetKeywords([...targetKeywords, kw.keyword]);
        }
      }
    } else {
      if (!prospectiveKeywords.includes(kw.keyword) && prospectiveKeywords.length < 5) {
        setProspectiveKeywords([...prospectiveKeywords, kw.keyword]);
      }
    }
    setShowSuggestions(false);
  };

  // ─── 인풋 변경 시 추천 검색 트리거 ──────────────────────
  const handleInputChange = (value: string) => {
    if (isExisting) {
      if (activeTab === 'current') {
        keywordManager.setInputValue(value);
      } else {
        setTargetInput(value);
      }
    } else {
      setProspectiveInput(value);
    }
    // 추천 검색 시작
    suggestion.searchSuggestions(value);
    if (value.trim().length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // ─── Prospective 키워드 추가/삭제 ──────────────────────
  const handleAddProspectiveKeyword = () => {
    if (!prospectiveInput.trim() || prospectiveKeywords.length >= 5) return;
    setProspectiveKeywords([...prospectiveKeywords, prospectiveInput.trim()]);
    setProspectiveInput('');
    setShowSuggestions(false);
    suggestion.clearSuggestions();
  };

  const removeProspectiveKeyword = (index: number) => {
    setProspectiveKeywords(prospectiveKeywords.filter((_, i) => i !== index));
  };

  // ─── Target 키워드 추가/삭제 ──────────────────────────
  const handleAddTargetKeyword = () => {
    if (!targetInput.trim() || targetKeywords.length >= 5) return;
    setTargetKeywords([...targetKeywords, targetInput.trim()]);
    setTargetInput('');
    setShowSuggestions(false);
    suggestion.clearSuggestions();
  };

  const removeTargetKeyword = (index: number) => {
    setTargetKeywords(targetKeywords.filter((_, i) => i !== index));
  };

  // ─── Current 키워드 추가 (keywordManager 사용) ────────
  const handleAddCurrentKeyword = () => {
    keywordManager.addKeyword();
    setShowSuggestions(false);
    suggestion.clearSuggestions();
  };

  // ─── 다음 단계 핸들러 ─────────────────────────────────
  const handleNext = async () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (isExisting && storeId) {
      // Existing 유저: 실제 API로 키워드 세트 저장
      const allKeywords = [...keywordManager.keywords, ...targetKeywords];
      if (allKeywords.length > 0) {
        for (const kw of targetKeywords) {
          keywordManager.addKeyword(kw);
        }
        const success = await keywordManager.saveKeywords();
        if (!success) return; // 저장 실패 시 중단
      }
      params.set('current_keywords', keywordManager.keywords.join(','));
      params.set('target_keywords', targetKeywords.join(','));
      router.push(`/complete?${params.toString()}`);
    } else {
      // Prospective 유저: URL 파라미터로만 전달
      if (hasIdea) {
        params.set('keywords', prospectiveKeywords.join(','));
      } else {
        params.set('keywords', 'auto_recommend');
      }
      router.push(`/complete?${params.toString()}`);
    }
  };

  // ─── 추천 결과 드롭다운 공통 컴포넌트 ──────────────────
  const SuggestionDropdown = () => {
    if (!showSuggestions) return null;

    return (
      <AnimatePresence>
        <motion.div
          ref={suggestionRef}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
        >
          {suggestion.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              추천 키워드 검색 중...
            </div>
          ) : suggestion.error ? (
            <div className="py-3 px-4 text-sm text-red-500">{suggestion.error}</div>
          ) : suggestion.suggestions.length === 0 ? (
            <div className="py-3 px-4 text-sm text-slate-400">추천 키워드가 없습니다</div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  연관 키워드 추천 (클릭하여 추가)
                </p>
              </div>
              {suggestion.suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                      {s.keyword}
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-slate-500">
                        <TrendingUp className="w-3 h-3" />
                        {suggestion.getTotalSearchCount(s).toLocaleString()}/월
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full font-bold",
                        s.competitionIndex === '높음' || s.competitionIndex === 'HIGH'
                          ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          : s.competitionIndex === '중간' || s.competitionIndex === 'MEDIUM'
                            ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      )}>
                        {suggestion.getCompetitionLabel(s.competitionIndex)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1 text-xs text-slate-400">
                    <span>PC {parseInt(s.monthlyPcSearchCount).toLocaleString()}</span>
                    <span>모바일 {parseInt(s.monthlyMobileSearchCount).toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  // ------------------------------------------------------------------
  // Render: Prospective User View
  // ------------------------------------------------------------------
  if (!isExisting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            생각해둔 아이템이나<br className="md:hidden" /> 키워드가 있나요?
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            구체적인 아이템이 있다면 알려주세요. <br/>
            아직 없어도 괜찮습니다. AI가 트렌드를 분석해 추천해드립니다.
          </p>
        </div>

        <div className="flex gap-4 mb-10 w-full max-w-md">
           <button
             onClick={() => setHasIdea(true)}
             className={cn(
               "flex-1 py-4 rounded-xl border-2 font-bold transition-all",
               hasIdea === true
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 hover:border-blue-200 text-slate-600"
             )}
           >
             네, 있어요
           </button>
           <button
             onClick={() => setHasIdea(false)}
             className={cn(
               "flex-1 py-4 rounded-xl border-2 font-bold transition-all",
               hasIdea === false
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 hover:border-blue-200 text-slate-600"
             )}
           >
             아직 없어요
           </button>
        </div>

        {hasIdea === true && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full max-w-md space-y-4 mb-8"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                value={prospectiveInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                    handleAddProspectiveKeyword();
                  }
                }}
                onFocus={() => {
                  if (suggestion.suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="예: 샐러드, 성수동 카페, 비건 베이커리"
                className="pl-10 h-12 text-lg"
              />
              <button 
                onClick={handleAddProspectiveKeyword}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4 text-slate-600" />
              </button>
              <SuggestionDropdown />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {prospectiveKeywords.map((keyword, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {keyword}
                  <button onClick={() => removeProspectiveKeyword(idx)}>
                    <X className="w-3 h-3 hover:text-blue-900" />
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        )}

        <Button
          onClick={handleNext}
          disabled={hasIdea === null || (hasIdea === true && prospectiveKeywords.length === 0)}
          size="lg"
          className="w-full max-w-md h-12 text-lg rounded-xl"
        >
          {hasIdea === false ? 'AI 추천 받기' : '다음 단계로'}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Render: Existing User View (실제 API 연동)
  // ------------------------------------------------------------------
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          우리 매장의 핵심 키워드
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          현재 고객들이 주로 검색하는 키워드와<br/>
          앞으로 노출하고 싶은 키워드를 알려주세요. (최대 5개)
        </p>
      </div>

      {/* 에러 메시지 */}
      {keywordManager.error && (
        <div className="w-full max-w-md mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{keywordManager.error.message}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex w-full max-w-md bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-8">
        <button
          onClick={() => setActiveTab('current')}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all",
            activeTab === 'current'
              ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          현재 키워드 ({keywordManager.keywords.length}/5)
        </button>
        <button
          onClick={() => setActiveTab('target')}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-bold transition-all",
            activeTab === 'target'
              ? "bg-white dark:bg-slate-700 text-blue-600 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          )}
        >
          희망 노출 키워드 ({targetKeywords.length}/5)
        </button>
      </div>

      {/* Input Area */}
      <div className="w-full max-w-md space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            value={activeTab === 'current' ? keywordManager.inputValue : targetInput}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                if (activeTab === 'current') {
                  handleAddCurrentKeyword();
                } else {
                  handleAddTargetKeyword();
                }
              }
            }}
            onFocus={() => {
              if (suggestion.suggestions.length > 0) setShowSuggestions(true);
            }}
            placeholder={activeTab === 'current' ? "예: 강남 맛집, 수제 버거" : "예: 강남 데이트 코스, 핫플"}
            className="pl-10 h-12 text-lg"
            disabled={
              activeTab === 'current' 
                ? keywordManager.keywords.length >= 5 
                : targetKeywords.length >= 5
            }
          />
          <button 
            onClick={() => {
              if (activeTab === 'current') {
                handleAddCurrentKeyword();
              } else {
                handleAddTargetKeyword();
              }
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            disabled={
              activeTab === 'current' 
                ? keywordManager.keywords.length >= 5 
                : targetKeywords.length >= 5
            }
          >
            <Plus className="w-4 h-4 text-slate-600" />
          </button>
          <SuggestionDropdown />
        </div>
        
        {/* Chips */}
        <div className="min-h-[100px] p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          {(activeTab === 'current' ? keywordManager.keywords : targetKeywords).length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
              <Sparkles className="w-8 h-8 mb-2 opacity-50" />
              <p>키워드를 입력해서 추가해보세요</p>
              <p className="text-xs mt-1 text-slate-300">2글자 이상 입력하면 연관 키워드가 추천됩니다</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(activeTab === 'current' ? keywordManager.keywords : targetKeywords).map((keyword, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">
                  {keyword}
                  <button onClick={() => {
                    if (activeTab === 'current') {
                      keywordManager.removeKeyword(idx);
                    } else {
                      removeTargetKeyword(idx);
                    }
                  }}>
                    <X className="w-3 h-3 hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col gap-3">
        <Button
          onClick={handleNext}
          disabled={keywordManager.isSaving}
          size="lg"
          className="w-full h-12 text-lg rounded-xl"
        >
          {keywordManager.isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            '진단 완료하기'
          )}
        </Button>
        <button
          onClick={handleNext}
          disabled={keywordManager.isSaving}
          className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-4 disabled:opacity-50"
        >
          잘 모르겠어요, AI 추천 받을게요 (건너뛰기)
        </button>
      </div>
    </div>
  );
};
