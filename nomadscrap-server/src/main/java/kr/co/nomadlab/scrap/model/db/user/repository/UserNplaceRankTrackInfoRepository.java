package kr.co.nomadlab.scrap.model.db.user.repository;

import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankTrackInfoEntity;
import kr.co.nomadlab.scrap.model.db.user.entity.UserEntity;
import kr.co.nomadlab.scrap.model.db.user.entity.UserNplaceRankTrackInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserNplaceRankTrackInfoRepository extends JpaRepository<UserNplaceRankTrackInfoEntity, Long> {

    Optional<UserNplaceRankTrackInfoEntity> findByUserEntityAndNplaceRankTrackInfoEntity(UserEntity userEntity, NplaceRankTrackInfoEntity nplaceRankTrackInfoEntity);

    Optional<UserNplaceRankTrackInfoEntity> findByUserEntityAndNplaceRankTrackInfoEntity_Id(UserEntity userEntity, Long rankNplaceTrackInfo_Id);

    List<UserNplaceRankTrackInfoEntity> findByUserEntityAndNplaceRankTrackInfoEntity_IdIn(UserEntity userEntity, List<Long> rankNplaceTrackInfo_IdList);

    List<UserNplaceRankTrackInfoEntity> findByUserEntity(UserEntity userEntity);

    Long countByNplaceRankTrackInfoEntity_Id(Long rankNplaceTrackInfo_Id);

}
