package kr.co.nomadlab.nomadrank.model.user.repository;

import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByIdAndDeleteDateIsNull(Long id);

    Optional<UserEntity> findByUsernameAndDeleteDateIsNull(String username);

    Optional<UserEntity> findByUsername(String username);

    List<UserEntity> findByAuthorityContains(UserAuthoritySort authoritySort);

    List<UserEntity> findByAuthorityContainsAndDistributorEntity(UserAuthoritySort authoritySort, DistributorEntity distributorEntity);

    @Query("SELECT DISTINCT u FROM UserEntity u " +
            "JOIN u.nplaceRankShopEntityList s " +
            "JOIN s.nplaceRankShopTrackInfoEntityList t " +
            "WHERE t.nplaceRankShopTrackInfoStatus = :status")
    List<UserEntity> findAllWithRunningTrackInfo();

    UserEntity findByDistributorEntity_Id(Long id);

    UserEntity findByCompanyNumber(String companyNumber);

    long countByCompanyNumber(String companyNumber);

    List<UserEntity> findByAuthorityIn(Collection<UserAuthoritySort> authorities);

    boolean existsByUsername(String username);

    /**
     * OAuth 제공자와 제공자 사용자 ID로 사용자 조회
     * 카카오, 구글 등 소셜 로그인 사용자 조회에 사용
     */
    Optional<UserEntity> findByProviderAndProviderIdAndDeleteDateIsNull(String provider, String providerId);

    /**
     * OAuth 제공자와 제공자 사용자 ID 중복 확인
     * 소셜 로그인 사용자 존재 여부 확인
     */
    boolean existsByProviderAndProviderId(String provider, String providerId);

    /**
     * 이메일로 사용자 조회
     * 이메일 중복 확인 및 사용자 검색에 사용
     */
    Optional<UserEntity> findByEmail(String email);

    /**
     * 이메일 중복 확인
     * 회원가입 시 이메일 중복 여부 확인
     */
    boolean existsByEmail(String email);
}
