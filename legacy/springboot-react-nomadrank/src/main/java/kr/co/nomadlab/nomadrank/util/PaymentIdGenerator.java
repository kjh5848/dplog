package kr.co.nomadlab.nomadrank.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.stereotype.Component;

/**
 * PortOne 결제 ID 생성기
 */
@Component
public class PaymentIdGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.BASIC_ISO_DATE;

    public String generate(Long userId, LocalDate scheduleDate) {
        String normalizedDate = scheduleDate != null
                ? scheduleDate.format(DATE_FORMATTER)
                : LocalDate.now().format(DATE_FORMATTER);
        String userPart = userId != null ? String.valueOf(userId) : "anon";
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        return String.format("payment-%s-%s-%s", userPart, normalizedDate, randomPart);
    }
}
