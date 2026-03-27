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
public class ResNplaceRewardGetPlaceListDTOApiV1 {

    List<Place> placeList;

    public static ResNplaceRewardGetPlaceListDTOApiV1 of(List<NplaceRewardPlaceEntity> nplaceRewardPlaceEntityList) {
        return ResNplaceRewardGetPlaceListDTOApiV1.builder()
                .placeList(ResNplaceRewardGetPlaceListDTOApiV1.Place.fromPlaceEntityList(nplaceRewardPlaceEntityList))
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

        public static List<Place> fromPlaceEntityList(List<NplaceRewardPlaceEntity> nplaceRewardPlaceEntityList) {
            return nplaceRewardPlaceEntityList.stream()
                    .map(Place::fromPlaceEntity)
                    .toList();
        }

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
