export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 mt-14">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-blue-600 text-white p-6">
              <h1 className="text-3xl font-bold">개인정보처리방침</h1>
              <p className="mt-2 text-blue-100">D-PLOG 서비스의 모든 가입 경로와 마케팅 활용을 포괄한 통합 개인정보처리방침</p>
              <p className="mt-1 text-sm text-blue-200">버전 1.1 | 2025년 7월 22일 시행</p>
            </div>
            
            <div className="p-8">
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400 mb-8">
                <h3 className="font-semibold mb-2 text-gray-900">요약</h3>
                <p className="text-sm text-gray-700">
                  개인식별·서비스 제공·고객지원 등의 목적에 한해 최소한의 정보를 수집·보유하며, 
                  마케팅 정보활용은 별도 선택 동의를 받습니다. 
                  회원가입에 필요한 필수 정보는 서비스 제공을 위해 반드시 수집되며, 
                  선택 정보는 동의 시에만 수집됩니다.
                </p>
              </div>

              <div className="space-y-8 text-gray-700">
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    1. 총칙
                  </h2>
                  <p>
                    본 방침은 
                    <a href="https://www.law.go.kr/LSW//lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1020398435" 
                       className="text-blue-600 hover:text-blue-800 underline mx-1" target="_blank" rel="noopener noreferrer">
                      「개인정보보호법」 제30조
                    </a> 
                    및 동법 시행령에 따라 수립·공개되며, 정보주체 권익 보호와 원활한 고충처리를 목적으로 합니다.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    2. 개인정보의 처리목적
                  </h2>
                  <ul className="list-disc list-inside space-y-2 ml-4 bg-gray-50 p-4 rounded-lg">
                    <li>회원 식별·본인확인(직접 입력 또는 
                      <a href="https://devtalk.kakao.com/t/topic/135240" 
                         className="text-blue-600 hover:text-blue-800 underline mx-1" target="_blank" rel="noopener noreferrer">
                        카카오 싱크
                      </a>)
                    </li>
                    <li>네이버 플레이스 순위 조회·통계 제공 등 핵심 서비스 운영</li>
                    <li>고객 상담·분쟁 해결, 서비스 개선·통계 분석</li>
                    <li>법령 준수(부정이용·보안 사고 방지 등)</li>
                    <li><strong>마케팅·광고성 정보 전송(별도 선택 동의자 한정)</strong> → 
                      <a href="/marketing" className="text-blue-600 hover:text-blue-800 underline">마케팅 정보활용 동의</a> 페이지 참조
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    3. 수집 항목·방법·보유기간
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">구분</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">수집 항목</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">수집 방법</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">이용 목적</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">보유·이용 기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 font-semibold">필수(직접 가입)</td>
                          <td className="border border-gray-300 px-4 py-2">이메일, 비밀번호</td>
                          <td className="border border-gray-300 px-4 py-2">가입 폼</td>
                          <td className="border border-gray-300 px-4 py-2">회원 관리</td>
                          <td className="border border-gray-300 px-4 py-2">탈퇴 후 30일<br/>(단, 상법·전자상거래법 등 법정 보존기간이 있는 경우 해당 기간)</td>
                        </tr>
                        <tr className="bg-blue-50">
                          <td className="border border-gray-300 px-4 py-2 font-semibold">필수(카카오)</td>
                          <td className="border border-gray-300 px-4 py-2">카카오 UID, 닉네임, 이메일, CI(연계정보)</td>
                          <td className="border border-gray-300 px-4 py-2">카카오 싱크</td>
                          <td className="border border-gray-300 px-4 py-2">간편 로그인·중복가입 방지</td>
                          <td className="border border-gray-300 px-4 py-2">연결해제 또는 탈퇴 시<br/>(단, 상법·전자상거래법 등 법정 보존기간이 있는 경우 해당 기간)</td>
                        </tr>
                        <tr className="bg-green-50">
                          <td className="border border-gray-300 px-4 py-2 font-semibold">선택(카카오)</td>
                          <td className="border border-gray-300 px-4 py-2">이름, 성별, 연령대, 생일, 출생연도, 전화번호</td>
                          <td className="border border-gray-300 px-4 py-2">카카오 싱크 필수 동의</td>
                          <td className="border border-gray-300 px-4 py-2">프로필 표시·맞춤형 서비스</td>
                          <td className="border border-gray-300 px-4 py-2">동의 철회 시<br/>(단, 상법·전자상거래법 등 법정 보존기간이 있는 경우 해당 기간)</td>
                        </tr>
                        <tr className="bg-yellow-50">
                          <td className="border border-gray-300 px-4 py-2 font-semibold">선택(마케팅)</td>
                          <td className="border border-gray-300 px-4 py-2">휴대전화, 이메일, 성별, 생일, 프로필</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <a href="/marketing" className="text-blue-600 hover:text-blue-800 underline">마케팅 정보활용 동의</a> 체크박스
                          </td>
                          <td className="border border-gray-300 px-4 py-2">맞춤형 광고 · 이벤트 발송</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <strong>동의 철회 또는 2년</strong> 경과 시까지<br/>
                            (재동의 미확인 시 파기)
                          </td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 font-semibold">자동수집</td>
                          <td className="border border-gray-300 px-4 py-2">IP, 쿠키, 기기정보, 서비스 이용기록</td>
                          <td className="border border-gray-300 px-4 py-2">접속 시 자동</td>
                          <td className="border border-gray-300 px-4 py-2">보안, 통계</td>
                          <td className="border border-gray-300 px-4 py-2">3개월(통비법)<br/>(단, 상법·전자상거래법 등 법정 보존기간이 있는 경우 해당 기간)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    ※ 모든 선택 항목은 동의 거부 시에도 기본 서비스 이용이 제한되지 않습니다. 
                    (<a href="https://www.law.go.kr/LSW/lsLawLinkInfo.do?chrClsCd=010202&lsId=011357&lsJoLnkSeq=900078940" 
                        className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                      국가법령정보센터
                    </a>)
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    4. 제3자로부터 수집 (카카오 싱크)
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">제공받는 자</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">제공 항목</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">제공 근거</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">이용 목적</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">보유기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-blue-50">
                          <td className="border border-gray-300 px-4 py-2">카카오(주)</td>
                          <td className="border border-gray-300 px-4 py-2">닉네임, 이메일, CI(연계정보) 및 동의 항목</td>
                          <td className="border border-gray-300 px-4 py-2">정보주체 동의(보호법 §17 ①)</td>
                          <td className="border border-gray-300 px-4 py-2">간편가입·프로필 표시·맞춤형 서비스</td>
                          <td className="border border-gray-300 px-4 py-2">탈퇴·연결해제 시</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    5. 카카오 싱크 개인정보 동의 관리
                  </h2>
                  <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400 mb-6">
                    <h3 className="font-semibold mb-3 text-blue-800">개인정보 항목별 동의 설정</h3>
                    <p className="text-sm text-blue-700 mb-4">
                      카카오 싱크를 통한 회원가입 시 사용자는 다음 개인정보 항목에 대해 세분화된 동의를 제공할 수 있습니다.
                    </p>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-blue-300 text-sm">
                        <thead>
                          <tr className="bg-blue-100">
                            <th className="border border-blue-300 px-4 py-2 text-left font-semibold">개인정보 항목</th>
                            <th className="border border-blue-300 px-4 py-2 text-left font-semibold">동의 유형</th>
                            <th className="border border-blue-300 px-4 py-2 text-left font-semibold">이용 목적</th>
                            <th className="border border-blue-300 px-4 py-2 text-left font-semibold">보유기간</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-blue-300 px-4 py-2 font-medium">이름</td>
                            <td className="border border-blue-300 px-4 py-2">필수 동의</td>
                            <td className="border border-blue-300 px-4 py-2">프로필 표시, 개인화 서비스</td>
                            <td className="border border-blue-300 px-4 py-2">동의 철회 시</td>
                          </tr>
                          <tr>
                            <td className="border border-blue-300 px-4 py-2 font-medium">성별</td>
                            <td className="border border-blue-300 px-4 py-2">필수 동의</td>
                            <td className="border border-blue-300 px-4 py-2">맞춤형 콘텐츠 제공</td>
                            <td className="border border-blue-300 px-4 py-2">동의 철회 시</td>
                          </tr>
                          <tr>
                            <td className="border border-blue-300 px-4 py-2 font-medium">연령대</td>
                            <td className="border border-blue-300 px-4 py-2">필수 동의</td>
                            <td className="border border-blue-300 px-4 py-2">연령별 서비스 제공</td>
                            <td className="border border-blue-300 px-4 py-2">동의 철회 시</td>
                          </tr>
                          <tr>
                            <td className="border border-blue-300 px-4 py-2 font-medium">생일</td>
                            <td className="border border-blue-300 px-4 py-2">필수 동의</td>
                            <td className="border border-blue-300 px-4 py-2">생일 축하 서비스</td>
                            <td className="border border-blue-300 px-4 py-2">동의 철회 시</td>
                          </tr>
                          <tr>
                            <td className="border border-blue-300 px-4 py-2 font-medium">출생 연도</td>
                            <td className="border border-blue-300 px-4 py-2">필수 동의</td>
                            <td className="border border-blue-300 px-4 py-2">연령별 서비스 제공</td>
                            <td className="border border-blue-300 px-4 py-2">동의 철회 시</td>
                          </tr>
                          <tr>
                            <td className="border border-blue-300 px-4 py-2 font-medium">카카오계정(전화번호)</td>
                            <td className="border border-blue-300 px-4 py-2">필수 동의</td>
                            <td className="border border-blue-300 px-4 py-2">계정 연동, 보안</td>
                            <td className="border border-blue-300 px-4 py-2">동의 철회 시</td>
                          </tr>
                          <tr className="bg-blue-200">
                            <td className="border border-blue-300 px-4 py-2 font-medium">CI(연계정보)</td>
                            <td className="border border-blue-300 px-4 py-2 font-semibold text-blue-800">필수 동의</td>
                            <td className="border border-blue-300 px-4 py-2">본인확인, 중복가입 방지</td>
                            <td className="border border-blue-300 px-4 py-2">탈퇴 시</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                      <h4 className="font-semibold mb-2 text-blue-800">동의 관리 방법</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• 회원가입 시: 각 항목별로 필수/선택/사용안함 중 선택 가능</li>
                        <li>• 가입 후: 마이페이지 → 개인정보 설정에서 동의 항목 변경 가능</li>
                        <li>• 동의 철회: 언제든지 개별 항목별로 동의를 철회할 수 있음</li>
                        <li>• CI(연계정보): 본인확인을 위해 필수 동의 항목으로 설정됨</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    6. 마케팅·광고성 정보 전송
                  </h2>
                  <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                    <p className="text-sm text-gray-700 mb-4">
                      마케팅·광고성 정보 전송에 대한 상세한 내용은 
                      <a href="/marketing" className="text-blue-600 hover:text-blue-800 underline font-semibold">마케팅 정보활용 동의</a> 
                      페이지에서 확인할 수 있습니다.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-yellow-200">
                      <h3 className="font-semibold mb-2 text-gray-900">주요 내용</h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 선택 동의 항목 (동의하지 않아도 기본 서비스 이용 가능)</li>
                        <li>• 정보통신망법 §50에 따른 명시적 사전 선택 동의</li>
                        <li>• 2년마다 수신 의사 재확인</li>
                        <li>• 야간(21:00-08:00) 발송 금지</li>
                        <li>• 수신 거부 시 즉시 중단</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    7. 개인정보의 국외이전
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">이전받는 자</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">국가·보관 위치</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">이전 시기·방법</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">목적</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">보유기간</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2">Amazon Web Services Inc.</td>
                          <td className="border border-gray-300 px-4 py-2">AWS Seoul (ap-northeast-2) 리전</td>
                          <td className="border border-gray-300 px-4 py-2">서비스 이용 시 실시간 전송</td>
                          <td className="border border-gray-300 px-4 py-2">데이터 저장·백업</td>
                          <td className="border border-gray-300 px-4 py-2">탈퇴 또는 법정 보존 종료 시</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">Cloudflare Inc.</td>
                          <td className="border border-gray-300 px-4 py-2">글로벌 CDN(미국 포함)</td>
                          <td className="border border-gray-300 px-4 py-2">콘텐츠 전송 시 실시간 전송</td>
                          <td className="border border-gray-300 px-4 py-2">트래픽 가속·DDoS 방어</td>
                          <td className="border border-gray-300 px-4 py-2">서비스 종료 시</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    8. 개인정보 처리위탁
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <h3 className="font-semibold mb-2 text-gray-900">AWS Korea</h3>
                      <p className="text-sm">서버 호스팅·DB 운영</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                      <h3 className="font-semibold mb-2 text-gray-900">Cloudflare Inc.</h3>
                      <p className="text-sm">CDN·보안 (
                        <a href="https://www.cloudflare.com/ko-kr/trust-hub/gdpr/" 
                           className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                          GDPR 준수
                        </a>)
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                      <h3 className="font-semibold mb-2 text-gray-900">카카오(주)</h3>
                      <p className="text-sm">간편 로그인 서비스 제공</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    (위탁계약 시 재위탁·접근통제·교육 의무 포함)
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    9. 정보주체의 권리
                  </h2>
                  <ul className="list-disc list-inside space-y-2 ml-4 bg-gray-50 p-4 rounded-lg">
                    <li>열람·정정·삭제·처리정지 요구(온라인 양식 또는 이메일: privacy@dplog.com)</li>
                    <li>카카오 연결 해제 시 즉시 파기 및 서비스 로그아웃 완료</li>
                    <li>마케팅 수신 동의 철회·야간 전송 거부 가능 (
                      <a href="/marketing" className="text-blue-600 hover:text-blue-800 underline">마케팅 정보활용 동의</a> 페이지 참조)
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    10. 14세 미만 아동
                  </h2>
                  <p>
                    만 14세 미만은 법정대리인의 휴대전화 본인확인 등 정당한 동의를 거쳐 가입할 수 있습니다. 
                    (<a href="https://www.privacy.go.kr/front/contents/cntntsView.do?contsNo=94" 
                        className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                      개인정보보호포털
                    </a>)
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    11. 쿠키·행태정보
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                      <h3 className="font-semibold mb-2 text-gray-900">쿠키</h3>
                      <p className="text-sm">세션 유지·통계 분석 목적 사용, 브라우저 설정으로 거부 가능</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                      <h3 className="font-semibold mb-2 text-gray-900">행태정보 광고</h3>
                      <p className="text-sm">
                        현재 미사용 (도입 시 별도 고지) - 
                        <a href="https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=9888" 
                           className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                          개인정보보호위원회
                        </a>
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    12. 기술적·관리적 보호조치
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                      <h3 className="font-semibold mb-2 text-gray-900">암호화</h3>
                      <p className="text-sm">비밀번호 BCrypt(12 round), TLS 1.3 전송 암호화</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <h3 className="font-semibold mb-2 text-gray-900">접근통제</h3>
                      <p className="text-sm">
                        IAM 최소권한, 2FA, 접근기록 1년 보관 - 
                        <a href="https://www.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS216&mCode=D010020010&nttId=9198" 
                           className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                          안전성 확보조치 기준
                        </a>
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                      <h3 className="font-semibold mb-2 text-gray-900">물리적</h3>
                      <p className="text-sm">IDC 출입통제, CCTV 24h</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      <h3 className="font-semibold mb-2 text-gray-900">침해 대응</h3>
                      <p className="text-sm">개인정보 침해 시 72시간 내 개인정보보호위원회 신고 의무 준수</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    13. 개인정보의 파기
                  </h2>
                  <p>
                    보유기간 경과·목적 달성·동의 철회 시 즉시 삭제(전자파일 → 완전삭제, 출력물 → 파쇄·소각). 
                    (<a href="https://www.law.go.kr/LSW//lsLinkCommonInfo.do?ancYnChk=&chrClsCd=010202&lsJoLnkSeq=1020398435" 
                        className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                      국가법령정보센터
                    </a>)
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    14. 개인정보 보호책임자
                  </h2>
                  <div className="bg-gray-800 text-white p-6 rounded-lg">
                    <h3 className="font-semibold mb-3 text-yellow-400">개인정보 보호책임자</h3>
                    <div className="space-y-2">
                      <p><strong>성명:</strong> 황승준</p>
                      <p><strong>직책:</strong> 대표 / 개인정보 보호책임자</p>
                      <p><strong>연락처:</strong> eo25.kr@gmail.com, 070-7701-7735</p>
                      <p className="text-gray-300 text-sm mt-3">※ 개인정보 보호 담당부서로 연결됩니다.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-blue-100 pb-2">
                    15. 방침 변경
                  </h2>
                  <p>
                    중요 변경 시 시행 30일 전, 일반 변경은 7일 전 공지하며 버전·이력(PDF) 공개합니다. 
                    (<a href="https://www.privacy.go.kr/front/bbs/bbsView.do?bbsNo=BBSMSTR_000000000049&bbscttNo=20710" 
                        className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                      개인정보보호포털
                    </a>)
                  </p>
                </section>

                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg mt-8">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">부칙</h3>
                    <p className="font-semibold text-lg mb-2">시행일자: 2025년 7월 22일</p>
                    <p className="text-blue-100">본 방침은 2025-07-22부터 적용되며, 2025-01-05 제정 방침을 개정·대체합니다.</p>
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
