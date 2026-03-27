import { TrackData } from "@/src/model/TrackRepository";
import { useState, useMemo } from "react";
import { useIsMobile } from "@/src/hooks/useMediaQuery";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { isWithinInterval, parseISO, subDays } from "date-fns";

interface KeywordGridViewProps {
  trackList: TrackData[];
  gridColumns?: number; // 4, 5, 6, ..., 12
  hideControls?: boolean; // 컨트롤 숨김 옵션 추가
  onItemClick?: (trackData: TrackData) => void; // 클릭 핸들러 수정: 전체 trackData 전달
  getRankString?: (rank: number | null) => string; // getRankString 함수 추가
  selectedTrackData?: TrackData | null; // 선택된 트랙 데이터 추가
}

// 변화량에 따른 아이콘과 색상 결정 함수
function getChangeInfo(current: number | null, previous: number | null) {
  if (!current || !previous) return { text: "", icon: "", color: "" };
  const diff = current - previous;
  if (diff === 0) return { text: "", icon: "→", color: "text-gray-500" };
  if (diff > 0) return { text: `+${diff}`, icon: "↑", color: "text-green-500" };
  return { text: `${diff}`, icon: "↓", color: "text-red-500" };
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

function getRankChangeStyle(currentRank: number | null, prevRank: number | null) {
  if (!currentRank || !prevRank) return { text: "", color: "", icon: "" };
  const diff = prevRank - currentRank;
  if (diff > 0) return { text: `${diff}`, color: "text-green-500", icon: "↑" };
  if (diff < 0) return { text: `${Math.abs(diff)}`, color: "text-red-500", icon: "↓" };
  return { text: "-", color: "text-gray-500", icon: "" };
}

function getChangeStyle(current: number | string | null, prev: number | string | null) {
  if (!current || !prev) return { text: "", color: "", icon: "" };
  const currentVal = typeof current === 'string' ? parseInt(current.replace(/,/g, "")) : current;
  const prevVal = typeof prev === 'string' ? parseInt(prev.replace(/,/g, "")) : prev;
  const diff = currentVal - prevVal;
  if (diff > 0) return { text: `${diff.toLocaleString()}`, color: "text-green-500", icon: "↑" };
  if (diff < 0) return { text: `${Math.abs(diff).toLocaleString()}`, color: "text-red-500", icon: "↓" };
  return { text: "-", color: "text-gray-500", icon: "" };
}

function getSaveCountChange(current: string | number | null, prev: string | number | null) {
  if (!current || !prev) return { text: "", color: "", icon: "" };
  const currentVal = typeof current === 'string' ? parseInt(current.replace(/,/g, "").replace(/\+/g, "")) : current;
  const prevVal = typeof prev === 'string' ? parseInt(prev.replace(/,/g, "").replace(/\+/g, "")) : prev;
  const diff = currentVal - prevVal;
  if (diff > 0) return { text: `${diff.toLocaleString()}`, color: "text-green-500", icon: "↑" };
  if (diff < 0) return { text: `${Math.abs(diff).toLocaleString()}`, color: "text-red-500", icon: "↓" };
  return { text: "-", color: "text-gray-500", icon: "" };
}


export default function KeywordGridView({
  trackList,
  gridColumns: initialGridColumns = 2, // 2열로 고정
  hideControls = false,
  onItemClick,
  getRankString,
  selectedTrackData,
}: KeywordGridViewProps) {
  const [gridColumns, setGridColumns] = useState(2); // 항상 2열로 고정
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;
  const isMobile = useIsMobile();

  // 아이템 클릭 핸들러
  const handleItemClick = (trackData: TrackData) => {
    if (onItemClick) {
      onItemClick(trackData);
    }
  };

  // 날짜 범위에 따른 필터링
  const filteredTrackList = useMemo(() => {
    if (!startDate || !endDate) return trackList;

    return trackList.filter((track) => {
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
        <p className="text-gray-500">추적 중...</p>
      </div>
    );
  }

  // 순위권 이탈 여부 확인 (모든 데이터가 순위권 이탈인 경우)
  const isAllRanksOutOfRange = filteredTrackList.every(track => 
    track.rank === null || track.rank === -1 || track.rank === 0
  );

  if (isAllRanksOutOfRange && filteredTrackList.length > 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg bg-red-50 border border-red-200">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">⚠️ 순위권에서 이탈되었습니다</div>
          <p className="text-red-500 text-sm">해당 키워드에서 순위를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const DatePickerComponent = () => (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center space-x-2">
        <h3 className="text-sm font-medium text-gray-700">필터</h3>
        <div className="h-4 w-px bg-gray-300" />
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleQuickSelect(7)}
            className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
          >
            7일
          </button>
          <button
            onClick={() => handleQuickSelect(30)}
            className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
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
          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none sm:w-auto"
          isClearable={true}
        />
        {startDate && endDate && (
          <button
            onClick={() => setDateRange([null, null])}
            className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-full min-h-[500px]">
        {!hideControls && (
          <div className="flex-shrink-0 mb-3">
            <DatePickerComponent />
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-[600px]">
          <div className="grid gap-2 grid-cols-2 pb-4">
            {filteredTrackList.map((track, index) => {
              const prevTrack = trackList[index + 1] || null;
              const rankChange = getChangeInfo(track.rank, prevTrack?.rank);
              const visitorChange = getChangeInfo(
                track.visitorReviewCount,
                prevTrack?.visitorReviewCount,
              );
              const blogChange = getChangeInfo(
                track.blogReviewCount,
                prevTrack?.blogReviewCount,
              );
              const scoreChange = getChangeStyle(
                track.scoreInfo,
                prevTrack?.scoreInfo,
              );

              // 선택된 아이템인지 확인
              const isSelected =
                selectedTrackData &&
                selectedTrackData.chartDate === track.chartDate &&
                selectedTrackData.rank === track.rank;

              return (
                <div
                  key={index}
                  className={`flex transform cursor-pointer flex-col rounded-lg border p-2 transition-all duration-200 hover:scale-105 hover:shadow-md min-h-[120px] ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-primary-300 border-gray-200 bg-white"
                  }`}
                  onClick={() => handleItemClick(track)}
                >
                  {/* 날짜 */}
                  <div className="text-xs text-gray-500 flex-shrink-0">
                    {formatDate(track.chartDate)}
                  </div>

                  {/* 순위 */}
                  <div className="mt-1 flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-bold">
                      {getRankString
                        ? getRankString(track.rank)
                        : `${track.rank}위`}
                    </span>
                    {rankChange.text && (
                      <span className={`ml-1 text-xs ${rankChange.color}`}>
                        {rankChange.icon}
                      </span>
                    )}
                  </div>

                  {/* 클릭 안내 텍스트 추가 */}
                  <div className="mt-1 text-center flex-shrink-0">
                    <span className="text-xs text-blue-500 opacity-75">
                      클릭하여 순위비교
                    </span>
                  </div>

                  {/* 리뷰 정보 */}
                  <div className="mt-2 space-y-1 text-xs flex-1">
                    <div className="flex items-center justify-between">
                      <span>평점</span>
                      <div className="flex items-center">
                        <span>{track.scoreInfo || "-"}</span>
                        {scoreChange.text && (
                          <span className={`ml-1 ${scoreChange.color}`}>
                            ({scoreChange.icon})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>블</span>
                      <div className="flex items-center">
                        <span>{formatNumber(track.blogReviewCount)}</span>
                        {blogChange.text && (
                          <span className={`ml-1 ${blogChange.color}`}>
                            ({blogChange.icon})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>방</span>
                      <div className="flex items-center">
                        <span>{formatNumber(track.visitorReviewCount)}</span>
                        {visitorChange.text && (
                          <span className={`ml-1 ${visitorChange.color}`}>
                            ({visitorChange.icon})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[1200px]">
      {!hideControls && (
        <div className="flex-shrink-0 mb-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <DatePickerComponent />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto min-h-[1200px]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 pb-4">
          {filteredTrackList.map((track, index) => {
            const prevTrack = trackList[index + 1] || null;
            const rankChange = getRankChangeStyle(track.rank, prevTrack?.rank);
            const visitorChange = getChangeStyle(
              track.visitorReviewCount,
              prevTrack?.visitorReviewCount,
            );
            const blogChange = getChangeStyle(
              track.blogReviewCount,
              prevTrack?.blogReviewCount,
            );
            const scoreChange = getChangeStyle(
              track.scoreInfo,
              prevTrack?.scoreInfo,
            );
            const saveCountChange = getSaveCountChange(
              track.saveCount,
              prevTrack?.saveCount,
            );
            const dateInfo = formatDate(track.chartDate);

            // 선택된 아이템인지 확인
            const isSelected =
              selectedTrackData &&
              selectedTrackData.chartDate === track.chartDate &&
              selectedTrackData.rank === track.rank;

            return (
              <div
                key={index}
                className={`group relative cursor-pointer rounded-lg border p-3 md:p-4 shadow-sm transition-all hover:shadow-lg min-h-[200px] md:min-h-[220px] ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-500"
                }`}
                onClick={() => handleItemClick(track)}
              >
                <div className="absolute top-2 right-2 text-xs text-gray-400">
                  {dateInfo}
                </div>

                {/* 클릭 안내 오버레이 */}
                <div className="pointer-events-none absolute inset-0 rounded-lg bg-blue-50 opacity-0 transition-opacity duration-200 group-hover:opacity-10"></div>

                {/* 클릭 안내 아이콘 */}
                <div className="absolute top-10 left-10 opacity-0 transition-opacity duration-200 group-hover:opacity-70">
                  <span className="text-lg font-medium text-blue-600">
                    👆 클릭
                  </span>
                </div>

                <div className="mb-3 md:mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-base md:text-lg font-bold text-gray-900">
                      {getRankString
                        ? getRankString(track.rank)
                        : track.rank || "-"}
                    </span>
                    {!getRankString && (
                      <span className="text-sm text-gray-500">위</span>
                    )}
                    {rankChange.text && (
                      <div
                        className={`ml-2 flex items-center ${rankChange.color}`}
                      >
                        <span className="text-sm font-medium">
                          {rankChange.icon}
                        </span>
                        <span className="text-sm font-medium">
                          {rankChange.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs md:text-sm font-medium text-gray-700">
                        평점
                      </span>
                      <span className="text-xs md:text-sm text-gray-600">
                        {track.scoreInfo || "-"}
                      </span>
                    </div>
                    {scoreChange.text && (
                      <div className={`flex items-center ${scoreChange.color}`}>
                        <span className="text-xs font-medium">
                          {scoreChange.icon}
                        </span>
                        <span className="text-xs font-medium">
                          {scoreChange.text}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs md:text-sm font-medium text-gray-700">
                        방
                      </span>
                      <span className="text-xs md:text-sm text-gray-600">
                        {track.visitorReviewCount || "-"}
                      </span>
                    </div>
                    {visitorChange.text && (
                      <div className={`flex items-center ${visitorChange.color}`}>
                        <span className="text-xs font-medium">
                          {visitorChange.icon}
                        </span>
                        <span className="text-xs font-medium">
                          {visitorChange.text}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs md:text-sm font-medium text-gray-700">
                        블
                      </span>
                      <span className="text-xs md:text-sm text-gray-600">
                        {track.blogReviewCount || "-"}
                      </span>
                    </div>
                    {blogChange.text && (
                      <div className={`flex items-center ${blogChange.color}`}>
                        <span className="text-xs font-medium">
                          {blogChange.icon}
                        </span>
                        <span className="text-xs font-medium">
                          {blogChange.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 md:mt-4 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span>저장수: {track.saveCount || "-"}</span>
                    {saveCountChange.text && (
                      <div
                        className={`flex items-center ${saveCountChange.color}`}
                      >
                        <span className="text-xs font-medium">
                          {saveCountChange.icon}
                        </span>
                        <span className="text-xs font-medium">
                          {saveCountChange.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 