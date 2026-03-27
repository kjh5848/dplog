package kr.co.nomadlab.nomadrank.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.stereotype.Component;

import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 구독 업그레이드 차액 계산기
 */
@Component
@RequiredArgsConstructor
public class UpgradeCalculator extends AbstractSubscriptionCalculator {

    public Result calculate(SubscriptionEntity currentSubscription,
            MembershipEntity targetMembership,
            BillingCycle billingCycle,
            LocalDate today) {

        if (today.isBefore(currentSubscription.getStartDate())) {
            today = currentSubscription.getStartDate();
        }

        LocalDate nextBillingDate = currentSubscription.getNextBillingDate();
        if (nextBillingDate == null) {
            throw new BadRequestException("다음 결제 예정일을 확인할 수 없습니다.");
        }

        BillingCycle currentCycle = currentSubscription.getBillingCycle();
        if (currentCycle == billingCycle) {
            return calculateSameCycle(currentSubscription, targetMembership, billingCycle, today, nextBillingDate);
        }

        if (currentCycle == BillingCycle.MONTHLY && billingCycle == BillingCycle.YEARLY) {
            return calculateMonthlyToYearly(currentSubscription, targetMembership, today, nextBillingDate);
        }

        if (currentCycle == BillingCycle.YEARLY && billingCycle == BillingCycle.MONTHLY) {
            return calculateYearlyToMonthly(currentSubscription, targetMembership, today, nextBillingDate);
        }

        throw new BadRequestException("지원하지 않는 결제 주기 전환입니다.");
    }

    private Result calculateSameCycle(SubscriptionEntity currentSubscription,
            MembershipEntity targetMembership,
            BillingCycle billingCycle,
            LocalDate today,
            LocalDate nextBillingDate) {
        long remainingDays = Math.max(ChronoUnit.DAYS.between(today, nextBillingDate), 0);

        long cycleDays = resolveCycleDays(currentSubscription.getStartDate(), nextBillingDate, billingCycle);

        BigDecimal currentPlanPrice = currentSubscription.getAmount();
        BigDecimal targetPlanPrice = resolvePlanPrice(targetMembership, billingCycle);

        BigDecimal remainingValue = prorate(currentPlanPrice, cycleDays, remainingDays);
        BigDecimal targetValue = prorate(targetPlanPrice, cycleDays, remainingDays);

        BigDecimal difference = targetValue.subtract(remainingValue);
        if (difference.signum() < 0) {
            difference = BigDecimal.ZERO;
        }

        difference = difference.setScale(0, RoundingMode.HALF_UP);

        String message = remainingDays > 0
                ? String.format("남은 %d일 분에 대해 차액 %s원이 청구됩니다.", remainingDays, difference.toPlainString())
                : "새 플랜으로 즉시 전환됩니다.";

        return new Result(difference, remainingDays, targetPlanPrice, currentPlanPrice, nextBillingDate, message,
                BigDecimal.ZERO);
    }

    private Result calculateMonthlyToYearly(SubscriptionEntity currentSubscription,
            MembershipEntity targetMembership,
            LocalDate today,
            LocalDate nextBillingDate) {
        long remainingDays = Math.max(ChronoUnit.DAYS.between(today, nextBillingDate), 0);
        long monthlyCycleDays = resolveCycleDays(currentSubscription.getStartDate(), nextBillingDate, BillingCycle.MONTHLY);

        BigDecimal currentMonthlyPrice = currentSubscription.getAmount();
        BigDecimal targetYearlyPrice = resolvePlanPrice(targetMembership, BillingCycle.YEARLY);

        BigDecimal remainingValue = prorate(currentMonthlyPrice, monthlyCycleDays, remainingDays);
        BigDecimal difference = targetYearlyPrice.subtract(remainingValue);
        if (difference.signum() < 0) {
            difference = BigDecimal.ZERO;
        }

        difference = difference.setScale(0, RoundingMode.HALF_UP);

        LocalDate yearlyNextBillingDate = today.plusYears(1);
        String message = String.format("연간 플랜으로 전환 - 차액 %s원이 청구됩니다.", difference.toPlainString());

        return new Result(difference, remainingDays, targetYearlyPrice, currentMonthlyPrice, yearlyNextBillingDate,
                message, BigDecimal.ZERO);
    }

    private Result calculateYearlyToMonthly(SubscriptionEntity currentSubscription,
            MembershipEntity targetMembership,
            LocalDate today,
            LocalDate nextBillingDate) {
        long remainingDays = Math.max(ChronoUnit.DAYS.between(today, nextBillingDate), 0);
        long yearlyCycleDays = resolveCycleDays(currentSubscription.getStartDate(), nextBillingDate,
                BillingCycle.YEARLY);

        BigDecimal currentYearlyPrice = currentSubscription.getAmount() != null
                ? currentSubscription.getAmount()
                : resolvePlanPrice(targetMembership, BillingCycle.YEARLY);
        BigDecimal refundableAmount = prorate(currentYearlyPrice, yearlyCycleDays, remainingDays)
                .setScale(0, RoundingMode.HALF_UP);

        BigDecimal targetMonthlyPrice = resolvePlanPrice(targetMembership, BillingCycle.MONTHLY);
        LocalDate monthlyNextBillingDate = today.plusMonths(1);
        String message = String.format("연간 → 월간 상향 전환 - 잔여 %d일 환불 후 월간 %s원이 청구됩니다.",
                remainingDays,
                targetMonthlyPrice.toPlainString());

        return new Result(targetMonthlyPrice,
                remainingDays,
                targetMonthlyPrice,
                currentYearlyPrice,
                monthlyNextBillingDate,
                message,
                refundableAmount);
    }

    @Getter
    public static class Result {
        private final BigDecimal differenceAmount;
        private final long remainingDays;
        private final BigDecimal targetPlanPrice;
        private final BigDecimal currentPlanPrice;
        private final LocalDate nextBillingDate;
        private final String message;
        private final BigDecimal refundableAmount;

        public Result(BigDecimal differenceAmount,
                long remainingDays,
                BigDecimal targetPlanPrice,
                BigDecimal currentPlanPrice,
                LocalDate nextBillingDate,
                String message,
                BigDecimal refundableAmount) {
            this.differenceAmount = differenceAmount;
            this.remainingDays = remainingDays;
            this.targetPlanPrice = targetPlanPrice;
            this.currentPlanPrice = currentPlanPrice;
            this.nextBillingDate = nextBillingDate;
            this.message = message;
            this.refundableAmount = refundableAmount != null ? refundableAmount : BigDecimal.ZERO;
        }

        public BigDecimal getRefundableAmount() {
            return refundableAmount;
        }

        public boolean hasRefundableAmount() {
            return refundableAmount != null && refundableAmount.signum() > 0;
        }
    }
}
