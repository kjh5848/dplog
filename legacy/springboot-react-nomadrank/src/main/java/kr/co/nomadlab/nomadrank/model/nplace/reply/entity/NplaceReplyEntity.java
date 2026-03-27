package kr.co.nomadlab.nomadrank.model.nplace.reply.entity;

import jakarta.persistence.*;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "NPLACE_REPLY")
@DynamicInsert
@DynamicUpdate
public class NplaceReplyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", updatable = false, nullable = false)
    private UserEntity userEntity;

    @Column(name = "place_id")
    private String placeId;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    public NplaceReplyLogEntity toNplaceReplyLogEntity(UserEntity userEntity, Boolean beforeActive, Boolean afterActive) {
        return NplaceReplyLogEntity.builder()
                .nplaceReplyEntity(this)
                .beforeActive(beforeActive)
                .afterActive(afterActive)
                .changedBy(userEntity)
                .build();
    }
}
