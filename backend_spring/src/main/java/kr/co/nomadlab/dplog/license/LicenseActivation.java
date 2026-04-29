package kr.co.nomadlab.dplog.license;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "license_activations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_license_activations_license_device", columnNames = {"license_id", "device_id_hash"})
})
public class LicenseActivation {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "license_id", nullable = false)
    private License license;

    @Column(name = "device_id_hash", nullable = false, length = 128)
    private String deviceIdHash;

    @Column(length = 40)
    private String platform;

    @Column(name = "app_version", length = 40)
    private String appVersion;

    @Column(name = "activated_at", nullable = false)
    private Instant activatedAt;

    @Column(name = "last_seen_at", nullable = false)
    private Instant lastSeenAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        activatedAt = now;
        lastSeenAt = now;
    }

    @PreUpdate
    void onUpdate() {
        lastSeenAt = Instant.now();
    }

    public License getLicense() {
        return license;
    }

    public void setLicense(License license) {
        this.license = license;
    }

    public String getDeviceIdHash() {
        return deviceIdHash;
    }

    public void setDeviceIdHash(String deviceIdHash) {
        this.deviceIdHash = deviceIdHash;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getAppVersion() {
        return appVersion;
    }

    public void setAppVersion(String appVersion) {
        this.appVersion = appVersion;
    }
}
