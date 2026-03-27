import { ApiResponse } from "@/types/api";
import { LoginRequest, JoinRequest } from "@/types/auth";
import { logError, logWarn, logInfo} from '@/src/utils/logger';
import { processApiResponse } from "@/src/utils/api/responseHandler";

// "https://xn--220b334axrd.com"

class AuthRepository {
  static url = "/v1/auth";
  static apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://api.dplog.kr"; // 기본값 제공
  static serviceKey = process.env.NEXT_PUBLIC_BUSINESS_API_KEY || ""; // 사업자등록번호 검증 API 키
  // API 응답을 ApiResponse 형식으로 변환하는 헬퍼 메서드

  static async verifyCompanyNumber(
    companyNumber: string,
  ): Promise<ApiResponse<any>> {
    try {
      // 사업자번호에서 '-' 제거
      const cleanCompanyNumber = companyNumber.replace(/-/g, "");

      const data = {
        b_no: [cleanCompanyNumber], // 사업자번호 배열로 전달
      };

      const response = await fetch(
        `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${this.serviceKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();

      // API 응답 형식에 맞게 변환
      if (result.status_code === "OK") {
        // 데이터가 있는지 확인
        if (result.data && result.data.length > 0) {
          // 성공 응답 반환
          return {
            code: "0",
            message: "사업자등록번호 확인 성공",
            data: result.data[0], // 첫 번째 결과 반환
          };
        } else {
          // 데이터가 없는 경우
          return {
            code: "-1",
            message: "사업자등록번호 정보를 찾을 수 없습니다.",
            data: null,
          };
        }
      } else {
        // API 오류 처리
        return {
          code: "-1",
          message: "사업자등록번호 확인 실패",
          data: result,
        };
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("사업자등록번호 확인 중 오류 발생", errorObj, { operation: 'verifyCompanyNumber' });
      return {
        code: "-1",
        message: "사업자등록번호 확인 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

  // 아이디 중복 체크
  static async checkUsernameDuplicate(username: string): Promise<ApiResponse<any>> {
    try {
      const url = `${this.apiBaseUrl}/v1/user/check-username`;
  
      logInfo("AuthRepository - 아이디 중복 체크 URL", { url });
      logInfo("AuthRepository - 체크할 아이디", { username });
  
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: username, // JSON 오브젝트가 아니라 "문자열"만 보냄
      });
  
      logInfo("AuthRepository - 중복 체크 응답 상태", { status: response.status });
  
      const result = await processApiResponse(response);
      logInfo("AuthRepository - 중복 체크 처리된 응답", { tag: result });
  
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error("Unknown error occurred");
      logError("AuthRepository - 아이디 중복 체크 중 오류 발생", errorObj, {
        operation: "checkUsernameDuplicate",
        username,
      });
  
      return {
        code: "-1",
        message: "아이디 중복 체크 중 오류가 발생했습니다.",
        data: null,
      };
    }
  }

// 회원가입 요청
static async postJoin(reqDto: JoinRequest): Promise<ApiResponse<any>> {
  try {
    logInfo("AuthRepository - 회원가입 요청 URL", {
      url: `${this.apiBaseUrl}/v1/user`,
    });
    logInfo("AuthRepository - 요청 데이터", { reqDto: JSON.parse(JSON.stringify(reqDto)) });
    const response = await fetch(`${this.apiBaseUrl}/v1/user`, {
      method: "POST",
      credentials: "include", // 세션 쿠키 포함
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqDto),
    });

    logInfo("AuthRepository - 응답 상태", { status: response.status });
    logInfo("AuthRepository - 응답 헤더", Object.fromEntries(response.headers.entries()));

    const result = await processApiResponse(response);
    logInfo("AuthRepository - 처리된 응답", { result: JSON.parse(JSON.stringify(result)) });

    return result;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error("Unknown error occurred");
    logError("AuthRepository - postJoin 오류", errorObj, { operation: "postJoin" });
    throw errorObj;
  }
}

  // 로그인 요청 (세션 기반)
  static async postLogin(reqDto: LoginRequest): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        // 이미 로그인된 세션이 있다면 전송
        ...(document.cookie && { Cookie: document.cookie }),
      },
      body: JSON.stringify({ user: reqDto }),
    });

    return processApiResponse(response);
  }

  // 인증 상태 확인 (세션 쿠키를 사용한 인증 확인)
  static async checkAuth(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}${this.url}/info`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });

      // 응답 헤더 로깅
      logInfo('서버 응답 헤더:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // 새로운 세션 ID가 발급되면 경고
      const setCookie = response.headers.get("set-cookie");
      if (setCookie && setCookie.includes("JSESSIONID")) {
        logWarn("서버가 새로운 세션 ID를 발급했습니다", { setCookie });
      }

      return processApiResponse(response, true);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("인증 확인 중 에러 발생", errorObj, { operation: 'checkAuth' });
      throw error;
    }
  }

  // 로그아웃 요청 (세션 쿠키 제거)
  static async logout(): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/logout`, {
      method: "POST",
      credentials: "include", // 세션 쿠키를 포함하기 위해 필요
    });

    return processApiResponse(response);
  }

  // 세션 목록 조회
  static async sessionList(): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/session`, {
      method: "GET",
      credentials: "include", // 세션 쿠키를 포함하기 위해 필요
    });

    return processApiResponse(response);
  }
}

export default AuthRepository;