"use client";

import DplogHeader from "@/src/components/common/Headers/DplogHeader";
import TrackFilter from "./TrackFilter";
import TrackList from "./TrackList";
import TrackKeywordTable from "./TrackKeywordTable";
import GroupEditModal from "@/components/group/GroupEditModal";
import TrackNplaceSearch from "./TrackNplaceSearch";
import { useTrackContent } from "@/src/features/track/useTrackContent";
import { useSearchParams } from "next/navigation";
import { useViewModeStore } from "@/src/store/useViewModeStore";
import { useEffect } from "react";


export default function TrackContent() {

   const searchParams = useSearchParams();
   const viewParam = searchParams.get("view");
   const setViewMode = useViewModeStore((state) => state.setViewMode);

   useEffect(() => {
     if (
       viewParam === "grid" ||
       viewParam === "list" ||
       viewParam === "report"
     ) {
       setViewMode(viewParam);
     }
   }, [viewParam, setViewMode]);

  const {
    // States
    selectedGroup,
    setSelectedGroup,
    selectedShopList,
    isTrackableModalShow,
    setIsTrackableModalShow,
    isGroupChangeModalShow,
    groupList,
    filteredShopList,
    deleteShop,
    // Refs

    // Handlers
    handleShopSelect,
    handleAddTrackable,
    handleTrackableModalClose,
    handleGroupChangeModalShow,
    handleChangeGroupModalClose,
    onChangeGroupModalSubmit,
    getRankString,
    handleSelectAll,
    // 추가 상태
    isLoading,
    error,
  } = useTrackContent();

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <span className="ml-2 text-gray-500">데이터 로딩 중...</span>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 p-4">
        <p className="mb-2 text-lg font-medium text-red-600">데이터를 불러오는 중 오류가 발생했습니다</p>
        <p className="text-sm text-red-500">{error.message || '잠시 후 다시 시도해주세요'}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="">
        <DplogHeader title="N-PLACE" message="순위추적" />
        <div className="mb-6 overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-white to-blue-50 shadow-lg">
          <div className="mt-2 p-4 sm:p-6">
            <TrackFilter
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              groupList={groupList}
              handleGroupChangeModalShow={handleGroupChangeModalShow}
              setIsTrackableModalShow={setIsTrackableModalShow}
              isGroupChangeModalShow={isGroupChangeModalShow}
              handleChangeGroupModalClose={handleChangeGroupModalClose}
              onChangeGroupModalSubmit={onChangeGroupModalSubmit}
            />

            <hr className="my-4 border-gray-200" />

            <TrackList
              deleteShop={deleteShop}
              handleSelectAll={handleSelectAll}
              filteredShopList={filteredShopList}
              selectedShopList={selectedShopList}
              handleShopSelect={handleShopSelect}
              getRankString={getRankString}
            />
          </div>
        </div>

        {/* <TrackKeywordTable /> */}

        <TrackNplaceSearch
          isOpen={isTrackableModalShow}
          onClose={handleTrackableModalClose}
          onAdd={handleAddTrackable}
        />

       

        
      </div>
    </div>
  );
}
