package kr.co.nomadlab.nomadrank.model.scheduler;

import kr.co.nomadlab.nomadrank.domain.point.service.PointServiceApiV1;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PointScheduler {

    private final PointServiceApiV1 pointServiceApiV1;

    @Scheduled(cron = "0 0 0 1 * *")
    public void monthlyPayment(){
        pointServiceApiV1.monthlyPayment();
    }
}
