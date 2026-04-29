package kr.co.nomadlab.dplog.license;

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
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.UUID;
import kr.co.nomadlab.dplog.auth.AppUser;

@Entity
@Table(name = "licenses", uniqueConstraints = {
        @UniqueConstraint(name = "uk_licenses_product_key_hash", columnNames = "product_key_hash")
})
public class License {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_user_id", nullable = false)
    private AppUser owner;

    @Column(name = "product_key_hash", nullable = false, length = 128)
    private String productKeyHash;

    @Column(name = "key_prefix", nullable = false, length = 16)
    private String keyPrefix;

    @Column(name = "key_last4", nullable = false, length = 4)
    private String keyLast4;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private LicenseStatus status = LicenseStatus.ACTIVE;

    @Column(nullable = false, length = 40)
    private String plan = "BETA";

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @PrePersist
    void onCreate() {
        issuedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public AppUser getOwner() {
        return owner;
    }

    public void setOwner(AppUser owner) {
        this.owner = owner;
    }

    public String getProductKeyHash() {
        return productKeyHash;
    }

    public void setProductKeyHash(String productKeyHash) {
        this.productKeyHash = productKeyHash;
    }

    public String getKeyPrefix() {
        return keyPrefix;
    }

    public void setKeyPrefix(String keyPrefix) {
        this.keyPrefix = keyPrefix;
    }

    public String getKeyLast4() {
        return keyLast4;
    }

    public void setKeyLast4(String keyLast4) {
        this.keyLast4 = keyLast4;
    }

    public LicenseStatus getStatus() {
        return status;
    }

    public void setStatus(LicenseStatus status) {
        this.status = status;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public Instant getIssuedAt() {
        return issuedAt;
    }
}
