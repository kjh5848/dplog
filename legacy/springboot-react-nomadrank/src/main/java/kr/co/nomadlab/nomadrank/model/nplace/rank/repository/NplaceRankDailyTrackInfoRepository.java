package kr.co.nomadlab.nomadrank.model.nplace.rank.repository;

import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankDailyTrackInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NplaceRankDailyTrackInfoRepository extends JpaRepository<NplaceRankDailyTrackInfoEntity, Long> {

    boolean existsByKeywordAndProvince(String keyword, String province);
}
