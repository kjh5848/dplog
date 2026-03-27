package kr.co.nomadlab.nomadrank.domain.membership.service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.EnumSet;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserLogEntity;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserLogRepository;
import kr.co.nomadlab.nomadrank.model.use_log.repository.UseLogRepository;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsageResetService {

    private static final Set<ServiceSort> EXCLUDED_FROM_RESET = EnumSet.of(ServiceSort.NPLACE_SHOP_REGISTER);

    private final UseLogRepository useLogRepository;
    private final MembershipUserLogRepository membershipUserLogRepository;
    private final UsageLimitPolicy usageLimitPolicy;

    @Transactional
    public void resetUsage(MembershipUserEntity membershipUser,
            SubscriptionEntity subscription,
            BillingCycle billingCycle) {
        resetUsage(membershipUser, subscription, billingCycle, false);
    }

    @Transactional
    public void resetUsage(MembershipUserEntity membershipUser,
            SubscriptionEntity subscription,
            BillingCycle billingCycle,
            boolean deleteAllHistory) {

        if (membershipUser == null || membershipUser.getUserEntity() == null) {
            return;
        }

        LocalDateTime rangeStart = deleteAllHistory
                ? LocalDateTime.of(1970, 1, 1, 0, 0)
                : resolveCycleStart(membershipUser, subscription, billingCycle);
        LocalDateTime rangeEnd = LocalDateTime.now();

        int deleted = resetMonthlySorts(membershipUser, rangeStart, rangeEnd);

        log.info("[UsageReset] 사용량 초기화 - userId={}, deletedLogs={}, rangeStart={}, rangeEnd={}, deleteAll={}, excludedSort={}",
                membershipUser.getUserEntity().getId(), deleted, rangeStart, rangeEnd, deleteAllHistory,
                ServiceSort.NPLACE_SHOP_REGISTER);

        membershipUserLogRepository.save(MembershipUserLogEntity.builder()
                .membershipUserEntity(membershipUser)
                .action("UPGRADE_RESET")
                .startDate(rangeStart.toLocalDate())
                .endDate(rangeEnd.toLocalDate())
                .membershipState(membershipUser.getMembershipState())
                .build());
    }

    private int resetMonthlySorts(MembershipUserEntity membershipUser,
            LocalDateTime rangeStart,
            LocalDateTime rangeEnd) {
        int deleted = 0;
        for (ServiceSort sort : ServiceSort.values()) {
            if (usageLimitPolicy.isDailyLimit(sort) || EXCLUDED_FROM_RESET.contains(sort)) {
                continue;
            }
            deleted += useLogRepository.deleteByUserAndServiceSortAndCreateDateBetween(
                    membershipUser.getUserEntity(), sort, rangeStart, rangeEnd);
        }
        return deleted;
    }

    private LocalDateTime resolveCycleStart(MembershipUserEntity membershipUser,
            SubscriptionEntity subscription,
            BillingCycle billingCycle) {

        LocalDateTime membershipStart = membershipUser.getStartDate() != null
                ? membershipUser.getStartDate().atStartOfDay()
                : null;

        LocalDateTime derived = deriveFromSubscription(subscription, billingCycle);
        LocalDateTime startCandidate = derived != null ? derived : LocalDateTime.now().withDayOfMonth(1).withHour(0)
                .withMinute(0).withSecond(0).withNano(0);

        if (membershipStart != null && membershipStart.isAfter(startCandidate)) {
            startCandidate = membershipStart;
        }

        return startCandidate;
    }

    private LocalDateTime deriveFromSubscription(SubscriptionEntity subscription,
            BillingCycle billingCycle) {
        if (subscription == null) {
            return null;
        }

        BillingCycle effectiveCycle = billingCycle != null
                ? billingCycle
                : subscription.getBillingCycle() != null
                        ? subscription.getBillingCycle()
                        : BillingCycle.MONTHLY;

        OffsetDateTime nextBillingAt = subscription.getNextBillingAt();
        if (nextBillingAt != null) {
            OffsetDateTime startOffset = switch (effectiveCycle) {
                case YEARLY -> nextBillingAt.minusYears(1);
                case MONTHLY -> nextBillingAt.minusMonths(1);
            };

            OffsetDateTime nowOffset = OffsetDateTime.now(nextBillingAt.getOffset());
            OffsetDateTime normalizedStart = startOffset.isAfter(nowOffset) ? nowOffset : startOffset;
            LocalDateTime start = normalizedStart.toLocalDateTime();

            if (subscription.getStartDate() != null
                    && start.toLocalDate().isBefore(subscription.getStartDate())) {
                return subscription.getStartDate().atStartOfDay();
            }
            return start;
        }

        if (subscription.getNextBillingDate() != null) {
            LocalDateTime start = switch (effectiveCycle) {
                case YEARLY -> subscription.getNextBillingDate().minusYears(1).atStartOfDay();
                case MONTHLY -> subscription.getNextBillingDate().minusMonths(1).atStartOfDay();
            };
            if (subscription.getStartDate() != null && start.toLocalDate().isBefore(subscription.getStartDate())) {
                return subscription.getStartDate().atStartOfDay();
            }
            return start;
        }

        return subscription.getStartDate() != null ? subscription.getStartDate().atStartOfDay() : null;
    }
}
