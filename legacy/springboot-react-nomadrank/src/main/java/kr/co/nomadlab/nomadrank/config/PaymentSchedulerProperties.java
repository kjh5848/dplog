package kr.co.nomadlab.nomadrank.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

/**
 * 정기 결제 예약 스케줄러 설정
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "payment.scheduler.reservation")
public class PaymentSchedulerProperties {

    /**
     * 예약 검증을 시작할 리드타임(일)
     */
    private int inspectStartDays = 1;

    /**
     * 예약 검증을 끝낼 리드타임(일)
     */
    private int inspectEndDays = 5;

    /**
     * 예약 실패 시 최대 재시도 횟수
     */
    private int maxRetryAttempts = 3;

    /**
     * 예약 실패 재시도 간격(분)
     */
    private int retryIntervalMinutes = 60;
}
