import { TrackData } from "@/src/model/TrackRepository";
import { useState, useMemo, useEffect } from "react";
import { useIsMobile } from "@/src/hooks/useMediaQuery";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { isWithinInterval, parseISO, subDays } from "date-fns";

interface TrackGridViewV2Props {
  trackList: TrackData[];
  gridColumns?: number; // 4, 5, 6, ..., 12
  hideControls?: boolean; // 컨트롤 숨김 옵션 추가
  onItemClick?: (trackData: TrackData) => void; // 클릭 핸들러 수정: 전체 trackData 전달
  getRankString?: (rank: number | null) => string; // getRankString 함수 추가
  selectedTrackData?: TrackData | null; // 선택된 트랙 데이터 추가
}

// 변화량에 따른 아이콘과 색상 결정 함수 - V2 개선
function getChangeInfoV2(current: number | null, previous: number | null) {
  if (!current || !previous) return { text: "", icon: "", color: "", bgColor: "" };
  const diff = current - previous;
  if (diff === 0) return { 
    text: "0", 
    icon: "→", 
    color: "text-gray-700", 
    bgColor: "bg-gray-100" 
  };
  if (diff > 0) return { 
    text: `+${diff}`, 
    icon: "↗", 
    color: "text-green-700", 
    bgColor: "bg-green-100" 
  };
  return { 
    text: `${diff}`, 
    icon: "↘", 
    color: "text-red-700", 
    bgColor: "bg-red-100" 
  };
}

// 날짜 포맷팅 함수
function formatDate(date: string) {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[d.getDay()];

  return `${month}.${day}(${weekday})`;
}

// 숫자 포맷팅 함수
function formatNumber(num: number | null | undefined) {
  if (!num) return "-";
  return num.toLocaleString();
}

function getRankChangeStyleV2(currentRank: number | null, prevRank: number | null) {
  if (!currentRank || !prevRank) return { text: "", color: "", icon: "", bgColor: "" };
  const diff = prevRank - currentRank;
  if (diff > 0) return { 
    text: `${diff}`, 
    color: "text-green-700", 
    icon: "↗", 
    bgColor: "bg-green-100" 
  };
  if (diff < 0) return { 
    text: `${Math.abs(diff)}`, 
    color: "text-red-700", 
    icon: "↘", 
    bgColor: "bg-red-100" 
  };
  return { 
    text: "0", 
    color: "text-gray-700", 
    icon: "→", 
    bgColor: "bg-gray-100" 
  };
}

function getChangeStyleV2(current: number | string | null, prev: number | string | null) {
  if (!current || !prev) return { text: "", color: "", icon: "", bgColor: "" };
  const currentVal = typeof current === 'string' ? parseInt(current.replace(/,/g, "")) : current;
  const prevVal = typeof prev === 'string' ? parseInt(prev.replace(/,/g, "")) : prev;
  const diff = currentVal - prevVal;
  if (diff > 0) return { 
    text: `+${diff.toLocaleString()}`, 
    color: "text-green-700", 
    icon: "↗", 
    bgColor: "bg-green-100" 
  };
  if (diff < 0) return { 
    text: `${diff.toLocaleString()}`, 
    color: "text-red-700", 
    icon: "↘", 
    bgColor: "bg-red-100" 
  };
  return { 
    text: "0", 
    color: "text-gray-700", 
    icon: "→", 
    bgColor: "bg-gray-100" 
  };
}

function getSaveCountChangeV2(current: string | number | null, prev: string | number | null) {
  if (!current || !prev) return { text: "", color: "", icon: "", bgColor: "" };
  const currentVal = typeof current === 'string' ? parseInt(current.replace(/,/g, "").replace(/\+/g, "")) : current;
  const prevVal = typeof prev === 'string' ? parseInt(prev.replace(/,/g, "").replace(/\+/g, "")) : prev;
  const diff = currentVal - prevVal;
  if (diff > 0) return { 
    text: `+${diff.toLocaleString()}`, 
    color: "text-green-700", 
    icon: "↗", 
    bgColor: "bg-green-100" 
  };
  if (diff < 0) return { 
    text: `${diff.toLocaleString()}`, 
    color: "text-red-700", 
    icon: "↘", 
    bgColor: "bg-red-100" 
  };
  return { 
    text: "0", 
    color: "text-gray-700", 
    icon: "→", 
    bgColor: "bg-gray-100" 
  };
}

// 변화량 배지 컴포넌트
function ChangeBadge({ change }: { change: { text: string; color: string; icon: string; bgColor: string; } }) {
  if (!change.text) return null;
  
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold ${change.color} ${change.bgColor} border border-opacity-20`}>
      <span className="text-lg mr-1">{change.icon}</span>
      <span>{change.text}</span>
    </div>
  );
}

export default function TrackGridViewV2(
  { trackList, gridColumns: initialGridColumns = 4, hideControls = false, onItemClick, getRankString, selectedTrackData }: TrackGridViewV2Props) {
  const isMobile = useIsMobile();
  
  // 모바일에서는 2열, 데스크톱에서는 전달받은 gridColumns 사용
  const [gridColumns, setGridColumns] = useState(() => 
    isMobile ? 2 : initialGridColumns
  );
  
  // isMobile 상태가 변경될 때 gridColumns 업데이트
  useEffect(() => {
    if (isMobile) {
      setGridColumns(2);
    } else {
      setGridColumns(initialGridColumns);
    }
  }, [isMobile, initialGridColumns]);
  
  // 초기 날짜 범위를 7일로 설정
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() => {
    const end = new Date();
    const start = subDays(end, 6); // 오늘 포함 7일
    return [start, end];
  });
  
  const [startDate, endDate] = dateRange;

  // 아이템 클릭 핸들러
  const handleItemClick = (trackData: TrackData) => {
    if (onItemClick) {
      onItemClick(trackData);
    }
  };

  // 날짜 범위에 따른 필터링
  const filteredTrackList = useMemo(() => {
    if (!startDate || !endDate) return trackList;
    
    return trackList.filter(track => {
      const trackDate = parseISO(track.chartDate);
      return isWithinInterval(trackDate, { start: startDate, end: endDate });
    });
  }, [trackList, startDate, endDate]);

  // 빠른 날짜 선택 핸들러
  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = subDays(end, days - 1); // days - 1을 해야 오늘 포함 N일이 됨
    setDateRange([start, end]);
  };

  if (!trackList || trackList.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg bg-gray-50">
        <p className="text-gray-500 text-lg">추적 중...</p>
      </div>
    );
  }

  // 순위권 이탈 여부 확인 (모든 데이터가 순위권 이탈인 경우)
  const isAllRanksOutOfRange = filteredTrackList.every(track => 
    track.rank === null || track.rank === -1 || track.rank === 0
  );

  if (isAllRanksOutOfRange && filteredTrackList.length > 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-red-50 border-2 border-red-200">
        <div className="text-center">
          <div className="text-red-600 text-2xl font-bold mb-3">⚠️ 순위권에서 이탈되었습니다</div>
          <p className="text-red-500 text-lg">해당 키워드에서 순위를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const DatePickerComponent = () => (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-3">
        <h3 className="text-lg font-semibold text-gray-800">필터</h3>
        <div className="h-6 w-px bg-gray-300" />
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleQuickSelect(7)}
            className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
          >
            7일
          </button>
          <button
            onClick={() => handleQuickSelect(30)}
            className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors"
          >
            30일
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <DatePicker
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => setDateRange(update)}
          dateFormat="yyyy.MM.dd"
          locale={ko}
          placeholderText="날짜 범위 선택"
          className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none sm:w-auto"
          isClearable={true}
        />
        {startDate && endDate && (
          <button
            onClick={() => setDateRange([null, null])}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-6">
        {!hideControls && (
          <div className="flex flex-col space-y-4">
            <DatePickerComponent />

            <div className="flex items-center justify-end space-x-3">
              <label
                htmlFor="gridColumns"
                className="text-base font-semibold text-gray-800"
              >
                열 수:
              </label>
              <select
                id="gridColumns"
                value={gridColumns}
                onChange={(e) => setGridColumns(Number(e.target.value))}
                className="rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {[2, 3].map((num) => (
                  <option key={num} value={num}>
                    {num}열
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div
          className={`grid gap-4 ${
            gridColumns === 2 ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {filteredTrackList.map((track, index) => {
            const prevTrack = trackList[index + 1] || null;
            const rankChange = getChangeInfoV2(track.rank, prevTrack?.rank);
            const visitorChange = getChangeInfoV2(
              track.visitorReviewCount,
              prevTrack?.visitorReviewCount,
            );
            const blogChange = getChangeInfoV2(
              track.blogReviewCount,
              prevTrack?.blogReviewCount,
            );
            const scoreChange = getChangeStyleV2(
              track.scoreInfo,
              prevTrack?.scoreInfo,
            );

            // 선택된 아이템인지 확인
            const isSelected = selectedTrackData && 
              selectedTrackData.chartDate === track.chartDate &&
              selectedTrackData.rank === track.rank;

            return (
              <div
                key={index}
                className={`flex flex-col rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => handleItemClick(track)}
              >
                {/* 날짜 */}
                <div className="text-sm font-medium text-gray-600 mb-2">
                  {formatDate(track.chartDate)}
                </div>

                {/* 순위 */}
                <div className="mb-3 flex flex-col items-center">
                  <span className="text-xl font-bold text-gray-900 mb-1">
                    {getRankString ? getRankString(track.rank) : `${track.rank}위`}
                  </span>
                  {rankChange.text && (
                    <ChangeBadge change={rankChange} />
                  )}
                </div>

                {/* 리뷰 정보 */}
                <div className="space-y-3 text-base">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">평점</span>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-lg">{track.scoreInfo || "-"}</span>
                      {scoreChange.text && (
                        <ChangeBadge change={scoreChange} />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">블</span>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-lg">{formatNumber(track.blogReviewCount)}</span>
                      {blogChange.text && (
                        <ChangeBadge change={blogChange} />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">방</span>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-lg">{formatNumber(track.visitorReviewCount)}</span>
                      {visitorChange.text && (
                        <ChangeBadge change={visitorChange} />
                      )}
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
    <div className="space-y-6">
      {!hideControls && (
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <DatePickerComponent />

          <div className="flex items-center space-x-3">
            <label
              htmlFor="gridColumns"
              className="text-base font-semibold text-gray-800"
            >
              열 수:
            </label>
            <select
              id="gridColumns"
              value={gridColumns}
              onChange={(e) => setGridColumns(Number(e.target.value))}
              className="rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {[4, 5, 6].map((num) => (
                <option
                  key={num}
                  value={num}
                  className={num === 6 ? "hidden xl:block" : ""}
                >
                  {num}열
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 ${
          gridColumns === 4
            ? "lg:grid-cols-4 xl:grid-cols-4"
            : gridColumns === 5
              ? "lg:grid-cols-5 lg:gap-4 xl:grid-cols-5 xl:gap-4"
              : "lg:grid-cols-5 lg:gap-4 xl:grid-cols-6 xl:gap-4"
        }`}
      >
        {filteredTrackList.map((track, index) => {
          const prevTrack = trackList[index + 1] || null;
          const rankChange = getRankChangeStyleV2(track.rank, prevTrack?.rank);
          const visitorChange = getChangeStyleV2(
            track.visitorReviewCount,
            prevTrack?.visitorReviewCount,
          );
          const blogChange = getChangeStyleV2(
            track.blogReviewCount,
            prevTrack?.blogReviewCount,
          );
          const scoreChange = getChangeStyleV2(
            track.scoreInfo,
            prevTrack?.scoreInfo,
          );
          const saveCountChange = getSaveCountChangeV2(
            track.saveCount,
            prevTrack?.saveCount,
          );
          const dateInfo = formatDate(track.chartDate);

          // 선택된 아이템인지 확인
          const isSelected = selectedTrackData && 
            selectedTrackData.chartDate === track.chartDate &&
            selectedTrackData.rank === track.rank;

          return (
            <div
              key={index}
              className={`group relative rounded-xl border-2 p-6 shadow-lg transition-all duration-300 hover:shadow-2xl cursor-pointer transform hover:scale-105 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 bg-white hover:border-blue-400'
              }`}
              onClick={() => handleItemClick(track)}
            >
              <div className="absolute top-3 right-3 text-sm font-medium text-gray-500">
                {dateInfo}
              </div>

              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {getRankString ? getRankString(track.rank) : (track.rank || "-")}
                  </span>
                  {!getRankString && <span className="text-lg font-medium text-gray-600">위</span>}
                  {rankChange.text && (
                    <ChangeBadge change={rankChange} />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-800">
                      평점
                    </span>
                    <span className="text-lg font-semibold text-gray-700">
                      {track.scoreInfo || "-"}
                    </span>
                  </div>
                  {scoreChange.text && (
                    <ChangeBadge change={scoreChange} />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-800">
                      방
                    </span>
                    <span className="text-lg font-semibold text-gray-700">
                      {track.visitorReviewCount || "-"}
                    </span>
                  </div>
                  {visitorChange.text && (
                    <ChangeBadge change={visitorChange} />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg font-bold text-gray-800">
                      블
                    </span>
                    <span className="text-lg font-semibold text-gray-700">
                      {track.blogReviewCount || "-"}
                    </span>
                  </div>
                  {blogChange.text && (
                    <ChangeBadge change={blogChange} />
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-base text-gray-500 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">저장수: {track.saveCount || "-"}</span>
                  {saveCountChange.text && (
                    <ChangeBadge change={saveCountChange} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 