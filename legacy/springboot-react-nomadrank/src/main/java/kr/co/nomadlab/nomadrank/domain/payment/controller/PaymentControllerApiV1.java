package kr.co.nomadlab.nomadrank.domain.payment.controller;

import org.apache.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import kr.co.nomadlab.nomadrank.common.constants.Constants;
import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.BillingKeyCompleteRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.BillingKeyFailRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.PaymentChargeRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.PaymentPreRegisterRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.request.SubscriptionCancelRequest;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.BillingKeyFailResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentChargeResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.PaymentPreRegisterResponse;
import kr.co.nomadlab.nomadrank.domain.payment.dto.response.SubscriptionCancelResponse;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentStatus;
import kr.co.nomadlab.nomadrank.domain.payment.service.PaymentServiceApiV1;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.request.SubscriptionDowngradeRequest;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.request.SubscriptionRequest;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.request.SubscriptionUpgradeRequest;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.response.SubscriptionDowngradeResponse;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.response.SubscriptionReservationResponse;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.response.SubscriptionResponse;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.response.SubscriptionStatusResponse;
import kr.co.nomadlab.nomadrank.domain.subscription.dto.response.SubscriptionUpgradeResponse;
import kr.co.nomadlab.nomadrank.domain.subscription.service.SubscriptionServiceApiV1;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 결제 API 컨트롤러 V1
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/payments")
@Validated
public class PaymentControllerApiV1 {

        private final PaymentServiceApiV1 paymentService;
        private final SubscriptionServiceApiV1 subscriptionService;

        /**
         * 결제 사전등록
         */
        @PostMapping("/pre-register")
        public ResponseEntity<ResDTO<PaymentPreRegisterResponse>> preRegisterPayment(
                        @Valid @RequestBody PaymentPreRegisterRequest request,
                        HttpSession session) {
                ResAuthInfoDTOApiV1 authInfo = getAuthInfo(session);

                log.info("결제 사전등록 요청 - 사용자: {}, 멤버십 레벨: {}",
                                authInfo.getUser().getId(), request.getMembershipLevel());

                PaymentPreRegisterResponse response = paymentService.preRegisterPayment(
                                authInfo.getUser().getId(),
                                request);

                return ResponseEntity.ok(ResDTO.<PaymentPreRegisterResponse>builder()
                                .code(0)
                                .message("success")
                                .data(response)
                                .build());
        }

        /**
         * 단건 결제
         */
        @PostMapping("/charge")
        public ResponseEntity<ResDTO<PaymentChargeResponse>> charge(
                        @Valid @RequestBody PaymentChargeRequest request,
                        HttpSession session) {

                ResAuthInfoDTOApiV1 authInfo = getAuthInfo(session);
                log.info("단건 결제 요청 수신 - userId={}, orderId={}, amount={}, issueId={}",
                                authInfo.getUser().getId(), request.getOrderId(), request.getAmount(),
                                request.getIssueId());
                PaymentChargeResponse response = paymentService.charge(authInfo.getUser().getId(), request);

                return ResponseEntity.status(HttpStatus.SC_NOT_IMPLEMENTED)
                                .body(ResDTO.<PaymentChargeResponse>builder()
                                                .code(HttpStatus.SC_NOT_IMPLEMENTED)
                                                .message("단건 결제 연동은 준비 중입니다.")
                                                .data(response)
                                                .build());
        }

        /**
         * 빌링키 발급 완료 처리
         */
        @PostMapping("/billing-key/complete")
        public ResponseEntity<ResDTO<SubscriptionResponse>> completeBillingKey(
                        @Valid @RequestBody BillingKeyCompleteRequest request,
                        HttpSession session) {

                try {
                        // 세션에서 사용자 정보 가져오기
                        ResAuthInfoDTOApiV1 authInfo = getAuthInfo(session);
                        Long userId = authInfo.getUser().getId();
                        log.info("빌링키 발급 완료 요청 수신 - userId={}, issueId={}, paymentId={}, customerId={}",
                                        userId, request.getIssueId(), request.getPaymentId(), request.getCustomerId());

                        SubscriptionResponse response = paymentService.completeBillingKey(request, userId);

                        return ResponseEntity.ok(ResDTO.<SubscriptionResponse>builder()
                                        .code(200)
                                        .message("성공")
                                        .data(response)
                                        .build());

                } catch (Exception e) {
                        log.error("빌링키 발급 완료 처리 실패", e);
                        return ResponseEntity.status(HttpStatus.SC_BAD_REQUEST)
                                        .body(ResDTO.<SubscriptionResponse>builder()
                                                        .code(400)
                                                        .message("빌링키 발급 처리에 실패했습니다: " + e.getMessage())
                                                        .data(null)
                                                        .build());
                }
        }

        /**
         * 빌링키 발급 실패 처리
         */
        @PostMapping("/billing-key/fail")
        public ResponseEntity<ResDTO<BillingKeyFailResponse>> failBillingKey(
                        @RequestBody BillingKeyFailRequest request,
                        HttpSession session) {

                try {
                        // 세션에서 사용자 정보 가져오기
                        ResAuthInfoDTOApiV1 authInfo = getAuthInfo(session);
                        Long userId = authInfo.getUser().getId();
                        log.warn("빌링키 발급 실패 요청 수신 - userId={}, paymentId={}, issueId={}, errorCode={}, errorMessage={}",
                                        userId, request.getPaymentId(), request.getIssueId(), request.getErrorCode(),
                                        request.getErrorMessage());

                        // 결제 상태를 실패로 업데이트
                        paymentService.updatePaymentStatus(
                                        request.getPaymentId(),
                                        PaymentStatus.FAILED,
                                        request.getErrorMessage());

                        // 재시도 가능 여부 판단
                        boolean retryAvailable = !"CARD_EXPIRED".equals(request.getErrorCode()) &&
                                        !"INVALID_CARD".equals(request.getErrorCode());
                        int remainingRetries = retryAvailable ? 2 : 0;

                        BillingKeyFailResponse response = BillingKeyFailResponse.builder()
                                        .retryAvailable(retryAvailable)
                                        .remainingRetries(remainingRetries)
                                        .message("결제 수단 등록에 실패했습니다. " +
                                                        (retryAvailable ? "다시 시도해주세요." : "다른 카드로 시도해주세요."))
                                        .build();

                        return ResponseEntity.ok(ResDTO.<BillingKeyFailResponse>builder()
                                        .code(200)
                                        .message("성공")
                                        .data(response)
                                        .build());

                } catch (Exception e) {
                        log.error("빌링키 발급 실패 처리 중 오류", e);
                        return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR)
                                        .body(ResDTO.<BillingKeyFailResponse>builder()
                                                        .code(500)
                                                        .message("처리 중 오류가 발생했습니다")
                                                        .data(null)
                                                        .build());
                }
        }

        /**
         * 정기 결제 예약
         */
        @PostMapping("/subscribe")
        public ResponseEntity<ResDTO<SubscriptionReservationResponse>> subscribe(
                        @Valid @RequestBody SubscriptionRequest request,
                        HttpSession session) {

                ResAuthInfoDTOApiV1 authInfo = getAuthInfo(session);
                log.info("정기 결제 예약 요청 수신 - userId={}, issueId={}, orderId={}, amount={}, interval={}{}",
                                authInfo.getUser().getId(),
                                request.getIssueId(),
                                request.getOrderId(),
                                request.getAmount(),
                                request.getInterval(),
                                request.getIntervalCount() != null ? "x" + request.getIntervalCount() : "");
                SubscriptionReservationResponse response = paymentService.subscribe(authInfo.getUser().getId(),
                                request);

                return ResponseEntity.ok(ResDTO.<SubscriptionReservationResponse>builder()
                                .code(200)
                                .message("정기 결제가 예약되었습니다.")
                                .data(response)
                                .build());
        }

        /**
         * 구독 다운그레이드 예약
         */
        @PostMapping("/subscriptions/{subscriptionId}/downgrade")
        public ResponseEntity<ResDTO<SubscriptionDowngradeResponse>> downgradeSubscription(
                        @NotBlank @PathVariable("subscriptionId") String subscriptionId,
                        @Valid @RequestBody SubscriptionDowngradeRequest request,
                        HttpSession session) {

                ResAuthInfoDTOApiV1 authInfo = getAuthInfo(session);
                SubscriptionDowngradeResponse response = subscriptionService
                                .scheduleDowngrade(authInfo.getUser().getId(), subscriptionId, request);

                return ResponseEntity.ok(ResDTO.<SubscriptionDowngradeResponse>builder()
                                .code(Constants.ResCode.OK)
                                .message("다음 결제일부터 하위 요금제가 적용됩니다.")
                                .data(response)
                                .build());
        }

        /**
         * 구독 해지
         */
        @DeleteMapping("/subscriptions/{subscriptionId}/cancel")
        public ResponseEntity<ResDTO<SubscriptionCancelResponse>> cancelSubscription(
                        @NotBlank @PathVariable("subscriptionId") String subscriptionId,
                        @Valid @RequestBody SubscriptionCancelRequest request,
                        HttpSession session) {

                ResAuthInfoDTOApiV1 authInfo = getAuthInfo(session);
                SubscriptionCancelResponse response = paymentService.cancelSubscription(
                                authInfo.getUser().getId(), subscriptionId, request);

                return ResponseEntity.ok(ResDTO.<SubscriptionCancelResponse>builder()
                                .code(Constants.ResCode.OK)
                                .message("구독 해지가 완료되었습니다. 남은 기간까지 사용이 가능합니다.")
                                .data(response)
                                .build());
        }

        /**
         * 구독 상태 조회
         */
        @GetMapping("/subscriptions/status")
        public ResponseEntity<ResDTO<SubscriptionStatusResponse>> getSubscriptionStatus(
                        HttpSession session) {

                try {
                        // 세션에서 사용자 정보 가져오기
                        ResAuthInfoDTOApiV1 authInfo = getAuthInfo(session);
                        Long userId = authInfo.getUser().getId();

                        log.info("구독 상태 조회 - 사용자: {}", userId);

                        SubscriptionStatusResponse response = subscriptionService.getSubscriptionStatus(userId);

                        return ResponseEntity.ok(ResDTO.<SubscriptionStatusResponse>builder()
                                        .code(200)
                                        .message("성공")
                                        .data(response)
                                        .build());

                } catch (Exception e) {
                        log.error("구독 상태 조회 실패", e);
                        return ResponseEntity.status(HttpStatus.SC_INTERNAL_SERVER_ERROR)
                                        .body(ResDTO.<SubscriptionStatusResponse>builder()
                                                        .code(500)
                                                        .message("구독 상태 조회에 실패했습니다")
                                                        .data(null)
                                                        .build());
                }
        }

        /**
         * 세션에서 인증 정보 추출
         */
        private ResAuthInfoDTOApiV1 getAuthInfo(HttpSession session) {
                ResAuthInfoDTOApiV1 authInfo = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
                if (authInfo == null) {
                        throw new AuthenticationException("로그인이 필요합니다");
                }
                return authInfo;
        }

        /**
         * 구독 업그레이드 (차액 결제)
         */
        @PostMapping("/upgrade")
        public ResponseEntity<ResDTO<SubscriptionUpgradeResponse>> upgradeSubscription(
                        @Valid @RequestBody SubscriptionUpgradeRequest request,
                        HttpSession session) {

                ResAuthInfoDTOApiV1 authInfo = getAuthInfo(session);
                log.info("구독 업그레이드 요청 수신 - userId={}, targetLevel={}, billingCycle={}",
                                authInfo.getUser().getId(), request.getTargetMembershipLevel(),
                                request.getBillingCycle());

                SubscriptionUpgradeResponse response = subscriptionService
                                .upgradeSubscription(authInfo.getUser().getId(), request);

                return ResponseEntity.ok(ResDTO.<SubscriptionUpgradeResponse>builder()
                                .code(0)
                                .message("success")
                                .data(response)
                                .build());
        }

}
