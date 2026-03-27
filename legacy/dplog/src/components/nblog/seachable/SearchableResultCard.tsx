/**
 * [Role]   N-BLOG 노출조회 결과 카드 컴포넌트
 * [Input]  검색 결과 데이터, 인덱스
 * [Output] 결과 삭제, URL 복사 액션
 * [NOTE]   Client Component · 결과 표시
 */

"use client";

import { CheckCircle, XCircle, Copy } from "lucide-react";
import { NBlogSearchResult } from "@/types/nblog";

interface SearchableResultCardProps {
  result: NBlogSearchResult;
  index: number;
  onRemove: (index: number) => void;
  onCopyUrl: (url: string) => void;
}

export default function SearchableResultCard({
  result,
  index,
  onRemove,
  onCopyUrl
}: SearchableResultCardProps) {
  return (
    <div
      className={`card-primary p-4 transition-all duration-200 hover:shadow-xl ${
        result.searchable ? 'border-green-200' : 'border-red-200'
      }`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {result.searchable ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className={`font-semibold ${
            result.searchable ? 'text-green-700' : 'text-red-700'
          }`}>
            {result.searchable ? '노출 가능' : '노출 불가'}
          </span>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="text-gray-400 hover:text-red-500"
        >
          <XCircle className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3">
        <p className="mb-2 text-xs font-medium text-gray-500">블로그 URL</p>
        <div className="flex items-center gap-2">
          <p className="flex-1 break-all text-sm text-gray-700">
            {result.url}
          </p>
          <button
            onClick={() => onCopyUrl(result.url)}
            className="text-gray-400 hover:text-blue-500"
            title="URL 복사"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      {result.reason && (
        <div>
          <p className="mb-1 text-xs font-medium text-gray-500">사유</p>
          <p className="text-sm text-gray-600 word-break-keep">
            {result.reason}
          </p>
        </div>
      )}
    </div>
  );
} 