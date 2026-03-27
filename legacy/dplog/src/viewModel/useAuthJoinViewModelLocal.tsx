"use client"; // Next.js에서 클라이언트 컴포넌트임을 명시

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthRepository from "@/src/model/AuthRepository"; // AuthRepository 임포트
import Swal from 'sweetalert2'; // Swal 임포트
import { logError } from "@/src/utils/logger";
import { JoinRequest } from "@/types/auth";
import toast from "react-hot-toast";

// 회원가입 관련 로직을 관리하는 커스텀 훅
export default function useAuthJoinViewModelLocal() {
  const router = useRouter();
  const [isPendingJoin, setIsPendingJoin] = useState(false);
  const [isVerifyingCompany, setIsVerifyingCompany] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // 사업자등록번호 인증 함수
  const verifyCompanyNumber = async (companyNumber: string) => {
    try {
      setIsVerifyingCompany(true);
      
      // 입력값 검증
      if (!companyNumber || companyNumber.trim() === '') {
        Swal.fire({
          title: '오류',
          text: '사업자등록번호를 입력해주세요.',
          icon: 'error',
          confirmButtonText: '확인'
        });
        return { verified: false };
      }
      
      // AuthRepository를 사용하여 사업자등록번호 인증 API 호출
      const response = await AuthRepository.verifyCompanyNumber(companyNumber);
      
      if (response.code !== "0") {
        Swal.fire({
          title: '오류',
          text: response.message || '사업자등록번호 인증에 실패했습니다.',
          icon: 'error',
          confirmButtonText: '확인'
        });
        return { verified: false };
      }
      
      const businessData = response.data;
      
      // 사업자 상태 확인
      if (businessData.b_stt_cd === "01") { // 계속사업자
        Swal.fire({
          title: '인증 완료',
          text: '사업자등록번호가 확인되었습니다.',
          icon: 'success',
          confirmButtonText: '확인'
        });
        return { verified: true, data: businessData };
      } else if (businessData.b_stt_cd === "02") { // 휴업자
        Swal.fire({
          title: '휴업 상태',
          text: '해당 사업자는 현재 휴업 상태입니다.',
          icon: 'warning',
          confirmButtonText: '확인'
        });
        return { verified: false, data: businessData };
      } else if (businessData.b_stt_cd === "03") { // 폐업자
        Swal.fire({
          title: '폐업 상태',
          text: `해당 사업자는 폐업 상태입니다. (폐업일: ${businessData.end_dt})`,
          icon: 'error',
          confirmButtonText: '확인'
        });
        return { verified: false, data: businessData };
      } else {
        Swal.fire({
          title: '확인 필요',
          text: '사업자 상태를 확인할 수 없습니다.',
          icon: 'warning',
          confirmButtonText: '확인'
        });
        return { verified: false, data: businessData };
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('사업자등록번호 인증 오류', errorObj, { companyNumber });
      Swal.fire({
        title: '오류',
        text: '사업자등록번호 인증 중 오류가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '확인'
      });
      return { verified: false };
    } finally {
      setIsVerifyingCompany(false);
    }
  };

  // 아이디 중복 체크 함수
  const checkUsernameDuplicate = async (username: string) => {
    try {
      setIsCheckingUsername(true);
      
      // 입력값 검증
      if (!username || username.trim() === '') {
        Swal.fire({
          title: '알림',
          text: '아이디를 입력해주세요.',
          icon: 'warning',
          confirmButtonText: '확인'
        });
        return { isDuplicate: false, available: false };
      }
      
      // AuthRepository를 사용하여 아이디 중복 체크 API 호출
      const response = await AuthRepository.checkUsernameDuplicate(username);
      
      if (response.code === "0") {
        // 중복되지 않음 (사용 가능)
        Swal.fire({
          title: '사용 가능',
          text: '사용 가능한 아이디입니다.',
          icon: 'success',
          confirmButtonText: '확인'
        });
        return { isDuplicate: false, available: true };
      } else {
        // 중복됨 (사용 불가)
        Swal.fire({
          title: '중복된 아이디',
          text: '이미 사용 중인 아이디입니다.',
          icon: 'error',
          confirmButtonText: '확인'
        });
        return { isDuplicate: true, available: false };
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('아이디 중복 체크 오류', errorObj, { username });
      Swal.fire({
        title: '오류',
        text: '아이디 중복 체크 중 오류가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '확인'
      });
      return { isDuplicate: false, available: false };
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // 회원가입 처리 함수
  const join = async (reqDto: JoinRequest) => {
    try {
      setIsPendingJoin(true); // 회원가입 진행 중 상태로 변경

      // 전송되는 데이터 로깅 (개발용)
      console.log("useAuthJoinViewModelLocal - 전송 데이터:", reqDto);

      // AuthRepository를 사용하여 회원가입 API 호출 (localhost:8081/v1/auth/join)
      const response = await AuthRepository.postJoin(reqDto);

      if (response.code !== "0") {
        
        // 에러 코드에 따른 처리
        if (response.data && response.data.code === -3) {
          toast.error(Object.keys(response.data).map((key) => response.data[key]).join("\n"));
          return;
        } else {
          throw new Error(response.message || '회원가입 실패');
        }
      }

      if (response.code === "0") {
        Swal.fire({
          title: '회원가입 완료',
          text: response.message || '회원가입이 완료되었습니다.',
          icon: 'success',
          confirmButtonText: '확인'
        });
        
        // 로그인 페이지로 리다이렉트
        router.push('/');
        router.refresh();
      } else {
        throw new Error(response.message || '회원가입 실패');
      } 
    } catch (error: unknown) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error("useAuthJoinViewModelLocal 오류 상세:", error);
      console.error("오류 객체:", errorObj);
      logError('회원가입 오류', errorObj, { 
        userName: reqDto.user?.userName,
        companyName: reqDto.user?.companyName
      }); 
      Swal.fire({
        title: '오류',
        text: errorObj.message || '회원가입 중 오류가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '확인'
      });
    } finally {
      setIsPendingJoin(false); // 회원가입 진행 중 상태 해제
    }
  };

  // 외부에서 사용할 수 있는 기능 제공
  return {
    join,
    verifyCompanyNumber,
    checkUsernameDuplicate,
    isPendingJoin,
    isVerifyingCompany,
    isCheckingUsername
  };
} 
