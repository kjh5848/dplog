package kr.co.nomadlab.scrap.model.db.nplace.rank.entity;

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
@Table(name = "NPLACE_RANK_TRACK")
@DynamicInsert
@DynamicUpdate
public class NplaceRankTrackEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nplace_rank_track_info_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NplaceRankTrackInfoEntity nplaceRankTrackInfoEntity;

    @Column(name = "rank", nullable = false)
    private Integer rank;

    @Column(name = "prev_rank", nullable = false)
    private Integer prevRank;

    @Column(name = "visitor_review_count", nullable = false)
    private String visitorReviewCount;

    @Column(name = "blog_review_count", nullable = false)
    private String blogReviewCount;

    @Column(name = "score_info")
    private String scoreInfo;

    @Column(name = "save_count")
    private String saveCount;

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

    public void setVisitorReviewCount(String reviewCount) {
        this.visitorReviewCount = reviewCount;
    }

    public void setBlogReviewCount(String reviewCount) {
        this.blogReviewCount = reviewCount;
    }

    public void setScoreInfo(String scoreInfo) {
        this.scoreInfo = scoreInfo;
    }

    public void setSaveCount(String saveCount) {
        this.saveCount = saveCount;
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
