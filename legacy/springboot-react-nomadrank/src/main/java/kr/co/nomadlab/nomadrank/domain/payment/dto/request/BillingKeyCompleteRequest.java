package kr.co.nomadlab.nomadrank.domain.payment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 빌링키 발급 완료 처리 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingKeyCompleteRequest {

    @NotBlank(message = "결제 ID는 필수입니다")
    private String paymentId;

    @NotBlank(message = "빌링키는 필수입니다")
    private String billingKey;

    @NotBlank(message = "발급 ID는 필수입니다")
    private String issueId;

    private IssueResponse issueResponse;

    @NotBlank(message = "고객 ID는 필수입니다")
    private String customerId;

    @NotBlank(message = "고객 이메일은 필수입니다")
    private String customerEmail;

    @NotBlank(message = "고객명은 필수입니다")
    private String customerName;

    @NotBlank(message = "고객 전화번호는 필수입니다")
    private String customerPhone;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IssueResponse {
        private String code;
        private String message;
        private CardInfo cardInfo;
        private Issue issue;
        private Customer customer;
        private Method method;

        @NoArgsConstructor
        @AllArgsConstructor
        @Data
        @Builder
        public static class CardInfo {
            private String cardType;
            private String issuerName;
            private String bin;
            private String last4Digits;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Issue {
            private String id;
            private String name;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Customer {
            private String id;
            private String name;
            private String email;
            private String phoneNumber;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class Method {
            private Card card;

            @Data
            @Builder
            @NoArgsConstructor
            @AllArgsConstructor
            public static class Card {
                private Credential credential;
                private String issuerName;
                private String type;
                private String brand;

                @Data
                @Builder
                @NoArgsConstructor
                @AllArgsConstructor
                public static class Credential {
                    private String number;
                    private String expiryMonth;
                    private String expiryYear;
                }
            }
        }
    }
}
