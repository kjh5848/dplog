package kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardProduct;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
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
@Table(name = "`NPLACE_REWARD_PLACE`")
@DynamicInsert
@DynamicUpdate
public class NplaceRewardPlaceEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", updatable = false, nullable = false)
    private UserEntity userEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "distributor_id", referencedColumnName = "id", updatable = false, nullable = false)
    private DistributorEntity distributorEntity;

    @Enumerated(EnumType.STRING)
    @Column(name = "nplace_reward_product", nullable = false)
    private NplaceRewardProduct nplaceRewardProduct;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Comment("계좌번호")
    @Column(length = 30, name = "account_number", nullable = false)
    private String accountNumber;

    @Comment("예금주")
    @Column(name = "deposit", nullable = false)
    private String deposit;

    @Comment("은행 이름")
    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @Column(name = "delete_date")
    private LocalDateTime deleteDate;

}
