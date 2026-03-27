package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNomadscrapNstoreRankPostTrackChartDTO {

    private Integer code;
    private String message;
    private DTOData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DTOData {

        private Map<String, NstoreRankTrackInfo> nstoreRankTrackInfoMap;

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
            private List<NstoreRankTrack> nstoreRankTrackList;
            private JsonNode json;

            @Data
            @Builder
            @NoArgsConstructor
            @AllArgsConstructor
            public static class NstoreRankTrack {

                private Integer rank;
                private Integer prevRank;
                private Integer rankWithAd;
                private Integer prevRankWithAd;
                private String price;
                private String reviewCount;
                private String scoreInfo;
                private String ampm;
                private Boolean isValid;
                private LocalDateTime chartDate;
                private LocalDateTime createDate;

            }

        }

    }

}
