package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNomadscrapNplaceRankPostTrackDTO {

    private NplaceRankTrackInfo nplaceRankTrackInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRankTrackInfo {
        private String keyword;
        private String province;
        private String shopId;
        private String businessSector;
    }

}
