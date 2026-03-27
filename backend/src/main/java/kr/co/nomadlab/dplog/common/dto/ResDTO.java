package kr.co.nomadlab.dplog.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

/**
 * 공통 API 응답 래퍼 (프론트엔드 호환)
 *
 * 프론트엔드 ResDTO<T> 형식:
 * { success: boolean, data: T, error?: ApiErrorResponse, timestamp: string }
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ResDTO<T>(
        boolean success,
        T data,
        ApiErrorResponse error,
        String timestamp
) {

    /** 에러 응답 구조체 */
    public record ApiErrorResponse(
            String code,
            String message,
            Object details
    ) {}

    // ─── 성공 응답 ─────────────────────────────

    /** 성공 응답 (데이터 포함) */
    public static <T> ResDTO<T> ok(T data) {
        return new ResDTO<>(true, data, null, Instant.now().toString());
    }

    /** 성공 응답 (데이터 없음) */
    public static <T> ResDTO<T> ok() {
        return new ResDTO<>(true, null, null, Instant.now().toString());
    }

    // ─── 에러 응답 ─────────────────────────────

    /** 에러 응답 */
    public static <T> ResDTO<T> fail(String code, String message) {
        return new ResDTO<>(false, null, new ApiErrorResponse(code, message, null), Instant.now().toString());
    }

    /** 에러 응답 (상세 정보 포함) */
    public static <T> ResDTO<T> fail(String code, String message, Object details) {
        return new ResDTO<>(false, null, new ApiErrorResponse(code, message, details), Instant.now().toString());
    }
}
