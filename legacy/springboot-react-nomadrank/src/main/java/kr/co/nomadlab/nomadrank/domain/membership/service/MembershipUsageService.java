package kr.co.nomadlab.nomadrank.domain.membership.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import kr.co.nomadlab.nomadrank.domain.membership.dto.response.component.MembershipUsageDTO;
import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipDetailEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipDetailRepository;
import kr.co.nomadlab.nomadrank.model.use_log.repository.UseLogRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MembershipUsageService {

    private final MembershipDetailRepository membershipDetailRepository;
    private final UseLogRepository useLogRepository;
    private final UsageLimitPolicy usageLimitPolicy;

    public Map<String, MembershipUsageDTO> buildUsage(UserEntity user, MembershipEntity membership, ZoneId zoneId) {
        ZoneId effectiveZone = zoneId != null ? zoneId : ZoneId.systemDefault();
        Map<ServiceSort, Integer> limitBySort = loadLimitMap(membership);
        Map<ServiceSort, Integer> usedBySort = loadUsedMap(user, effectiveZone);

        Map<String, MembershipUsageDTO> usageMap = new LinkedHashMap<>();
        for (ServiceSort sort : ServiceSort.values()) {
            String period = usageLimitPolicy.isDailyLimit(sort) ? "DAILY" : "MONTHLY";
            usageMap.put(sort.getUsageKey(),
                    MembershipUsageDTO.builder()
                            .used(usedBySort.getOrDefault(sort, 0))
                            .limit(limitBySort.get(sort))
                            .period(period)
                            .build());
        }
        return usageMap;
    }

    private Map<ServiceSort, Integer> loadLimitMap(MembershipEntity membership) {
        Map<ServiceSort, Integer> limitMap = new EnumMap<>(ServiceSort.class);
        if (membership == null) {
            return limitMap;
        }

        List<MembershipDetailEntity> details = membershipDetailRepository
                .findByMembershipEntityAndDeleteDateIsNull(membership);

        for (MembershipDetailEntity detail : details) {
            limitMap.put(detail.getServiceSort(), detail.getLimitCount());
        }

        for (ServiceSort sort : ServiceSort.values()) {
            if (usageLimitPolicy.isDailyLimit(sort)) {
                limitMap.put(sort, usageLimitPolicy.getDailyLimit(membership, sort));
            }
        }

        return limitMap;
    }

    private Map<ServiceSort, Integer> loadUsedMap(UserEntity user, ZoneId zoneId) {
        Map<ServiceSort, Integer> usedMap = new EnumMap<>(ServiceSort.class);
        if (user == null) {
            return usedMap;
        }

        for (ServiceSort sort : ServiceSort.values()) {
            LocalDateTime[] range = resolveRange(sort, zoneId);
            long count = useLogRepository.countByUserEntityAndServiceSortAndCreateDateBetween(
                    user,
                    sort,
                    range[0],
                    range[1]);
            usedMap.put(sort, Math.toIntExact(count));
        }

        return usedMap;
    }

    private LocalDateTime[] resolveRange(ServiceSort sort, ZoneId zoneId) {
        if (usageLimitPolicy.isDailyLimit(sort)) {
            LocalDate today = LocalDate.now(zoneId);
            LocalDateTime start = today.atStartOfDay();
            LocalDateTime end = today.plusDays(1).atStartOfDay();
            return new LocalDateTime[] { start, end };
        }
        return currentMonthRange(zoneId);
    }

    private LocalDateTime[] currentMonthRange(ZoneId zoneId) {
        YearMonth current = YearMonth.now(zoneId);
        LocalDateTime start = current.atDay(1).atStartOfDay();
        LocalDateTime end = current.plusMonths(1).atDay(1).atStartOfDay();
        return new LocalDateTime[] { start, end };
    }
}
