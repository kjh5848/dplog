import { ApiResponse } from "@/types/api";
import { processApiResponse } from "@/src/utils/api/responseHandler";
import {
  Distributor,
  DistributorListResponse,
  DistributorResponse,
  DistributorCreateDto,
  DistributorUpdateDto,
} from "@/src/types/distributor";

class DistributorRepository {
  static url = "/v1/distributor";
  static apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://api.dplog.kr";

  // 관리자 목록 조회 (ADMIN 권한 필요)
  static async getDistributorList(): Promise<
    ApiResponse<DistributorListResponse>
  > {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/list`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return processApiResponse(response);
  }

  // 특정 관리자 정보 조회
  static async getDistributor(): Promise<ApiResponse<DistributorResponse>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return processApiResponse(response);
  }

  // 관리자 등록 (ADMIN 권한 필요)
  static async createDistributor(
    reqDto: DistributorCreateDto,
  ): Promise<ApiResponse<any>> {
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

  // 관리자 정보 수정
  static async updateDistributor(
    reqDto: DistributorUpdateDto,
  ): Promise<ApiResponse<any>> {
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
}

export default DistributorRepository; 