package kr.co.nomadlab.nomadrank.domain.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * ✅ 빌링키 발급 결과 및 카드 정보 DTO
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BillingKeyInfoResponse {

    private String issueId; // 포트원 발급 이슈 ID
    private String billingKey; // 발급된 빌링키
    private String status; // 상태 (ACTIVE, FAILED 등)
    private CardInfo cardInfo; // 카드 정보

    @Getter
    @Builder
    public static class CardInfo {
        private String maskedNumber; // 마스킹된 카드번호 (ex: 1234-****-****-5678)
        private String issuerName; // 카드사 이름
        private String cardType; // 카드 종류 (신용/체크)
        private String brand; // 브랜드 (VISA, MASTER 등)
    }

}