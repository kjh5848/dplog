package kr.co.nomadlab.nomadrank.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;

/**
 * 구독 금액 계산기 공통 기능
 */
public abstract class AbstractSubscriptionCalculator {

    protected long resolveCycleDays(LocalDate startDate, LocalDate nextBillingDate, BillingCycle billingCycle) {
        if (startDate != null && nextBillingDate != null) {
            long days = ChronoUnit.DAYS.between(startDate, nextBillingDate);
            if (days > 0) {
                return days;
            }
        }
        return billingCycle == BillingCycle.YEARLY ? 365 : 30;
    }

    protected BigDecimal prorate(BigDecimal amount, long totalDays, long applicableDays) {
        if (amount == null || totalDays <= 0 || applicableDays <= 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal dailyRate = amount.divide(BigDecimal.valueOf(totalDays), 8, RoundingMode.HALF_UP);
        return dailyRate.multiply(BigDecimal.valueOf(applicableDays));
    }

    protected BigDecimal resolvePlanPrice(MembershipEntity targetMembership, BillingCycle billingCycle) {
        return switch (billingCycle) {
            case MONTHLY -> targetMembership.getPrice();
            case YEARLY -> {
                if (targetMembership.getPriceYearly() == null) {
                    throw new BadRequestException("선택한 멤버십은 연간 요금제를 지원하지 않습니다.");
                }
                yield targetMembership.getPriceYearly();
            }
        };
    }
}
