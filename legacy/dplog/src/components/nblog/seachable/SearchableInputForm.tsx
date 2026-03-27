/**
 * [Role]   N-BLOG 노출조회 입력 폼 컴포넌트
 * [Input]  URL 입력 텍스트, 로딩 상태, 에러 메시지
 * [Output] 검색 실행, 전체 삭제 액션
 * [NOTE]   Client Component · 폼 처리
 */

"use client";

import { Search, AlertCircle, Loader2, Trash2 } from "lucide-react";

interface SearchableInputFormProps {
  inputText: string;
  isLoading: boolean;
  error: string | null;
  onInputChange: (text: string) => void;
  onSearch: () => void;
  onClearAll: () => void;
  hasResults: boolean;
}

export default function SearchableInputForm({
  inputText,
  isLoading,
  error,
  onInputChange,
  onSearch,
  onClearAll,
  hasResults
}: SearchableInputFormProps) {
  return (
    <div className="card-primary mb-8 p-6">
      <div className="mb-4">
        <label htmlFor="urlInput" className="mb-2 block text-sm font-semibold text-gray-700">
          블로그 URL 입력
        </label>
        <div className="flex gap-2">
          <textarea
            id="urlInput"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="네이버 블로그 URL을 입력하세요. 여러 개는 쉼표(,) 또는 줄바꿈으로 구분하세요.
예시: https://blog.naver.com/example/123456789"
            className="flex-1 rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            rows={4}
            disabled={isLoading}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          여러 URL을 쉼표(,) 또는 줄바꿈으로 구분하여 입력할 수 있습니다.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onSearch}
          disabled={isLoading || !inputText.trim()}
          className="from-rank-primary to-rank-secondary flex items-center gap-2 rounded-lg bg-gradient-to-r px-6 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          {isLoading ? "검색 중..." : "노출 상태 조회"}
        </button>

        {hasResults && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Trash2 className="h-4 w-4" />
            전체 삭제
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
} 