package kr.co.nomadlab.scrap.domain.nstore.rank.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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
public class ReqNstoreRankPostTrackChartDTOApiV1 {

    @Valid
    @NotNull(message = "nstoreRankTrackInfoList를 입력하세요.")
    private List<NstoreRankTrackInfo> nstoreRankTrackInfoList;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NstoreRankTrackInfo {
        @NotNull(message = "id를 입력하세요.")
        private Long id;
        @NotNull(message = "trackStartDate를 입력하세요.")
        private LocalDateTime trackStartDate;
    }

}
