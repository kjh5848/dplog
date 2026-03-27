"use client";

import React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrackData } from "@/src/model/TrackRepository";
import TrackReportGridView from "./TrackReportGridView";
import ReportPreviewModal from "./ReportPreviewModal";
import { Download, Grid, List, BarChart3 } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import { isWithinInterval, parseISO, subDays } from "date-fns";
import { createUnifiedCanvas, downloadCanvasAsImage } from '@/src/features/track/report/reportHelper';
import { format } from 'date-fns';
import { logError, logInfo } from "@/src/utils/logger";

interface ChartPayload {
  name: string;
  value: number;
  color: string;
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: ChartPayload[];
  label?: string;
  labelFormatter?: (value: number) => string;
  indicator?: "dot" | "line";
}

// 툴클 컴포넌트
function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  indicator = "dot",
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-background rounded-lg border p-2 shadow-sm">
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <div className="text-muted-foreground font-medium">
          {labelFormatter ? labelFormatter(label as unknown as number) : label}
        </div>
        <div className="bg-muted col-span-2 my-1 h-px" />
        {payload.map((item: ChartPayload, index: number) => (
          <React.Fragment key={index}>
            <div
              className="flex items-center gap-1"
              style={{
                color: item.color,
              }}
            >
              {indicator === "dot" && (
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {indicator === "line" && (
                <div
                  className="h-0.5 w-3"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              <span className="font-medium">{item.name}</span>
            </div>
            <div className="text-right font-medium">{item.value}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

interface TrackDataChartProps {
  trackList: TrackData[];
  shopName: string;
  keyword: string;
  shopId: string;
  isPreviewMode?: boolean; // 미리보기 모드 prop 추가
  downloadOptions?: DownloadOptions; // 미리보기에서 전달받는 옵션
  viewMode?: ViewMode; // 미리보기에서 전달받는 뷰모드
  startDate?: Date | null; // 미리보기에서 전달받는 시작날짜
  endDate?: Date | null; // 미리보기에서 전달받는 종료날짜
}

interface AnalysisData {
  rankChange: number;
  visitorReviewGrowth: number;
  blogReviewGrowth: number;
  saveCountGrowth: number;
  averageRank: number;
  bestRank: number;
  worstRank: number;
  totalReviews: number;
  reviewTrend: "증가" | "감소" | "유지";
  rankTrend: "상승" | "하락" | "유지";
}

interface DownloadOptions {
  rankChart: boolean;
  visitorReviewChart: boolean;
  blogReviewChart: boolean;
  saveCountChart: boolean;
  hideGridControls: boolean;
  includeAnalysis: boolean; // 성장률 분석 포함 옵션 추가
  includeDetailData: boolean; // 상세 데이터 포함 옵션 추가
}

type ViewMode = "grid" | "list";

export default function TrackReportView({
  trackList,
  shopName,
  keyword,
  shopId,
  isPreviewMode = false,
  downloadOptions: externalDownloadOptions,
  viewMode: externalViewMode,
  startDate: externalStartDate,
  endDate: externalEndDate,
}: TrackDataChartProps) {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "all">("7d");
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>(() => {
    if (isPreviewMode && externalStartDate && externalEndDate) {
      return [externalStartDate, externalEndDate];
    }
    const end = new Date();
    const start = subDays(end, 6); // 오늘 포함 7일
    return [start, end];
  });
  const [downloadOptions, setDownloadOptions] = React.useState<DownloadOptions>(
    externalDownloadOptions || {
      rankChart: true,
      visitorReviewChart: true,
      blogReviewChart: true,
      saveCountChart: true,  // 저장수 차트 확실히 포함
      hideGridControls: true, // 기본값으로 그리드 컨트롤 숨김
      includeAnalysis: true, // 성장률 분석 포함
      includeDetailData: true, // 상세 데이터 포함 기본값
    },
  );
  const [isDownloadModalOpen, setIsDownloadModalOpen] = React.useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>(externalViewMode || "grid"); // 뷰 모드 상태 추가

  const [startDate, endDate] = dateRange;

  // 날짜 범위에 따른 필터링 (DatePicker용)
  const filteredByDateRange = React.useMemo(() => {
    if (!startDate || !endDate) return trackList;
    
    return trackList.filter((track: TrackData) => {
      const trackDate = parseISO(track.chartDate);
      return isWithinInterval(trackDate, { start: startDate, end: endDate });
    });
  }, [trackList, startDate, endDate]);

  // 기존 timeRange 필터링과 DatePicker 필터링 통합
  const filteredData = React.useMemo(() => {
    let filtered = [...trackList];

    // DatePicker 필터링이 설정되어 있으면 우선 적용
    if (startDate && endDate) {
      filtered = filteredByDateRange;
    } else {
      // 그렇지 않으면 기존 timeRange 필터링 적용
      const now = new Date();
      if (timeRange === "7d") {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = trackList.filter((track) => new Date(track.chartDate) >= sevenDaysAgo);
      } else if (timeRange === "30d") {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = trackList.filter((track) => new Date(track.chartDate) >= thirtyDaysAgo);
      }
    }

    return filtered.sort((a, b) => new Date(b.chartDate).getTime() - new Date(a.chartDate).getTime());
  }, [trackList, timeRange, filteredByDateRange, startDate, endDate]);

  // 빠른 날짜 선택 핸들러
  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = subDays(end, days - 1); // days - 1을 해야 오늘 포함 N일이 됨
    setDateRange([start, end]);
  };

  // 날짜 범위 초기화
  const resetDateRange = () => {
    setDateRange([null, null]);
  };

  // 차트 레이아웃 결정 (모든 경우에 1열로 통일)
  // const chartGridCols = React.useMemo(() => {
  //   return "grid-cols-1";
  // }, [filteredData.length]);

  // 순위 차트용 역전된 값 (낮은 순위가 더 높게 표시되도록)
  const chartData = filteredData.map((item, index, array) => {
    // 안전하게 숫자 변환
    const safeNumber = (val: unknown) => {
      if (typeof val === "number") return val;
      if (!val) return 0;
      const n = Number(val.toString().replace(/[^0-9]/g, ""));
      return isNaN(n) ? 0 : n;
    };

    return {
      ...item,
      date: (() => {
        const d = new Date(item.chartDate);
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${month}.${day}`; // ✅ 04.13 형태
      })(),
      rank: item.rank ? 100 - item.rank : 0, // 역전된 순위
      visitorReviewCount: safeNumber(item.visitorReviewCount),
      blogReviewCount: safeNumber(item.blogReviewCount),
      saveCount: safeNumber(item.saveCount),
    };
  });

  const openPreviewModal = () => {
    setIsPreviewModalOpen(true);
  };

  const handleDirectDownload = async () => {
    const reportContainer = document.querySelector('.report-content-for-capture');
    if (!reportContainer) {
      alert("다운로드할 콘텐츠를 찾을 수 없습니다.");
      return;
    }

    try {
      logInfo("직접 통일된 다운로드 시작...");
      
      // 파일명에 날짜 추가
      const dateStr = startDate && endDate 
        ? `${format(startDate, 'yyyyMMdd')}-${format(endDate, 'yyyyMMdd')}`
        : format(new Date(), 'yyyyMMdd');
      const fullFileName = `${shopName}_${keyword}_리포트_${dateStr}`;

      // 공통 캔버스 생성 함수 사용
      const canvas = await createUnifiedCanvas({
        element: reportContainer as HTMLElement,
        fileName: fullFileName
      });

      // 공통 다운로드 함수 사용
      await downloadCanvasAsImage(canvas, fullFileName);
      
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('직접 다운로드 실패:', errorObj);
      alert(`다운로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  };

  const handleDownloadModalOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsDownloadModalOpen(false);
    }
  };

  const handleDownloadModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // 성장률 분석 함수 복원
  const analyzeData = (data: TrackData[]): AnalysisData => {
    if (data.length < 2) {
      return {
        rankChange: 0,
        visitorReviewGrowth: 0,
        blogReviewGrowth: 0,
        saveCountGrowth: 0,
        averageRank: data[0]?.rank || 0,
        bestRank: data[0]?.rank || 0,
        worstRank: data[0]?.rank || 0,
        totalReviews: (data[0]?.visitorReviewCount || 0) + (data[0]?.blogReviewCount || 0),
        reviewTrend: "유지",
        rankTrend: "유지",
      };
    }

    const latest = data[0];
    const previous = data[data.length - 1];

    const calculateGrowth = (
      current: number | null | undefined,
      previous: number | null | undefined,
    ): number => {
      if (!current || !previous || previous === 0) return 0;
      const growth = ((current - previous) / previous) * 100;
      return isNaN(growth) ? 0 : growth;
    };

    const ranks = data.map(d => d.rank).filter(r => r !== null && r !== undefined) as number[];
    const averageRank = ranks.length > 0 ? ranks.reduce((a, b) => a + b, 0) / ranks.length : 0;
    const bestRank = ranks.length > 0 ? Math.min(...ranks) : 0;
    const worstRank = ranks.length > 0 ? Math.max(...ranks) : 0;

    const rankChange = (previous.rank || 0) - (latest.rank || 0);
    const visitorReviewGrowth = calculateGrowth(latest.visitorReviewCount, previous.visitorReviewCount);
    const blogReviewGrowth = calculateGrowth(latest.blogReviewCount, previous.blogReviewCount);
    const saveCountGrowth = calculateGrowth(latest.saveCount, previous.saveCount);

    const totalReviews = (latest.visitorReviewCount || 0) + (latest.blogReviewCount || 0);
    const previousTotalReviews = (previous.visitorReviewCount || 0) + (previous.blogReviewCount || 0);

    const reviewTrend = totalReviews > previousTotalReviews ? "증가" : 
                      totalReviews < previousTotalReviews ? "감소" : "유지";
    const rankTrend = rankChange > 0 ? "상승" : rankChange < 0 ? "하락" : "유지";

    return {
      rankChange,
      visitorReviewGrowth,
      blogReviewGrowth,
      saveCountGrowth,
      averageRank,
      bestRank,
      worstRank,
      totalReviews,
      reviewTrend,
      rankTrend,
    };
  };

  const getRankString = (rank: number | null): string => {
    if (rank === null || rank === undefined || rank === 0) {
      return "순위권 밖";
    }
    return `${rank}위`;
  };

  const analysisData = React.useMemo(() => analyzeData(filteredData), [filteredData]);

  // 차트 렌더링 함수들 분리
  const renderRankChart = () => {
    if (!downloadOptions.rankChart) return null;
    
    return (
      <div className="rank-chart border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
        <h2 className="mb-4 text-sm md:text-base lg:text-lg font-semibold">순위 추이</h2>
        <div className="h-[400px] w-full bg-white rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...chartData].reverse()}
              margin={{ top: 5, right: 1, left: 1, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0e0e0"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: "11px", fill: "#6B7280" }}
                height={60}
                tickMargin={14}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["dataMin - 5", "dataMax + 5"]}
                reversed
                tickFormatter={(v) => `${v}위`}
                tick={{ fontSize: "11px", fill: "#6B7280" }}
                width={60}
                tickMargin={14}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const rank = 100 - value;
                      return `${rank}위`;
                    }}
                    indicator="line"
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="rank"
                name="순위"
                stroke="#25E4FF"
                strokeWidth={2}
                dot={{ r: 4, fill: "#25E4FF", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderVisitorReviewChart = () => {
    if (!downloadOptions.visitorReviewChart) return null;
    
    return (
      <div className="visitor-review-chart border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
        <h2 className="mb-4 text-sm md:text-base lg:text-lg font-semibold">방문자 리뷰 추이</h2>
        <div className="h-[400px] w-full bg-white rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[...chartData].reverse()}
              margin={{ top: 5, right: 1, left: 1, bottom: 5 }}
            >
              <defs>
                <linearGradient
                  id="colorVisitor"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#25E4FF" stopOpacity={0.8} />
                  <stop
                    offset="95%"
                    stopColor="#25E4FF"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0e0e0"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: "11px", fill: "#6B7280" }}
                height={60}
                tickMargin={14}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["dataMin - 2", "dataMax + 2"]}
                tick={{ fontSize: "11px", fill: "#6B7280" }}
                width={60}
                tickMargin={14}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => value.toString()}
                    indicator="line"
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="visitorReviewCount"
                name="방문자 리뷰"
                stroke="#25E4FF"
                fill="url(#colorVisitor)"
                dot={{ r: 4, fill: "#25E4FF", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderBlogReviewChart = () => {
    if (!downloadOptions.blogReviewChart) return null;
    
    return (
      <div className="blog-review-chart border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
        <h2 className="mb-4 text-sm md:text-base lg:text-lg font-semibold">블로그 리뷰 추이</h2>
        <div className="h-[400px] w-full bg-white rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[...chartData].reverse()}
              margin={{ top: 5, right: 1, left: 1, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorBlog" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#282c34" stopOpacity={0.8} />
                  <stop
                    offset="95%"
                    stopColor="#282c34"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0e0e0"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: "11px", fill: "#6B7280" }}
                height={60}
                tickMargin={14}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={["dataMin - 5", "dataMax + 5"]}
                tick={{ fontSize: "11px", fill: "#6B7280" }}
                width={60}
                tickMargin={14}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => value.toString()}
                    indicator="line"
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="blogReviewCount"
                name="블로그 리뷰"
                stroke="#282c34"
                fill="url(#colorBlog)"
                dot={{ r: 4, fill: "#282c34", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderSaveCountChart = () => {
    if (!downloadOptions.saveCountChart) return null;
    
    return (
      <div className="save-count-chart border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
        <h2 className="mb-4 text-sm md:text-base lg:text-lg font-semibold">저장 수 추이</h2>
        <div className="h-[400px] w-full bg-white rounded-lg p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...chartData].reverse()}
              margin={{ top: 5, right: 1, left: 1, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0e0e0"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: "11px", fill: "#6B7280" }}
                height={60}
                tickMargin={14}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: "11px", fill: "#6B7280" }}
                width={60}
                tickMargin={14}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => value.toString()}
                    indicator="line"
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="saveCount"
                name="저장 수"
                stroke="#fa5252"
                strokeWidth={2}
                dot={{ r: 4, fill: "#fa5252", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // 리스트뷰 컴포넌트
  const renderListView = () => (
    <div className="space-y-3">
      {filteredData.map((item, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div>
                <span className="text-gray-500 text-xs">날짜:</span>
                <span className="ml-2 font-medium">{new Date(item.chartDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs">순위:</span>
                <span className="ml-2 font-medium">{getRankString(item.rank)}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs">방:</span>
                <span className="ml-2 font-medium">{(item.visitorReviewCount || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs">블:</span>
                <span className="ml-2 font-medium">{(item.blogReviewCount || 0).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500 text-xs">저장:</span>
                <span className="ml-2 font-medium">{(item.saveCount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 미리보기 모드 전용 헤더 */}
      {isPreviewMode && (
        <div className="summary-section text-center border-b-2 border-gray-200 pb-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {shopName}
          </h1>
          <div className="text-lg text-gray-600 mb-4">
            키워드: <span className="font-semibold text-blue-600">{keyword}</span>
          </div>
          <div className="text-sm text-gray-500">
            {startDate && endDate ? (
              <>
                {format(startDate, 'yyyy년 MM월 dd일')} ~ {format(endDate, 'yyyy년 MM월 dd일')}
              </>
            ) : (
              format(new Date(), 'yyyy년 MM월 dd일') + ' 기준'
            )}
          </div>
        </div>
      )}

      {/* 다운로드 버튼 - 미리보기 모드가 아닐 때만 표시 */}
      {!isPreviewMode && (
      <div className="download-buttons flex justify-end space-x-2">
        <div className="relative">
          <button
            onClick={() => setIsDownloadModalOpen(!isDownloadModalOpen)}
            className="flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            <Download className="mr-2 h-4 w-4" />
            다운로드 옵션
          </button>

            {isDownloadModalOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={handleDownloadModalOverlayClick}
                />
                <div 
                  className="absolute right-0 mt-2 w-full max-w-[425px] min-w-[280px] rounded-lg bg-white p-4 shadow-lg sm:p-6 z-50 border"
                  onClick={handleDownloadModalClick}
                >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold sm:text-lg">
                    다운로드 옵션
                  </h3>
                  <button
                    onClick={() => setIsDownloadModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      포함할 차트
                    </h4>
                    {[
                      { key: "rankChart", label: "순위 차트" },
                      { key: "visitorReviewChart", label: "방문자리뷰 차트" },
                      { key: "blogReviewChart", label: "블로그리뷰 차트" },
                      { key: "saveCountChart", label: "저장수 차트" },
                      { key: "includeAnalysis", label: "성장률 분석" },
                      { key: "includeDetailData", label: "상세데이터" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={downloadOptions[key as keyof DownloadOptions] as boolean}
                          onChange={(e) =>
                            setDownloadOptions((prev) => ({
                              ...prev,
                              [key]: e.target.checked,
                            }))
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  {/* <button
                    onClick={handleDirectDownload}
                    className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 flex items-center space-x-2"
                    disabled={false}
                  >
                    <Download className="w-4 h-4" />
                    <span>다운로드</span>
                  </button> */}
                  <button
                    onClick={openPreviewModal}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    disabled={false}
                  >
                    미리보기
                  </button>
                </div>
                </div>
              </>
            )}
          </div>
        </div>
        )}

        {/* 날짜 필터 섹션 - 미리보기 모드가 아닐 때만 표시 */}
        {!isPreviewMode && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-700">기간 필터</h3>
                <div className="h-4 w-px bg-gray-300" />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuickSelect(7)}
                    className={`rounded-md px-2 py-1 text-sm ${
                      !startDate && !endDate && timeRange === "7d"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    7일
                  </button>
                  <button
                    onClick={() => handleQuickSelect(30)}
                    className={`rounded-md px-2 py-1 text-sm ${
                      !startDate && !endDate && timeRange === "30d"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
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
                    onClick={resetDateRange}
                    className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-700 hover:bg-gray-200"
                  >
                    초기화
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                총 {filteredData.length}개 데이터
              </div>
              
              {/* 뷰 모드 토글 */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title="그리드 뷰"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md ${
                    viewMode === "list"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  title="리스트 뷰"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* 리포트 내용 */}
        <div className="space-y-8 bg-white report-content-for-capture" >
        
          {/* 성장률 분석 데이터 지표 */}
          {downloadOptions.includeAnalysis && (
            <div className="analysis-section">
              <h2 className="mb-6 text-base md:text-lg lg:text-xl font-semibold flex items-center">
                <BarChart3 className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                데이터 분석
              </h2>
              
              {/* 순위 정보 섹션 */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm md:text-base lg:text-lg font-medium text-gray-700">순위 정보</h3>
                <div className={`grid gap-4 justify-items-start ${isPreviewMode ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-4'}`}>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full">
                    <h4 className="text-xs md:text-sm lg:text-base font-medium text-gray-600">순위 변화</h4>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                      {analysisData.rankChange > 0 ? '+' : ''}{analysisData.rankChange.toLocaleString()}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">{analysisData.rankTrend}</p>
                  </div>
                                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full">
                    <h4 className="text-xs md:text-sm lg:text-base font-medium text-gray-600">평균 순위</h4>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                      {analysisData.averageRank.toFixed(1)}위
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full">
                    <h4 className="text-xs md:text-sm lg:text-base font-medium text-gray-600">최고 순위</h4>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                      {analysisData.bestRank.toLocaleString()}위
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full">
                    <h4 className="text-xs md:text-sm lg:text-base font-medium text-gray-600">최저 순위</h4>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                      {analysisData.worstRank.toLocaleString()}위
                    </p>
                  </div>
                </div>
              </div>

              {/* 성장률 섹션 */}
              <div>
                <h3 className="mb-3 text-sm md:text-base lg:text-lg font-medium text-gray-700">성장률</h3>
                <div className={`grid gap-4 justify-items-start ${isPreviewMode ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full">
                    <h4 className="text-xs md:text-sm lg:text-base font-medium text-gray-600">방문자리뷰 성장률</h4>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                      {analysisData.visitorReviewGrowth.toFixed(1)}%
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">{analysisData.reviewTrend}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full">
                    <h4 className="text-xs md:text-sm lg:text-base font-medium text-gray-600">블로그리뷰 성장률</h4>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                      {analysisData.blogReviewGrowth.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-full">
                    <h4 className="text-xs md:text-sm lg:text-base font-medium text-gray-600">저장수 성장률</h4>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800">
                      {analysisData.saveCountGrowth.toFixed(1)}%
                    </p>
                  </div>
                  
                </div>
              </div>
            </div>
          )}

          {/* 데이터 뷰 섹션 */}
          {downloadOptions.includeDetailData && (
            <div className="data-section">
              <h2 className="mb-4 text-base md:text-lg lg:text-xl font-semibold">📋 데이터 본문</h2>
              {viewMode === "grid" ? (
                isPreviewMode ? (
                  <div className="preview-grid-4">
                    {filteredData.map((track, index) => {
                      const prevTrack = filteredData[index + 1] || null;
                      
                      // 변화량 계산 함수들
                      const getRankChange = (current: number | null, prev: number | null) => {
                        if (!current || !prev) return { text: "", color: "", icon: "" };
                        const diff = prev - current; // 순위는 낮을수록 좋으므로 반대
                        if (diff > 0) return { text: `${diff}`, color: "text-green-500", icon: "↑" };
                        if (diff < 0) return { text: `${Math.abs(diff)}`, color: "text-red-500", icon: "↓" };
                        return { text: "-", color: "text-gray-500", icon: "" };
                      };

                      const getValueChange = (current: number | null, prev: number | null) => {
                        if (!current || !prev) return { text: "", color: "", icon: "" };
                        const diff = current - prev;
                        if (diff > 0) return { text: `+${diff}`, color: "text-green-500", icon: "↑" };
                        if (diff < 0) return { text: `${diff}`, color: "text-red-500", icon: "↓" };
                        return { text: "-", color: "text-gray-500", icon: "" };
                      };

                      const rankChange = getRankChange(track.rank, prevTrack?.rank);
                      const visitorChange = getValueChange(track.visitorReviewCount, prevTrack?.visitorReviewCount);
                      const blogChange = getValueChange(track.blogReviewCount, prevTrack?.blogReviewCount);
                      const saveChange = getValueChange(track.saveCount, prevTrack?.saveCount);

                      return (
                        <div
                          key={index}
                          className="preview-data-card group relative"
                        >
                          <div className="absolute top-2 right-2 text-xs text-gray-500 font-medium">
                            {new Date(track.chartDate).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                          </div>

                          <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">
                                {getRankString(track.rank)}
                              </span>
                              {rankChange.text && (
                                <div className={`flex items-center ${rankChange.color}`}>
                                  <span className="text-xs font-medium">{rankChange.icon}</span>
                                  <span className="text-xs font-medium ml-1">{rankChange.text}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">평점</span>
                                <span className="text-sm text-gray-600">{track.scoreInfo || "-"}</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">방</span>
                                <span className="text-sm text-gray-600">{(track.visitorReviewCount || 0).toLocaleString()}</span>
                              </div>
                              {visitorChange.text && (
                                <div className={`flex items-center ${visitorChange.color}`}>
                                  <span className="text-xs font-medium">{visitorChange.icon}</span>
                                  <span className="text-xs font-medium ml-1">{visitorChange.text}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-700">블</span>
                                <span className="text-sm text-gray-600">{(track.blogReviewCount || 0).toLocaleString()}</span>
                              </div>
                              {blogChange.text && (
                                <div className={`flex items-center ${blogChange.color}`}>
                                  <span className="text-xs font-medium">{blogChange.icon}</span>
                                  <span className="text-xs font-medium ml-1">{blogChange.text}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center space-x-2">
                              <span>저장수: {(track.saveCount || 0).toLocaleString()}</span>
                            </div>
                            {saveChange.text && (
                              <div className={`flex items-center ${saveChange.color}`}>
                                <span className="text-xs font-medium">{saveChange.icon}</span>
                                <span className="text-xs font-medium ml-1">{saveChange.text}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <TrackReportGridView
                    trackList={filteredData}
                    gridColumns={5}
                    hideControls={downloadOptions.hideGridControls}
                    getRankString={getRankString}
                  />
                )
              ) : (
                renderListView()
              )}
            </div>
          )}

        {/* 차트 섹션 - 조건부 레이아웃 */}
        {(downloadOptions.rankChart || downloadOptions.visitorReviewChart || downloadOptions.blogReviewChart || downloadOptions.saveCountChart) && (
          <div className="chart-section">
            <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 mb-6">📈 차트 분석</h2>
            <div className="space-y-16">
              {downloadOptions.rankChart && renderRankChart()}
              {downloadOptions.visitorReviewChart && renderVisitorReviewChart()}
              {downloadOptions.blogReviewChart && renderBlogReviewChart()}
              {downloadOptions.saveCountChart && renderSaveCountChart()}
            </div>
          </div>
        )}
       </div>
      
      {/* 미리보기 모달 */}
      <ReportPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        trackList={filteredData}
        shopName={shopName}
        keyword={keyword}
        shopId={shopId}
        startDate={startDate}
        endDate={endDate}
        viewMode={viewMode}
        downloadOptions={downloadOptions}
      />
    </div>
    
  );
}
