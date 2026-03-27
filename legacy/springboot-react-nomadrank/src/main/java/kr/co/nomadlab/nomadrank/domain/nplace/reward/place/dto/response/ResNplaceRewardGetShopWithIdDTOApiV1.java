package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.response;

import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRewardGetShopWithIdDTOApiV1 {

    private NplaceRewardShop nplaceRewardShop;

    public static ResNplaceRewardGetShopWithIdDTOApiV1 of(
            NplaceRewardShopEntity nplaceRewardShopEntity
    ) {
        return ResNplaceRewardGetShopWithIdDTOApiV1.builder()
                .nplaceRewardShop(NplaceRewardShop.fromEntity(nplaceRewardShopEntity))
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

            private Long id;
            private String keyword;
            private List<NplaceRewardShopKeywordRegister> nplaceRewardShopKeywordRegisterList;

            public static List<NplaceRewardShopKeyword> fromEntityList(
                    List<NplaceRewardShopKeywordEntity> nplaceRewardShopKeywordEntityList
            ) {
                return nplaceRewardShopKeywordEntityList
                        .stream()
                        .map(NplaceRewardShopKeyword::fromEntity)
                        .toList();
            }

            public static NplaceRewardShopKeyword fromEntity(
                    NplaceRewardShopKeywordEntity nplaceRewardShopKeywordEntity
            ) {
                return NplaceRewardShopKeyword.builder()
                        .id(nplaceRewardShopKeywordEntity.getId())
                        .keyword(nplaceRewardShopKeywordEntity.getKeyword())
                        .nplaceRewardShopKeywordRegisterList(NplaceRewardShopKeywordRegister.fromEntityList(nplaceRewardShopKeywordEntity.getNplaceRewardShopKeywordRegisterEntityList()))
                        .build();
            }

            @Data
            @Builder
            @NoArgsConstructor
            @AllArgsConstructor
            public static class NplaceRewardShopKeywordRegister {
                private String search;
                private String startDate;
                private String endDate;
                private String workingPeriod;
                private Integer goal;
                private String status;

                public static List<NplaceRewardShopKeywordRegister> fromEntityList(
                        List<NplaceRewardShopKeywordRegisterEntity> nplaceRewardShopKeywordRegisterEntityList
                ) {
                    return nplaceRewardShopKeywordRegisterEntityList.stream()
                            .map(NplaceRewardShopKeywordRegister::fromEntity)
                            .toList();
                }

                public static NplaceRewardShopKeywordRegister fromEntity(NplaceRewardShopKeywordRegisterEntity nplaceRewardShopKeywordRegisterEntity) {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                    LocalDate start = LocalDate.parse(nplaceRewardShopKeywordRegisterEntity.getStartDate(), formatter);
                    LocalDate end = LocalDate.parse(nplaceRewardShopKeywordRegisterEntity.getEndDate(), formatter);

                    return NplaceRewardShopKeywordRegister.builder()
                            .search(nplaceRewardShopKeywordRegisterEntity.getSearch())
                            .startDate(nplaceRewardShopKeywordRegisterEntity.getStartDate())
                            .endDate(nplaceRewardShopKeywordRegisterEntity.getEndDate())
                            .workingPeriod((ChronoUnit.DAYS.between(start, end) + 1) + "일")
                            .goal(nplaceRewardShopKeywordRegisterEntity.getGoal())
                            .status(nplaceRewardShopKeywordRegisterEntity.getStatus().name())
                            .build();
                }
            }

        }

    }

}
