package kr.co.nomadlab.dplog.license;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import kr.co.nomadlab.dplog.auth.AppUser;

@Entity
@Table(name = "admin_audit_logs")
public class AdminAuditLog {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "admin_user_id", nullable = false)
    private AppUser adminUser;

    @Column(nullable = false, length = 80)
    private String action;

    @Column(name = "target_id", nullable = false, length = 80)
    private String targetId;

    @Column(length = 500)
    private String memo;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public void setAdminUser(AppUser adminUser) {
        this.adminUser = adminUser;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId;
    }

    public void setMemo(String memo) {
        this.memo = memo;
    }
}
