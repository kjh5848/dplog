package kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.repository;

import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceCampaignBlogWritersEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NplaceCampaignBlogWritersRepository extends JpaRepository<NplaceCampaignBlogWritersEntity, Long> {

    List<NplaceCampaignBlogWritersEntity> findByUserEntity(UserEntity userEntity);
}
