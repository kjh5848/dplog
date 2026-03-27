"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/provider/StoreProvider";
import { useScrollAnimation } from "@/src/hooks/useScrollAnimation";

interface FooterProps {
  handleLoginRequired?: () => void;
}

export default function Footer({ handleLoginRequired }: FooterProps) {
  const { loginUser } = useAuthStore();
  const router = useRouter();

  // 스크롤 애니메이션 초기화
  useScrollAnimation();

  const currentYear = new Date().getFullYear();

  const handleServiceClick = (path: string) => {
    if (loginUser) {
      router.push(path);
    } else {
      if (handleLoginRequired) {
        handleLoginRequired();
      } else {
        router.push('/login');
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="scroll-animate">
            <div className="flex items-center mb-4">
              <Image
                src="/img/brand/dplog_logo_v2.png"
                alt="D-PLOG Logo"
                width={32}
                height={32}
                className="mr-3"
              />
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                D-PLOG
              </div>
            </div>
            <p className="text-gray-400">
              네이버 플레이스 순위 추적의 새로운 기준
            </p>
          </div>
          <div className="scroll-animate stagger-2">
            <h4 className="font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => handleServiceClick('/realtime')}
                  className="hover:text-white transition-colors duration-300 hover:translate-x-1 text-left"
                >
                  순위 조회
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleServiceClick('/track')}
                  className="hover:text-white transition-colors duration-300 hover:translate-x-1 text-left"
                >
                  순위 추적
                </button>
              </li>
              <li><Link href="/membership" className="hover:text-white transition-colors duration-300 hover:translate-x-1">멤버십</Link></li>
            </ul>
          </div>
          <div className="scroll-animate stagger-3">
            <h4 className="font-semibold mb-4">지원</h4>
            <ul className="space-y-2 text-gray-400">
              <li><span className="text-gray-500">문의하기 (준비 중)</span></li>
              <li><span className="text-gray-500">자주 묻는 질문 (준비 중)</span></li>
              <li><span className="text-gray-500">이용 가이드 (준비 중)</span></li>
            </ul>
          </div>
          <div className="scroll-animate stagger-4">
            <h4 className="font-semibold mb-4">회사</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link 
                  href="/privacyPolicy"
                  className="hover:text-white transition-colors duration-300 hover:translate-x-1"
                >
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link 
                  href="/TermsOfService"
                  className="hover:text-white transition-colors duration-300 hover:translate-x-1"
                >
                  이용약관
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 사업자 정보 */}
        <div className="border-t border-gray-800 mt-12 pt-8 scroll-animate stagger-5">
          <div className="w-full text-center mb-6">
            <div className="text-sm text-gray-300 mb-2">
              <strong>사업자 정보</strong>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>상호: 이오 | 대표자: 황승준 | 사업자등록번호: 203-53-02281 | 채널명: 디플로그</div>
              <div>사업장 소재지: 부산광역시 연제구 연제로 24, 207호 이오</div>
              <div>유선전화번호 : 070-7701-7735</div>
              <div>이메일 : eo25.kr@gmail.com</div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 scroll-animate stagger-6">
          <p>&copy; {currentYear} D-PLOG. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
