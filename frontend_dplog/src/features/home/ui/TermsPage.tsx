export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 mt-14">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-purple-600 text-white p-6">
              <h1 className="text-3xl font-bold">서비스 이용약관</h1>
              <p className="mt-2 text-purple-100">D-PLOG 네이버 플레이스 순위 추적 서비스 이용에 관한 약관</p>
              <p className="mt-1 text-sm text-purple-200">버전 2.0 | 2025년 7월 22일 시행</p>
            </div>
            
            <div className="p-8">
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-400 mb-8">
                <h3 className="font-semibold mb-2 text-gray-900">약관 개요</h3>
                <p className="text-sm text-gray-700">
                  본 약관은 이오(이하 '회사')가 제공하는 D-PLOG 서비스의 이용조건 및 절차, 
                  회사와 회원 간의 권리·의무·책임사항을 규정합니다. 
                  총 21개 조항으로 구성되어 있으며, 서비스 이용 시 모든 조항에 동의한 것으로 간주됩니다.
                </p>
              </div>

              <div className="space-y-8 text-gray-700">
                
                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제1조 (목적)
                  </h2>
                  <p>
                    이 약관은 이오(이하 '회사'라 한다)가 영위하는 네이버 플레이스 순위 추적 서비스(이하 '서비스'라 하며, 
                    접속 가능한 유,무선 단말기의 종류와 상관없이 이용 가능한 사이트가 제공하는 모든 서비스를 의미합니다.)를 
                    이용함에 있어 회원의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제2조 (정의)
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong className="text-purple-600">'사이트'</strong>란 '회사'가 서비스를 회원에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 '서비스 등'을 거래할 수 있도록 설정한 가상의 영업장을 말하며, 사이버몰을 운영하는 사업자의 의미로도 사용합니다. 현재 '회사'가 운영하는 '사이트'는 https://dplog.com(이하 '사이트'라고 한다)이며, 더불어 서비스 하는 안드로이드, iOS 환경의 서비스를 포함한 모바일웹과 앱을 포함합니다.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong className="text-purple-600">'회원'</strong>이라 함은 '사이트'에 개인정보를 제공하여 회원등록을 한 자로서, '사이트'에 정해진 회원 가입 방침에 따라 '사이트'의 정보를 지속적으로 제공받으며, '사이트'가 제공하는 '서비스'를 계속적으로 이용할 수 있는 자를 말합니다.</p>
                    </div>
                  </div>
                </section>
                
                 <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-lg mt-8">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">부칙</h3>
                    <p className="font-semibold text-lg mb-2">시행일자: 2025년 7월 22일</p>
                    <p className="text-purple-100">본 약관은 2025-07-22부터 적용되며, 2025-01-05 제정 약관을 개정·대체합니다.</p>
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
