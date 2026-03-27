package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNomadscrapNplaceRankPostTrackChartDTO {

    private List<NplaceRankTrackInfo> nplaceRankTrackInfoList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRankTrackInfo {
        private Long id;
        private LocalDateTime trackStartDate;
    }

}
