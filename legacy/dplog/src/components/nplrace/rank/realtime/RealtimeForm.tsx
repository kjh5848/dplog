"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/src/store/provider/StoreProvider";
import { Search, MapPin, ChevronDown, History, X, Clock } from "lucide-react";
import RealtimeResultItem from "./RealtimeResultItem";
import {
  useExecuteSearch,
  useNplaceSearch,
  getRecentSearches,
  getRecentSearchResults,
  SearchParams,
  nplaceRankSearchShop,
  isUsageLimitError,
  resolveMembershipLevel,
  MembershipLevel,
} from "@/src/viewModel/nplace/realtime/nplaceRankReailTimeViewModel";

import { useClickAway } from "react-use";
import toast from "react-hot-toast";
import { notifyUsageLimit } from "@/src/utils/usageLimitNotifier";
import { UsageLimitMeta } from "@/types/api";
import PriceRepository from "@/src/model/PriceRepository";

export default function RealtimeForm() {
  const { loginUser } = useAuthStore();

  const [location, setLocation] = useState("서울시");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [searchType, setSearchType] = useState<"업체명" | "SHOP_ID">("업체명");
  const [membershipLevel, setMembershipLevel] = useState<MembershipLevel>(0);
  const [recentSearches, setRecentSearches] = useState<SearchParams[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [showRecentPanel, setShowRecentPanel] = useState(true);
  const [recentPage, setRecentPage] = useState(1);
  const [recentPageSize, setRecentPageSize] = useState(5);
  const [recentSearchResults, setRecentSearchResults] = useState<
    {
      params: SearchParams;
      results: nplaceRankSearchShop[];
      timestamp: number;
    }[]
  >([]);

  // 현재 검색 파라미터
  const searchParams: SearchParams = {
    keyword,
    filterType: searchType === "SHOP_ID" ? "SHOP_ID" : "COMPANY_NAME",
    filterValue,
    province: location,
  };

  // 검색 결과 캐싱 쿼리
  const {
    data: searchResult,
    isLoading: isQueryLoading,
    error: queryError,
    refetch,
  } = useNplaceSearch(searchParams);

  // 검색 실행 뮤테이션
  const {
    mutate: executeSearch,
    isPending: isMutationLoading,
    error: mutationError,
    usageLimitReached,
    usageLimitMeta,
    markUsageLimitReached,
  } = useExecuteSearch(membershipLevel);

  // 최종 로딩 상태 및 에러
  const isLoading = isQueryLoading || isMutationLoading;
  const error = usageLimitReached ? null : queryError || mutationError;

  //박스이외 클릭시 닫음
  const recentBoxRef = useRef(null);
  const locationDropdownRef = useRef(null);
  
  useClickAway(recentBoxRef, () => {
    setShowRecentSearches(false);
  });
  
  useClickAway(locationDropdownRef, () => {
    setIsLocationDropdownOpen(false);
  });

  const updateRecentResultsFromStorage = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }
    setRecentSearchResults(getRecentSearchResults(membershipLevel));
  }, [membershipLevel]);

  const triggerUsageLimitToast = useCallback(
    (meta?: UsageLimitMeta | null) => {
      const resolvedMeta = meta ?? usageLimitMeta ?? null;
      notifyUsageLimit(resolvedMeta ?? undefined, {
        usageType: resolvedMeta?.usageType ?? "NPLACE_RANK_REALTIME",
        limit: typeof resolvedMeta?.limit === "number" ? resolvedMeta.limit : null,
        used: typeof resolvedMeta?.used === "number" ? resolvedMeta.used : null,
        force: true,
      });
    },
    [usageLimitMeta],
  );

  useEffect(() => {
    if (usageLimitReached) {
      triggerUsageLimitToast();
    }
  }, [triggerUsageLimitToast, usageLimitReached]);

  // 멤버십 조회 후 최근 검색 데이터 불러오기
  useEffect(() => {
    PriceRepository.getCurrentSubscription()
      .then((res) => {
        const sub = res.data?.subscription;
        const level = resolveMembershipLevel(
          sub ? Number(sub.planId) : undefined,
          sub?.plan?.name,
        );
        setMembershipLevel(level);
      })
      .catch(() => setMembershipLevel(0));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRecentSearches(getRecentSearches(membershipLevel));
      updateRecentResultsFromStorage();
    }
  }, [membershipLevel, updateRecentResultsFromStorage]);

  // 검색 실행 핸들러
  const handleSearch = async () => {
    if (!loginUser) {
      toast.error("로그인 후 이용 가능합니다.");
      return;
    }

    if (!filterValue.trim()) {
      toast.error("업체명 또는 SHOP_ID를 입력해주세요.");
      return;
    }

    if (usageLimitReached) {
      triggerUsageLimitToast();
      updateRecentResultsFromStorage();
      return;
    }

    if (!keyword.trim()) {
      toast.error("키워드를 입력해주세요.");
      return;
    }

    // 뮤테이션으로 검색 실행 (결과는 자동으로 캐싱됨)
    executeSearch(searchParams, {
      onSuccess: () => {
        // 최근 검색어 목록 업데이트
        setRecentSearches(getRecentSearches(membershipLevel));
        // 최근 검색 결과 업데이트
        setRecentSearchResults(getRecentSearchResults(membershipLevel));
        setShowRecentSearches(false);
      },
      onError: (error) => {
        if (isUsageLimitError(error)) {
          markUsageLimitReached(error.meta ?? null);
          triggerUsageLimitToast(error.meta ?? null);
          updateRecentResultsFromStorage();
          return;
        }
        toast.error(
          error instanceof Error
            ? error.message
            : "검색 중 오류가 발생했습니다.",
        );
      },
    });
  };

  // 최근 검색어 클릭 핸들러
  const handleRecentSearchClick = (params: SearchParams) => {
    setLocation(params.province);
    setFilterValue(params.filterValue);
    setKeyword(params.keyword);
    setSearchType(params.filterType === "SHOP_ID" ? "SHOP_ID" : "업체명");
    setShowRecentSearches(false);

    if (usageLimitReached) {
      triggerUsageLimitToast();
      updateRecentResultsFromStorage();
      return;
    }

    // 즉시 검색 실행
    executeSearch(params, {
      onError: (error) => {
        if (isUsageLimitError(error)) {
          markUsageLimitReached(error.meta ?? null);
          triggerUsageLimitToast(error.meta ?? null);
          updateRecentResultsFromStorage();
          return;
        }
        toast.error(
          error instanceof Error
            ? error.message
            : "검색 중 오류가 발생했습니다.",
        );
      },
    });
  };

  // 시간 포맷팅 함수
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const totalRecentPages = Math.max(
    1,
    Math.ceil((recentSearchResults.length || 0) / recentPageSize),
  );
  const currentRecentPage = Math.min(recentPage, totalRecentPages);
  const pagedRecentResults = (() => {
    const start = (currentRecentPage - 1) * recentPageSize;
    return recentSearchResults.slice(start, start + recentPageSize);
  })();

  const locations = [
    "서울시",
    "경기도",
    "인천시",
    "부산시",
    "대구시",
    "대전시",
    "광주시",
    "울산시",
    "세종시",
    "강원도",
    "충청북도",
    "충청남도",
    "전라북도",
    "전라남도",
    "경상북도",
    "경상남도",
    "제주도",
  ];

  return (
    <>
      {/* 최근 검색 결과 (키워드 조회 UI와 통일) */}
      <div className="mx-auto mb-8 w-full max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-500" />
            <h3 className="text-lg font-bold text-gray-700">최근 검색</h3>
          </div>
          {recentSearchResults.length > 0 ? (
            <div className="flex items-center gap-2">
              <select
                value={recentPageSize}
                onChange={(e) => {
                  setRecentPageSize(Number(e.target.value));
                  setRecentPage(1);
                }}
                className="rounded-md border border-gray-200 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
              >
                {[3, 5, 10].map((size) => (
                  <option key={size} value={size}>
                    {size}개
                  </option>
                ))}
              </select>
              <button
                className="rounded-md border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                onClick={() => setShowRecentPanel((prev) => !prev)}
              >
                {showRecentPanel ? "접기" : "열기"}
              </button>
              <button
                className="text-xs text-gray-500 underline"
                onClick={() => {
                  setRecentSearchResults([]);
                  setRecentSearches([]);
                  setRecentPage(1);
                  try {
                    localStorage.removeItem("recentSearchResults");
                    localStorage.removeItem("recentSearches");
                  } catch {}
                }}
              >
                기록 삭제
              </button>
            </div>
          ) : null}
        </div>

        {recentSearchResults.length === 0 ? (
          <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
            최근 검색 기록이 없습니다.
          </div>
        ) : (
          showRecentPanel && (
            <div className="mt-3 space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-800">
              {pagedRecentResults.map((item, index) => (
                <button
                  key={`${item.params.filterValue}-${item.params.keyword}-${item.timestamp}-${index}`}
                  onClick={() => handleRecentSearchClick(item.params)}
                  className="flex w-full items-center justify-between rounded-md bg-white px-3 py-2 text-left hover:bg-gray-100"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-blue-600">
                      {item.params.filterType === "SHOP_ID" ? "SHOP_ID 검색" : "업체명 검색"}
                    </span>
                    <span className="text-sm text-gray-800 truncate">
                      {item.params.filterType === "SHOP_ID" ? item.params.filterValue : `업체명: ${item.params.filterValue}`}
                    </span>
                    <span className="text-xs text-gray-600">
                      키워드: {item.params.keyword} · 지역: {item.params.province}
                    </span>
                  </div>
                  <span className="ml-2 shrink-0 text-xs text-gray-500">
                    {item.timestamp ? formatTime(item.timestamp) : ""}
                  </span>
                </button>
              ))}
              {totalRecentPages > 1 ? (
                <div className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-xs text-gray-700">
                  <span>
                    페이지 {currentRecentPage} / {totalRecentPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentRecentPage <= 1}
                      onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                      className="rounded border border-gray-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      이전
                    </button>
                    <button
                      disabled={currentRecentPage >= totalRecentPages}
                      onClick={() => setRecentPage((p) => Math.min(totalRecentPages, p + 1))}
                      className="rounded border border-gray-200 px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      다음
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )
        )}
      </div>

      <div className="mx-auto w-full max-w-7xl rounded-xl border border-blue-100 bg-gradient-to-r from-white to-blue-50 p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
            N-PLACE 실시간 순위 조회
          </h2>
          <p className="text-sm text-gray-500">
            지역 + 키워드로 원하는 업체를 검색해보세요
          </p>
        </div>

        {usageLimitReached && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">실시간 순위 조회 한도를 모두 사용했습니다.</p>
            {typeof usageLimitMeta?.limit === "number" &&
              typeof usageLimitMeta?.used === "number" && (
                <p className="mt-1 text-xs text-amber-800">
                  사용량: {usageLimitMeta.used} / {usageLimitMeta.limit}
                </p>
              )}
            <p className="mt-2 text-amber-800">
              최근 검색 결과를 확인하거나 멤버십을 업그레이드하면 더 조회할 수 있어요.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="/membership"
                className="inline-flex items-center justify-center rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                멤버십 업그레이드
              </a>
              <button
                type="button"
                onClick={() => setShowRecentSearches(true)}
                className="inline-flex items-center justify-center rounded-md border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
              >
                최근 검색 보기
              </button>
            </div>
          </div>
        )}

        {/* 검색 타입 선택 */}
        <div className="mb-4 flex space-x-2">
          {["업체명", "SHOP_ID"].map((type) => (
            <button
              key={type}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all md:w-auto ${
                searchType === type
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                  : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setSearchType(type as "업체명" | "SHOP_ID")}
            >
              {type} 검색
            </button>
          ))}
        </div>

        {/* 필드 입력 */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12">
          {/* 지역 선택 */}
          <div className="relative md:col-span-3">
            <div
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-xs transition-all hover:shadow"
            >
              <div className="flex items-center">
                <MapPin size={18} className="mr-2 text-blue-500" />
                <span className="text-gray-700">{location}</span>
              </div>
              <ChevronDown
                size={18}
                className={`text-blue-500 transition-transform ${isLocationDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
            {isLocationDropdownOpen && (
              <div
                ref={locationDropdownRef}
                className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
              >
                {locations.map((loc) => (
                  <div
                    key={loc}
                    className="cursor-pointer p-3 hover:bg-blue-50"
                    onClick={() => {
                      setLocation(loc);
                      setIsLocationDropdownOpen(false);
                    }}
                  >
                    {loc}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 업체명 or SHOP_ID */}
          <div className="relative md:col-span-4">
            <div className="relative">
              <input
                type="text"
                placeholder={
                  searchType === "SHOP_ID" ? "SHOP_ID 입력" : "업체명 입력"
                }
                className="w-full rounded-lg border border-gray-200 bg-white p-3 text-gray-700 placeholder-gray-400"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                onFocus={() => {
                  if (recentSearches.length > 0) {
                    setShowRecentSearches(true);
                  }
                }}
              />
              {filterValue && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setFilterValue("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* 최근 검색어 표시 */}
            {showRecentSearches && recentSearches.length > 0 && (
              <div
                ref={recentBoxRef}
                className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
              >
                <div className="border-b border-gray-100 p-2 text-xs font-medium text-gray-500">
                  최근 검색어 (
                  {recentSearches.length > 3 ? 3 : recentSearches.length}개)
                </div>
                {recentSearches.slice(0, 3).map((search, index) => (
                  <div
                    key={index}
                    className="flex cursor-pointer items-center border-b border-gray-50 p-3 hover:bg-blue-50"
                    onClick={() => handleRecentSearchClick(search)}
                  >
                    <History size={14} className="mr-2 text-blue-500" />
                    <div>
                      <span className="text-sm font-medium">
                        {search.filterType === "SHOP_ID"
                          ? "SHOP_ID: "
                          : "업체명: "}
                        {search.filterValue}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        키워드: {search.keyword}
                      </span>
                    </div>
                  </div>
                ))}
                <div
                  className="cursor-pointer p-2 text-center text-xs text-blue-500 hover:text-blue-700"
                  onClick={() => setShowRecentSearches(false)}
                >
                  닫기
                </div>
              </div>
            )}
          </div>

          {/* 키워드 */}
          <div className="relative md:col-span-3">
            <div className="relative">
              <input
                type="text"
                placeholder="키워드"
                className="w-full rounded-lg border border-gray-200 bg-white p-3 text-gray-700 placeholder-gray-400"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              {keyword && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setKeyword("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 검색 버튼 */}
          <div className="relative md:col-span-2">
            <button
              className={`flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3 font-medium text-white shadow-md transition-all hover:shadow-lg md:w-auto ${
                isLoading || usageLimitReached ? "cursor-not-allowed opacity-70" : ""
              }`}
              onClick={handleSearch}
              disabled={isLoading || usageLimitReached}
            >
              {isLoading ? (
                <>
                  <svg
                    className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  검색 중...
                </>
              ) : (
                <>
                  <Search size={18} className="mr-2" />
                  검색 시작
                </>
              )}
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-red-700">
            {error instanceof Error
              ? error.message
              : "검색 중 오류가 발생했습니다."}
          </div>
        )}

        {/* 검색 결과 */}
        {searchResult && searchResult.data.nplaceRankSearchShopList.length > 0 ? (
          <div className="mt-6 space-y-4">
            {searchResult.data.nplaceRankSearchShopList.map((item, index) => (
              <RealtimeResultItem key={index} item={item} />
            ))}
          </div>
        ) : searchResult && searchResult.data.nplaceRankSearchShopList.length === 0 ? (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        ) : null}
      </div>
    </>
  );
}
