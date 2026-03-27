package kr.co.nomadlab.scrap.model.db.nstore.rank.entity;

import jakarta.persistence.*;
import kr.co.nomadlab.scrap.model.db.constraint.AmpmType;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "NSTORE_RANK_TRACK")
@DynamicInsert
@DynamicUpdate
public class NstoreRankTrackEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nstore_rank_track_info_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NstoreRankTrackInfoEntity nstoreRankTrackInfoEntity;

    @Column(name = "rank", nullable = false)
    private Integer rank;

    @Column(name = "prev_rank", nullable = false)
    private Integer prevRank;

    @Column(name = "rank_with_ad", nullable = false)
    private Integer rankWithAd;

    @Column(name = "prev_rank_with_ad", nullable = false)
    private Integer prevRankWithAd;

    @Column(name = "price", nullable = false)
    private String price;

    @Column(name = "review_count", nullable = false)
    private String reviewCount;

    @Column(name = "score_info")
    private String scoreInfo;

    @Enumerated(EnumType.STRING)
    @Column(name = "ampm", nullable = false)
    private AmpmType ampm;

    @Column(name = "is_valid", nullable = false)
    private Boolean isValid;

    @Column(name = "chart_date", nullable = false)
    private LocalDateTime chartDate;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public void setRankWithAd(Integer rankWithAd) {
        this.rankWithAd = rankWithAd;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public void setReviewCount(String reviewCount) {
        this.reviewCount = reviewCount;
    }

    public void setScoreInfo(String scoreInfo) {
        this.scoreInfo = scoreInfo;
    }

    public void setIsValid(Boolean isValid) {
        this.isValid = isValid;
    }

    public void setChartDate(LocalDateTime chartDate) {
        this.chartDate = chartDate;
    }

    public void setUpdateDate(LocalDateTime updateDate) {
        this.updateDate = updateDate;
    }

}
