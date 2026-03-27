package kr.co.nomadlab.nomadrank.model.nplace.reward.place.repository;

import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficKeywordEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficKeywordTrafficEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NplaceCampaignTrafficKeywordTrafficRepository extends JpaRepository<NplaceCampaignTrafficKeywordTrafficEntity, Long> {

    List<NplaceCampaignTrafficKeywordTrafficEntity> findByNplaceCampaignTrafficKeywordEntity(NplaceCampaignTrafficKeywordEntity nplaceCampaignTrafficKeywordEntity);
}
