package kr.co.nomadlab.dplog.report.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 진단 리포트 엔티티
 * - AI 분석 결과를 담는 최종 리포트
 */
@Entity
@Table(name = "diagnosis_reports")
public class DiagnosisReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 진단 요청 FK */
    @Column(nullable = false, unique = true)
    private Long diagnosisRequestId;

    /** 리포트 요약 */
    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // 기본 생성자 (JPA 필수)
    protected DiagnosisReport() {}

    public DiagnosisReport(Long diagnosisRequestId, String summary) {
        this.diagnosisRequestId = diagnosisRequestId;
        this.summary = summary;
    }

    // Getter
    public Long getId() { return id; }
    public Long getDiagnosisRequestId() { return diagnosisRequestId; }
    public String getSummary() { return summary; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setter
    public void setSummary(String summary) { this.summary = summary; }
}
