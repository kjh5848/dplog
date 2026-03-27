package kr.co.nomadlab.scrap.model.db.nplace.rank.repository;

import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankTrackEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface NplaceRankTrackRepository extends JpaRepository<NplaceRankTrackEntity, Long> {

    Optional<NplaceRankTrackEntity> findByCreateDateAfter(LocalDateTime createDate);

}
