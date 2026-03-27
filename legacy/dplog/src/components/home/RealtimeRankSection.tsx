"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Star, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  Play, 
  Clock,
  CheckCircle,
  BarChart3,
  Users,
  Trophy,
  ChevronRight,
  MapPin,
  Eye,
  Target,
  Loader2,
  Award
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

/**
 * [역할] 실시간 순위 조회 기능을 홍보하는 인터랙티브 섹션
 * [입력] -
 * [출력] JSX 엘리먼트 (섹션 컴포넌트)
 * [NOTE] 모바일 최적화된 반응형 디자인, 개선된 애니메이션
 */

interface KeywordExample {
  keyword: string;
  category: string;
  color: string;
  icon: string;
}

interface AnimationStep {
  step: number;
  title: string;
  description: string;
  duration: number;
}

interface DemoResult {
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

const ANIMATION_STEPS: AnimationStep[] = [
  { step: 1, title: "키워드 입력", description: "지역 + 업종으로 검색", duration: 1000 },
  { step: 2, title: "실시간 분석", description: "네이버플레이스 데이터 수집", duration: 1500 },
  { step: 3, title: "순위 계산", description: "정확한 순위 측정", duration: 1200 },
  { step: 4, title: "결과 제공", description: "상세한 분석 결과", duration: 800 }
];

const DEMO_RESULTS: DemoResult[] = [
  {
    rank: 3,
    totalCount: 127,
    shopName: "신선횟집",
    category: "일식집",
    address: "부산 연제구 연산동 123-45",
    visitorReviewCount: 247,
    blogReviewCount: 89,
    rating: 4.8,
    shopImageUrl: "🍣",
    keyword: "부산 연산동 돈까스"
  },
  {
    rank: 7,
    totalCount: 89,
    shopName: "커피베이",
    category: "카페",
    address: "서울 강남구 테헤란로 152",
    visitorReviewCount: 156,
    blogReviewCount: 34,
    rating: 4.6,
    shopImageUrl: "☕",
    keyword: "강남 카페"
  },
  {
    rank: 2,
    totalCount: 203,
    shopName: "맛있는집",
    category: "한식집",
    address: "대구 중구 동성로 67-8",
    visitorReviewCount: 389,
    blogReviewCount: 112,
    rating: 4.9,
    shopImageUrl: "🍲",
    keyword: "대구 동성로 맛집"
  }
];

export default function RealtimeRankSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordExample | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<DemoResult>(DEMO_RESULTS[0]);
  const [showSearchCard, setShowSearchCard] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);

  // 개선된 애니메이션 실행
  const startAnimation = () => {
    // 초기 상태 설정
    setIsAnimating(true);
    setCurrentStep(0);
    setShowResult(false);
    setShowSearchCard(false);
    setShowProgressBar(false);
    setSearchProgress(0);
    
    // 랜덤 결과 선택
    const randomResult = DEMO_RESULTS[Math.floor(Math.random() * DEMO_RESULTS.length)];
    setCurrentResult(randomResult);
    
    // 1단계: 검색 카드 등장 (500ms)
    setTimeout(() => {
      setShowSearchCard(true);
      setCurrentStep(1);
    }, 300);
    
    // 2단계: 진행바 시작 (1000ms 후)
    setTimeout(() => {
      setShowProgressBar(true);
      setCurrentStep(2);
      
      // 진행바 애니메이션
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        setSearchProgress(progress);
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 30);
    }, 1000);
    
    // 3단계: 순위 계산 (2500ms 후)
    setTimeout(() => {
      setCurrentStep(3);
    }, 2500);
    
    // 4단계: 결과 카드 등장 (4000ms 후)
    setTimeout(() => {
      setCurrentStep(4);
      setShowSearchCard(false);
      setTimeout(() => {
        setShowResult(true);
        setIsAnimating(false);
      }, 400);
    }, 4000);
  };

  // 페이지 로드 시 3초 후 자동 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      startAnimation();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // 스크롤 애니메이션 설정
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

  // 키워드 선택 핸들러
  const handleKeywordClick = (keyword: KeywordExample) => {
    setSelectedKeyword(keyword);
    
    // HeroRealtimeSearch로 스크롤 (페이지에 있다면)
    const heroSection = document.getElementById('hero-realtime-search');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 바로가기 버튼 클릭 핸들러
  const handleShopClick = () => {
    // 실제 링크 대신 알림 표시
    toast.error('데모 버전입니다. 실제 서비스에서는 해당 가게 페이지로 이동합니다.');
  };

  // SHOP_ID 복사 핸들러  
  const handleCopyShopId = () => {
    const demoShopId = "1234567890";
    navigator.clipboard.writeText(demoShopId);
    toast.success(`SHOP_ID ${demoShopId}가 복사되었습니다.`);
  };

  const handleLoginRequired = () => {
   toast.error("준비중입니다.");
  }

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        {/* 섹션 헤더 - 모바일 최적화 */}
        <div className="text-center mb-12 md:mb-16 scroll-animate">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6 animate-slide-in-bottom stagger-1">
            <Zap size={14} className="mr-1 md:mr-2" />
            실시간 순위 확인
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6 animate-slide-in-left stagger-2 px-2">
            우리 가게는 몇 위에 있을까요?
          </h2>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in-scale stagger-3 px-4">
            키워드 검색 시 실제 순위를 실시간으로 확인해보세요. 
            정확한 데이터로 마케팅 전략을 세워보세요.
          </p>
        </div>

        {/* 키워드 예시 섹션 - 모바일 최적화 */}
        <div className="mb-12 md:mb-16 scroll-animate">
          <div className="text-center mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4 animate-slide-in-bottom stagger-1 px-2">
              💡 이런 키워드로 검색해보세요
            </h3>
            <p className="text-sm md:text-base text-gray-600 animate-fade-in-scale stagger-2 px-4">
              클릭하면 바로 순위를 확인할 수 있어요
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
            {KEYWORD_EXAMPLES.map((example, index) => (
              <div
                key={index}
                onClick={() => handleKeywordClick(example)}
                className={`group cursor-pointer bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-gray-100 animate-slide-in-bottom animate-card-hover stagger-${Math.min(index + 3, 8)}`}
              >
                <div className="text-center">
                  <div className="text-2xl md:text-3xl mb-2 md:mb-3 animate-bounce-in transform group-hover:scale-110 transition-transform duration-300">{example.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300 text-sm md:text-base">
                    {example.keyword}
                  </h4>
                  <span className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-all duration-300 group-hover:scale-105 ${example.color}`}>
                    {example.category}
                  </span>
                  <div className="mt-3 md:mt-4 flex items-center justify-center text-blue-600 group-hover:text-blue-700 transform group-hover:scale-105 transition-all duration-300">
                    <span className="text-xs md:text-sm font-medium">순위 확인하기</span>
                    <ArrowRight size={12} className="ml-1 md:ml-2 transform group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 개선된 애니메이션 데모 섹션 - 모바일 최적화 */}
        <div className="mb-12 md:mb-16 scroll-animate">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-xl p-4 md:p-8 lg:p-12 border border-gray-100 relative overflow-hidden animate-slide-in-bottom">
            <div className="text-center mb-8 md:mb-10">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 md:mb-4 animate-slide-in-left stagger-1 px-2">
                🎯 실시간 순위 확인 과정을 체험해보세요
              </h3>
              <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 animate-fade-in-scale stagger-2 px-4">
                실제와 동일한 검색 과정을 시각적으로 확인할 수 있어요
              </p>
              <button
                onClick={startAnimation}
                disabled={isAnimating}
                className="inline-flex items-center bg-gradient-to-r from-[#25e4ff] to-[#0284c7] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-70 animate-bounce-in stagger-3 enhanced-hover text-sm md:text-base"
              >
                {isAnimating ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    데모 시작하기
                  </>
                )}
              </button>
            </div>

            {/* 애니메이션 스테이지 - 모바일 최적화 */}
            <div className="relative min-h-[300px] md:min-h-[400px] flex items-center justify-center">
              
              {/* 배경 그라데이션 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-lg md:rounded-xl opacity-50"></div>
              
              {/* 단계별 인디케이터 - 모바일 최적화 */}
              <div className="absolute top-2 md:top-4 left-1/2 transform -translate-x-1/2 flex space-x-1 md:space-x-2">
                {ANIMATION_STEPS.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 transform ${
                        currentStep > index
                          ? "bg-green-500 text-white scale-110 animate-bounce-in"
                          : currentStep === index + 1
                          ? "bg-blue-500 text-white animate-pulse scale-125"
                          : "bg-gray-200 text-gray-500 scale-100"
                      }`}
                    >
                      {currentStep > index ? (
                        <CheckCircle size={12} className="animate-bounce-in" />
                      ) : (
                        step.step
                      )}
                    </div>
                    {index < ANIMATION_STEPS.length - 1 && (
                      <div className={`w-4 md:w-6 h-0.5 mx-1 transition-all duration-500 transform ${
                        currentStep > index + 1 ? "bg-green-500 scale-x-100" : "bg-gray-200 scale-x-75"
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* 검색 카드 - 모바일 최적화 */}
              {showSearchCard && (
                <div className="absolute animate-demo-card-slide">
                  <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border-2 border-blue-200 max-w-xs md:max-w-md mx-auto">
                    <div className="text-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <Search className="text-blue-600" size={20} />
                      </div>
                      <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2">
                        "{currentResult.keyword}" 검색 중...
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm mb-3 md:mb-4">
                        네이버플레이스에서 데이터를 수집하고 있어요
                      </p>
                      
                      {/* 진행바 */}
                      {showProgressBar && (
                        <div className="w-full bg-gray-200 rounded-full h-2 md:h-3 mb-3 md:mb-4 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 md:h-3 rounded-full transition-all duration-100 relative"
                            style={{ width: `${searchProgress}%` }}
                          >
                            {/* 진행바 내부 애니메이션 효과 */}
                            <div className="absolute inset-0 bg-white bg-opacity-30 animate-pulse"></div>
                          </div>
                        </div>
                      )}
                      
                      {/* 진행률 표시 */}
                      {showProgressBar && (
                        <div className="text-center mb-2">
                          <span className="text-xs md:text-sm font-medium text-blue-600">
                            {searchProgress}% 완료
                          </span>
                        </div>
                      )}
                      
                      {/* 현재 단계 표시 */}
                      <div className="flex items-center justify-center text-xs md:text-sm text-gray-500">
                        {currentStep === 1 && (
                          <>
                            <Target size={12} className="mr-1" />
                            키워드 분석 중...
                          </>
                        )}
                        {currentStep === 2 && (
                          <>
                            <Eye size={12} className="mr-1" />
                            데이터 수집 중...
                          </>
                        )}
                        {currentStep === 3 && (
                          <>
                            <BarChart3 size={12} className="mr-1" />
                            순위 계산 중...
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 상단 로딩 효과 - 모바일 최적화 */}
              {isAnimating && !showResult && !showSearchCard && (
                <div className="absolute top-12 md:top-16 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-16 md:w-20 md:h-20 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Zap className="text-blue-500" size={14} />
                    </div>
                  </div>
                </div>
              )}

              {/* 검색 카드가 있을 때는 작은 로딩 인디케이터 */}
              {isAnimating && showSearchCard && !showResult && (
                <div className="absolute top-16 md:top-20 right-4 md:right-8">
                  <div className="w-6 h-6 md:w-8 md:h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* 개선된 결과 카드 - 모바일에서 완전히 표시되도록 위치 수정 */}
          {showResult && (
            <div className="mt-6 md:mt-8 animate-result-reveal">
              <div className="bg-white rounded-lg md:rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* 성공 헤더 */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 md:p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award size={20} className="mr-2" />
                    <span className="font-bold text-base md:text-lg">검색 완료!</span>
                  </div>
                  <p className="text-green-100 text-sm md:text-base">"{currentResult.keyword}" 순위 분석 결과</p>
                </div>

                {/* 결과 내용 */}
                <div className="p-4 md:p-6">
                  <div className="flex items-start space-x-3 md:space-x-4">
                    {/* 이미지 섹션 - 모바일 최적화 */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg animate-image-load">
                        <div className="text-center">
                          <div className="text-2xl md:text-4xl mb-1">{currentResult.shopImageUrl}</div>
                          <div className="text-xs text-gray-500">#{currentResult.rank}위</div>
                        </div>
                      </div>
                    </div>

                    {/* 정보 섹션 */}
                    <div className="flex-1 min-w-0">
                      {/* 순위 배지 */}
                      <div className="inline-flex items-center bg-blue-100 text-blue-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold mb-2 md:mb-3">
                        <Trophy size={12} className="mr-1" />
                        {currentResult.rank}위 / {currentResult.totalCount}개
                      </div>

                      {/* 업체명 */}
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 animate-scale-in-bounce">
                        {currentResult.shopName}
                      </h3>

                      {/* 주소 */}
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                        <span className="text-xs md:text-sm truncate">{currentResult.address}</span>
                      </div>

                      {/* 평점과 리뷰 */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 mb-3">
                        <div className="flex items-center">
                          <Star size={14} className="text-yellow-500 mr-1" fill="currentColor" />
                          <span className="font-medium text-gray-900 text-sm">{currentResult.rating}</span>
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">
                          방문자 리뷰 {currentResult.visitorReviewCount}개
                        </div>
                        <div className="text-xs md:text-sm text-gray-600">
                          블로그 {currentResult.blogReviewCount}개
                        </div>
                      </div>

                      {/* 카테고리와 액션 버튼들 */}
                      <div className="flex items-center justify-between">
                        <span className="inline-block bg-gray-100 text-gray-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm">
                          {currentResult.category}
                        </span>
                        
                        {/* 액션 버튼들 */}
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCopyShopId}
                            className="bg-blue-100 text-blue-700 px-2 md:px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                          >
                            SHOP_ID
                          </button>
                          <button
                            onClick={handleShopClick}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 md:px-4 py-1 rounded-lg text-xs md:text-sm font-medium hover:shadow-lg transition-all"
                          >
                            바로가기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 하단 액션 */}
                  <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-100 text-center">
                    <p className="text-gray-600 mb-3 md:mb-4 text-xs md:text-sm px-2">
                      💡 실제 서비스에서는 더 정확한 순위와 상세 분석을 제공합니다
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/realtime"
                        className="inline-flex items-center bg-gradient-to-r from-[#25e4ff] to-[#0284c7] text-white px-4 md:px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm md:text-base"
                      >
                        <Search size={14} className="mr-2" />
                        실제 순위 확인하기
                      </Link>
                      <Link
                        href="/login"
                        className="inline-flex items-center border-2 border-blue-500 text-blue-600 px-4 md:px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-all text-sm md:text-base"
                      >
                        회원가입하고 무제한 이용
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 다른 방법 제시 섹션 - 모바일 최적화 */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 scroll-animate">
          {/* 회원 가입 */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg md:rounded-xl p-6 md:p-8 shadow-lg text-white transform hover:scale-105 hover:rotate-1 transition-all duration-300 animate-slide-in-left stagger-1 enhanced-hover">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 animate-floating">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 animate-slide-in-bottom stagger-2">
                회원가입 (무제한)
              </h3>
              <p className="text-blue-100 mb-4 md:mb-6 animate-fade-in-scale stagger-3 text-sm md:text-base">
                회원가입하고 무제한으로 순위를 확인하세요
              </p>
              <Link
                href="/login"
                className="inline-flex items-center bg-white text-blue-600 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300 animate-bounce-in stagger-4 text-sm md:text-base"
              >
                회원가입하기
                <ChevronRight size={14} className="ml-1 transform transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* 프리미엄 기능 */}
          <div className="bg-white rounded-lg md:rounded-xl p-6 md:p-8 shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 hover:-rotate-1 transition-all duration-300 animate-slide-in-right stagger-2 enhanced-hover">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 animate-floating" style={{ animationDelay: '1s' }}>
                <BarChart3 className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3 animate-slide-in-bottom stagger-3">
                프리미엄 분석
              </h3>
              <p className="text-gray-600 mb-4 md:mb-6 animate-fade-in-scale stagger-4 text-sm md:text-base">
                상세한 경쟁업체 분석과 리포트를 받아보세요
              </p>
              <Link
                onClick={handleLoginRequired}
                href="#"
                className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 hover:scale-105 transition-all duration-300 animate-bounce-in stagger-5 group text-sm md:text-base"
              >
                요금제 보기
                <ChevronRight size={14} className="ml-1 transform transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}