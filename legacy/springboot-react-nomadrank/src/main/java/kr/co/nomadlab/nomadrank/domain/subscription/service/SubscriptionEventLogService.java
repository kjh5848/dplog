package kr.co.nomadlab.nomadrank.domain.subscription.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.co.nomadlab.nomadrank.domain.subscription.enums.SubscriptionEventType;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEventLog;
import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEventLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 구독 이벤트 멱등 로그 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionEventLogService {

    private final SubscriptionEventLogRepository subscriptionEventLogRepository;

    /**
     * 이벤트를 멱등하게 기록. 이미 처리된 이벤트이면 true 반환.
     */
    @Transactional
    public boolean alreadyProcessed(String eventId) {
        return subscriptionEventLogRepository.findByEventId(eventId)
                .map(eventLog -> {
                    log.debug("[이벤트로그] 중복 이벤트 감지 eventId={}", eventId);
                    return true;
                })
                .orElse(false);
    }

    @Transactional
    public void recordReceived(String eventId,
            String subscriptionId,
            SubscriptionEventType eventType,
            String source,
            String payloadHash) {

        if (subscriptionEventLogRepository.findByEventId(eventId).isPresent()) {
            return;
        }

        SubscriptionEventLog logEntity = SubscriptionEventLog.builder()
                .eventId(eventId)
                .subscriptionId(subscriptionId)
                .eventType(eventType)
                .source(source)
                .payloadHash(payloadHash)
                .status("RECEIVED")
                .build();
        subscriptionEventLogRepository.save(logEntity);
    }

    @Transactional
    public void markProcessed(String eventId) {
        Optional<SubscriptionEventLog> logOpt = subscriptionEventLogRepository.findByEventId(eventId);
        if (logOpt.isPresent()) {
            SubscriptionEventLog log = logOpt.get();
            log.setStatus("PROCESSED");
            log.setProcessedAt(LocalDateTime.now());
            subscriptionEventLogRepository.save(log);
        }
    }

    @Transactional
    public void markFailed(String eventId, String errorMessage) {
        Optional<SubscriptionEventLog> logOpt = subscriptionEventLogRepository.findByEventId(eventId);
        if (logOpt.isPresent()) {
            SubscriptionEventLog log = logOpt.get();
            log.setStatus("FAILED");
            log.setProcessedAt(LocalDateTime.now());
            log.setErrorMessage(errorMessage);
            subscriptionEventLogRepository.save(log);
        } else {
            SubscriptionEventLog logEntity = SubscriptionEventLog.builder()
                    .eventId(eventId)
                    .status("FAILED")
                    .errorMessage(errorMessage)
                    .processedAt(LocalDateTime.now())
                    .build();
            subscriptionEventLogRepository.save(logEntity);
        }
    }
}
