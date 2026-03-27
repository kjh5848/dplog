package kr.co.nomadlab.nomadrank.model.nplace.rank.repository;

import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface NplaceRankShopRepository extends JpaRepository<NplaceRankShopEntity, Long> {

    Optional<NplaceRankShopEntity> findByUserEntityAndShopId(UserEntity userEntity, String shopId);

    List<NplaceRankShopEntity> findByUserEntity(UserEntity userEntity);

    NplaceRankShopEntity findByIdAndNplaceRankShopKeywordEntityList_CreateDateBetween(Long id, LocalDateTime createDateStart, LocalDateTime createDateEnd);

    List<NplaceRankShopEntity> findByIdIn(Collection<Long> ids);

    int countByUserEntity(UserEntity userEntity);
}
