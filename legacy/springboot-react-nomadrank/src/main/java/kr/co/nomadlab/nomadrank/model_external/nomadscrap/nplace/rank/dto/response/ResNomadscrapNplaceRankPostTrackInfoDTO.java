package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response;

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
public class ResNomadscrapNplaceRankPostTrackInfoDTO {

    private Integer code;
    private String message;
    private DTOData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DTOData {

        private List<NplaceRankTrackInfo> nplaceRankTrackInfoList;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NplaceRankTrackInfo {

            private Long id;
            private String keyword;
            private String province;
            private String shopId;
            private Integer rankChange;
            private JsonNode json;

        }
    }


}
