package kr.co.nomadlab.nomadrank.model.nplace.reward.place.repository;

import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficNotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NplaceCampaignTrafficNotificationRepository extends JpaRepository<NplaceCampaignTrafficNotificationEntity, Long> {

    List<NplaceCampaignTrafficNotificationEntity> findByDeleteDateNullOrderByCreateDateDesc();
}
