"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useNplaceRankTrackWithIdViewModel } from "@/src/viewModel/nplace/track/NplaceRankTrackWithIdViewModel";
import { useAuthGuard } from "@/src/utils/auth";
import { loadingUtils } from "@/src/utils/loading";

import TrackKeywordList from "@/src/components/nplrace/rank/track/id/TrackKeywordList";
import TrackShopHeader from "@/src/components/nplrace/rank/track/id/TrackShopHeader";
import TrackKeywordContent from "@/src/components/nplrace/rank/track/id/TrackKeywordCentent";
import GlobalLoadingOverlay from "@/src/components/common/loading/GlobalLoadingOverlay";

interface TrackDetailClientPageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function TrackDetailClientPage({
  params,
  searchParams,
}: TrackDetailClientPageProps) {
  const { id } = params;
  const router = useRouter();

  // 🔥 모든 Hook을 컴포넌트 최상단에 배치하여 Hook 규칙 준수
  const { isLoading, isGuest, isLogoutPending } = useAuthGuard();
  const authConfig = useMemo(() => loadingUtils.userAuth(), []);
  const guestConfig = useMemo(() => loadingUtils.loginRedirect(), []);
  const logoutConfig = useMemo(() => loadingUtils.logoutAuth(), []);
  const dataLoadingConfig = useMemo(() => loadingUtils.dataLoading(), []);

  // 키워드별 뷰 모드는 이제 store에서 관리되므로 로컬 상태 제거
  const [selectedTrackInfos, setSelectedTrackInfos] = useState<Set<string>>(
    new Set(),
  );
  const [openAccordions, setOpenAccordions] = useState<string[]>([]);

  const {
    shopId,
    businessSector,
    shop,
    isLoading: isShopLoading,
    error,
    isUpdatingKeywords,
    getNplaceRankTrackList,
    getRankString,
    deleteTrack,
    updateTrackStatus,
    updateKeywords,
  } = useNplaceRankTrackWithIdViewModel({ id });

  // 👉 키워드 자동 선택 - 안전성 확보를 위한 조건부 로직 추가
  useEffect(() => {
    // 인증 상태가 안정적이고 상점 데이터가 있을 때만 실행
    if (!isLoading && !isGuest && shop?.nplaceRankTrackInfoMap) {
      const keys = Object.keys(shop.nplaceRankTrackInfoMap);
      if (keys.length) setSelectedTrackInfos(new Set(keys));
    }
  }, [shop, isLoading, isGuest]);

  // 🔥 인증 상태 확인 및 조건부 렌더링
  if (isLoading) {
    const config = isLogoutPending ? logoutConfig : authConfig;
    const subMessage = isLogoutPending
      ? "로그아웃을 처리하고 있습니다."
      : "사용자 인증을 확인하고 있습니다.";
    return (
      <>
        <GlobalLoadingOverlay visible config={{ ...config, subMessage }} />
      </>
    );
  }

  if (isGuest) {
    return (
      <>
        <GlobalLoadingOverlay
          visible
          config={{
            ...guestConfig,
            subMessage: "로그인 페이지로 이동합니다.",
          }}
        />
      </>
    );
  }

  const handleTrackInfoSelect = (key: string) => {
    setSelectedTrackInfos((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!shop?.nplaceRankTrackInfoMap) return;
    const keys = Object.keys(shop.nplaceRankTrackInfoMap);
    setSelectedTrackInfos((prev) =>
      prev.size === keys.length ? new Set() : new Set(keys),
    );
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  if (isShopLoading) {
    return (
      <>
        <GlobalLoadingOverlay
          visible
          config={{
            ...dataLoadingConfig,
            subMessage: "상점 정보를 불러오는 중입니다.",
          }}
        />
      </>
    );
  }
  if (error) return <div className="text-red-500">{error.toString()}</div>;
  if (!shop) return <div>상점 정보가 없습니다.</div>;

  return (
    <div className="mx-auto min-h-screen sm:px-6 lg:px-8">
      {isUpdatingKeywords && (
        <GlobalLoadingOverlay
          visible
          config={{
            ...dataLoadingConfig,
            subMessage: "키워드 정보를 업데이트하고 있습니다.",
          }}
        />
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="lg:hidden">
          <TrackShopHeader
            shop={shop}
            isUpdatingKeywords={isUpdatingKeywords}
            updateKeywords={updateKeywords}
          />
        </div>

        {/** 모바일 키워드 목록 */}
        <div className="lg:hidden">
          <TrackKeywordList
            keywords={shop.nplaceRankTrackInfoMap || {}}
            selectedKeywords={selectedTrackInfos}
            onSelectKeyword={handleTrackInfoSelect}
            onSelectAll={handleSelectAll}
            getRankString={getRankString}
            shopId={shopId}
            businessSector={businessSector}
            onDeleteTrack={deleteTrack}
            onUpdateTrackStatus={updateTrackStatus}
          />
        </div>

        {/** 데스크탑 키워드 목록 */}
        <div className="hidden lg:col-span-1 lg:block">
          <TrackKeywordList
            keywords={shop.nplaceRankTrackInfoMap || {}}
            selectedKeywords={selectedTrackInfos}
            onSelectKeyword={handleTrackInfoSelect}
            onSelectAll={handleSelectAll}
            getRankString={getRankString}
            shopId={shopId}
            businessSector={businessSector}
            onDeleteTrack={deleteTrack}
            onUpdateTrackStatus={updateTrackStatus}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="hidden lg:block">
            <TrackShopHeader
              shop={shop}
              isUpdatingKeywords={isUpdatingKeywords}
              updateKeywords={updateKeywords}
            />
          </div>
          <div className="mt-5 space-y-6">
            {selectedTrackInfos.size > 0 ? (
              <TrackKeywordContent
                shop={shop}
                selectedTrackInfos={selectedTrackInfos}
                openAccordions={openAccordions}
                toggleAccordion={toggleAccordion}
                getNplaceRankTrackList={getNplaceRankTrackList}
                getRankString={getRankString}
              />
            ) : (
              <div className="mt-5 flex h-64 items-center justify-center rounded-xl border border-gray-300 bg-white p-6 shadow-lg">
                <p className="text-gray-500">선택된 키워드가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
