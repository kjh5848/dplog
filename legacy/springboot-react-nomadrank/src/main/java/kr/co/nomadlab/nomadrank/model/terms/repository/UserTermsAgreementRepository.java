package kr.co.nomadlab.nomadrank.model.terms.repository;

import kr.co.nomadlab.nomadrank.model.terms.entity.UserTermsAgreementEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserTermsAgreementRepository extends JpaRepository<UserTermsAgreementEntity, Long> {
    Optional<UserTermsAgreementEntity> findByUserEntityAndTermCode(UserEntity userEntity, String termCode);
    List<UserTermsAgreementEntity> findAllByUserEntity(UserEntity userEntity);
}

