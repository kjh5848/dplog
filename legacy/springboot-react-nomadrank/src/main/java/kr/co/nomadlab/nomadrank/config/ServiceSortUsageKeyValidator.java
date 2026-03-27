package kr.co.nomadlab.nomadrank.config;

import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;

@Component
public class ServiceSortUsageKeyValidator {

    @PostConstruct
    public void validateUniqueUsageKeys() {
        Set<String> keys = new HashSet<>();
        for (ServiceSort sort : ServiceSort.values()) {
            if (!keys.add(sort.getUsageKey())) {
                throw new IllegalStateException("중복된 ServiceSort usageKey가 감지되었습니다: " + sort.getUsageKey());
            }
        }
    }
}
