export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 mt-14">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-yellow-600 text-white p-6">
              <h1 className="text-3xl font-bold">마케팅 정보활용 동의</h1>
              <p className="mt-2 text-yellow-100">선택 동의 항목 - 동의하지 않아도 기본 서비스 이용이 가능합니다</p>
              <p className="mt-1 text-sm text-yellow-200">버전 1.0 | 2025년 7월 22일 시행</p>
            </div>
            
            <div className="p-8">
              <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400 mb-8">
                <h3 className="font-semibold mb-2 text-gray-900">요약</h3>
                <p className="text-sm text-gray-700">
                  마케팅 정보활용은 <strong>선택 동의</strong> 항목입니다. 동의하지 않아도 D-PLOG의 모든 기본 서비스를 이용할 수 있습니다. 
                  동의 시 맞춤형 이벤트, 쿠폰, 신규 기능 안내 등을 받을 수 있으며, 언제든지 철회 가능합니다.
                </p>
              </div>

              <div className="space-y-8 text-gray-700">
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-yellow-100 pb-2">
                    1. 동의 여부
                  </h2>
                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                    <p className="font-semibold text-green-800">✅ 선택 동의</p>
                    <p className="text-sm text-green-700 mt-1">
                      마케팅 정보활용에 동의하지 않아도 D-PLOG의 모든 기본 서비스(네이버 플레이스 순위 조회, 통계 제공 등)를 이용할 수 있습니다.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-yellow-100 pb-2">
                    2. 활용 목적
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <h3 className="font-semibold mb-2 text-gray-900">맞춤형 서비스 제공</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 개인화된 콘텐츠 추천</li>
                        <li>• 이용 패턴 기반 서비스 개선</li>
                        <li>• 연령대별 맞춤 기능 안내</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                      <h3 className="font-semibold mb-2 text-gray-900">마케팅 활동</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 신규 기능 및 업데이트 안내</li>
                        <li>• 이벤트 및 프로모션 정보</li>
                        <li>• 할인 쿠폰 및 특별 혜택 제공</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-yellow-100 pb-2">
                    3. 활용 정보 항목
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">구분</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">활용 정보</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">활용 목적</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">보유기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-yellow-50">
                          <td className="border border-gray-300 px-4 py-2 font-semibold">기본 정보</td>
                          <td className="border border-gray-300 px-4 py-2">이름, 성별, 연령대, 생일</td>
                          <td className="border border-gray-300 px-4 py-2">맞춤형 콘텐츠 제공</td>
                          <td className="border border-gray-300 px-4 py-2">동의 철회 시</td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className="border border-gray-300 px-4 py-2 font-semibold">연락처</td>
                          <td className="border border-gray-300 px-4 py-2">휴대전화, 이메일</td>
                          <td className="border border-gray-300 px-4 py-2">마케팅 정보 전송</td>
                          <td className="border border-gray-300 px-4 py-2">동의 철회 시</td>
                        </tr>
                        <tr className="bg-green-50">
                          <td className="border border-gray-300 px-4 py-2 font-semibold">서비스 이용</td>
                          <td className="border border-gray-300 px-4 py-2">이용 기록, 검색 키워드</td>
                          <td className="border border-gray-300 px-4 py-2">서비스 개선, 통계 분석</td>
                          <td className="border border-gray-300 px-4 py-2">동의 철회 시</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-yellow-100 pb-2">
                    4. 정보 전송 방법
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <h3 className="font-semibold mb-2 text-gray-900">이메일</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 신규 기능 및 업데이트 안내</li>
                        <li>• 이벤트 및 프로모션 정보</li>
                        <li>• 서비스 이용 통계 및 리포트</li>
                        <li>• 발송 빈도: 월 1-2회 (최대)</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                      <h3 className="font-semibold mb-2 text-gray-900">SMS/MMS</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 긴급한 서비스 공지</li>
                        <li>• 한정 시간 이벤트 안내</li>
                        <li>• 발송 빈도: 월 1회 (최대)</li>
                        <li>• 야간 발송: 21:00-08:00 금지</li>
                      </ul>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                      <h3 className="font-semibold mb-2 text-gray-900">앱 푸시 알림</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 실시간 순위 변동 알림</li>
                        <li>• 맞춤형 키워드 추천</li>
                        <li>• 발송 빈도: 주 2-3회 (최대)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-yellow-100 pb-2">
                    5. 동의 관리
                  </h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-3 text-gray-900">동의 설정 방법</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 text-blue-600">회원가입 시</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• 체크박스로 동의 여부 선택</li>
                          <li>• 동의하지 않아도 가입 가능</li>
                          <li>• 언제든지 설정 변경 가능</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">가입 후 관리</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• 마이페이지 → 개인정보 설정</li>
                          <li>• 마케팅 수신 동의 관리</li>
                          <li>• 개별 채널별 동의 설정</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-yellow-100 pb-2">
                    6. 수신 거부 및 철회
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                      <h3 className="font-semibold mb-2 text-gray-900">즉시 중단</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 수신 거부 시 즉시 발송 중단</li>
                        <li>• 거부 사실을 발송 시스템에 실시간 연동</li>
                        <li>• 추가 발송 시도 없음</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      <h3 className="font-semibold mb-2 text-gray-900">2년마다 재확인</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 동의자 대상 2년마다 수신 의사 재확인</li>
                        <li>• 미응답 시 동의 철회로 간주</li>
                        <li>• 
                          <a href="https://www.law.go.kr/lsLinkProc.do?chrClsCd=010202&joLnkStr=%EC%A0%9C50%EC%A1%B0+%EB%98%90%EB%8A%94+%EC%A0%9C50%EC%A1%B0%EC%9D%988&joNo=005000000%5E005000000%5E005002000%5E005003000%5E005004000%5E005005000%5E005006000%5E005007000%5E005008000&lsId=000030&lsNm=%EC%A0%95%EB%B3%B4%ED%86%B5%EC%8B%A0%EB%A7%9D+%EC%9D%B4%EC%9A%A9%EC%B4%89%EC%A7%84+%EB%B0%8F+%EC%A0%95%EB%B3%B4%EB%B3%B4%ED%98%B8+%EB%93%B1%EC%97%90+%EA%B4%80%ED%95%9C+%EB%B2%95%EB%A5%A0&mode=2" 
                             className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                            정보통신망법 §50
                          </a> 준수
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-yellow-100 pb-2">
                    7. 야간 발송 제한
                  </h2>
                  <div className="bg-gray-800 text-white p-6 rounded-lg">
                    <h3 className="font-semibold mb-3 text-yellow-400">야간 발송 금지</h3>
                    <div className="space-y-2">
                      <p><strong>금지 시간:</strong> 21:00 ~ 08:00</p>
                      <p><strong>적용 대상:</strong> SMS/MMS, 이메일, 푸시 알림</p>
                      <p><strong>예외:</strong> 긴급한 서비스 장애 공지</p>
                      <p className="text-gray-300 text-sm mt-3">
                        ※ 야간 발송이 필요한 경우 별도 동의를 받습니다.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-yellow-100 pb-2">
                    8. 제3자 제공 금지
                  </h2>
                  <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400">
                    <p className="text-sm text-gray-700">
                      마케팅 목적으로 수집된 개인정보는 <strong>절대 제3자에게 제공하지 않습니다</strong>. 
                      모든 마케팅 활동은 D-PLOG에서 직접 수행하며, 외부 광고업체나 마케팅 대행사와의 정보 공유는 없습니다.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-yellow-100 pb-2">
                    9. 문의 및 고충처리
                  </h2>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-3 text-gray-900">개인정보 보호책임자</h3>
                    <div className="space-y-2">
                      <p><strong>성명:</strong> 황승준</p>
                      <p><strong>직책:</strong> 대표 / 개인정보 보호책임자</p>
                      <p><strong>연락처:</strong> eo25.kr@gmail.com, 070-7701-7735</p>
                      <p className="text-gray-600 text-sm mt-3">
                        마케팅 수신 거부, 동의 철회, 기타 문의사항은 언제든지 연락주세요.
                      </p>
                    </div>
                  </div>
                </section>

                <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 rounded-lg mt-8">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">부칙</h3>
                    <p className="font-semibold text-lg mb-2">시행일자: 2025년 7월 22일</p>
                    <p className="text-yellow-100">본 동의서는 2025-07-22부터 적용됩니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
