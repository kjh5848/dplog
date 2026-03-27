package kr.co.nomadlab.nomadrank.model.nplace.rank.repository;

import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopTrackInfoEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopTrackInfoPointHistoryEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface NplaceRankShopTrackInfoPointHistoryRepository extends JpaRepository<NplaceRankShopTrackInfoPointHistoryEntity, Long> {

    boolean existsByNplaceRankShopTrackInfoEntityAndCreateDateBetween(NplaceRankShopTrackInfoEntity nplaceRankShopTrackInfoEntity, LocalDateTime createDateStart, LocalDateTime createDateEnd);

    boolean existsByPointChargeEntity_UserEntityAndCreateDateBetween(UserEntity userEntity, LocalDateTime createDateStart, LocalDateTime createDateEnd);
}
