package kr.co.nomadlab.nomadrank.util;

import java.util.HashMap;
import java.util.Map;

import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public final class PaymentUtils {

    private PaymentUtils() {
    }

    /**
     * 카드 번호 문자열을 마스킹된 형태로 변환합니다. 예: 1234567890123456 → ****-****-****-3456
     */
    public static String maskCardNumber(String number) {
        if (number == null || number.length() < 4) {
            return "****";
        }
        String last4 = number.substring(number.length() - 4);
        return "****-****-****-" + last4;
    }

    /**
     * 로그 기록용으로 빌링키를 일부만 마스킹합니다. 예: abcd1234efgh5678 → abcd****5678
     */
    public static String maskBillingKey(String billingKey) {
        if (billingKey == null || billingKey.length() < 8) {
            return "****";
        }
        return billingKey.substring(0, 4) + "****" + billingKey.substring(billingKey.length() - 4);
    }

    /**
     * 마스킹된 카드 번호에서 마지막 4자리 숫자를 추출합니다.
     */
    public static String extractLast4Digits(String maskedCardNumber) {
        if (maskedCardNumber == null || maskedCardNumber.length() < 4) {
            return "****";
        }

        String[] parts = maskedCardNumber.split("-");
        if (parts.length > 0) {
            String lastPart = parts[parts.length - 1];
            return lastPart.length() == 4 ? lastPart : "****";
        }

        return maskedCardNumber.substring(maskedCardNumber.length() - 4);
    }

    /**
     * PortOne 결제 요청에 사용할 고객 정보를 구성합니다.
     */
    public static Map<String, Object> buildCustomerPayload(UserEntity user) {
        Map<String, Object> customer = new HashMap<>();

        String name = user.getName();
        if (name == null || name.isBlank()) {
            name = user.getUsername() != null ? user.getUsername() : "NomadRank 사용자";
        }

        String email = user.getEmail();
        if (email == null || email.isBlank()) {
            String base = user.getUsername() != null ? user.getUsername() : ("user" + user.getId());
            email = base + "@nomadrank.local";
        }

        String phoneNumber = user.getTel();
        if (phoneNumber == null || phoneNumber.isBlank()) {
            phoneNumber = "01000000000";
        }

        customer.put("id", "customer_" + user.getId());
        customer.put("name", Map.of("full", name));
        customer.put("email", email);
        customer.put("phoneNumber", phoneNumber);

        log.info("PortOne 고객 정보 구성 - userId={}, nameFull={}, email={}, phoneNumber={}",
                user.getId(), name, email, phoneNumber);

        return customer;
    }
}
