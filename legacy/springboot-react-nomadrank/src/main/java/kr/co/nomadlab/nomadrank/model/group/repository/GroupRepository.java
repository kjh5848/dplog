package kr.co.nomadlab.nomadrank.model.group.repository;

import kr.co.nomadlab.nomadrank.model.group.entitiy.GroupEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface GroupRepository extends JpaRepository<GroupEntity, Long> {

    List<GroupEntity> findByUserEntityAndDeleteDateNull(UserEntity userEntity);

    GroupEntity findByIdIn(Collection<Long> ids);
}
