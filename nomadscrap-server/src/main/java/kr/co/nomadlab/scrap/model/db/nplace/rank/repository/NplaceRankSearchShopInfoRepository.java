package kr.co.nomadlab.scrap.model.db.nplace.rank.repository;

import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankSearchShopInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NplaceRankSearchShopInfoRepository extends JpaRepository<NplaceRankSearchShopInfoEntity, Long> {

    Optional<NplaceRankSearchShopInfoEntity> findByKeywordAndProvince(String keyword, String province);

    long deleteByKeywordAndProvince(String keyword, String province);
}
