package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardProduct;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardShopKeywordRegisterStatus;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficRegisterEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardShopKeywordEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardShopKeywordRegisterEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceRewardPostRegisterDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceRewardShopKeywordRegister를 입력하세요.")
    private NplaceRewardShopKeywordRegister nplaceRewardShopKeywordRegister;

//    @Valid
//    @NotNull(message = "nplaceCampaignTrafficKeywordTraffic를 입력하세요.")
//    private NplaceCampaignTrafficKeywordTraffic nplaceCampaignTrafficKeywordTraffic;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRewardShopKeywordRegister {
        @NotNull(message = "startDate를 입력하세요.")
        private String startDate;
        @NotNull(message = "endDate를 입력하세요.")
        private String endDate;
        @NotNull(message = "search를 입력하세요.")
        private String search;
        @NotNull(message = "url를 입력하세요.")
        private String url;
        @NotNull(message = "shopName를 입력하세요.")
        private String shopName;
        @NotNull(message = "goal를 입력하세요.")
        private Integer goal;
        @NotNull(message = "shopId를 입력하세요.")
        private String shopId;
        @NotNull(message = "nplaceRewardShopId를 입력하세요.")
        private Long nplaceRewardShopId;

//        public NplaceCampaignTrafficRegisterEntity toEntity(NplaceCampaignTrafficShopEntity nplaceCampaignTrafficShop) {
//            return NplaceCampaignTrafficRegisterEntity.builder()
//                    .startDate(startDate)
//                    .endDate(endDate)
//                    .search(search)
//                    .url(url)
//                    .shopName(shopName)
//                    .goal(goal)
//                    .nplaceCampaignTrafficShopEntity(nplaceCampaignTrafficShop)
//                    .build();
//        }
    }

//    @Data
//    @Builder
//    @NoArgsConstructor
//    @AllArgsConstructor
//    public static class NplaceCampaignTrafficKeywordTraffic {
//        @NotNull(message = "keywordTraffic를 입력하세요.")
//        @Length(min = 2, message = "keywordTraffic는 2자 이상 입력해주세요.")
//        private String keywordTraffic;
//        @NotNull(message = "keywordId를 입력하세요.")
//        private Long keywordId;
//        @NotNull(message = "shopId를 입력하세요.")
//        private String shopId;
//
//        public NplaceCampaignTrafficKeywordTrafficEntity toEntity(NplaceCampaignTrafficKeywordEntity nplaceCampaignTrafficKeywordEntity) {
//            return NplaceCampaignTrafficKeywordTrafficEntity.builder()
//                    .keywordTraffic(keywordTraffic)
//                    .nplaceCampaignTrafficKeywordEntity(nplaceCampaignTrafficKeywordEntity)
//                    .build();
//        }
//    }
//
    public NplaceRewardShopKeywordRegisterEntity toNplaceRewardShopKeywordRegisterEntity(NplaceRewardShopKeywordEntity nplaceRewardShopKeywordEntity) {
        return NplaceRewardShopKeywordRegisterEntity.builder()
                .startDate(nplaceRewardShopKeywordRegister.startDate)
                .endDate(nplaceRewardShopKeywordRegister.endDate)
                .search(nplaceRewardShopKeywordRegister.search)
                .url(nplaceRewardShopKeywordRegister.url)
                .shopName(nplaceRewardShopKeywordRegister.shopName)
                .goal(nplaceRewardShopKeywordRegister.goal)
                .status(NplaceRewardShopKeywordRegisterStatus.REQUESTED)
                .nplaceRewardShopKeywordEntity(nplaceRewardShopKeywordEntity)
                .build();
    }
//
//    public NplaceCampaignTrafficKeywordTrafficEntity toNplaceCampaignTrafficKeywordTrafficEntity(NplaceCampaignTrafficKeywordEntity nplaceCampaignTrafficKeywordEntity, NplaceCampaignTrafficRegisterEntity nplaceCampaignTrafficRegisterEntity) {
//        return NplaceCampaignTrafficKeywordTrafficEntity.builder()
//                .keywordTraffic(nplaceCampaignTrafficKeywordTraffic.keywordTraffic)
//                .nplaceCampaignTrafficKeywordEntity(nplaceCampaignTrafficKeywordEntity)
//                .nplaceCampaignTrafficRegisterEntity(nplaceCampaignTrafficRegisterEntity)
//                .build();
//    }

}
