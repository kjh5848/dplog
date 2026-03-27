package kr.co.nomadlab.nomadrank.model.nplace.reward.place.repository;

import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardProduct;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardPlaceEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NplaceRewardPlaceRepository extends JpaRepository<NplaceRewardPlaceEntity, Long> {

    List<NplaceRewardPlaceEntity> findByUserEntityAndDeleteDateNull(UserEntity userEntity);

    Optional<NplaceRewardPlaceEntity> findByIdAndUserEntity(Long id, UserEntity userEntity);

    Optional<NplaceRewardPlaceEntity> findByUserEntityAndNplaceRewardProduct(UserEntity userEntity, NplaceRewardProduct nplaceRewardProduct);

    Optional<NplaceRewardPlaceEntity> findByDistributorEntityAndNplaceRewardProduct(DistributorEntity distributorEntity, NplaceRewardProduct nplaceRewardProduct);
}
