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
@Table(name = "payment_schedule_events")
public class PaymentScheduleEventEntity {

    @Id
    @Column(name = "event_id", length = 150)
    @Comment("멱등/추적 키")
    private String eventId;

    @Column(name = "schedule_id", length = 100)
    private String scheduleId;

    @Column(name = "issue_id", length = 100)
    private String issueId;

    @Column(name = "user_id")
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20, nullable = false)
    private PaymentScheduleEventType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private PaymentScheduleEventStatus status;

    @Column(name = "error_code", length = 50)
    private String errorCode;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "occurred_at", nullable = false)
    private OffsetDateTime occurredAt;

    @Lob
    @Column(name = "payload")
    private String payload;
}
