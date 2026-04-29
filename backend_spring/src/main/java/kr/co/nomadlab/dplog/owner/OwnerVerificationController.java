package kr.co.nomadlab.dplog.owner;

import jakarta.validation.Valid;
import java.util.List;
import kr.co.nomadlab.dplog.auth.AppUser;
import kr.co.nomadlab.dplog.auth.AuthFacade;
import kr.co.nomadlab.dplog.auth.DplogPrincipal;
import kr.co.nomadlab.dplog.common.ApiResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/owner-verifications")
public class OwnerVerificationController {
    private final AuthFacade authFacade;
    private final OwnerVerificationService ownerVerificationService;

    public OwnerVerificationController(AuthFacade authFacade, OwnerVerificationService ownerVerificationService) {
        this.authFacade = authFacade;
        this.ownerVerificationService = ownerVerificationService;
    }

    @PostMapping
    public ApiResponse<OwnerVerificationResponse> submit(
            @AuthenticationPrincipal DplogPrincipal principal,
            @Valid @RequestBody OwnerVerificationRequest request
    ) {
        AppUser user = authFacade.requireUser(principal);
        return ApiResponse.ok(ownerVerificationService.submit(user, request));
    }

    @GetMapping("/me")
    public ApiResponse<List<OwnerVerificationResponse>> me(@AuthenticationPrincipal DplogPrincipal principal) {
        AppUser user = authFacade.requireUser(principal);
        return ApiResponse.ok(ownerVerificationService.getMine(user));
    }
}
