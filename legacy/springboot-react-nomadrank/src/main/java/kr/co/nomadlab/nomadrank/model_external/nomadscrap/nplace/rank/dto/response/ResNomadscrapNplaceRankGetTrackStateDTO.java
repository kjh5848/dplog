package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNomadscrapNplaceRankGetTrackStateDTO {

    private Integer code;
    private String message;
    private DTOData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DTOData {

        private Integer totalTrackInfoCount;
        private Integer completedTrackInfoCount;
        private List<CompletedTrackInfoList> completedTrackInfoList;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class CompletedTrackInfoList {

            private String keyword;
            private String province;

        }
    }


}
