package kr.co.nomadlab.scrap.model.db.user.repository;

import kr.co.nomadlab.scrap.model.db.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByIdAndDeleteDateIsNull(Long id);

    Optional<UserEntity> findByApiKeyAndDeleteDateIsNull(String apiKey);

}
