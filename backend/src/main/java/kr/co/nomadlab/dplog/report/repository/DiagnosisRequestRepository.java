package kr.co.nomadlab.dplog.report.repository;

import kr.co.nomadlab.dplog.report.domain.DiagnosisRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 진단 요청 Repository
 * - jobKey 중복 방지 조회
 * - 가게별 진단 요청 목록 조회
 */
public interface DiagnosisRequestRepository extends JpaRepository<DiagnosisRequest, Long> {

    /** jobKey로 기존 요청 조회 (중복 방지) */
    Optional<DiagnosisRequest> findByJobKey(String jobKey);

    /** 가게별 진단 요청 목록 (최신순) */
    List<DiagnosisRequest> findByStoreIdOrderByCreatedAtDesc(Long storeId);
}
