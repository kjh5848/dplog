"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useNplaceRankTrackWithIdViewModel } from "@/src/viewModel/nplace/track/NplaceRankTrackWithIdViewModel";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AddKeywordProps {
  shopId: string  
  businessSector: string
}

export default function AddKeyword({ shopId, businessSector }: AddKeywordProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [province, setProvince] = useState("");
  
  const { addKeyword, isAddingKeyword } = useNplaceRankTrackWithIdViewModel({ id: shopId });

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword && province) {
      try {
        const result = await addKeyword({ keyword, province });
        if (result.code === "0") {
          toast.success("키워드가 성공적으로 추가되었습니다.");
          setKeyword("");
          setProvince("");
          setIsModalOpen(false);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("키워드 추가 중 오류가 발생했습니다.");
        }
      }
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 sm:h-7 sm:w-7 lg:h-8 lg:w-8"
      >
        <Plus size={16} className="lg:size-5" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">새 키워드 추가</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                  지역 선택
                </label>
                <select
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                >
                  <option value="">지역 선택</option>
                  <option value="서울시">서울시</option>
                  <option value="부산시">부산시</option>
                  <option value="대구시">대구시</option>
                  <option value="인천시">인천시</option>
                  <option value="광주시">광주시</option>
                  <option value="대전시">대전시</option>
                  <option value="울산시">울산시</option>
                  <option value="세종시">세종시</option>
                  <option value="경기도">경기도</option>
                  <option value="강원도">강원도</option>
                  <option value="충청북도">충청북도</option>
                  <option value="충청남도">충청남도</option>
                  <option value="전라북도">전라북도</option>
                  <option value="전라남도">전라남도</option>
                  <option value="경상북도">경상북도</option>
                  <option value="경상남도">경상남도</option>
                  <option value="제주도">제주도</option>
                </select>
              </div>
              <div>
                <label htmlFor="keyword" className="block text-sm font-medium text-gray-700">
                  키워드
                </label>
                <input
                  type="text"
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="키워드 입력"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 