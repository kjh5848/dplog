package kr.co.nomadlab.scrap.model.db.nplace.rank.repository;

import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankSearchShopEntity;
import kr.co.nomadlab.scrap.model.db.nplace.rank.entity.NplaceRankSearchShopInfoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NplaceRankSearchShopRepository extends JpaRepository<NplaceRankSearchShopEntity, Long> {

}
