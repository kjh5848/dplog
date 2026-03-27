package kr.co.nomadlab.nomadrank.domain.nstore.rank.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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
public class ReqNstoreRankPostProductDTOApiV1 {

    @Valid
    @NotNull(message = "nstoreRankProduct를 입력하세요.")
    private NstoreRankProduct nstoreRankProduct;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NstoreRankProduct {
        private String mid;
        private String productId;
        @NotNull(message = "productName를 입력하세요.")
        private String productName;
        @NotNull(message = "productImageUrl를 입력하세요.")
        private String productImageUrl;
        @NotNull(message = "category를 입력하세요.")
        private String category;
        @NotNull(message = "price를 입력하세요.")
        private String price;
        @NotNull(message = "mallName를 입력하세요.")
        private String mallName;
        @NotNull(message = "reviewCount를 입력하세요.")
        private String reviewCount;
        @NotNull(message = "scoreInfo를 입력하세요.")
        private String scoreInfo;
        @NotNull(message = "isCatalog를 입력하세요.")
        private Boolean isCatalog;

        public NstoreRankProductEntity toEntity(UserEntity userEntity) {
            return NstoreRankProductEntity.builder()
                    .userEntity(userEntity)
                    .mid(mid)
                    .productId(productId)
                    .productName(productName)
                    .productImageUrl(productImageUrl)
                    .category(category)
                    .price(price)
                    .mallName(mallName)
                    .reviewCount(reviewCount)
                    .scoreInfo(scoreInfo)
                    .isCatalog(isCatalog)
                    .nstoreRankProductTrackInfoEntityList(new ArrayList<>())
                    .build();
        }
    }
}
