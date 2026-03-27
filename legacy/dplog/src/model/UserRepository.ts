import { ApiResponse } from "@/types/api";
import { processApiResponse } from "@/src/utils/api/responseHandler";
import {
  User,
  UserMembership,
  UserListResponse,
  UserCompleteDto,
  UserWithdrawDto,
  UserUpdateDto,
  UserUpdateDistributorDto,
  UserAuthorityUpdateDto,
  MembershipListRequestDto,
  SaveUserMembershipDto,
  UserCreateDto
} from "@/src/types/user";

class UserRepository {
  static url = "/v1/user";
  static apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.dplog.kr";

  // 사용자 목록 조회 (관리자만)
  static async getUserList(): Promise<ApiResponse<UserListResponse>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/list`, {    
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return processApiResponse(response);
  }

  // 특정 사용자 정보 조회
  static async getUser(): Promise<ApiResponse<User>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return processApiResponse(response);
  }

  // 사용자 등록 - 새로 추가
  static async createUser(reqDto: UserCreateDto): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqDto),
    });

    return processApiResponse(response);
  }

  // 사용자 승인 처리 - 백엔드 API와 맞는 형태로 수정
  static async completeUser(reqDto: UserCompleteDto): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/complete`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqDto),
    });

    return processApiResponse(response);
  }

  // 사용자 정지 처리 - 백엔드 API와 맞는 형태로 수정
  static async withdrawUser(reqDto: UserWithdrawDto): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/withdraw`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqDto),
    });

    return processApiResponse(response);
  }

  // 사용자 정보 수정
  static async updateUser(reqDto: UserUpdateDto): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqDto),
    });

    return processApiResponse(response);
  }

  // 사용자 권한 변경
  static async updateUserAuthority(userId: number, reqDto: UserAuthorityUpdateDto): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/${userId}/authority`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqDto),
    });

    return processApiResponse(response);
  }

  // 사용자 판매점 변경 - 원본 API 형태에 맞춤
  static async updateDistributor(reqDto: UserUpdateDistributorDto): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/distributor`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqDto),
    });

    return processApiResponse(response);
  }

  // 멤버십 목록 조회
  static async getMembershipList(reqDto: MembershipListRequestDto): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}/v1/membership/list`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqDto),
    });

    return processApiResponse(response);
  }

  // 사용자 멤버십 조회
  static async getUserMemberships(userId: number): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/${userId}/membership`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return processApiResponse(response);
  }

  // 사용자 멤버십 추가
  static async saveUserMembership(userId: number, reqDto: SaveUserMembershipDto): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/${userId}/membership`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqDto),
    });

    return processApiResponse(response);
  }

  // 사용자 멤버십 토글 (활성화/비활성화)
  static async toggleUserMembership(userId: number, membershipUserId: number): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/${userId}/membership/${membershipUserId}`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return processApiResponse(response);
  }
}

export default UserRepository;
