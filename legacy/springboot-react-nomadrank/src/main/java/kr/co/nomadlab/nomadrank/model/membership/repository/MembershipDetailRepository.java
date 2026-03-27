package kr.co.nomadlab.nomadrank.model.membership.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipDetailEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;

public interface MembershipDetailRepository extends JpaRepository<MembershipDetailEntity, Long> {

    MembershipDetailEntity findByMembershipEntityAndServiceSort(MembershipEntity membershipEntity, ServiceSort serviceSort);

    List<MembershipDetailEntity> findByMembershipEntityAndDeleteDateIsNull(MembershipEntity membershipEntity);
}
