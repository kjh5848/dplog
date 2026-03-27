package kr.co.nomadlab.nomadrank.domain.subscription.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentScheduleInfo;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionScheduleStatus;
import kr.co.nomadlab.nomadrank.domain.payment.service.RecurringPaymentScheduleService;
import kr.co.nomadlab.nomadrank.domain.subscription.enums.SubscriptionEventType;
import kr.co.nomadlab.nomadrank.domain.subscription.service.SubscriptionEventProcessor;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * PortOne 정기결제 예약 동기화 서비스
 * - scheduleId 기준 PortOne 예약 상태를 주기적으로 조회해 로컬 상태를 갱신
 * - 예약 누락/실패를 감지해 플래그 설정
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionScheduleSyncService {

    private final SubscriptionRepository subscriptionRepository;
    private final RecurringPaymentScheduleService recurringPaymentScheduleService;
    private final SubscriptionEventProcessor subscriptionEventProcessor;

    /**
     * 30분마다 예약 싱크 (운영 필요에 따라 주기 조정)
     */
    @Scheduled(cron = "0 */30 * * * *", zone = "Asia/Seoul")
    @Transactional
    public void syncSchedules() {
        List<SubscriptionEntity> targets = subscriptionRepository
                .findByScheduleIdIsNotNullAndStatusIn(List.of(
                        kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionStatus.ACTIVE,
                        kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionStatus.PENDING,
                        kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionStatus.PENDING_CANCEL));

        log.info("[ScheduleSync] 대상 구독 수: {}", targets.size());

        for (SubscriptionEntity subscription : targets) {
            String scheduleId = subscription.getScheduleId();
            try {
                var scheduleInfoOpt = recurringPaymentScheduleService.fetchSchedule(scheduleId);
                if (scheduleInfoOpt.isEmpty()) {
                    recurringPaymentScheduleService.recordMissingScheduleEvent(scheduleId, subscription);
                    subscriptionEventProcessor.processEvent(
                            "schedule-missing-" + scheduleId,
                            subscription.getSubscriptionId(),
                            subscription.getStatus(),
                            SubscriptionEventType.SCHEDULE_DELETED,
                            "SCHEDULER",
                            scheduleId,
                            () -> {
                                subscription.setScheduleStatus(SubscriptionScheduleStatus.MISSING);
                                subscription.setScheduleLastSyncedAt(OffsetDateTime.now());
                                subscriptionRepository.save(subscription);
                                log.warn("[ScheduleSync] 예약 미존재 - subscriptionId={} scheduleId={}",
                                        subscription.getSubscriptionId(), scheduleId);
                                return subscription.getStatus();
                            });
                    continue;
                }

                PaymentScheduleInfo info = scheduleInfoOpt.get();
                SubscriptionScheduleStatus status = normalizeStatus(info.getStatus());
                subscriptionEventProcessor.processEvent(
                        "schedule-sync-" + scheduleId + "-" + status,
                        subscription.getSubscriptionId(),
                        subscription.getStatus(),
                        SubscriptionEventType.SCHEDULE_CREATED,
                        "SCHEDULER",
                        scheduleId,
                        () -> {
                            subscription.setScheduleStatus(status);
                            if (info.getScheduleAt() != null) {
                                subscription.setNextBillingAt(info.getScheduleAt());
                                subscription.setNextBillingDate(info.getScheduleAt().toLocalDate());
                            }
                            subscription.setScheduleLastSyncedAt(OffsetDateTime.now());
                            subscriptionRepository.save(subscription);
                            return subscription.getStatus();
                        });
            } catch (Exception ex) {
                log.error("[ScheduleSync] 예약 조회 실패 - subscriptionId={} scheduleId={}",
                        subscription.getSubscriptionId(), scheduleId, ex);
            }
        }
    }

    private SubscriptionScheduleStatus normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return SubscriptionScheduleStatus.UNKNOWN;
        }
        return switch (status.toUpperCase()) {
            case "PENDING" -> SubscriptionScheduleStatus.PENDING;
            case "SCHEDULED", "EXECUTABLE" -> SubscriptionScheduleStatus.CONFIRMED;
            case "FAILED" -> SubscriptionScheduleStatus.FAILED;
            case "CANCELLED" -> SubscriptionScheduleStatus.CANCELLED;
            default -> SubscriptionScheduleStatus.UNKNOWN;
        };
    }
}
