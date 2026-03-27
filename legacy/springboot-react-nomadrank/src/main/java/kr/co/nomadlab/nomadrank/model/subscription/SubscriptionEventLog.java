package kr.co.nomadlab.nomadrank.model.subscription;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import kr.co.nomadlab.nomadrank.domain.subscription.enums.SubscriptionEventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 구독 이벤트 멱등/감사용 로그
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "SUBSCRIPTION_EVENT_LOG")
public class SubscriptionEventLog {

    @Id
    @Column(name = "event_id", length = 191)
    private String eventId;

    @Column(name = "subscription_id", length = 100)
    private String subscriptionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", length = 50)
    private SubscriptionEventType eventType;

    @Column(name = "source", length = 50)
    private String source; // REST, WEBHOOK, SCHEDULER 등

    @Column(name = "payload_hash", length = 191)
    private String payloadHash;

    @Column(name = "status", length = 30)
    private String status; // RECEIVED, PROCESSED, FAILED

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
