"use client";
import { useState, useEffect, useMemo } from "react";
import GlobalLoadingOverlay from "@/src/components/common/loading/GlobalLoadingOverlay";
import { useAuthGuard } from "@/src/utils/auth";
import { loadingUtils } from "@/src/utils/loading";
import { useRouter } from "next/navigation";
import { useNplaceRankKeywordCompareViewModel } from "@/src/viewModel/nplace/keword/nplaceRankKeywordCompareViewModel";
import { useNplaceGroupViewModel } from "@/src/viewModel/group/nplaceGroupViewMode";
import { LayoutGrid, FileText, BarChart2, X, ChevronUp, ChevronDown } from "lucide-react";
import { useViewModeStore } from "@/src/store/useViewModeStore";
import toast from "react-hot-toast";

// 키워드 비교 컴포넌트들 임포트
import KeywordShopList from "@/src/components/nplrace/rank/keyword/KeywordShopList";
import KeywordSidebar from "@/src/components/nplrace/rank/keyword/KeywordSidebar";
import DplogHeader from "@/src/components/common/Headers/DplogHeader";
import KeywordReportView from "@/src/components/nplrace/rank/keyword/KeywordReportView";

// 순위 비교 컴포넌트
import KeywordCompareView from "@/src/components/nplrace/rank/keyword/KeywordCompareView";
import KeywordGridView from "@/src/components/nplrace/rank/keyword/KeywordGridView";
import { logError, logInfo } from "@/src/utils/logger";

export default function KeywordClientPage() {
  const router = useRouter();
  const { isLoading, isGuest, isLogoutPending } = useAuthGuard();
  const authConfig = useMemo(() => loadingUtils.userAuth(), []);
  const guestConfig = useMemo(() => loadingUtils.loginRedirect(), []);
  const logoutConfig = useMemo(() => loadingUtils.logoutAuth(), []);
  const dataLoadingConfig = useMemo(() => loadingUtils.dataLoading(), []);

  // 키워드 데이터의 뷰 모드 (로컬)
  const [keywordDataViewMode, setKeywordDataViewMode] = useState<
    "grid" | "report"
  >("grid");

  // 선택된 추적 데이터 상태 추가
  const [selectedTrackData, setSelectedTrackData] = useState<any>(null);

  // 자동 선택된 날짜 상태 추가
  const [isAutoSelected, setIsAutoSelected] = useState<boolean>(false);

  // 그룹 필터 상태 추가
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

  // 플로팅 상점 정보 상태
  const [isFloatingShopVisible, setIsFloatingShopVisible] =
    useState<boolean>(false);
  const [isFloatingCollapsed, setIsFloatingCollapsed] =
    useState<boolean>(false);
  const [isFloatingMinimized, setIsFloatingMinimized] =
    useState<boolean>(false);

  // 그룹 뷰모델 추가
  const { groupList } = useNplaceGroupViewModel();

  // ViewModel 사용
  const {
    // 상점 데이터
    shopList,
    isLoadingShopList,
    shopListError,

    // 상점 상세 데이터
    shopDetail,
    isLoadingShopDetail,

    // 선택된 데이터
    selectedShop,
    selectedKeyword,
    compareData,

    // 키워드 목록
    keywords,

    // 액션 핸들러
    handleShopSelect,
    handleKeywordSelect: originalHandleKeywordSelect,
    getRankChangeString,
    getRankString,
    fetchRankCompareDataForDate,

    // 새로 추가된 상태들
    hasRealtimeData,
    realtimeDataError,
    isRealtimeDataLoading,
    isGridItemLoading,
    setIsGridItemLoading,
  } = useNplaceRankKeywordCompareViewModel();

  // 게스트 사용자 처리
  useEffect(() => {
    if (isGuest && !isLogoutPending) {
      toast.error("로그인 후 이용해주세요.", {
        id: "guest-redirect",
        duration: 3000,
      });
      router.push("/login");
    }
  }, [isGuest, isLogoutPending, router]);

  // 키워드 선택 핸들러 래핑 (자동 선택 상태 표시)
  const handleKeywordSelect = async (keyword: string) => {
    // 이전 데이터를 완전히 초기화
    setSelectedTrackData(null);
    setIsAutoSelected(false);

    logInfo(`키워드 선택 - 이전 데이터 초기화, 새 키워드: ${keyword}`);

    await originalHandleKeywordSelect(keyword);
  };

  // compareData가 업데이트될 때 자동 선택 처리
  useEffect(() => {
    if (isGuest) {
      return;
    }

    if (
      compareData?.trackList &&
      compareData.trackList.length > 0 &&
      !selectedTrackData
    ) {
      const latestTrack = compareData.trackList[0];
      setSelectedTrackData(latestTrack);
      setIsAutoSelected(true);

      // 3초 후 자동 선택 표시 제거
      const timer = setTimeout(() => {
        setIsAutoSelected(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isGuest, compareData, selectedTrackData]);

  // 상점과 키워드가 선택되면 플로팅 정보 표시
  useEffect(() => {
    if (isGuest) {
      setIsFloatingShopVisible(false);
      setIsFloatingMinimized(false);
      return;
    }

    if (selectedShop && selectedKeyword) {
      setIsFloatingShopVisible(true);
      setIsFloatingCollapsed(false); // 처음에는 펼친 상태
      setIsFloatingMinimized(false); // 처음에는 최소화되지 않은 상태

      // 1.5초 후 자동으로 접기
      // const timer = setTimeout(() => {
      //   setIsFloatingCollapsed(true);
      // }, 1500);

      // 5초 후 자동으로 최소화
      const minimizeTimer = setTimeout(() => {
        setIsFloatingMinimized(true);
      }, 1000);

      return () => {
        // clearTimeout(timer);
        clearTimeout(minimizeTimer);
      };
    } else {
      setIsFloatingShopVisible(false);
      setIsFloatingMinimized(false);
    }
  }, [isGuest, selectedShop, selectedKeyword]);

  // 그룹에 따른 상점 필터링
  const filteredShopList = shopList.filter((shop) => {
    if (selectedGroup === "all") return true;
    if (selectedGroup === "기본")
      return !shop.groupName || shop.groupName === "기본";
    return shop.groupName === selectedGroup;
  });

  // 그리드 아이템 클릭 핸들러
  const handleGridItemClick = async (trackData: any) => {
    logInfo("Grid item clicked:", trackData);
    setSelectedTrackData(trackData);
    setIsAutoSelected(false); // 수동 선택 시 자동 선택 상태 해제

    // 실제 API 호출하여 순위 비교 데이터 가져오기
    if (fetchRankCompareDataForDate) {
      try {
        setIsGridItemLoading(true); // 로딩 시작
        const loadingToastId = toast.loading(
          `${new Date(trackData.chartDate).toLocaleDateString("ko-KR")} 순위 데이터를 불러오는 중...`,
        );

        const rankData = await fetchRankCompareDataForDate(trackData);

        toast.dismiss(loadingToastId);
        setIsGridItemLoading(false); // 로딩 종료

        if (rankData && rankData.length > 0) {
          toast.success(
            `${rankData.length}개 업체의 순위 비교 데이터를 불러왔습니다.`,
            {
              duration: 3000,
            },
          );
        } else {
          toast.error(
            `${new Date(trackData.chartDate).toLocaleDateString("ko-KR")} 날짜의 순위 정보가 없습니다.`,
            {
              duration: 4000,
            },
          );
        }
      } catch (error) {
        toast.dismiss();
        setIsGridItemLoading(false); // 로딩 종료
        const errorObj =
          error instanceof Error ? error : new Error("Unknown error occurred");
        logError("순위 비교 데이터 조회 오류:", errorObj);
        toast.error(
          "순위 비교 데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.",
          {
            duration: 4000,
          },
        );
      }
    }
  };

  const isDataLoading =
    isLoadingShopList || isLoadingShopDetail || isRealtimeDataLoading || isGridItemLoading;

  const dataLoadingMessage = useMemo(() => {
    if (isGridItemLoading) {
      return "선택한 날짜의 순위 데이터를 불러오는 중입니다.";
    }
    if (isRealtimeDataLoading) {
      return "실시간 데이터를 동기화하고 있습니다.";
    }
    if (isLoadingShopDetail) {
      return "상점 정보를 불러오는 중입니다.";
    }
    if (isLoadingShopList) {
      return "상점 목록을 불러오는 중입니다.";
    }
    return "데이터를 불러오는 중입니다.";
  }, [
    isGridItemLoading,
    isRealtimeDataLoading,
    isLoadingShopDetail,
    isLoadingShopList,
  ]);

  if (isLoading) {
    const config = isLogoutPending ? logoutConfig : authConfig;
    const subMessage = isLogoutPending
      ? "로그아웃을 처리하고 있습니다."
      : "사용자 인증을 확인하고 있습니다.";
    return (
      <>
        <GlobalLoadingOverlay visible config={{ ...config, subMessage }} />
        <div  />
      </>
    );
  }

  if (isGuest) {
    return (
      <>
        <GlobalLoadingOverlay
          visible
          config={{ ...guestConfig, subMessage: "로그인 페이지로 이동합니다." }}
        />
        <div  />
      </>
    );
  }

  return (
    <div className="mx-auto min-h-screen px-4 py-6">
      {isDataLoading && (
        <GlobalLoadingOverlay
          visible
          config={{
            ...dataLoadingConfig,
            subMessage: dataLoadingMessage,
          }}
        />
      )}
      <DplogHeader title="N-PLACE" message="순위비교" />

      {/* 상단 영역: 상점 선택 및 키워드 목록 (비율 3:1) */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[3fr_1fr]">
        {/* 상점 선택 영역 */}
        <div className="h-[500px]">
          {/* 그룹 필터 추가 */}
          <div className="mb-4 flex items-center space-x-4">
            <label
              htmlFor="groupFilter"
              className="text-sm font-medium text-gray-700"
            >
              그룹:
            </label>
            <select
              id="groupFilter"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">전체</option>
              <option value="기본">기본</option>
              {groupList?.map((group) => (
                <option key={group.id} value={group.groupName}>
                  {group.groupName}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              ({filteredShopList.length}개)
            </span>
          </div>

          <div className="h-[calc(100%-4rem)]">
            <KeywordShopList
              shops={filteredShopList}
              isLoading={isLoadingShopList}
              selectedShop={selectedShop}
              onSelectShop={handleShopSelect}
            />
          </div>
        </div>

        {/* 키워드 목록 영역 */}
        <div className="h-[calc(98%)]">
          {selectedShop && (
            <KeywordSidebar
              shopName={selectedShop.shopName}
              keywords={keywords}
              selectedKeyword={selectedKeyword}
              isLoading={isLoadingShopDetail}
              onSelectKeyword={handleKeywordSelect}
            />
          )}
        </div>
      </div>

      {/* 플로팅 상점 정보 */}
      {isFloatingShopVisible && (
        <>
          {/* 최소화된 상태 - 작은 동그라미 */}
          {isFloatingMinimized ? (
            <div
              className="animate-fadeIn fixed top-20 right-4 z-50 h-12 w-12 transform cursor-pointer rounded-full bg-blue-600 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-blue-700"
              onClick={() => setIsFloatingMinimized(false)}
            >
              <div className="flex h-full items-center justify-center text-xs font-bold text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>
            </div>
          ) : (
            /* 전체 플로팅 창 */
            <div className="animate-slideInRight fixed top-20 right-4 z-50 w-80 transform rounded-lg border border-gray-200 bg-white shadow-lg transition-all duration-300">
              <div className="p-4">
                <div
                  className="-m-1 mb-2 flex cursor-pointer items-center justify-between rounded p-1 transition-colors duration-200 hover:bg-gray-50"
                  onClick={() => setIsFloatingCollapsed(!isFloatingCollapsed)}
                >
                  <h3 className="text-sm font-medium text-gray-700">
                    선택된 정보
                  </h3>
                  <div className="flex items-center space-x-1">
                    {/* <button className="p-1 hover:bg-gray-100 rounded transition-all duration-200 transform hover:scale-110">
                      <div className={`transform transition-transform duration-300 ${isFloatingCollapsed ? 'rotate-0' : 'rotate-180'}`}>
                        <ChevronDown size={16} />
                      </div>
                    </button> */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFloatingMinimized(true);
                      }}
                      className="transform rounded p-1 transition-all duration-200 hover:scale-110 hover:bg-gray-100"
                      title="최소화"
                    >
                      <span className="text-xs">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                          />
                        </svg>
                      </span>
                    </button>
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFloatingShopVisible(false);
                      }}
                      className="p-1 hover:bg-gray-100 rounded transition-all duration-200 transform hover:scale-110"
                    >
                      <X size={16} />
                    </button> */}
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isFloatingCollapsed
                      ? "max-h-0 opacity-0"
                      : "max-h-96 opacity-100"
                  }`}
                >
                  <div className="space-y-2 pt-2 text-sm">
                    <div className="-m-1 transform rounded p-1 transition-all duration-200 hover:bg-gray-50">
                      <span className="font-medium text-gray-600">상점:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedShop?.shopName}
                      </span>
                    </div>
                    <div className="-m-1 transform rounded p-1 transition-all duration-200 hover:bg-gray-50">
                      <span className="font-medium text-gray-600">키워드:</span>
                      <span className="ml-2 text-gray-900">
                        "{selectedKeyword}"
                      </span>
                    </div>
                    {selectedTrackData && (
                      <>
                        <div className="-m-1 transform rounded p-1 transition-all duration-200 hover:bg-gray-50">
                          <span className="font-medium text-gray-600">
                            선택된 날짜:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {new Date(
                              selectedTrackData.chartDate,
                            ).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        <div className="-m-1 transform rounded p-1 transition-all duration-200 hover:bg-gray-50">
                          <span className="font-medium text-gray-600">
                            순위:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {getRankString(selectedTrackData.rank)}
                          </span>
                        </div>
                        {isAutoSelected && (
                          <div className="animate-pulse rounded border border-green-200 bg-green-50 p-2 text-xs font-medium text-green-600">
                            🔄 최신 날짜 자동 선택
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 메인 콘텐츠 */}
      {selectedShop && selectedKeyword ? (
        <div className="space-y-6">
          {/* 뷰 모드 선택 버튼 */}
          {/* <div className="flex items-center justify-end space-x-2">
            <button
              onClick={() => setKeywordDataViewMode("grid")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                keywordDataViewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <LayoutGrid size={16} />
             
            </button>
            <button
              onClick={() => setKeywordDataViewMode("report")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                keywordDataViewMode === "report"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <FileText size={16} />
              
            </button>
          </div> */}

          {/* 2열 그리드: 순위 비교 + 그리드/리포트 뷰 */}
          <div className="grid h-[1400px] grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
            {/* 순위 비교 영역 */}
            <div className="card-keyword h-full">
              <div className="border-primary-100 border-b p-4">
                <h2 className="text-lg font-medium text-gray-900">순위비교</h2>
              </div>
              <div className="h-[calc(100%-5rem)] p-1">
                <KeywordCompareView
                  data={compareData}
                  getRankChangeString={getRankChangeString}
                  getRankString={getRankString}
                  isLoading={isRealtimeDataLoading || isGridItemLoading}
                />
              </div>
            </div>

            {/* 리포트/그리드 뷰 */}
            <div className="card-keyword max-h-[1400px] overflow-y-auto">
              {/* <div className="border-primary-100 border-b p-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {keywordDataViewMode === "report" ? "리포트" : "그리드 뷰"}
                </h2>
              </div> */}
              <div className="h-[calc(100%-5rem)] p-4">
                {keywordDataViewMode === "report" ? (
                  <KeywordReportView
                    trackList={compareData?.trackList || []}
                    shopName={selectedShop.shopName || ""}
                    keyword={selectedKeyword}
                    compareData={compareData}
                  />
                ) : (
                  <KeywordGridView
                    trackList={compareData?.trackList || []}
                    onItemClick={handleGridItemClick}
                    getRankString={getRankString}
                    selectedTrackData={selectedTrackData}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-primary-100 bg-primary-50 flex h-64 items-center justify-center rounded-lg border p-4 text-gray-500">
          상점과 키워드를 선택해주세요
        </div>
      )}
    </div>
  );
} 
