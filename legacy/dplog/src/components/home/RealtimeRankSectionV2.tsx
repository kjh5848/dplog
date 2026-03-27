"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Star, 
  Zap, 
  ArrowRight, 
  ChevronRight,
  MapPin,
  Users,
  Trophy,
  BarChart3,
  Award
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";

/**
 * [역할] 실시간 순위 조회 기능을 홍보하는 상점 정보 슬라이드 섹션
 * [입력] -
 * [출력] JSX 엘리먼트 (섹션 컴포넌트)
 * [NOTE] 상점 정보 자동 슬라이드, 모바일 최적화된 반응형 디자인, 스크롤 애니메이션 적용
 */

interface KeywordExample {
  keyword: string;
  category: string;
  color: string;
  icon: string;
}

interface ShopDemoData {
  rank: number;
  totalCount: number;
  shopName: string;
  category: string;
  address: string;
  visitorReviewCount: number;
  blogReviewCount: number;
  rating: number;
  shopImageUrl: string;
  keyword: string;
  shopId: string;
}

const KEYWORD_EXAMPLES: KeywordExample[] = [
  { keyword: "강남 맛집", category: "음식점", color: "bg-red-100 text-red-800", icon: "🍽️" },
  { keyword: "홍대 카페", category: "카페", color: "bg-amber-100 text-amber-800", icon: "☕" },
  { keyword: "명동 치킨", category: "치킨", color: "bg-orange-100 text-orange-800", icon: "🍗" },
  { keyword: "부산 횟집", category: "횟집", color: "bg-blue-100 text-blue-800", icon: "🐟" },
  { keyword: "대구 돈까스", category: "돈까스", color: "bg-indigo-100 text-indigo-800", icon: "🍖" },
  { keyword: "제주 흑돼지", category: "고기", color: "bg-purple-100 text-purple-800", icon: "🥩" },
  { keyword: "강릉 순두부", category: "한식", color: "bg-green-100 text-green-800", icon: "🍲" },
  { keyword: "전주 비빔밥", category: "한식", color: "bg-emerald-100 text-emerald-800", icon: "🍚" }
];

const SHOP_DEMO_DATA: ShopDemoData[] = [
  {
    rank: 3,
    totalCount: 127,
    shopName: "신선횟집",
    category: "일식집",
    address: "부산 연제구 연산동 123-45",
    visitorReviewCount: 247,
    blogReviewCount: 89,
    rating: 4.8,
    shopImageUrl: "/img/home/realtime/fish.png",
    keyword: "부산 연산동 돈까스",
    shopId: "1234567890"
  },
  {
    rank: 7,
    totalCount: 89,
    shopName: "커피베이",
    category: "카페",
    address: "서울 강남구 테헤란로",
    visitorReviewCount: 156,
    blogReviewCount: 34,
    rating: 4.6,
    shopImageUrl: "/img/home/realtime/cafe.png",
    keyword: "강남 카페",
    shopId: "2345678901"
  },
  {
    rank: 2,
    totalCount: 203,
    shopName: "맛있는집",
    category: "한식집",
    address: "대구 중구 동성로",
    visitorReviewCount: 389,
    blogReviewCount: 112,
    rating: 4.9,
    shopImageUrl: "/img/home/realtime/meat.png",
    keyword: "대구 동성로 맛집",
    shopId: "3456789012"
  },
  {
    rank: 1,
    totalCount: 156,
    shopName: "파스타하우스",
    category: "양식집",
    address: "서울 마포구 홍대로",
    visitorReviewCount: 512,
    blogReviewCount: 156,
    rating: 4.9,
    shopImageUrl: "/img/home/realtime/pasta.png",
    keyword: "홍대 파스타",
    shopId: "4567890123"
  },
  {
    rank: 5,
    totalCount: 98,
    shopName: "든든한 돈까스",
    category: "돈까스집",
    address: "인천 남동구 구월로",
    visitorReviewCount: 298,
    blogReviewCount: 67,
    rating: 4.7,
    shopImageUrl: "/img/home/realtime/pork-cutlet.png",
    keyword: "인천 구월 돈까스",
    shopId: "5678901234"
  }
];

// 상점 카드 컴포넌트
const ShopDemoCard = ({ shop }: { shop: ShopDemoData }) => {
  const handleShopClick = (shopId: string) => {
    toast.error(`데모 버전입니다. 실제 서비스에서는 SHOP_ID ${shopId} 가게 페이지로 이동합니다.`);
  };

  const handleCopyShopId = (shopId: string) => {
    navigator.clipboard.writeText(shopId);
    toast.success(`SHOP_ID ${shopId}가 복사되었습니다.`);
  };

  return (
    <div className="group:hover w-[300px] mx-4 flex-shrink-0 md:w-[380px]">
      <div className="enhanced-hover h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        {/* 성공 헤더 */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 text-center text-white">
          <div className="flex items-center justify-center">
            <Award size={16} className="mr-2" />
            <span className="text-sm font-bold md:text-base">
              순위 분석 결과
            </span>
          </div>
        </div>

        {/* 결과 내용 */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* 이미지 섹션 */}
            <div className="flex-shrink-0">
              <div className="h-20 w-20 overflow-hidden rounded-lg shadow-md">
                <Image
                  src={shop.shopImageUrl}
                  alt={shop.shopName}
                  width={100}
                  height={100}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="40">${shop.category.slice(0, 1)}</text></svg>`;
                  }}
                />
              </div>
            </div>

            {/* 정보 섹션 */}
            <div className="min-w-0 flex-1">
              {/* 순위 배지 */}
              <div className="mb-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-800">
                <Trophy size={12} className="mr-1" />
                {shop.rank}위 / {shop.totalCount}개
              </div>

              {/* 업체명 */}
              <h3 className="truncate text-base font-bold text-gray-900 md:text-lg">
                {shop.shopName}
              </h3>

              {/* 주소 */}
              <div className="my-1 flex items-center text-gray-500">
                <MapPin size={12} className="mr-1 flex-shrink-0" />
                <span className="truncate text-xs">{shop.address}</span>
              </div>

              {/* 평점과 리뷰 */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <Star
                    size={12}
                    className="mr-1 text-yellow-500"
                    fill="currentColor"
                  />
                  <span className="text-xs font-medium text-gray-800">
                    {shop.rating}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  방문자 {shop.visitorReviewCount}
                </div>
                <div className="text-xs text-gray-500">
                  블로그 {shop.blogReviewCount}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
              {shop.category}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleCopyShopId(shop.shopId)}
                className="rounded-md bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300"
              >
                ID 복사
              </button>
              <button
                onClick={() => handleShopClick(shop.shopId)}
                className="rounded-md bg-blue-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-600"
              >
                바로가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function RealtimeRankSectionV2() {
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordExample | null>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.scroll-animate');
    animateElements.forEach((el) => observer.observe(el));

    return () => {
      animateElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleKeywordClick = (keyword: KeywordExample) => {
    setSelectedKeyword(keyword);
    const heroSection = document.getElementById('hero-realtime-search');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoginRequired = () => {
   toast.error("준비중입니다.");
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12 md:mb-16 scroll-animate">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6 animate-slide-in-bottom stagger-1">
            <Zap size={14} className="mr-1 md:mr-2" />
            실시간 순위 확인
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 px-2 animate-slide-in-bottom stagger-2">
            우리 가게는 몇 위에 있을까요?
          </h2>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto px-4 animate-fade-in-scale stagger-3">
            키워드 검색 시 실제 순위를 실시간으로 확인해보세요. 
            정확한 데이터로 마케팅 전략을 세워보세요.
          </p>
        </div>

        {/* 키워드 예시 섹션 */}
        <div className="mb-12 md:mb-16 scroll-animate">
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 px-2 animate-slide-in-bottom stagger-1">
              💡 이런 키워드로 검색해보세요
            </h3>
            <p className="text-sm md:text-base text-gray-600 px-4 animate-fade-in-scale stagger-2">
              클릭하면 바로 순위를 확인할 수 있어요
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
            {KEYWORD_EXAMPLES.map((example, index) => (
              <div
                key={index}
                onClick={() => handleKeywordClick(example)}
                className={`group cursor-pointer bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 animate-slide-in-bottom stagger-${(index % 4) + 3} enhanced-hover`}
              >
                <div className="text-center">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3">{example.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 text-sm md:text-base">
                    {example.keyword}
                  </h4>
                  <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${example.color}`}>
                    {example.category}
                  </span>
                  <div className="mt-3 md:mt-4 flex items-center justify-center text-blue-600 group-hover:text-blue-700 transition-colors duration-300">
                    <span className="text-xs md:text-sm font-medium">순위 확인하기</span>
                    <ArrowRight size={12} className="ml-1 md:ml-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 상점 정보 흐르는 데모 섹션 */}
        <div className="mb-12 md:mb-16 scroll-animate">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 lg:p-12 border border-gray-100 animate-fade-in-scale">
            <div className="text-center mb-8 md:mb-10">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-4 px-2">
                🎯 실제 순위 검색 결과를 확인해보세요
              </h3>
              <p className="text-sm md:text-base text-gray-600 px-4">
                다양한 업종의 실제 순위 데이터를 확인할 수 있어요 (마우스를 올리면 멈춥니다)
              </p>
            </div>

            {/* 흐르는 카드 컨테이너 */}
            <div className="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_48px,_black_calc(100%-48px),transparent_100%)] group">
              <ul className="flex items-center justify-center animate-infinite-scroll">
                {SHOP_DEMO_DATA.map((shop, index) => (
                  <li key={index}><ShopDemoCard shop={shop} /></li>
                ))}
              </ul>
              <ul className="flex items-center justify-center animate-infinite-scroll" aria-hidden="true">
                {SHOP_DEMO_DATA.map((shop, index) => (
                  <li key={index}><ShopDemoCard shop={shop} /></li>
                ))}
              </ul>
            </div>
            
            <div className="text-center mt-8">
               <Link
                  href="/realtime"
                  className="inline-flex items-center bg-gradient-to-r from-[#25e4ff] to-[#0284c7] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-xl transition-all duration-300 text-sm md:text-base btn-pulse"
                >
                  <Search size={16} className="mr-2" />
                  실제 순위 확인하기
                </Link>
            </div>
          </div>
        </div>

        {/* 다른 방법 제시 섹션 */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 scroll-animate">
          {/* 회원 가입 */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg md:rounded-xl p-6 md:p-8 shadow-lg text-white animate-slide-in-left stagger-1 enhanced-hover">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 animate-floating">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">
                회원가입 (무제한)
              </h3>
              <p className="text-blue-100 mb-4 md:mb-6 text-sm md:text-base">
                회원가입하고 무제한으로 순위를 확인하세요
              </p>
              <Link
                href="/login"
                className="inline-flex items-center bg-white text-blue-600 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 text-sm md:text-base"
              >
                회원가입하기
                <ChevronRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>

          {/* 프리미엄 기능 */}
          <div className="bg-white rounded-lg md:rounded-xl p-6 md:p-8 shadow-lg border border-gray-100 animate-slide-in-right stagger-1 enhanced-hover">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 animate-floating" style={{ animationDelay: '0.5s' }}>
                <BarChart3 className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                프리미엄 분석
              </h3>
              <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                상세한 경쟁업체 분석과 리포트를 받아보세요
              </p>
              <Link
                onClick={handleLoginRequired}
                href="#"
                className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition-all duration-300 text-sm md:text-base"
              >
                요금제 보기
                <ChevronRight size={14} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 