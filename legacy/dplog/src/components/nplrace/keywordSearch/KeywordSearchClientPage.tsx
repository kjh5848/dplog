"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import DplogHeader from "@/src/components/common/Headers/DplogHeader";
import GlobalLoadingOverlay from "@/src/components/common/loading/GlobalLoadingOverlay";
import { useAuthGuard } from "@/src/utils/auth";
import { loadingUtils } from "@/src/utils/loading";
import NplaceKeywordRepository from "@/src/model/NplaceKeywordRepository";
import { KeywordToolItem } from "@/src/types/nplaceKeyword";
import PriceRepository from "@/src/model/PriceRepository";

type Mode = "KEYWORD" | "RELATION";

type HistoryItem = {
  mode: Mode;
  keywords: string[];
  results: KeywordToolItem[];
  timestamp: number;
};

const HISTORY_KEY = "nplace-keyword-history";
const MAX_HISTORY_FREE = 10;
const MAX_HISTORY_PAID = 50;
const FREE_TTL_MS = 24 * 60 * 60 * 1000; // 1일

type MembershipType = "free" | "paid";
type SortKey =
  | "relKeyword"
  | "monthlyPcQcCnt"
  | "monthlyMobileQcCnt"
  | "monthlyAvePcClkCnt"
  | "monthlyAveMobileClkCnt"
  | "monthlyAvePcCtr"
  | "monthlyAveMobileCtr"
  | "plAvgDepth"
  | "compIdx";
type SortDir = "asc" | "desc";

export default function KeywordSearchClientPage() {
  const router = useRouter();
  const { isLoading, isGuest, isLogoutPending } = useAuthGuard();
  const authConfig = useMemo(() => loadingUtils.userAuth(), []);
  const guestConfig = useMemo(() => loadingUtils.loginRedirect(), []);
  const logoutConfig = useMemo(() => loadingUtils.logoutAuth(), []);

  const [mode, setMode] = useState<Mode>("KEYWORD");
  const [inputText, setInputText] = useState("");
  const [keywordResults, setKeywordResults] = useState<KeywordToolItem[]>([]);
  const [relationResults, setRelationResults] = useState<KeywordToolItem[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState("");
  const [pcMin, setPcMin] = useState("");
  const [pcMax, setPcMax] = useState("");
  const [mobileMin, setMobileMin] = useState("");
  const [mobileMax, setMobileMax] = useState("");
  const [compFilter, setCompFilter] = useState<"all" | "낮음" | "중간" | "높음">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("relKeyword");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [membershipType, setMembershipType] = useState<MembershipType>("free");

  const keywordMutation = useMutation({
    mutationFn: async (keywords: string[]) => {
      return await NplaceKeywordRepository.fetchKeywordList(keywords);
    },
    onSuccess: (data, variables) => {
      const next = data.keywordToolList || [];
      const usedKeywords = variables || [];
      setKeywordResults(next);
      setPage(1);
      setFilterText("");
      setLastError(null);
      saveHistory("KEYWORD", usedKeywords, next);
      if ((data.keywordToolList || []).length === 0) {
        toast("결과가 없습니다. 키워드를 다시 확인해주세요.");
      } else {
        toast.success("키워드 정보를 불러왔습니다.");
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "키워드 정보를 불러오지 못했습니다";
      setLastError(message);
      toast.error(message);
    },
  });

  const relationMutation = useMutation({
    mutationFn: async (keywords: string[]) => {
      return await NplaceKeywordRepository.fetchRelationList(keywords);
    },
    onSuccess: (data, variables) => {
      const next = data.keywordToolList || [];
      const usedKeywords = variables || [];
      setRelationResults(next);
      setPage(1);
      setFilterText("");
      setLastError(null);
      saveHistory("RELATION", usedKeywords, next);
      if ((data.keywordToolList || []).length === 0) {
        toast("연관 키워드 결과가 없습니다.");
      } else {
        toast.success("연관 키워드를 불러왔습니다.");
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "연관 키워드를 불러오지 못했습니다";
      setLastError(message);
      toast.error(message);
    },
  });

  const normalizeKeywords = (text: string) => {
    const tokens = text
      .split(/[\n,]/)
      .map((kw) => kw.trim())
      .filter(Boolean);
    return Array.from(new Set(tokens));
  };

  useEffect(() => {
    if (isGuest && !isLogoutPending) {
      toast.error("로그인 후 이용해주세요.", {
        id: "guest-redirect",
        duration: 3000,
      });
      router.push("/login");
    }
  }, [isGuest, isLogoutPending, router]);

  useEffect(() => {
    PriceRepository.getCurrentSubscription()
      .then((res) => {
        if (res.code === 0 && res.data?.subscription) {
          setMembershipType("paid");
        } else {
          setMembershipType("free");
        }
      })
      .catch(() => {
        setMembershipType("free");
      });
  }, []);

  const cleanupHistory = (entries: HistoryItem[], type: MembershipType): HistoryItem[] => {
    const now = Date.now();
    const ttlFiltered =
      type === "free" ? entries.filter((item) => now - item.timestamp <= FREE_TTL_MS) : entries;
    const unique = ttlFiltered.reduce<HistoryItem[]>((acc, item) => {
      const duplicateIndex = acc.findIndex(
        (h) => h.mode === item.mode && h.keywords.join(",") === item.keywords.join(","),
      );
      if (duplicateIndex >= 0) {
        acc[duplicateIndex] = item;
      } else {
        acc.push(item);
      }
      return acc;
    }, []);
    const sorted = unique.sort((a, b) => b.timestamp - a.timestamp);
    const maxSize = type === "paid" ? MAX_HISTORY_PAID : MAX_HISTORY_FREE;
    return sorted.slice(0, maxSize);
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryItem[];
        if (Array.isArray(parsed)) {
          const cleaned = cleanupHistory(parsed, membershipType);
          setHistory(cleaned);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(cleaned));
        }
      }
    } catch { }
  }, [membershipType]);

  const saveHistory = (modeToSave: Mode, keywords: string[], results: KeywordToolItem[]) => {
    const entry: HistoryItem = {
      mode: modeToSave,
      keywords,
      results,
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      const next = cleanupHistory(
        [entry, ...prev.filter((h) => !(h.mode === modeToSave && h.keywords.join(",") === keywords.join(",")))],
        membershipType,
      );
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const loadHistoryEntry = (entry: HistoryItem) => {
    setMode(entry.mode);
    setInputText(entry.keywords.join("\n"));
    setFilterText("");
    setPage(1);
    if (entry.mode === "KEYWORD") {
      setKeywordResults(entry.results || []);
    } else {
      setRelationResults(entry.results || []);
    }
  };

  useEffect(() => {
    setFilterText("");
    setPage(1);
  }, [mode]);

  const activeResults = mode === "KEYWORD" ? keywordResults : relationResults;

  const filteredResults = useMemo(() => {
    const keyword = filterText.trim().toLowerCase();
    const compOrder: Record<string, number> = { 낮음: 1, 중간: 2, 높음: 3 };

    const matchesRange = (value: number | undefined, min: string, max: string) => {
      if (value == null) return false;
      const minNum = min ? Number(min) : null;
      const maxNum = max ? Number(max) : null;
      if (minNum != null && value < minNum) return false;
      if (maxNum != null && value > maxNum) return false;
      return true;
    };

    const filtered = activeResults.filter((item) => {
      if (keyword && !item.relKeyword.toLowerCase().includes(keyword)) return false;
      if (compFilter !== "all" && item.compIdx !== compFilter) return false;
      if (pcMin || pcMax) {
        if (!matchesRange(item.monthlyPcQcCnt, pcMin, pcMax)) return false;
      }
      if (mobileMin || mobileMax) {
        if (!matchesRange(item.monthlyMobileQcCnt, mobileMin, mobileMax)) return false;
      }
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "relKeyword") {
        return a.relKeyword.localeCompare(b.relKeyword) * dir;
      }
      if (sortKey === "compIdx") {
        const aVal = a.compIdx ? compOrder[a.compIdx] || 0 : 0;
        const bVal = b.compIdx ? compOrder[b.compIdx] || 0 : 0;
        return (aVal - bVal) * dir;
      }
      const aVal = (a as any)[sortKey] ?? 0;
      const bVal = (b as any)[sortKey] ?? 0;
      if (aVal === bVal) return 0;
      return (aVal > bVal ? 1 : -1) * dir;
    });

    return sorted;
  }, [
    activeResults,
    compFilter,
    filterText,
    mobileMax,
    mobileMin,
    pcMax,
    pcMin,
    sortDir,
    sortKey,
  ]);

  const totalCount = filteredResults.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  const handleSubmit = async () => {
    const keywords = normalizeKeywords(inputText);

    if (keywords.length === 0) {
      toast.error("키워드를 한 개 이상 입력해주세요.");
      return;
    }

    if (mode === "RELATION" && keywords.length > 5) {
      toast.error("연관 키워드는 최대 5개까지 입력할 수 있습니다.");
      return;
    }

    if (mode === "KEYWORD") {
      await keywordMutation.mutateAsync(keywords);
    } else {
      await relationMutation.mutateAsync(keywords);
    }
  };

  if (isLoading) {
    const config = isLogoutPending ? logoutConfig : authConfig;
    const subMessage = isLogoutPending
      ? "로그아웃을 처리하고 있습니다."
      : "사용자 인증을 확인하고 있습니다.";
    return <GlobalLoadingOverlay visible config={{ ...config, subMessage }} />;
  }

  if (isGuest) {
    return (
      <GlobalLoadingOverlay
        visible
        config={{
          ...guestConfig,
          subMessage: "로그인 페이지로 이동합니다.",
        }}
      />
    );
  }

  const isPending = keywordMutation.isPending || relationMutation.isPending;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-6">
      <DplogHeader title="N-PLACE" message="키워드 조회" />

      <div className="mt-6 grid gap-4 lg:grid-cols-[2fr,3fr]">
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "KEYWORD"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                onClick={() => setMode("KEYWORD")}
              >
                키워드 조회
              </button>
              <button
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === "RELATION"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                onClick={() => setMode("RELATION")}
              >
                연관 키워드
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">키워드 입력</label>
            <textarea
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              rows={6}
              placeholder={
                mode === "RELATION"
                  ? "최대 5개까지 키워드를 입력하세요.\n예) 카페\n디저트\n플라워샵"
                  : "키워드를 줄바꿈 또는 쉼표로 구분해 입력하세요.\n예) 플라워샵, 꽃배달, 서울 꽃집"
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isPending}
            />
            <p className="mt-2 text-xs text-gray-500">
              {mode === "RELATION"
                ? "연관 모드는 최대 5개 키워드까지 가능합니다."
                : "중복/빈값은 자동으로 제거됩니다."}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "조회 중..." : mode === "KEYWORD" ? "키워드 조회" : "연관 키워드 조회"}
            </button>
            <button
              onClick={() => setInputText("")}
              disabled={isPending}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              입력 초기화
            </button>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">조회 결과</p>
            </div>
            {isPending ? (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
                조회 중...
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <span className="rounded-md bg-white px-2 py-1 font-semibold text-gray-900">결과 {totalCount}건</span>
            <div className="flex items-center gap-2">
              <input
                value={filterText}
                onChange={(e) => {
                  setFilterText(e.target.value);
                  setPage(1);
                }}
                placeholder="키워드 필터"
                className="rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
              />
              {filterText ? (
                <button
                  onClick={() => {
                    setFilterText("");
                    setPage(1);
                  }}
                  className="text-xs font-semibold text-blue-600"
                >
                  필터 해제
                </button>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">정렬</span>
              <select
                value={sortKey}
                onChange={(e) => {
                  setSortKey(e.target.value as SortKey);
                  setPage(1);
                }}
                className="rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="relKeyword">키워드</option>
                <option value="monthlyPcQcCnt">PC 검색량</option>
                <option value="monthlyMobileQcCnt">모바일 검색량</option>
                <option value="monthlyAvePcClkCnt">PC 클릭수</option>
                <option value="monthlyAveMobileClkCnt">모바일 클릭수</option>
                <option value="monthlyAvePcCtr">PC CTR</option>
                <option value="monthlyAveMobileCtr">모바일 CTR</option>
                <option value="plAvgDepth">평균 노출 순위</option>
                <option value="compIdx">경쟁도</option>
              </select>
              <select
                value={sortDir}
                onChange={(e) => {
                  setSortDir(e.target.value as SortDir);
                  setPage(1);
                }}
                className="rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="asc">오름차순</option>
                <option value="desc">내림차순</option>
              </select>
              <button
                onClick={() => setShowFilters((prev) => !prev)}
                className="rounded-md border border-blue-200 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
              >
                {showFilters ? "필터 접기" : "필터 열기"}
              </button>
            </div>
            {showFilters ? (
              <div className="w-full space-y-2 rounded-md bg-white/60 p-2 text-xs text-gray-700 md:flex md:flex-wrap md:items-center md:gap-2 md:space-y-0">
                <span className="font-semibold text-gray-800">조건 필터</span>
                <div className="flex w-full items-center gap-2 md:w-auto">
                  <span className="text-gray-500">PC</span>
                  <input
                    value={pcMin}
                    onChange={(e) => {
                      setPcMin(e.target.value);
                      setPage(1);
                    }}
                    placeholder="최소"
                    className="w-16 flex-1 rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    value={pcMax}
                    onChange={(e) => {
                      setPcMax(e.target.value);
                      setPage(1);
                    }}
                    placeholder="최대"
                    className="w-16 flex-1 rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex w-full items-center gap-2 md:w-auto">
                  <span className="text-gray-500">모바일</span>
                  <input
                    value={mobileMin}
                    onChange={(e) => {
                      setMobileMin(e.target.value);
                      setPage(1);
                    }}
                    placeholder="최소"
                    className="w-16 flex-1 rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    value={mobileMax}
                    onChange={(e) => {
                      setMobileMax(e.target.value);
                      setPage(1);
                    }}
                    placeholder="최대"
                    className="w-16 flex-1 rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex w-full items-center gap-2 md:w-auto">
                  <span className="text-gray-500">경쟁도</span>
                  <select
                    value={compFilter}
                    onChange={(e) => {
                      setCompFilter(e.target.value as typeof compFilter);
                      setPage(1);
                    }}
                    className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">전체</option>
                    <option value="낮음">낮음</option>
                    <option value="중간">중간</option>
                    <option value="높음">높음</option>
                  </select>
                  <button
                    onClick={() => {
                      setPcMin("");
                      setPcMax("");
                      setMobileMin("");
                      setMobileMax("");
                      setCompFilter("all");
                      setFilterText("");
                      setPage(1);
                    }}
                    className="rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    조건 초기화
                  </button>
                </div>
              </div>
            ) : null}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>페이지당</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
              >
                {[3, 5, 10].map((size) => (
                  <option key={size} value={size}>
                    {size}개
                  </option>
                ))}
              </select>
            </div>
            {filterText ? (
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">필터 적용됨</span>
            ) : null}
          </div>

          {activeResults.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
              키워드를 입력하고 조회를 진행하세요.
            </div>
          ) : (
            <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
              <div className="w-full overflow-x-auto touch-pan-x">
                <table className="w-full min-w-[720px] divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">키워드</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">PC 검색량</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">모바일 검색량</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">PC 클릭수</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">모바일 클릭수</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">PC CTR</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">모바일 CTR</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">평균 노출 순위</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-700">경쟁도</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {pagedResults.map((item) => (
                      <tr key={item.relKeyword}>
                        <td className="px-4 py-2 font-medium text-gray-900">{item.relKeyword}</td>
                        <td className="px-4 py-2 text-gray-700">
                          {item.monthlyPcQcCnt != null ? item.monthlyPcQcCnt.toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {item.monthlyMobileQcCnt != null ? item.monthlyMobileQcCnt.toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {item.monthlyAvePcClkCnt != null ? item.monthlyAvePcClkCnt.toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {item.monthlyAveMobileClkCnt != null ? item.monthlyAveMobileClkCnt.toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {item.monthlyAvePcCtr != null ? `${item.monthlyAvePcCtr}%` : "-"}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {item.monthlyAveMobileCtr != null ? `${item.monthlyAveMobileCtr}%` : "-"}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {item.plAvgDepth != null ? item.plAvgDepth : "-"}
                        </td>
                        <td className="px-4 py-2">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                            {item.compIdx || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
              <div>
                페이지 {currentPage} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  이전
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-md border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            </div>
          ) : null}

          {lastError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <div className="flex items-center justify-between gap-2">
                <span>{lastError}</span>
                <a
                  href="/membership?from=keyword"
                  className="rounded-md bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  업그레이드
                </a>
              </div>
            </div>
          ) : null}

          {history.length > 0 ? (
            <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-800">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">최근 조회</p>
                <button
                  className="text-xs text-gray-500 underline"
                  onClick={() => {
                    setHistory([]);
                    try {
                      localStorage.removeItem(HISTORY_KEY);
                    } catch { }
                  }}
                >
                  기록 삭제
                </button>
              </div>
              <div className="space-y-1">
                {history.map((item) => (
                  <button
                    key={`${item.mode}-${item.keywords.join("-")}-${item.timestamp}`}
                    onClick={() => loadHistoryEntry(item)}
                    className="flex w-full items-center justify-between rounded-md bg-white px-3 py-2 text-left hover:bg-gray-100"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-blue-600">
                        {item.mode === "KEYWORD" ? "키워드 조회" : "연관 키워드"}
                      </span>
                      <span className="text-sm text-gray-800 truncate">{item.keywords.join(", ")}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
