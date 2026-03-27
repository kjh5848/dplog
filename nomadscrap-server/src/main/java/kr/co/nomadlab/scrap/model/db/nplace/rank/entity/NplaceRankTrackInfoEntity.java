package kr.co.nomadlab.scrap.model.db.nplace.rank.entity;

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
@Table(name = "NPLACE_RANK_TRACK_INFO")
@DynamicInsert
@DynamicUpdate
public class NplaceRankTrackInfoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "keyword", nullable = false)
    private String keyword;

    @Column(name = "province", nullable = false)
    private String province;

    @Column(name = "business_sector", nullable = false)
    private String businessSector;

    @Column(name = "shop_id")
    private String shopId;

    @Column(name = "rank_change", nullable = false)
    private Integer rankChange;

    @Type(JsonType.class)
    @Column(name = "json", columnDefinition = "longtext")
    private JsonNode json;

    @Enumerated(EnumType.STRING)
    @Column(name = "track_status", nullable = false)
    private TrackStatusType trackStatus;

    @Column(name = "today_nplace_rank_track_id")
    private Long todayNplaceRankTrackId;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @OneToMany(mappedBy = "nplaceRankTrackInfoEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<NplaceRankTrackEntity> nplaceRankTrackEntityList;

    @Transient
    private Integer serviceStatus;

    @Transient
    private LocalDateTime trackStartDate;

    public void setRankChange(Integer rankChange) {
        this.rankChange = rankChange;
    }

    public void setJson(JsonNode json) {
        this.json = json;
    }

    public void setTrackStatus(TrackStatusType trackStatus) {
        this.trackStatus = trackStatus;
    }

    public void setTodayNplaceRankTrackId(Long todayRankNplaceTrackId) {
        this.todayNplaceRankTrackId = todayRankNplaceTrackId;
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
