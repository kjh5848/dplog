package kr.co.nomadlab.dplog.license;

import jakarta.validation.constraints.NotBlank;

public record VerifyLicenseRequest(
        String productKey,
        String licenseKey,
        @NotBlank String deviceId,
        String platform,
        String appVersion
) {
    public String effectiveProductKey() {
        return productKey != null && !productKey.isBlank() ? productKey : licenseKey;
    }
}
