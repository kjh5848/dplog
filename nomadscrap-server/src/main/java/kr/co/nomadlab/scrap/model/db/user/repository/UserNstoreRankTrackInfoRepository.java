package kr.co.nomadlab.scrap.model.db.user.repository;

import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankTrackInfoEntity;
import kr.co.nomadlab.scrap.model.db.user.entity.UserEntity;
import kr.co.nomadlab.scrap.model.db.user.entity.UserNstoreRankTrackInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserNstoreRankTrackInfoRepository extends JpaRepository<UserNstoreRankTrackInfoEntity, Long> {

    Optional<UserNstoreRankTrackInfoEntity> findByUserEntityAndNstoreRankTrackInfoEntity(UserEntity userEntity, NstoreRankTrackInfoEntity nstoreRankTrackInfoEntity);

    Optional<UserNstoreRankTrackInfoEntity> findByUserEntityAndNstoreRankTrackInfoEntity_Id(UserEntity userEntity, Long rankNstoreTrackInfo_Id);

    List<UserNstoreRankTrackInfoEntity> findByUserEntityAndNstoreRankTrackInfoEntity_IdIn(UserEntity userEntity, List<Long> rankNstoreTrackInfo_IdList);

    List<UserNstoreRankTrackInfoEntity> findByUserEntity(UserEntity userEntity);

    Long countByNstoreRankTrackInfoEntity_Id(Long rankNstoreTrackInfo_Id);

}
