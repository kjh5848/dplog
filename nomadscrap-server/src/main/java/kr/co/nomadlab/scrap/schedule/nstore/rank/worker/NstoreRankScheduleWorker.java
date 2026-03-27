package kr.co.nomadlab.scrap.schedule.nstore.rank.worker;

import kr.co.nomadlab.scrap.model.db.constraint.TrackStatusType;
import kr.co.nomadlab.scrap.schedule.nstore.rank.service.NstoreRankScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NstoreRankScheduleWorker {

    private final NstoreRankScheduleService nstoreRankScheduleService;

    public void renew() {
        nstoreRankScheduleService.deleteAllRealtimeData();
        nstoreRankScheduleService.updateNstoreRankTrackInfoEntityForTrack();
    }

    public Long countNeedToTrack() {
        return nstoreRankScheduleService.countNeedToTrack();
    }

    public Long countNeedToTrackAgain() {
        return nstoreRankScheduleService.countNeedToTrackAgain();
    }

    public void track() {
        nstoreRankScheduleService.track(TrackStatusType.WAIT);
    }

    public void trackAgain() {
        nstoreRankScheduleService.track(TrackStatusType.WAIT_AGAIN);
    }

}
