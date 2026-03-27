package kr.co.nomadlab.nomadrank.model.nstore.rank.repository;

import kr.co.nomadlab.nomadrank.model.nstore.rank.entity.NstoreRankProductEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NstoreRankProductRepository extends JpaRepository<NstoreRankProductEntity, Long> {

    Optional<NstoreRankProductEntity> findByUserEntityAndProductIdAndProductIdIsNotNull(UserEntity userEntity, String productId);

    Optional<NstoreRankProductEntity> findByUserEntityAndMidAndMidIsNotNull(UserEntity userEntity, String mid);

    Optional<NstoreRankProductEntity> findByUserEntityAndProductIdOrMid(UserEntity userEntity, String productId, String mid);

    List<NstoreRankProductEntity> findByUserEntity(UserEntity userEntity);

}
