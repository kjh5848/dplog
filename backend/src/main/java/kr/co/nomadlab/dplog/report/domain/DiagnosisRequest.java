package kr.co.nomadlab.dplog.report.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 진단 요청 엔티티
 * - 상태 머신: PENDING → RUNNING → SUCCESS / FAILED / PARTIAL
 * - 비동기 잡의 진행 상태를 추적
 */
@Entity
@Table(name = "diagnosis_requests")
public class DiagnosisRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 가게 FK */
    @Column(nullable = false)
    private Long storeId;

    /** 요청자 FK */
    @Column(nullable = false)
    private Long memberId;

    /** 대상 키워드 세트 FK */
    @Column(nullable = false)
    private Long keywordSetId;

    /** 실패 시 에러 메시지 */
    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    /** 요청 상태 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiagnosisStatus status;

    /** 중복 방지용 잡 키 (storeId + keywordSetHash + dateBucket) */
    @Column(unique = true)
    private String jobKey;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime startedAt;

    private LocalDateTime finishedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = DiagnosisStatus.PENDING;
        }
    }

    // 기본 생성자 (JPA 필수)
    protected DiagnosisRequest() {}

    public DiagnosisRequest(Long storeId, Long memberId, Long keywordSetId, String jobKey) {
        this.storeId = storeId;
        this.memberId = memberId;
        this.keywordSetId = keywordSetId;
        this.jobKey = jobKey;
        this.status = DiagnosisStatus.PENDING;
    }

    // 상태 전이 메서드

    /** PENDING → RUNNING */
    public void start() {
        this.status = DiagnosisStatus.RUNNING;
        this.startedAt = LocalDateTime.now();
    }

    /** RUNNING → SUCCESS */
    public void complete() {
        this.status = DiagnosisStatus.SUCCESS;
        this.finishedAt = LocalDateTime.now();
    }

    /** RUNNING → FAILED */
    public void fail() {
        this.status = DiagnosisStatus.FAILED;
        this.finishedAt = LocalDateTime.now();
    }

    /** RUNNING → FAILED (에러 메시지 포함) */
    public void fail(String errorMessage) {
        this.status = DiagnosisStatus.FAILED;
        this.errorMessage = errorMessage;
        this.finishedAt = LocalDateTime.now();
    }

    /** RUNNING → PARTIAL (일부만 성공) */
    public void partial() {
        this.status = DiagnosisStatus.PARTIAL;
        this.finishedAt = LocalDateTime.now();
    }

    // Getter
    public Long getId() { return id; }
    public Long getStoreId() { return storeId; }
    public Long getMemberId() { return memberId; }
    public Long getKeywordSetId() { return keywordSetId; }
    public DiagnosisStatus getStatus() { return status; }
    public String getJobKey() { return jobKey; }
    public String getErrorMessage() { return errorMessage; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getFinishedAt() { return finishedAt; }
}
