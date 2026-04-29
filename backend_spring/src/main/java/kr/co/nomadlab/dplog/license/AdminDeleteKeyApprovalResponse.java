package kr.co.nomadlab.dplog.license;

import java.util.UUID;

public record AdminDeleteKeyApprovalResponse(
        UUID requestId,
        UUID licenseId,
        DeleteKeyRequestStatus status,
        String oneTimeDeleteKey
) {
}
