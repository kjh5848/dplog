export default function TrackKeywordTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-white to-blue-50 shadow-lg">
      <div className="overflow-x-auto p-4 sm:p-6">
        <table className="min-w-full divide-y divide-gray-200 text-center text-xs sm:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th
                rowSpan={2}
                className="px-2 py-2 font-semibold uppercase tracking-wider text-gray-500 sm:px-3 sm:py-3"
              >
                키워드
              </th>
              <th
                colSpan={2}
                className="px-2 py-2 font-semibold uppercase tracking-wider text-gray-500 sm:px-3 sm:py-3"
              >
                월간검색수
              </th>
              <th
                rowSpan={2}
                className="px-2 py-2 font-semibold uppercase tracking-wider text-gray-500 sm:px-3 sm:py-3"
              >
                검색수합계
              </th>
              <th
                colSpan={2}
                className="px-2 py-2 font-semibold uppercase tracking-wider text-gray-500 sm:px-3 sm:py-3"
              >
                월간 블로그 발행
              </th>
              <th
                colSpan={2}
                className="px-2 py-2 font-semibold uppercase tracking-wider text-gray-500 sm:px-3 sm:py-3"
              >
                월평균클릭수
              </th>
              <th
                colSpan={2}
                className="px-2 py-2 font-semibold uppercase tracking-wider text-gray-500 sm:px-3 sm:py-3"
              >
                월평균클릭율
              </th>
              <th
                rowSpan={2}
                className="px-2 py-2 font-semibold uppercase tracking-wider text-gray-500 sm:px-3 sm:py-3"
              >
                경쟁정도
              </th>
              <th
                rowSpan={2}
                className="px-2 py-2 font-semibold uppercase tracking-wider text-gray-500 sm:px-3 sm:py-3"
              >
                월평균노출광고수
              </th>
            </tr>
            <tr>
              <th className="px-2 py-1 font-semibold uppercase text-gray-500 sm:px-3 sm:py-2">
                PC
              </th>
              <th className="px-2 py-1 font-semibold uppercase text-gray-500 sm:px-3 sm:py-2">
                Mobile
              </th>
              <th className="px-2 py-1 font-semibold uppercase text-gray-500 sm:px-3 sm:py-2">
                수량
              </th>
              <th className="px-2 py-1 font-semibold uppercase text-gray-500 sm:px-3 sm:py-2">
                포화도
              </th>
              <th className="px-2 py-1 font-semibold uppercase text-gray-500 sm:px-3 sm:py-2">
                PC
              </th>
              <th className="px-2 py-1 font-semibold uppercase text-gray-500 sm:px-3 sm:py-2">
                Mobile
              </th>
              <th className="px-2 py-1 font-semibold uppercase text-gray-500 sm:px-3 sm:py-2">
                PC
              </th>
              <th className="px-2 py-1 font-semibold uppercase text-gray-500 sm:px-3 sm:py-2">
                Mobile
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            <tr className="hover:bg-blue-50">
              <td className="px-2 py-2 text-gray-700 sm:px-3 sm:py-3">국밥</td>
              <td className="px-2 py-2 text-gray-700 sm:px-3 sm:py-3">1200</td>
              <td className="px-2 py-2 text-gray-700 sm:px-3 sm:py-3">2400</td>
              <td className="px-2 py-2 text-gray-700 sm:px-3 sm:py-3">3600</td>
              <td className="px-2 py-2 text-gray-700 sm:px-3 sm:py-3">30</td>
              <td className="px-2 py-2 text-gray-700 sm:px-3 sm:py-3">중</td>
              <td className="px-2 py-2 text-gray-700 sm:px-3 sm:py-3">200</td>
              <td className="px-2 py-2 text-gray-700 sm:px-3 sm:py-3">180</td>
              <td className="px-2 py-2 text-gray-700 sm:px-3 sm:py-3">17%</td>
              <td className="px-2 py-2 text-gray-700 sm:px-3 sm:py-3">14%</td>
              <td className="px-2 py-2 text-gray-700 sm:px-3 sm:py-3">중</td>
              <td className="px-2 py-2 text-gray-700 sm:px-3 sm:py-3">12</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
