package kr.co.nomadlab.nomadrank.util;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Component;

import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 구독 해지 환불 계산기
 */
@Component
@RequiredArgsConstructor
public class RefundCalculator extends AbstractSubscriptionCalculator {

    public Result calculate(SubscriptionEntity subscription,
            MembershipEntity membership,
            LocalDate cancelDate,
            boolean hasUsageActivity) {

        if (subscription == null) {
            return Result.notEligible("구독 정보를 찾을 수 없습니다.");
        }

        LocalDate startDate = subscription.getStartDate() != null ? subscription.getStartDate() : cancelDate;
        if (startDate == null) {
            startDate = LocalDate.now();
        }

        LocalDate effectiveCancelDate = cancelDate != null ? cancelDate : LocalDate.now();
        if (effectiveCancelDate.isBefore(startDate)) {
            effectiveCancelDate = startDate;
        }

        BillingCycle billingCycle = subscription.getBillingCycle() != null
                ? subscription.getBillingCycle()
                : BillingCycle.MONTHLY;

        long totalCycleDays = resolveCycleDays(startDate, subscription.getNextBillingDate(), billingCycle);
        long usedDays = Math.min(Math.max(ChronoUnit.DAYS.between(startDate, effectiveCancelDate), 0), totalCycleDays);
        long remainingDays = Math.max(totalCycleDays - usedDays, 0);

        BigDecimal paidAmount = subscription.getAmount() != null ? subscription.getAmount() : BigDecimal.ZERO;

        // 정책 변경: 해지 시 환불 없음(잔여 기간은 이용 가능)
        return Result.notEligible("구독 해지 시 환불은 제공되지 않으며, 결제 주기 종료일까지 이용 가능합니다.",
                usedDays, remainingDays, paidAmount);
    }

    @Getter
    public static class Result {
        private final boolean eligible;
        private final boolean fullRefund;
        private final BigDecimal refundableAmount;
        private final BigDecimal paidAmount;
        private final long usedDays;
        private final long remainingDays;
        private final String policyMessage;

        private Result(boolean eligible,
                boolean fullRefund,
                BigDecimal refundableAmount,
                BigDecimal paidAmount,
                long usedDays,
                long remainingDays,
                String policyMessage) {
            this.eligible = eligible;
            this.fullRefund = fullRefund;
            this.refundableAmount = refundableAmount;
            this.paidAmount = paidAmount;
            this.usedDays = usedDays;
            this.remainingDays = remainingDays;
            this.policyMessage = policyMessage;
        }

        public static Result fullRefund(BigDecimal paidAmount, long usedDays, long remainingDays, String message) {
            return new Result(true, true, paidAmount, paidAmount, usedDays, remainingDays, message);
        }

        public static Result notEligible(String message) {
            return new Result(false, false, BigDecimal.ZERO, BigDecimal.ZERO, 0, 0, message);
        }

        public static Result notEligible(String message, long usedDays, long remainingDays, BigDecimal paidAmount) {
            return new Result(false, false, BigDecimal.ZERO, paidAmount, usedDays, remainingDays, message);
        }

        public boolean shouldRefund() {
            return eligible && refundableAmount != null && refundableAmount.signum() > 0;
        }
    }
}
