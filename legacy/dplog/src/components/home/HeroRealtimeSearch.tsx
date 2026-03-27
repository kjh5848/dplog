"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, ChevronDown, X, Zap, CheckCircle, Star } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

// 브라우저 사용 체크 키
const BROWSER_USAGE_KEY = "hero_realtime_search_used";

export default function HeroRealtimeSearch() {
  const [location, setLocation] = useState("서울시");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [shopName, setShopName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUsed, setHasUsed] = useState(0);
  const [searchResult, setSearchResult] = useState<any>(null);

  // 컴포넌트 마운트 시 사용 여부 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const used = localStorage.getItem(BROWSER_USAGE_KEY);
      const parsedUsed = used ? parseInt(used) : 0;
      setHasUsed(isNaN(parsedUsed) ? 0 : parsedUsed);
    }
  }, []);

  // 검색 실행
  const handleSearch = async () => {
    // 유효성 검사
    if (!shopName.trim()) {
      toast.error("가게명을 입력해주세요.");
      return;
    }

    if (!keyword.trim()) {
      toast.error("키워드를 입력해주세요.");
      return;
    }

    // 사용 횟수 체크
    if (hasUsed >= 5) {
      toast.error("브라우저당 5회만 체험 가능합니다. 회원가입 후 무제한 이용하세요!");
      return;
    }

    setIsLoading(true);

    try {
      // 실제 API 호출 대신 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 가상의 검색 결과
      const mockResult = {
        rank: Math.floor(Math.random() * 10) + 1,
        rating: (4.0 + Math.random() * 1).toFixed(1),
        reviewCount: Math.floor(Math.random() * 1000) + 100,
        shopName: shopName,
        keyword: keyword,
        location: location
      };

      setSearchResult(mockResult);
      
      // 사용 횟수 증가
      const newUsedCount = hasUsed + 1;
      localStorage.setItem(BROWSER_USAGE_KEY, newUsedCount.toString());
      setHasUsed(newUsedCount);
      
      toast.success("검색이 완료되었습니다!");
      
    } catch (error) {
      toast.error("검색 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const locations = [
    "서울시", "경기도", "인천시", "부산시", "대구시", "대전시", 
    "광주시", "울산시", "세종시", "강원도", "충청북도", "충청남도",
    "전라북도", "전라남도", "경상북도", "경상남도", "제주도"
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="my-8 text-center">
        <p className="mb-4 text-gray-600">💡 이런 키워드로 검색해보세요</p>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            "서울 강남 맛집",
            "부산 연산동 돈까스",
            "대구 동성로 카페",
            "대전 둔산동 치킨",
            "울산 삼산동 국밥",
            "광주 충장로 피자",
            "인천 송도 술집",
            "수원 영통 회집",
            "전주 한옥마을 짬뽕",
            "청주 상당구 떡볶이",
            "천안 신부동 순대국",
            "포항 북구 삼겹살",
            "창원 성산구 일식집",
            "제주 제주시 브런치카페",
            "춘천 교동 족발",
            "목포 하당 베이커리",
            "서울 홍대 카페",
            "부산 해운대 횟집",
            "대구 수성구 파스타",
            "대전 유성구 스시",
            "울산 남구 갈비",
            "광주 서구 분식",
            "인천 부평 중국집",
            "경기 성남 태국음식",
          ].map((example, index) => (
            <span
              key={index}
              className="cursor-pointer rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 transition-colors hover:bg-blue-200"
              onClick={() => {
                const parts = example.split(" ");
                if (parts.length >= 3) {
                  const locationPart = parts[0];
                  const keywordPart = parts.slice(1).join(" ");

                  // 지역 설정 확장
                  if (
                    locationPart.includes("부산") ||
                    locationPart.includes("해운대") ||
                    locationPart.includes("서면") ||
                    locationPart.includes("광안리")
                  ) {
                    setLocation("부산시");
                  } else if (locationPart.includes("대구")) {
                    setLocation("대구시");
                  } else if (locationPart.includes("대전")) {
                    setLocation("대전시");
                  } else if (locationPart.includes("울산")) {
                    setLocation("울산시");
                  } else if (locationPart.includes("광주")) {
                    setLocation("광주시");
                  } else if (locationPart.includes("인천")) {
                    setLocation("인천시");
                  } else if (
                    locationPart.includes("수원") ||
                    locationPart.includes("성남") ||
                    locationPart.includes("경기")
                  ) {
                    setLocation("경기도");
                  } else if (locationPart.includes("전주")) {
                    setLocation("전라북도");
                  } else if (
                    locationPart.includes("청주") ||
                    locationPart.includes("천안")
                  ) {
                    setLocation("충청남도");
                  } else if (locationPart.includes("포항")) {
                    setLocation("경상북도");
                  } else if (locationPart.includes("창원")) {
                    setLocation("경상남도");
                  } else if (locationPart.includes("제주")) {
                    setLocation("제주도");
                  } else if (locationPart.includes("춘천")) {
                    setLocation("강원도");
                  } else if (locationPart.includes("목포")) {
                    setLocation("전라남도");
                  } else {
                    setLocation("서울시");
                  }

                  // 키워드 설정
                  setKeyword(keywordPart);

                  // 가게명은 비워두기
                  setShopName("");
                }
              }}
            >
              {example}
            </span>
          ))}
        </div>
      </div>
      {/* 메인 검색 폼 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h3 className="mb-2 text-2xl font-bold text-gray-900">
            🎯 우리 가게 순위 확인하기
          </h3>
          <p className="text-gray-600">
            지역 + 키워드 + 가게명으로 검색해보세요
          </p>
          {hasUsed > 0 && (
            <div className="mt-3 inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-sm text-orange-800">
              <Zap size={16} className="mr-2" />
              체험 {hasUsed}/5회 사용{" "}
              {hasUsed >= 5 && "- 회원가입 후 무제한 이용"}
            </div>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* 지역 선택 */}
          <div className="relative">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              지역
            </label>
            <div
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border-2 border-gray-200 bg-white p-3 transition-all hover:border-blue-300"
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
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                {locations.map((loc) => (
                  <div
                    key={loc}
                    className="cursor-pointer p-3 transition-colors hover:bg-blue-50"
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

          {/* 키워드 입력 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              키워드
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="맛집, 카페, 미용실..."
                className="w-full rounded-lg border-2 border-gray-200 bg-white p-3 text-gray-700 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              {keyword && (
                <button
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setKeyword("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 가게명 입력 */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              가게명
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="우리 가게 이름"
                className="w-full rounded-lg border-2 border-gray-200 bg-white p-3 text-gray-700 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
              {shopName && (
                <button
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShopName("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* 검색 버튼 */}
          <div className="flex items-end">
            <button
              className={`flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#25e4ff] to-[#0284c7] px-6 py-3 font-semibold text-white transition-all hover:shadow-lg ${
                isLoading || hasUsed >= 5 ? "cursor-not-allowed opacity-70" : ""
              }`}
              onClick={handleSearch}
              disabled={isLoading || hasUsed >= 5}
            >
              {isLoading ? (
                <>
                  <svg
                    className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
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
              ) : hasUsed >= 5 ? (
                "모든 체험 완료"
              ) : (
                <>
                  <Search size={18} className="mr-2" />
                  순위 확인 ({Math.max(0, 5 - hasUsed)}회 남음)
                </>
              )}
            </button>
          </div>
        </div>

        {/* 안내 메시지 */}
        {/* <div className="text-center text-sm text-gray-500">
          💡 체험용으로 5회까지 무료 이용 가능합니다
        </div> */}
      </div>

      {/* 예시 결과 미리보기 - 검색창 바로 밑에 배치 */}
      {/* <div className="mt-8 rounded-2xl border border-green-100 bg-gradient-to-r from-green-50 to-emerald-50 p-8"> */}
        {/* <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
            <CheckCircle size={16} className="mr-2" />
            예시 결과
          </div>
          <h3 className="mb-2 text-2xl font-bold text-gray-900">
            현재 <span className="text-green-600">7위</span>에 노출 중입니다
          </h3>
          <p className="text-gray-600">부산시 연산동 돈까스 검색 기준</p>
        </div> */}

        {/* 가게 이미지와 정보 카드 */}
        {/* <div className="mb-6 rounded-xl bg-white p-6 shadow-sm"> */}
          {/* <div className="flex flex-col items-center gap-6 md:flex-row"> */}
            {/* 가게 이미지 */}
            {/* <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-orange-100 to-yellow-100 md:w-48">
              <div className="text-center">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500">
                  <span className="text-xl font-bold text-white">맛</span>
                </div>
                <p className="font-medium text-orange-800">신선횟집</p>
                <p className="text-sm text-orange-600">부산 연제구</p>
              </div>
            </div> */}

            {/* 가게 정보 */}
            {/* <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-xl font-bold text-gray-900">신선횟집</h4>
                <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-medium text-white">
                  7위
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>부산 연제구 연산동 123-45</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Star
                    size={16}
                    className="mr-2 text-yellow-500"
                    fill="currentColor"
                  />
                  <span className="font-medium text-gray-900">4.7</span>
                  <span className="ml-2">(116개 리뷰)</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-800">
                    돈까스 맛집
                  </span>
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                    연산동 인기
                  </span>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                    가성비 좋음
                  </span>
                </div>
              </div>
            </div> */}
          {/* </div>
        </div> */}

        {/* <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <div className="mb-2 text-3xl font-bold text-blue-600">4.7</div>
            <div className="text-gray-600">평점</div>
          </div>
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <div className="mb-2 text-3xl font-bold text-purple-600">116</div>
            <div className="text-gray-600">리뷰 수</div>
          </div>
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <div className="mb-2 text-3xl font-bold text-orange-600">7위</div>
            <div className="text-gray-600">현재 순위</div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-block rounded-lg bg-white p-4 shadow-sm">
            <p className="mb-3 text-gray-700">
              🚀 더 정확한 순위 추적과 경쟁업체 분석을 원하시나요?
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                className="rounded-lg bg-gradient-to-r from-[#25e4ff] to-[#0284c7] px-6 py-2 font-semibold text-white transition-all hover:shadow-lg"
                onClick={() => {
                  setLocation("부산시");
                  setKeyword("연산동 돈까스");
                  setShopName("신선횟집");
                }}
              >
                이 예시로 검색해보기
              </button>
              <Link
                href="#pricing"
                className="rounded-lg border-2 border-blue-500 px-6 py-2 font-semibold text-blue-600 transition-all hover:bg-blue-50"
              >
                요금제 보기
              </Link>
            </div>
          </div>
        </div>
      </div> */}

      {/* 검색 결과 */}
      {searchResult && (
        <div className="animate-fadeIn mt-8 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-8">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
              <CheckCircle size={16} className="mr-2" />
              검색 완료
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              "{searchResult.shopName}"이(가) 현재{" "}
              <span className="text-green-600">{searchResult.rank}위</span>에
              노출 중입니다
            </h3>
            <p className="text-gray-600">
              {searchResult.location} {searchResult.keyword} 검색 기준
            </p>
          </div>

          {/* 가게 이미지와 정보 카드 */}
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              {/* 가게 이미지 */}
              <div className="flex h-36 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 md:w-48">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
                    <span className="text-xl font-bold text-white">
                      {searchResult.shopName.charAt(0)}
                    </span>
                  </div>
                  <p className="font-medium text-blue-800">
                    {searchResult.shopName}
                  </p>
                  <p className="text-sm text-blue-600">
                    {searchResult.location}
                  </p>
                </div>
              </div>

              {/* 가게 정보 */}
              <div className="flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-xl font-bold text-gray-900">
                    {searchResult.shopName}
                  </h4>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium text-white ${
                      searchResult.rank <= 3
                        ? "bg-green-500"
                        : searchResult.rank <= 7
                          ? "bg-orange-500"
                          : "bg-red-500"
                    }`}
                  >
                    {searchResult.rank}위
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <MapPin size={16} className="mr-2" />
                    <span>{searchResult.location} 지역</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Star
                      size={16}
                      className="mr-2 text-yellow-500"
                      fill="currentColor"
                    />
                    <span className="font-medium text-gray-900">
                      {searchResult.rating}
                    </span>
                    <span className="ml-2">
                      ({searchResult.reviewCount.toLocaleString()}개 리뷰)
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                      {searchResult.keyword}
                    </span>
                    <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-800">
                      검색 완료
                    </span>
                    <span className="rounded bg-purple-100 px-2 py-1 text-xs text-purple-800">
                      실시간 조회
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="mb-2 text-3xl font-bold text-blue-600">
                {searchResult.rating}
              </div>
              <div className="text-gray-600">평점</div>
            </div>
            <div className="rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="mb-2 text-3xl font-bold text-purple-600">
                {searchResult.reviewCount.toLocaleString()}
              </div>
              <div className="text-gray-600">리뷰 수</div>
            </div>
            <div className="rounded-lg bg-white p-6 text-center shadow-sm">
              <div className="mb-2 text-3xl font-bold text-orange-600">
                {searchResult.rank}위
              </div>
              <div className="text-gray-600">현재 순위</div>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-block rounded-lg bg-white p-4 shadow-sm">
              <p className="mb-3 text-gray-700">
                🚀 더 정확한 순위 추적과 경쟁업체 분석을 원하시나요?
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/join"
                  className="rounded-lg bg-gradient-to-r from-[#25e4ff] to-[#0284c7] px-6 py-2 font-semibold text-white transition-all hover:shadow-lg"
                >
                  회원가입하고 무제한 이용
                </Link>
                <Link
                  href="#pricing"
                  className="rounded-lg border-2 border-blue-500 px-6 py-2 font-semibold text-blue-600 transition-all hover:bg-blue-50"
                >
                  요금제 보기
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 예시 키워드 */}
    </div>
  );
} 