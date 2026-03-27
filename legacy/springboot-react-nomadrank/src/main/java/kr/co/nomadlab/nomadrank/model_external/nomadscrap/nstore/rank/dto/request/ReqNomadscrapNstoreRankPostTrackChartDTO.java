package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.request;

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
public class ReqNomadscrapNstoreRankPostTrackChartDTO {

    private List<NstoreRankTrackInfo> nstoreRankTrackInfoList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NstoreRankTrackInfo {
        private Long id;
        private LocalDateTime trackStartDate;
    }

}
