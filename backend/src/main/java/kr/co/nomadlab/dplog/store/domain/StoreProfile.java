package kr.co.nomadlab.dplog.store.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 가게 확장 프로필 엔티티
 * - 영업시간, 대표 이미지 등 부가 정보
 */
@Entity
@Table(name = "store_profiles")
public class StoreProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 가게 FK */
    @Column(nullable = false, unique = true)
    private Long storeId;

    /** 영업시간 (옵션, JSON 형태 저장) */
    @Column(columnDefinition = "TEXT")
    private String openingHours;

    /** 대표 이미지 URL (옵션) */
    @Column(length = 500)
    private String imageUrl;

    /** 메타 정보 (옵션, JSON 형태 저장) */
    @Column(columnDefinition = "TEXT")
    private String meta;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 기본 생성자 (JPA 필수)
    protected StoreProfile() {}

    public StoreProfile(Long storeId) {
        this.storeId = storeId;
    }

    // Getter
    public Long getId() { return id; }
    public Long getStoreId() { return storeId; }
    public String getOpeningHours() { return openingHours; }
    public String getImageUrl() { return imageUrl; }
    public String getMeta() { return meta; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setter
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setMeta(String meta) { this.meta = meta; }
}
