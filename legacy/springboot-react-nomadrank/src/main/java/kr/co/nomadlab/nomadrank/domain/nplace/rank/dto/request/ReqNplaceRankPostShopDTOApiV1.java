package kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceRankPostShopDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceRankShop을 입력하세요.")
    private NplaceRankTrackInfo nplaceRankShop;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRankTrackInfo {
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
        @NotNull(message = "businessSector를 입력하세요.")
        private String businessSector;
        // @NotNull(message = "keywordList를 입력하세요.")
        private List<String> keywordList;

        public NplaceRankShopEntity toEntity(UserEntity userEntity) {
            return NplaceRankShopEntity.builder()
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
                    .businessSector(businessSector)
                    .nplaceRankShopTrackInfoEntityList(new ArrayList<>())
                    .build();
        }
    }
}
