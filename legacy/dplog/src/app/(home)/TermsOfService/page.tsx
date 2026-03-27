/**
 * [Role]   서비스 이용약관 페이지 (참고 파일 기반)
 * [Input]  -
 * [Output] D-PLOG 서비스 이용약관 전체 화면 렌더링
 * [NOTE]   Static Page · 21개 조항 구성
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '서비스 이용약관',
  description: 'D-PLOG 서비스 이용약관 - 네이버 플레이스 순위 추적 서비스',
};

export default function TermsOfServicePage() {
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
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p><strong className="text-purple-600">'비밀번호'</strong>라 함은 회원의 동일성 확인과 회원의 권익 및 비밀보호를 위하여 회원 스스로가 설정한 이메일은 아이디가 되며, 비밀번호는 사이트에서 자동으로 생성되는 조합을 말합니다.</p>
                    </div>
                    <p className="text-sm text-gray-600">이 약관에서 정의되지 않은 용어는 관계법령이 정하는 바에 따르며, 그 외에는 일반적인 상관례에 의합니다.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제3조 (약관의 명시와 설명 및 개정)
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <p><strong>1.</strong> 회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 공지사항에 게시합니다. 다만, 약관의 구체적 내용은 회원이 연결화면을 통하여 볼 수 있습니다.</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      <p><strong>2.</strong> 회사는 서비스 약관에 관한 관계 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                      <p><strong>3.</strong> 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행 약관과 함께 '사이트'의 공지사항에 그 적용일자 7일(회원에게 불리하거나 중대한 사항의 변경은 30일)이전부터 적용일자 전일까지 공지합니다.</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                      <p><strong>4.</strong> 회사가 약관을 개정할 경우에는 그 개정약관은 그 적용일자 이후에 체결되는 계약에만 적용되고 그 이전에 이미 체결된 계약에 대해서는 개정전의 약관조항이 그대로 적용됩니다.</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                      <p><strong>5.</strong> 제3항에 따라 공지된 적용일자 이후에 회원이 회사의 '서비스'를 계속 이용하는 경우에는 개정된 약관에 동의하는 것으로 봅니다. 다만, 중대한 변경사항의 경우 명시적 동의를 받으며, 동의하지 않는 경우 서비스 이용을 제한할 수 있습니다. 개정된 약관에 동의하지 아니하는 회원은 언제든지 자유롭게 '서비스' 이용계약을 해지할 수 있습니다.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제4조 (이용계약의 성립)
                  </h2>
                  <div className="space-y-4">
                    <p><strong>1.</strong> 이용계약은 회원이 되고자 하는 자(이하 '가입신청자')가 약관의 내용에 동의를 하고, 회사가 정한 가입양식에 따라 회원정보(전자우편주소, 비밀번호, 또는 소셜네트워크를 통한 회원가입 정보 등)를 기입하여 회원가입신청을 하고 회사가 이러한 신청에 대하여 승인함으로써 체결됩니다.</p>
                    
                    <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-400">
                      <h3 className="font-semibold mb-3 text-red-800">승낙 거부 사유</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• '가입신청자'가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                        <li>• 등록내용에 허위의 정보를 기재하거나, 기재누락, 오기가 있는 경우</li>
                        <li>• 회원가입일 현재 만 14세 미만인 경우</li>
                        <li>• 이미 가입된 회원과 이름 및 전자우편주소가 동일한 경우</li>
                        <li>• 부정한 용도 또는 영리를 추구할 목적으로 본 '서비스'를 이용하고자 하는 경우</li>
                        <li>• 회원의 귀책사유로 인하여 승인이 불가능하거나 기타 규정한 제반 사항을 위반하며 신청하는 경우</li>
                        <li>• 기타 이 약관에 위배되거나 위법 또는 부당한 이용신청임이 확인된 경우</li>
                      </ul>
                    </div>
                    
                    <p><strong>3.</strong> 회사는 '서비스' 관련 설비의 여유가 없거나, 기술상 또는 업무상 문제가 있는 경우에는 승낙을 유보할 수 있습니다.</p>
                    <p><strong>4.</strong> 이용계약의 성립시기는 회사가 가입완료를 신청절차상에서 표시한 시점으로 합니다.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제5조 (개인정보의 변경)
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-blue-800">정보 열람 및 수정</h3>
                      <p className="text-sm">회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다. 다만, 서비스를 관리를 위해 필요한 성명, 생년월일, 아이디 등은 수정이 불가합니다.</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-red-800">책임 사항</h3>
                      <p className="text-sm">회원이 변경사항을 수정하지 않아 발생한 불이익에 대하여 회사는 책임을 지지 않습니다.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제6조 (개인정보의 보호)
                  </h2>
                  <div className="space-y-4">
                    <p><strong>1.</strong> 회사는 회원의 개인정보를 보호하기 위하여 『정보통신망 이용촉진 및 정보보호 등에 관한 법률』 등 관계법령에서 정하는 바를 준수합니다.</p>
                    <p><strong>2.</strong> 회사는 회원의 개인정보를 보호하기 위하여 개인정보취급방침을 제정, '서비스' 개인정보처리방침에 게시합니다.</p>
                    <p><strong>3.</strong> 회사는 개인정보취급방침에 따라 회원의 개인정보를 최대한 보호하기 위하여 노력합니다.</p>
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      <h3 className="font-semibold mb-2 text-yellow-800">개인정보 제3자 제공</h3>
                      <p className="text-sm">회사는 다음과 같은 경우에 법이 허용하는 범위 내에서 회원의 개인정보를 제3자에게 제공할 수 있습니다:</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>• 법령에 근거한 정당한 권한을 가진 기관의 요청이 있는 경우</li>
                        <li>• 회원의 법령 또는 약관의 위반을 포함하여 부정행위확인 등의 정보보호업무를 위해 필요한 경우</li>
                        <li>• 기타 법률에 의해 요구되는 경우</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제7조 (이용계약의 해지)
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <h3 className="font-semibold mb-2 text-blue-800">회원에 의한 해지</h3>
                      <ul className="text-sm space-y-1">
                        <li>• 회원은 언제든지 회사에게 해지의사를 통지함으로써 이용계약을 해지할 수 있습니다</li>
                        <li>• 회원이 본 약정에 의거 환불규정을 준수하고, 이용계약 해지 시 회사의 고객센터를 통하여 해지 신청을 할 수 있습니다</li>
                        <li>• 회원이 계약을 해지할 경우, 관련 법 등에 의거 회사가 회원정보를 보유할 경우는 제외하고 회원의 모든 데이터는 소멸됩니다</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                      <h3 className="font-semibold mb-2 text-red-800">회사에 의한 해지</h3>
                      <p className="text-sm mb-2">회사는 다음과 같은 사유가 있는 경우, 이용계약을 해지할 수 있습니다:</p>
                      <ul className="text-sm space-y-1">
                        <li>• 제4조 제2항에서 정하고 있는 이용계약의 승낙거부사유가 있음이 확인된 경우</li>
                        <li>• 회원이 회사나 다른 회원 기타 타인의 권리나 명예, 신용 기타 정당한 이익을 침해하는 행위를 한 경우</li>
                        <li>• 기타 회원이 이 약관에 위배되는 행위를 하거나 이 약관에서 정한 해지사유가 발생한 경우</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제8조 (회원탈퇴 및 자격 상실)
                  </h2>
                  <div className="space-y-4">
                    <p><strong>1.</strong> 회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 회원탈퇴에 관한 규정에 따라 이를 처리합니다.</p>
                    
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                      <h3 className="font-semibold mb-2 text-orange-800">자격 제한 및 정지 사유</h3>
                      <ul className="text-sm space-y-1">
                        <li>• 다른 사람의 '사이트' 이용을 방해하거나 그 정보를 도용하는 등 전자상거래질서를 위협하는 경우</li>
                        <li>• '사이트'를 이용하여 법령과 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
                        <li>• '사이트'의 운영과 관련하여 근거 없는 사실 또는 허위의 사실을 적시하거나 유포하여 회사의 명예를 실추시키거나 '사이트'의 신뢰성을 해하는 경우</li>
                        <li>• '사이트'를 통해 '서비스 등'을 구매한 후 정당한 이유 없이 상습 또는 반복적으로 취소∙반품하여 회사의 업무를 방해하는 경우</li>
                      </ul>
                    </div>
                    
                    <p><strong>3.</strong> 회사가 회원자격을 제한∙정지시킨 후 동일한 행위가 2회 이상 반복되거나 30일 이내에 그 사유가 시정되지 아니하는 경우 회사는 회원자격을 상실시킬 수 있습니다.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제9조 (회원의 ID 및 비밀번호에 대한 의무)
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-red-800">관리 책임</h3>
                      <p className="text-sm">ID(전자우편번호 및 소셜네트워크 연동으로 인한 ID)와 비밀번호에 관한 관리책임은 회원에게 있으며, 이를 소홀히 하여 발생한 모든 민∙형사상의 책임은 회원에게 있습니다.</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-blue-800">도용 신고</h3>
                      <p className="text-sm">회원이 자신의 ID 및 비밀번호를 도난 당하거나 제3자가 사용하고 있음을 인지한 경우에는 즉시 회사에 통보하고 회사의 조치가 있는 경우에는 그에 따라야 합니다.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제10조 (회원의 의무)
                  </h2>
                  <div className="space-y-4">
                    <p><strong>1.</strong> 회원은 관계법령, 이 약관의 규정, 이용안내 등 회사가 통지하는 사항을 계약이 종료된 이후에도 준수하여야 하며, 그로 인해 회사의 손해 및 피해를 발생시킨 경우 손해배상책임 의무가 발생합니다.</p>
                    
                    <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-400">
                      <h3 className="font-semibold mb-3 text-red-800">금지 행위</h3>
                      <ul className="space-y-2 text-sm">
                        <li>• '서비스' 신청 또는 변경 시 허위내용의 등록하는 행위</li>
                        <li>• 타인의 정보도용하는 행위</li>
                        <li>• '사이트'에 게시된 정보를 변경하는 행위</li>
                        <li>• 회사가 정한 정보 이외 정보(컴퓨터 프로그램 등)의 송신 또는 게시하는 행위</li>
                        <li>• 회사 및 기타 제3자의 저작권 등 지적재산권을 침해하는 행위</li>
                        <li>• 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                        <li>• 외설 또는 폭력적인 메시지∙화상∙음성 기타 공서양속에 반하는 정보를 회사에 공개 또는 게시하는 행위</li>
                        <li>• 회사의 동의 없이 영리를 목적으로 '서비스'를 사용하는 행위</li>
                        <li>• 기타 관계법령이나 회사에서 정한 규정에 위배되는 행위</li>
                      </ul>
                    </div>
                    
                    <p><strong>3.</strong> 회원은 회사의 동의 없이 제3자에게 서비스를 양도하거나 증여 또는 담보하는 행위 등을 할 수 없습니다.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제11조 (회원의 게시물삭제 및 이용)
                  </h2>
                  <div className="space-y-4">
                    <p><strong>1.</strong> 회원이 작성한 게시물에 대한 모든 권리 및 책임은 이를 게시한 회원에게 있으며, 회사는 회원이 게시하거나 등록하는 '서비스'의 내용물이 다음 각 항에 해당한다고 판단되는 경우에 사전통지 없이 삭제할 수 있고, 이에 대하여 회사는 어떠한 책임도 지지 않습니다.</p>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                      <h3 className="font-semibold mb-2 text-yellow-800">삭제 대상</h3>
                      <ul className="text-sm space-y-1">
                        <li>• 다른 회원 또는 제3자를 비방하거나 중상모략으로 명예를 손상시키는 내용인 경우</li>
                        <li>• 공서양속에 위반되는 내용일 경우</li>
                        <li>• 범죄적 행위에 결부된다고 인정되는 경우</li>
                        <li>• 회사의 저작권, 제3자의 저작권 등 기타 권리를 침해하는 내용인 경우</li>
                        <li>• 회원이 '사이트'와 게시판에 음란물을 게재하거나 음란사이트를 링크하는 경우</li>
                        <li>• 회사로부터 사전 승인 받지 아니한 상업광고, 판촉내용을 게시하는 경우</li>
                        <li>• 해당 서비스와 관련 없는 내용인 경우</li>
                        <li>• 정당한 사유 없이 당사의 영업을 방해하는 내용을 기재하는 경우</li>
                      </ul>
                    </div>
                    
                    <p><strong>3.</strong> 회사는 이용자가 회사 웹사이트를 통하여 등록한 게시물에 관하여 마케팅 등으로 활용할 수 있습니다.</p>
                    <p><strong>4.</strong> 회원은 본조 제2항에 의거 회사에 철회를 요청할 수 있으며, 회사는 철회 의사를 받은 날로부터 회원의 게시물을 사용하지 않습니다.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제12조 (회원에 대한 통지)
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-blue-800">개별 통지</h3>
                      <p className="text-sm">회사가 회원에 대한 통지를 하는 경우, 회원이 가입신청 시 회사에 제출한 전자우편주소나 SMS, PUSH 등으로 할 수 있습니다.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-green-800">공지 통지</h3>
                      <p className="text-sm">회사는 불특정다수 회원에 대한 통지의 경우, 1주일 이상 '사이트'에 게시함으로써 개별 통지에 갈음할 수 있습니다. 다만, 회원 본인의 거래에 관하여 중대한 영향을 미치는 사항에 대하여는 개별 통지합니다.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제13조 (회사의 의무)
                  </h2>
                  <div className="space-y-4">
                    <p><strong>1.</strong> 회사는 관계법령과 이 약관에 의거 공서양속에 반하는 행위를 하지 않으며 이 약관이 정하는 바에 따라 지속적이고, 안정적으로 '서비스 등'을 제공하는데 최선을 다하여야 합니다.</p>
                    <p><strong>2.</strong> 회사는 회원이 안전하게 '서비스'를 이용할 수 있도록 회원의 개인정보(신용정보 포함)보호를 위한 보안시스템을 갖추어야 하며 개인정보취급방침을 공시하고 준수합니다.</p>
                    <p><strong>3.</strong> 회사는 회원으로부터 제기되는 의견이나 불만이 정당하고 객관적으로 인정될 경우에는 적절한 절차를 거쳐 처리하여야 합니다. 다만, 처리가 곤란한 경우에는 회원에게 그 사유와 처리일정을 통보하여야 합니다.</p>
                    <p><strong>4.</strong> 회사의 서비스는 연중무휴 1일 24시간 제공함을 원칙으로 합니다.</p>
                    <p><strong>5.</strong> 본조 제4항에도 불구하고 회사의 컴퓨터 등 통신설비 등 보수점검, 교체 및 고장, 통신두절 또는 운영상 상당한 이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제14조 (개별 서비스에 대한 약관 및 이용조건)
                  </h2>
                  <p>
                    회사는 제공하는 '서비스'내 개별 서비스에 대한 별도의 약관 및 이용조건을 둘 수 있으며 개별 서비스에서 별도로 적용되는 약관에 대한 동의는 회원이 개별 서비스를 최초로 이용할 경우 별도의 동의절차를 거치게 됩니다. 이 경우 개별 서비스에 대한 이용약관 등이 이 약관에 우선합니다.
                  </p>
                </section>

                                            <section>
                              <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                                제15조 (서비스 이용책임)
                              </h2>
                              <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-400">
                                <p className="text-sm">
                                  회원은 회사가 서명한 명시적인 서면에 구체적으로 허용한 경우를 제외하고는 '서비스'를 이용하여 서비스를 판매하는 영업활동을 할 수 없으며 
                                  특히 관련 법령 위반 또는 서비스 운영에 지장을 주는 행위로 판단되는 경우, 상용S/W 불법배포 등을 할 수 없습니다. 
                                  이를 위반하여 발생한 영업활동의 결과 및 손실, 관계기관에 의한 법적 조치 등에 관해서는 회사가 책임을 지지 않습니다.
                                </p>
                              </div>
                            </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제16조 (서비스 제공의 중지)
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                      <h3 className="font-semibold mb-2 text-red-800">서비스 중지 사유</h3>
                      <ul className="text-sm space-y-1">
                        <li>• 컴퓨터 등 정보통신설비의 보수점검∙교체 및 고장, 통신의 두절 등의 사유가 발생한 경우</li>
                        <li>• 관련법령에 규정된 기간통신사업자가 전기통신 '서비스'를 중지했을 경우</li>
                        <li>• 기타 불가항력적 사유가 있는 경우</li>
                      </ul>
                    </div>
                    <p><strong>2.</strong> 회사는 국가비상사태, 정전, '서비스' 설비의 장애 또는 '서비스' 이용의 폭주 등으로 정상적인 '서비스' 이용에 지장이 있는 때에는 '서비스'의 전부 또는 일부를 제한하거나 정지할 수 있습니다.</p>
                    <p><strong>3.</strong> 회사가 '서비스' 제공을 일시적으로 중단할 경우 서비스 일시 중단사실과 그 사유를 '사이트' 공지사항에 통지합니다.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제17조 (정보의 제공 및 광고의 게재)
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-blue-800">정보 제공</h3>
                      <p className="text-sm">회사는 회원이 '서비스' 이용 중 필요하다고 인정되는 다양한 정보를 공지사항 또는 전자우편이나, SMS, 전화 등의 방법으로 회원에게 제공할 수 있습니다. 다만, 회원은 관련법에 따른 거래관련정보 및 고객문의 등에 대한 답변 등을 제외하고는 언제든지 전자우편 등에 대해서 수신거절을 할 수 있습니다.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-green-800">광고 게재</h3>
                      <p className="text-sm">회사는 '서비스'의 운영과 관련하여 '서비스' 화면, 홈페이지, 전자우편 등에 광고를 게재할 수 있습니다. 광고가 게재된 전자우편 등을 수신한 회원은 수신거절을 회사에게 할 수 있습니다.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제18조 (서비스 이용료 등의 환불)
                  </h2>
                  <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-400">
                    <h3 className="font-semibold mb-3 text-yellow-800">환불 규정</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• 구매 후 서비스 이용 시작일 0시 기준 24시간 이전까지 이용철회시 전액 환불(결제액 기준) 가능합니다.</li>
                      <li>• 서비스 이용 시작 후 1/3 경과 전까지 철회시 이용료의 2/3에 해당하는 금액을 환불합니다.</li>
                      <li>• 서비스의 1/3 경과 시점부터 취소시 이용료의 1/3에 해당하는 금액을 환불합니다.</li>
                      <li>• 서비스의 1/2 경과 시점부터는 환불이 불가하며 서비스기간 종료 이후 환불도 불가합니다.</li>
                      <li>• 서비스 혜택으로 제공되는 추가 기능, 자료, 템플릿을 제공받은 경우에는 진도와 무관하게 환불 불가합니다.</li>
                      <li>• 서비스 콘텐츠 및 데이터는 무단 복제, 유포시 법적 처벌과 손해배상 책임을 물을 수 있습니다.</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제19조 (게시물의 관리)
                  </h2>
                  <div className="space-y-4">
                    <p><strong>1.</strong> 회원의 게시물이 『정보통신망 이용촉진 및 정보보호 등에 관한 법률』 및 『저작권』등 관계법령에 위반되는 내용을 포함하는 경우, 권리자는 관계법령이 정한 절차에 따라 해당 게시물의 게시중단 및 삭제 등을 요청할 수 있으며, 회사는 관계법령에 따라 조치를 취하여야 합니다.</p>
                    <p><strong>2.</strong> 회사는 전항에 따른 권리자의 요청이 없는 경우라도 권리침해가 인정될 만한 사유가 있거나 기타 회사 정책 및 관련법에 위배되는 경우에는 관련법에 따라 해당 '게시물'에 대해 임시조치 등을 취할 수 있습니다.</p>
                    <p><strong>3.</strong> 본 조에 따른 세부절차는 『정보통신망 이용촉진 및 정보보호 등에 관한 법률』 및 『저작권법』이 규정한 범위 내에서 회사가 정한 '게시중단요청서비스'에 따릅니다.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                    제20조 (면책조항)
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">불가항력</h3>
                      <p className="text-sm">천재지변 또는 이에 준하는 불가항력으로 인하여 '서비스'를 제공할 수 없는 경우에는 '서비스' 제공에 관한 책임이 면제됩니다.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">회원 귀책사유</h3>
                      <p className="text-sm">회원의 귀책사유로 인한 '서비스' 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">수익 손실</h3>
                      <p className="text-sm">회원이 '서비스'를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며 그 밖의 '서비스'를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">무료 서비스</h3>
                      <p className="text-sm">회사는 무료로 제공되는 '서비스' 이용과 관련하여 관련법에 특별한 규정이 없는 한 책임을 지지 않습니다.</p>
                    </div>
                  </div>
                </section>

                                            <section>
                              <h2 className="text-2xl font-semibold mb-4 text-gray-900 border-b-2 border-purple-100 pb-2">
                                제21조 (분쟁의 해결 등)
                              </h2>
                              <div className="bg-gray-800 text-white p-6 rounded-lg">
                                <p className="mb-4">
                                  <strong className="text-yellow-400">1.</strong> 회사와 회원 간 분쟁이 발생한 경우 콘텐츠분쟁조정위원회를 통해 조정을 신청할 수 있습니다.
                                </p>
                                <p className="mb-4">
                                  <strong className="text-yellow-400">2.</strong> 회사와 회원 간 발생한 소송 관할은 분쟁 당시 서울중앙지방법원을 제1심 전속관할로 합니다. 다만, 소액사건심판법이 적용되는 경우 해당 법원의 관할을 따릅니다.
                                </p>
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

