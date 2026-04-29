package kr.co.nomadlab.dplog.owner;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record OwnerVerificationResponse(
        UUID id,
        OwnerVerificationStatus status,
        String statusReason,
        String placeId,
        String placeName,
        String category,
        LocalDate openingDate,
        Instant verifiedAt,
        Instant createdAt
) {
    public static OwnerVerificationResponse from(OwnerVerification verification) {
        return new OwnerVerificationResponse(
                verification.getId(),
                verification.getStatus(),
                verification.getStatusReason(),
                verification.getPlaceId(),
                verification.getPlaceName(),
                verification.getCategory(),
                verification.getOpeningDate(),
                verification.getVerifiedAt(),
                verification.getCreatedAt()
        );
    }
}
