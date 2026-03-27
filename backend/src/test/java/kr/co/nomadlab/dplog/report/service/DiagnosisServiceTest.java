package kr.co.nomadlab.dplog.report.service;

import kr.co.nomadlab.dplog.common.exception.BusinessException;
import kr.co.nomadlab.dplog.ranking.domain.KeywordSet;
import kr.co.nomadlab.dplog.ranking.repository.KeywordSetRepository;
import kr.co.nomadlab.dplog.ranking.repository.RankingItemRepository;
import kr.co.nomadlab.dplog.ranking.repository.RankingSnapshotRepository;
import kr.co.nomadlab.dplog.report.domain.DiagnosisRequest;
import kr.co.nomadlab.dplog.report.domain.DiagnosisStatus;
import kr.co.nomadlab.dplog.report.dto.DiagnosisCreateRequest;
import kr.co.nomadlab.dplog.report.repository.DiagnosisRequestRepository;
import kr.co.nomadlab.dplog.store.domain.Store;
import kr.co.nomadlab.dplog.store.service.StoreService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * DiagnosisService 단위 테스트 (TDD)
 * - jobKey 중복 방지 (409 Conflict)
 * - 정상 생성 (PENDING + jobId 반환)
 * - 키워드 세트 미존재 (404 Not Found)
 */
@ExtendWith(MockitoExtension.class)
class DiagnosisServiceTest {

    @Mock private DiagnosisRequestRepository diagnosisRequestRepository;
    @Mock private RankingSnapshotRepository rankingSnapshotRepository;
    @Mock private RankingItemRepository rankingItemRepository;
    @Mock private KeywordSetRepository keywordSetRepository;
    @Mock private StoreService storeService;
    @Mock private DiagnosisAsyncExecutor asyncExecutor;

    @InjectMocks
    private DiagnosisService diagnosisService;

    private Store testStore;
    private KeywordSet testKeywordSet;

    @BeforeEach
    void setUp() {
        testStore = new Store("테스트 맛집", "한식", "서울시 강남구");
        testKeywordSet = new KeywordSet(1L, "강남맛집,신논현맛집,테헤란로맛집");
    }

    @Test
    @DisplayName("정상 진단 요청 생성 → PENDING 상태 + jobId 반환")
    void shouldCreateDiagnosisSuccessfully() {
        // given
        Long storeId = 1L;
        Long memberId = 1L;
        DiagnosisCreateRequest request = new DiagnosisCreateRequest(1L);
        when(storeService.findStoreOrThrow(storeId)).thenReturn(testStore);
        when(keywordSetRepository.findById(1L)).thenReturn(Optional.of(testKeywordSet));
        when(diagnosisRequestRepository.findByJobKey(anyString())).thenReturn(Optional.empty());
        when(diagnosisRequestRepository.save(any(DiagnosisRequest.class)))
                .thenAnswer(invocation -> {
                    // ID를 직접 설정할 수 없으므로 mock 반환
                    DiagnosisRequest mockSaved = mock(DiagnosisRequest.class);
                    when(mockSaved.getId()).thenReturn(42L);
                    return mockSaved;
                });

        // when
        Long jobId = diagnosisService.createDiagnosis(memberId, storeId, request);

        // then
        assertEquals(42L, jobId);
        verify(diagnosisRequestRepository).save(any(DiagnosisRequest.class));
        verify(asyncExecutor).execute(42L);
    }

    @Test
    @DisplayName("jobKey 중복 시 409 Conflict 반환")
    void shouldThrowConflictWhenDuplicateJobKey() {
        // given
        Long storeId = 1L;
        Long memberId = 1L;
        DiagnosisCreateRequest request = new DiagnosisCreateRequest(1L);
        when(storeService.findStoreOrThrow(storeId)).thenReturn(testStore);
        when(keywordSetRepository.findById(1L)).thenReturn(Optional.of(testKeywordSet));

        DiagnosisRequest existingRequest = mock(DiagnosisRequest.class);
        when(existingRequest.getId()).thenReturn(99L);
        when(existingRequest.getStatus()).thenReturn(DiagnosisStatus.RUNNING);
        when(diagnosisRequestRepository.findByJobKey(anyString()))
                .thenReturn(Optional.of(existingRequest));

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> diagnosisService.createDiagnosis(memberId, storeId, request));

        assertEquals("CONFLICT", exception.getCode());
        assertEquals(409, exception.getHttpStatus());
        assertTrue(exception.getMessage().contains("이미 동일한 진단 요청"));

        // 비동기 실행자는 호출되지 않아야 함
        verify(asyncExecutor, never()).execute(anyLong());
    }

    @Test
    @DisplayName("존재하지 않는 키워드 세트 → 404 Not Found")
    void shouldThrowNotFoundWhenKeywordSetMissing() {
        // given
        Long storeId = 1L;
        Long memberId = 1L;
        DiagnosisCreateRequest request = new DiagnosisCreateRequest(999L);
        when(storeService.findStoreOrThrow(storeId)).thenReturn(testStore);
        when(keywordSetRepository.findById(999L)).thenReturn(Optional.empty());

        // when & then
        BusinessException exception = assertThrows(BusinessException.class,
                () -> diagnosisService.createDiagnosis(memberId, storeId, request));

        assertEquals("NOT_FOUND", exception.getCode());
        assertEquals(404, exception.getHttpStatus());
    }
}
