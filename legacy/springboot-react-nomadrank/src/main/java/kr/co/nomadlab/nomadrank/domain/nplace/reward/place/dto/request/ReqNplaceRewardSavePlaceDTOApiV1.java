package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardProduct;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardPlaceEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceRewardSavePlaceDTOApiV1 {

    @Valid
    @NotNull(message = "place를 입력하세요.")
    private Place place;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Place {

        @NotNull(message = "nplaceRewardProduct는 필수입니다.")
        private NplaceRewardProduct nplaceRewardProduct;

        @NotNull(message = "price은 필수입니다.")
        private Integer price;

        @NotNull(message = "accountNumber은 필수입니다.")
        private String accountNumber;

        @NotNull(message = "deposit은 필수입니다.")
        private String deposit;

        @NotNull(message = "bankName은 필수입니다.")
        private String bankName;
    }


    public NplaceRewardPlaceEntity toPlaceEntity(UserEntity userEntity) {
        return NplaceRewardPlaceEntity.builder()
                .nplaceRewardProduct(place.nplaceRewardProduct)
                .price(place.price)
                .accountNumber(place.accountNumber)
                .deposit(place.deposit)
                .bankName(place.bankName)
                .userEntity(userEntity)
                .distributorEntity(userEntity.getDistributorEntity())
                .build();
    }
}
