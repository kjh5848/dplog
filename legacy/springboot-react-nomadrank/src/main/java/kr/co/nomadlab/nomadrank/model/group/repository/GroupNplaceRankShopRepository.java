package kr.co.nomadlab.nomadrank.model.group.repository;

import kr.co.nomadlab.nomadrank.model.group.entitiy.GroupNplaceRankShopEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.Optional;

public interface GroupNplaceRankShopRepository extends JpaRepository<GroupNplaceRankShopEntity, Long> {

    Optional<GroupNplaceRankShopEntity> findByNplaceRankShopEntity(NplaceRankShopEntity nplaceRankShopEntity);

    long deleteByNplaceRankShopEntityIn(Collection<NplaceRankShopEntity> nplaceRankShopEntities);
}
