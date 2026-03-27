package kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`NPLACE_REWARD_SHOP_KEYWORD`")
@DynamicInsert
@DynamicUpdate
public class NplaceRewardShopKeywordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "keyword")
    private String keyword;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nplace_reward_shop_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NplaceRewardShopEntity nplaceRewardShopEntity;

    @OneToMany(mappedBy = "nplaceRewardShopKeywordEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id DESC")
    private List<NplaceRewardShopKeywordRegisterEntity> nplaceRewardShopKeywordRegisterEntityList;

}
