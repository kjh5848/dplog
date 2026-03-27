package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.response;

import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardShopEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardShopKeywordEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRewardShopTableDTOApiV1 {

    private List<NplaceRewardShop> nplaceRewardShopList;

    public static ResNplaceRewardShopTableDTOApiV1 of(
            List<NplaceRewardShopEntity> nplaceRewardShopEntityList
    ) {
        return ResNplaceRewardShopTableDTOApiV1.builder()
                .nplaceRewardShopList(ResNplaceRewardShopTableDTOApiV1.NplaceRewardShop.fromEntityList(nplaceRewardShopEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRewardShop {

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
        private List<NplaceRewardShopKeyword> nplaceRewardShopKeywordList;

        public static List<NplaceRewardShop> fromEntityList(
                List<NplaceRewardShopEntity> nplaceRewardShopEntityList
        ) {
            return nplaceRewardShopEntityList.stream()
                    .map(thisNplaceRewardShopEntity -> NplaceRewardShop.fromEntity(thisNplaceRewardShopEntity))
                    .toList();
        }

        public static NplaceRewardShop fromEntity(
                NplaceRewardShopEntity nplaceRewardShopEntity
        ) {
            return NplaceRewardShop.builder()
                    .id(nplaceRewardShopEntity.getId())
                    .shopId(nplaceRewardShopEntity.getShopId())
                    .shopName(nplaceRewardShopEntity.getShopName())
                    .shopImageUrl(nplaceRewardShopEntity.getShopImageUrl())
                    .category(nplaceRewardShopEntity.getCategory())
                    .address(nplaceRewardShopEntity.getAddress())
                    .roadAddress(nplaceRewardShopEntity.getRoadAddress())
                    .visitorReviewCount(nplaceRewardShopEntity.getVisitorReviewCount())
                    .blogReviewCount(nplaceRewardShopEntity.getBlogReviewCount())
                    .scoreInfo(nplaceRewardShopEntity.getScoreInfo())
                    .nplaceRewardShopKeywordList(NplaceRewardShopKeyword.fromEntityList(nplaceRewardShopEntity.getNplaceRewardShopKeywordEntityList()))
                    .build();
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NplaceRewardShopKeyword {

            private String keyword;

            public static List<NplaceRewardShopKeyword> fromEntityList(
                    List<NplaceRewardShopKeywordEntity> nplaceRewardShopKeywordEntityList
            ) {
                return nplaceRewardShopKeywordEntityList.stream()
                        .map(NplaceRewardShopKeyword::fromEntity)
                        .toList();
            }

            public static NplaceRewardShopKeyword fromEntity(
                    NplaceRewardShopKeywordEntity nplaceRewardShopKeywordEntity
            ) {
                return NplaceRewardShopKeyword.builder()
                        .keyword(nplaceRewardShopKeywordEntity.getKeyword())
                        .build();
            }

        }

    }

}
