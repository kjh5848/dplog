package kr.co.nomadlab.scrap;

import kr.co.nomadlab.scrap.schedule.nplace.rank.worker.NplaceRankScheduleWorker;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/temp")
public class TempController {

    private final NplaceRankScheduleWorker nplaceRankScheduleWorker;

    @GetMapping
    public String renew(
            @RequestParam String apiKey
    ) {
        if (!"nomadlab-jaybon".equals(apiKey)) {
            return "invalid api key";
        }
        nplaceRankScheduleWorker.renew();
        return "success";
    }
}
