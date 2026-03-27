package kr.co.nomadlab.dplog.ranking.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 순위 스냅샷 엔티티
 * - 특정 시점의 순위 조회 결과를 묶는 단위
 */
@Entity
@Table(name = "ranking_snapshots")
public class RankingSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 진단 요청 FK */
    @Column(nullable = false)
    private Long diagnosisRequestId;

    /** 가게 FK (조회 편의) */
    @Column(nullable = false)
    private Long storeId;

    /** 스냅샷 캡처 시각 */
    @Column(nullable = false)
    private LocalDateTime capturedAt;

    @PrePersist
    protected void onCreate() {
        if (this.capturedAt == null) {
            this.capturedAt = LocalDateTime.now();
        }
    }

    // 기본 생성자 (JPA 필수)
    protected RankingSnapshot() {}

    public RankingSnapshot(Long diagnosisRequestId, Long storeId) {
        this.diagnosisRequestId = diagnosisRequestId;
        this.storeId = storeId;
        this.capturedAt = LocalDateTime.now();
    }

    public RankingSnapshot(Long diagnosisRequestId, Long storeId, LocalDateTime capturedAt) {
        this.diagnosisRequestId = diagnosisRequestId;
        this.storeId = storeId;
        this.capturedAt = capturedAt;
    }

    // Getter
    public Long getId() { return id; }
    public Long getDiagnosisRequestId() { return diagnosisRequestId; }
    public Long getStoreId() { return storeId; }
    public LocalDateTime getCapturedAt() { return capturedAt; }
}
