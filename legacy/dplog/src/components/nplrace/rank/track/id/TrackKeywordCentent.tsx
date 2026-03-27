/**
 * [역할] 키워드별 트랙 데이터 표시 및 뷰 모드 관리
 * [입력] 선택된 키워드, 상점 정보, 뷰 모드 설정
 * [출력] 키워드별 독립적인 그리드/리포트 뷰
 * [NOTE] 키워드별 뷰 모드 상태 관리 적용
 */
import React from "react";
import { LayoutGrid, FileText } from "lucide-react";
import TrackReportView from "./(report)/TrackReportView";
import TrackGridView from "./TrackGridView";
import TrackGridViewV4 from "./TrackGridViewV4";
import { Shop } from "@/src/model/TrackRepository";
import { useViewModeStore } from "@/src/store/stores/view/useViewModeStore";

// ViewMode 타입 정의 (page.tsx에서 사용하는 타입과 일치시켜야 함)
type ViewMode = "grid" | "list" | "report";

interface TrackKeywordContentProps {
  selectedTrackInfos: Set<string>;
  openAccordions: string[];
  toggleAccordion: (key: string) => void;
  shop: Shop;
  getNplaceRankTrackList: (key: string) => any[];
  getRankString: (rank: number | null) => string;
  // viewMode와 setViewMode는 더 이상 props로 받지 않음
}

export default function TrackKeywordContent({
  selectedTrackInfos,
  openAccordions,
  toggleAccordion,
  shop,
  getNplaceRankTrackList,
  getRankString,
}: TrackKeywordContentProps) {
  
  // 키워드별 뷰 모드 관리
  const { getKeywordViewMode, setKeywordViewMode } = useViewModeStore();

  return (
    <>
      {Array.from(selectedTrackInfos).map((key) => {
        // 각 키워드별로 독립적인 뷰 모드 가져오기
        const keywordViewMode = getKeywordViewMode(shop.id?.toString() || '', key);
        const setKeywordViewModeForThis = (mode: ViewMode) => {
          setKeywordViewMode(shop.id?.toString() || '', key, mode);
        };

        return (
          <div key={key} className="mb-2 rounded-lg border border-gray-300 bg-white">
            <button
              className="flex w-full items-center justify-between rounded-t-lg bg-gray-50 px-4 py-3 hover:bg-gray-100"
              onClick={() => toggleAccordion(key)}
              aria-expanded={openAccordions.includes(key)}
            >
              <div>
                <span className="font-semibold text-gray-900">{key}</span>
                <span className="ml-2 block text-xs text-gray-500 sm:inline">
                  {shop.nplaceRankTrackInfoMap?.[key]?.province}
                  {shop.nplaceRankTrackInfoMap?.[key]?.rank !== undefined &&
                    ` • ${getRankString(shop.nplaceRankTrackInfoMap?.[key]?.rank ?? null)}`}
                </span>
              </div>
              <span className="ml-2 text-lg text-gray-400">
                {openAccordions.includes(key) ? "▲" : "▼"}
              </span>
            </button>
            {openAccordions.includes(key) && (
              <div className="border-t border-gray-300 bg-white px-4 py-4">
                <div className="mb-4 flex gap-2">
                  <button
                    className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${keywordViewMode === "grid" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                    onClick={() => setKeywordViewModeForThis("grid")}
                  >
                    <LayoutGrid size={16} className="mr-2" /> 그리드
                  </button>
                  <button
                    className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium ${keywordViewMode === "report" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                    onClick={() => setKeywordViewModeForThis("report")}
                  >
                    <FileText size={16} className="mr-2" /> 리포트
                  </button>
                </div>
                {keywordViewMode === "report" ? (
                  <TrackReportView
                    trackList={getNplaceRankTrackList(key) || []}
                    shopName={shop.shopName || ""}
                    keyword={key}
                    shopId={shop.id || ""}
                  />
                ) : (
                  <TrackGridViewV4 
                    trackList={getNplaceRankTrackList(key) || []} 
                    getRankString={getRankString}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
