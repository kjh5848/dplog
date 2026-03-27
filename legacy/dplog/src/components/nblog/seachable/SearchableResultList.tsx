/**
 * [Role]   N-BLOG 노출조회 결과 목록 컴포넌트
 * [Input]  검색 결과 배열
 * [Output] 결과 삭제, URL 복사 액션
 * [NOTE]   Client Component · 결과 목록 표시
 */

"use client";

import { NBlogSearchResult } from "@/types/nblog";
import SearchableResultCard from "./SearchableResultCard";

interface SearchableResultListProps {
  results: NBlogSearchResult[];
  onRemoveResult: (index: number) => void;
  onCopyUrl: (url: string) => void;
}

export default function SearchableResultList({
  results,
  onRemoveResult,
  onCopyUrl
}: SearchableResultListProps) {
  if (results.length === 0) {
    return null;
  }

  const searchableCount = results.filter(r => r.searchable).length;
  const unsearchableCount = results.filter(r => !r.searchable).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          검색 결과 ({results.length}개)
        </h2>
        <div className="text-sm text-gray-500">
          {searchableCount}개 노출 가능 / {unsearchableCount}개 노출 불가
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result, index) => (
          <SearchableResultCard
            key={`${result.url}-${index}`}
            result={result}
            index={index}
            onRemove={onRemoveResult}
            onCopyUrl={onCopyUrl}
          />
        ))}
      </div>
    </div>
  );
} 