package kr.co.nomadlab.dplog.common.exception;

import kr.co.nomadlab.dplog.common.dto.ResDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.Map;
import java.util.stream.Collectors;

/**
 * 글로벌 예외 핸들러
 * - 정적 리소스 404 → 조용히 처리 (favicon.ico 등)
 * - 비즈니스 예외 → ResDTO 에러 응답
 * - Validation 예외 → 필드별 에러 메시지
 * - 미처리 예외 → 500 Internal Server Error
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** 정적 리소스 없음 (favicon.ico 등) → 404, 로그 없이 조용히 처리 */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Void> handleNoResourceFound(NoResourceFoundException ex) {
        return ResponseEntity.notFound().build();
    }

    /** 비즈니스 예외 처리 */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ResDTO<Void>> handleBusinessException(BusinessException ex) {
        log.warn("비즈니스 예외 발생: code={}, message={}", ex.getCode(), ex.getMessage());
        HttpStatus status = HttpStatus.resolve(ex.getHttpStatus());
        if (status == null) {
            status = HttpStatus.BAD_REQUEST;
        }
        return ResponseEntity.status(status)
                .body(ResDTO.fail(ex.getCode(), ex.getMessage()));
    }

    /** Validation 예외 처리 (@Valid 검증 실패) */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ResDTO<Void>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        error -> error.getField(),
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "유효하지 않은 값",
                        (a, b) -> a
                ));

        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        log.warn("Validation 실패: {}", message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ResDTO.fail("VALIDATION_ERROR", message, fieldErrors));
    }

    /** 미처리 예외 (500) */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ResDTO<Void>> handleUnexpectedException(Exception ex) {
        log.error("예상치 못한 오류 발생", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ResDTO.fail("INTERNAL_ERROR", "서버 내부 오류가 발생했습니다."));
    }
}
