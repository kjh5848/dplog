package kr.co.nomadlab.nomadrank.domain.membership.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;

import org.springframework.stereotype.Component;

import kr.co.nomadlab.nomadrank.domain.membership.dto.response.component.UsageLimitMeta;
import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UsageLimitMetaFactory {

    private final UsageLimitPolicy usageLimitPolicy;

    public UsageLimitMeta create(MembershipEntity membership,
            ServiceSort serviceSort,
            Integer limit,
            int used,
            ZoneId zoneId) {

        ZoneId effectiveZone = zoneId != null ? zoneId : ZoneId.systemDefault();
        boolean isDaily = usageLimitPolicy.isDailyLimit(serviceSort);

        String periodType = isDaily ? "DAILY" : "MONTHLY";
        String periodKey;
        LocalDateTime resetAtDateTime;
        if (isDaily) {
            LocalDate today = LocalDate.now(effectiveZone);
            periodKey = today.toString();
            resetAtDateTime = today.plusDays(1).atStartOfDay();
        } else {
            YearMonth current = YearMonth.now(effectiveZone);
            periodKey = current.toString();
            resetAtDateTime = current.plusMonths(1).atDay(1).atStartOfDay();
        }

        boolean blocked = limit != null && used >= limit;

        return UsageLimitMeta.builder()
                .usageType(serviceSort.name())
                .limit(limit)
                .used(used)
                .periodType(periodType)
                .periodKey(periodKey)
                .resetAt(resetAtDateTime.atZone(effectiveZone).toOffsetDateTime().toString())
                .recommendedPlanId(usageLimitPolicy.getRecommendedPlanId(membership))
                .blocked(blocked)
                .build();
    }
}
