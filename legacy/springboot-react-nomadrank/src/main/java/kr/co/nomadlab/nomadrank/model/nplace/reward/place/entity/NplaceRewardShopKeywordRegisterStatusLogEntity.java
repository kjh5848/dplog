package kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardShopKeywordRegisterStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`NPLACE_REWARD_SHOP_KEYWORD_REGISTER_STATUS_LOG`")
@DynamicInsert
@DynamicUpdate
public class NplaceRewardShopKeywordRegisterStatusLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "prev_status")
    private NplaceRewardShopKeywordRegisterStatus prevStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "curr_status")
    private NplaceRewardShopKeywordRegisterStatus currStatus;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nplace_reward_shop_keyword_register_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NplaceRewardShopKeywordRegisterEntity nplaceRewardShopKeywordRegisterEntity;
}
