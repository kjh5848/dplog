package kr.co.nomadlab.scrap.schedule.nplace.rank.scheduler;

import kr.co.nomadlab.scrap.schedule.nplace.rank.worker.NplaceRankScheduleWorker;
import kr.co.nomadlab.scrap.util.UtilVariable;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NplaceRankScheduler {

    private final NplaceRankScheduleWorker nplaceRankScheduleWorker;

//    // 매일 오전 10시 실행
//    @Async
//    @Scheduled(cron = "1 0 10 * * *")
//    public void renewAt10() {
//        nplaceRankScheduleWorker.renew();
//    }
//
//    // 매일 오후 6시 실행
//    @Async
//    @Scheduled(cron = "1 0 18 * * *")
//    public void renewAt18() {
//        nplaceRankScheduleWorker.renew();
//    }

    // 매일 오후 1시 실행
    @Async
    @Scheduled(cron = "1 0 13 * * *")
    public void renewAt13() {
        nplaceRankScheduleWorker.renew();
    }

    @Async
    @Scheduled(fixedDelay = 1000)
    public void track() {
        if (UtilVariable.proxyServerApiKeyQueue.size() < 2) {
            return;
        }
        if (nplaceRankScheduleWorker.countNeedToTrack() > 0) {
            nplaceRankScheduleWorker.track();
        } else if (nplaceRankScheduleWorker.countNeedToTrackAgain() > 0) {
            nplaceRankScheduleWorker.trackAgain();
        }
    }
}
