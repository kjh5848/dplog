package kr.co.nomadlab.dplog.license;

import java.time.Instant;
import java.util.UUID;

public record AdminLicenseDto(
        UUID licenseId,
        String ownerEmail,
        String keyPrefix,
        String keyLast4,
        String plan,
        LicenseStatus status,
        Instant issuedAt
) {
    public static AdminLicenseDto from(License license) {
        return new AdminLicenseDto(
                license.getId(),
                license.getOwner().getEmail(),
                license.getKeyPrefix(),
                license.getKeyLast4(),
                license.getPlan(),
                license.getStatus(),
                license.getIssuedAt()
        );
    }
}
