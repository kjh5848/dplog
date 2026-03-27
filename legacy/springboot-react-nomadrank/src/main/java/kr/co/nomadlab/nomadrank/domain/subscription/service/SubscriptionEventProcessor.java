package kr.co.nomadlab.nomadrank.domain.subscription.service;

import java.util.EnumMap;
import java.util.Map;
import java.util.function.Supplier;

import org.springframework.stereotype.Service;

import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionStatus;
import kr.co.nomadlab.nomadrank.domain.subscription.enums.SubscriptionEventType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 구독 상태 전이 및 멱등 처리기
 * - 이벤트 → 상태 전이 허용 여부를 검사하고, 멱등 로그를 기록한다.
 * - 실제 비즈니스 액션은 caller의 action supplier에서 실행한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionEventProcessor {

    private final SubscriptionEventLogService eventLogService;

    private static final Map<SubscriptionStatus, Map<SubscriptionEventType, SubscriptionStatus>> TRANSITIONS =
            buildTransitions();

    public boolean isDuplicate(String eventId) {
        return eventLogService.alreadyProcessed(eventId);
    }

    public SubscriptionStatus processEvent(String eventId,
            String subscriptionId,
            SubscriptionStatus currentStatus,
            SubscriptionEventType eventType,
            String source,
            String payloadHash,
            Supplier<SubscriptionStatus> action) {

        if (eventLogService.alreadyProcessed(eventId)) {
            log.debug("[SubscriptionEvent] Duplicate event ignored eventId={}", eventId);
            return currentStatus;
        }

        eventLogService.recordReceived(eventId, subscriptionId, eventType, source, payloadHash);

        try {
            SubscriptionStatus nextStatus = resolveNextStatus(currentStatus, eventType);
            SubscriptionStatus resultStatus = action != null ? action.get() : nextStatus;
            eventLogService.markProcessed(eventId);
            return resultStatus;
        } catch (RuntimeException ex) {
            eventLogService.markFailed(eventId, ex.getMessage());
            throw ex;
        }
    }

    private SubscriptionStatus resolveNextStatus(SubscriptionStatus currentStatus, SubscriptionEventType eventType) {
        Map<SubscriptionEventType, SubscriptionStatus> nextMap = TRANSITIONS.get(currentStatus);
        if (nextMap == null || !nextMap.containsKey(eventType)) {
            throw new BadRequestException("허용되지 않은 상태 전이입니다. current=%s, event=%s"
                    .formatted(currentStatus, eventType));
        }
        return nextMap.get(eventType);
    }

    private static Map<SubscriptionStatus, Map<SubscriptionEventType, SubscriptionStatus>> buildTransitions() {
        Map<SubscriptionStatus, Map<SubscriptionEventType, SubscriptionStatus>> transitions = new EnumMap<>(
                SubscriptionStatus.class);

        transitions.put(SubscriptionStatus.PENDING, mapOf(
                SubscriptionEventType.PAYMENT_PAID, SubscriptionStatus.ACTIVE,
                SubscriptionEventType.PAYMENT_FAILED, SubscriptionStatus.PENDING,
                SubscriptionEventType.USER_CANCEL_REQUESTED, SubscriptionStatus.PENDING_CANCEL,
                SubscriptionEventType.BILLING_KEY_DELETED, SubscriptionStatus.SUSPENDED));

        transitions.put(SubscriptionStatus.ACTIVE, mapOf(
                SubscriptionEventType.PAYMENT_PAID, SubscriptionStatus.ACTIVE,
                SubscriptionEventType.PAYMENT_FAILED, SubscriptionStatus.ACTIVE,
                SubscriptionEventType.USER_CANCEL_REQUESTED, SubscriptionStatus.PENDING_CANCEL,
                SubscriptionEventType.DOWNGRADE_SCHEDULED, SubscriptionStatus.ACTIVE,
                SubscriptionEventType.UPGRADE_REQUESTED, SubscriptionStatus.ACTIVE,
                SubscriptionEventType.BILLING_KEY_DELETED, SubscriptionStatus.SUSPENDED,
                SubscriptionEventType.MANUAL_SUSPEND, SubscriptionStatus.SUSPENDED));

        transitions.put(SubscriptionStatus.PENDING_CANCEL, mapOf(
                SubscriptionEventType.PAYMENT_PAID, SubscriptionStatus.ACTIVE,
                SubscriptionEventType.BILLING_KEY_DELETED, SubscriptionStatus.CANCELLED,
                SubscriptionEventType.EXPIRE, SubscriptionStatus.EXPIRED));

        transitions.put(SubscriptionStatus.SUSPENDED, mapOf(
                SubscriptionEventType.PAYMENT_PAID, SubscriptionStatus.ACTIVE,
                SubscriptionEventType.MANUAL_RESUME, SubscriptionStatus.ACTIVE,
                SubscriptionEventType.BILLING_KEY_DELETED, SubscriptionStatus.CANCELLED));

        transitions.put(SubscriptionStatus.EXPIRED, mapOf(
                SubscriptionEventType.PAYMENT_PAID, SubscriptionStatus.ACTIVE));

        transitions.put(SubscriptionStatus.CANCELLED, new EnumMap<>(SubscriptionEventType.class));

        // 예약 동기화 관련 이벤트는 상태를 유지한다.
        for (SubscriptionStatus status : SubscriptionStatus.values()) {
            transitions.computeIfAbsent(status, s -> new EnumMap<>(SubscriptionEventType.class))
                    .put(SubscriptionEventType.SCHEDULE_CREATED, status);
            transitions.get(status).put(SubscriptionEventType.SCHEDULE_DELETED, status);
        }

        return transitions;
    }

    private static Map<SubscriptionEventType, SubscriptionStatus> mapOf(Object... entries) {
        Map<SubscriptionEventType, SubscriptionStatus> map = new EnumMap<>(SubscriptionEventType.class);
        for (int i = 0; i < entries.length; i += 2) {
            SubscriptionEventType key = (SubscriptionEventType) entries[i];
            SubscriptionStatus value = (SubscriptionStatus) entries[i + 1];
            map.put(key, value);
        }
        return map;
    }
}
