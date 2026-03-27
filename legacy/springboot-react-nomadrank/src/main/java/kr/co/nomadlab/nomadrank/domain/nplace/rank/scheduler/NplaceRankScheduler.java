package kr.co.nomadlab.nomadrank.domain.nplace.rank.scheduler;

import kr.co.nomadlab.nomadrank.domain.nplace.rank.service.NplaceServiceApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.place.service.NplaceRewardPlaceServiceApiV1;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NplaceRankScheduler {

    private final NplaceServiceApiV1 nplaceServiceApiV1;

    @Scheduled(cron = "0 0 14 * * *")
//    @Scheduled(fixedRate = 6000000)
    public void saveRealtime() {
        nplaceServiceApiV1.saveRealtime();
    }
}
