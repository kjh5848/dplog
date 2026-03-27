package kr.co.nomadlab.nomadrank.domain.payment.service;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;

import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentStatus;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentType;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionScheduleStatus;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionStatus;
import kr.co.nomadlab.nomadrank.domain.subscription.enums.SubscriptionEventType;
import kr.co.nomadlab.nomadrank.domain.subscription.service.SubscriptionEventProcessor;
import kr.co.nomadlab.nomadrank.model.payment.entity.BillingKeyEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.ChargeEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.WebhookEventEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.WebhookEventStatus;
import kr.co.nomadlab.nomadrank.model.payment.repository.BillingKeyRepository;
import kr.co.nomadlab.nomadrank.model.payment.repository.WebhookEventRepository;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 포트원 웹훅 처리 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentWebhookService {

    private final ChargeAdapterService chargeAdapterService;
    private final BillingKeyRepository billingKeyRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final RecurringPaymentScheduleService recurringPaymentScheduleService;
    private final WebhookEventRepository webhookEventRepository;
    private final SubscriptionEventProcessor subscriptionEventProcessor;
    @Value("${payment.timezone.default:Asia/Seoul}")
    private String defaultTimezone;

    /**
     * 결제 성공 웹훅 처리
     */
    @Transactional
    public void handlePaymentPaid(JsonNode data) {
        try {
            String paymentId = data.path("paymentId").asText();
            String status = data.path("status").asText();
            String paidAt = data.path("paidAt").asText();

            log.info("결제 성공 웹훅 처리 - 결제ID: {}, 상태: {}", paymentId, status);
            recordWebhookEvent("webhook-paid-" + paymentId, "PAYMENT_PAID", paymentId, WebhookEventStatus.RECEIVED,
                    data.toString(), null);

            // 결제 내역 조회 및 업데이트
            Optional<ChargeEntity> paymentOpt = chargeAdapterService.findPaymentById(paymentId);
            if (paymentOpt.isPresent()) {
                ChargeEntity payment = paymentOpt.get();
                payment.markAsPaid();
                chargeAdapterService.savePayment(payment);

                log.info("결제 내역 업데이트 완료 - 결제ID: {}", paymentId);

                // 구독 관련 처리 (정기결제인 경우)
                if (payment.getPaymentType() == PaymentType.RECURRING) {
                    updateSubscriptionOnPaymentSuccess(payment.getSubscriptionId(), paymentId);
                } else if (payment.getPaymentType() == PaymentType.UPGRADE) {
                    log.info("업그레이드 결제 성공 처리 - paymentId={}, subscriptionId={}", paymentId,
                            payment.getSubscriptionId());
                }
                recordWebhookEvent("webhook-paid-" + paymentId, "PAYMENT_PAID", paymentId, WebhookEventStatus.PROCESSED,
                        null, null);

            } else {
                log.warn("결제 내역을 찾을 수 없습니다 - 결제ID: {}", paymentId);
                recordWebhookEvent("webhook-paid-" + paymentId, "PAYMENT_PAID", paymentId, WebhookEventStatus.FAILED,
                        null, "결제 내역 없음");
            }

        } catch (Exception e) {
            log.error("결제 성공 웹훅 처리 실패", e);
            recordWebhookEvent("webhook-paid-error", "PAYMENT_PAID", null, WebhookEventStatus.FAILED, null,
                    e.getMessage());
            throw new RuntimeException("결제 성공 웹훅 처리에 실패했습니다", e);
        }
    }

    /**
     * 결제 실패 웹훅 처리
     */
    @Transactional
    public void handlePaymentFailed(JsonNode data) {
        try {
            String paymentId = data.path("paymentId").asText();
            String failReason = data.path("failReason").asText();
            String failedAt = data.path("failedAt").asText();

            log.info("결제 실패 웹훅 처리 - 결제ID: {}, 실패사유: {}", paymentId, failReason);
            recordWebhookEvent("webhook-failed-" + paymentId, "PAYMENT_FAILED", paymentId,
                    WebhookEventStatus.RECEIVED, data.toString(), null);

            // 결제 내역 조회 및 업데이트
            Optional<ChargeEntity> paymentOpt = chargeAdapterService.findPaymentById(paymentId);
            if (paymentOpt.isPresent()) {
                ChargeEntity payment = paymentOpt.get();
                payment.markAsFailed(failReason, null);
                chargeAdapterService.savePayment(payment);

                log.info("결제 실패 내역 업데이트 완료 - 결제ID: {}", paymentId);

                // 구독 관련 처리 (정기결제인 경우)
                if (payment.getPaymentType() == PaymentType.RECURRING) {
                    updateSubscriptionOnPaymentFailure(payment.getSubscriptionId(), paymentId, failReason);
                } else if (payment.getPaymentType() == PaymentType.UPGRADE) {
                    log.warn("업그레이드 결제 실패 - paymentId={}, reason={}", paymentId, failReason);
                }
                recordWebhookEvent("webhook-failed-" + paymentId, "PAYMENT_FAILED", paymentId,
                        WebhookEventStatus.PROCESSED, null, null);

            } else {
                log.warn("결제 내역을 찾을 수 없습니다 - 결제ID: {}", paymentId);
                recordWebhookEvent("webhook-failed-" + paymentId, "PAYMENT_FAILED", paymentId,
                        WebhookEventStatus.FAILED, null, "결제 내역 없음");
            }

        } catch (Exception e) {
            log.error("결제 실패 웹훅 처리 실패", e);
            recordWebhookEvent("webhook-failed-error", "PAYMENT_FAILED", null, WebhookEventStatus.FAILED, null,
                    e.getMessage());
            throw new RuntimeException("결제 실패 웹훅 처리에 실패했습니다", e);
        }
    }

    /**
     * 결제 취소 웹훅 처리
     */
    @Transactional
    public void handlePaymentCancelled(JsonNode data) {
        try {
            String paymentId = data.path("paymentId").asText();
            String cancelReason = data.path("cancelReason").asText();
            String cancelledAt = data.path("cancelledAt").asText();

            log.info("결제 취소 웹훅 처리 - 결제ID: {}, 취소사유: {}", paymentId, cancelReason);
            recordWebhookEvent("webhook-cancel-" + paymentId, "PAYMENT_CANCELLED", paymentId,
                    WebhookEventStatus.RECEIVED, data.toString(), null);

            // 결제 내역 조회 및 업데이트
            Optional<ChargeEntity> paymentOpt = chargeAdapterService.findPaymentById(paymentId);
            if (paymentOpt.isPresent()) {
                ChargeEntity payment = paymentOpt.get();
                payment.setStatus(PaymentStatus.CANCELLED);
                payment.setErrorMessage(cancelReason);
                chargeAdapterService.savePayment(payment);

                log.info("결제 취소 내역 업데이트 완료 - 결제ID: {}", paymentId);
                recordWebhookEvent("webhook-cancel-" + paymentId, "PAYMENT_CANCELLED", paymentId,
                        WebhookEventStatus.PROCESSED, null, null);

            } else {
                log.warn("결제 내역을 찾을 수 없습니다 - 결제ID: {}", paymentId);
                recordWebhookEvent("webhook-cancel-" + paymentId, "PAYMENT_CANCELLED", paymentId,
                        WebhookEventStatus.FAILED, null, "결제 내역 없음");
            }

        } catch (Exception e) {
            log.error("결제 취소 웹훅 처리 실패", e);
            recordWebhookEvent("webhook-cancel-error", "PAYMENT_CANCELLED", null, WebhookEventStatus.FAILED, null,
                    e.getMessage());
            throw new RuntimeException("결제 취소 웹훅 처리에 실패했습니다", e);
        }
    }

    /**
     * 빌링키 발급 웹훅 처리
     */
    @Transactional
    public void handleBillingKeyIssued(JsonNode data) {
        try {
            String issueId = data.path("issueId").asText();
            String billingKey = data.path("billingKey").asText();
            String status = data.path("status").asText();

            log.info("빌링키 발급 웹훅 처리 - 발급ID: {}, 상태: {}", issueId, status);
            recordWebhookEvent("webhook-issue-" + issueId, "BILLINGKEY_ISSUED", issueId,
                    WebhookEventStatus.RECEIVED, data.toString(), null);

            // 빌링키 엔티티 조회 및 상태 업데이트
            Optional<BillingKeyEntity> billingKeyOpt = billingKeyRepository.findById(issueId);
            if (billingKeyOpt.isPresent()) {
                BillingKeyEntity billingKeyEntity = billingKeyOpt.get();

                if ("ISSUED".equals(status)) {
                    billingKeyEntity.setStatus(BillingKeyEntity.BillingKeyStatus.ACTIVE);
                } else {
                    billingKeyEntity.setStatus(BillingKeyEntity.BillingKeyStatus.EXPIRED);
                }

                billingKeyRepository.save(billingKeyEntity);
                log.info("빌링키 상태 업데이트 완료 - 발급ID: {}, 상태: {}", issueId, status);
                recordWebhookEvent("webhook-issue-" + issueId, "BILLINGKEY_ISSUED", issueId,
                        WebhookEventStatus.PROCESSED, null, null);

            } else {
                log.warn("빌링키를 찾을 수 없습니다 - 발급ID: {}", issueId);
                recordWebhookEvent("webhook-issue-" + issueId, "BILLINGKEY_ISSUED", issueId,
                        WebhookEventStatus.FAILED, null, "빌링키 없음");
            }

        } catch (Exception e) {
            log.error("빌링키 발급 웹훅 처리 실패", e);
            recordWebhookEvent("webhook-issue-error", "BILLINGKEY_ISSUED", null, WebhookEventStatus.FAILED, null,
                    e.getMessage());
            throw new RuntimeException("빌링키 발급 웹훅 처리에 실패했습니다", e);
        }
    }

    /**
     * 빌링키 삭제 웹훅 처리
     */
    @Transactional
    public void handleBillingKeyDeleted(JsonNode data) {
        try {
            String issueId = data.path("issueId").asText();
            String deletedAt = data.path("deletedAt").asText();

            log.info("빌링키 삭제 웹훅 처리 - 발급ID: {}", issueId);
            recordWebhookEvent("webhook-delete-" + issueId, "BILLINGKEY_DELETED", issueId,
                    WebhookEventStatus.RECEIVED, data.toString(), null);

            // 빌링키 엔티티 조회 및 상태 업데이트
            Optional<BillingKeyEntity> billingKeyOpt = billingKeyRepository.findById(issueId);
            if (billingKeyOpt.isPresent()) {
                BillingKeyEntity billingKeyEntity = billingKeyOpt.get();
                billingKeyEntity.setStatus(BillingKeyEntity.BillingKeyStatus.DELETED);
                billingKeyRepository.save(billingKeyEntity);

                log.info("빌링키 삭제 상태 업데이트 완료 - 발급ID: {}", issueId);

                // 관련된 활성 구독도 일시정지 처리
                suspendSubscriptionsForBillingKey(issueId);
                recordWebhookEvent("webhook-delete-" + issueId, "BILLINGKEY_DELETED", issueId,
                        WebhookEventStatus.PROCESSED, null, null);

            } else {
                log.warn("빌링키를 찾을 수 없습니다 - 발급ID: {}", issueId);
                recordWebhookEvent("webhook-delete-" + issueId, "BILLINGKEY_DELETED", issueId,
                        WebhookEventStatus.FAILED, null, "빌링키 없음");
            }

        } catch (Exception e) {
            log.error("빌링키 삭제 웹훅 처리 실패", e);
            recordWebhookEvent("webhook-delete-error", "BILLINGKEY_DELETED", null, WebhookEventStatus.FAILED, null,
                    e.getMessage());
            throw new RuntimeException("빌링키 삭제 웹훅 처리에 실패했습니다", e);
        }
    }

    /**
     * 결제 성공 시 구독 정보 업데이트
     */
    private void updateSubscriptionOnPaymentSuccess(String subscriptionId, String paymentId) {
        if (subscriptionId == null)
            return;

        Optional<SubscriptionEntity> subscriptionOpt = subscriptionRepository.findById(subscriptionId);
        if (subscriptionOpt.isPresent()) {
            SubscriptionEntity subscription = subscriptionOpt.get();

            subscriptionEventProcessor.processEvent(
                    "webhook-paid-" + paymentId,
                    subscriptionId,
                    subscription.getStatus(),
                    SubscriptionEventType.PAYMENT_PAID,
                    "WEBHOOK",
                    paymentId,
                    () -> {
                        subscription.setNextMonthlyBillingDate();
                        subscription.setNextBillingAt(resolveNextBillingAt(subscription));
                        subscription.setScheduleStatus(SubscriptionScheduleStatus.CONFIRMED);
                        subscription.setScheduleLastSyncedAt(OffsetDateTime.now());

                        subscription.resetFailureCount();
                        subscription.setStatus(SubscriptionStatus.ACTIVE);
                        subscriptionRepository.save(subscription);

                        log.info("구독 정보 업데이트 완료 - 구독ID: {}, 다음 결제일: {}",
                                subscriptionId, subscription.getNextBillingDate());
                        return subscription.getStatus();
                    });
        }
    }

    /**
     * 결제 실패 시 구독 정보 업데이트
     */
    private void updateSubscriptionOnPaymentFailure(String subscriptionId, String paymentId, String failReason) {
        if (subscriptionId == null)
            return;

        Optional<SubscriptionEntity> subscriptionOpt = subscriptionRepository.findById(subscriptionId);
        if (subscriptionOpt.isPresent()) {
            SubscriptionEntity subscription = subscriptionOpt.get();

            subscriptionEventProcessor.processEvent(
                    "webhook-failed-" + paymentId,
                    subscriptionId,
                    subscription.getStatus(),
                    SubscriptionEventType.PAYMENT_FAILED,
                    "WEBHOOK",
                    paymentId,
                    () -> {
                        subscription.incrementFailureCount();
                        subscription.setLastErrorMessage(failReason);

                        if (subscription.getFailureCount() >= 3) {
                            subscription.setStatus(SubscriptionStatus.SUSPENDED);
                            log.warn("구독 일시정지 - 구독ID: {}, 연속 실패 횟수: {}",
                                    subscriptionId, subscription.getFailureCount());
                        }

                        subscriptionRepository.save(subscription);

                        log.info("구독 실패 정보 업데이트 완료 - 구독ID: {}, 실패 횟수: {}",
                                subscriptionId, subscription.getFailureCount());
                        return subscription.getStatus();
                    });
        }
    }

    /**
     * 빌링키 삭제 시 관련 구독들 일시정지
     */
    private void suspendSubscriptionsForBillingKey(String issueId) {
        var activeSubscriptions = subscriptionRepository
                .findByIssueIdAndStatus(issueId, SubscriptionStatus.ACTIVE);

        for (SubscriptionEntity subscription : activeSubscriptions) {
            subscription.setStatus(SubscriptionStatus.SUSPENDED);
            subscription.setLastErrorMessage("빌링키가 삭제되어 구독이 일시정지되었습니다");
            subscriptionRepository.save(subscription);

            log.info("빌링키 삭제로 인한 구독 일시정지 - 구독ID: {}", subscription.getSubscriptionId());
        }
    }

    private OffsetDateTime resolveNextBillingAt(SubscriptionEntity subscription) {
        if (subscription.getNextBillingDate() == null) {
            return subscription.getNextBillingAt();
        }
        ZoneId zoneId = resolveZoneId(subscription.getUserId());
        LocalTime timeOfDay = subscription.getNextBillingAt() != null
                ? subscription.getNextBillingAt().toLocalTime()
                : null;
        return recurringPaymentScheduleService.toOffsetDateTime(
                subscription.getNextBillingDate(),
                zoneId,
                timeOfDay);
    }

    private ZoneId resolveZoneId(Long userId) {
        if (userId == null) {
            return ZoneId.of(defaultTimezone);
        }
        return userRepository.findById(userId)
                .map(UserEntity::getTimezone)
                .filter(tz -> tz != null && !tz.isBlank())
                .map(String::trim)
                .map(this::safeZoneId)
                .orElseGet(() -> ZoneId.of(defaultTimezone));
    }

    private ZoneId safeZoneId(String timezone) {
        try {
            return ZoneId.of(timezone);
        } catch (Exception ex) {
            log.warn("타임존 파싱 실패 - timezone='{}', 기본 {} 사용", timezone, defaultTimezone);
            return ZoneId.of(defaultTimezone);
        }
    }

    private void recordWebhookEvent(String eventId,
            String source,
            String idempotencyKey,
            WebhookEventStatus status,
            String payload,
            String errorMessage) {
        try {
            WebhookEventEntity entity = WebhookEventEntity.builder()
                    .eventId(eventId)
                    .source(source)
                    .idempotencyKey(idempotencyKey)
                    .status(status)
                    .processedAt(OffsetDateTime.now())
                    .payload(maskPayload(payload))
                    .errorMessage(errorMessage)
                    .build();
            webhookEventRepository.save(entity);
        } catch (Exception ex) {
            log.warn("웹훅 이벤트 로깅 실패 - eventId={}, message={}", eventId, ex.getMessage());
        }
    }

    private String maskPayload(String payload) {
        if (payload == null) {
            return null;
        }
        String masked = payload;
        masked = masked.replaceAll("(\\d{6})\\d{4,8}(\\d{4})", "$1****$2"); // 카드번호
        masked = masked.replaceAll("(\\d{3})-?\\d{3,4}-?(\\d{4})", "$1-****-$3"); // 전화
        masked = masked.replaceAll("([\\w.%+-]{2})[\\w.%+-]*(@[\\w.-]+)", "$1****$2"); // 이메일
        return masked;
    }
}
