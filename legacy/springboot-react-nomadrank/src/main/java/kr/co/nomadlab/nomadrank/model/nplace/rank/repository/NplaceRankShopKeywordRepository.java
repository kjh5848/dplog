package kr.co.nomadlab.nomadrank.model.nplace.rank.repository;

import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopKeywordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NplaceRankShopKeywordRepository extends JpaRepository<NplaceRankShopKeywordEntity, Long> {

    Optional<NplaceRankShopKeywordEntity> findFirstByNplaceRankShopEntity_IdOrderByCreateDateDesc(Long id);

    boolean existsByNplaceRankShopEntityAndCreateDateBetween(NplaceRankShopEntity nplaceRankShopEntity, LocalDateTime createDateStart, LocalDateTime createDateEnd);

    List<NplaceRankShopKeywordEntity> findByNplaceRankShopEntity_IdAndCreateDateBetween(Long id, LocalDateTime createDateStart, LocalDateTime createDateEnd);
}
