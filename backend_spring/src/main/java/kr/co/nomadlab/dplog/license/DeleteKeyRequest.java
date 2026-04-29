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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import kr.co.nomadlab.dplog.auth.AppUser;

@Entity
@Table(name = "delete_key_requests")
public class DeleteKeyRequest {
    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "license_id", nullable = false)
    private License license;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private DeleteKeyRequestStatus status = DeleteKeyRequestStatus.PENDING_ADMIN_APPROVAL;

    @Column(name = "delete_key_hash", length = 128)
    private String deleteKeyHash;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private AppUser approvedBy;

    @Column(name = "one_time_viewed_at")
    private Instant oneTimeViewedAt;

    @PrePersist
    void onCreate() {
        requestedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public License getLicense() {
        return license;
    }

    public void setLicense(License license) {
        this.license = license;
    }

    public DeleteKeyRequestStatus getStatus() {
        return status;
    }

    public void setStatus(DeleteKeyRequestStatus status) {
        this.status = status;
    }

    public String getDeleteKeyHash() {
        return deleteKeyHash;
    }

    public void setDeleteKeyHash(String deleteKeyHash) {
        this.deleteKeyHash = deleteKeyHash;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public Instant getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(Instant approvedAt) {
        this.approvedAt = approvedAt;
    }

    public AppUser getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(AppUser approvedBy) {
        this.approvedBy = approvedBy;
    }

    public Instant getOneTimeViewedAt() {
        return oneTimeViewedAt;
    }

    public void setOneTimeViewedAt(Instant oneTimeViewedAt) {
        this.oneTimeViewedAt = oneTimeViewedAt;
    }
}
