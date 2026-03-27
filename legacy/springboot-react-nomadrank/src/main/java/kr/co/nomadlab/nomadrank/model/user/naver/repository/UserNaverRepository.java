package kr.co.nomadlab.nomadrank.model.user.naver.repository;

import kr.co.nomadlab.nomadrank.model.user.naver.entity.UserNaverEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserNaverRepository extends JpaRepository<UserNaverEntity, Long> {

    Optional<UserNaverEntity> findByUserEntity_Id(Long userId);
    boolean existsByUserEntity_Id(Long userId);
}
