import { TrackData } from "@/src/model/TrackRepository";
import { useState, useMemo, useEffect } from "react";
import { useIsMobile } from "@/src/hooks/useMediaQuery";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { isWithinInterval, parseISO, subDays } from "date-fns";

interface TrackGridViewV3Props {
  trackList: TrackData[];
  gridColumns?: number;
  hideControls?: boolean;
  onItemClick?: (trackData: TrackData) => void;
  getRankString?: (rank: number | null) => string;
  selectedTrackData?: TrackData | null;
}

// 변화량 계산 함수
function getChangeDataV3(current: number | null, previous: number | null) {
  if (!current || !previous) return { text: "", icon: "", color: "" };
  const diff = current - previous;
  if (diff === 0) return { text: "", icon: "", color: "" };
  if (diff > 0) return { 
    text: diff.toString(), 
    icon: "▲", 
    color: "text-emerald-600" 
  };
  return { 
    text: Math.abs(diff).toString(), 
    icon: "▼", 
    color: "text-rose-600" 
  };
}

function getRankChangeDataV3(currentRank: number | null, prevRank: number | null) {
  if (!currentRank || !prevRank) return { text: "", icon: "", color: "" };
  const diff = prevRank - currentRank;
  if (diff === 0) return { text: "", icon: "", color: "" };
  if (diff > 0) return { 
    text: diff.toString(), 
    icon: "▲", 
    color: "text-emerald-600" 
  };
  return { 
    text: Math.abs(diff).toString(), 
    icon: "▼", 
    color: "text-rose-600" 
  };
}

function getChangeDataV3Extended(current: number | string | null, prev: number | string | null) {
  if (!current || !prev) return { text: "", icon: "", color: "" };
  const currentVal = typeof current === 'string' ? parseInt(current.replace(/,/g, "")) : current;
  const prevVal = typeof prev === 'string' ? parseInt(prev.replace(/,/g, "")) : prev;
  const diff = currentVal - prevVal;
  if (diff === 0) return { text: "", icon: "", color: "" };
  if (diff > 0) return { 
    text: diff.toLocaleString(), 
    icon: "▲", 
    color: "text-emerald-600" 
  };
  return { 
    text: Math.abs(diff).toLocaleString(), 
    icon: "▼", 
    color: "text-rose-600" 
  };
}

function getSaveCountChangeDataV3(current: string | number | null, prev: string | number | null) {
  if (!current || !prev) return { text: "", icon: "", color: "" };
  const currentVal = typeof current === 'string' ? parseInt(current.replace(/,/g, "").replace(/\+/g, "")) : current;
  const prevVal = typeof prev === 'string' ? parseInt(prev.replace(/,/g, "").replace(/\+/g, "")) : prev;
  const diff = currentVal - prevVal;
  if (diff === 0) return { text: "", icon: "", color: "" };
  if (diff > 0) return { 
    text: diff.toLocaleString(), 
    icon: "▲", 
    color: "text-emerald-600" 
  };
  return { 
    text: Math.abs(diff).toLocaleString(), 
    icon: "▼", 
    color: "text-rose-600" 
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

export default function TrackGridViewV3(
  { trackList, gridColumns: initialGridColumns = 4, hideControls = false, onItemClick, getRankString, selectedTrackData }: TrackGridViewV3Props) {
  const isMobile = useIsMobile();
  
  const [gridColumns, setGridColumns] = useState(() => 
    isMobile ? 2 : initialGridColumns
  );
  
  useEffect(() => {
    if (isMobile) {
      setGridColumns(2);
    } else {
      setGridColumns(initialGridColumns);
    }
  }, [isMobile, initialGridColumns]);
  
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
      <div className="flex h-32 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 text-lg font-medium">추적 중...</p>
        </div>
      </div>
    );
  }

  const isAllRanksOutOfRange = filteredTrackList.every(track => 
    track.rank === null || track.rank === -1 || track.rank === 0
  );

  if (isAllRanksOutOfRange && filteredTrackList.length > 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 border-2 border-red-200 shadow-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-red-700 text-2xl font-bold mb-3">순위권에서 이탈되었습니다</div>
          <p className="text-red-600 text-lg">해당 키워드에서 순위를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const DatePickerComponent = () => (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-4">
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          필터
        </h3>
        <div className="h-6 w-px bg-gradient-to-b from-gray-300 to-gray-400" />
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleQuickSelect(7)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            7일
          </button>
          <button
            onClick={() => handleQuickSelect(30)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
          className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 sm:w-auto backdrop-blur-sm"
          isClearable={true}
        />
        {startDate && endDate && (
          <button
            onClick={() => setDateRange([null, null])}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-medium hover:from-gray-200 hover:to-gray-300 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="space-y-8">
        {!hideControls && (
          <div className="flex flex-col space-y-6">
            <DatePickerComponent />
            <div className="flex items-center justify-end space-x-4">
              <label className="text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                열 수:
              </label>
              <select
                value={gridColumns}
                onChange={(e) => setGridColumns(Number(e.target.value))}
                className="rounded-xl border-2 border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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

        <div className={`grid gap-6 ${gridColumns === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {filteredTrackList.map((track, index) => {
            const prevTrack = trackList[index + 1] || null;
            const rankChange = getRankChangeDataV3(track.rank, prevTrack?.rank);
            const visitorChange = getChangeDataV3Extended(track.visitorReviewCount, prevTrack?.visitorReviewCount);
            const blogChange = getChangeDataV3Extended(track.blogReviewCount, prevTrack?.blogReviewCount);
            const saveCountChange = getSaveCountChangeDataV3(track.saveCount, prevTrack?.saveCount);

            const isSelected = selectedTrackData && 
              selectedTrackData.chartDate === track.chartDate &&
              selectedTrackData.rank === track.rank;

            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isSelected 
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-2xl' 
                    : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-blue-300 shadow-lg hover:shadow-2xl'
                }`}
                onClick={() => handleItemClick(track)}
              >
                {/* 글래스모피즘 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                
                <div className="relative p-5 backdrop-blur-sm">
                  {/* 날짜 헤더 */}
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 text-white font-bold text-sm shadow-lg">
                      {formatDate(track.chartDate)}
                    </div>
                  </div>

                  {/* 순위 섹션 */}
                  <div className="text-center mb-6">
                    <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {getRankString ? getRankString(track.rank) : `${track.rank}위`}
                    </div>
                    {rankChange.text && (
                      <div className={`flex items-center justify-center space-x-2 ${rankChange.color}`}>
                        <span className="text-xl font-bold">{rankChange.icon}</span>
                        <span className="text-xl font-bold">{rankChange.text}</span>
                      </div>
                    )}
                  </div>

                  {/* 정보 테이블 */}
                  <div className="space-y-3">
                    {/* 방문자 */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 border border-red-200">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg">
                        방
                      </div>
                      <div className="text-2xl font-bold text-gray-900 flex-1 text-center">
                        {formatNumber(track.visitorReviewCount)}
                      </div>
                      {visitorChange.text && (
                        <div className={`flex items-center space-x-1 ${visitorChange.color} font-bold`}>
                          <span className="text-lg">{visitorChange.icon}</span>
                          <span className="text-lg">{visitorChange.text}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 블로그 */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-lg">
                        블
                      </div>
                      <div className="text-2xl font-bold text-gray-900 flex-1 text-center">
                        {formatNumber(track.blogReviewCount)}
                      </div>
                      {blogChange.text && (
                        <div className={`flex items-center space-x-1 ${blogChange.color} font-bold`}>
                          <span className="text-lg">{blogChange.icon}</span>
                          <span className="text-lg">{blogChange.text}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* 저장수 */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-lg">
                        저
                      </div>
                      <div className="text-2xl font-bold text-gray-900 flex-1 text-center">
                        {track.saveCount || "0"}
                      </div>
                      {saveCountChange.text && (
                        <div className={`flex items-center space-x-1 ${saveCountChange.color} font-bold`}>
                          <span className="text-lg">{saveCountChange.icon}</span>
                          <span className="text-lg">{saveCountChange.text}</span>
                        </div>
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
    <div className="space-y-8">
      {!hideControls && (
        <div className="flex flex-col space-y-6 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <DatePickerComponent />
          <div className="flex items-center space-x-4">
            <label className="text-lg font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
              열 수:
            </label>
            <select
              value={gridColumns}
              onChange={(e) => setGridColumns(Number(e.target.value))}
              className="rounded-xl border-2 border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              {[4, 5, 6].map((num) => (
                <option key={num} value={num} className={num === 6 ? "hidden xl:block" : ""}>
                  {num}열
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 ${
        gridColumns === 4
          ? "lg:grid-cols-4 xl:grid-cols-4"
          : gridColumns === 5
            ? "lg:grid-cols-5 lg:gap-6 xl:grid-cols-5 xl:gap-6"
            : "lg:grid-cols-5 lg:gap-6 xl:grid-cols-6 xl:gap-6"
      }`}>
        {filteredTrackList.map((track, index) => {
          const prevTrack = trackList[index + 1] || null;
          const rankChange = getRankChangeDataV3(track.rank, prevTrack?.rank);
          const visitorChange = getChangeDataV3Extended(track.visitorReviewCount, prevTrack?.visitorReviewCount);
          const blogChange = getChangeDataV3Extended(track.blogReviewCount, prevTrack?.blogReviewCount);
          const saveCountChange = getSaveCountChangeDataV3(track.saveCount, prevTrack?.saveCount);

          const isSelected = selectedTrackData && 
            selectedTrackData.chartDate === track.chartDate &&
            selectedTrackData.rank === track.rank;

          return (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                isSelected 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-2xl' 
                  : 'border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:border-blue-300 shadow-lg hover:shadow-2xl'
              }`}
              onClick={() => handleItemClick(track)}
            >
              {/* 글래스모피즘 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
              
              <div className="relative p-6 backdrop-blur-sm">
                {/* 날짜 헤더 */}
                <div className="text-center mb-5">
                  <div className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 text-white font-bold text-sm shadow-lg">
                    {formatDate(track.chartDate)}
                  </div>
                </div>

                {/* 순위 섹션 */}
                <div className="text-center mb-8">
                  <div className="text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    {getRankString ? getRankString(track.rank) : (track.rank || "-")}
                    {!getRankString && <span className="text-3xl font-bold text-gray-600 ml-2">위</span>}
                  </div>
                  {rankChange.text && (
                    <div className={`flex items-center justify-center space-x-2 ${rankChange.color}`}>
                      <span className="text-2xl font-bold">{rankChange.icon}</span>
                      <span className="text-2xl font-bold">{rankChange.text}</span>
                    </div>
                  )}
                </div>

                {/* 정보 테이블 */}
                <div className="space-y-4">
                  {/* 방문자 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-red-100 to-pink-100 border border-red-200 hover:from-red-200 hover:to-pink-200 transition-all duration-200">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg shadow-lg">
                      방
                    </div>
                    <div className="text-3xl font-bold text-gray-900 flex-1 text-center">
                      {formatNumber(track.visitorReviewCount)}
                    </div>
                    {visitorChange.text ? (
                      <div className={`flex items-center space-x-2 ${visitorChange.color} font-bold min-w-[80px] justify-center`}>
                        <span className="text-2xl">{visitorChange.icon}</span>
                        <span className="text-xl">{visitorChange.text}</span>
                      </div>
                    ) : (
                      <div className="min-w-[80px]"></div>
                    )}
                  </div>
                  
                  {/* 블로그 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 hover:from-blue-200 hover:to-cyan-200 transition-all duration-200">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg shadow-lg">
                      블
                    </div>
                    <div className="text-3xl font-bold text-gray-900 flex-1 text-center">
                      {formatNumber(track.blogReviewCount)}
                    </div>
                    {blogChange.text ? (
                      <div className={`flex items-center space-x-2 ${blogChange.color} font-bold min-w-[80px] justify-center`}>
                        <span className="text-2xl">{blogChange.icon}</span>
                        <span className="text-xl">{blogChange.text}</span>
                      </div>
                    ) : (
                      <div className="min-w-[80px]"></div>
                    )}
                  </div>
                  
                  {/* 저장수 */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 hover:from-green-200 hover:to-emerald-200 transition-all duration-200">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg shadow-lg">
                      저
                    </div>
                    <div className="text-3xl font-bold text-gray-900 flex-1 text-center">
                      {track.saveCount || "0"}
                    </div>
                    {saveCountChange.text ? (
                      <div className={`flex items-center space-x-2 ${saveCountChange.color} font-bold min-w-[80px] justify-center`}>
                        <span className="text-2xl">{saveCountChange.icon}</span>
                        <span className="text-xl">{saveCountChange.text}</span>
                      </div>
                    ) : (
                      <div className="min-w-[80px]"></div>
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