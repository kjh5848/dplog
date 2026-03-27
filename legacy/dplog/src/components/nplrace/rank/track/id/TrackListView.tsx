import { TrackData } from "@/src/model/TrackRepository";
import { useState } from "react";

interface TrackListViewProps {
  trackList: TrackData[];
  getRankString: (rank: number) => string;
  setSelectedTrack: (track: TrackData) => void;
  setShowRankCheckModal: (show: boolean) => void;
}

export default function TrackListView({
  trackList,
  getRankString,
  setSelectedTrack,
  setShowRankCheckModal,
}: TrackListViewProps) {
  return (
    <div className="overflow-hidden rounded-xl">
      <div className="rounded-lg bg-white">
        <div className="border-b bg-gradient-to-r from-white to-blue-50 px-3 py-3 sm:px-6">
          <div className="grid grid-cols-12 gap-2 sm:gap-4">
            <div className="col-span-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              순위
            </div>
            <div className="col-span-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              방문자 리뷰
            </div>
            <div className="col-span-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              블로그 리뷰
            </div>
            <div className="col-span-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              저장수
            </div>
            <div className="col-span-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
              평점
            </div>
            <div className="col-span-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
              일자
            </div>
            <div className="col-span-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
              순위비교
            </div>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {trackList.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-lg bg-gray-50">
              <p className="text-gray-500">추적 중...</p>
            </div>
          ) : (
            <div>
              {trackList.map((data: TrackData, index: number) => (
                <div
                  key={index}
                  className="cursor-pointer px-3 py-4 transition-all duration-200 hover:bg-blue-50 sm:px-6"
                >
                  <div className="grid grid-cols-12 items-center gap-2 sm:gap-4">
                    <div className="col-span-2 text-sm font-bold text-blue-900">
                      {getRankString(data.rank)}
                    </div>
                    <div className="col-span-2 text-sm text-gray-700">
                      {data.visitorReviewCount}
                    </div>
                    <div className="col-span-2 text-sm text-gray-700">
                      {data.blogReviewCount}
                    </div>
                    <div className="col-span-2 text-sm text-gray-700">
                      {data.saveCount}
                    </div>
                    <div className="col-span-1 text-sm text-gray-700">
                      {data.scoreInfo}
                    </div>
                    <div className="col-span-2 text-sm text-gray-700">
                      {new Date(data.chartDate).toLocaleDateString()}
                    </div>
                    <div className="col-span-1">
                      <button
                        className="rounded-md bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 text-sm font-medium text-blue-800 shadow-xs hover:from-blue-100 hover:to-indigo-100"
                        onClick={() => {
                          setSelectedTrack(data);
                          setShowRankCheckModal(true);
                        }}
                      >
                        비교
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
