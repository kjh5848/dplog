package kr.co.nomadlab.dplog.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "kakao_channel_relations", uniqueConstraints = {
        @UniqueConstraint(name = "uk_kakao_channel_user_channel", columnNames = {"user_id", "channel_public_id"})
})
public class KakaoChannelRelation {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "channel_public_id", nullable = false, length = 120)
    private String channelPublicId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ChannelRelationStatus relation = ChannelRelationStatus.NONE;

    @Column(name = "scope_granted", nullable = false)
    private boolean scopeGranted;

    @Column(name = "checked_at", nullable = false)
    private Instant checkedAt;

    public AppUser getUser() {
        return user;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public String getChannelPublicId() {
        return channelPublicId;
    }

    public void setChannelPublicId(String channelPublicId) {
        this.channelPublicId = channelPublicId;
    }

    public ChannelRelationStatus getRelation() {
        return relation;
    }

    public void setRelation(ChannelRelationStatus relation) {
        this.relation = relation;
    }

    public boolean isScopeGranted() {
        return scopeGranted;
    }

    public void setScopeGranted(boolean scopeGranted) {
        this.scopeGranted = scopeGranted;
    }

    public Instant getCheckedAt() {
        return checkedAt;
    }

    public void setCheckedAt(Instant checkedAt) {
        this.checkedAt = checkedAt;
    }
}
