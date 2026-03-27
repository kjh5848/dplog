package kr.co.nomadlab.nomadrank.model.nplace.reward.place.repository;

import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardNotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NplaceRewardNotificationRepository extends JpaRepository<NplaceRewardNotificationEntity, Long> {

    List<NplaceRewardNotificationEntity> findByDeleteDateNullOrderByCreateDateDesc();
}
