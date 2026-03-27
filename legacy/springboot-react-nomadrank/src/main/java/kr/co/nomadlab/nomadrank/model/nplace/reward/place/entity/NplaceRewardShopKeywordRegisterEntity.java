package kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

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
@Table(name = "`NPLACE_REWARD_SHOP_KEYWORD_REGISTER`")
@DynamicInsert
@DynamicUpdate
public class NplaceRewardShopKeywordRegisterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "start_date")
    private String startDate;

    @Column(name = "end_date")
    private String endDate;

    @Column(name = "search")
    private String search;

    @Column(name = "url")
    private String url;

    @Column(name = "shop_name")
    private String shopName;

    @Column(name = "goal")
    private Integer goal;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private NplaceRewardShopKeywordRegisterStatus status;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nplace_reward_shop_keyword_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NplaceRewardShopKeywordEntity nplaceRewardShopKeywordEntity;
}
