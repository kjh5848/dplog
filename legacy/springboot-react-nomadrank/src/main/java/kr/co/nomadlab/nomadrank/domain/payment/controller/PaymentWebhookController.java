package kr.co.nomadlab.nomadrank.domain.payment.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import kr.co.nomadlab.nomadrank.config.PortOneV2Config;
import kr.co.nomadlab.nomadrank.domain.payment.service.PaymentWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

/**
 * 포트원 웹훅 처리 컨트롤러
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/webhooks")
public class PaymentWebhookController {
    
    private final PaymentWebhookService webhookService;
    private final PortOneV2Config config;
    private final ObjectMapper objectMapper;
    
    /**
     * 포트원 웹훅 수신
     */
    @PostMapping("/portone")
    public ResponseEntity<String> handlePortOneWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Authorization", required = false) String signature) {
        
        try {
            log.info("포트원 웹훅 수신 - 페이로드 길이: {}", payload != null ? payload.length() : 0);
            
            // 웹훅 서명 검증
            if (!validateWebhookSignature(payload, signature)) {
                log.warn("웹훅 서명 검증 실패");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("SIGNATURE_INVALID");
            }
            
            // JSON 파싱
            JsonNode webhookData = objectMapper.readTree(payload);
            String type = webhookData.path("type").asText();
            JsonNode data = webhookData.path("data");
            
            log.info("웹훅 타입: {}, 데이터: {}", type, data.toString());
            
            // 웹훅 타입별 처리
            switch (type) {
                case "Transaction.Paid":
                case "Payment.Paid":
                    webhookService.handlePaymentPaid(data);
                    break;
                    
                case "Transaction.Failed":
                case "Payment.Failed":
                    webhookService.handlePaymentFailed(data);
                    break;
                    
                case "Transaction.Cancelled":
                case "Payment.Cancelled":
                    webhookService.handlePaymentCancelled(data);
                    break;
                    
                case "BillingKey.Issued":
                    webhookService.handleBillingKeyIssued(data);
                    break;
                    
                case "BillingKey.Deleted":
                    webhookService.handleBillingKeyDeleted(data);
                    break;
                    
                default:
                    log.warn("처리되지 않은 웹훅 타입: {}", type);
                    return ResponseEntity.ok("IGNORED");
            }
            
            return ResponseEntity.ok("SUCCESS");
            
        } catch (Exception e) {
            log.error("웹훅 처리 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("ERROR");
        }
    }
    
    /**
     * 웹훅 서명 검증
     */
    private boolean validateWebhookSignature(String payload, String signature) {
        try {
            if (signature == null || payload == null) {
                log.warn("서명 또는 페이로드가 null입니다");
                return false;
            }
            
            // "PortOne " 접두사 제거
            String actualSignature = signature.startsWith("PortOne ") ? 
                signature.substring(8) : signature;
            
            // HMAC-SHA256으로 서명 생성
            String webhookSecret = config.getV2().getWebhookSecret();
            if (webhookSecret == null) {
                log.warn("웹훅 시크릿이 설정되지 않았습니다");
                return false;
            }
            
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = Base64.getEncoder().encodeToString(hash);
            
            // 서명 비교
            boolean isValid = expectedSignature.equals(actualSignature);
            
            if (!isValid) {
                log.warn("서명 불일치 - 예상: {}, 실제: {}", expectedSignature, actualSignature);
            }
            
            return isValid;
            
        } catch (Exception e) {
            log.error("웹훅 서명 검증 중 오류", e);
            return false;
        }
    }
    
    /**
     * 웹훅 테스트용 엔드포인트 (개발 환경에서만 사용)
     */
    @PostMapping("/portone/test")
    public ResponseEntity<String> testWebhook(@RequestBody String payload) {
        log.info("웹훅 테스트 - 페이로드: {}", payload);
        return ResponseEntity.ok("TEST_SUCCESS");
    }
}