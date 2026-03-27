"use client"
import RealtimeForm from "@/src/components/nplrace/rank/realtime/RealtimeForm";
import { useAuthStore } from "@/src/store/provider/StoreProvider";

export default function RealtimeContent() {
  const { loginUser } = useAuthStore();

  if (!loginUser) return null;

  return (
    <div>
      
      {/* 검색 폼 통합 */}
      

      {/* 대시보드 내용 */}
      {/* <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            최근 활동
          </h2>
          <div className="space-y-3">
            <div className="flex items-center rounded-lg bg-gray-50 p-3">
              <div className="mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
              <p className="text-sm text-gray-600">최근 검색: 홍길동 업체</p>
            </div>
            <div className="flex items-center rounded-lg bg-gray-50 p-3">
              <div className="mr-3 h-2 w-2 rounded-full bg-blue-500"></div>
              <p className="text-sm text-gray-600">최근 검색: SHOP_ID 12345</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">통계</h2>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">24</p>
              <p className="text-sm text-gray-500">오늘 검색</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">156</p>
              <p className="text-sm text-gray-500">이번 주 검색</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">1.2k</p>
              <p className="text-sm text-gray-500">총 검색</p>
            </div>
          </div>
        </div>
      </div> */}
     
    </div>
  );
}
