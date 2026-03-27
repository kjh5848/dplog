package kr.co.nomadlab.nomadrank.model.payment.entity;

import java.time.OffsetDateTime;

import org.hibernate.annotations.Comment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "webhook_events")
public class WebhookEventEntity {

    @Id
    @Column(name = "event_id", length = 150)
    @Comment("웹훅 멱등 키 (예: webhook-paid-<paymentId>)")
    private String eventId;

    @Column(name = "source", length = 50, nullable = false)
    private String source;

    @Column(name = "idempotency_key", length = 150)
    private String idempotencyKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private WebhookEventStatus status;

    @Column(name = "processed_at", nullable = false)
    private OffsetDateTime processedAt;

    @Lob
    @Column(name = "payload")
    private String payload;

    @Column(name = "error_message", length = 500)
    private String errorMessage;
}
