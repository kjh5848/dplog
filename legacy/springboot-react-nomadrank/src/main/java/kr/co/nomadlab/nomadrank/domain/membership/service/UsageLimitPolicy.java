package kr.co.nomadlab.nomadrank.domain.membership.service;

import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;

@Component
public class UsageLimitPolicy {

    private static final String PLAN_FREE = "FREE";
    private static final String PLAN_PRACTICAL = "실속 점주";
    private static final String PLAN_GROWTH = "성장 오너";
    private static final String PLAN_MASTER = "프리미엄 마스터";

    private static final Map<ServiceSort, Map<String, Integer>> DAILY_LIMITS;
    private static final Map<String, Long> RECOMMENDED_PLAN_IDS;

    static {
        EnumMap<ServiceSort, Map<String, Integer>> map = new EnumMap<>(ServiceSort.class);
        map.put(ServiceSort.NPLACE_RANK_REALTIME, planMap(5, 20, 60, null));
        map.put(ServiceSort.NPLACE_KEYWORD, planMap(5, 20, 50, null));
        map.put(ServiceSort.NPLACE_KEYWORD_RELATION, planMap(5, 10, 30, null));
        map.put(ServiceSort.BLOG_QUALITY_CHECK, planMap(5, 10, 30, null));
        map.put(ServiceSort.NPLACE_REVIEW_REPLY, planMap(0, 0, 0, null));
        DAILY_LIMITS = Collections.unmodifiableMap(map);

        Map<String, Long> recommended = new HashMap<>();
        recommended.put(PLAN_FREE, 11L);
        recommended.put(PLAN_PRACTICAL, 12L);
        recommended.put(PLAN_GROWTH, 13L);
        RECOMMENDED_PLAN_IDS = Collections.unmodifiableMap(recommended);
    }

    private static Map<String, Integer> planMap(Integer free, Integer practical, Integer growth, Integer master) {
        Map<String, Integer> map = new HashMap<>();
        map.put(PLAN_FREE, free);
        map.put(PLAN_PRACTICAL, practical);
        map.put(PLAN_GROWTH, growth);
        map.put(PLAN_MASTER, master);
        return Collections.unmodifiableMap(map);
    }

    /**
     * @return 일간 한도 (null이면 무제한, 0이면 사용 불가)
     */
    public Integer getDailyLimit(MembershipEntity membership, ServiceSort sort) {
        Map<String, Integer> planMap = DAILY_LIMITS.get(sort);
        if (planMap == null) {
            return null;
        }
        String planName = membership != null ? membership.getName() : null;
        planName = normalizePlanName(planName);
        return planMap.getOrDefault(planName, planMap.get(PLAN_FREE));
    }

    public boolean isDailyLimit(ServiceSort sort) {
        return DAILY_LIMITS.containsKey(sort);
    }

    public Long getRecommendedPlanId(MembershipEntity membership) {
        String planName = membership != null ? membership.getName() : null;
        planName = normalizePlanName(planName);
        return RECOMMENDED_PLAN_IDS.getOrDefault(planName, RECOMMENDED_PLAN_IDS.get(PLAN_FREE));
    }

    private String normalizePlanName(String planName) {
        if (planName == null || planName.isBlank()) {
            return PLAN_FREE;
        }
        String trimmed = planName.trim();
        if ("마스터".equalsIgnoreCase(trimmed) || PLAN_MASTER.equalsIgnoreCase(trimmed)) {
            return PLAN_MASTER;
        }
        if ("실속 점주".equalsIgnoreCase(trimmed)) {
            return PLAN_PRACTICAL;
        }
        if ("성장 오너".equalsIgnoreCase(trimmed)) {
            return PLAN_GROWTH;
        }
        if ("free".equalsIgnoreCase(trimmed)) {
            return PLAN_FREE;
        }
        return trimmed;
    }
}
