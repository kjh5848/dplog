package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import kr.co.nomadlab.nomadrank.model.nstore.rank.entity.NstoreRankProductEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNomadscrapNstoreRankPostTrackDTO {

    private Integer code;
    private String message;
    private DTOData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DTOData {

        private NstoreRankTrackInfo nstoreRankTrackInfo;

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

            public NstoreRankProductEntity toRankProductEntity(UserEntity userEntity) {
                return NstoreRankProductEntity.builder()
                        .userEntity(userEntity)
                        .mid(mid)
                        .productId(productId)
                        .productName(json.get("trackInfo").get("productName").asText())
                        .productImageUrl(json.get("trackInfo").get("productImageUrl").asText())
                        .category(json.get("trackInfo").get("category").asText())
                        .price(json.get("trackInfo").get("price").asText())
                        .mallName(json.get("trackInfo").get("mallName").asText())
                        .reviewCount(json.get("trackInfo").get("reviewCount").asText())
                        .scoreInfo(json.get("trackInfo").get("scoreInfo").asText())
                        .isCatalog(productId == null)
                        .nstoreRankProductTrackInfoEntityList(new ArrayList<>())
                        .build();
            }

        }

    }

}
