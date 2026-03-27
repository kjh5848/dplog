package kr.co.nomadlab.nomadrank.model.nplace.reward.place.repository;

import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardProduct;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficShopEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardShopEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NplaceRewardShopRepository extends JpaRepository<NplaceRewardShopEntity, Long> {

    List<NplaceRewardShopEntity> findByUserEntity(UserEntity userEntity);

    Optional<NplaceRewardShopEntity> findByShopId(String shopId);

    Optional<NplaceRewardShopEntity> findByUserEntityAndShopIdAndNplaceRewardProduct(UserEntity userEntity, String shopId, NplaceRewardProduct nplaceRewardProduct);

    List<NplaceRewardShopEntity> findByUserEntityAndNplaceRewardProduct(UserEntity userEntity, NplaceRewardProduct nplaceRewardProduct);

    Optional<NplaceRewardShopEntity> findByUserEntityAndShopId(UserEntity userEntity, String shopId);
}
