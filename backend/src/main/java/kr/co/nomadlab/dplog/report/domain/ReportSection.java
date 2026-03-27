package kr.co.nomadlab.dplog.report.domain;

import jakarta.persistence.*;

/**
 * 리포트 섹션 엔티티
 * - 리포트 내 개별 섹션 (요약, 근거, 행동지침, 우선순위 등)
 */
@Entity
@Table(name = "report_sections")
public class ReportSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 리포트 FK */
    @Column(nullable = false)
    private Long reportId;

    /** 섹션 타입 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SectionType type;

    /** 섹션 내용 (마크다운 또는 HTML) */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /** 섹션 순서 */
    @Column(nullable = false)
    private int displayOrder;

    // 기본 생성자 (JPA 필수)
    protected ReportSection() {}

    public ReportSection(Long reportId, SectionType type, String content, int displayOrder) {
        this.reportId = reportId;
        this.type = type;
        this.content = content;
        this.displayOrder = displayOrder;
    }

    // Getter
    public Long getId() { return id; }
    public Long getReportId() { return reportId; }
    public SectionType getType() { return type; }
    public String getContent() { return content; }
    public int getDisplayOrder() { return displayOrder; }

    // Setter
    public void setContent(String content) { this.content = content; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }

    /**
     * 리포트 섹션 타입 열거형
     */
    public enum SectionType {
        /** 전체 요약 */
        SUMMARY,
        /** 데이터 근거 */
        EVIDENCE,
        /** 즉시 실행 가능한 행동 */
        ACTIONS,
        /** 우선순위 정렬 */
        PRIORITY,
        /** 개선 제안 */
        IMPROVEMENT
    }
}
