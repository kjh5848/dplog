/**
 * [Role]   N-BLOG 노출조회 페이지
 * [Input]  블로그 URL 입력
 * [Output] 노출 상태 결과 표시
 * [NOTE]   Client Component · API 연동 · 인증 필요
 */

"use client";

import { useState, useEffect } from "react";
import { Search, AlertCircle, CheckCircle, XCircle, Loader2, Copy, Trash2 } from "lucide-react";
import NBlogRepository from "@/src/model/NBlogRepository";
import { NBlogSearchResult } from "@/types/nblog";
import { useAuthGuard } from "@/src/utils/auth";
import LoadingFallback from "@/src/components/common/LoadingFallback";
import { loadingUtils } from "@/src/utils/loading";
import DplogHeader from "@/src/components/common/Headers/DplogHeader";
import { logError } from '@/src/utils/logger';
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// 컴포넌트 임포트
import SearchableInputForm from "@/components/nblog/seachable/SearchableInputForm";
import SearchableResultList from "@/src/components/nblog/seachable/SearchableResultList";
import SearchableGuide from "@/src/components/nblog/seachable/SearchableGuide";

export default function SearchablePage() {
  const router = useRouter();
  const { isLoading, isGuest, isLogoutPending } = useAuthGuard();

  const [inputText, setInputText] = useState("");
  const [results, setResults] = useState<NBlogSearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL 파싱 함수
  const parseUrls = (text: string): string[] => {
    return text
      .split(/[,\n]/)
      .map(url => url.trim())
      .filter(url => url.length > 0)
      .map(url => NBlogRepository.normalizeUrl(url))
      .filter(url => NBlogRepository.validateUrl(url));
  };

  // 단일 URL 검색
  const handleSingleSearch = async (url: string) => {
    try {
      const response = await NBlogRepository.checkSearchable(url);
      if (response.code === "0" && response.data) {
        const result: NBlogSearchResult = {
          url: response.data.nblog.url,
          searchable: response.data.nblog.searchable,
          reason: response.data.nblog.reason
        };
        setResults(prev => [result, ...prev]);
      } else {
        setError("API 응답 오류가 발생했습니다.");
      }
    } catch (error) {
      setError("검색 중 오류가 발생했습니다.");
    }
  };

  // 배치 검색
  const handleBatchSearch = async () => {
    const urls = parseUrls(inputText);
    if (urls.length === 0) {
      setError("유효한 네이버 블로그 URL을 입력해주세요.");
      return;
    }

    setIsSearchLoading(true);
    setError(null);

    try {
      const response = await NBlogRepository.checkSearchableBatch(urls);
      if (response.code === "0" && response.data) {
        const newResults: NBlogSearchResult[] = response.data.results.map(result => ({
          url: result.nblog.url,
          searchable: result.nblog.searchable,
          reason: result.nblog.reason
        }));
        setResults(prev => [...newResults, ...prev]);
        setInputText("");
      } else {
        setError("일괄 검색 중 오류가 발생했습니다.");
      }
    } catch (error) {
      setError("일괄 검색 중 오류가 발생했습니다.");
    } finally {
      setIsSearchLoading(false);
    }
  };

  // URL 복사
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // 복사 성공 알림 (선택사항)
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("클립보드 복사 실패", errorObj, { operation: 'copyToClipboard' });
    }
  };

  // 결과 삭제
  const removeResult = (index: number) => {
    setResults(prev => prev.filter((_, i) => i !== index));
  };

  // 모든 결과 삭제
  const clearAllResults = () => {
    setResults([]);
  };

  // 게스트 사용자 처리
  useEffect(() => {
    if (isGuest && !isLogoutPending) {
      toast.error("로그인 후 이용해주세요.", {
        id: 'guest-redirect',
        duration: 3000
      });
      router.push("/login");
    }
  }, [isGuest, isLogoutPending, router]);

  // 인증 상태에 따른 로딩 처리
  if (isLoading) {
    // 로그아웃 중일 때는 다른 메시지 표시
    if (isLogoutPending) {
      return <LoadingFallback config={loadingUtils.logoutAuth()} />;
    }
    return <LoadingFallback config={loadingUtils.guestAuth()} />;
  }

  if (isGuest) {
    return <LoadingFallback config={loadingUtils.loginRedirect()} />;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl mt-10 items-center">
        {/* 헤더 */}
        <DplogHeader title="N-BLOG" message="노출조회" />
        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600">
            네이버 블로그 URL의 검색 노출 상태를 확인하세요
          </p>
        </div>

        {/* 입력 폼 */}
        <SearchableInputForm
          inputText={inputText}
          isLoading={isSearchLoading}
          error={error}
          onInputChange={setInputText}
          onSearch={handleBatchSearch}
          onClearAll={clearAllResults}
          hasResults={results.length > 0}
        />

        {/* 결과 목록 */}
        <SearchableResultList
          results={results}
          onRemoveResult={removeResult}
          onCopyUrl={copyToClipboard}
        />

        {/* 사용 가이드 */}
        <SearchableGuide
          isLoading={isSearchLoading}
          hasResults={results.length > 0}
        />
      </div>
    </div>
  );
}
