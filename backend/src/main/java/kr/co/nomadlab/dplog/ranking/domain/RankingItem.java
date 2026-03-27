package kr.co.nomadlab.dplog.ranking.domain;

import jakarta.persistence.*;

/**
 * 순위 개별 항목 엔티티
 * - 단일 키워드에 대한 순위 정보
 */
@Entity
@Table(name = "ranking_items")
public class RankingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 스냅샷 FK */
    @Column(nullable = false)
    private Long snapshotId;

    /** 키워드 */
    @Column(nullable = false)
    private String keyword;

    /** 순위 (표시되지 않으면 null) */
    private Integer rank;

    /** 순위 변동 (이전 대비, 옵션) */
    private Integer delta;

    /** 위치 메타 정보 (JSON — 광고/블로그/플레이스 등 구분) */
    @Column(columnDefinition = "TEXT")
    private String positionMeta;

    /** 키워드 월간 검색량 (옵션) */
    private Integer searchVolume;

    // 기본 생성자 (JPA 필수)
    protected RankingItem() {}

    public RankingItem(Long snapshotId, String keyword, Integer rank) {
        this.snapshotId = snapshotId;
        this.keyword = keyword;
        this.rank = rank;
    }

    // Getter
    public Long getId() { return id; }
    public Long getSnapshotId() { return snapshotId; }
    public String getKeyword() { return keyword; }
    public Integer getRank() { return rank; }
    public Integer getDelta() { return delta; }
    public String getPositionMeta() { return positionMeta; }
    public Integer getSearchVolume() { return searchVolume; }

    // Setter
    public void setRank(Integer rank) { this.rank = rank; }
    public void setDelta(Integer delta) { this.delta = delta; }
    public void setPositionMeta(String positionMeta) { this.positionMeta = positionMeta; }
    public void setSearchVolume(Integer searchVolume) { this.searchVolume = searchVolume; }
}
