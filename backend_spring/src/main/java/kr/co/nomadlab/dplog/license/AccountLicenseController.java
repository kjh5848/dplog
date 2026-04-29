package kr.co.nomadlab.dplog.license;

import kr.co.nomadlab.dplog.auth.AppUser;
import kr.co.nomadlab.dplog.auth.AuthFacade;
import kr.co.nomadlab.dplog.auth.DplogPrincipal;
import kr.co.nomadlab.dplog.common.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/account/license")
public class AccountLicenseController {
    private final AuthFacade authFacade;
    private final LicenseService licenseService;

    public AccountLicenseController(AuthFacade authFacade, LicenseService licenseService) {
        this.authFacade = authFacade;
        this.licenseService = licenseService;
    }

    @GetMapping
    public ApiResponse<LicenseStateResponse> getMine(@AuthenticationPrincipal DplogPrincipal principal) {
        AppUser user = authFacade.requireUser(principal);
        return ApiResponse.ok(licenseService.getMyLicense(user));
    }

    @PostMapping("/request")
    public ApiResponse<LicenseResponse> request(@AuthenticationPrincipal DplogPrincipal principal) {
        AppUser user = authFacade.requireUser(principal);
        return ApiResponse.ok(licenseService.requestProductKey(user));
    }
}
