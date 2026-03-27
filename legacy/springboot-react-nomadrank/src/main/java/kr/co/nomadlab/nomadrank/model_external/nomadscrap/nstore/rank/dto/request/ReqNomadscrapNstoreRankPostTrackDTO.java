package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNomadscrapNstoreRankPostTrackDTO {

    private NstoreRankTrackInfo nstoreRankTrackInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NstoreRankTrackInfo {
        private String keyword;
        private String mid;
        private String productId;
    }
}
