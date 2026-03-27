package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.scheduler;

import kr.co.nomadlab.nomadrank.domain.nplace.reward.place.service.NplaceRewardPlaceServiceApiV1;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NplaceRewardPlaceScheduler {

    private final NplaceRewardPlaceServiceApiV1 nplaceRewardPlaceServiceApiV1;

    @Scheduled(cron = "0 * * * * *")
//    @Scheduled(fixedRate = 60000)
    private void confirmRegister() {
        nplaceRewardPlaceServiceApiV1.confirmRegister();
    }
}
