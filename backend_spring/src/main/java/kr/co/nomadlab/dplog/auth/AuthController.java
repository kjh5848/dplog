package kr.co.nomadlab.dplog.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import java.util.Map;
import kr.co.nomadlab.dplog.common.ApiResponse;
import kr.co.nomadlab.dplog.license.LicenseService;
import kr.co.nomadlab.dplog.license.VerifyLicenseRequest;
import kr.co.nomadlab.dplog.license.VerifyLicenseResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth")
public class AuthController {
    private final KakaoOidcService kakaoOidcService;
    private final AuthFacade authFacade;
    private final LicenseService licenseService;

    public AuthController(KakaoOidcService kakaoOidcService, AuthFacade authFacade, LicenseService licenseService) {
        this.kakaoOidcService = kakaoOidcService;
        this.authFacade = authFacade;
        this.licenseService = licenseService;
    }

    @GetMapping("/csrf")
    public ApiResponse<Map<String, String>> csrf(CsrfToken token) {
        return ApiResponse.ok(Map.of(
                "headerName", token.getHeaderName(),
                "parameterName", token.getParameterName(),
                "token", token.getToken()
        ));
    }

    @GetMapping("/kakao/authorize-url")
    public ApiResponse<KakaoAuthorizeResponse> authorizeUrl(HttpSession session) {
        return ApiResponse.ok(kakaoOidcService.createAuthorizeUrl(session));
    }

    @PostMapping("/kakao/callback")
    public ApiResponse<KakaoLoginResponse> kakaoCallback(
            @Valid @RequestBody KakaoCallbackRequest request,
            HttpServletRequest servletRequest
    ) {
        return ApiResponse.ok(kakaoOidcService.handleCallback(request, servletRequest));
    }

    @GetMapping("/me")
    public ApiResponse<AuthUserDto> me(@AuthenticationPrincipal DplogPrincipal principal) {
        return ApiResponse.ok(AuthUserDto.from(authFacade.requireUser(principal)));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            @AuthenticationPrincipal DplogPrincipal principal
    ) {
        new SecurityContextLogoutHandler().logout(request, response, null);
        return ApiResponse.ok();
    }

    @PostMapping("/verify-license")
    public ApiResponse<VerifyLicenseResponse> verifyLicense(@Valid @RequestBody VerifyLicenseRequest request) {
        return ApiResponse.ok(licenseService.verifyLicense(request));
    }
}
