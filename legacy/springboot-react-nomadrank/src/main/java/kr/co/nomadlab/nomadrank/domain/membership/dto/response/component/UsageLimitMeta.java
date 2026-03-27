package kr.co.nomadlab.nomadrank.domain.membership.dto.response.component;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UsageLimitMeta {
    private final String usageType;
    private final Integer limit;
    private final Integer used;
    private final String periodType;
    private final String periodKey;
    private final String resetAt;
    private final Long recommendedPlanId;
    private final boolean blocked;
}
