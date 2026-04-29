package kr.co.nomadlab.dplog.auth;

import jakarta.validation.constraints.NotBlank;

public record KakaoCallbackRequest(
        @NotBlank String code,
        @NotBlank String state,
        Boolean marketingConsent
) {
}
