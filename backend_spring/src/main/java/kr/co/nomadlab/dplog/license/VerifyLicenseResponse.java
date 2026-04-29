package kr.co.nomadlab.dplog.license;

import java.time.Instant;
import java.util.UUID;

public record VerifyLicenseResponse(
        boolean valid,
        UUID licenseId,
        String plan,
        LicenseStatus status,
        Instant verifiedAt
) {
}
