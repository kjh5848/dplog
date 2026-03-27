package kr.co.nomadlab.nomadrank.domain.membership.controller;

import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.membership.dto.request.ReqMembershipListDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.membership.service.MembershipServiceApiV1;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/membership")
@Slf4j
public class MembershipControllerApiV1 {

    private final MembershipServiceApiV1 membershipServiceApiV1;

    @PostMapping("/list")
    public HttpEntity<?> getMembershipList(
            HttpSession session,
            @RequestBody @Valid ReqMembershipListDTOApiV1 reqDto) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return membershipServiceApiV1.getMembershipList(resAuthInfoDTOApiV1.getUser().getAuthority());
    }

    // GET 버전: 요청 바디 없이 목록 조회
    @GetMapping("/list")
    public HttpEntity<?> getMembershipListGet(HttpSession session) {

        // 세션 없이도 조회 가능하도록 공개 목록 반환
        return membershipServiceApiV1.getPublicMembershipList();
    }

    @GetMapping("/current")
    public HttpEntity<?> getCurrentSubscription(
            HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        Long targetUserId = resAuthInfoDTOApiV1.getUser().getId();

        return membershipServiceApiV1.getCurrentSubscription(
                targetUserId,
                resAuthInfoDTOApiV1.getUser().getId(),
                resAuthInfoDTOApiV1.getUser().getAuthority());
    }

    @GetMapping("/profile-summary")
    public HttpEntity<?> getMembershipProfileSummary(
            HttpSession session,
            @RequestParam(name = "userId", required = false) Long userId,
            @RequestParam(name = "historyLimit", required = false) Integer historyLimit,
            @RequestParam(name = "historyCursor", required = false) String historyCursor) {

        ResAuthInfoDTOApiV1 authInfo = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (authInfo == null) {
            throw new AuthenticationException("로그인이 필요합니다.");
        }

        return membershipServiceApiV1.getMembershipProfileSummary(
                userId,
                authInfo.getUser().getId(),
                authInfo.getUser().getAuthority(),
                historyLimit,
                historyCursor);
    }

    // 단건 조회 + 결제 가능 여부 판단 (멤버십 레벨 기준)
    @GetMapping("/{membershipLevel}")
    public HttpEntity<?> getMembershipDetailAndEligibility(
            HttpSession session,
            @PathVariable("membershipLevel") Integer membershipLevel,
            @RequestParam(name = "billingCycle", required = false) BillingCycle billingCycle) {
        log.info("[Membership] 컨트롤러 진입: sessionId={}, membershipLevel={}, authInfo 존재 여부={}",
                session != null ? session.getId() : "null",
                membershipLevel,
                session != null && session.getAttribute("authInfo") != null);
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException("로그인이 필요합니다.");
        }

        return membershipServiceApiV1.getMembershipDetailAndEligibility(
                membershipLevel,
                billingCycle,
                resAuthInfoDTOApiV1.getUser().getId(),
                resAuthInfoDTOApiV1.getUser().getAuthority());
    }

}
