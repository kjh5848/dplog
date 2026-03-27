package kr.co.nomadlab.nomadrank.domain.subscription.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.config.PortOneV2Config;
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.domain.membership.service.MembershipRollbackContext;
import kr.co.nomadlab.nomadrank.domain.membership.service.MembershipRollbackService;
import kr.co.nomadlab.nomadrank.domain.membership.service.UsageResetService;
import kr.co.nomadlab.nomadrank.domain.payment.client.PortOneV2Client;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.BillingKeyPaymentRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentResponse;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentChargeType;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentMethod;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentStatus;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentType;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionScheduleStatus;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionStatus;
import kr.co.nomadlab.nomadrank.domain.payment.exception.PortOneApiException;
import kr.co.nomadlab.nomadrank.domain.payment.service.ChargeAdapterService;
import kr.co.nomadlab.nomadrank.domain.payment.service.InvoiceLineFactory;
import kr.co.nomadlab.nomadrank.domain.payment.service.InvoiceService;
import kr.co.nomadlab.nomadrank.domain.payment.service.ProrationCalculator;
import kr.co.nomadlab.nomadrank.domain.payment.service.RecurringPaymentScheduleService;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.request.SubscriptionDowngradeRequest;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.request.SubscriptionUpgradeRequest;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.response.SubscriptionDowngradeResponse;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.response.SubscriptionStatusResponse;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.response.SubscriptionUpgradeResponse;
import kr.co.nomadlab.nomadrank.domain.subscription.enums.SubscriptionEventType;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserLogEntity;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipRepository;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserLogRepository;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserRepository;
import kr.co.nomadlab.nomadrank.model.payment.entity.BillingKeyEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.ChargeEntity;
import kr.co.nomadlab.nomadrank.model.payment.repository.BillingKeyRepository;
import kr.co.nomadlab.nomadrank.model.payment.repository.InvoiceLineRepository;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import kr.co.nomadlab.nomadrank.util.BillingKeyEncryptionUtil;
import kr.co.nomadlab.nomadrank.util.PaymentUtils;
import kr.co.nomadlab.nomadrank.util.UpgradeCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 구독 서비스 API V1
 * 구독 상태 조회, 업그레이드, 스케줄러 연동을 단일 서비스로 제공한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionServiceApiV1 {

    private final SubscriptionRepository subscriptionRepository;
    private final MembershipRepository membershipRepository;
    private final MembershipUserRepository membershipUserRepository;
    private final MembershipUserLogRepository membershipUserLogRepository;
    private final BillingKeyRepository billingKeyRepository;
    private final ChargeAdapterService chargeAdapterService;
    private final UserRepository userRepository;
    private final BillingKeyEncryptionUtil billingKeyEncryptionUtil;
    private final PortOneV2Client portOneV2Client;
    private final PortOneV2Config portOneV2Config;
    private final UpgradeCalculator upgradeCalculator;
    private final RecurringPaymentScheduleService recurringPaymentScheduleService;
    private final ProrationCalculator prorationCalculator;
    private final InvoiceLineFactory invoiceLineFactory;
    private final InvoiceLineRepository invoiceLineRepository;
    private final UsageResetService usageResetService;
    private final MembershipRollbackService membershipRollbackService;
    private final SubscriptionEventProcessor subscriptionEventProcessor;
    private final InvoiceService invoiceService;

    private String resolveOperationId(String provided, String prefix, Long userId) {
        if (provided != null && !provided.isBlank()) {
            return provided.trim();
        }
        return "%s-%s-%d".formatted(prefix, userId, System.currentTimeMillis());
    }

    /**
     * 사용자 구독 상태 조회
     */
    public SubscriptionStatusResponse getSubscriptionStatus(Long userId) {
        try {
            log.info("구독 상태 조회 - 사용자: {}", userId);

            List<SubscriptionEntity> subscriptions = subscriptionRepository.findByUserIdOrderByCreatedAtDesc(userId);
            if (subscriptions.isEmpty()) {
                log.info("구독 없음 - 사용자: {}", userId);
                return SubscriptionStatusResponse.noActiveSubscription();
            }

            SubscriptionEntity subscription = subscriptions.get(0);
            boolean hasActiveSubscription = subscription.getStatus() == SubscriptionStatus.ACTIVE;

            Optional<BillingKeyEntity> billingKey = billingKeyRepository
                    .findByIssueIdAndUserId(subscription.getIssueId(), userId);

            String maskedCardNumber = null;
            String issuerName = null;

            if (billingKey.isPresent()) {
                BillingKeyEntity billingKeyEntity = billingKey.get();
                maskedCardNumber = billingKeyEntity.getMaskedCardNumber();
                issuerName = billingKeyEntity.getIssuerName();
            }

            SubscriptionStatusResponse response = SubscriptionStatusResponse.from(
                    subscription, maskedCardNumber, issuerName, hasActiveSubscription);

            log.info("구독 상태 조회 완료 - 사용자: {}, 구독ID: {}", userId, subscription.getSubscriptionId());
            return response;

        } catch (Exception e) {
            log.error("구독 상태 조회 실패 - 사용자: {}", userId, e);
            throw new RuntimeException("구독 상태 조회에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 구독 취소
     */
    @Transactional
    public void cancelSubscription(String subscriptionId, Long userId, String cancelReason) {
        try {
            log.info("구독 취소 요청 - 사용자: {}, 구독ID: {}", userId, subscriptionId);

            SubscriptionEntity subscription = subscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new IllegalArgumentException("구독을 찾을 수 없습니다: " + subscriptionId));

            if (!subscription.getUserId().equals(userId)) {
                throw new IllegalArgumentException("구독 취소 권한이 없습니다");
            }

            String eventId = "cancel-" + subscriptionId;
            subscriptionEventProcessor.processEvent(
                    eventId,
                    subscriptionId,
                    subscription.getStatus(),
                    SubscriptionEventType.USER_CANCEL_REQUESTED,
                    "REST",
                    null,
                    () -> {
                        subscription.setStatus(SubscriptionStatus.CANCELLED);
                        subscription.setEndDate(LocalDate.now());
                        subscriptionRepository.save(subscription);
                        return subscription.getStatus();
                    });

            log.info("구독 취소 완료 - 사용자: {}, 구독ID: {}", userId, subscriptionId);

        } catch (Exception e) {
            log.error("구독 취소 실패 - 사용자: {}, 구독ID: {}", userId, subscriptionId, e);
            throw new RuntimeException("구독 취소에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 구독 일시정지
     */
    @Transactional
    public void suspendSubscription(String subscriptionId, Long userId) {
        try {
            log.info("구독 일시정지 요청 - 사용자: {}, 구독ID: {}", userId, subscriptionId);

            SubscriptionEntity subscription = subscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new IllegalArgumentException("구독을 찾을 수 없습니다: " + subscriptionId));

            if (!subscription.getUserId().equals(userId)) {
                throw new IllegalArgumentException("구독 일시정지 권한이 없습니다");
            }

            String eventId = "suspend-" + subscriptionId;
            subscriptionEventProcessor.processEvent(
                    eventId,
                    subscriptionId,
                    subscription.getStatus(),
                    SubscriptionEventType.MANUAL_SUSPEND,
                    "REST",
                    null,
                    () -> {
                        subscription.setStatus(SubscriptionStatus.SUSPENDED);
                        subscriptionRepository.save(subscription);
                        return subscription.getStatus();
                    });

            log.info("구독 일시정지 완료 - 사용자: {}, 구독ID: {}", userId, subscriptionId);

        } catch (Exception e) {
            log.error("구독 일시정지 실패 - 사용자: {}, 구독ID: {}", userId, subscriptionId, e);
            throw new RuntimeException("구독 일시정지에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 구독 재개
     */
    @Transactional
    public void resumeSubscription(String subscriptionId, Long userId) {
        try {
            log.info("구독 재개 요청 - 사용자: {}, 구독ID: {}", userId, subscriptionId);

            SubscriptionEntity subscription = subscriptionRepository.findById(subscriptionId)
                    .orElseThrow(() -> new IllegalArgumentException("구독을 찾을 수 없습니다: " + subscriptionId));

            if (!subscription.getUserId().equals(userId)) {
                throw new IllegalArgumentException("구독 재개 권한이 없습니다");
            }

            String eventId = "resume-" + subscriptionId;
            subscriptionEventProcessor.processEvent(
                    eventId,
                    subscriptionId,
                    subscription.getStatus(),
                    SubscriptionEventType.MANUAL_RESUME,
                    "REST",
                    null,
                    () -> {
                        subscription.setStatus(SubscriptionStatus.ACTIVE);
                        subscription.setFailureCount(0);
                        subscription.setLastErrorMessage(null);
                        subscriptionRepository.save(subscription);
                        return subscription.getStatus();
                    });

            log.info("구독 재개 완료 - 사용자: {}, 구독ID: {}", userId, subscriptionId);

        } catch (Exception e) {
            log.error("구독 재개 실패 - 사용자: {}, 구독ID: {}", userId, subscriptionId, e);
            throw new RuntimeException("구독 재개에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 사용자의 활성 구독 여부 확인
     */
    public boolean hasActiveSubscription(Long userId) {
        return subscriptionRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.ACTIVE)
                .isPresent()
                || subscriptionRepository
                        .findByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.PENDING_CANCEL)
                        .isPresent();
    }

    /**
     * 구독 업그레이드 처리
     */
    @Transactional
    public SubscriptionUpgradeResponse upgradeSubscription(Long userId, SubscriptionUpgradeRequest request) {
        String operationId = resolveOperationId(request.getOperationId(), "upgrade", userId);
        SubscriptionEntity currentSubscription = subscriptionRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.ACTIVE)
                .orElseGet(() -> subscriptionRepository
                        .findByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.PENDING_CANCEL)
                        .orElseThrow(() -> new BadRequestException("활성화된 구독이 없습니다.")));

        // if (currentSubscription.getStatus() == SubscriptionStatus.PENDING_CANCEL) {
        // throw new BadRequestException("해지 예약 상태에서는 업그레이드를 진행할 수 없습니다. 해지 예약을 취소한 뒤 다시
        // 시도해 주세요.");
        // }

        MembershipEntity targetMembership = membershipRepository
                .findByLevelAndDeleteDateIsNull(request.getTargetMembershipLevel())
                .orElseThrow(() -> new BadRequestException("존재하지 않는 멤버십입니다."));

        int currentLevel = parseMembershipLevel(currentSubscription.getMembershipLevel());
        Integer targetLevelValue = targetMembership.getLevel();
        if (targetLevelValue == null) {
            throw new BadRequestException("선택한 멤버십 정보를 확인할 수 없습니다.");
        }

        int targetLevel = targetLevelValue;
        BillingCycle currentCycle = currentSubscription.getBillingCycle();
        BillingCycle requestedCycle = request.getBillingCycle();

        boolean isLevelUpgrade = targetLevel > currentLevel;
        boolean isSameLevel = targetLevel == currentLevel;
        boolean isMonthlyToYearly = currentCycle == BillingCycle.MONTHLY && requestedCycle == BillingCycle.YEARLY;
        boolean isYearlyToMonthly = currentCycle == BillingCycle.YEARLY && requestedCycle == BillingCycle.MONTHLY;

        if (!(isLevelUpgrade || (isSameLevel && isMonthlyToYearly))) {
            throw new BadRequestException("현재 요금제보다 높은 요금제로만 업그레이드할 수 있습니다.");
        }

        if (subscriptionEventProcessor
                .isDuplicate("upgrade-" + currentSubscription.getSubscriptionId() + "-" + operationId)) {
            log.info("[Upgrade] 중복 업그레이드 요청 - subscriptionId={} opId={}", currentSubscription.getSubscriptionId(),
                    operationId);
            UpgradeCalculator.Result dupResult = upgradeCalculator.calculate(
                    currentSubscription,
                    targetMembership,
                    request.getBillingCycle(),
                    LocalDate.now());
            return buildResponse(dupResult, null, false, "이미 처리된 업그레이드 요청입니다.");
        }

        UpgradeCalculator.Result result = upgradeCalculator.calculate(
                currentSubscription,
                targetMembership,
                request.getBillingCycle(),
                LocalDate.now());

        boolean shouldResetUsage = isLevelUpgrade || isYearlyToMonthly;

        final java.util.concurrent.atomic.AtomicReference<SubscriptionUpgradeResponse> respRef = new java.util.concurrent.atomic.AtomicReference<>();

        subscriptionEventProcessor.processEvent(
                "upgrade-" + currentSubscription.getSubscriptionId() + "-" + operationId,
                currentSubscription.getSubscriptionId(),
                currentSubscription.getStatus(),
                SubscriptionEventType.UPGRADE_REQUESTED,
                "REST",
                operationId,
                () -> {
                    if (result.getDifferenceAmount().compareTo(BigDecimal.ZERO) <= 0) {
                        applyUpgradeWithoutPayment(userId, currentSubscription, targetMembership,
                                request.getBillingCycle(),
                                result, shouldResetUsage);
                        respRef.set(buildResponse(result, null, false, "추가 결제 없이 업그레이드가 완료되었습니다."));
                    } else {
                        respRef.set(applyUpgradeWithPayment(userId, currentSubscription, targetMembership,
                                request.getBillingCycle(),
                                result, shouldResetUsage));
                    }
                    return currentSubscription.getStatus();
                });

        return respRef.get() != null ? respRef.get()
                : buildResponse(result, null, false, "이미 처리된 업그레이드 요청입니다.");
    }

    /**
     * 구독 다운그레이드 예약
     */
    @Transactional
    public SubscriptionDowngradeResponse scheduleDowngrade(Long userId, String subscriptionId,
            SubscriptionDowngradeRequest request) {
        log.info("구독 다운그레이드 예약 요청 - userId={}, targetLevel={}, targetCycle={}",
                userId, request.getTargetMembershipLevel(), request.getTargetBillingCycle());

        String operationId = resolveOperationId(request.getOperationId(), "downgrade", userId);
        SubscriptionEntity currentSubscription = subscriptionRepository
                .findBySubscriptionIdAndUserId(subscriptionId, userId)
                .orElseThrow(() -> new BadRequestException("활성화된 구독이 없습니다."));

        if (currentSubscription.getStatus() != SubscriptionStatus.ACTIVE) {
            throw new BadRequestException("활성화된 구독이 없습니다.");
        }

        if (subscriptionEventProcessor.isDuplicate("downgrade-" + subscriptionId + "-" + operationId)) {
            log.info("[Downgrade] 중복 다운그레이드 요청 - subscriptionId={} opId={}", subscriptionId, operationId);
            return SubscriptionDowngradeResponse.builder()
                    .status("SCHEDULED")
                    .effectiveDate(currentSubscription.getNextBillingDate())
                    .message("이미 처리된 다운그레이드 요청입니다.")
                    .build();
        }

        if (currentSubscription.getPendingMembershipLevel() != null) {
            throw new BadRequestException("이미 처리 대기 중인 다운그레이드 요청이 있습니다.");
        }

        MembershipEntity targetMembership = membershipRepository
                .findByLevelAndDeleteDateIsNull(request.getTargetMembershipLevel())
                .orElseThrow(() -> new BadRequestException("선택한 멤버십을 찾을 수 없습니다."));

        Integer targetLevelValue = targetMembership.getLevel();
        if (targetLevelValue == null) {
            throw new BadRequestException("선택한 멤버십 정보를 확인할 수 없습니다.");
        }

        int currentLevel = parseMembershipLevel(currentSubscription.getMembershipLevel());
        int targetLevel = targetLevelValue;

        boolean isLowerLevel = targetLevel < currentLevel;
        boolean isCycleDowngrade = targetLevel == currentLevel
                && currentSubscription.getBillingCycle() == BillingCycle.YEARLY
                && request.getTargetBillingCycle() == BillingCycle.MONTHLY;

        if (!(isLowerLevel || isCycleDowngrade)) {
            throw new BadRequestException("현재 요금제보다 낮은 요금제로만 변경할 수 있습니다.");
        }

        subscriptionEventProcessor.processEvent(
                "downgrade-" + subscriptionId + "-" + operationId,
                currentSubscription.getSubscriptionId(),
                currentSubscription.getStatus(),
                SubscriptionEventType.DOWNGRADE_SCHEDULED,
                "REST",
                operationId,
                () -> {
                    // 프로레이션/크레딧 계산 (잔여 기간 차액)
                    applyDowngradeProration(currentSubscription, targetMembership, request.getTargetBillingCycle());

                    currentSubscription.setPendingMembershipId(targetMembership.getId());
                    currentSubscription.setPendingMembershipLevel(String.valueOf(targetLevel));
                    currentSubscription.setPendingMembershipName(targetMembership.getName());
                    currentSubscription.setPendingBillingCycle(request.getTargetBillingCycle());
                    currentSubscription.setPendingReason(request.getReason());
                    currentSubscription.setPendingAppliedAt(null);
                    subscriptionRepository.save(currentSubscription);
                    return currentSubscription.getStatus();
                });

        userRepository.findById(userId).ifPresent(user -> membershipUserRepository
                .findByUserEntityAndMembershipState(user, MembershipState.ACTIVATE)
                .ifPresent(active -> membershipUserLogRepository.save(MembershipUserLogEntity.builder()
                        .membershipUserEntity(active)
                        .action("DOWNGRADE_SCHEDULED")
                        .startDate(active.getStartDate())
                        .endDate(active.getEndDate())
                        .membershipState(active.getMembershipState())
                        .build())));

        log.info("구독 다운그레이드 예약 완료 - userId={}, subscriptionId={}, effectiveDate={}",
                userId, currentSubscription.getSubscriptionId(), currentSubscription.getNextBillingDate());

        return SubscriptionDowngradeResponse.builder()
                .status("SCHEDULED")
                .effectiveDate(currentSubscription.getNextBillingDate())
                .message("다음 결제일부터 하위 요금제가 적용됩니다.")
                .build();
    }

    /**
     * 정기 결제 대상 구독 처리
     */
    @Transactional
    public void processDueSubscriptions(LocalDate today) {
        LocalDate targetDate = today != null ? today : LocalDate.now();
        log.info("정기결제 처리 시작 - {}", targetDate);

        List<SubscriptionEntity> cancelScheduled = subscriptionRepository
                .findByCancelScheduledAtAndStatus(targetDate, SubscriptionStatus.PENDING_CANCEL);
        for (SubscriptionEntity subscription : cancelScheduled) {
            finalizeScheduledCancellation(subscription);
        }

        List<SubscriptionEntity> todaySubscriptions = new ArrayList<>();
        todaySubscriptions.addAll(subscriptionRepository
                .findByNextBillingDateAndStatus(targetDate, SubscriptionStatus.ACTIVE));
        todaySubscriptions.addAll(subscriptionRepository
                .findByNextBillingDateAndStatus(targetDate, SubscriptionStatus.PENDING));

        log.info("오늘 처리할 구독 수: {}", todaySubscriptions.size());

        for (SubscriptionEntity subscription : todaySubscriptions) {
            applyPendingPlanIfNecessary(subscription, targetDate);
            processSubscriptionPayment(subscription);
        }

        log.info("정기결제 처리 완료 - 처리된 구독 수: {}", todaySubscriptions.size());
    }

    /**
     * 재시도 결제 대상 처리
     */
    @Transactional
    public void processRetryableSubscriptions(LocalDate today) {
        LocalDate targetDate = today != null ? today : LocalDate.now();
        OffsetDateTime target = targetDate.atStartOfDay()
                .atZone(java.time.ZoneId.systemDefault())
                .toOffsetDateTime();
        log.info("재시도 결제 처리 시작 - {}", target);

        int maxRetries = portOneV2Config.getBilling().getMaxRetryCount();

        List<SubscriptionEntity> retrySubscriptions = subscriptionRepository
                .findRetryableSubscriptions(target, maxRetries, SubscriptionStatus.ACTIVE);

        log.info("재시도할 구독 수: {}", retrySubscriptions.size());

        for (SubscriptionEntity subscription : retrySubscriptions) {
            processSubscriptionPayment(subscription);
        }

        log.info("재시도 결제 처리 완료 - 처리된 구독 수: {}", retrySubscriptions.size());
    }

    /**
     * 만료 구독 정리
     */
    @Transactional
    public void cleanupExpiredSubscriptions(LocalDate today) {
        LocalDate targetDate = today != null ? today : LocalDate.now();
        log.info("만료된 구독 정리 시작 - {}", targetDate);

        List<SubscriptionStatus> activeStatuses = List.of(
                SubscriptionStatus.ACTIVE,
                SubscriptionStatus.SUSPENDED);

        List<SubscriptionEntity> expiredSubscriptions = subscriptionRepository
                .findExpiredSubscriptions(targetDate, activeStatuses);

        log.info("정리할 만료 구독 수: {}", expiredSubscriptions.size());

        for (SubscriptionEntity subscription : expiredSubscriptions) {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(subscription);
            log.info("구독 만료 처리 완료 - 구독ID: {}", subscription.getSubscriptionId());
        }

        log.info("만료된 구독 정리 완료 - 처리된 구독 수: {}", expiredSubscriptions.size());
    }

    /**
     * 개별 구독 결제 처리
     */
    @Transactional
    public void processSubscriptionPayment(SubscriptionEntity subscription) {
        String subscriptionId = subscription.getSubscriptionId();

        try {
            log.info("구독 결제 처리 시작 - 구독ID: {}, 사용자: {}, 금액: {}",
                    subscriptionId, subscription.getUserId(), subscription.getAmount());

            Optional<BillingKeyEntity> billingKeyOpt = billingKeyRepository
                    .findByIssueIdAndUserId(subscription.getIssueId(), subscription.getUserId());

            if (billingKeyOpt.isEmpty()) {
                handlePaymentFailure(subscription, "빌링키를 찾을 수 없습니다");
                return;
            }

            BillingKeyEntity billingKey = billingKeyOpt.get();

            if (!billingKey.isUsable()) {
                handlePaymentFailure(subscription, "빌링키가 사용할 수 없는 상태입니다: " + billingKey.getStatus());
                return;
            }

            boolean paymentSuccess = executeRecurringPayment(subscription, billingKey);

            if (paymentSuccess) {
                handlePaymentSuccess(subscription);
            } else {
                handlePaymentFailure(subscription, "결제 실행에 실패했습니다");
            }

        } catch (Exception e) {
            log.error("구독 결제 처리 중 오류 발생 - 구독ID: {}", subscriptionId, e);
            handlePaymentFailure(subscription, "결제 처리 중 오류 발생: " + e.getMessage());
        }
    }

    private void applyUpgradeWithoutPayment(Long userId,
            SubscriptionEntity subscription,
            MembershipEntity targetMembership,
            BillingCycle billingCycle,
            UpgradeCalculator.Result result,
            boolean resetUsage) {

        MembershipStateChangeResult stateChange = null;
        try {
            stateChange = updateMembership(userId, targetMembership, result.getNextBillingDate(), "UPGRADE_APPLY");

            subscription.setMembershipLevel(String.valueOf(targetMembership.getLevel()));
            subscription.setMembershipName(targetMembership.getName());
            subscription.setAmount(resolvePlanPrice(targetMembership, billingCycle));
            subscription.setBillingCycle(billingCycle);
            subscription.setNextBillingDate(result.getNextBillingDate());
            subscription
                    .setNextBillingAt(recurringPaymentScheduleService.toOffsetDateTime(result.getNextBillingDate()));
            subscriptionRepository.save(subscription);

            billingKeyRepository.findLatestActiveByUserId(userId, BillingKeyEntity.BillingKeyStatus.ACTIVE)
                    .ifPresent(billingKey -> rebuildRecurringReservation(
                            "UPGRADE_NO_PAYMENT",
                            subscription,
                            billingKey,
                            targetMembership,
                            billingCycle,
                            result.getNextBillingDate()));

            if (resetUsage && stateChange != null) {
                usageResetService.resetUsage(stateChange.newMembership(), subscription, billingCycle, true);
            }
        } catch (RuntimeException ex) {
            membershipRollbackService.rollbackToPreviousPlan(
                    stateChange != null ? stateChange.rollbackContext() : null);
            throw ex;
        }
    }

    private SubscriptionUpgradeResponse applyUpgradeWithPayment(Long userId,
            SubscriptionEntity subscription,
            MembershipEntity targetMembership,
            BillingCycle billingCycle,
            UpgradeCalculator.Result result,
            boolean resetUsage) {

        boolean requiresRefund = subscription.getBillingCycle() == BillingCycle.YEARLY
                && billingCycle == BillingCycle.MONTHLY
                && result.hasRefundableAmount();

        BillingKeyEntity billingKey = billingKeyRepository
                .findLatestActiveByUserId(userId, BillingKeyEntity.BillingKeyStatus.ACTIVE)
                .orElseThrow(() -> new BadRequestException("등록된 결제 수단이 없습니다. 먼저 카드 정보를 등록해 주세요."));

        if (requiresRefund) {
            processYearlyToMonthlyRefund(subscription, result.getRefundableAmount());
        }

        String paymentId = generatePaymentId(userId);
        String merchantUid = generateMerchantUid(userId);
        BigDecimal differenceAmount = result.getDifferenceAmount();
        String orderName = String.format("멤버십 업그레이드 (%s)", targetMembership.getName());

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("사용자 정보를 찾을 수 없습니다."));
        Map<String, Object> customerPayload = PaymentUtils.buildCustomerPayload(user);

        ChargeEntity Charge = ChargeEntity.builder()
                .paymentId(paymentId)
                .subscriptionId(subscription.getSubscriptionId())
                .userId(userId)
                .issueId(billingKey.getIssueId())
                .merchantUid(merchantUid)
                .membershipId(targetMembership.getId())
                .amount(differenceAmount)
                .currency("KRW")
                .orderName(orderName)
                .paymentMethod(PaymentMethod.CARD)
                .status(PaymentStatus.PENDING)
                .paymentType(PaymentType.UPGRADE)
                .chargeType(PaymentChargeType.UPGRADE)
                .build();
        chargeAdapterService.savePayment(Charge);

        String decryptedBillingKey = billingKeyEncryptionUtil.decrypt(billingKey.getBillingKey());

        BillingKeyPaymentRequest paymentRequest = BillingKeyPaymentRequest.builder()
                .paymentId(paymentId)
                .billingKey(decryptedBillingKey)
                .orderName(orderName)
                .amount(differenceAmount)
                .currency("KRW")
                .customer(customerPayload)
                .build();

        PaymentResponse paymentResponse = portOneV2Client.payWithBillingKey(paymentRequest);

        if (!paymentResponse.isSuccess()) {
            Charge.markAsFailed(paymentResponse.getErrorMessage(), null);
            Charge.setPortonePaymentId(paymentId);
            chargeAdapterService.savePayment(Charge);
            throw new BadRequestException(paymentResponse.getErrorMessage() != null
                    ? paymentResponse.getErrorMessage()
                    : "업그레이드 결제에 실패했습니다.");
        }

        Charge.markAsPaid();
        Charge.setPortonePaymentId(paymentId);
        try {
            var invoice = invoiceService.createInvoice(
                    subscription.getSubscriptionId(),
                    userId,
                    LocalDate.now(),
                    result.getNextBillingDate(),
                    differenceAmount,
                    "KRW",
                    true);
            Charge.setInvoiceId(invoice.getInvoiceId());
            // 크레딧(기존 요금) + 일할 청구 라인 분리 기록
            invoiceLineRepository.save(invoiceLineFactory.creditLine(
                    invoice.getInvoiceId(),
                    "업그레이드 잔여 크레딧(" + result.getRemainingDays() + "일)",
                    result.getCurrentPlanPrice(), // 기존 플랜 잔여분 크레딧
                    "KRW"));
            invoiceLineRepository.save(invoiceLineFactory.prorationLine(
                    invoice.getInvoiceId(),
                    "업그레이드 일할 청구(" + result.getRemainingDays() + "일)",
                    result.getDifferenceAmount(),
                    "KRW"));
        } catch (Exception ex) {
            log.warn("[Invoice] 업그레이드 인보이스 생성 실패 - subscriptionId={}, message={}",
                    subscription.getSubscriptionId(), ex.getMessage());
        }
        chargeAdapterService.savePayment(Charge);

        MembershipStateChangeResult stateChange = null;
        try {
            stateChange = updateMembership(userId, targetMembership,
                    result.getNextBillingDate(), "UPGRADE_PAID");

            subscription.setMembershipLevel(String.valueOf(targetMembership.getLevel()));
            subscription.setMembershipName(targetMembership.getName());
            subscription.setAmount(resolvePlanPrice(targetMembership, billingCycle));
            subscription.setBillingCycle(billingCycle);
            subscription.setNextBillingDate(result.getNextBillingDate());
            subscription
                    .setNextBillingAt(recurringPaymentScheduleService.toOffsetDateTime(result.getNextBillingDate()));
            subscriptionRepository.save(subscription);

            rebuildRecurringReservation(
                    "UPGRADE_WITH_PAYMENT",
                    subscription,
                    billingKey,
                    targetMembership,
                    billingCycle,
                    result.getNextBillingDate());

            if (resetUsage && stateChange != null) {
                usageResetService.resetUsage(stateChange.newMembership(), subscription, billingCycle, true);
            }

            MembershipUserEntity upgradedMembership = stateChange != null ? stateChange.newMembership() : null;
            if (upgradedMembership != null) {
                Charge.setMembershipUserId(upgradedMembership.getId());
                chargeAdapterService.savePayment(Charge);
            }

            log.info(
                    "[Upgrade] 차액 결제 완료 - userId={}, subscriptionId={}, fromLevel={}, toLevel={}, amount={}, resetUsage={}",
                    userId,
                    subscription.getSubscriptionId(),
                    subscription.getMembershipLevel(),
                    targetMembership.getLevel(),
                    differenceAmount,
                    resetUsage);

            return buildResponse(result, paymentId, true, "업그레이드 결제가 완료되었습니다.");
        } catch (RuntimeException ex) {
            membershipRollbackService.rollbackToPreviousPlan(
                    stateChange != null ? stateChange.rollbackContext() : null);
            cancelUpgradePayment(Charge, paymentId, differenceAmount, "UPGRADE_POST_PROCESSING_FAILED");
            throw ex;
        }
    }

    private void processYearlyToMonthlyRefund(SubscriptionEntity subscription, BigDecimal refundableAmount) {
        if (refundableAmount == null || refundableAmount.signum() <= 0) {
            return;
        }

        ChargeEntity latestPayment = chargeAdapterService
                .findLatestPaidBySubscription(
                        subscription.getSubscriptionId(),
                        PaymentStatus.PAID)
                .orElseThrow(() -> new BadRequestException("환불 대상 결제 내역을 찾을 수 없습니다."));

        String portOnePaymentId = latestPayment.getPortonePaymentId();
        if (portOnePaymentId == null || portOnePaymentId.isBlank()) {
            throw new BadRequestException("환불할 결제의 PortOne ID가 없습니다.");
        }

        PaymentResponse refundResponse = portOneV2Client.cancelPayment(
                portOnePaymentId,
                refundableAmount,
                "UPGRADE_YEARLY_TO_MONTHLY");
        if (!refundResponse.isSuccess()) {
            latestPayment.setErrorMessage("연→월 환불 실패: " + refundResponse.getErrorMessage());
            chargeAdapterService.savePayment(latestPayment);
            throw new BadRequestException(refundResponse.getErrorMessage() != null
                    ? refundResponse.getErrorMessage()
                    : "연간 결제 환불에 실패했습니다.");
        }

        boolean fullRefund = latestPayment.getAmount() != null
                && refundableAmount.compareTo(latestPayment.getAmount()) >= 0;
        latestPayment.markAsRefunded(fullRefund, "UPGRADE_YEARLY_TO_MONTHLY");
        chargeAdapterService.savePayment(latestPayment);
    }

    private void cancelUpgradePayment(ChargeEntity Charge,
            String portOnePaymentId,
            BigDecimal amount,
            String cancelReason) {
        if (portOnePaymentId == null || portOnePaymentId.isBlank()) {
            return;
        }

        try {
            PaymentResponse response = portOneV2Client.cancelPayment(portOnePaymentId, amount, cancelReason);
            if (Charge != null) {
                if (response.isSuccess()) {
                    Charge.markAsCancelled(cancelReason);
                } else {
                    Charge.setErrorMessage("업그레이드 취소 실패: " + response.getErrorMessage());
                }
                chargeAdapterService.savePayment(Charge);
            }
        } catch (RuntimeException ex) {
            log.error("[Upgrade] 결제 취소 중 오류 - paymentId={}", portOnePaymentId, ex);
            if (Charge != null) {
                Charge.setErrorMessage("업그레이드 취소 예외: " + ex.getMessage());
                chargeAdapterService.savePayment(Charge);
            }
        }
    }

    private MembershipStateChangeResult updateMembership(Long userId,
            MembershipEntity targetMembership,
            LocalDate nextBillingDate,
            String actionPrefix) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("사용자 정보를 찾을 수 없습니다."));

        Optional<MembershipUserEntity> activeMembershipOpt = membershipUserRepository
                .findByUserEntityAndMembershipState(user, MembershipState.ACTIVATE);

        MembershipRollbackContext.MembershipRollbackContextBuilder rollbackBuilder = MembershipRollbackContext.builder()
                .userId(userId);

        activeMembershipOpt.ifPresent(active -> {
            rollbackBuilder.previousMembershipId(active.getId());
            rollbackBuilder.previousMembershipState(active.getMembershipState());
            rollbackBuilder.previousMembershipEndDate(active.getEndDate());

            active.setMembershipState(MembershipState.EXPIRED);
            active.setEndDate(LocalDate.now());
            membershipUserRepository.save(active);
            membershipUserLogRepository.save(MembershipUserLogEntity.builder()
                    .membershipUserEntity(active)
                    .action(actionPrefix + "_OLD_EXPIRE")
                    .startDate(active.getStartDate())
                    .endDate(active.getEndDate())
                    .membershipState(active.getMembershipState())
                    .build());
        });

        LocalDate startDate = LocalDate.now();
        boolean isFreeMembership = targetMembership != null && targetMembership.isFree();
        LocalDate endDate;
        if (isFreeMembership) {
            endDate = null;
        } else if (nextBillingDate != null && nextBillingDate.isAfter(startDate)) {
            endDate = nextBillingDate;
        } else {
            endDate = startDate.plusMonths(1);
        }

        MembershipUserEntity newMembership = MembershipUserEntity.builder()
                .userEntity(user)
                .membershipEntity(targetMembership)
                .startDate(startDate)
                .endDate(endDate)
                .membershipState(MembershipState.ACTIVATE)
                .build();
        membershipUserRepository.save(newMembership);
        membershipUserLogRepository.save(MembershipUserLogEntity.builder()
                .membershipUserEntity(newMembership)
                .action(actionPrefix + "_NEW_ACTIVE")
                .startDate(newMembership.getStartDate())
                .endDate(newMembership.getEndDate())
                .membershipState(newMembership.getMembershipState())
                .build());

        rollbackBuilder.activatedMembershipId(newMembership.getId());
        rollbackBuilder.activatedPreviousState(MembershipState.READY);
        rollbackBuilder.activatedPreviousEndDate(endDate);

        return new MembershipStateChangeResult(newMembership, rollbackBuilder.build());
    }

    private SubscriptionUpgradeResponse buildResponse(UpgradeCalculator.Result result,
            String paymentId,
            boolean paymentRequested,
            String message) {
        return SubscriptionUpgradeResponse.builder()
                .differenceAmount(result.getDifferenceAmount())
                .currency("KRW")
                .paymentId(paymentId)
                .nextBillingDate(result.getNextBillingDate())
                .remainingDays(result.getRemainingDays())
                .currentPlanPrice(result.getCurrentPlanPrice())
                .targetPlanPrice(result.getTargetPlanPrice())
                .paymentRequested(paymentRequested)
                .message(message != null ? message : result.getMessage())
                .build();
    }

    private String generatePaymentId(Long userId) {
        return "upgrade-" + userId + "-" + System.currentTimeMillis() + "-"
                + UUID.randomUUID().toString().replace("-", "");
    }

    private String generateMerchantUid(Long userId) {
        return "upgrade-order-" + userId + "-" + System.currentTimeMillis();
    }

    private int parseMembershipLevel(String membershipLevel) {
        try {
            return Integer.parseInt(membershipLevel);
        } catch (NumberFormatException ex) {
            throw new BadRequestException("현재 구독의 멤버십 정보를 확인할 수 없습니다.");
        }
    }

    private void applyDowngradeProration(SubscriptionEntity subscription,
            MembershipEntity targetMembership,
            BillingCycle targetCycle) {
        try {
            BillingCycle currentCycle = subscription.getBillingCycle() != null
                    ? subscription.getBillingCycle()
                    : BillingCycle.MONTHLY;
            BigDecimal currentPrice = resolvePlanPrice(targetMembership, currentCycle);
            BigDecimal targetPrice = resolvePlanPrice(targetMembership, targetCycle);
            LocalDate changeDate = LocalDate.now();
            LocalDate periodEnd = subscription.getNextBillingDate() != null
                    ? subscription.getNextBillingDate()
                    : changeDate.plusMonths(1);

            var prorate = prorationCalculator.calculate(currentPrice, targetPrice, currentCycle, changeDate, periodEnd);
            if (prorate.difference().compareTo(BigDecimal.ZERO) >= 0) {
                // 다운그레이드가 아니거나 환불/크레딧이 없는 경우
                return;
            }

            // 인보이스: 크레딧(음수) 라인만 발행 (결제 없음)
            var invoice = invoiceService.createInvoice(
                    subscription.getSubscriptionId(),
                    subscription.getUserId(),
                    changeDate,
                    periodEnd,
                    prorate.difference(), // 음수 금액
                    "KRW",
                    true);

            invoiceLineRepository.save(
                    invoiceLineFactory.creditLine(
                            invoice.getInvoiceId(),
                            "다운그레이드 잔여 크레딧(" + prorate.remainingDays() + "/" + prorate.totalDays() + "일, "
                                    + currentPrice + "→" + targetPrice + ")",
                            prorate.difference().abs(),
                            "KRW"));

            log.info("[Downgrade] 프로레이션 크레딧 생성 - subscriptionId={}, invoiceId={}, credit={}",
                    subscription.getSubscriptionId(), invoice.getInvoiceId(), prorate.difference());
        } catch (Exception ex) {
            log.warn("[Downgrade] 프로레이션 계산 실패 - subscriptionId={}, message={}", subscription.getSubscriptionId(),
                    ex.getMessage());
        }
    }

    private BigDecimal resolvePlanPrice(MembershipEntity membership, BillingCycle billingCycle) {
        return switch (billingCycle) {
            case MONTHLY -> {
                if (membership.getPrice() == null) {
                    throw new BadRequestException("선택한 멤버십의 월 요금 정보를 확인할 수 없습니다.");
                }
                yield membership.getPrice();
            }
            case YEARLY -> {
                if (membership.getPriceYearly() == null) {
                    throw new BadRequestException("선택한 멤버십은 연간 요금제를 지원하지 않습니다.");
                }
                yield membership.getPriceYearly();
            }
        };
    }

    private boolean executeRecurringPayment(SubscriptionEntity subscription, BillingKeyEntity billingKey) {
        try {
            String paymentId = "recurring_" + subscription.getSubscriptionId() + "_" + System.currentTimeMillis();
            String decryptedBillingKey = billingKeyEncryptionUtil.decrypt(billingKey.getBillingKey());
            UserEntity user = userRepository.findById(subscription.getUserId())
                    .orElseThrow(() -> new BadRequestException("사용자 정보를 찾을 수 없습니다."));
            Map<String, Object> customerPayload = PaymentUtils.buildCustomerPayload(user);

            BillingKeyPaymentRequest paymentRequest = BillingKeyPaymentRequest.builder()
                    .paymentId(paymentId)
                    .billingKey(decryptedBillingKey)
                    .orderName(subscription.getMembershipName() + " 월 구독료")
                    .amount(subscription.getAmount())
                    .currency("KRW")
                    .customer(customerPayload)
                    .build();

            PaymentResponse paymentResponse = portOneV2Client.payWithBillingKey(paymentRequest);

            ChargeEntity Charge = ChargeEntity.builder()
                    .paymentId(paymentId)
                    .subscriptionId(subscription.getSubscriptionId())
                    .userId(subscription.getUserId())
                    .issueId(subscription.getIssueId())
                    .merchantUid("recurring_" + System.currentTimeMillis())
                    .amount(subscription.getAmount())
                    .currency("KRW")
                    .orderName(subscription.getMembershipName() + " 월 구독료")
                    .paymentMethod(PaymentMethod.CARD)
                    .paymentType(PaymentType.RECURRING)
                    .chargeType(PaymentChargeType.RECURRING)
                    .requestedAt(LocalDateTime.now())
                    .build();

            // 인보이스 생성/연결
            try {
                LocalDate periodStart = LocalDate.now();
                LocalDate periodEnd = subscription.getNextBillingDate() != null
                        ? subscription.getNextBillingDate()
                        : periodStart.plusMonths(1);
                var invoice = invoiceService.createInvoice(
                        subscription.getSubscriptionId(),
                        subscription.getUserId(),
                        periodStart,
                        periodEnd,
                        subscription.getAmount(),
                        "KRW",
                        paymentResponse.isSuccess());
                Charge.setInvoiceId(invoice.getInvoiceId());
            } catch (Exception ex) {
                log.warn("[Invoice] 정기결제 인보이스 생성 실패 - subscriptionId={}, message={}", subscription.getSubscriptionId(),
                        ex.getMessage());
            }

            if (paymentResponse.isSuccess()) {
                Charge.markAsPaid();
            } else {
                Charge.markAsFailed(paymentResponse.getErrorMessage(), null);
            }
            Charge.setPortonePaymentId(paymentId);

            chargeAdapterService.savePayment(Charge);

            log.info("정기결제 실행 결과 - 구독ID: {}, 성공: {}, 메시지: {}",
                    subscription.getSubscriptionId(), paymentResponse.isSuccess(),
                    paymentResponse.getErrorMessage());

            return paymentResponse.isSuccess();

        } catch (Exception e) {
            log.error("정기결제 실행 중 오류", e);
            return false;
        }
    }

    private void handlePaymentSuccess(SubscriptionEntity subscription) {
        try {
            LocalDate nextBillingDate = calculateNextBillingDate(subscription);
            finalizePendingPlanIfNecessary(subscription, nextBillingDate);
            subscription.setNextBillingDate(nextBillingDate);
            subscription.setNextBillingAt(recurringPaymentScheduleService.toOffsetDateTime(nextBillingDate));
            subscription.resetFailureCount();
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscriptionRepository.save(subscription);

            log.info("정기결제 성공 처리 완료 - 구독ID: {}, 다음 결제일: {}",
                    subscription.getSubscriptionId(), subscription.getNextBillingDate());

        } catch (Exception e) {
            log.error("정기결제 성공 처리 중 오류", e);
            handlePaymentFailure(subscription, "결제 성공 처리 중 오류: " + e.getMessage());
        }
    }

    private void handlePaymentFailure(SubscriptionEntity subscription, String reason) {
        try {
            subscription.incrementFailureCount();
            subscription.setRetryCount(subscription.getRetryCount() == null ? 0 : subscription.getRetryCount());
            subscription.setLastErrorMessage(reason);

            int maxRetries = portOneV2Config.getBilling().getMaxRetryCount();

            if (subscription.getRetryCount() >= maxRetries) {
                subscription.setStatus(SubscriptionStatus.SUSPENDED);
                subscription.setNextRetryAt(null);
            } else {
                subscription.setRetryCount(subscription.getRetryCount() + 1);
                subscription.setNextRetryAt(OffsetDateTime.now().plusHours(6));
            }

            subscriptionRepository.save(subscription);

            log.warn("정기결제 실패 처리 - 구독ID: {}, 실패횟수: {}, 사유: {}",
                    subscription.getSubscriptionId(), subscription.getFailureCount(), reason);

        } catch (Exception e) {
            log.error("정기결제 실패 처리 중 오류", e);
        }
    }

    private void applyPendingPlanIfNecessary(SubscriptionEntity subscription, LocalDate targetDate) {
        if (subscription.getPendingMembershipLevel() == null) {
            return;
        }
        if (subscription.getNextBillingDate() == null || !subscription.getNextBillingDate().isEqual(targetDate)) {
            return;
        }

        MembershipEntity targetMembership = resolvePendingMembership(subscription);
        BillingCycle nextCycle = subscription.getPendingBillingCycle() != null
                ? subscription.getPendingBillingCycle()
                : subscription.getBillingCycle();

        subscription.setMembershipLevel(String.valueOf(targetMembership.getLevel()));
        subscription.setMembershipName(targetMembership.getName());
        subscription.setBillingCycle(nextCycle);
        subscription.setAmount(resolvePlanPrice(targetMembership, nextCycle));
        subscriptionRepository.save(subscription);

        log.info("다운그레이드 예약 적용 예정 - 구독ID: {}, 적용 플랜: {}, 결제주기: {}",
                subscription.getSubscriptionId(), targetMembership.getName(), nextCycle);
    }

    private void finalizePendingPlanIfNecessary(SubscriptionEntity subscription, LocalDate nextBillingDate) {
        if (subscription.getPendingMembershipLevel() == null) {
            return;
        }

        MembershipStateChangeResult stateChange = null;
        try {
            MembershipEntity targetMembership = resolvePendingMembership(subscription);
            stateChange = updateMembership(subscription.getUserId(), targetMembership, nextBillingDate,
                    "DOWNGRADE_APPLY");

            BillingCycle targetCycle = subscription.getPendingBillingCycle() != null
                    ? subscription.getPendingBillingCycle()
                    : subscription.getBillingCycle();

            subscription.setMembershipLevel(String.valueOf(targetMembership.getLevel()));
            subscription.setMembershipName(targetMembership.getName());
            subscription.setBillingCycle(targetCycle);
            subscription.setAmount(resolvePlanPrice(targetMembership, targetCycle));

            BillingKeyEntity billingKey = null;
            if (subscription.getIssueId() != null && !subscription.getIssueId().isBlank()) {
                billingKey = billingKeyRepository
                        .findByIssueIdAndUserId(subscription.getIssueId(), subscription.getUserId())
                        .orElse(null);
            }

            rebuildRecurringReservation(
                    "DOWNGRADE_APPLY",
                    subscription,
                    billingKey,
                    targetMembership,
                    targetCycle,
                    nextBillingDate);

            subscription.setPendingMembershipId(null);
            subscription.setPendingMembershipLevel(null);
            subscription.setPendingMembershipName(null);
            subscription.setPendingBillingCycle(null);
            subscription.setPendingReason(null);
            subscription.setPendingAppliedAt(LocalDateTime.now());
        } catch (RuntimeException ex) {
            membershipRollbackService.rollbackToPreviousPlan(
                    stateChange != null ? stateChange.rollbackContext() : null);
            throw ex;
        }
    }

    private void rebuildRecurringReservation(
            String action,
            SubscriptionEntity subscription,
            BillingKeyEntity billingKey,
            MembershipEntity targetMembership,
            BillingCycle billingCycle,
            LocalDate nextBillingDate) {

        if (billingKey == null) {
            log.warn("[RecurringSchedule] {} - 빌링키 없음 subscriptionId={} userId={}",
                    action, subscription.getSubscriptionId(), subscription.getUserId());
            return;
        }

        if (billingKey.getStatus() != BillingKeyEntity.BillingKeyStatus.ACTIVE) {
            log.warn("[RecurringSchedule] {} - 비활성 빌링키 issueId={} status={}",
                    action, billingKey.getIssueId(), billingKey.getStatus());
            return;
        }

        LocalDate effectiveNextBillingDate = nextBillingDate != null
                ? nextBillingDate
                : subscription.getNextBillingDate();

        BillingCycle targetCycle = billingCycle != null ? billingCycle : subscription.getBillingCycle();

        try {
            recurringPaymentScheduleService.deleteSchedulesByBillingKey(billingKey);

            var response = recurringPaymentScheduleService.createReservation(
                    billingKey,
                    subscription.getSubscriptionId(),
                    subscription.getAmount(),
                    "KRW",
                    recurringPaymentScheduleService.toOffsetDateTime(effectiveNextBillingDate),
                    buildOrderNameForMembership(targetMembership, subscription),
                    Map.of("id", String.valueOf(subscription.getUserId())));

            subscription.setScheduleId(response.getScheduleId());
            subscription.setScheduleStatus(SubscriptionScheduleStatus.PENDING);
            subscription.setScheduleLastSyncedAt(OffsetDateTime.now());
            subscription.setNextBillingAt(response.getTimeToPay());
            subscriptionRepository.save(subscription);

            log.info("[RecurringSchedule] {} - subscriptionId={} nextBillingDate={} cycle={}",
                    action, subscription.getSubscriptionId(), effectiveNextBillingDate, targetCycle);
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("[RecurringSchedule] {} 실패 - subscriptionId={} userId={}",
                    action, subscription.getSubscriptionId(), subscription.getUserId(), ex);
            throw new BadRequestException("정기 결제 예약을 갱신하는 중 오류가 발생했습니다.");
        }
    }

    private String buildOrderNameForMembership(MembershipEntity membership, SubscriptionEntity subscription) {
        String baseName = Optional.ofNullable(membership)
                .map(MembershipEntity::getName)
                .filter(name -> !name.isBlank())
                .orElse(subscription.getMembershipName());

        if (baseName == null || baseName.isBlank()) {
            baseName = "NomadRank 멤버십";
        }

        return baseName + " 정기결제";
    }

    private void finalizeScheduledCancellation(SubscriptionEntity subscription) {
        log.info("해지 예정 구독 처리 - subscriptionId={}, userId={}",
                subscription.getSubscriptionId(), subscription.getUserId());

        String issueId = subscription.getIssueId();
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        LocalDate cancelDate = subscription.getCancelScheduledAt() != null
                ? subscription.getCancelScheduledAt()
                : LocalDate.now();
        subscription.setEndDate(cancelDate);
        subscription.setCancelScheduledAt(null);
        subscription.setNextBillingDate(null);
        subscription.setNextBillingAt(null);
        subscription.setScheduleStatus(SubscriptionScheduleStatus.CANCELLED);
        subscription.setScheduleLastSyncedAt(OffsetDateTime.now());
        subscription.setScheduleId(null);
        subscription.setUpdatedAt(LocalDateTime.now());
        subscriptionRepository.save(subscription);

        if (issueId != null) {
            billingKeyRepository.findByIssueIdAndUserId(issueId, subscription.getUserId())
                    .ifPresent(billingKey -> {
                        try {
                            String decryptedKey = billingKeyEncryptionUtil.decrypt(billingKey.getBillingKey());
                            portOneV2Client.deleteBillingKey(decryptedKey, "USER_CANCEL");
                        } catch (PortOneApiException ex) {
                            log.warn("해지 처리 중 PortOne 빌링키 삭제 실패 - issueId={}, status={}, message={}",
                                    issueId, ex.getStatusCode(), ex.getMessage());
                        } catch (Exception e) {
                            log.warn("해지 처리 중 빌링키 삭제 오류 - issueId={}", issueId, e);
                        }

                        billingKey.setStatus(BillingKeyEntity.BillingKeyStatus.DELETED);
                        billingKey.setExpiredAt(LocalDateTime.now());
                        billingKeyRepository.save(billingKey);
                    });
        }

        userRepository.findById(subscription.getUserId())
                .ifPresent(userEntity -> membershipUserRepository
                        .findByUserEntityAndMembershipState(userEntity, MembershipState.ACTIVATE)
                        .ifPresent(active -> {
                            active.setMembershipState(MembershipState.EXPIRED);
                            if (active.getEndDate() == null || active.getEndDate().isAfter(cancelDate)) {
                                active.setEndDate(cancelDate);
                            }
                            membershipUserRepository.save(active);
                            saveMembershipLog(active, "CANCEL_SUBSCRIPTION");
                        }));
    }

    private MembershipEntity resolvePendingMembership(SubscriptionEntity subscription) {
        if (subscription.getPendingMembershipId() != null) {
            return membershipRepository.findById(subscription.getPendingMembershipId())
                    .orElseThrow(() -> new BadRequestException("대상 멤버십 정보를 확인할 수 없습니다."));
        }

        int level = parseMembershipLevel(subscription.getPendingMembershipLevel());
        return membershipRepository.findByLevelAndDeleteDateIsNull(level)
                .orElseThrow(() -> new BadRequestException("대상 멤버십 정보를 확인할 수 없습니다."));
    }

    private LocalDate calculateNextBillingDate(SubscriptionEntity subscription) {
        LocalDate baseDate = subscription.getNextBillingDate() != null
                ? subscription.getNextBillingDate()
                : LocalDate.now();

        return subscription.getBillingCycle() == BillingCycle.YEARLY
                ? baseDate.plusYears(1)
                : baseDate.plusMonths(1);
    }

    private void saveMembershipLog(MembershipUserEntity membershipUser, String action) {
        MembershipUserLogEntity logEntity = MembershipUserLogEntity.builder()
                .membershipUserEntity(membershipUser)
                .action(action)
                .startDate(membershipUser.getStartDate())
                .endDate(membershipUser.getEndDate())
                .membershipState(membershipUser.getMembershipState())
                .build();
        membershipUserLogRepository.save(logEntity);
    }

    private record MembershipStateChangeResult(
            MembershipUserEntity newMembership,
            MembershipRollbackContext rollbackContext) {
    }
}
