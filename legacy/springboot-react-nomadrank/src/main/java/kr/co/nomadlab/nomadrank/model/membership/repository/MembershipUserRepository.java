package kr.co.nomadlab.nomadrank.model.membership.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;

public interface MembershipUserRepository extends JpaRepository<MembershipUserEntity, Long> {

  List<MembershipUserEntity> findByUserEntity_Id(Long id);

  Optional<MembershipUserEntity> findByUserEntityAndMembershipState(UserEntity userEntity,
      MembershipState membershipState);

  @Query("""
      SELECT m FROM MembershipUserEntity m
      WHERE m.membershipState = :state
        AND m.userEntity = :userEntity
        AND :startDate >= m.startDate
        AND (m.endDate IS NULL OR :startDate <= m.endDate)
      """)
  Optional<MembershipUserEntity> findActiveMembershipByUserAndDate(
      @Param("userEntity") UserEntity userEntity,
      @Param("state") MembershipState state,
      @Param("startDate") LocalDate startDate);

  Optional<MembershipUserEntity> findTopByUserEntityAndMembershipStateOrderByStartDateDesc(
      UserEntity userEntity,
      MembershipState membershipState);

  @Query("""
      SELECT m
      FROM MembershipUserEntity m
      WHERE m.userEntity = :user
        AND (
             :cursorEndDate IS NULL
             OR (COALESCE(m.endDate, :maxDate) < :cursorEndDate)
             OR (COALESCE(m.endDate, :maxDate) = :cursorEndDate AND m.id < :cursorId)
        )
      ORDER BY COALESCE(m.endDate, :maxDate) DESC, m.id DESC
      """)
  List<MembershipUserEntity> findHistoryByUserWithCursor(
      @Param("user") UserEntity user,
      @Param("cursorEndDate") LocalDate cursorEndDate,
      @Param("cursorId") Long cursorId,
      @Param("maxDate") LocalDate maxDate,
      Pageable pageable);
}
