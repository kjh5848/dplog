// components/JoinForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthRepository from "@/src/model/AuthRepository";
import { useAuthStore } from "@/src/store/provider/StoreProvider";
import useAuthJoinViewModelLocal from "@/src/viewModel/useAuthJoinViewModelLocal";
import Swal from "sweetalert2";
import { logError } from "@/src/utils/logger";
import { logInfo } from "@/src/utils/logger";

interface FormValues {
  userName: string;
  password: string;
  passwordConfirm: string;
  companyName: string;
  companyNumber: string;
  tel: string;
  emailId: string;
  emailDomain: string;
  emailCustomDomain: string;
  privacyPolicy: boolean;
  termsOfService: boolean;
  marketingConsent: boolean; // 마케팅 정보활용 동의 (선택)
  // 카카오 싱크 개인정보 입력 항목들
  name: string;
  gender: string;
  ageGroup: string;
  birthDate: string;
  birthYear: string;
  ci: string;
}

export default function JoinForm() {
  const { loginUser, isAuthPending } = useAuthStore();  
  const { join, verifyCompanyNumber, checkUsernameDuplicate, isPendingJoin, isVerifyingCompany, isCheckingUsername } =
    useAuthJoinViewModelLocal();

  const isDevelopment = true; // 프로덕션 모드로 설정

  const defaultValues = isDevelopment ? {
    // 개발용 기본값
    userName: '', // 중복 방지를 위해 타임스탬프 추가
    password: "wngur5848@&",
    passwordConfirm: "wngur5848@&",
    name: "테스트사용자",
    gender: "male",
    ageGroup: "20대",
    birthDate: "1995-01-01",
    birthYear: "1995",
    tel: "010-1234-5678",
    ci: "",
    emailId: "test",
    emailDomain: "gmail.com",
    emailCustomDomain: "",
    companyName: "테스트업체",
    companyNumber: "123-45-67890",
    privacyPolicy: true,
    termsOfService: true,
    marketingConsent: false, // 마케팅 동의는 기본적으로 false
  } : {
    // 프로덕션용 빈 값
    userName: "",
    password: "",
    passwordConfirm: "",
    name: "",
    gender: "",
    ageGroup: "",
    birthDate: "",
    birthYear: "",
    tel: "",
    ci: "",
    emailId: "",
    emailDomain: "",
    emailCustomDomain: "",
    companyName: "",
    companyNumber: "",
    privacyPolicy: false,
    termsOfService: false,
    marketingConsent: false, // 마케팅 동의는 기본적으로 false
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: defaultValues,
  });
  const [isVerified, setIsVerified] = useState(false); // 개발용: 자동 인증 완료
  const [isPendingSubmit, setIsPendingSubmit] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const router = useRouter();

  const password = watch("password");

  useEffect(() => {
    if (!isAuthPending && loginUser) {
      router.replace("/");
    }
  }, [isAuthPending, loginUser, router]);

  const onSubmit = async (data: FormValues) => {
    if (!data.privacyPolicy) {
      Swal.fire({
        title: "알림",
        text: "개인정보처리방침에 동의해주세요.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }
    if (!data.termsOfService) {
      Swal.fire({
        title: "알림",
        text: "이용약관에 동의해주세요.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!data.emailId || !data.emailDomain) {
      Swal.fire({
        title: "알림",
        text: "이메일을 입력하세요.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!data.tel) {
      Swal.fire({
        title: "알림",
        text: "연락처를 입력하세요.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!data.name) {
      Swal.fire({
        title: "알림",
        text: "이름을 입력하세요.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!data.companyName) {
      Swal.fire({
        title: "알림",
        text: "업체명을 입력하세요.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!data.companyNumber) {
      Swal.fire({
        title: "알림",
        text: "사업자등록번호를 입력하세요.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    if (!isUsernameAvailable) {
      Swal.fire({
        title: "알림",
        text: "아이디 중복 확인을 완료해주세요.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    // 개발용: 사업자등록번호 인증 검증 우회
    // if (!isVerified) {
    //   Swal.fire({
    //     title: "알림",
    //     text: "사업자등록번호를 인증해주세요.",
    //     icon: "warning",
    //     confirmButtonText: "확인",
    //   });
    //   return;
    // }

    setIsPendingSubmit(true);

    try {
      // companyNumber가 주석 처리되어 있으므로 기본값 설정
      const cleanCompanyNumber = data.companyNumber ? data.companyNumber.replace(/[^0-9]/g, "") : "";

      // 이메일 조합
      const email = data.emailDomain === "custom" 
        ? `${data.emailId}@${data.emailCustomDomain}`
        : `${data.emailId}@${data.emailDomain}`;
      
      // 회원가입 데이터 로깅 (개발용)
      logInfo("회원가입 데이터:", {
        userName: data.userName,
        password: data.password,
        name: data.name,
        emailId: data.emailId,
        emailDomain: data.emailDomain,
        emailCustomDomain: data.emailCustomDomain,
        gender: data.gender,
        birthDate: data.birthDate,
        tel: data.tel,
        companyName: data.companyName || "",
        companyNumber: cleanCompanyNumber,
        privacyPolicy: data.privacyPolicy,
        termsOfService: data.termsOfService,
        marketingConsent: data.marketingConsent,
      });

      // 회원가입 로직 사용
      await join({
        user: {
          userName: data.userName,
          password: data.password,
          name: data.name,
          email: email,
          gender: data.gender,
          birthDate: data.birthDate,
          tel: data.tel,
          companyName: data.companyName || "",
          companyNumber: cleanCompanyNumber,
          // passwordConfirm은 서버에서 필요하지 않으므로 제외
          marketingConsent: data.marketingConsent, // 마케팅 동의 정보 추가
        },
      });
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error("Unknown error occurred");
      logError("회원가입 오류 상세:", errorObj);
    } finally {
      setIsPendingSubmit(false);
    }
  };

  const handleCheckUsernameDuplicate = async () => {
    const username = watch("userName");
    if (!username) {
      Swal.fire({
        title: "알림",
        text: "아이디를 입력하세요.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    // ViewModel의 아이디 중복 체크 함수 호출
    const result = await checkUsernameDuplicate(username);

    // 중복 체크 결과 처리
    if (result && result.available) {
      setIsUsernameAvailable(true);
    } else {
      setIsUsernameAvailable(false);
    }
  };

  const checkCompanyNumber = async () => {
    const companyNumber = watch("companyNumber");
    if (!companyNumber) {
      Swal.fire({
        title: "알림",
        text: "사업자등록번호를 입력하세요.",
        icon: "warning",
        confirmButtonText: "확인",
      });
      return;
    }

    // ViewModel의 사업자등록번호 인증 함수 호출
    const result = await verifyCompanyNumber(companyNumber);

    // 인증 결과 처리
    if (result && result.verified) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  };

  const handleCompanyNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 10) {
      value = value.slice(0, 10); // 최대 10자리까지만 입력 허용
    }

    if (value.length < 3) {
      // 값 그대로 유지
    } else if (value.length < 5) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5)}`;
    }

    setValue("companyNumber", value, { shouldValidate: true }); // 값 변경 시 유효성 검사 트리거
    setIsVerified(false); // 번호 변경 시 인증 상태 초기화
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // 한글 입력 확인
    if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(inputValue)) {
      // 한글 입력 시 경고창 표시
      Swal.fire({
        title: "알림",
        text: "아이디는 영문 소문자와 숫자만 입력 가능합니다.",
        icon: "warning",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }

    // Caps Lock 확인 (대문자 입력 확인)
    if (/[A-Z]/.test(inputValue)) {
      Swal.fire({
        title: "알림",
        text: "Caps Lock이 켜져 있습니다. 소문자로 입력해주세요.",
        icon: "warning",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }

    // 영문 소문자와 숫자만 허용
    let value = inputValue.replace(/[^a-z0-9]/g, "");
    setValue("userName", value);
    setIsUsernameAvailable(false); // 아이디 변경 시 중복 확인 상태 초기화
  };

  const handleTelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    
    // 최대 11자리까지만 입력 허용
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    // 전화번호 형식에 맞게 하이픈 추가
    if (value.length >= 3 && value.length <= 7) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length >= 8) {
      value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    }
    
    setValue("tel", value);
  };

  // 비밀번호 유효성 검사 함수
  const validatePassword = (value: string) => {
    if (!value) return "비밀번호를 입력하세요.";
    if (value.length < 6 || value.length > 15)
      return "비밀번호는 6-15자 사이로 입력하세요.";

    // 영문 포함 확인
    if (!/[a-zA-Z]/.test(value)) return "비밀번호는 영문을 포함해야 합니다.";

    // 특수문자 포함 확인 (!@#$%&)
    if (!/[!@#$%&]/.test(value))
      return "비밀번호는 특수문자(!@#$%&)를 포함해야 합니다.";

    return true;
  };

  return (
    <div className="bg-rank-light relative mb-6 flex w-full min-w-0 flex-col rounded-lg border-0 break-words shadow-lg">
      {/* <div className="mb-0 rounded-t px-10 py-10">
        <div className="mb-3 text-center">
          <h6 className="text-blueGray-500 text-sm font-bold">회원가입</h6>
        </div>
        <div className="btn-wrapper">
          <Link
            href="/"
            className="mb-3 flex w-full items-center justify-center rounded-sm bg-[#FEE500] px-4 py-3 text-sm font-bold text-[#3C1E1E] shadow-sm transition-all duration-150 outline-hiddenhover:shadow-md focus:outline-none"
          >
            <Image
              src="/img/auth/kakao_login.png"
              alt="Kakao"
              className="mr-2 h-5 w-5"
              width={20}
              height={20}
            />
            3초 로그인/회원가입
          </Link>
        </div>
        <hr className="border-blueGray-300 mt-6 border-b-1" />
      </div> */}

      <div className="mt-8 flex-auto px-4 py-5 pt-0 lg:px-10">
        <div className="text-blueGray-400 mb-3 text-center font-bold">
          <small>회원가입 하기</small>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative mb-3 w-full">
            <label className="text-blueGray-600 mb-2 block text-xs font-bold uppercase">
              아이디 <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <input
                type="text"
                placeholder="아이디 (영문 소문자/숫자 4-12자)"
                className="placeholder-blueGray-300 text-blueGray-600 focus:ring-3focus:outline-none w-full rounded-l border-0 bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear"
                {...register("userName", {
                  required: "계정을 입력하세요.",
                  minLength: {
                    value: 4,
                    message: "아이디는 최소 4자 이상이어야 합니다.",
                  },
                  maxLength: {
                    value: 12,
                    message: "아이디는 최대 12자까지 가능합니다.",
                  },
                  pattern: {
                    value: /^[a-z0-9]+$/,
                    message: "아이디는 영문 소문자와 숫자만 사용 가능합니다.",
                  },
                  onChange: handleUsernameChange,
                })}
              />
              <button
                type="button"
                onClick={handleCheckUsernameDuplicate}
                disabled={isCheckingUsername}
                className="bg-rank-primary rounded-r px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:shadow-lg disabled:opacity-50"
              >
                {isCheckingUsername ? "확인 중..." : "중복확인"}
              </button>
            </div>
            {errors.userName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.userName.message}
              </p>
            )}
            {isUsernameAvailable && (
              <p className="mt-1 text-xs text-green-500">사용 가능한 아이디입니다</p>
            )}
          </div>

          <div className="relative mb-3 w-full">
            <label className="text-blueGray-600 mb-2 block text-xs font-bold uppercase">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="비밀번호 (영문+특수문자 6-15자)"
              className="placeholder-blueGray-300 text-blueGray-600 focus:ring-3focus:outline-none w-full rounded-sm border-0 bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear"
              {...register("password", {
                required: "비밀번호를 입력하세요.",
                validate: validatePassword,
              })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              비밀번호는 영문과 특수문자(!@#$%&) 조합으로 6-15자 사이로
              입력해주세요.
            </p>
          </div>

          <div className="relative mb-3 w-full">
            <label className="text-blueGray-600 mb-2 block text-xs font-bold uppercase">
              비밀번호 재확인 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="비밀번호 재확인"
              className="placeholder-blueGray-300 text-blueGray-600 focus:ring-3focus:outline-none w-full rounded-sm border-0 bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear"
              {...register("passwordConfirm", {
                required: "비밀번호를 다시 입력하세요.",
                validate: (value) =>
                  value === password || "비밀번호가 일치하지 않습니다.",
              })}
            />
            {errors.passwordConfirm && (
              <p className="mt-1 text-xs text-red-500">
                {errors.passwordConfirm.message}
              </p>
            )}
          </div>

          <div className="relative mb-3 w-full">
            <label className="text-blueGray-600 mb-2 block text-xs font-bold uppercase">
              업체명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="업체명"
              className="placeholder-blueGray-300 text-blueGray-600 w-full rounded-sm border-0 bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear focus:ring-3focus:outline-none"
              {...register("companyName", { 
                required: "업체명을 입력하세요.",
                minLength: {
                  value: 2,
                  message: "업체명은 최소 2자 이상이어야 합니다."
                }
              })}
            />
            {errors.companyName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="relative mb-3 w-full">
            <label className="text-blueGray-600 mb-2 block text-xs font-bold uppercase">
              사업자등록번호 <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <input
                type="text"
                placeholder="000-00-00000"
                className="placeholder-blueGray-300 text-blueGray-600 w-full rounded-l border-0 bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear focus:ring-3focus:outline-none"
                {...register("companyNumber", {
                  required: "사업자등록번호를 입력하세요.",
                  pattern: {
                    value: /^\d{3}-\d{2}-\d{5}$/,
                    message: "올바른 사업자등록번호 형식을 입력하세요. (예: 123-45-67890)"
                  },
                  onChange: handleCompanyNumberChange,
                })}
              />
              <button
                type="button"
                onClick={checkCompanyNumber}
                disabled={isVerifyingCompany}
                className="bg-rank-primary rounded-r px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:shadow-lg disabled:opacity-50"
              >
                {isVerifyingCompany ? "인증 중..." : "인증"}
              </button>
            </div>
            {errors.companyNumber && (
              <p className="mt-1 text-xs text-red-500">
                {errors.companyNumber.message}
              </p>
            )}
            {isVerified && (
              <p className="mt-1 text-xs text-green-500">인증되었습니다</p>
            )}
          </div>

          {/* 이름 */}
          <div className="relative mb-3 w-full">
            <label className="text-blueGray-600 mb-2 block text-xs font-bold uppercase">
              이름(대표자) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="이름을 입력하세요"
              className="placeholder-blueGray-300 text-blueGray-600 w-full rounded-sm border-0 bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear focus:ring-3 focus:outline-none"
              {...register("name", {
                required: "이름을 입력하세요.",
              })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* 이메일 */}
          <div className="relative mb-3 w-full">
            <label className="text-blueGray-600 mb-2 block text-xs font-bold uppercase">
              이메일 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="아이디"
                className="placeholder-blueGray-300 text-blueGray-600 w-1/2 rounded-sm border-0 bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear focus:ring-3 focus:outline-none"
                {...register("emailId", {
                  required: "이메일 아이디를 입력하세요.",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+$/i,
                    message: "올바른 이메일 아이디를 입력하세요.",
                  },
                })}
              />
              <span className="text-gray-500">@</span>
              <select
                className="text-blueGray-600 w-full rounded-sm border-0 bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear focus:ring-3 focus:outline-none"
                {...register("emailDomain", {
                  required: "이메일을 선택하세요.",
                })}
              >
                <option value="">선택</option>
                <option value="naver.com">naver.com</option>
                <option value="gmail.com">gmail.com</option>
                <option value="daum.net">daum.net</option>
                <option value="hanmail.net">hanmail.net</option>
                <option value="hotmail.com">hotmail.com</option>
                <option value="outlook.com">outlook.com</option>
                <option value="yahoo.com">yahoo.com</option>
                <option value="custom">직접입력</option>
              </select>
              {watch("emailDomain") === "custom" && (
                <input
                  type="text"
                  placeholder="도메인 입력"
                  className="placeholder-blueGray-300 text-blueGray-600 w-1/3 rounded-sm border-0 bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear focus:ring-3 focus:outline-none"
                  {...register("emailCustomDomain", {
                    required: "도메인을 입력하세요.",
                    pattern: {
                      value: /^[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "올바른 도메인을 입력하세요.",
                    },
                  })}
                />
              )}
            </div>
            {(errors.emailId || errors.emailDomain || errors.emailCustomDomain) && (
              <p className="mt-1 text-xs text-red-500">
                {errors.emailId?.message || errors.emailDomain?.message || errors.emailCustomDomain?.message}
              </p>
            )}
          </div>

          <div className="relative mb-3 w-full">
            <label className="text-blueGray-600 mb-2 block text-xs font-bold uppercase">
              연락처 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="010-0000-0000"
              className="placeholder-blueGray-300 text-blueGray-600 focus:ring-3focus:outline-none w-full rounded-sm border-0 bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear"
              {...register("tel", {
                required: "연락처를 입력하세요.",
                pattern: {
                  value: /^01[0-9]-\d{3,4}-\d{4}$/,
                  message: "올바른 전화번호 형식을 입력하세요. (예: 010-1234-5678)",
                },
                onChange: handleTelChange,
              })}
            />
            {errors.tel && (
              <p className="mt-1 text-xs text-red-500">{errors.tel.message}</p>
            )}
          </div>

          {/* 성별 */}
          <div className="relative mb-3 w-full">
            <label className="text-blueGray-600 mb-2 block text-xs font-bold uppercase">
              성별 <span className="text-red-500">*</span>
            </label>
            <select
              className="text-blueGray-600 w-full rounded-sm border-0 bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear focus:ring-3 focus:outline-none"
              {...register("gender", {
                required: "성별을 선택하세요.",
              })}
            >
              <option value="">성별 선택</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-500">
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* 생일 */}
          <div className="relative mb-3 w-full">
            <label className="text-blueGray-600 mb-2 block text-xs font-bold uppercase">
              생년월일 <span className="text-red-500">*</span>  
            </label>
            <input
              type="date"
              className="text-blueGray-600 w-full rounded-sm border-0 bg-white px-3 py-3 text-sm shadow-sm transition-all duration-150 ease-linear focus:ring-3 focus:outline-none"
              {...register("birthDate", {
                required: "생일을 입력하세요.",
              })}
            />
            {errors.birthDate && (
              <p className="mt-1 text-xs text-red-500">
                {errors.birthDate.message}
              </p>
            )}
          </div>

          {/* 약관 동의 섹션 */}
          <div className="space-y-3">
            <div>
              <label className="inline-flex cursor-pointer items-center">
                <input
                  id="privacyPolicy"
                  type="checkbox"
                  className="form-checkbox text-blueGray-700 ml-1 h-5 w-5 rounded-sm border-0 transition-all duration-150 ease-linear"
                  {...register("privacyPolicy", {
                    required: "개인정보처리방침에 동의해야 합니다.",
                  })}
                />
                <span className="text-blueGray-600 ml-2 text-sm font-semibold">
                  <Link
                    href="/privacyPolicy"
                    className="text-rank-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    개인정보처리방침
                  </Link>
                  에 동의합니다. <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.privacyPolicy && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.privacyPolicy.message}
                </p>
              )}
            </div>

            <div>
              <label className="inline-flex cursor-pointer items-center">
                <input
                  id="termsOfService"
                  type="checkbox"
                  className="form-checkbox text-blueGray-700 ml-1 h-5 w-5 rounded-sm border-0 transition-all duration-150 ease-linear"
                  {...register("termsOfService", {
                    required: "이용약관에 동의해야 합니다.",
                  })}
                />
                <span className="text-blueGray-600 ml-2 text-sm font-semibold">
                  <Link
                    href="/TermsOfService"
                    className="text-rank-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    서비스 이용약관
                  </Link>
                  에 동의합니다. <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.termsOfService && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.termsOfService.message}
                </p>
              )}
            </div>

            <div>
              <label className="inline-flex cursor-pointer items-center">
                <input
                  id="marketingConsent"
                  type="checkbox"
                  className="form-checkbox text-blueGray-700 ml-1 h-5 w-5 rounded-sm border-0 transition-all duration-150 ease-linear"
                  {...register("marketingConsent")}
                />
                <span className="text-blueGray-600 ml-2 text-sm font-semibold">
                  <Link
                    href="/marketing"
                    className="text-rank-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    마케팅 정보활용
                  </Link>
                  에 동의합니다. <span className="text-gray-500">(선택)</span>
                </span>
              </label>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                마케팅 정보활용에 동의하지 않아도 기본 서비스를 이용할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              type="submit"
              disabled={isPendingSubmit || isPendingJoin}
              className="from-rank-primary to-rank-secondary active:bg-blueGray-600 outline-hiddenhover:shadow-lg w-full rounded-sm bg-gradient-to-r px-6 py-3 text-sm font-bold text-white uppercase shadow-sm transition-all duration-150 ease-linear focus:outline-none disabled:opacity-50"
            >
              {isPendingSubmit || isPendingJoin ? "처리 중..." : "가입"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
