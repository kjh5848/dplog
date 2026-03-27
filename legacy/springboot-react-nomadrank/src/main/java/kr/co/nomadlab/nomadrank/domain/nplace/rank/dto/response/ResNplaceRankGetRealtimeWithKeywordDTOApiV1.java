package kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.response;

import java.util.List;

import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankSearchShopEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRankGetRealtimeWithKeywordDTOApiV1 {

        private List<NplaceRankData> nplaceRankDataList;

        public static ResNplaceRankGetRealtimeWithKeywordDTOApiV1 of(
                        List<NplaceRankSearchShopEntity> nplaceRankSearchShopEntityList) {
                return ResNplaceRankGetRealtimeWithKeywordDTOApiV1.builder()
                                .nplaceRankDataList(NplaceRankData.fromEntityList(nplaceRankSearchShopEntityList))
                                .build();
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NplaceRankData {

                private TrackInfo trackInfo;
                private RankInfo rankInfo;

                public static List<NplaceRankData> fromEntityList(
                                List<NplaceRankSearchShopEntity> nplaceRankSearchShopEntityList) {
                        return nplaceRankSearchShopEntityList.stream()
                                        .map(NplaceRankData::fromEntity)
                                        .toList();
                }

                public static NplaceRankData fromEntity(
                                NplaceRankSearchShopEntity nplaceRankSearchShopEntity) {
                        return NplaceRankData.builder()
                                        .trackInfo(TrackInfo.builder()
                                                        .shopId(nplaceRankSearchShopEntity.getShopId())
                                                        .shopName(nplaceRankSearchShopEntity.getShopName())
                                                        .shopImageUrl(nplaceRankSearchShopEntity.getShopImageUrl())
                                                        .category(nplaceRankSearchShopEntity.getCategory())
                                                        .address(nplaceRankSearchShopEntity.getAddress())
                                                        .roadAddress(nplaceRankSearchShopEntity.getRoadAddress())
                                                        .visitorReviewCount(nplaceRankSearchShopEntity
                                                                        .getVisitorReviewCount())
                                                        .blogReviewCount(
                                                                        nplaceRankSearchShopEntity.getBlogReviewCount())
                                                        .scoreInfo(nplaceRankSearchShopEntity.getScoreInfo())
                                                        .saveCount(nplaceRankSearchShopEntity.getSaveCount())
                                                        .build())
                                        .rankInfo(RankInfo.builder()
                                                        .rank(nplaceRankSearchShopEntity.getRank())
                                                        .totalCount(nplaceRankSearchShopEntity.getTotalCount())
                                                        .build())
                                        .build();
                }

                @Data
                @Builder
                @NoArgsConstructor
                @AllArgsConstructor
                public static class TrackInfo {
                        private String shopId;
                        private String shopName;
                        private String shopImageUrl;
                        private String category;
                        private String address;
                        private String roadAddress;
                        private String visitorReviewCount;
                        private String blogReviewCount;
                        private String scoreInfo;
                        private String saveCount;
                }

                @Data
                @Builder
                @NoArgsConstructor
                @AllArgsConstructor
                public static class RankInfo {
                        private Integer rank;
                        private Integer totalCount;
                }

        }
}
