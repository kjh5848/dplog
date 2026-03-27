package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.response;

import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceRewardPlaceEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRewardGetPlaceDTOApiV1 {

    Place place;

    public static ResNplaceRewardGetPlaceDTOApiV1 of(NplaceRewardPlaceEntity nplaceRewardPlaceEntity) {
        return ResNplaceRewardGetPlaceDTOApiV1.builder()
                .place(ResNplaceRewardGetPlaceDTOApiV1.Place.fromPlaceEntity(nplaceRewardPlaceEntity))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Place {
        private Long id;
        private String nplaceRewardProduct;
        private String nplaceRewardProductValue;
        private Integer price;
        private String accountNumber;
        private String deposit;
        private String bankName;

        public static Place fromPlaceEntity(NplaceRewardPlaceEntity nplaceRewardPlaceEntity) {
            return Place.builder()
                    .id(nplaceRewardPlaceEntity.getId())
                    .nplaceRewardProduct(nplaceRewardPlaceEntity.getNplaceRewardProduct().name())
                    .nplaceRewardProductValue(nplaceRewardPlaceEntity.getNplaceRewardProduct().getValue())
                    .price(nplaceRewardPlaceEntity.getPrice())
                    .accountNumber(nplaceRewardPlaceEntity.getAccountNumber())
                    .deposit(nplaceRewardPlaceEntity.getDeposit())
                    .bankName(nplaceRewardPlaceEntity.getBankName())
                    .build();
        }
    }
}
