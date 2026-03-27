package kr.co.nomadlab.nomadrank.domain.payment.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Component;

import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;

/**
 * 단순 일할 기반 프로레이션 계산기
 */
@Component
public class ProrationCalculator {

    public ProrationResult calculate(BigDecimal fromPrice,
            BigDecimal toPrice,
            BillingCycle cycle,
            LocalDate changeDate,
            LocalDate periodEnd) {

        if (fromPrice == null || toPrice == null || changeDate == null || periodEnd == null) {
            return ProrationResult.zero();
        }
        long remainingDays = ChronoUnit.DAYS.between(changeDate, periodEnd);
        long totalDays = totalDays(cycle, changeDate, periodEnd);
        if (remainingDays <= 0 || totalDays <= 0) {
            return ProrationResult.zero();
        }
        BigDecimal remainingRatio = BigDecimal.valueOf(remainingDays)
                .divide(BigDecimal.valueOf(totalDays), 6, RoundingMode.HALF_UP);
        BigDecimal fromCredit = fromPrice.multiply(remainingRatio);
        BigDecimal toCharge = toPrice.multiply(remainingRatio);
        BigDecimal difference = toCharge.subtract(fromCredit);
        return new ProrationResult(remainingDays, totalDays, fromCredit, toCharge, difference);
    }

    public LocalDate periodEnd(SubscriptionEntity subscription) {
        if (subscription.getNextBillingDate() != null) {
            return subscription.getNextBillingDate();
        }
        if (subscription.getBillingCycle() == BillingCycle.YEARLY) {
            return subscription.getStartDate().plusYears(1);
        }
        return subscription.getStartDate().plusMonths(1);
    }

    private long totalDays(BillingCycle cycle, LocalDate start, LocalDate end) {
        if (cycle == BillingCycle.YEARLY) {
            return ChronoUnit.DAYS.between(start.minusYears(1), end);
        }
        return ChronoUnit.DAYS.between(start.minusMonths(1), end);
    }

    public record ProrationResult(long remainingDays, long totalDays, BigDecimal fromCredit, BigDecimal toCharge,
            BigDecimal difference) {
        public static ProrationResult zero() {
            return new ProrationResult(0, 0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }
    }
}
