import { CheckSquare, Square, PlusCircle } from "lucide-react";
import AddKeyword from "./TrackAddKeyword";
import { useState } from "react";
import { ApiResponse } from "@/src/types/api";

interface KeywordListProps {
  keywords: { [key: string]: any };
  selectedKeywords: Set<string>;
  onSelectKeyword: (key: string) => void;
  onSelectAll: () => void;
  getRankString: (rank: number | null) => string;
  shopId: string | undefined;
  businessSector: string | undefined;
  onDeleteTrack: (trackId: string) => void;
  onUpdateTrackStatus: (params: { trackId: string, status: "RUNNING" | "STOP" }) => Promise<ApiResponse<void>>;
}

export default function TrackKeywordList({
  keywords,
  selectedKeywords,
  onSelectKeyword,
  onSelectAll,
  getRankString,
  shopId,
  businessSector,
  onDeleteTrack,
  onUpdateTrackStatus,
}: KeywordListProps) {
 
  const isAllSelected =
    Object.keys(keywords).length > 0 &&
    Object.keys(keywords).every((key) => selectedKeywords.has(key));
    
  // 키워드가 비어있는지 확인
  const isKeywordsEmpty = Object.keys(keywords).length === 0;

  // 모달 상태
  const [modalState, setModalState] = useState<{
    openModalId: string | null;
    confirmInput: string;
    modalKeyword: string;
    modalType: "delete" | "stop" | "resume" | null;
    actionMessage: string | null;
  }>({
    openModalId: null,
    confirmInput: "",
    modalKeyword: "",
    modalType: null,
    actionMessage: null
  });

  // 삭제 버튼 클릭 시
  const handleDeleteClick = (trackId: string, keyword: string) => {
    setModalState(prev => ({
      ...prev,
      openModalId: trackId,
      modalKeyword: keyword,
      modalType: "delete",
      confirmInput: ""
    }));
  };

  // 추적중단 버튼 클릭 시
  const handleStopClick = (trackId: string, keyword: string) => {
    setModalState(prev => ({
      ...prev,
      openModalId: trackId,
      modalKeyword: keyword,
      modalType: "stop",
      confirmInput: ""
    }));
  };

  // 재추적 버튼 클릭 시
  const handleResumeClick = (trackId: string, keyword: string) => {
    setModalState(prev => ({
      ...prev,
      openModalId: trackId,
      modalKeyword: keyword,
      modalType: "resume",
      confirmInput: ""
    }));
  };

  // 팝업 내 확인 버튼
  const handleConfirmModal = async (trackId: string, keyword: string) => {
    if (modalState.confirmInput !== keyword) return;
    try {
      if (modalState.modalType === "delete") {
        await onDeleteTrack(trackId);
        setModalState(prev => ({ ...prev, actionMessage: "삭제가 완료되었습니다." }));
      } else if (modalState.modalType === "stop") {
        await onUpdateTrackStatus({ trackId, status: "STOP" });
        setModalState(prev => ({ ...prev, actionMessage: "추적이 중단되었습니다." }));
      } else if (modalState.modalType === "resume") {
        await onUpdateTrackStatus({ trackId, status: "RUNNING" });
        setModalState(prev => ({ ...prev, actionMessage: "재추적이 시작되었습니다." }));
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        setModalState(prev => ({ ...prev, actionMessage: e.message || "알 수 없는 오류가 발생했습니다." }));
      } else {
        setModalState(prev => ({ ...prev, actionMessage: "알 수 없는 오류가 발생했습니다." }));
      }
    } finally {
      setTimeout(() => setModalState(prev => ({ ...prev, actionMessage: null })), 2500);
      setModalState(prev => ({ ...prev, openModalId: null }));
    }
  };

  // 팝업 닫기
  const handleCloseModal = () => {
    setModalState(prev => ({
      ...prev,
      openModalId: null,
      confirmInput: "",
      modalType: null
    }));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-lg">
      <div className="border-b border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 lg:flex-col lg:items-start lg:space-y-3">
          <div className="flex items-center space-x-2">
            <h3 className="word-break-keep text-base font-semibold text-gray-900 sm:text-lg lg:text-xl">
              키워드 목록
            </h3>
            {shopId && businessSector && (
              <div className="relative">
                <AddKeyword shopId={shopId} businessSector={businessSector} />
                {isKeywordsEmpty && (
                  <PlusCircle
                    size={16}
                    className="absolute -right-2 -top-2 animate-pulse-fast text-green-500"
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 lg:self-end">
            <button
              onClick={onSelectAll}
              className="text-gray-500 hover:text-gray-700"
            >
              {isAllSelected ? (
                <CheckSquare size={20} className="lg:size-6" />
              ) : (
                <Square size={20} className="lg:size-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="h-[calc(50vh-4rem)] overflow-y-auto">
        {isKeywordsEmpty ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <p className="text-xs mt-2 animate-pulse">키워드를 등록하세요</p>
          </div>
        ) : (
          Object.keys(keywords).map((key) => {
            const trackInfo = keywords[key];
            return (
              <div key={key} className="relative">
                <div
                  onClick={() => onSelectKeyword(key)}
                  className={`w-full border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 ${
                    selectedKeywords.has(key)
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{key}</div>
                    <div className="flex items-center gap-1">
                      {selectedKeywords.has(key) && (
                        <CheckSquare size={16} className="text-blue-600" />
                      )}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {trackInfo?.province} •{" "}
                    {getRankString(trackInfo?.rank || null)}
                  </div>
                  <div className="ml-2 flex flex-wrap justify-end gap-1">
                    <button
                      className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(trackInfo.id, key);
                      }}
                    >
                      <div className="">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </div>
                    </button>
                    {/* <button
                      className="rounded bg-blue-50 px-2 py-1 text-xs text-gray-600 hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResumeClick(trackInfo.id, key);
                      }}
                    >
                      재추적
                    </button>
                    <button
                      className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStopClick(trackInfo.id, key);
                      }}
                    >
                      중단
                    </button> */}
                  </div>
                </div>
                {/* 커스텀 팝업 */}
                {modalState.openModalId === trackInfo.id && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="w-[350px] rounded-lg border bg-white p-6 shadow-xl">
                      <div className="mb-3 text-lg font-semibold text-gray-800">
                        dplog.com 내용:
                      </div>
                      <div className="mb-2 text-sm text-gray-700">
                        {modalState.modalType === "delete" && (
                          <>
                            추적을 삭제 하시려면 키워드(
                            <span className="font-bold">
                              {modalState.modalKeyword}
                            </span>
                            )를 입력해주세요.
                            <br />
                            <span className="text-xs text-gray-500">
                              삭제 후 다시 추적할 경우 과거 차트 데이터는
                              복구되지 않습니다.
                            </span>
                          </>
                        )}
                        {modalState.modalType === "stop" && (
                          <>
                            추적을 <span className="font-bold">중단</span>{" "}
                            하시려면 키워드(
                            <span className="font-bold">
                              {modalState.modalKeyword}
                            </span>
                            )를 입력해주세요.
                            <br />
                            <span className="text-xs text-gray-500">
                              중단 후 추적이 불가능합니다.
                            </span>
                          </>
                        )}
                        {modalState.modalType === "resume" && (
                          <>
                            추적을 <span className="font-bold">재추적</span>{" "}
                            하시려면 키워드(
                            <span className="font-bold">
                              {modalState.modalKeyword}
                            </span>
                            )를 입력해주세요.
                            <br />
                            <span className="text-xs text-gray-500">
                              재추적 시 순위 추적이 다시 시작됩니다.
                            </span>
                          </>
                        )}
                      </div>
                      <input
                        className="mt-2 mb-4 w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        value={modalState.confirmInput}
                        onChange={(e) =>
                          setModalState((prev) => ({
                            ...prev,
                            confirmInput: e.target.value,
                          }))
                        }
                        placeholder={modalState.modalKeyword}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-800 hover:bg-yellow-200"
                          onClick={handleCloseModal}
                        >
                          취소
                        </button>
                        <button
                          className={`rounded bg-yellow-700 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-800 ${modalState.confirmInput !== modalState.modalKeyword ? "cursor-not-allowed opacity-50" : ""}`}
                          disabled={
                            modalState.confirmInput !== modalState.modalKeyword
                          }
                          onClick={() =>
                            handleConfirmModal(
                              trackInfo.id,
                              modalState.modalKeyword,
                            )
                          }
                        >
                          확인
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {/* 토스트 메시지 */}
      {modalState.actionMessage && (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded bg-black/80 px-6 py-3 text-sm text-white shadow-lg animate-fade-in">
          {modalState.actionMessage}
        </div>
      )}
    </div>
  );
}
