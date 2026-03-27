package kr.co.nomadlab.nomadrank.model.nplace.rank.repository;

import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankSearchShopEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NplaceRankSearchShopRepository extends JpaRepository<NplaceRankSearchShopEntity, Long> {

    List<NplaceRankSearchShopEntity> findBySearchKeyword_KeywordAndSearchKeyword_ProvinceAndCreateDateBetween(String keyword, String province, LocalDateTime createDateStart, LocalDateTime createDateEnd);
}
