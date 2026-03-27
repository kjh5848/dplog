package kr.co.nomadlab.scrap.domain.nplace.rank.dto.request;

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
public class ReqNplaceRankPostTrackChartDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceRankTrackInfoList를 입력하세요.")
    private List<NplaceRankTrackInfo> nplaceRankTrackInfoList;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRankTrackInfo {
        @NotNull(message = "id를 입력하세요.")
        private Long id;
        @NotNull(message = "trackStartDate를 입력하세요.")
        private LocalDateTime trackStartDate;
    }

}
