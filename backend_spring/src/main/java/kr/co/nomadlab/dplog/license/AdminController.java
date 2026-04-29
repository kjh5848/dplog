package kr.co.nomadlab.dplog.license;

import java.util.List;
import java.util.UUID;
import kr.co.nomadlab.dplog.auth.AppUser;
import kr.co.nomadlab.dplog.auth.AuthFacade;
import kr.co.nomadlab.dplog.auth.DplogPrincipal;
import kr.co.nomadlab.dplog.common.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/admin")
public class AdminController {
    private final AuthFacade authFacade;
    private final LicenseService licenseService;

    public AdminController(AuthFacade authFacade, LicenseService licenseService) {
        this.authFacade = authFacade;
        this.licenseService = licenseService;
    }

    @GetMapping("/dashboard/summary")
    public ApiResponse<AdminDashboardSummary> summary() {
        return ApiResponse.ok(licenseService.getAdminSummary());
    }

    @GetMapping("/licenses")
    public ApiResponse<List<AdminLicenseDto>> licenses() {
        return ApiResponse.ok(licenseService.getAdminLicenses());
    }

    @GetMapping("/delete-key-requests")
    public ApiResponse<List<AdminDeleteKeyRequestDto>> deleteKeyRequests() {
        return ApiResponse.ok(licenseService.getAdminDeleteKeyRequests());
    }

    @PostMapping("/delete-key-requests/{id}/approve")
    public ApiResponse<AdminDeleteKeyApprovalResponse> approveDeleteKey(
            @AuthenticationPrincipal DplogPrincipal principal,
            @PathVariable UUID id
    ) {
        AppUser adminUser = authFacade.requireUser(principal);
        return ApiResponse.ok(licenseService.approveDeleteKey(id, adminUser));
    }

    @PostMapping("/licenses/{id}/revoke")
    public ApiResponse<LicenseResponse> revokeLicense(
            @AuthenticationPrincipal DplogPrincipal principal,
            @PathVariable UUID id
    ) {
        AppUser adminUser = authFacade.requireUser(principal);
        return ApiResponse.ok(licenseService.revokeLicense(id, adminUser));
    }
}
