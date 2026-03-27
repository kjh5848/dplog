package kr.co.nomadlab.dplog.report.domain;

/**
 * 진단 요청 상태 열거형
 * - 상태 전이: PENDING → RUNNING → SUCCESS / FAILED / PARTIAL
 */
public enum DiagnosisStatus {

    /** 대기 중 (잡 생성 직후) */
    PENDING,

    /** 실행 중 (순위 조회 / 리포트 생성 진행 중) */
    RUNNING,

    /** 성공 (모든 작업 완료) */
    SUCCESS,

    /** 실패 (작업 중 오류 발생) */
    FAILED,

    /** 부분 성공 (일부 키워드 조회 실패 등) */
    PARTIAL
}
