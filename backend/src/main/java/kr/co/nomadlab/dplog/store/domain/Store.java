package kr.co.nomadlab.dplog.store.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 가게 엔티티
 * - 가게 기본 정보 (이름, 카테고리, 주소, 플레이스 URL 등)
 * - 내순이에서 수집하는 메타 정보 포함
 */
@Entity
@Table(name = "stores")
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 가게명 */
    @Column(nullable = false)
    private String name;

    /** 업종 카테고리 (예: 한식, 중식, 카페 등) */
    @Column(nullable = false)
    private String category;

    /** 가게 주소 (지번) */
    @Column(nullable = false)
    private String address;

    /** 도로명 주소 */
    private String roadAddress;

    /** 네이버 플레이스 URL (옵션) */
    @Column(length = 500)
    private String placeUrl;

    /** 전화번호 (옵션) */
    private String phone;

    /** 가게 대표 이미지 URL (내순이에서 수집) */
    @Column(length = 500)
    private String shopImageUrl;

    /** 네이버 플레이스 shopId (내순이에서 수집) */
    private String shopId;

    /** 방문자 리뷰 수 (내순이에서 수집) */
    private String visitorReviewCount;

    /** 블로그 리뷰 수 (내순이에서 수집) */
    private String blogReviewCount;

    /** 별점 (내순이에서 수집) */
    private String scoreInfo;

    /** 저장 수 (내순이에서 수집) */
    private String saveCount;

    /** 업종 분류 - restaurant, hairshop, hospital 등 (내순이에서 수집) */
    private String businessSector;

    /** 소유자 ID */
    private Long ownerId;

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
    protected Store() {}

    public Store(String name, String category, String address) {
        this.name = name;
        this.category = category;
        this.address = address;
    }

    // Getter
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getAddress() { return address; }
    public String getRoadAddress() { return roadAddress; }
    public String getPlaceUrl() { return placeUrl; }
    public String getPhone() { return phone; }
    public String getShopImageUrl() { return shopImageUrl; }
    public String getShopId() { return shopId; }
    public String getVisitorReviewCount() { return visitorReviewCount; }
    public String getBlogReviewCount() { return blogReviewCount; }
    public String getScoreInfo() { return scoreInfo; }
    public String getSaveCount() { return saveCount; }
    public String getBusinessSector() { return businessSector; }
    public Long getOwnerId() { return ownerId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setter (필요한 필드만)
    public void setName(String name) { this.name = name; }
    public void setCategory(String category) { this.category = category; }
    public void setAddress(String address) { this.address = address; }
    public void setRoadAddress(String roadAddress) { this.roadAddress = roadAddress; }
    public void setPlaceUrl(String placeUrl) { this.placeUrl = placeUrl; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setShopImageUrl(String shopImageUrl) { this.shopImageUrl = shopImageUrl; }
    public void setShopId(String shopId) { this.shopId = shopId; }
    public void setVisitorReviewCount(String visitorReviewCount) { this.visitorReviewCount = visitorReviewCount; }
    public void setBlogReviewCount(String blogReviewCount) { this.blogReviewCount = blogReviewCount; }
    public void setScoreInfo(String scoreInfo) { this.scoreInfo = scoreInfo; }
    public void setSaveCount(String saveCount) { this.saveCount = saveCount; }
    public void setBusinessSector(String businessSector) { this.businessSector = businessSector; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
}

