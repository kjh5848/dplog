package kr.co.nomadlab.nomadrank.model.nplace.reply.entity;

import jakarta.persistence.*;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "NPLACE_REPLY_LOG")
@DynamicInsert
@DynamicUpdate
public class NplaceReplyLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nplace_reply_id", referencedColumnName = "id", nullable = false, updatable = false)
    private NplaceReplyEntity nplaceReplyEntity;

    @Column(name = "before_active")
    private Boolean beforeActive;

    @Column(name = "after_active")
    private Boolean afterActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by", referencedColumnName = "id", nullable = false, updatable = false)
    private UserEntity changedBy;

    @Column(name = "change_date", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime changeDate;
}
