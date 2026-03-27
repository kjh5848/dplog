package kr.co.nomadlab.nomadrank.model.nplace.reward.place.repository;

import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficShopEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NplaceCampaignTrafficShopRepository extends JpaRepository<NplaceCampaignTrafficShopEntity, Long> {

    List<NplaceCampaignTrafficShopEntity> findByUserEntity(UserEntity userEntity);

    Optional<NplaceCampaignTrafficShopEntity> findByShopId(String shopId);

    Optional<NplaceCampaignTrafficShopEntity> findByUserEntityAndShopId(UserEntity userEntity, String shopId);
}
