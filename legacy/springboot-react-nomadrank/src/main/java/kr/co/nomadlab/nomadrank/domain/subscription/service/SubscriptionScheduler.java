package kr.co.nomadlab.nomadrank.domain.subscription.service;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;

import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 정기결제 스케줄러
 * 스케줄링 트리거 역할만 담당하며 실제 처리는 SubscriptionServiceApiV1에 위임한다.
 */
@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class SubscriptionScheduler {

    private final SubscriptionServiceApiV1 subscriptionService;
    @Value("${payment.recurring.backup-scheduler.enabled:false}")
    private boolean backupSchedulerEnabled;

    /**
     * 정기결제 처리 (매일 오전 9시 실행)
     */
    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
    public void processMonthlySubscriptions() {
        if (!backupSchedulerEnabled) {
            log.debug("백업 스케줄러 비활성화 - 정기결제 스킵");
            return;
        }
        log.info("정기결제 스케줄러 호출");
        try {
            subscriptionService.processDueSubscriptions(LocalDate.now());
        } catch (Exception e) {
            log.error("정기결제 스케줄러 실행 중 오류 발생", e);
        }
    }

    /**
     * 재시도 결제 처리 (매일 오후 2시 실행)
     */
    @Scheduled(cron = "0 0 14 * * *", zone = "Asia/Seoul")
    public void processRetrySubscriptions() {
        if (!backupSchedulerEnabled) {
            log.debug("백업 스케줄러 비활성화 - 재시도 결제 스킵");
            return;
        }
        log.info("재시도 결제 스케줄러 호출");
        try {
            subscriptionService.processRetryableSubscriptions(LocalDate.now());
        } catch (Exception e) {
            log.error("재시도 결제 스케줄러 실행 중 오류 발생", e);
        }
    }

    /**
     * 만료된 구독 정리 (매일 자정 실행)
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    public void cleanupExpiredSubscriptions() {
        log.info("만료 구독 정리 스케줄러 호출");
        try {
            subscriptionService.cleanupExpiredSubscriptions(LocalDate.now());
        } catch (Exception e) {
            log.error("만료 구독 정리 중 오류 발생", e);
        }
    }

    /**
     * 개별 구독 결제 처리
     */
    @Async
    @Transactional
    public void processSubscriptionPayment(SubscriptionEntity subscription) {
        subscriptionService.processSubscriptionPayment(subscription);
    }
}
