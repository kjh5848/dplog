package kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.repository;

import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceRewardBlogWritersRegisterEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NplaceRewardBlogWritersRegisterRepository extends JpaRepository<NplaceRewardBlogWritersRegisterEntity, Long> {

    List<NplaceRewardBlogWritersRegisterEntity> findByUserEntity(UserEntity userEntity);
}
