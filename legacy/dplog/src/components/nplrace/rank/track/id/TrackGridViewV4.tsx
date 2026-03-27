/**
 * [역할] 추적 데이터를 컴팩트한 테이블 형태로 표시
 * [입력] TrackData 배열, 그리드 컬럼 수, 컨트롤 옵션
 * [출력] 간결한 텍스트 기반 표 형식의 렌더링
 * [NOTE] 상태관리 통합 적용
 */
import { TrackData } from "@/src/model/TrackRepository";
import { useState, useMemo, useEffect } from "react";
import { useIsMobile } from "@/src/hooks/useMediaQuery";
import { useTrackGridStore } from "@/src/store/stores/track/useTrackGridStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { isWithinInterval, parseISO, subDays } from "date-fns";

interface TrackGridViewV4Props {
  trackList: TrackData[];
  hideControls?: boolean;
  onItemClick?: (trackData: TrackData) => void;
  getRankString?: (rank: number | null) => string;
  selectedTrackData?: TrackData | null;
}

// 변화량 계산 함수
function getChangeDataV4(current: number | null, previous: number | null) {
  if (!current || !previous) return { text: "", icon: "", color: "" };
  const diff = current - previous;
  if (diff === 0) return { text: "", icon: "", color: "" };
  if (diff > 0) return { 
    text: diff.toString(), 
    icon: "▲", 
    color: "text-red-600" 
  };
  return { 
    text: Math.abs(diff).toString(), 
    icon: "▼", 
    color: "text-blue-600" 
  };
}

function getRankChangeDataV4(currentRank: number | null, prevRank: number | null) {
  if (!currentRank || !prevRank) return { text: "", icon: "", color: "" };
  const diff = prevRank - currentRank;
  if (diff === 0) return { text: "", icon: "", color: "" };
  if (diff > 0) return { 
    text: diff.toString(), 
    icon: "▲", 
    color: "text-red-600" 
  };
  return { 
    text: Math.abs(diff).toString(), 
    icon: "▼", 
    color: "text-blue-600" 
  };
}

function getChangeDataV4Extended(current: number | string | null, prev: number | string | null) {
  if (!current || !prev) return { text: "", icon: "", color: "" };
  const currentVal = typeof current === 'string' ? parseInt(current.replace(/,/g, "")) : current;
  const prevVal = typeof prev === 'string' ? parseInt(prev.replace(/,/g, "")) : prev;
  const diff = currentVal - prevVal;
  if (diff === 0) return { text: "", icon: "", color: "" };
  if (diff > 0) return { 
    text: diff.toLocaleString(), 
    icon: "▲", 
    color: "text-red-600" 
  };
  return { 
    text: Math.abs(diff).toLocaleString(), 
    icon: "▼", 
    color: "text-blue-600" 
  };
}

// 날짜 포맷팅 함수
function formatDate(date: string) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[d.getDay()];
  return `${month}.${day}.(${weekday}) ${hour}:${minute}`;
}

// 숫자 포맷팅 함수
function formatNumber(num: number | null | undefined) {
  if (!num) return "0";
  return num.toLocaleString();
}

export default function TrackGridViewV4({
  trackList,
  hideControls = false,
  onItemClick,
  getRankString,
  selectedTrackData,
}: TrackGridViewV4Props) {
  const isMobile = useIsMobile();
  
  // 🔄 상태관리 통합: 기존 로컬 상태 → 전역 상태
  const {
    getCurrentColumns,
    setMobileColumns,
    setDesktopColumns,
    getTextSize,
    getValidColumnRange,
  } = useTrackGridStore();
  
  const gridColumns = getCurrentColumns(isMobile);
  const textSizeClass = getTextSize(isMobile, gridColumns);
  const validColumnRange = getValidColumnRange(isMobile);
  
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() => {
    const end = new Date();
    const start = subDays(end, 6);
    return [start, end];
  });
  
  const [startDate, endDate] = dateRange;

  const handleItemClick = (trackData: TrackData) => {
    if (onItemClick) {
      onItemClick(trackData);
    }
  };

  // 🔄 열 수 변경 핸들러 업데이트
  const handleColumnChange = (columns: number) => {
    if (isMobile) {
      setMobileColumns(columns);
    } else {
      setDesktopColumns(columns);
    }
  };

  const filteredTrackList = useMemo(() => {
    if (!startDate || !endDate) return trackList;
    
    return trackList.filter(track => {
      const trackDate = parseISO(track.chartDate);
      return isWithinInterval(trackDate, { start: startDate, end: endDate });
    });
  }, [trackList, startDate, endDate]);

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = subDays(end, days - 1);
    setDateRange([start, end]);
  };

  if (!trackList || trackList.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center bg-gray-50 border border-gray-300">
        <p className="text-gray-500">추적 중...</p>
      </div>
    );
  }

  const isAllRanksOutOfRange = filteredTrackList.every(track => 
    track.rank === null || track.rank === -1 || track.rank === 0
  );

  if (isAllRanksOutOfRange && filteredTrackList.length > 0) {
    return (
      <div className="flex h-32 items-center justify-center bg-red-50 border border-red-300">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold">순위권에서 이탈되었습니다</div>
          <p className="text-red-500 text-sm">해당 키워드에서 순위를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const DatePickerComponent = () => (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <h3 className="text-sm font-semibold text-gray-700">필터</h3>
        <div className="h-4 w-px bg-gray-300" />
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuickSelect(7)}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            7일
          </button>
          <button
            onClick={() => handleQuickSelect(30)}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            30일
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)}
          dateFormat="yyyy.MM.dd"
          locale={ko}
          placeholderText="날짜 범위 선택"
          className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none sm:w-auto"
          isClearable={true}
        />
        {startDate && endDate && (
          <button
            onClick={() => setDateRange([null, null])}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-3">
        {!hideControls && (
          <div className="flex flex-col space-y-2">
            <DatePickerComponent />
            <div className="flex items-center justify-end space-x-2">
              <label className="text-sm font-medium text-gray-700">열 수:</label>
              <select
                value={gridColumns}
                onChange={(e) => handleColumnChange(Number(e.target.value))}
                className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
              >
                {validColumnRange.map((num) => (
                  <option key={num} value={num}>
                    {num}열
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className={`grid gap-1 ${gridColumns === 1 ? "grid-cols-1" : gridColumns === 2 ? "grid-cols-2" : gridColumns === 3 ? "grid-cols-3" : "grid-cols-4"}`}>
          {filteredTrackList.map((track, index) => {
            const prevTrack = trackList[index + 1] || null;
            const rankChange = getRankChangeDataV4(track.rank, prevTrack?.rank);
            const visitorChange = getChangeDataV4Extended(track.visitorReviewCount, prevTrack?.visitorReviewCount);
            const blogChange = getChangeDataV4Extended(track.blogReviewCount, prevTrack?.blogReviewCount);
            const scoreChange = getChangeDataV4Extended(track.scoreInfo, prevTrack?.scoreInfo);
            const saveCountChange = getChangeDataV4Extended(track.saveCount, prevTrack?.saveCount);

            const isSelected = selectedTrackData && 
              selectedTrackData.chartDate === track.chartDate &&
              selectedTrackData.rank === track.rank;

            return (
              <div
                key={index}
                className={`border cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
                onClick={() => handleItemClick(track)}
              >
                {/* 날짜 헤더 */}
                <div className="bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 text-center border-b border-gray-300">
                  {formatDate(track.chartDate)}
                </div>

                {/* 각 행별 구조 - 3열 */}
                <div>
                  {/* 순위 */}
                  <div className="grid grid-cols-3 border-b border-gray-300">
                    <div className="px-2 py-1 text-center bg-gray-50 border-r border-gray-300">
                      <div className={`${textSizeClass} font-medium text-gray-700`}>순위</div>
                    </div>
                    <div className="px-2 py-1 text-left border-r border-gray-300">
                      <div className={`${textSizeClass} text-gray-900`}>
                        {getRankString ? getRankString(track.rank) : `${track.rank || "-"}위`}
                      </div>
                    </div>
                    <div className="px-2 py-1 text-center">
                      <div className={`${textSizeClass} font-semibold ${rankChange.text ? rankChange.color : 'text-gray-400'}`}>
                        {rankChange.text ? `${rankChange.icon}${rankChange.text}` : '-'}
                      </div>
                    </div>
                  </div>
                  
                  {/* 평점 */}
                  <div className="grid grid-cols-3 border-b border-gray-300">
                    <div className="px-2 py-1 text-center bg-gray-50 border-r border-gray-300">
                      <div className={`${textSizeClass} font-medium text-gray-700`}>평점</div>
                    </div>
                    <div className="px-2 py-1 text-left border-r border-gray-300">
                      <div className={`${textSizeClass} text-gray-900`}>
                        {track.scoreInfo || "0"}
                      </div>
                    </div>
                    <div className="px-2 py-1 text-center">
                      <div className={`${textSizeClass} font-semibold ${scoreChange.text ? scoreChange.color : 'text-gray-400'}`}>
                        {scoreChange.text ? `${scoreChange.icon}${scoreChange.text}` : '-'}
                      </div>
                    </div>
                  </div>
                  
                  {/* 블로그 */}
                  <div className="grid grid-cols-3 border-b border-gray-300">
                    <div className="px-2 py-1 text-center bg-gray-50 border-r border-gray-300">
                      <div className={`${textSizeClass} font-medium text-gray-700`}>블로그</div>
                    </div>
                    <div className="px-2 py-1 text-left border-r border-gray-300">
                      <div className={`${textSizeClass} text-gray-900`}>
                        {formatNumber(track.blogReviewCount)}
                      </div>
                    </div>
                    <div className="px-2 py-1 text-center">
                      <div className={`${textSizeClass} font-semibold ${blogChange.text ? blogChange.color : 'text-gray-400'}`}>
                        {blogChange.text ? `${blogChange.icon}${blogChange.text}` : '-'}
                      </div>
                    </div>
                  </div>
                  
                  {/* 방문자 */}
                  <div className="grid grid-cols-3 border-b border-gray-300">
                    <div className="px-2 py-1 text-center bg-gray-50 border-r border-gray-300">
                      <div className={`${textSizeClass} font-medium text-gray-700`}>방문자</div>
                    </div>
                    <div className="px-2 py-1 text-left border-r border-gray-300">
                      <div className={`${textSizeClass} text-gray-900`}>
                        {formatNumber(track.visitorReviewCount)}
                      </div>
                    </div>
                    <div className="px-2 py-1 text-center">
                      <div className={`${textSizeClass} font-semibold ${visitorChange.text ? visitorChange.color : 'text-gray-400'}`}>
                        {visitorChange.text ? `${visitorChange.icon}${visitorChange.text}` : '-'}
                      </div>
                    </div>
                  </div>
                  
                  {/* 저장수 */}
                  <div className="grid grid-cols-3">
                    <div className="px-2 py-1 text-center bg-gray-50 border-r border-gray-300">
                      <div className={`${textSizeClass} font-medium text-gray-700`}>저장</div>
                    </div>
                    <div className="px-2 py-1 text-left border-r border-gray-300">
                      <div className={`${textSizeClass} text-gray-900`}>
                        {track.saveCount || "0"}
                      </div>
                    </div>
                    <div className="px-2 py-1 text-center">
                      <div className={`${textSizeClass} font-semibold ${saveCountChange.text ? saveCountChange.color : 'text-gray-400'}`}>
                        {saveCountChange.text ? `${saveCountChange.icon}${saveCountChange.text}` : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {!hideControls && (
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <DatePickerComponent />
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">열 수:</label>
            <select
              value={gridColumns}
              onChange={(e) => handleColumnChange(Number(e.target.value))}
              className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
            >
              {validColumnRange.map((num) => (
                <option key={num} value={num}>
                  {num}열
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className={`grid gap-1 ${
        gridColumns === 3 ? "grid-cols-3" :
        gridColumns === 4 ? "grid-cols-4" :
        gridColumns === 5 ? "grid-cols-5" :
        gridColumns === 6 ? "grid-cols-6" :
        "grid-cols-7"
      }`}>
        {filteredTrackList.map((track, index) => {
          const prevTrack = trackList[index + 1] || null;
          const rankChange = getRankChangeDataV4(track.rank, prevTrack?.rank);
          const visitorChange = getChangeDataV4Extended(track.visitorReviewCount, prevTrack?.visitorReviewCount);
          const blogChange = getChangeDataV4Extended(track.blogReviewCount, prevTrack?.blogReviewCount);
          const scoreChange = getChangeDataV4Extended(track.scoreInfo, prevTrack?.scoreInfo);
          const saveCountChange = getChangeDataV4Extended(track.saveCount, prevTrack?.saveCount);

          const isSelected = selectedTrackData && 
            selectedTrackData.chartDate === track.chartDate &&
            selectedTrackData.rank === track.rank;

          return (
            <div
              key={index}
              className={`border cursor-pointer transition-colors ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
              onClick={() => handleItemClick(track)}
            >
              {/* 날짜 헤더 */}
              <div className="bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 text-center border-b border-gray-300">
                {formatDate(track.chartDate)}
              </div>

              {/* 각 행별 구조 - 3열 */}
              <div>
                {/* 순위 */}
                <div className="grid grid-cols-3 border-b border-gray-300">
                  <div className="px-2 py-1 text-center bg-gray-50 border-r border-gray-300">
                    <div className={`${gridColumns >= 6 ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>순위</div>
                  </div>
                  <div className="px-2 py-1 text-left border-r border-gray-300">
                    <div className={`${gridColumns >= 6 ? 'text-xs' : 'text-sm'} text-gray-900`}>
                      {getRankString ? getRankString(track.rank) : `${track.rank || "-"}위`}
                    </div>
                  </div>
                  <div className="px-2 py-1 text-center">
                    <div className={`${gridColumns >= 6 ? 'text-xs' : 'text-sm'} font-semibold ${rankChange.text ? rankChange.color : 'text-gray-400'}`}>
                      {rankChange.text ? `${rankChange.icon}${rankChange.text}` : '-'}
                    </div>
                  </div>
                </div>
                
                {/* 블로그 */}
                <div className="grid grid-cols-3 border-b border-gray-300">
                  <div className="px-2 py-1 text-center bg-gray-50 border-r border-gray-300">
                    <div className={`${gridColumns >= 6 ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>블로그</div>
                  </div>
                  <div className="px-2 py-1 text-left border-r border-gray-300">
                    <div className={`${gridColumns >= 6 ? 'text-xs' : 'text-sm'} text-gray-900`}>
                      {formatNumber(track.blogReviewCount)}
                    </div>
                  </div>
                  <div className="px-2 py-1 text-center">
                    <div className={`${gridColumns >= 6 ? 'text-xs' : 'text-sm'} font-semibold ${blogChange.text ? blogChange.color : 'text-gray-400'}`}>
                      {blogChange.text ? `${blogChange.icon}${blogChange.text}` : '-'}
                    </div>
                  </div>
                </div>
                
                {/* 방문자 */}
                <div className="grid grid-cols-3 border-b border-gray-300">
                  <div className="px-2 py-1 text-center bg-gray-50 border-r border-gray-300">
                    <div className={`${gridColumns >= 6 ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>방문자</div>
                  </div>
                  <div className="px-2 py-1 text-left border-r border-gray-300">
                    <div className={`${gridColumns >= 6 ? 'text-xs' : 'text-sm'} text-gray-900`}>
                      {formatNumber(track.visitorReviewCount)}
                    </div>
                  </div>
                  <div className="px-2 py-1 text-center">
                    <div className={`${gridColumns >= 6 ? 'text-xs' : 'text-sm'} font-semibold ${visitorChange.text ? visitorChange.color : 'text-gray-400'}`}>
                      {visitorChange.text ? `${visitorChange.icon}${visitorChange.text}` : '-'}
                    </div>
                  </div>
                </div>
                
                {/* 저장수 */}
                <div className="grid grid-cols-3">
                  <div className="px-2 py-1 text-center bg-gray-50 border-r border-gray-300">
                    <div className={`${gridColumns >= 6 ? 'text-xs' : 'text-sm'} font-medium text-gray-700`}>저장</div>
                  </div>
                  <div className="px-2 py-1 text-left border-r border-gray-300">
                    <div className={`${gridColumns >= 6 ? 'text-xs' : 'text-sm'} text-gray-900`}>
                      {track.saveCount || "0"}
                    </div>
                  </div>
                  <div className="px-2 py-1 text-center">
                    <div className={`${gridColumns >= 6 ? 'text-xs' : 'text-sm'} font-semibold ${saveCountChange.text ? saveCountChange.color : 'text-gray-400'}`}>
                      {saveCountChange.text ? `${saveCountChange.icon}${saveCountChange.text}` : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 