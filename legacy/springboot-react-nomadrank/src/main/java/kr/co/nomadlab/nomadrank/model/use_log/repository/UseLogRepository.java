package kr.co.nomadlab.nomadrank.model.use_log.repository;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import kr.co.nomadlab.nomadrank.model.use_log.entity.UseLogEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;

public interface UseLogRepository extends JpaRepository<UseLogEntity, Long> {
        long countByUserEntityAndServiceSortAndCreateDateBetween(
                        UserEntity userEntity,
                        ServiceSort serviceSort,
                        java.time.LocalDateTime createDateStart,
                        java.time.LocalDateTime createDateEnd);

        @Modifying
        @Query("DELETE FROM UseLogEntity u WHERE u.userEntity = :user AND u.createDate BETWEEN :start AND :end")
        int deleteByUserAndCreatedBetween(
                        @Param("user") UserEntity user,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

    @Modifying
    @Query("DELETE FROM UseLogEntity u WHERE u.userEntity = :user AND u.serviceSort <> :excludedSort AND u.createDate BETWEEN :start AND :end")
    int deleteByUserAndCreatedBetweenExcludingSort(
            @Param("user") UserEntity user,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("excludedSort") ServiceSort excludedSort);

    @Modifying
    @Query("DELETE FROM UseLogEntity u WHERE u.userEntity = :user AND u.serviceSort = :serviceSort AND u.createDate BETWEEN :start AND :end")
    int deleteByUserAndServiceSortAndCreateDateBetween(
            @Param("user") UserEntity user,
            @Param("serviceSort") ServiceSort serviceSort,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    java.util.Optional<UseLogEntity> findTopByUserEntityAndServiceSortOrderByCreateDateDesc(
            UserEntity userEntity,
            ServiceSort serviceSort);
}
