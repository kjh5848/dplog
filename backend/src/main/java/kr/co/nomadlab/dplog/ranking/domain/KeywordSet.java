package kr.co.nomadlab.dplog.ranking.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 키워드 세트 엔티티
 * - 가게에 연결된 대표/희망 키워드 목록
 */
@Entity
@Table(name = "keyword_sets")
public class KeywordSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 가게 FK */
    @Column(nullable = false)
    private Long storeId;

    /** 키워드 목록 (쉼표 구분 또는 JSON 배열) */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String keywords;

    /** 유효성 검증 정보 (JSON) */
    @Column(columnDefinition = "TEXT")
    private String validationInfo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // 기본 생성자 (JPA 필수)
    protected KeywordSet() {}

    public KeywordSet(Long storeId, String keywords) {
        this.storeId = storeId;
        this.keywords = keywords;
    }

    // Getter
    public Long getId() { return id; }
    public Long getStoreId() { return storeId; }
    public String getKeywords() { return keywords; }
    public String getValidationInfo() { return validationInfo; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setter
    public void setKeywords(String keywords) { this.keywords = keywords; }
    public void setValidationInfo(String validationInfo) { this.validationInfo = validationInfo; }
}
