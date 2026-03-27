"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import useAuthLoginViewModelLocal from "@/src/viewModel/useAuthLoginViewModelLocal";
import { useAuthStore } from "@/src/store/provider/StoreProvider";
import { handleKakaoLogin, initKakaoSdk } from "@/src/utils/api/kakaoSdk";
import KakaoSyncButton from "@/src/components/common/auth/KakaoSyncButton";
import { logError, logInfo } from "@/src/utils/logger";
import toast from "react-hot-toast";

export default function LoginForm() {
  const { login, isPendingLogin } = useAuthLoginViewModelLocal();
  const { loginUser, setLoginUser } = useAuthStore();
  
  const refs = useRef({
    idElement: null as HTMLInputElement | null,
    pwElement: null as HTMLInputElement | null,
    rememberMeElement: null as HTMLInputElement | null,
  });

  const validateFields = () => {
    if (!refs.current.idElement?.value) {
      toast.error("아이디를 입력해주세요.");
      refs.current.idElement?.focus();
      return false;
    }

    if (!refs.current.pwElement?.value) {
      toast.error("비밀번호를 입력해주세요.");
      refs.current.pwElement?.focus();
      return false;
    }

    return true;
  };
  const requestLogin = async () => {
    if (!validateFields()) return;
    const { idElement, pwElement, rememberMeElement } = refs.current;
    const dto = {
      username: idElement?.value || '',
      password: pwElement?.value || '',
    };

    logInfo('[LoginForm] 🚀 로그인 요청 시작:', { username: dto.username });
    const result = await login(dto, rememberMeElement?.checked || false);
    logInfo('[LoginForm] 📡 로그인 결과:', { ok: result.ok, hasUser: !!result.user });
    
    if (result.ok && result.user) {
      logInfo('[LoginForm] ✅ 로그인 성공, 사용자 정보 설정:', result.user.userName);
      // 일반 로그인에는 명시적으로 provider 태그
      setLoginUser({ ...result.user, provider: 'LOCAL' } as any);
      logInfo('[LoginForm] 🎯 setLoginUser 호출 완료');
    } else {
      logInfo('[LoginForm] ❌ 로그인 실패 또는 사용자 정보 없음');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      requestLogin();
    }
  };

  useEffect(() => {
    // 카카오 SDK 스크립트 로드 (SRI 제거: 무결성 해시 불일치로 차단되는 이슈 방지)
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      initKakaoSdk();
    };
    document.head.appendChild(script);

    // 아이디 입력 필드에 포커스
    refs.current.idElement?.focus();

    // 저장된 아이디가 있으면 설정
    try {
      const rememberId = localStorage.getItem("rememberId");
      // 값이 존재하고 "undefined"가 아닐 때만 처리
      if (
        rememberId && 
        rememberId !== "undefined" && 
        refs.current.idElement &&
        refs.current.rememberMeElement
      ) {
        // 안전하게 JSON 파싱
        const parsedId = JSON.parse(rememberId);
        if (parsedId) {
          refs.current.idElement.value = parsedId;
          refs.current.rememberMeElement.checked = true;
        }
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("아이디 기억하기 처리 중 오류:", errorObj);
      // 오류 발생 시 로컬스토리지 데이터 초기화
      localStorage.removeItem("rememberId");
    }

    // 로그인 유저 초기화 (로그인 페이지 진입 시에만)
    // setLoginUser(null); // 임시 주석 처리 - 이미 로그인된 사용자의 정보를 지우지 않음

    // 클린업 함수
    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, [setLoginUser]);

  return (
    <div className="bg-rank-light relative mb-6 flex w-full min-w-0 flex-col rounded-lg border-0 break-words shadow-lg">
      <div className="mb-0 rounded-t px-4 py-5 lg:px-10">
        <div className="mb-3 text-center">
          <h6 className="text-blueGray-500 text-sm font-bold">로그인</h6>
        </div>
        <div className="btn-wrapper space-y-3">
          {/* 카카오 싱크 버튼(동의하고 가입하기) */}
          <KakaoSyncButton />

          {/* 기존 카카오 로그인 버튼 유지 */}
          <button
            onClick={async () => {
              try {
                const params = new URLSearchParams(window.location.search);
                const redirectParam = params.get('redirect');
                if (redirectParam) {
                  localStorage.setItem('login_redirect_path', redirectParam);
                } else {
                  localStorage.removeItem('login_redirect_path');
                }
              } catch (error) {
                logError('[LoginForm] redirect 저장 실패', error as Error);
              }

              await handleKakaoLogin();
            }}
            className="outline-hiddenhover:shadow-md flex w-full items-center justify-center rounded-sm bg-[#FEE500] px-4 py-3 text-sm font-bold text-[#3C1E1E] shadow-sm transition-all duration-150 hover:bg-[#E6D200] focus:outline-none active:bg-[#CCBB00]"
            aria-label=" 카카오 로그인"
          >
            <Image
              src="/img/auth/kakao_login.png"
              alt="Kakao"
              className="mr-2 h-5 w-5"
              width={20}
              height={20}
            />
            <span className="hidden sm:inline">
               3초 카카오 로그인
            </span>
            <span className="sm:hidden">로그인</span>
          </button>
        </div>
        <hr className="border-blueGray-300 mt-6 border-b-1" />
      </div>

      <div className="mt-8 flex-auto px-4 py-10 pt-0 lg:px-10">
        <div className="text-blueGray-400 mb-3 text-center font-bold">
          <small>로그인 하기</small>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestLogin();
          }}
        >
          <div className="relative mb-3 w-full">
            <label className="text-blueGray-600 mb-2 block text-xs font-bold uppercase">
              아이디
            </label>
            <input
              type="text"
              ref={(el) => {
                refs.current.idElement = el;
              }}
              className="placeholder-blueGray-300 text-blueGray-600 rounded-smborder-0 focus:ring-3focus:outline-none w-full bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear"
              placeholder="아이디"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="relative mb-3 w-full">
            <label className="text-blueGray-600 mb-2 block text-xs font-bold uppercase">
              비밀번호
            </label>
            <input
              type="password"
              ref={(el) => {
                refs.current.pwElement = el;
              }}
              className="placeholder-blueGray-300 text-blueGray-600 rounded-smborder-0 focus:ring-3focus:outline-none w-full bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear"
              placeholder="비밀번호"
              onKeyDown={handleKeyDown}
            />
          </div>

          <div>
            <label className="inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                ref={(el) => {
                  refs.current.rememberMeElement = el;
                }}
                className="form-checkbox text-blueGray-700 rounded-smborder-0 ml-1 h-5 w-5 transition-all duration-150 ease-linear"
              />
              <span className="text-blueGray-600 ml-2 text-sm font-semibold">
                기억하기
              </span>
            </label>
          </div>

          <div className="mt-6 text-center">
            <button
              disabled={isPendingLogin}
              className="active:bg-blueGray-600 from-rank-primary to-rank-secondary outline-hiddenhover:shadow-lg w-full rounded-sm bg-gradient-to-r px-6 py-3 text-sm font-bold text-white uppercase shadow-sm transition-all duration-150 ease-linear focus:outline-none"
            >
              {isPendingLogin ? "로그인 중..." : "로그인"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
