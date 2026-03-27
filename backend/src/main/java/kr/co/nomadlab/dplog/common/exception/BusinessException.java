package kr.co.nomadlab.dplog.common.exception;

/**
 * 비즈니스 로직 예외 기본 클래스
 * - code: 에러 코드 문자열 (예: "AUTH_001", "STORE_NOT_FOUND")
 * - httpStatus: HTTP 상태 코드 (예: 400, 401, 404)
 */
public class BusinessException extends RuntimeException {

    private final String code;
    private final int httpStatus;

    public BusinessException(String code, int httpStatus, String message) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
    }

    public BusinessException(String code, int httpStatus, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.httpStatus = httpStatus;
    }

    public String getCode() {
        return code;
    }

    public int getHttpStatus() {
        return httpStatus;
    }

    // 자주 사용되는 비즈니스 예외 팩토리 메서드

    /** 리소스를 찾을 수 없음 (404) */
    public static BusinessException notFound(String message) {
        return new BusinessException("NOT_FOUND", 404, message);
    }

    /** 잘못된 요청 (400) */
    public static BusinessException badRequest(String message) {
        return new BusinessException("BAD_REQUEST", 400, message);
    }

    /** 인증 실패 (401) */
    public static BusinessException unauthorized(String message) {
        return new BusinessException("UNAUTHORIZED", 401, message);
    }

    /** 권한 없음 (403) */
    public static BusinessException forbidden(String message) {
        return new BusinessException("FORBIDDEN", 403, message);
    }

    /** 중복 리소스 (409) */
    public static BusinessException conflict(String message) {
        return new BusinessException("CONFLICT", 409, message);
    }
}
