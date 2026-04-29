package kr.co.nomadlab.dplog.license;

import java.time.Instant;
import java.util.UUID;

public record AdminDeleteKeyRequestDto(
        UUID requestId,
        UUID licenseId,
        String ownerEmail,
        DeleteKeyRequestStatus status,
        Instant requestedAt,
        Instant approvedAt,
        Instant oneTimeViewedAt
) {
    public static AdminDeleteKeyRequestDto from(DeleteKeyRequest request) {
        return new AdminDeleteKeyRequestDto(
                request.getId(),
                request.getLicense().getId(),
                request.getLicense().getOwner().getEmail(),
                request.getStatus(),
                request.getRequestedAt(),
                request.getApprovedAt(),
                request.getOneTimeViewedAt()
        );
    }
}
