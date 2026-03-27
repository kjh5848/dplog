package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopEntity;
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
public class ResNomadscrapNplaceRankPostTrackDTO {

    private Integer code;
    private String message;
    private DTOData data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DTOData {
        private NplaceRankTrackInfo nplaceRankTrackInfo;

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

            public NplaceRankShopEntity toRankShopEntity(UserEntity userEntity) {
                return NplaceRankShopEntity.builder()
                        .userEntity(userEntity)
                        .shopId(shopId)
                        .shopName(json.get("trackInfo").get("shopName").asText())
                        .shopImageUrl(json.get("trackInfo").get("shopImageUrl").asText())
                        .category(json.get("trackInfo").get("category").asText())
                        .address(json.get("trackInfo").get("address").asText())
                        .roadAddress(json.get("trackInfo").get("roadAddress").asText())
                        .visitorReviewCount(json.get("trackInfo").get("visitorReviewCount").asText())
                        .blogReviewCount(json.get("trackInfo").get("blogReviewCount").asText())
                        .scoreInfo(json.get("trackInfo").get("scoreInfo").asText())
                        .nplaceRankShopTrackInfoEntityList(new ArrayList<>())
                        .build();
            }

        }

    }

}
