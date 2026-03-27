
interface RankCheckModalProps {
  show: boolean;
  onClose: () => void;
  selectedPlace: any;
  rankCheckData: any[];
}

export default function RankCheckModal({
  show,
  onClose,
  selectedPlace,
  rankCheckData,
}: RankCheckModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-semibold leading-6 text-gray-900">
                  순위 비교
                </h3>
                <div className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            순위
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            상점명
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            방문자 리뷰
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            블로그 리뷰
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            저장수
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                            평점
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {rankCheckData.map((data, index) => (
                          <tr
                            key={index}
                            className={
                              data.shopId === selectedPlace.shopId ? "bg-blue-50" : ""
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap">{data.rank}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {data.shopName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {data.visitorReviewCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {data.blogReviewCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {data.saveCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {data.scoreInfo}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 