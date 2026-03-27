package kr.co.nomadlab.nomadrank.model.nplace.reward.place.repository;

import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficKeywordEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficShopEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NplaceCampaignTrafficKeywordRepository extends JpaRepository<NplaceCampaignTrafficKeywordEntity, Long> {

    Optional<NplaceCampaignTrafficKeywordEntity> findByNplaceCampaignTrafficShopEntityAndKeyword(NplaceCampaignTrafficShopEntity nplaceCampaignTrafficShopEntity, String keyword);

}
