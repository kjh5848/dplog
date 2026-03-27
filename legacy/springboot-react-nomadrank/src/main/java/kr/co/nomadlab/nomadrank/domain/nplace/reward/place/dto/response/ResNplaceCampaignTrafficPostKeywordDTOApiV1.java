package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.response;

import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficKeywordEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficShopEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceCampaignTrafficPostKeywordDTOApiV1 {

    private NplaceCampaignTrafficShop nplaceCampaignTrafficShop;

    public static ResNplaceCampaignTrafficPostKeywordDTOApiV1 of(
            NplaceCampaignTrafficShopEntity nplaceCampaignTrafficShopEntity
    ) {
        return ResNplaceCampaignTrafficPostKeywordDTOApiV1.builder()
                .nplaceCampaignTrafficShop(NplaceCampaignTrafficShop.fromEntity(nplaceCampaignTrafficShopEntity))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceCampaignTrafficShop {

        private Long id;
        private String shopId;
        private String shopName;
        private String shopImageUrl;
        private String category;
        private String address;
        private String roadAddress;
        private String visitorReviewCount;
        private String blogReviewCount;
        private String scoreInfo;
        private List<NplaceCampaignTrafficKeyword> nplaceCampaignTrafficKeywordList;

        public static NplaceCampaignTrafficShop fromEntity(
                NplaceCampaignTrafficShopEntity nplaceCampaignTrafficShop
        ) {
            return NplaceCampaignTrafficShop.builder()
                    .id(nplaceCampaignTrafficShop.getId())
                    .shopId(nplaceCampaignTrafficShop.getShopId())
                    .shopName(nplaceCampaignTrafficShop.getShopName())
                    .shopImageUrl(nplaceCampaignTrafficShop.getShopImageUrl())
                    .category(nplaceCampaignTrafficShop.getCategory())
                    .address(nplaceCampaignTrafficShop.getAddress())
                    .roadAddress(nplaceCampaignTrafficShop.getRoadAddress())
                    .visitorReviewCount(nplaceCampaignTrafficShop.getVisitorReviewCount())
                    .blogReviewCount(nplaceCampaignTrafficShop.getBlogReviewCount())
                    .scoreInfo(nplaceCampaignTrafficShop.getScoreInfo())
                    .nplaceCampaignTrafficKeywordList(NplaceCampaignTrafficKeyword.fromEntityList(nplaceCampaignTrafficShop.getNplaceCampaignTrafficKeywordEntityList()))
                    .build();
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NplaceCampaignTrafficKeyword {

            private Long id;
            private String keyword;

            public static List<NplaceCampaignTrafficKeyword> fromEntityList(
                    List<NplaceCampaignTrafficKeywordEntity> nplaceCampaignTrafficKeywordEntityList
            ) {
                return nplaceCampaignTrafficKeywordEntityList
                        .stream()
                        .map(NplaceCampaignTrafficKeyword::fromEntity)
                        .toList();
            }

            public static NplaceCampaignTrafficKeyword fromEntity(
                    NplaceCampaignTrafficKeywordEntity nplaceCampaignTrafficKeywordEntity
            ) {
                return NplaceCampaignTrafficKeyword.builder()
                        .id(nplaceCampaignTrafficKeywordEntity.getId())
                        .keyword(nplaceCampaignTrafficKeywordEntity.getKeyword())
                        .build();
            }

        }

    }

}
