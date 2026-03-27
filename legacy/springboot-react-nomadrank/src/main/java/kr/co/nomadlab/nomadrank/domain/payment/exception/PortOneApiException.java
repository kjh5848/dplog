package kr.co.nomadlab.nomadrank.domain.payment.exception;

import lombok.Getter;

/**
 * 포트원 V2 API 호출 중 발생한 오류 정보를 보관하는 예외
 */
@Getter
public class PortOneApiException extends RuntimeException {

    private final int statusCode;
    private final String errorCode;

    public PortOneApiException(int statusCode, String errorCode, String message) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }

    public PortOneApiException(int statusCode, String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
    }
}
