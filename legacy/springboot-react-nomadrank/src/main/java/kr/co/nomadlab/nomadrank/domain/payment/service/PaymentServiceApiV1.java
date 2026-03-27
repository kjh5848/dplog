package kr.co.nomadlab.nomadrank.domain.payment.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.DateTimeException;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.common.exception.ConflictException;
import kr.co.nomadlab.nomadrank.common.exception.ExternalServiceException;
import kr.co.nomadlab.nomadrank.common.exception.ResourceNotFoundException;
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.domain.membership.service.MembershipRollbackContext;
import kr.co.nomadlab.nomadrank.domain.membership.service.MembershipRollbackService;
import kr.co.nomadlab.nomadrank.domain.membership.service.UsageResetService;
import kr.co.nomadlab.nomadrank.domain.payment.client.PortOneV2Client;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.BillingKeyCompleteRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.BillingKeyPaymentRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.PaymentChargeRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.PaymentPreRegisterRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.SubscriptionCancelRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.BillingKeyInfoResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentChargeResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentPreRegisterResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentScheduleCreateResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentScheduleDeleteResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PortOnePreRegisterResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.SubscriptionCancelResponse;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycleType;
import kr.co.nomadlab.nomadrank.domain.payment.service.ChargeAdapterService;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentMethod;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentStatus;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentType;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentChargeType;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionScheduleStatus;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionStatus;
import kr.co.nomadlab.nomadrank.domain.payment.exception.PortOneApiException;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.request.SubscriptionRequest;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.response.SubscriptionReservationResponse;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.response.SubscriptionResponse;
import kr.co.nomadlab.nomadrank.domain.subscription.enums.SubscriptionEventType;
import kr.co.nomadlab.nomadrank.domain.subscription.service.SubscriptionEventProcessor;
import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserLogEntity;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipRepository;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserLogRepository;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserRepository;
import kr.co.nomadlab.nomadrank.model.payment.entity.BillingKeyEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceLineEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.ChargeEntity;
import kr.co.nomadlab.nomadrank.model.payment.repository.BillingKeyRepository;
import kr.co.nomadlab.nomadrank.model.payment.repository.InvoiceLineRepository;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionRepository;
import kr.co.nomadlab.nomadrank.model.use_log.repository.UseLogRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceEntity;
import kr.co.nomadlab.nomadrank.util.BillingKeyEncryptionUtil;
import kr.co.nomadlab.nomadrank.util.PaymentIdGenerator;
import kr.co.nomadlab.nomadrank.util.PaymentUtils;
import kr.co.nomadlab.nomadrank.util.RefundCalculator;
import kr.co.nomadlab.nomadrank.domain.payment.service.InvoiceService;
import kr.co.nomadlab.nomadrank.domain.payment.service.InvoiceLineFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 결제 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentServiceApiV1 {

    private final PortOneV2Client portOneV2Client;
    private final ChargeAdapterService chargeAdapterService;
    private final MembershipRepository membershipRepository;
    private final BillingKeyRepository billingKeyRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final MembershipUserRepository membershipUserRepository;
    private final MembershipUserLogRepository membershipUserLogRepository;
    private final UserRepository userRepository;
    private final BillingKeyEncryptionUtil billingKeyEncryptionUtil;
    private final RecurringPaymentScheduleService recurringPaymentScheduleService;
    private final MembershipRollbackService membershipRollbackService;
    private final PaymentIdGenerator paymentIdGenerator;
    private final UseLogRepository useLogRepository;
    private final RefundCalculator refundCalculator;
    private final UsageResetService usageResetService;
    private final SubscriptionEventProcessor subscriptionEventProcessor;
    private final InvoiceService invoiceService;
    private final InvoiceLineFactory invoiceLineFactory;
    private final InvoiceLineRepository invoiceLineRepository;
    @org.springframework.beans.factory.annotation.Value("${payment.timezone.default:Asia/Seoul}")
    private String defaultTimezone;
    @org.springframework.beans.factory.annotation.Value("${payment.timezone.default-billing-time:09:00}")
    private String defaultBillingTime;

    private static final LocalTime FALLBACK_BILLING_TIME = LocalTime.of(9, 0);

    private String resolveOperationId(String provided, String prefix, Long userId) {
        if (provided != null && !provided.isBlank()) {
            return provided.trim();
        }
        return "%s-%s-%d".formatted(prefix, userId, System.currentTimeMillis());
    }

    /**
     * 결제 사전등록
     */
    @Transactional
    public PaymentPreRegisterResponse preRegisterPayment(Long userId, PaymentPreRegisterRequest request) {
        log.info("결제 사전등록 시작 - 사용자: {}, 멤버십 레벨: {}", userId, request.getMembershipLevel());

        MembershipEntity membership = membershipRepository
                .findByLevelAndDeleteDateIsNull(request.getMembershipLevel())
                .orElseThrow(() -> new BadRequestException("존재하지 않는 멤버십입니다."));

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("존재하지 않는 사용자입니다."));

        // membershipUserRepository.findByUserEntityAndMembershipState(user,
        // MembershipState.ACTIVATE)
        // .ifPresent(activeMembership -> {
        // int currentLevel = activeMembership.getMembershipEntity().getLevel();
        // if (currentLevel >= membership.getLevel()) {
        // throw new BadRequestException("현재 멤버십보다 낮거나 동일한 요금제로는 결제를 진행할 수 없습니다.");
        // }
        // });

        BillingCycleType billingCycle = request.getBillingCycle();

        var membershipPrice = billingCycle == BillingCycleType.YEARLY
                ? membership.getPriceYearly()
                : membership.getPrice();

        if (membershipPrice == null) {
            String message = billingCycle == BillingCycleType.YEARLY
                    ? "연간 멤버십 가격 정보가 없습니다."
                    : "멤버십 가격 정보가 없습니다.";
            throw new BadRequestException(message);
        }

        long priceAmount;
        try {
            priceAmount = membershipPrice.longValueExact();
        } catch (ArithmeticException e) {
            log.error("멤버십 금액 변환 실패 - userId={}, level={}, price={}", userId, request.getMembershipLevel(),
                    membershipPrice, e);
            throw new BadRequestException("결제 금액이 올바르지 않습니다.");
        }

        Long expectedAmount = request.getExpectedAmount();
        if (expectedAmount == null || priceAmount != expectedAmount) {
            log.warn("결제 금액 불일치 - userId={}, level={}, expected={}, actual={}",
                    userId, request.getMembershipLevel(), expectedAmount, priceAmount);
            throw new BadRequestException("결제 금액이 올바르지 않습니다.");
        }

        PaymentMethod paymentMethod = resolvePaymentMethod(request.getPaymentMethod());

        String currency = request.getCurrency();
        if (currency == null || currency.isBlank()) {
            currency = "KRW";
            request.setCurrency(currency);
        }

        membershipUserRepository.findTopByUserEntityAndMembershipStateOrderByStartDateDesc(user, MembershipState.READY)
                .ifPresent(ready -> {
                    ready.setMembershipState(MembershipState.EXPIRED);
                    ready.setEndDate(LocalDate.now());
                    membershipUserRepository.save(ready);
                    membershipUserLogRepository.save(MembershipUserLogEntity.builder()
                            .membershipUserEntity(ready)
                            .action("CANCEL_READY_BEFORE_NEW_PAYMENT")
                            .startDate(ready.getStartDate())
                            .endDate(ready.getEndDate())
                            .membershipState(ready.getMembershipState())
                            .build());
                });

        LocalDate startDate = LocalDate.now();
        LocalDate endDate = BillingCycleType.YEARLY.equals(billingCycle)
                ? startDate.plusYears(1)
                : startDate.plusMonths(1);

        MembershipUserEntity targetMembershipUser = MembershipUserEntity.builder()
                .userEntity(user)
                .membershipEntity(membership)
                .startDate(startDate)
                .endDate(endDate)
                .membershipState(MembershipState.READY)
                .build();

        targetMembershipUser = membershipUserRepository.save(targetMembershipUser);

        membershipUserLogRepository.save(MembershipUserLogEntity.builder()
                .membershipUserEntity(targetMembershipUser)
                .action("PREPARE_UPGRADE_PAYMENT")
                .startDate(targetMembershipUser.getStartDate())
                .endDate(targetMembershipUser.getEndDate())
                .membershipState(targetMembershipUser.getMembershipState())
                .build());

        String paymentId = request.generatePaymentId(userId);
        String merchantUid = request.generateMerchantUid(userId);

        if (chargeAdapterService.findByMerchantUid(merchantUid).isPresent()) {
            revertPreparedMembership(targetMembershipUser, null, "ROLLBACK_DUPLICATE_PAYMENT_REQUEST");
            throw new BadRequestException("이미 처리 중인 결제입니다. 잠시 후 다시 시도해주세요.");
        }

        String cycleLabel = billingCycle == BillingCycleType.YEARLY ? "연간" : "월간";
        String orderName = membership.getName() != null
                ? membership.getName() + " 멤버십 (" + cycleLabel + ")"
                : "NomadRank 멤버십 (" + cycleLabel + ")";

        ChargeEntity Charge = ChargeEntity.builder()
                .paymentId(paymentId)
                .userId(userId)
                .merchantUid(merchantUid)
                .membershipId(membership.getId())
                .membershipUserId(targetMembershipUser.getId())
                .amount(membershipPrice)
                .currency(currency)
                .orderName(orderName)
                .paymentMethod(paymentMethod)
                .status(PaymentStatus.PENDING)
                .paymentType(PaymentType.INITIAL)
                .chargeType(PaymentChargeType.INITIAL)
                .requestedAt(LocalDateTime.now())
                .build();

        chargeAdapterService.savePayment(Charge);

        PortOnePreRegisterResponse portOneResponse;
        try {
            portOneResponse = portOneV2Client.preRegisterPayment(
                    paymentId,
                    membershipPrice,
                    currency);
        } catch (RuntimeException e) {
            log.error("포트원 결제 사전등록 실패 - paymentId={}, message={}", paymentId, e.getMessage());
            revertPreparedMembership(targetMembershipUser, Charge, "ROLLBACK_AFTER_PRE_REGISTER_ERROR");
            throw new BadRequestException("결제 사전등록에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }

        if (!portOneResponse.isSuccess()) {
            log.error("포트원 결제 사전등록 응답 실패 - paymentId={}, status={}", paymentId, portOneResponse.getStatus());
            revertPreparedMembership(targetMembershipUser, Charge, "ROLLBACK_AFTER_PRE_REGISTER_FAIL_RESPONSE");
            throw new BadRequestException("결제 사전등록에 실패했습니다.");
        }

        log.info("결제 사전등록 완료 - 결제ID: {}, 멤버십: {}", paymentId, membership.getName());

        return PaymentPreRegisterResponse.of(
                portOneResponse.getPaymentId(),
                merchantUid,
                membershipPrice,
                portOneResponse.getCurrency() != null ? portOneResponse.getCurrency() : currency,
                portOneResponse.getStatus(),
                portOneResponse.getPreparedAt(),
                billingCycle,
                portOneResponse.getRawResponse());
    }

    /**
     * 결제 상태 업데이트
     */
    @Transactional
    public void updatePaymentStatus(String paymentId, PaymentStatus status, String errorMessage) {
        try {
            ChargeEntity payment = chargeAdapterService.findPaymentById(paymentId)
                    .orElseThrow(() -> new IllegalArgumentException("결제 내역을 찾을 수 없습니다: " + paymentId));

            if (status == PaymentStatus.PAID) {
                payment.markAsPaid();
            } else if (status == PaymentStatus.FAILED) {
                payment.markAsFailed(errorMessage, null);
            }

            chargeAdapterService.savePayment(payment);
            log.info("결제 상태 업데이트 완료 - 결제ID: {}, 상태: {}", paymentId, status);

        } catch (Exception e) {
            log.error("결제 상태 업데이트 실패 - 결제ID: {}", paymentId, e);
            throw new RuntimeException("결제 상태 업데이트에 실패했습니다", e);
        }
    }

    /**
     * 결제 내역 조회
     */
    public ChargeEntity getCharge(String paymentId) {
        return chargeAdapterService.findPaymentById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("결제 내역을 찾을 수 없습니다: " + paymentId));
    }

    private PaymentMethod resolvePaymentMethod(String method) {
        if (method == null) {
            throw new BadRequestException("결제 수단이 지정되지 않았습니다.");
        }

        try {
            return PaymentMethod.valueOf(method.toUpperCase());
        } catch (IllegalArgumentException ex) {
            log.warn("지원하지 않는 결제 수단: {}", method);
            throw new BadRequestException("지원하지 않는 결제 수단입니다.");
        }
    }

    private void revertPreparedMembership(MembershipUserEntity membershipUser, ChargeEntity Charge,
            String action) {
        if (Charge != null) {
            chargeAdapterService.deleteById(Charge.getPaymentId());
        }

        if (membershipUser != null) {
            membershipUser.setMembershipState(MembershipState.EXPIRED);
            membershipUser.setEndDate(LocalDate.now());
            membershipUserRepository.save(membershipUser);

            membershipUserLogRepository.save(MembershipUserLogEntity.builder()
                    .membershipUserEntity(membershipUser)
                    .action(action)
                    .startDate(membershipUser.getStartDate())
                    .endDate(membershipUser.getEndDate())
                    .membershipState(membershipUser.getMembershipState())
                    .build());
        }
    }

    /**
     * 단건 결제 (스텁)
     */
    public PaymentChargeResponse charge(Long userId, PaymentChargeRequest request) {
        log.info("단건 결제 API 호출 (스텁) - userId={}, orderId={}", userId, request.getOrderId());

        return PaymentChargeResponse.builder()
                .status("NOT_IMPLEMENTED")
                .message("단건 결제 연동은 준비 중입니다.")
                .build();
    }

    /**
     * 정기 결제 예약
     */
    @Transactional
    public SubscriptionReservationResponse subscribe(Long userId, SubscriptionRequest request) {
        log.info("정기 결제 예약 요청 - userId={}, issueId={}, orderId={}",
                userId, request.getIssueId(), request.getOrderId());

        BillingKeyEntity billingKey = billingKeyRepository
                .findByIssueIdAndUserId(request.getIssueId(), userId)
                .orElseThrow(() -> new BadRequestException("유효하지 않은 빌링키입니다."));

        log.debug("정기 결제 예약 - 사용자 빌링키 조회 성공 issueId={}, maskedCard={}",
                billingKey.getIssueId(), billingKey.getMaskedCardNumber());

        if (!billingKey.isUsable()) {
            log.warn("정기 결제 예약 실패 - 비활성 빌링키 사용 시도 userId={}, issueId={}", userId, request.getIssueId());
            throw new BadRequestException("사용할 수 없는 빌링키입니다. 다시 등록해주세요.");
        }

        subscriptionRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.ACTIVE)
                .ifPresent(subscription -> {
                    log.warn("정기 결제 예약 실패 - 이미 활성 구독 존재 userId={}, subscriptionId={}",
                            userId, subscription.getSubscriptionId());
                    throw new BadRequestException("이미 활성화된 구독이 존재합니다. 먼저 구독을 해지해주세요.");
                });

        subscriptionRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.PENDING)
                .ifPresent(subscription -> {
                    log.warn("정기 결제 예약 실패 - 처리 중인 구독 존재 userId={}, subscriptionId={}",
                            userId, subscription.getSubscriptionId());
                    throw new BadRequestException("처리 중인 구독이 있습니다. 결제 결과를 확인한 뒤 다시 시도해주세요.");
                });

        BillingCycle billingCycle = resolveBillingCycle(request.getInterval());
        OffsetDateTime scheduleAt = resolveScheduleAt(userId, request, billingCycle);

        PaymentScheduleCreateResponse portOneResponse = recurringPaymentScheduleService.createReservation(
                billingKey,
                request.getOrderId(),
                BigDecimal.valueOf(request.getAmount()),
                "KRW",
                scheduleAt,
                resolveOrderName(request.getOrderName()),
                Map.of("id", request.getCustomerId()));

        log.info("정기 결제 예약 성공 - userId={}, issueId={}, reservationId={}, scheduleAt={}",
                userId, request.getIssueId(), portOneResponse.getScheduleId(), portOneResponse.getTimeToPay());

        LocalDateTime nextBillingLocalDateTime = scheduleAt.toLocalDateTime();
        SubscriptionEntity subscription = SubscriptionEntity.builder()
                .subscriptionId(portOneResponse.getScheduleId())
                .scheduleId(portOneResponse.getScheduleId())
                .scheduleStatus(SubscriptionScheduleStatus.PENDING)
                .scheduleLastSyncedAt(OffsetDateTime.now())
                .nextBillingAt(scheduleAt)
                .issueId(billingKey.getIssueId())
                .userId(userId)
                .membershipLevel(request.getProductId() != null ? request.getProductId() : "nomadrank-membership")
                .membershipName(resolveOrderName(request.getOrderName()))
                .amount(BigDecimal.valueOf(request.getAmount()))
                .billingDay(nextBillingLocalDateTime.getDayOfMonth())
                .billingCycle(billingCycle)
                .status(SubscriptionStatus.PENDING)
                .nextBillingAt(scheduleAt)
                .nextBillingDate(nextBillingLocalDateTime.toLocalDate())
                .failureCount(0)
                .startDate(nextBillingLocalDateTime.toLocalDate())
                .build();

        subscriptionRepository.save(subscription);

        log.debug("정기 결제 예약 DB 저장 완료 - subscriptionId={}, userId={}, nextBillingDate={}",
                subscription.getSubscriptionId(), userId, subscription.getNextBillingDate());

        return SubscriptionReservationResponse.builder()
                .reservationId(portOneResponse.getScheduleId())
                .status(portOneResponse.getStatus())
                .scheduleAt(portOneResponse.getTimeToPay())
                .interval(normalizeInterval(request.getInterval()))
                .intervalCount(request.getIntervalCount())
                .message("정기 결제가 예약되었습니다.")
                .build();
    }

    private OffsetDateTime resolveScheduleAt(Long userId, SubscriptionRequest request, BillingCycle billingCycle) {
        if (StringUtils.hasText(request.getScheduleAt())) {
            return parseScheduleAt(request.getScheduleAt());
        }

        ZoneId zoneId = resolveZoneId(request.getTimezone(), userId);
        LocalTime timeOfDay = resolveBillingTime(request.getBillingTime());
        LocalDate nextBillingDate = recurringPaymentScheduleService.getDefaultNextBillingDate(billingCycle);
        return recurringPaymentScheduleService.toOffsetDateTime(nextBillingDate, zoneId, timeOfDay);
    }

    private OffsetDateTime parseScheduleAt(String scheduleAt) {
        try {
            return OffsetDateTime.parse(scheduleAt);
        } catch (DateTimeParseException exception) {
            log.error("정기 결제 예약 시간 파싱 실패 - scheduleAt={}", scheduleAt, exception);
            throw new BadRequestException("정기 결제 예약 시간이 올바르지 않습니다.");
        }
    }

    private ZoneId resolveZoneId(String timezone, Long userId) {
        if (StringUtils.hasText(timezone)) {
            try {
                return ZoneId.of(timezone.trim());
            } catch (DateTimeException ex) {
                log.warn("타임존 파싱 실패 - timezone='{}', 기본값({}) 사용", timezone, defaultTimezone);
            }
        }

        if (userId != null) {
            return userRepository.findById(userId)
                    .map(UserEntity::getTimezone)
                    .filter(tz -> tz != null && !tz.isBlank())
                    .map(String::trim)
                    .flatMap(this::safeZoneId)
                    .orElseGet(() -> ZoneId.of(defaultTimezone));
        }

        return ZoneId.of(defaultTimezone);
    }

    private LocalTime resolveBillingTime(String billingTime) {
        if (!StringUtils.hasText(billingTime)) {
            return parseDefaultBillingTime();
        }
        try {
            return LocalTime.parse(billingTime.trim());
        } catch (DateTimeParseException ex) {
            log.warn("청구 시각 파싱 실패 - billingTime='{}', 기본값({}) 사용", billingTime, defaultBillingTime);
            return parseDefaultBillingTime();
        }
    }

    private LocalTime parseDefaultBillingTime() {
        if (!StringUtils.hasText(defaultBillingTime)) {
            return FALLBACK_BILLING_TIME;
        }
        try {
            return LocalTime.parse(defaultBillingTime.trim());
        } catch (DateTimeParseException ex) {
            log.warn("기본 청구 시각 파싱 실패 - defaultBillingTime='{}', 09:00 사용", defaultBillingTime);
            return FALLBACK_BILLING_TIME;
        }
    }

    private Optional<ZoneId> safeZoneId(String timezone) {
        try {
            return Optional.of(ZoneId.of(timezone));
        } catch (DateTimeException ex) {
            log.warn("사용자 타임존 파싱 실패 - timezone='{}', 기본값({}) 사용", timezone, defaultTimezone);
            return Optional.empty();
        }
    }

    private void linkInvoiceForInitialPayment(SubscriptionEntity subscription,
            String paymentId,
            LocalDate periodEnd,
            OffsetDateTime nextBillingAt,
            BigDecimal amount,
            String description) {
        try {
            LocalDate periodStart = LocalDate.now();
            InvoiceEntity invoice = invoiceService.createInvoice(
                    subscription.getSubscriptionId(),
                    subscription.getUserId(),
                    periodStart,
                    periodEnd != null ? periodEnd : periodStart.plusMonths(1),
                    amount != null ? amount : BigDecimal.ZERO,
                    "KRW",
                    true);
            // 멤버십 라인 기록
            InvoiceLineEntity line = invoiceLineFactory.membershipLine(
                    invoice.getInvoiceId(),
                    description != null ? description : "첫 결제",
                    amount != null ? amount : BigDecimal.ZERO,
                    "KRW");
            invoiceLineRepository.save(line);
            chargeAdapterService.findPaymentById(paymentId).ifPresent(ph -> {
                ph.setInvoiceId(invoice.getInvoiceId());
                ph.setChargeType(PaymentChargeType.INITIAL);
                chargeAdapterService.savePayment(ph);
            });
            log.info("[Invoice] 첫 결제 인보이스 연결 - subscriptionId={}, invoiceId={}, paymentId={}",
                    subscription.getSubscriptionId(), invoice.getInvoiceId(), paymentId);
        } catch (Exception ex) {
            log.warn("[Invoice] 첫 결제 인보이스 생성/연결 실패 - subscriptionId={}, paymentId={}, message={}",
                    subscription.getSubscriptionId(), paymentId, ex.getMessage());
        }
    }

    private String resolveOrderName(String orderName) {
        return (orderName == null || orderName.isBlank())
                ? "NomadRank 멤버십 구독"
                : orderName;
    }

    private String normalizeInterval(String interval) {
        if (interval == null || interval.isBlank()) {
            throw new BadRequestException("반복 주기는 필수입니다.");
        }
        return interval.trim().toUpperCase(Locale.ROOT);
    }

    private BillingCycle resolveBillingCycle(String interval) {
        String normalizedInterval = normalizeInterval(interval);
        if ("YEAR".equals(normalizedInterval) || "YEARLY".equals(normalizedInterval)) {
            return BillingCycle.YEARLY;
        }
        return BillingCycle.MONTHLY;
    }

    /**
     * 포트원 빌링키 발급 완료 처리
     */
    @Transactional
    public SubscriptionResponse completeBillingKey(BillingKeyCompleteRequest request, Long userId) {
        try {
            log.info("빌링키 발급 완료 처리 시작 - 사용자: {}, 발급ID: {}", userId, request.getIssueId());

            BillingKeyInfoResponse billingKeyInfo = extractBillingKeyInfo(request);
            if (billingKeyInfo == null) {
                billingKeyInfo = portOneV2Client.getBillingKeyInfo(request.getIssueId());
            }

            if (billingKeyInfo == null || billingKeyInfo.getBillingKey() == null) {
                throw new IllegalStateException("빌링키 정보를 조회할 수 없습니다");
            }

            BillingKeyEntity billingKeyEntity = saveBillingKey(billingKeyInfo, userId);

            SubscriptionResponse.FirstPaymentResult firstPaymentResult = executeFirstPayment(
                    billingKeyEntity, userId, request.getPaymentId());

            if (!firstPaymentResult.isSuccess()) {
                String errorMessage = Optional.ofNullable(firstPaymentResult.getErrorMessage())
                        .filter(msg -> !msg.isBlank())
                        .orElse("첫 결제에 실패했습니다. 다시 시도해주세요.");
                throw new BadRequestException(errorMessage);
            }

            SubscriptionEntity subscription;
            MembershipActivationResult activationResult = null;
            try {
                // 1) 첫 결제 성공 후 멤버십을 즉시 활성화한다.
                activationResult = activateUserMembershipAfterPayment(userId, firstPaymentResult);
                MembershipUserEntity activatedMembership = activationResult.activatedMembership();

                // 2) 활성화된 멤버십 기간을 결제 시점 기준으로 재계산하고, 다음 결제 일정(월/연)을 계산한다.
                LocalDateTime paidAt = firstPaymentResult.getPaidAt() != null
                        ? firstPaymentResult.getPaidAt()
                        : LocalDateTime.now();
                OffsetDateTime paidAtOffset = paidAt.atZone(ZoneId.systemDefault()).toOffsetDateTime();

                BillingCycle billingCycle = resolveBillingCycleFromMembership(activatedMembership);

                if (activatedMembership.getStartDate() == null
                        || activatedMembership.getStartDate().isAfter(paidAt.toLocalDate())) {
                    activatedMembership.setStartDate(paidAt.toLocalDate());
                }
                if (activatedMembership.getEndDate() == null
                        || activatedMembership.getEndDate().isBefore(activatedMembership.getStartDate())) {
                    activatedMembership.setEndDate(billingCycle == BillingCycle.YEARLY
                            ? activatedMembership.getStartDate().plusYears(1)
                            : activatedMembership.getStartDate().plusMonths(1));
                }
                membershipUserRepository.save(activatedMembership);

                LocalDate nextBillingDate = resolveNextBillingDate(activatedMembership, billingCycle,
                        paidAt.toLocalDate());
                OffsetDateTime nextBillingAt = billingCycle == BillingCycle.YEARLY
                        ? paidAtOffset.plusYears(1)
                        : paidAtOffset.plusMonths(1);

                OffsetDateTime scheduleAt = nextBillingAt;

                // 3) 계산된 일정으로 포트원 반복 결제를 바로 예약한다.
                String customerId = Optional.ofNullable(request.getCustomerId())
                        .filter(id -> !id.isBlank())
                        .orElse(String.valueOf(userId));

                String nextPaymentId = paymentIdGenerator.generate(userId, nextBillingDate);

                PaymentScheduleCreateResponse reservationResponse = recurringPaymentScheduleService.createReservation(
                        billingKeyEntity,
                        nextPaymentId,
                        firstPaymentResult.getAmount(),
                        "KRW",
                        scheduleAt,
                        resolveOrderName(firstPaymentResult.getMembershipLevel()),
                        Map.of("id", customerId));

                subscription = createSubscription(
                        billingKeyEntity,
                        userId,
                        firstPaymentResult,
                        reservationResponse,
                        billingCycle,
                        nextBillingDate,
                        nextBillingAt);

                usageResetService.resetUsage(
                        activationResult.activatedMembership(),
                        subscription,
                        subscription.getBillingCycle(),
                        true);
            } catch (Exception postPaymentException) {
                log.error("첫 결제 완료 후 구독 활성화/예약/생성 단계에서 실패 - userId={}, paymentId={}",
                        userId, request.getPaymentId(), postPaymentException);

                String cancelReason = "SUBSCRIPTION_ACTIVATION_FAILED";
                String portOnePaymentId = Optional.ofNullable(firstPaymentResult.getPaymentId())
                        .filter(id -> !id.isBlank())
                        .orElse(request.getPaymentId());

                membershipRollbackService.rollbackToPreviousPlan(
                        activationResult != null ? activationResult.rollbackContext() : null);

                PaymentResponse cancelResponse = compensateActivationFailure(
                        request.getPaymentId(),
                        portOnePaymentId,
                        firstPaymentResult.getAmount(),
                        cancelReason);

                String userMessage = cancelResponse.isSuccess()
                        ? "구독 처리 중 오류가 발생하여 결제를 취소했습니다. 잠시 후 다시 시도해주세요."
                        : "구독 처리 중 오류가 발생했고 결제 취소에 실패했습니다. 관리자에게 문의해주세요.";

                throw new BadRequestException(userMessage);
            }

            chargeAdapterService.findPaymentById(request.getPaymentId())
                    .ifPresent(Charge -> {
                        Charge.setSubscriptionId(subscription.getSubscriptionId());
                        chargeAdapterService.savePayment(Charge);
                    });

            SubscriptionResponse.CardInfo cardInfo = SubscriptionResponse.CardInfo.builder()
                    .last4Digits(PaymentUtils.extractLast4Digits(billingKeyEntity.getMaskedCardNumber()))
                    .issuerName(billingKeyEntity.getIssuerName())
                    .cardType(billingKeyEntity.getCardType())
                    .build();

            SubscriptionResponse response = SubscriptionResponse.from(subscription, firstPaymentResult, cardInfo);

            log.info("빌링키 발급 완료 처리 성공 - 구독ID: {}", subscription.getSubscriptionId());
            return response;

        } catch (BadRequestException e) {
            log.warn("빌링키 발급 완료 처리 실패(사용자 요청 오류) - 사용자: {}, message: {}", userId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("빌링키 발급 완료 처리 실패 - 사용자: {}", userId, e);
            throw new RuntimeException("빌링키 발급 처리에 실패했습니다: " + e.getMessage());
        }
    }

    /**
     * 활성 빌링키 조회
     */
    public List<BillingKeyEntity> getActiveBillingKeys(Long userId) {
        return billingKeyRepository.findByUserIdAndStatus(userId, BillingKeyEntity.BillingKeyStatus.ACTIVE);
    }

    /**
     * 빌링키 삭제(상태 변경)
     */
    @Transactional
    public void deleteBillingKey(String issueId, Long userId) {
        BillingKeyEntity billingKey = billingKeyRepository.findByIssueIdAndUserId(issueId, userId)
                .orElseThrow(() -> new IllegalArgumentException("빌링키를 찾을 수 없습니다"));

        billingKey.setStatus(BillingKeyEntity.BillingKeyStatus.DELETED);
        billingKeyRepository.save(billingKey);

        log.info("빌링키 삭제 완료 - 발급ID: {}, 사용자: {}", issueId, userId);
    }

    /**
     * 구독 해지 및 빌링키 삭제
     */
    @Transactional
    public SubscriptionCancelResponse cancelSubscription(Long userId, String subscriptionId,
            SubscriptionCancelRequest request) {

        String reasonCode = request.getReasonCode() != null ? request.getReasonCode().name() : "UNKNOWN";
        log.info("구독 해지 요청 수신 - userId={}, subscriptionId={}, reasonCode={}",
                userId, subscriptionId, reasonCode);

        SubscriptionEntity subscription = subscriptionRepository
                .findBySubscriptionIdAndUserId(subscriptionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("구독 정보를 찾을 수 없습니다."));

        if (subscription.getStatus() == SubscriptionStatus.CANCELLED
                || subscription.getStatus() == SubscriptionStatus.EXPIRED) {
            throw new ResourceNotFoundException("이미 해지된 구독입니다.");
        }

        String operationId = resolveOperationId(request.getOperationId(), "cancel", userId);
        String eventId = "cancel-" + subscriptionId + "-" + operationId;
        if (subscriptionEventProcessor.isDuplicate(eventId)) {
            log.info("[Cancel] 중복 해지 요청 무시 - eventId={}, subscriptionId={}", eventId, subscriptionId);
            return SubscriptionCancelResponse.builder()
                    .status(subscription.getStatus().name())
                    .canceledAt(Optional.ofNullable(subscription.getEndDate())
                            .orElse(LocalDate.now())
                            .atStartOfDay()
                            .atZone(ZoneId.systemDefault())
                            .toOffsetDateTime())
                    .scheduleRemoved(false)
                    .scheduleRevokedAt(null)
                    .refundEligible(false)
                    .refundAmount(null)
                    .refundStatus(null)
                    .refundMessage("이미 처리된 요청입니다.")
                    .refundedAt(null)
                    .build();
        }

        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자 정보를 찾을 수 없습니다."));

        boolean scheduleRemoved = false;
        OffsetDateTime revokedAt = null;

        Optional<BillingKeyEntity> billingKeyOpt = Optional.empty();
        if (subscription.getIssueId() != null && !subscription.getIssueId().isBlank()) {
            billingKeyOpt = billingKeyRepository.findByIssueIdAndUserId(subscription.getIssueId(), userId);
        }

        if (billingKeyOpt.isPresent()) {
            BillingKeyEntity billingKey = billingKeyOpt.get();
            try {
                var deleteResponse = recurringPaymentScheduleService.deleteSchedulesByBillingKey(billingKey);
                if (deleteResponse.isPresent()) {
                    scheduleRemoved = true;
                    revokedAt = deleteResponse.map(PaymentScheduleDeleteResponse::getRevokedAt).orElse(null);
                    subscription.setScheduleStatus(SubscriptionScheduleStatus.CANCELLED);
                    subscription.setScheduleLastSyncedAt(OffsetDateTime.now());
                    subscription.setScheduleId(null);
                }
            } catch (PortOneApiException ex) {
                throw new ConflictException("예약 결제 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
        }

        LocalDate scheduledCancelDate = subscription.getNextBillingDate();
        if (scheduledCancelDate == null || scheduledCancelDate.isBefore(LocalDate.now())) {
            scheduledCancelDate = LocalDate.now();
        }

        subscription.setStatus(SubscriptionStatus.PENDING_CANCEL);
        subscription.setCancelScheduledAt(scheduledCancelDate);
        subscription.setPendingMembershipId(null);
        subscription.setPendingMembershipLevel(null);
        subscription.setPendingMembershipName(null);
        subscription.setPendingBillingCycle(null);
        subscription.setPendingReason(null);
        subscription.setPendingAppliedAt(null);
        subscription.setUpdatedAt(LocalDateTime.now());
        subscriptionRepository.save(subscription);

        MembershipEntity membership = findMembershipForSubscription(subscription).orElse(null);
        LocalDate cancelDate = LocalDate.now();
        boolean hasUsage = hasUsageRecords(user, subscription.getStartDate(), cancelDate);
        RefundCalculator.Result refundResult = refundCalculator.calculate(subscription, membership, cancelDate,
                hasUsage);
        RefundExecution refundExecution = refundResult.shouldRefund()
                ? executeRefund(subscription, refundResult, reasonCode)
                : RefundExecution.notEligible(refundResult.getPolicyMessage());

        LocalDate effectiveCancelDate = scheduledCancelDate;
        if (refundExecution.isProcessed() && refundResult.isFullRefund()) {
            log.info("전액 환불 조건 충족 - 즉시 CANCEL 처리 및 FREE 복귀 userId={} subscriptionId={}",
                    userId, subscriptionId);
            applyImmediateCancellationAfterFullRefund(subscription, user, cancelDate, billingKeyOpt);
            effectiveCancelDate = cancelDate;
        }

        subscriptionEventProcessor.processEvent(
                eventId,
                subscription.getSubscriptionId(),
                subscription.getStatus(),
                SubscriptionEventType.USER_CANCEL_REQUESTED,
                "REST",
                operationId,
                () -> subscription.getStatus());

        log.info("구독 해지 요청 처리 완료 - userId={}, subscriptionId={}, status={}, cancelDate={}, scheduleRemoved={}",
                userId, subscriptionId, subscription.getStatus(), effectiveCancelDate, scheduleRemoved);

        return SubscriptionCancelResponse.builder()
                .status(subscription.getStatus().name())
                .canceledAt(effectiveCancelDate.atStartOfDay().atZone(ZoneId.systemDefault()).toOffsetDateTime())
                .scheduleRemoved(scheduleRemoved)
                .scheduleRevokedAt(revokedAt)
                .refundEligible(refundResult.shouldRefund())
                .refundAmount(refundExecution.getAmount())
                .refundStatus(refundExecution.getStatus())
                .refundMessage(refundExecution.getMessage())
                .refundedAt(refundExecution.getRefundedAt())
                .build();
    }

    private Optional<MembershipEntity> findMembershipForSubscription(SubscriptionEntity subscription) {
        if (subscription == null) {
            return Optional.empty();
        }
        String membershipLevel = subscription.getMembershipLevel();
        if (membershipLevel != null) {
            try {
                return membershipRepository.findByLevelAndDeleteDateIsNull(Integer.parseInt(membershipLevel));
            } catch (NumberFormatException ignored) {
            }
        }
        if (subscription.getMembershipName() != null) {
            return membershipRepository.findByNameAndDeleteDateIsNull(subscription.getMembershipName());
        }
        return Optional.empty();
    }

    private boolean hasUsageRecords(UserEntity user, LocalDate startDate, LocalDate cancelDate) {
        if (user == null) {
            return false;
        }
        LocalDate usageStart = startDate != null ? startDate : cancelDate;
        LocalDate usageEnd = cancelDate != null ? cancelDate : LocalDate.now();
        if (usageStart == null) {
            usageStart = LocalDate.now();
        }
        if (usageEnd.isBefore(usageStart)) {
            usageEnd = usageStart;
        }
        LocalDateTime from = usageStart.atStartOfDay();
        LocalDateTime to = usageEnd.plusDays(1).atStartOfDay();
        for (ServiceSort sort : ServiceSort.values()) {
            long count = useLogRepository.countByUserEntityAndServiceSortAndCreateDateBetween(
                    user, sort, from, to);
            if (count > 0) {
                return true;
            }
        }
        return false;
    }

    private RefundExecution executeRefund(SubscriptionEntity subscription,
            RefundCalculator.Result refundResult,
            String cancelReason) {
        ChargeEntity targetPayment = chargeAdapterService
                .findLatestPaidBySubscription(subscription.getSubscriptionId(), PaymentStatus.PAID)
                .or(() -> chargeAdapterService
                        .findSuccessfulPaymentsBySubscription(subscription.getSubscriptionId(), PaymentStatus.PAID)
                        .stream().findFirst())
                .orElseThrow(() -> new ResourceNotFoundException("환불 가능한 결제 내역을 찾을 수 없습니다."));

        PaymentResponse response;
        try {
            String portonePaymentId = Optional.ofNullable(targetPayment.getPortonePaymentId())
                    .filter(id -> !id.isBlank())
                    .orElse(targetPayment.getPaymentId());

            response = portOneV2Client.cancelPayment(
                    portonePaymentId,
                    refundResult.getRefundableAmount(),
                    cancelReason + (refundResult.isFullRefund() ? "_FULL_REFUND" : "_PARTIAL_REFUND"));
        } catch (RuntimeException ex) {
            throw new ExternalServiceException("환불 처리 중 오류가 발생했습니다.", ex);
        }

        if (response == null) {
            throw new ExternalServiceException("환불 요청에 실패했습니다.");
        }

        if (!response.isSuccess()) {
            String message = response.getErrorMessage() != null ? response.getErrorMessage() : "환불 요청에 실패했습니다.";
            if (message.toLowerCase(Locale.ROOT).contains("payment not paid")) {
                log.warn("[Refund] PortOne 취소 불가 - 이미 결제되지 않은 건입니다. subscriptionId={}, paymentId={}",
                        subscription.getSubscriptionId(), targetPayment.getPaymentId());
                return RefundExecution.notEligible("결제 상태가 미납으로 확인되어 환불 대상이 아닙니다.");
            }
            throw new ExternalServiceException(message);
        }

        targetPayment.markAsRefunded(refundResult.isFullRefund(), refundResult.getPolicyMessage());
        // 환불 인보이스/크레딧 라인 생성 및 연동
        linkRefundInvoice(subscription, targetPayment, refundResult);
        chargeAdapterService.savePayment(targetPayment);

        OffsetDateTime refundedAt = targetPayment.getCancelledAt() != null
                ? targetPayment.getCancelledAt().atZone(ZoneId.systemDefault()).toOffsetDateTime()
                : OffsetDateTime.now(ZoneId.systemDefault());

        return RefundExecution.success(refundResult.getRefundableAmount(),
                targetPayment.getStatus().name(),
                refundResult.getPolicyMessage(),
                refundedAt);
    }

    private void linkRefundInvoice(SubscriptionEntity subscription,
            ChargeEntity payment,
            RefundCalculator.Result refundResult) {
        try {
            String invoiceId = payment.getInvoiceId();
            if (invoiceId == null || invoiceId.isBlank()) {
                InvoiceEntity invoice = invoiceService.createInvoice(
                        subscription.getSubscriptionId(),
                        subscription.getUserId(),
                        LocalDate.now(),
                        LocalDate.now(),
                        refundResult.getRefundableAmount().negate(),
                        payment.getCurrency(),
                        true);
                invoiceId = invoice.getInvoiceId();
                InvoiceLineEntity refundLine = invoiceLineFactory.refundLine(
                        invoiceId,
                        "환불(" + refundResult.getPolicyMessage() + ")",
                        refundResult.getRefundableAmount().abs(),
                        payment.getCurrency());
                invoiceLineRepository.save(refundLine);
            } else {
                InvoiceLineEntity refundLine = invoiceLineFactory.refundLine(
                        invoiceId,
                        "환불(" + refundResult.getPolicyMessage() + ")",
                        refundResult.getRefundableAmount().abs(),
                        payment.getCurrency());
                invoiceLineRepository.save(refundLine);
            }
            payment.setInvoiceId(invoiceId);
            payment.setChargeType(PaymentChargeType.REFUND);
        } catch (Exception ex) {
            log.warn("[Invoice] 환불 인보이스 생성/연결 실패 - subscriptionId={}, paymentId={}, message={}",
                    subscription.getSubscriptionId(), payment.getPaymentId(), ex.getMessage());
        }
    }

    private void applyImmediateCancellationAfterFullRefund(SubscriptionEntity subscription,
            UserEntity user,
            LocalDate cancelDate,
            Optional<BillingKeyEntity> billingKeyOpt) {

        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscription.setEndDate(cancelDate);
        subscription.setCancelScheduledAt(null);
        subscription.setNextBillingDate(null);
        subscription.setUpdatedAt(LocalDateTime.now());
        subscriptionRepository.save(subscription);

        billingKeyOpt.ifPresent(billingKey -> revokeBillingKey(billingKey, "USER_CANCEL_FULL_REFUND"));

        expireActiveMembership(user, cancelDate);
        activateFreeMembershipIfMissing(user, cancelDate);
    }

    private void revokeBillingKey(BillingKeyEntity billingKey, String reason) {
        try {
            String decryptedKey = billingKeyEncryptionUtil.decrypt(billingKey.getBillingKey());
            portOneV2Client.deleteBillingKey(decryptedKey, reason);
        } catch (PortOneApiException ex) {
            log.warn("[BillingKey] PortOne 삭제 실패 - issueId={}, status={}, message={}",
                    billingKey.getIssueId(), ex.getStatusCode(), ex.getMessage());
        } catch (Exception e) {
            log.warn("[BillingKey] 삭제 처리 중 예외 - issueId={}", billingKey.getIssueId(), e);
        }

        billingKey.setStatus(BillingKeyEntity.BillingKeyStatus.DELETED);
        billingKey.setExpiredAt(LocalDateTime.now());
        billingKeyRepository.save(billingKey);
    }

    private void expireActiveMembership(UserEntity user, LocalDate cancelDate) {
        membershipUserRepository.findByUserEntityAndMembershipState(user, MembershipState.ACTIVATE)
                .ifPresent(active -> {
                    active.setMembershipState(MembershipState.EXPIRED);
                    if (active.getEndDate() == null || active.getEndDate().isAfter(cancelDate)) {
                        active.setEndDate(cancelDate);
                    }
                    membershipUserRepository.save(active);
                    saveMembershipLog(active, "CANCEL_SUBSCRIPTION");
                });
    }

    private void activateFreeMembershipIfMissing(UserEntity user, LocalDate startDate) {
        boolean hasActiveMembership = membershipUserRepository
                .findByUserEntityAndMembershipState(user, MembershipState.ACTIVATE)
                .isPresent();
        if (hasActiveMembership) {
            return;
        }

        membershipRepository.findFreeMembership()
                .or(() -> Optional.ofNullable(membershipRepository.findByName("FREE")))
                .ifPresentOrElse(freeMembership -> {
                    MembershipUserEntity freeMembershipUser = MembershipUserEntity.builder()
                            .userEntity(user)
                            .membershipEntity(freeMembership)
                            .startDate(startDate)
                            .endDate(null)
                            .membershipState(MembershipState.ACTIVATE)
                            .build();
                    membershipUserRepository.save(freeMembershipUser);
                    saveMembershipLog(freeMembershipUser, "ACTIVATE_FREE_AFTER_REFUND");
                    log.info("[SubscriptionCancel] FREE 멤버십 활성화 완료 - userId={}", user.getId());
                }, () -> log.warn("[SubscriptionCancel] FREE 멤버십 정보를 찾을 수 없습니다. userId={}", user.getId()));
    }

    private static class RefundExecution {
        private final boolean processed;
        private final BigDecimal amount;
        private final String status;
        private final String message;
        private final OffsetDateTime refundedAt;

        private RefundExecution(boolean processed,
                BigDecimal amount,
                String status,
                String message,
                OffsetDateTime refundedAt) {
            this.processed = processed;
            this.amount = amount;
            this.status = status;
            this.message = message;
            this.refundedAt = refundedAt;
        }

        static RefundExecution notEligible(String message) {
            return new RefundExecution(false, BigDecimal.ZERO, "NOT_ELIGIBLE", message, null);
        }

        static RefundExecution success(BigDecimal amount, String status, String message, OffsetDateTime refundedAt) {
            return new RefundExecution(true, amount, status, message, refundedAt);
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public String getStatus() {
            return status;
        }

        public String getMessage() {
            return message;
        }

        public OffsetDateTime getRefundedAt() {
            return refundedAt;
        }

        public boolean isProcessed() {
            return processed;
        }
    }

    private BillingKeyInfoResponse extractBillingKeyInfo(BillingKeyCompleteRequest request) {
        BillingKeyCompleteRequest.IssueResponse issueResponse = request.getIssueResponse();
        if (issueResponse == null) {
            log.debug("IssueResponse 가 없어 포트원 API 조회를 시도합니다 - issueId={}", request.getIssueId());
            return null;
        }

        BillingKeyInfoResponse.BillingKeyInfoResponseBuilder builder = BillingKeyInfoResponse.builder()
                .issueId(request.getIssueId())
                .billingKey(request.getBillingKey())
                .status("ISSUED");

        BillingKeyCompleteRequest.IssueResponse.CardInfo responseCardInfo = issueResponse.getCardInfo();
        BillingKeyInfoResponse.CardInfo.CardInfoBuilder cardBuilder = BillingKeyInfoResponse.CardInfo.builder();

        if (responseCardInfo != null) {
            cardBuilder
                    .issuerName(responseCardInfo.getIssuerName())
                    .cardType(responseCardInfo.getCardType())
                    .brand(responseCardInfo.getBin());
            if (responseCardInfo.getLast4Digits() != null) {
                cardBuilder.maskedNumber("****-****-****-" + responseCardInfo.getLast4Digits());
            }
        }

        if (issueResponse.getMethod() != null && issueResponse.getMethod().getCard() != null) {
            var credential = issueResponse.getMethod().getCard().getCredential();
            if (credential != null && credential.getNumber() != null) {
                String number = credential.getNumber();
                cardBuilder.maskedNumber(PaymentUtils.maskCardNumber(number));
            }
            if (issueResponse.getMethod().getCard().getIssuerName() != null) {
                cardBuilder.issuerName(issueResponse.getMethod().getCard().getIssuerName());
            }
            if (issueResponse.getMethod().getCard().getType() != null) {
                cardBuilder.cardType(issueResponse.getMethod().getCard().getType());
            }
        }

        builder.cardInfo(cardBuilder.build());
        return builder.build();
    }

    private BillingKeyEntity saveBillingKey(BillingKeyInfoResponse billingKeyInfo, Long userId) {

        List<BillingKeyEntity> activeBillingKeys = billingKeyRepository
                .findByUserIdAndStatus(userId, BillingKeyEntity.BillingKeyStatus.ACTIVE);

        for (BillingKeyEntity activeBillingKey : activeBillingKeys) {
            activeBillingKey.setStatus(BillingKeyEntity.BillingKeyStatus.DELETED);
            billingKeyRepository.save(activeBillingKey);
        }

        BillingKeyInfoResponse.CardInfo cardInfo = billingKeyInfo.getCardInfo();
        String maskedCardNumber = cardInfo != null ? cardInfo.getMaskedNumber() : null;
        String issuerName = cardInfo != null ? cardInfo.getIssuerName() : null;
        String cardType = cardInfo != null ? cardInfo.getCardType() : null;
        String cardBrand = cardInfo != null ? cardInfo.getBrand() : null;

        BillingKeyEntity entity = BillingKeyEntity.builder()
                .issueId(billingKeyInfo.getIssueId())
                .userId(userId)
                .billingKey(billingKeyEncryptionUtil.encrypt(billingKeyInfo.getBillingKey()))
                .maskedCardNumber(maskedCardNumber)
                .issuerName(issuerName)
                .cardType(cardType)
                .cardBrand(cardBrand)
                .status(BillingKeyEntity.BillingKeyStatus.ACTIVE)
                .build();

        return billingKeyRepository.save(entity);
    }

    private SubscriptionResponse.FirstPaymentResult executeFirstPayment(
            BillingKeyEntity billingKeyEntity, Long userId, String paymentId) {

        try {
            ChargeEntity Charge = chargeAdapterService.findPaymentById(paymentId)
                    .orElseThrow(() -> new IllegalArgumentException("결제 내역을 찾을 수 없습니다: " + paymentId));

            UserEntity user = userRepository.findByIdAndDeleteDateIsNull(Charge.getUserId())
                    .orElseThrow(
                            () -> new IllegalArgumentException("사용자 정보를 찾을 수 없습니다: " + Charge.getUserId()));

            Map<String, Object> customerPayload = PaymentUtils.buildCustomerPayload(user);
            String decryptedBillingKey = billingKeyEncryptionUtil.decrypt(billingKeyEntity.getBillingKey());
            String firstPaymentId = "first_payment_" + System.currentTimeMillis();

            BillingKeyPaymentRequest paymentRequest = BillingKeyPaymentRequest.builder()
                    .paymentId(firstPaymentId)
                    .billingKey(decryptedBillingKey)
                    .orderName(Charge.getOrderName())
                    .amount(Charge.getAmount())
                    .currency(Charge.getCurrency())
                    .customer(customerPayload)
                    .build();

            log.info("[FirstPayment] 요청 시작 - userId={}, orderName={}, amount={}, billingKey={}",
                    userId, paymentRequest.getOrderName(), paymentRequest.getAmount(),
                    PaymentUtils.maskBillingKey(decryptedBillingKey));

            PaymentResponse paymentResponse = portOneV2Client.payWithBillingKey(paymentRequest);

            log.info("[FirstPayment] PortOne 응답 - success={}, status={}, paidAt={}, message={}",
                    paymentResponse.isSuccess(), paymentResponse.getStatus(),
                    paymentResponse.getPaidAt(), paymentResponse.getErrorMessage());

            if (paymentResponse.isSuccess()) {
                Charge.markAsPaid();
                Charge.setPaidAt(LocalDateTime.now());
                Charge.setPortonePaymentId(firstPaymentId);
                chargeAdapterService.savePayment(Charge);

                log.info("[FirstPayment] 결제 성공 - userId={}, paymentId={}, amount={}",
                        userId, firstPaymentId, Charge.getAmount());

                return SubscriptionResponse.FirstPaymentResult.builder()
                        .success(true)
                        .paymentId(firstPaymentId)
                        .amount(Charge.getAmount())
                        .paidAt(LocalDateTime.now())
                        .membershipLevel(Charge.getOrderName())
                        .status("PAID")
                        .membershipId(Charge.getMembershipId())
                        .membershipUserId(Charge.getMembershipUserId())
                        .errorMessage(null)
                        .build();
            } else {
                String failMsg = Optional.ofNullable(paymentResponse.getErrorMessage())
                        .orElse("결제 실패: 포트원 응답에서 오류 메시지가 없습니다.");

                Charge.markAsFailed(failMsg, paymentResponse.getPgResponseCode());
                Charge.setPortonePaymentId(firstPaymentId);
                chargeAdapterService.savePayment(Charge);

                log.error("[FirstPayment] 결제 실패 - userId={}, paymentId={}, message={}", userId, firstPaymentId,
                        failMsg);

                return SubscriptionResponse.FirstPaymentResult.builder()
                        .success(false)
                        .paymentId(firstPaymentId)
                        .amount(Charge.getAmount())
                        .paidAt(null)
                        .membershipLevel(Charge.getOrderName())
                        .status("FAILED")
                        .membershipId(Charge.getMembershipId())
                        .membershipUserId(Charge.getMembershipUserId())
                        .errorMessage(failMsg)
                        .build();
            }

        } catch (Exception e) {
            log.error("첫 결제 실행 실패 - userId={}, paymentId={}, message={}", userId, paymentId, e.getMessage(), e);
            throw new RuntimeException("첫 결제 실행에 실패했습니다: " + e.getMessage(), e);
        }
    }

    private SubscriptionEntity createSubscription(BillingKeyEntity billingKeyEntity, Long userId,
            SubscriptionResponse.FirstPaymentResult firstPaymentResult,
            PaymentScheduleCreateResponse reservationResponse,
            BillingCycle billingCycle,
            LocalDate requestedNextBillingDate,
            OffsetDateTime requestedNextBillingAt) {

        List<BillingKeyEntity> existingKeys = billingKeyRepository.findByUserIdAndStatus(
                userId, BillingKeyEntity.BillingKeyStatus.ACTIVE);

        if (!existingKeys.isEmpty() && existingKeys.stream()
                .anyMatch(k -> !k.getIssueId().equals(billingKeyEntity.getIssueId()))) {
            log.warn("이미 존재하는 빌링키 - userId={}, 기존 issueId={}", userId, existingKeys.get(0).getIssueId());
            throw new BadRequestException("이미 등록된 결제 수단이 존재합니다. 기존 결제를 해지 후 다시 시도해주세요.");
        }

        boolean hasActiveSub = subscriptionRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.ACTIVE)
                .isPresent();

        if (hasActiveSub) {
            throw new BadRequestException("이미 활성 구독이 존재합니다. 먼저 구독을 해지해주세요.");
        }

        boolean hasPendingSub = subscriptionRepository
                .findByUserIdAndStatusOrderByCreatedAtDesc(userId, SubscriptionStatus.PENDING)
                .isPresent();

        if (hasPendingSub) {
            throw new BadRequestException("처리 중인 구독이 있습니다. 결제 결과를 확인한 뒤 다시 시도해주세요.");
        }
        BillingCycle resolvedBillingCycle = billingCycle != null ? billingCycle : BillingCycle.MONTHLY;
        LocalDate nextBillingDate = requestedNextBillingDate != null
                ? requestedNextBillingDate
                : recurringPaymentScheduleService.getDefaultNextBillingDate(resolvedBillingCycle);

        String reservationId = Optional.ofNullable(reservationResponse)
                .map(PaymentScheduleCreateResponse::getScheduleId)
                .filter(id -> !id.isBlank())
                .orElse(null);

        OffsetDateTime nextBillingAt = requestedNextBillingAt != null
                ? requestedNextBillingAt
                : Optional.ofNullable(reservationResponse)
                        .map(PaymentScheduleCreateResponse::getTimeToPay)
                        .orElseGet(() -> recurringPaymentScheduleService.toOffsetDateTime(nextBillingDate));

        MembershipEntity membership = Optional.ofNullable(firstPaymentResult.getMembershipId())
                .flatMap(membershipRepository::findById)
                .orElse(null);

        String resolvedMembershipLevel = Optional.ofNullable(membership)
                .map(MembershipEntity::getLevel)
                .map(String::valueOf)
                .orElseGet(() -> Optional.ofNullable(firstPaymentResult.getMembershipLevel())
                        .filter(level -> !level.isBlank())
                        .orElse("dplog 멤버십"));

        String resolvedMembershipName = Optional.ofNullable(membership)
                .map(MembershipEntity::getName)
                .filter(name -> !name.isBlank())
                .orElseGet(() -> Optional.ofNullable(firstPaymentResult.getMembershipLevel())
                        .filter(name -> !name.isBlank())
                        .orElse("dplog 멤버십"));

        SubscriptionEntity subscriptionEntity = SubscriptionEntity.builder()
                .issueId(billingKeyEntity.getIssueId())
                .userId(userId)
                .membershipLevel(resolvedMembershipLevel)
                .membershipName(resolvedMembershipName)
                .amount(firstPaymentResult.getAmount())
                .billingCycle(resolvedBillingCycle)
                .billingDay(nextBillingDate.getDayOfMonth())
                .status(SubscriptionStatus.ACTIVE)
                .scheduleId(reservationId)
                .scheduleStatus(reservationId != null ? SubscriptionScheduleStatus.PENDING
                        : SubscriptionScheduleStatus.UNKNOWN)
                .scheduleLastSyncedAt(OffsetDateTime.now())
                .nextBillingAt(nextBillingAt)
                .nextBillingDate(nextBillingDate)
                .failureCount(0)
                .startDate(LocalDate.now())
                .build();

        if (reservationId != null) {
            subscriptionEntity.setSubscriptionId(reservationId);
        }

        SubscriptionEntity saved = subscriptionRepository.save(subscriptionEntity);

        // 첫 결제 인보이스 생성 및 결제 기록 연결
        linkInvoiceForInitialPayment(saved, firstPaymentResult.getPaymentId(), nextBillingDate, nextBillingAt,
                firstPaymentResult.getAmount(), resolvedMembershipName);
        return saved;
    }

    private BillingCycle resolveBillingCycleFromMembership(MembershipUserEntity membershipUser) {
        if (membershipUser == null || membershipUser.getStartDate() == null || membershipUser.getEndDate() == null) {
            return BillingCycle.MONTHLY;
        }

        long months = ChronoUnit.MONTHS.between(membershipUser.getStartDate(), membershipUser.getEndDate());
        if (months >= 11) {
            return BillingCycle.YEARLY;
        }
        return BillingCycle.MONTHLY;
    }

    private LocalDate resolveNextBillingDate(MembershipUserEntity membershipUser, BillingCycle billingCycle,
            LocalDate paidDate) {
        LocalDate baseDate = paidDate != null ? paidDate : LocalDate.now();
        if (membershipUser != null && membershipUser.getEndDate() != null) {
            return membershipUser.getEndDate().isBefore(baseDate)
                    ? incrementByCycle(baseDate, billingCycle)
                    : membershipUser.getEndDate();
        }
        return incrementByCycle(baseDate, billingCycle);
    }

    private LocalDate incrementByCycle(LocalDate baseDate, BillingCycle billingCycle) {
        return billingCycle == BillingCycle.YEARLY
                ? baseDate.plusYears(1)
                : baseDate.plusMonths(1);
    }

    private MembershipActivationResult activateUserMembershipAfterPayment(Long userId,
            SubscriptionResponse.FirstPaymentResult result) {
        UserEntity user = userRepository.findByIdAndDeleteDateIsNull(userId)
                .orElseThrow(() -> new BadRequestException("사용자를 찾을 수 없습니다."));

        MembershipUserEntity membershipToActivate = null;

        if (result.getMembershipUserId() != null) {
            membershipToActivate = membershipUserRepository.findById(result.getMembershipUserId())
                    .orElse(null);
        }

        if (membershipToActivate == null) {
            membershipToActivate = membershipUserRepository
                    .findTopByUserEntityAndMembershipStateOrderByStartDateDesc(user, MembershipState.READY)
                    .orElse(null);
        }

        if (membershipToActivate == null) {
            membershipToActivate = membershipUserRepository
                    .findActiveMembershipByUserAndDate(user, MembershipState.ACTIVATE, LocalDate.now())
                    .orElseThrow(() -> new BadRequestException("활성화할 멤버십 정보를 찾을 수 없습니다."));
        }

        if (!membershipToActivate.getUserEntity().getId().equals(userId)) {
            throw new BadRequestException("다른 사용자의 멤버십 정보를 참조했습니다.");
        }

        final Long activateId = membershipToActivate.getId();

        MembershipRollbackContext.MembershipRollbackContextBuilder rollbackBuilder = MembershipRollbackContext.builder()
                .userId(userId);

        membershipUserRepository.findByUserEntityAndMembershipState(user, MembershipState.ACTIVATE)
                .filter(active -> !active.getId().equals(activateId))
                .ifPresent(active -> {
                    rollbackBuilder.previousMembershipId(active.getId());
                    rollbackBuilder.previousMembershipState(active.getMembershipState());
                    rollbackBuilder.previousMembershipEndDate(active.getEndDate());

                    active.setMembershipState(MembershipState.EXPIRED);
                    active.setEndDate(LocalDate.now());
                    membershipUserRepository.save(active);
                    saveMembershipLog(active, "EXPIRE_AFTER_PAYMENT");
                });

        if (membershipToActivate.getStartDate() == null
                || membershipToActivate.getStartDate().isAfter(LocalDate.now())) {
            membershipToActivate.setStartDate(LocalDate.now());
        }

        MembershipState previousState = membershipToActivate.getMembershipState() != null
                ? membershipToActivate.getMembershipState()
                : MembershipState.READY;
        rollbackBuilder.activatedMembershipId(membershipToActivate.getId());
        rollbackBuilder.activatedPreviousState(previousState);
        rollbackBuilder.activatedPreviousEndDate(membershipToActivate.getEndDate());

        membershipToActivate.setMembershipState(MembershipState.ACTIVATE);
        membershipUserRepository.save(membershipToActivate);
        saveMembershipLog(membershipToActivate, "ACTIVATE_AFTER_PAYMENT");

        log.info("✅ 결제 완료 → 멤버십 활성화 - userId={}, membershipLevel={}", userId, result.getMembershipLevel());
        return new MembershipActivationResult(membershipToActivate, rollbackBuilder.build());
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

    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = false)
    public PaymentResponse compensateActivationFailure(
            String originalPaymentId,
            String portOnePaymentId,
            BigDecimal amount,
            String cancelReason) {

        PaymentResponse cancelResponse;
        try {
            cancelResponse = portOneV2Client.cancelPayment(portOnePaymentId, amount, cancelReason);
        } catch (Exception ex) {
            log.error("포트원 결제 취소 호출 중 예외 발생 - paymentId={}", portOnePaymentId, ex);
            cancelResponse = PaymentResponse.builder()
                    .success(false)
                    .paymentId(portOnePaymentId)
                    .status("CANCEL_EXCEPTION")
                    .amount(amount)
                    .errorMessage(ex.getMessage())
                    .build();
        }

        final PaymentResponse finalCancelResponse = cancelResponse;
        chargeAdapterService.findPaymentById(originalPaymentId).ifPresent(history -> {
            if (finalCancelResponse.isSuccess()) {
                history.markAsCancelled(cancelReason);
            } else {
                history.setErrorMessage("자동 취소 실패: " + finalCancelResponse.getErrorMessage());
            }
            chargeAdapterService.savePayment(history);
        });

        return finalCancelResponse;
    }

    private record MembershipActivationResult(
            MembershipUserEntity activatedMembership,
            MembershipRollbackContext rollbackContext) {
    }
}
