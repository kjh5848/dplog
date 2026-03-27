package kr.co.nomadlab.scrap.model.db.nstore.rank.repository;

import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankTrackEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface NstoreRankTrackRepository extends JpaRepository<NstoreRankTrackEntity, Long> {

    Optional<NstoreRankTrackEntity> findByCreateDateAfter(LocalDateTime createDate);

}
