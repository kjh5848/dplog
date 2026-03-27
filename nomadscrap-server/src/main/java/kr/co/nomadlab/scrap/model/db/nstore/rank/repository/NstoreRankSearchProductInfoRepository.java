package kr.co.nomadlab.scrap.model.db.nstore.rank.repository;

import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankSearchProductInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NstoreRankSearchProductInfoRepository extends JpaRepository<NstoreRankSearchProductInfoEntity, Long> {

    Optional<NstoreRankSearchProductInfoEntity> findByKeyword(String keyword);

    void deleteByKeyword(String keyword);

}
