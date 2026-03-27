import React from 'react';
import { CompareKeywordData } from '@/src/viewModel/nplace/keword/nplaceRankKeywordCompareViewModel';
import KeywordCompareView from './KeywordCompareView';
import KeywordReportView from './KeywordReportView';
import { LayoutGrid, FileText, BarChart2 } from "lucide-react";
import KeywordGridView from './KeywordGridView';

interface KeywordContentProps {
  selectedKeyword: string | null;
  compareData: CompareKeywordData | null;
  activeTab: 'compare' | 'report' | 'grid';
  getRankChangeString: (current: number, previous: number) => string;
  onChangeTab: (tab: 'compare' | 'report' | 'grid') => void;
  getRankString: (rank: number | null) => string;
}

export default function KeywordContent({
  selectedKeyword,
  compareData,
  activeTab,
  getRankChangeString,
  onChangeTab,
  getRankString
}: KeywordContentProps) {
  if (!selectedKeyword) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-primary-100 bg-gradient-keyword text-gray-500">
        키워드를 선택해주세요
      </div>
    );
  }

  return (
    <div>
      {/* 탭 메뉴 */}
      <div className="mb-4 flex items-center justify-between border-b border-primary-200">
        
        
        {/* 뷰 모드 토글 버튼 */}
        <div className="flex space-x-1">
          <button
            type="button"
            onClick={() => onChangeTab('compare')}
            className={`rounded-md p-2 ${
              activeTab === 'compare'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="비교 뷰"
          >
            <BarChart2 size={18} />
          </button>
          <button
            type="button"
            onClick={() => onChangeTab('grid')}
            className={`rounded-md p-2 ${
              activeTab === 'grid'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="그리드 뷰"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            type="button"
            onClick={() => onChangeTab('report')}
            className={`rounded-md p-2 ${
              activeTab === 'report'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label="리포트 뷰"
          >
            <FileText size={18} />
          </button>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      {activeTab === 'compare' && (
        <KeywordCompareView 
          data={compareData}
          getRankChangeString={getRankChangeString}
          getRankString={getRankString}
        />
      )}
      
      {activeTab === 'report' && (
        <KeywordReportView
          trackList={compareData?.trackList || []}
          shopName={""}
          keyword={selectedKeyword}
          compareData={compareData || null}
        />
      )}

      {activeTab === 'grid' && compareData && (
        <div className="card-keyword p-4">
          <h2 className="mb-4 text-lg font-semibold">상세 데이터</h2>
          <KeywordGridView
            trackList={compareData.trackList}
            gridColumns={2}
          />
        </div>
      )}
    </div>
  );
};

