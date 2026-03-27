package kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity;

import jakarta.persistence.*;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardProduct;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
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
@Table(name = "`NPLACE_REWARD_SHOP`")
@DynamicInsert
@DynamicUpdate
public class NplaceRewardShopEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", updatable = false, nullable = false)
    private UserEntity userEntity;

    @Enumerated(EnumType.STRING)
    @Column(name = "nplace_reward_product")
    private NplaceRewardProduct nplaceRewardProduct;

    @Column(name = "shop_id")
    private String shopId;

    @Column(name = "shop_name")
    private String shopName;

    @Column(name = "shop_image_url")
    private String shopImageUrl;

    @Column(name = "category")
    private String category;

    @Column(name = "address")
    private String address;

    @Column(name = "road_address")
    private String roadAddress;

    @Column(name = "visitor_review_count")
    private String visitorReviewCount;

    @Column(name = "blog_review_count")
    private String blogReviewCount;

    @Column(name = "score_info")
    private String scoreInfo;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @OneToMany(mappedBy = "nplaceRewardShopEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id DESC")
    private List<NplaceRewardShopKeywordEntity> nplaceRewardShopKeywordEntityList;

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public void setShopImageUrl(String shopImageUrl) {
        this.shopImageUrl = shopImageUrl;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setRoadAddress(String roadAddress) {
        this.roadAddress = roadAddress;
    }

    public void setVisitorReviewCount(String visitorReviewCount) {
        this.visitorReviewCount = visitorReviewCount;
    }

    public void setBlogReviewCount(String blogReviewCount) {
        this.blogReviewCount = blogReviewCount;
    }

    public void setScoreInfo(String scoreInfo) {
        this.scoreInfo = scoreInfo;
    }
}
