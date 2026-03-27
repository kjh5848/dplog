package kr.co.nomadlab.scrap.model.db.nstore.rank.repository;

import kr.co.nomadlab.scrap.model.db.constraint.TrackStatusType;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankTrackInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface NstoreRankTrackInfoRepository extends JpaRepository<NstoreRankTrackInfoEntity, Long> {

    Optional<NstoreRankTrackInfoEntity> findByKeywordAndMid(String keyword, String mid);

//    List<NstoreRankTrackInfoEntity> findByIdIn(Set<Long> idSet);

    Long countByTrackStatus(TrackStatusType trackStatus);

    List<NstoreRankTrackInfoEntity> findByTrackStatus(TrackStatusType trackStatus);

    Optional<NstoreRankTrackInfoEntity> findFirstByTrackStatus(TrackStatusType trackStatus);

    List<NstoreRankTrackInfoEntity> findByIdIn(Collection<Long> idCollection);
}
