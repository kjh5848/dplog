/**
 * [Role]   N-BLOG 노출조회 사용 가이드 컴포넌트
 * [Input]  로딩 상태, 결과 존재 여부
 * [Output] 가이드 메시지 표시
 * [NOTE]   Client Component · 사용자 안내
 */

"use client";

import { Search } from "lucide-react";

interface SearchableGuideProps {
  isLoading: boolean;
  hasResults: boolean;
}

export default function SearchableGuide({
  isLoading,
  hasResults
}: SearchableGuideProps) {
  // 로딩 중이거나 결과가 있으면 가이드를 표시하지 않음
  if (isLoading || hasResults) {
    return null;
  }

  return (
    <div className="card-secondary p-6 text-center">
      <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
      <h3 className="mb-2 text-lg font-semibold text-gray-700">
        블로그 URL을 입력해주세요
      </h3>
      <p className="text-gray-600">
        네이버 블로그 URL을 입력하면 검색 노출 상태를 확인할 수 있습니다.
      </p>
    </div>
  );
} 