package kr.co.nomadlab.nomadrank.domain.user.controller;

import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.domain.user.dto.request.ReqSaveUserMembershipDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.dto.request.ReqUserDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.dto.request.ReqUserStatusDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.dto.request.ReqUserUpdateDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.dto.request.ReqUserUpdateDistributorDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.service.UserServiceApiV1;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/user")
@Validated
public class UserControllerApiV1 {

    private final UserServiceApiV1 userServiceApiV1;

    @GetMapping("/list")
    public HttpEntity<?> list(HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        if (resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.USER)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return userServiceApiV1.getUserList(resAuthInfoDTOApiV1.getUser());
    }

    @GetMapping
    public HttpEntity<?> getUser(HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return userServiceApiV1.getUser(resAuthInfoDTOApiV1.getUser().getId());
    }

    @PostMapping()
    public HttpEntity<?> add(
            @RequestBody @Valid ReqUserDTOApiV1 reqDto) {
        return userServiceApiV1.saveUser(reqDto);
    }

    @PostMapping("/complete")
    public HttpEntity<?> complete(
            @RequestBody @Valid ReqUserStatusDTOApiV1 reqDto,
            HttpSession session) {

        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        if (!resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.ADMIN)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return userServiceApiV1.completeUser(reqDto);
    }

    @PostMapping("/withdraw")
    public HttpEntity<?> withdraw(
            @RequestBody @Valid ReqUserStatusDTOApiV1 reqDto,
            HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        if (!resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.ADMIN)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return userServiceApiV1.withdrawUser(reqDto);
    }

    @PutMapping()
    public HttpEntity<?> update(
            @RequestBody @Valid ReqUserUpdateDTOApiV1 reqDto,
            HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return userServiceApiV1.updateUser(reqDto, resAuthInfoDTOApiV1.getUser().getId(),
                resAuthInfoDTOApiV1.getUser().getAuthority());
    }

    @PutMapping("/distributor")
    public HttpEntity<?> updateDistributor(
            @RequestBody @Valid ReqUserUpdateDistributorDTOApiV1 reqDto,
            HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return userServiceApiV1.updateDistributor(reqDto, resAuthInfoDTOApiV1.getUser().getAuthority());
    }

    @GetMapping("/{userId}/membership")
    public HttpEntity<?> getUserMemberships(
            @PathVariable(name = "userId") Long userId,
            HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        if (!resAuthInfoDTOApiV1.getUser().getId().equals(userId) &&
                !resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.ADMIN) &&
                !resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.DISTRIBUTOR_MANAGER)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return userServiceApiV1.getUserMembership(userId);
    }

    // 특정 멤버십 구독
    @PostMapping("/{userId}/membership")
    public HttpEntity<?> saveUserMembership(
            @PathVariable(name = "userId") Long userId,
            @RequestBody @Valid ReqSaveUserMembershipDTOApiV1 reqDto,
            HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        // 관리자만 가능하도록 검증
        if (resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.USER)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return userServiceApiV1.saveUserMembership(userId, reqDto);
    }

    // 특정 멤버십 구독 변경
    @PutMapping("/{userId}/membership/{membershipUserId}")
    public HttpEntity<?> toggleUserMembership(
            @PathVariable(name = "userId") Long userId,
            @PathVariable(name = "membershipUserId") Long membershipUserId,
            HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        // 관리자만 가능하도록 검증
        if (resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.USER)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return userServiceApiV1.toggleUserMembership(membershipUserId);
    }

    @PostMapping("/check-username")
    public HttpEntity<?> checkUsername(@RequestBody String username) {
        log.info("username: {}", username);
        return userServiceApiV1.checkUsernameDuplicate(username);
    }

    // // 유저의 특정 멤버십 상세 조회
    // @GetMapping("/{userId}/membership/{membershipId}")
    // public HttpEntity<?> getUserMembershipDetail(
    // @PathVariable Long userId,
    // @PathVariable Long membershipId,
    // HttpSession session
    // ) {
    // ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1)
    // session.getAttribute("authInfo");
    // if (resAuthInfoDTOApiV1 == null) {
    // throw new AuthenticationException(null);
    // }
    //
    // // 본인이거나 관리자만 조회 가능하도록 검증
    // if (!resAuthInfoDTOApiV1.getUser().getId().equals(userId) &&
    // !resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.ADMIN))
    // {
    // throw new AuthenticationException("권한이 없습니다.");
    // }
    //
    // return userServiceApiV1.getUserMembershipDetail(userId, membershipId);
    // }

}
