/**
 * [Role]   N-BLOG API 통신 Repository
 * [Input]  블로그 URL 검색 요청
 * [Output] 블로그 노출 상태 응답
 * [NOTE]   Pure Fn · Async · API 통신
 */

import { ApiResponse } from "@/types/api";
import { logError } from '@/src/utils/logger';
import { processApiResponse } from "@/src/utils/api/responseHandler";
import {
  NBlogSearchRequest,
  NBlogSearchResponse,
  NBlogBatchRequest,
  NBlogBatchResponse
} from "@/types/nblog";

class NBlogRepository {
  private baseUrl = "https://43.202.80.13/v1/nblog";

  /**
   * 단일 블로그 URL 노출 상태 조회
   */
  async checkSearchable(url: string): Promise<ApiResponse<NBlogSearchResponse>> {
    const requestBody: NBlogSearchRequest = {
      nblog: { url }
    };

    try {
      const response = await fetch(`${this.baseUrl}/searchable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      return await processApiResponse<NBlogSearchResponse>(response);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("N-BLOG API 호출 실패", errorObj, { operation: 'checkSearchable', url });
      throw new Error("블로그 노출 상태 조회에 실패했습니다.");
    }
  }

  /**
   * 여러 블로그 URL 노출 상태 일괄 조회
   */
  async checkSearchableBatch(urls: string[]): Promise<ApiResponse<NBlogBatchResponse>> {
    try {
      // 각 URL에 대해 순차적으로 요청
      const results: NBlogSearchResponse[] = [];
      
      for (const url of urls) {
        try {
          const result = await this.checkSearchable(url);
          if (result.code === "0" && result.data) {
            results.push(result.data);
          } else {
            // 실패한 경우 기본 응답 생성
            results.push({
              nblog: {
                url,
                searchable: false,
                reason: "API 호출 실패"
              }
            });
          }
        } catch (error) {
          // 개별 URL 실패 시 기본 응답 생성
          results.push({
            nblog: {
              url,
              searchable: false,
              reason: "요청 처리 중 오류 발생"
            }
          });
        }
      }

      return {
        code: "0",
        message: "success",
        data: { results }
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("N-BLOG 배치 API 호출 실패", errorObj, { operation: 'checkSearchableBatch', urlCount: urls.length });
      throw new Error("블로그 노출 상태 일괄 조회에 실패했습니다.");
    }
  }

  /**
   * URL 유효성 검사
   */
  validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('blog.naver.com') || 
             urlObj.hostname.includes('naver.com');
    } catch {
      return false;
    }
  }

  /**
   * URL 정규화
   */
  normalizeUrl(url: string): string {
    let normalizedUrl = url.trim();
    
    // http:// 또는 https://가 없는 경우 추가
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    return normalizedUrl;
  }
}
const nBlogRepository = new NBlogRepository();
export default nBlogRepository;