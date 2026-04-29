package kr.co.nomadlab.dplog.auth;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KakaoChannelRelationRepository extends JpaRepository<KakaoChannelRelation, UUID> {
    Optional<KakaoChannelRelation> findByUserAndChannelPublicId(AppUser user, String channelPublicId);
}
