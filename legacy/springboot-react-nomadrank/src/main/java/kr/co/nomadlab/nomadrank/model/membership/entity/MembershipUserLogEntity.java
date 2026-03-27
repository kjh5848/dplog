package kr.co.nomadlab.nomadrank.model.membership.entity;

import jakarta.persistence.*;
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`MEMBERSHIP_USER_LOG`")
@DynamicInsert
@DynamicUpdate
public class MembershipUserLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "action", nullable = false)
    private String action;

    @ManyToOne
    @JoinColumn(name = "membership_user_id", nullable = false)
    private MembershipUserEntity membershipUserEntity;

    @Column(name="start_date")
    private LocalDate startDate;

    @Column(name="end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_state")
    private MembershipState membershipState;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;
}
