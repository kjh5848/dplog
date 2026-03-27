package kr.co.nomadlab.scrap.model.db.nstore.rank.entity;

import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.*;
import kr.co.nomadlab.scrap.model.db.constraint.TrackStatusType;
import lombok.*;
import org.hibernate.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "NSTORE_RANK_TRACK_INFO")
@DynamicInsert
@DynamicUpdate
public class NstoreRankTrackInfoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "keyword", nullable = false)
    private String keyword;

    @Column(name = "mid")
    private String mid;

    @Column(name = "product_id")
    private String productId;

    @Column(name = "rank_change", nullable = false)
    private Integer rankChange;

    @Column(name = "rank_with_ad_change", nullable = false)
    private Integer rankWithAdChange;

    @Type(JsonType.class)
    @Column(name = "json", columnDefinition = "longtext")
    private JsonNode json;

    @Enumerated(EnumType.STRING)
    @Column(name = "track_status", nullable = false)
    private TrackStatusType trackStatus;

    @Column(name = "today_nstore_rank_track_id")
    private Long todayNstoreRankTrackId;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @OneToMany(mappedBy = "nstoreRankTrackInfoEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<NstoreRankTrackEntity> nstoreRankTrackEntityList;

    @Transient
    private Integer serviceStatus;

    @Transient
    private LocalDateTime trackStartDate;

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public void setRankChange(Integer rankChange) {
        this.rankChange = rankChange;
    }

    public void setRankWithAdChange(Integer rankWithAdChange) {
        this.rankWithAdChange = rankWithAdChange;
    }

    public void setJson(JsonNode json) {
        this.json = json;
    }

    public void setTrackStatus(TrackStatusType trackStatus) {
        this.trackStatus = trackStatus;
    }

    public void setTodayNstoreRankTrackId(Long todayRankNstoreTrackId) {
        this.todayNstoreRankTrackId = todayRankNstoreTrackId;
    }

    public void setUpdateDate(LocalDateTime updateDate) {
        this.updateDate = updateDate;
    }

    public void setServiceStatus(Integer serviceStatus) {
        this.serviceStatus = serviceStatus;
    }

    public void setTrackStartDate(LocalDateTime trackStartDate) {
        this.trackStartDate = trackStartDate;
    }

}
