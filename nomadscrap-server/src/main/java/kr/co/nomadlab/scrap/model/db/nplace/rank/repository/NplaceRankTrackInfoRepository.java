package kr.co.nomadlab.scrap.model.db.nplace.rank.repository;

import kr.co.nomadlab.scrap.model.db.constraint.TrackStatusType;
import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankTrackInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface NplaceRankTrackInfoRepository extends JpaRepository<NplaceRankTrackInfoEntity, Long> {

    Optional<NplaceRankTrackInfoEntity> findByKeywordAndProvinceAndBusinessSectorAndShopId(String keyword, String province, String businessSector, String shopId);

    Optional<NplaceRankTrackInfoEntity> findByKeywordAndProvinceAndShopId(String keyword, String province, String shopId);

//    List<NplaceRankTrackInfoEntity> findByIdIn(Set<Long> idSet);

    Long countByTrackStatus(TrackStatusType trackStatus);

    List<NplaceRankTrackInfoEntity> findByTrackStatus(TrackStatusType trackStatus);

    Optional<NplaceRankTrackInfoEntity> findFirstByTrackStatus(TrackStatusType trackStatus);

    List<NplaceRankTrackInfoEntity> findByIdIn(Collection<Long> idCollection);
}
