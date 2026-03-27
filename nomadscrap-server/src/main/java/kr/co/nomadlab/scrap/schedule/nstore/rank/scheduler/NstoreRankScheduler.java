package kr.co.nomadlab.scrap.schedule.nstore.rank.scheduler;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NstoreRankScheduler {
//
//    private final NstoreRankScheduleWorker nstoreRankScheduleWorker;
//
//    // 매일 오전 8시 실행
//    @Async
//    @Scheduled(cron = "0 1 8 * * *")
//    public void renewAt08() {
//        nstoreRankScheduleWorker.renew();
//    }
//
//    // 매일 오후 17시 실행
//    @Async
//    @Scheduled(cron = "0 1 17 * * *")
//    public void renewAt17() {
//        nstoreRankScheduleWorker.renew();
//    }
//
//    @Async
//    @Scheduled(fixedDelay = 1000)
//    public void track() {
//        if (UtilVariable.proxyServerApiKeyQueue.size() < 2) {
//            return;
//        }
//        if (nstoreRankScheduleWorker.countNeedToTrack() > 0) {
//            nstoreRankScheduleWorker.track();
//        } else if (nstoreRankScheduleWorker.countNeedToTrackAgain() > 0) {
//            nstoreRankScheduleWorker.trackAgain();
//        }
//    }
}
