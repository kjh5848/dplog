package kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.repository;

import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.enums.NplaceRewardBlogWritersType;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceRewardBlogWritersEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NplaceRewardBlogWritersRepository extends JpaRepository<NplaceRewardBlogWritersEntity, Long> {

    List<NplaceRewardBlogWritersEntity> findByUserEntityAndDeleteDateNull(UserEntity userEntity);

    Optional<NplaceRewardBlogWritersEntity> findByIdAndUserEntity(Long id, UserEntity userEntity);

    Optional<NplaceRewardBlogWritersEntity> findByUserEntityAndNplaceRewardBlogWritersType(UserEntity userEntity, NplaceRewardBlogWritersType nplaceRewardBlogWritersType);

    Optional<NplaceRewardBlogWritersEntity> findByDistributorEntityAndNplaceRewardBlogWritersType(DistributorEntity distributorEntity, NplaceRewardBlogWritersType nplaceRewardBlogWritersType);
}
