package kr.co.nomadlab.nomadrank.domain.payment.scheduler;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import kr.co.nomadlab.nomadrank.domain.payment.service.RecurringReservationJobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecurringReservationScheduler {

    private final RecurringReservationJobService reservationJobService;

    /**
     * 매일 03시에 다음 결제 예정자에 대한 예약을 보강한다.
     */
    @Scheduled(cron = "0 0 3 * * *", zone = "Asia/Seoul")
    public void ensureUpcomingReservations() {
        LocalDate today = LocalDate.now();
        log.info("[ReservationScheduler] 예정 예약 검증 시작 - today={}", today);
        reservationJobService.ensureUpcomingReservations(today);
    }

    /**
     * 매시간 실행하여 당일 예약 누락/지연 건을 복구한다.
     */
    @Scheduled(cron = "0 5 * * * *", zone = "Asia/Seoul")
    public void recoverOverdueReservations() {
        LocalDate today = LocalDate.now();
        reservationJobService.recoverOverdueReservations(today);
    }
}
