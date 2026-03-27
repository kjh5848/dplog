package kr.co.nomadlab.nomadrank.model.nplace.rank.repository;

import kr.co.nomadlab.nomadrank.domain.nplace.rank.enums.NplaceRankShopTrackInfoStatus;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopTrackInfoEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NplaceRankShopTrackInfoRepository extends JpaRepository<NplaceRankShopTrackInfoEntity, Long> {

    Long countByNplaceRankShopEntity_UserEntityAndNomadscrapNplaceRankTrackInfoIdIn(UserEntity userEntity, List<Long> idList);

    int countByNplaceRankShopEntity_UserEntity(UserEntity userEntity);

    List<NplaceRankShopTrackInfoEntity> findByNomadscrapNplaceRankTrackInfoId(Long nomadscrapNplaceRankTrackInfoId);

    List<NplaceRankShopTrackInfoEntity> findByNplaceRankShopEntity_UserEntityAndNplaceRankShopTrackInfoStatus(UserEntity userEntity, NplaceRankShopTrackInfoStatus nplaceRankShopTrackInfoStatus);
}
