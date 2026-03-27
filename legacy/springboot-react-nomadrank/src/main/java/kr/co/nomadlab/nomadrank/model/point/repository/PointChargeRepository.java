package kr.co.nomadlab.nomadrank.model.point.repository;

import kr.co.nomadlab.nomadrank.domain.point.enums.PointChargeStatus;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import kr.co.nomadlab.nomadrank.model.point.entity.PointChargeEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface PointChargeRepository extends JpaRepository<PointChargeEntity, Long> {

    List<PointChargeEntity> findByUserEntity_DistributorEntityAndStatusInOrderByCreateDateDesc(DistributorEntity distributorEntity, List<PointChargeStatus> statuses);

    List<PointChargeEntity> findByUserEntityAndStatusInOrderByCreateDateDesc(UserEntity userEntity, List<PointChargeStatus> statuses);

    List<PointChargeEntity> findByStatusInOrderByCreateDateDesc(List<PointChargeStatus> statuses);

}
