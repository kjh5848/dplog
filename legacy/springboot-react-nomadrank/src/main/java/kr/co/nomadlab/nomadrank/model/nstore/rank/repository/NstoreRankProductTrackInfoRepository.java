package kr.co.nomadlab.nomadrank.model.nstore.rank.repository;

import kr.co.nomadlab.nomadrank.model.nstore.rank.entity.NstoreRankProductTrackInfoEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NstoreRankProductTrackInfoRepository extends JpaRepository<NstoreRankProductTrackInfoEntity, Long> {

    Long countByNstoreRankProductEntity_UserEntityAndNomadscrapNstoreRankTrackInfoIdIn(UserEntity userEntity, List<Long> idList);

    List<NstoreRankProductTrackInfoEntity> findByNomadscrapNstoreRankTrackInfoId(Long nomadscrapNstoreRankTrackInfoId);

}
