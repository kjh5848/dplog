package kr.co.nomadlab.dplog.report.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * DiagnosisRequest 상태 전이 단위 테스트 (TDD)
 * - PENDING → RUNNING
 * - RUNNING → SUCCESS
 * - RUNNING → FAILED (에러 메시지 포함)
 * - RUNNING → PARTIAL
 */
class DiagnosisRequestTest {

    @Test
    @DisplayName("생성 시 PENDING 상태")
    void shouldStartWithPendingStatus() {
        // given & when
        DiagnosisRequest request = new DiagnosisRequest(1L, 1L, 1L, "1:hash:20260304");

        // then
        assertEquals(DiagnosisStatus.PENDING, request.getStatus());
        assertNotNull(request.getJobKey());
        assertNull(request.getStartedAt());
        assertNull(request.getFinishedAt());
    }

    @Test
    @DisplayName("PENDING → RUNNING 상태 전이")
    void shouldTransitionFromPendingToRunning() {
        // given
        DiagnosisRequest request = new DiagnosisRequest(1L, 1L, 1L, "1:hash:20260304");

        // when
        request.start();

        // then
        assertEquals(DiagnosisStatus.RUNNING, request.getStatus());
        assertNotNull(request.getStartedAt());
        assertNull(request.getFinishedAt());
    }

    @Test
    @DisplayName("RUNNING → SUCCESS 상태 전이")
    void shouldTransitionFromRunningToSuccess() {
        // given
        DiagnosisRequest request = new DiagnosisRequest(1L, 1L, 1L, "1:hash:20260304");
        request.start();

        // when
        request.complete();

        // then
        assertEquals(DiagnosisStatus.SUCCESS, request.getStatus());
        assertNotNull(request.getFinishedAt());
    }

    @Test
    @DisplayName("RUNNING → FAILED 상태 전이")
    void shouldTransitionFromRunningToFailed() {
        // given
        DiagnosisRequest request = new DiagnosisRequest(1L, 1L, 1L, "1:hash:20260304");
        request.start();

        // when
        request.fail();

        // then
        assertEquals(DiagnosisStatus.FAILED, request.getStatus());
        assertNotNull(request.getFinishedAt());
    }

    @Test
    @DisplayName("RUNNING → FAILED 상태 전이 (에러 메시지 포함)")
    void shouldTransitionFromRunningToFailedWithErrorMessage() {
        // given
        DiagnosisRequest request = new DiagnosisRequest(1L, 1L, 1L, "1:hash:20260304");
        request.start();

        // when
        String errorMsg = "내순이 API 연결 실패: Connection timeout";
        request.fail(errorMsg);

        // then
        assertEquals(DiagnosisStatus.FAILED, request.getStatus());
        assertEquals(errorMsg, request.getErrorMessage());
        assertNotNull(request.getFinishedAt());
    }

    @Test
    @DisplayName("RUNNING → PARTIAL 상태 전이")
    void shouldTransitionFromRunningToPartial() {
        // given
        DiagnosisRequest request = new DiagnosisRequest(1L, 1L, 1L, "1:hash:20260304");
        request.start();

        // when
        request.partial();

        // then
        assertEquals(DiagnosisStatus.PARTIAL, request.getStatus());
        assertNotNull(request.getFinishedAt());
    }

    @Test
    @DisplayName("memberId, keywordSetId, storeId 올바르게 저장")
    void shouldStoreMemberIdAndKeywordSetId() {
        // given & when
        DiagnosisRequest request = new DiagnosisRequest(10L, 5L, 3L, "10:hash:20260304");

        // then
        assertEquals(10L, request.getStoreId());
        assertEquals(5L, request.getMemberId());
        assertEquals(3L, request.getKeywordSetId());
        assertEquals("10:hash:20260304", request.getJobKey());
    }
}
