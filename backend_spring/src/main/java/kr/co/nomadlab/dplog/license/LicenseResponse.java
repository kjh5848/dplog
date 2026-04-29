package kr.co.nomadlab.dplog.license;

import java.time.Instant;
import java.util.UUID;

public record LicenseResponse(
        UUID licenseId,
        LicenseStatus status,
        String plan,
        String keyPrefix,
        String keyLast4,
        String oneTimeProductKey,
        Instant issuedAt,
        DeleteKeyRequestStatus deleteKeyStatus
) {
    public static LicenseResponse from(License license, DeleteKeyRequest deleteKeyRequest, String oneTimeProductKey) {
        return new LicenseResponse(
                license.getId(),
                license.getStatus(),
                license.getPlan(),
                license.getKeyPrefix(),
                license.getKeyLast4(),
                oneTimeProductKey,
                license.getIssuedAt(),
                deleteKeyRequest == null ? null : deleteKeyRequest.getStatus()
        );
    }
}
