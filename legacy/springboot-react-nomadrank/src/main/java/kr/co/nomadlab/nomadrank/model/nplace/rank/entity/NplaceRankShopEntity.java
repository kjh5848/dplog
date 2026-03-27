package kr.co.nomadlab.nomadrank.model.nplace.rank.entity;

import jakarta.persistence.*;
import kr.co.nomadlab.nomadrank.model.group.entitiy.GroupNplaceRankShopEntity;
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
@Table(name = "NPLACE_RANK_SHOP")
@DynamicInsert
@DynamicUpdate
public class NplaceRankShopEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", updatable = false, nullable = false)
    private UserEntity userEntity;

    @Column(name = "shop_id")
    private String shopId;

    @Column(name = "shop_name")
    private String shopName;

    @Column(name = "shop_image_url", length = 1000)
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

    @Column(name = "business_sector")
    private String businessSector;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @OneToMany(mappedBy = "nplaceRankShopEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id DESC")
    private List<NplaceRankShopTrackInfoEntity> nplaceRankShopTrackInfoEntityList;

    @OneToMany(mappedBy = "nplaceRankShopEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id DESC")
    private List<NplaceRankShopKeywordEntity> nplaceRankShopKeywordEntityList;

    @OneToMany(mappedBy = "nplaceRankShopEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id DESC")
    private List<GroupNplaceRankShopEntity> groupNplaceRankShopEntityList;

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

    public void setBusinessSector(String businessSector) { this.businessSector = businessSector; }

    public void setNplaceRankShopKeywordEntityList(List<NplaceRankShopKeywordEntity> nplaceRankShopKeywordEntityList) { this.nplaceRankShopKeywordEntityList = nplaceRankShopKeywordEntityList; }
}
