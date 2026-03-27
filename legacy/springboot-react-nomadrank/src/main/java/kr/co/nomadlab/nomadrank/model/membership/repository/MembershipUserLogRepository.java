package kr.co.nomadlab.nomadrank.model.membership.repository;

import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MembershipUserLogRepository extends JpaRepository<MembershipUserLogEntity, Long> {


}
