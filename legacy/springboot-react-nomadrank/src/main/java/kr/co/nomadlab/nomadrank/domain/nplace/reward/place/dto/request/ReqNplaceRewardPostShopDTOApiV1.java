package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardProduct;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardShopEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardShopKeywordEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import java.util.ArrayList;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceRewardPostShopDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceRewardShop 입력하세요.")
    private NplaceRewardShop nplaceRewardShop;

    @Valid
    @NotNull(message = "nplaceCampaignTrafficKeyword를 입력하세요.")
    private NplaceRewardShopKeyword nplaceRewardShopKeyword;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRewardShop {
        @NotNull(message = "shopId를 입력하세요.")
        private String shopId;
        @NotNull(message = "shopName를 입력하세요.")
        private String shopName;
        @NotNull(message = "shopImageUrl를 입력하세요.")
        private String shopImageUrl;
        @NotNull(message = "category를 입력하세요.")
        private String category;
        @NotNull(message = "address를 입력하세요.")
        private String address;
        @NotNull(message = "roadAddress를 입력하세요.")
        private String roadAddress;
        @NotNull(message = "visitorReviewCount를 입력하세요.")
        private String visitorReviewCount;
        @NotNull(message = "blogReviewCount를 입력하세요.")
        private String blogReviewCount;
        @NotNull(message = "scoreInfo를 입력하세요.")
        private String scoreInfo;
        @NotNull(message = "nplaceRewardProduct 입력하세요.")
        private NplaceRewardProduct nplaceRewardProduct;

        public NplaceRewardShopEntity toEntity(UserEntity userEntity) {
            return NplaceRewardShopEntity.builder()
                    .userEntity(userEntity)
                    .shopId(shopId)
                    .shopName(shopName)
                    .shopImageUrl(shopImageUrl)
                    .category(category)
                    .address(address)
                    .roadAddress(roadAddress)
                    .visitorReviewCount(visitorReviewCount)
                    .blogReviewCount(blogReviewCount)
                    .scoreInfo(scoreInfo)
                    .nplaceRewardProduct(nplaceRewardProduct)
                    .nplaceRewardShopKeywordEntityList(new ArrayList<>())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRewardShopKeyword {
        @NotNull(message = "keyword를 입력하세요.")
        @Length(min = 2, message = "keyword는 2자 이상 입력해주세요.")
        private String keyword;

        public NplaceRewardShopKeywordEntity toEntity(NplaceRewardShopEntity nplaceRewardShopEntity) {
            return NplaceRewardShopKeywordEntity.builder()
                    .keyword(keyword)
                    .nplaceRewardShopEntity(nplaceRewardShopEntity)
                    .nplaceRewardShopKeywordRegisterEntityList(new ArrayList<>())
                    .build();
        }
    }
}
