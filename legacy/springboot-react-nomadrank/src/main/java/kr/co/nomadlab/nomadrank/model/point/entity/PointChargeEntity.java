package kr.co.nomadlab.nomadrank.model.point.entity;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import kr.co.nomadlab.nomadrank.domain.point.enums.PointChargeStatus;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.*;
import org.hibernate.annotations.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`POINT_CHARGE`")
@DynamicInsert
@DynamicUpdate
public class PointChargeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private UserEntity userEntity;

    @Column(name = "amount")
    private Integer amount;

    @Column(name = "balance")
    private Integer balance;

    @Enumerated(EnumType.STRING)
    private PointChargeStatus status;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @Column(name = "delete_date")
    private LocalDateTime deleteDate;
}
