package kr.co.nomadlab.dplog.report.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * 진단 비동기 실행기 — Virtual Thread 기반 비동기 디스패처
 *
 * 역할: 비동기 실행만 담당. 실제 진단 로직은 DiagnosisJobRunner에 위임.
 * 이렇게 분리하면 @Transactional이 Spring AOP 프록시를 통해 정상 적용됩니다.
 */
@Component
public class DiagnosisAsyncExecutor {

    private static final Logger log = LoggerFactory.getLogger(DiagnosisAsyncExecutor.class);

    private final DiagnosisJobRunner jobRunner;

    public DiagnosisAsyncExecutor(DiagnosisJobRunner jobRunner) {
        this.jobRunner = jobRunner;
    }

    /**
     * 비동기로 진단 실행 (Virtual Thread)
     * - DiagnosisJobRunner.run()을 별도 Bean 호출 → @Transactional 정상 적용
     */
    public void execute(Long jobId) {
        Thread.startVirtualThread(() -> {
            try {
                jobRunner.run(jobId);  // 별도 Bean 호출 → 프록시 경유 → @Transactional 적용
            } catch (Exception e) {
                log.error("진단 비동기 실행 실패: jobId={}", jobId, e);
            }
        });
    }
}
