package kr.co.nomadlab.dplog.report.domain;

import jakarta.persistence.*;

/**
 * 리포트 근거 엔티티
 * - 리포트 내용의 출처/근거 정보
 */
@Entity
@Table(name = "report_evidences")
public class ReportEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 리포트 FK */
    @Column(nullable = false)
    private Long reportId;

    /** 근거 출처 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EvidenceSource source;

    /** 참조 정보 (URL, 문서 ID, 데이터 출처 등) */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String reference;

    // 기본 생성자 (JPA 필수)
    protected ReportEvidence() {}

    public ReportEvidence(Long reportId, EvidenceSource source, String reference) {
        this.reportId = reportId;
        this.source = source;
        this.reference = reference;
    }

    // Getter
    public Long getId() { return id; }
    public Long getReportId() { return reportId; }
    public EvidenceSource getSource() { return source; }
    public String getReference() { return reference; }

    /**
     * 근거 출처 열거형
     */
    public enum EvidenceSource {
        /** RAG 검색 결과 */
        RAG,
        /** 순위 데이터 */
        RANKING,
        /** 수동 입력 */
        MANUAL,
        /** 공공데이터 API */
        PUBLIC_DATA
    }
}
