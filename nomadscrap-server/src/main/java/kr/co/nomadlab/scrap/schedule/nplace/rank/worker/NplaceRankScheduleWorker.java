package kr.co.nomadlab.scrap.schedule.nplace.rank.worker;

import kr.co.nomadlab.scrap.model.db.constraint.TrackStatusType;
import kr.co.nomadlab.scrap.schedule.nplace.rank.service.NplaceRankScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NplaceRankScheduleWorker {

    private final NplaceRankScheduleService nplaceRankScheduleService;

    public void renew() {
        nplaceRankScheduleService.deleteAllRealtimeData();
        nplaceRankScheduleService.updateNplaceRankTrackInfoEntityForTrack();
    }

    public Long countNeedToTrack() {

        return nplaceRankScheduleService.countNeedToTrack();
    }

    public Long countNeedToTrackAgain() {
        return nplaceRankScheduleService.countNeedToTrackAgain();
    }

    public void track() {
        nplaceRankScheduleService.track(TrackStatusType.WAIT);
    }

    public void trackAgain() {
        nplaceRankScheduleService.track(TrackStatusType.WAIT_AGAIN);
    }

}
