package kr.co.nomadlab.nomadrank.domain.payment.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.payment.client.PortOneV2Client;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.PaymentScheduleCreateRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentScheduleCreateResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentScheduleDeleteResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentScheduleInfo;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import kr.co.nomadlab.nomadrank.domain.payment.exception.PortOneApiException;
import kr.co.nomadlab.nomadrank.model.payment.entity.BillingKeyEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.PaymentScheduleEventEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.PaymentScheduleEventStatus;
import kr.co.nomadlab.nomadrank.model.payment.entity.PaymentScheduleEventType;
import kr.co.nomadlab.nomadrank.model.payment.repository.PaymentScheduleEventRepository;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import kr.co.nomadlab.nomadrank.util.BillingKeyEncryptionUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecurringPaymentScheduleService {

    private final PortOneV2Client portOneV2Client;
    private final BillingKeyEncryptionUtil billingKeyEncryptionUtil;
    private final PaymentScheduleEventRepository paymentScheduleEventRepository;
    @Value("${payment.recurring.test-mode.enabled:false}")
    private boolean testModeEnabled;
    @Value("${payment.recurring.test-mode.minute-interval:0}")
    private long testModeMinuteInterval;
    @Value("${payment.timezone.default:Asia/Seoul}")
    private String defaultTimezone;
    @Value("${payment.timezone.default-billing-time:09:00}")
    private String defaultBillingTime;

    private static final LocalTime FALLBACK_BILLING_TIME = LocalTime.of(9, 0);

    public PaymentScheduleCreateResponse createReservation(
            BillingKeyEntity billingKey,
            String paymentId,
            BigDecimal amount,
            String currency,
            OffsetDateTime scheduleAt,
            String orderName,
            Map<String, Object> customer) {

        if (billingKey == null) {
            throw new BadRequestException("유효한 결제 수단을 찾을 수 없습니다.");
        }

        if (scheduleAt == null) {
            throw new BadRequestException("정기 결제 예정 시간이 필요합니다.");
        }

        String resolvedPaymentId = (paymentId != null && !paymentId.isBlank())
                ? paymentId
                : generateReservationOrderId(billingKey.getUserId());

        String decryptedBillingKey = decryptBillingKey(billingKey);
        removeExistingSchedulesIfNeeded(billingKey);
        OffsetDateTime resolvedScheduleAt = applyTestScheduleOverride(scheduleAt);

        PaymentScheduleCreateRequest request = PaymentScheduleCreateRequest.builder()
                .paymentId(resolvedPaymentId)
                .billingKey(decryptedBillingKey)
                .orderName(normalizeOrderName(orderName))
                .amount(amount)
                .currency(currency != null && !currency.isBlank() ? currency : "KRW")
                .customer(customer != null ? customer : Map.of())
                .timeToPay(resolvedScheduleAt)
                .build();

        PaymentScheduleCreateResponse response = portOneV2Client.createPaymentSchedule(request);

        if (!response.isSuccess()) {
            String message = Optional.ofNullable(response.getErrorMessage())
                    .filter(msg -> !msg.isBlank())
                    .orElse("정기 결제 예약에 실패했습니다.");
            log.error("[RecurringSchedule] 예약 실패 - userId={}, paymentId={}, code={}, message={}",
                    billingKey.getUserId(), resolvedPaymentId, response.getErrorCode(), message);
            recordScheduleEvent("create-" + resolvedPaymentId, null, billingKey, PaymentScheduleEventType.CREATE,
                    PaymentScheduleEventStatus.FAILED, response.getErrorCode(), message, request.toString());
            throw new BadRequestException(message);
        }

        log.info("[RecurringSchedule] 예약 성공 - userId={}, scheduleId={}, timeToPay={}",
                billingKey.getUserId(), response.getScheduleId(), response.getTimeToPay());
        recordScheduleEvent("create-" + response.getScheduleId(), response.getScheduleId(), billingKey,
                PaymentScheduleEventType.CREATE,
                PaymentScheduleEventStatus.SUCCESS, null, null, response.toString());
        return response;
    }

    public Optional<PaymentScheduleInfo> fetchSchedule(String scheduleId) {
        if (scheduleId == null || scheduleId.isBlank()) {
            return Optional.empty();
        }

        try {
            PaymentScheduleInfo scheduleInfo = portOneV2Client.getPaymentSchedule(scheduleId);
            return Optional.ofNullable(scheduleInfo);
        } catch (PortOneApiException ex) {
            if (ex.getStatusCode() == 404) {
                log.debug("[RecurringSchedule] 예약 미존재 - scheduleId={}", scheduleId);
                return Optional.empty();
            }
            log.error("[RecurringSchedule] 예약 조회 실패 - scheduleId={}, status={}, message={}",
                    scheduleId, ex.getStatusCode(), ex.getMessage());
            throw ex;
        }
    }

    public Optional<PaymentScheduleDeleteResponse> deleteSchedulesByBillingKey(BillingKeyEntity billingKey) {
        if (billingKey == null) {
            return Optional.empty();
        }

        String decryptedBillingKey = decryptBillingKey(billingKey);

        try {
            PaymentScheduleDeleteResponse response = portOneV2Client.deletePaymentSchedules(decryptedBillingKey);
            log.info("[RecurringSchedule] 예약 삭제 - billingKey={}, revokedAt={}",
                    billingKey.getIssueId(), response != null ? response.getRevokedAt() : null);
            recordScheduleEvent("delete-" + billingKey.getIssueId(), null, billingKey,
                    PaymentScheduleEventType.DELETE,
                    PaymentScheduleEventStatus.SUCCESS, null, null, response != null ? response.toString() : null);
            return Optional.ofNullable(response);
        } catch (PortOneApiException ex) {
            if (ex.getStatusCode() == 404) {
                log.debug("[RecurringSchedule] 삭제 대상 예약 없음 - billingKey={}", billingKey.getIssueId());
                recordScheduleEvent("delete-missing-" + billingKey.getIssueId(), null, billingKey,
                        PaymentScheduleEventType.DELETE, PaymentScheduleEventStatus.FAILED, "NOT_FOUND",
                        ex.getMessage(), null);
                return Optional.empty();
            }
            log.error("[RecurringSchedule] 예약 삭제 실패 - billingKey={}, status={}, message={}",
                    billingKey.getIssueId(), ex.getStatusCode(), ex.getMessage());
            recordScheduleEvent("delete-fail-" + billingKey.getIssueId(), null, billingKey,
                    PaymentScheduleEventType.DELETE,
                    PaymentScheduleEventStatus.FAILED, String.valueOf(ex.getStatusCode()), ex.getMessage(), null);
            throw ex;
        }
    }

    public OffsetDateTime toOffsetDateTime(LocalDate date) {
        return toOffsetDateTime(date, ZoneId.of(defaultTimezone), resolveDefaultBillingTime());
    }

    public OffsetDateTime toOffsetDateTime(LocalDate date, ZoneId zoneId) {
        return toOffsetDateTime(date, zoneId, resolveDefaultBillingTime());
    }

    public OffsetDateTime toOffsetDateTime(LocalDate date, ZoneId zoneId, LocalTime timeOfDay) {
        LocalDate targetDate = date != null ? date : getDefaultNextBillingDate(BillingCycle.MONTHLY);
        ZoneId zone = zoneId != null ? zoneId : ZoneId.of(defaultTimezone);
        LocalTime time = timeOfDay != null ? timeOfDay : resolveDefaultBillingTime();
        return targetDate.atTime(time).atZone(zone).toOffsetDateTime();
    }

    public LocalDate getDefaultNextBillingDate(BillingCycle billingCycle) {
        LocalDate baseDate = LocalDate.now();
        return billingCycle == BillingCycle.YEARLY ? baseDate.plusYears(1) : baseDate.plusMonths(1);
    }

    public String resolveIntervalFromCycle(BillingCycle billingCycle) {
        return billingCycle == BillingCycle.YEARLY ? "YEAR" : "MONTH";
    }

    public String generateReservationOrderId(Long userId) {
        return "sub-" + userId + "-" + System.currentTimeMillis();
    }

    private String normalizeOrderName(String orderName) {
        return (orderName == null || orderName.isBlank())
                ? "NomadRank 멤버십 구독"
                : orderName;
    }

    private String decryptBillingKey(BillingKeyEntity billingKey) {
        return billingKeyEncryptionUtil.decrypt(billingKey.getBillingKey());
    }

    private void removeExistingSchedulesIfNeeded(BillingKeyEntity billingKey) {
        if (billingKey == null) {
            return;
        }

        try {
            deleteSchedulesByBillingKey(billingKey);
        } catch (RuntimeException ex) {
            log.warn("[RecurringSchedule] 기존 예약 삭제 중 예외(무시) - issueId={}, message={}",
                    billingKey.getIssueId(), ex.getMessage());
        }
    }

    private OffsetDateTime applyTestScheduleOverride(OffsetDateTime requested) {
        if (!testModeEnabled || testModeMinuteInterval <= 0) {
            return requested;
        }
        OffsetDateTime overrideTime = OffsetDateTime.now(ZoneId.systemDefault()).plusMinutes(testModeMinuteInterval);
        log.debug("[RecurringSchedule] 테스트 모드로 예약 시점을 {}분 뒤 {}로 변경했습니다. (요청: {})",
                testModeMinuteInterval, overrideTime, requested);
        return overrideTime;
    }

    private LocalTime resolveDefaultBillingTime() {
        if (defaultBillingTime == null || defaultBillingTime.isBlank()) {
            return FALLBACK_BILLING_TIME;
        }
        try {
            return LocalTime.parse(defaultBillingTime.trim());
        } catch (DateTimeParseException ex) {
            log.warn("[RecurringSchedule] 기본 청구 시각 파싱 실패(default-billing-time='{}'), 09:00으로 대체합니다.",
                    defaultBillingTime);
            return FALLBACK_BILLING_TIME;
        }
    }

    public void recordMissingScheduleEvent(String scheduleId, SubscriptionEntity subscription) {
        try {
            PaymentScheduleEventEntity entity = PaymentScheduleEventEntity.builder()
                    .eventId("miss-" + scheduleId)
                    .scheduleId(scheduleId)
                    .issueId(subscription.getIssueId())
                    .userId(subscription.getUserId())
                    .type(PaymentScheduleEventType.MISS)
                    .status(PaymentScheduleEventStatus.FAILED)
                    .errorCode("NOT_FOUND")
                    .errorMessage("PortOne 예약 미존재")
                    .occurredAt(OffsetDateTime.now())
                    .payload(maskPayload(subscription.getSubscriptionId()))
                    .build();
            paymentScheduleEventRepository.save(entity);
        } catch (Exception ex) {
            log.warn("[RecurringSchedule] MISS 이벤트 로깅 실패 - scheduleId={}, message={}", scheduleId, ex.getMessage());
        }
    }

    private void recordScheduleEvent(String eventId,
            String scheduleId,
            BillingKeyEntity billingKey,
            PaymentScheduleEventType type,
            PaymentScheduleEventStatus status,
            String errorCode,
            String errorMessage,
            String payload) {
        try {
            PaymentScheduleEventEntity entity = PaymentScheduleEventEntity.builder()
                    .eventId(eventId)
                    .scheduleId(scheduleId)
                    .issueId(billingKey != null ? billingKey.getIssueId() : null)
                    .userId(billingKey != null ? billingKey.getUserId() : null)
                    .type(type)
                    .status(status)
                    .errorCode(errorCode)
                    .errorMessage(errorMessage)
                    .occurredAt(OffsetDateTime.now())
                    .payload(maskPayload(payload))
                    .build();
            paymentScheduleEventRepository.save(entity);
        } catch (Exception ex) {
            log.warn("[RecurringSchedule] 이벤트 로깅 실패 - eventId={}, message={}", eventId, ex.getMessage());
        }
    }

    private String maskPayload(String payload) {
        if (payload == null) {
            return null;
        }
        String masked = payload;
        // 카드번호: 앞6/뒤4만 남기기
        masked = masked.replaceAll("(\\d{6})\\d{4,8}(\\d{4})", "$1****$2");
        // 전화번호: 중간 마스킹
        masked = masked.replaceAll("(\\d{3})-?\\d{3,4}-?(\\d{4})", "$1-****-$3");
        // 이메일: 아이디 부분 마스킹
        masked = masked.replaceAll("([\\w.%+-]{2})[\\w.%+-]*(@[\\w.-]+)", "$1****$2");
        return masked;
    }
}
