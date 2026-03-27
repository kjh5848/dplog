package kr.co.nomadlab.nomadrank.model.nstore.rank.entity;

import jakarta.persistence.*;
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
@Table(name = "NSTORE_RANK_PRODUCT")
@DynamicInsert
@DynamicUpdate
public class NstoreRankProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", updatable = false, nullable = false)
    private UserEntity userEntity;

    @Column(name = "mid")
    private String mid;

    @Column(name = "product_id")
    private String productId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "product_image_url")
    private String productImageUrl;

    @Column(name = "category")
    private String category;

    @Column(name = "price")
    private String price;

    @Column(name = "mall_name")
    private String mallName;

    @Column(name = "review_count")
    private String reviewCount;

    @Column(name = "score_info")
    private String scoreInfo;

    @Column(name = "is_catalog")
    private Boolean isCatalog;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @OneToMany(mappedBy = "nstoreRankProductEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id DESC")
    private List<NstoreRankProductTrackInfoEntity> nstoreRankProductTrackInfoEntityList;

    public void setMid(String mid) {
        if (this.mid == null) {
            this.mid = mid;
        }
    }

    public void setProductId(String productId) {
        if (this.productId == null) {
            this.productId = productId;
        }
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public void setProductImageUrl(String productImageUrl) {
        this.productImageUrl = productImageUrl;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public void setMallName(String mallName) {
        this.mallName = mallName;
    }

    public void setReviewCount(String reviewCount) {
        this.reviewCount = reviewCount;
    }

    public void setScoreInfo(String scoreInfo) {
        this.scoreInfo = scoreInfo;
    }
}
