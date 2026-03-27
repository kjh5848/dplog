package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNomadscrapNstoreRankPostTrackInfoDTO {

    private Integer code;
    private String message;
    private DTOData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DTOData {

        private List<NstoreRankTrackInfo> nstoreRankTrackInfoList;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NstoreRankTrackInfo {

            private Long id;
            private String keyword;
            private String mid;
            private String productId;
            private Integer rankChange;
            private Integer rankWithAdChange;
            private JsonNode json;

        }

    }

}
