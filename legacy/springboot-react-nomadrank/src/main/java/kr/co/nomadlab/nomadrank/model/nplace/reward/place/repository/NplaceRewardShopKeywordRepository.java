package kr.co.nomadlab.nomadrank.model.nplace.reward.place.repository;

import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardShopEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardShopKeywordEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NplaceRewardShopKeywordRepository extends JpaRepository<NplaceRewardShopKeywordEntity, Long> {

    Optional<NplaceRewardShopKeywordEntity> findByNplaceRewardShopEntityAndKeyword(NplaceRewardShopEntity nplaceRewardShopEntity, String keyword);

}
