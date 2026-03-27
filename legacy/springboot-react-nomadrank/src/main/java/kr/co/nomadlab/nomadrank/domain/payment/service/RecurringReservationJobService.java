package kr.co.nomadlab.nomadrank.domain.payment.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.nomadlab.nomadrank.config.PaymentSchedulerProperties;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentScheduleInfo;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionStatus;
import kr.co.nomadlab.nomadrank.model.payment.entity.BillingKeyEntity;
import kr.co.nomadlab.nomadrank.model.payment.repository.BillingKeyRepository;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionRepository;
import kr.co.nomadlab.nomadrank.util.PaymentIdGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecurringReservationJobService {

    private final SubscriptionRepository subscriptionRepository;
    private final BillingKeyRepository billingKeyRepository;
    private final RecurringPaymentScheduleService recurringPaymentScheduleService;
    private final PaymentIdGenerator paymentIdGenerator;
    private final PaymentSchedulerProperties schedulerProperties;

    @Transactional(readOnly = true)
    public void ensureUpcomingReservations(LocalDate today) {
        LocalDate startDate = today.plusDays(schedulerProperties.getInspectStartDays());
        LocalDate endDate = today.plusDays(schedulerProperties.getInspectEndDays());
        List<SubscriptionEntity> candidates = subscriptionRepository.findSubscriptionsInDateRange(
                startDate, endDate, SubscriptionStatus.ACTIVE);

        int createdCount = 0;
        for (SubscriptionEntity subscription : candidates) {
            if (createReservationIfMissing(subscription)) {
                createdCount++;
            }
        }

        log.info("[ReservationScheduler] 예정 예약 검증 완료 - window={}~{}, total={}, created={}",
                startDate, endDate, candidates.size(), createdCount);
    }

    @Transactional(readOnly = true)
    public void recoverOverdueReservations(LocalDate today) {
        LocalDate startDate = today.minusDays(1);
        LocalDate endDate = today;
        List<SubscriptionEntity> overdueSubscriptions = subscriptionRepository.findSubscriptionsInDateRange(
                startDate, endDate, SubscriptionStatus.ACTIVE);

        int recovered = 0;
        for (SubscriptionEntity subscription : overdueSubscriptions) {
            if (createReservationIfMissing(subscription)) {
                recovered++;
            }
        }

        if (recovered > 0) {
            log.warn("[ReservationScheduler] 지연 예약 복구 완료 - processed={}, recovered={}",
                    overdueSubscriptions.size(), recovered);
        }
    }

    private boolean createReservationIfMissing(SubscriptionEntity subscription) {
        if (subscription.getNextBillingDate() == null) {
            return false;
        }

        Optional<BillingKeyEntity> billingKeyOptional = billingKeyRepository
                .findByIssueIdAndUserId(subscription.getIssueId(), subscription.getUserId());

        if (billingKeyOptional.isEmpty()) {
            log.warn("[ReservationScheduler] 빌링키 없음 - subscriptionId={}, issueId={}",
                    subscription.getSubscriptionId(), subscription.getIssueId());
            return false;
        }

        BillingKeyEntity billingKey = billingKeyOptional.get();
        if (!billingKey.isUsable()) {
            log.warn("[ReservationScheduler] 비활성 빌링키 - issueId={} status={}", billingKey.getIssueId(),
                    billingKey.getStatus());
            return false;
        }

        OffsetDateTime targetScheduleAt = recurringPaymentScheduleService
                .toOffsetDateTime(subscription.getNextBillingDate());

        Optional<PaymentScheduleInfo> existingSchedule = recurringPaymentScheduleService
                .fetchSchedule(subscription.getSubscriptionId());

        if (existingSchedule.isPresent()) {
            PaymentScheduleInfo schedule = existingSchedule.get();
            if (schedule.getScheduleAt() != null
                    && schedule.getScheduleAt().toLocalDate().isEqual(subscription.getNextBillingDate())) {
                return false;
            }
        }

        String paymentId = paymentIdGenerator.generate(subscription.getUserId(), subscription.getNextBillingDate());
        Map<String, Object> customerPayload = Map.of("id", "customer_" + subscription.getUserId());

        try {
            recurringPaymentScheduleService.createReservation(
                    billingKey,
                    paymentId,
                    subscription.getAmount(),
                    "KRW",
                    targetScheduleAt,
                    subscription.getMembershipName(),
                    customerPayload);
            log.info("[ReservationScheduler] 예약 생성 - subscriptionId={}, paymentId={}, scheduleAt={}",
                    subscription.getSubscriptionId(), paymentId, targetScheduleAt);
            return true;
        } catch (Exception ex) {
            log.error("[ReservationScheduler] 예약 생성 실패 - subscriptionId={}, paymentId={}, message={}",
                    subscription.getSubscriptionId(), paymentId, ex.getMessage(), ex);
            return false;
        }
    }
}
