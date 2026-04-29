package kr.co.nomadlab.dplog.owner;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import kr.co.nomadlab.dplog.auth.AppUser;

@Entity
@Table(name = "owner_verifications")
public class OwnerVerification {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "business_number_hash", nullable = false, length = 128)
    private String businessNumberHash;

    @Column(name = "opening_date", nullable = false)
    private LocalDate openingDate;

    @Column(name = "representative_name_hash", nullable = false, length = 128)
    private String representativeNameHash;

    @Column(name = "place_id", length = 120)
    private String placeId;

    @Column(name = "place_name", length = 200)
    private String placeName;

    @Column(length = 200)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private OwnerVerificationStatus status;

    @Column(name = "status_reason", length = 500)
    private String statusReason;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public String getBusinessNumberHash() {
        return businessNumberHash;
    }

    public void setBusinessNumberHash(String businessNumberHash) {
        this.businessNumberHash = businessNumberHash;
    }

    public LocalDate getOpeningDate() {
        return openingDate;
    }

    public void setOpeningDate(LocalDate openingDate) {
        this.openingDate = openingDate;
    }

    public String getRepresentativeNameHash() {
        return representativeNameHash;
    }

    public void setRepresentativeNameHash(String representativeNameHash) {
        this.representativeNameHash = representativeNameHash;
    }

    public String getPlaceId() {
        return placeId;
    }

    public void setPlaceId(String placeId) {
        this.placeId = placeId;
    }

    public String getPlaceName() {
        return placeName;
    }

    public void setPlaceName(String placeName) {
        this.placeName = placeName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public OwnerVerificationStatus getStatus() {
        return status;
    }

    public void setStatus(OwnerVerificationStatus status) {
        this.status = status;
    }

    public String getStatusReason() {
        return statusReason;
    }

    public void setStatusReason(String statusReason) {
        this.statusReason = statusReason;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(Instant verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
