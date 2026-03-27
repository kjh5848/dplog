package kr.co.nomadlab.nomadrank.domain.product.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.product.enums.ProductSort;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import kr.co.nomadlab.nomadrank.model.product.entity.ProductEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqProductPriceUpdateDTOApiV1 {

    @Valid
    @NotNull(message = "product를 입력하세요.")
    private List<Product> product;

    @Valid
    @NotNull(message = "관리자를 입력하세요.")
    private Distributor distributor;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Product {
        @NotNull(message = "productSort를 입력하세요.")
        private ProductSort productSort;
        private Integer quantity;
        @NotNull(message = "price를 입력하세요.")
        private Integer price;

        public ProductEntity toProductEntity(DistributorEntity distributorEntity) {
            return ProductEntity.builder()
                    .distributorEntity(distributorEntity)
                    .price(price)
                    .quantity(quantity)
                    .productSort(productSort)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Distributor {
        @NotNull(message = "관리자ID를 입력하세요.")
        private Long id;
    }

    public List<ProductEntity> toProductEntityList(DistributorEntity distributorEntity) {
        return product.stream()
                .map(product -> product.toProductEntity(distributorEntity))
                .toList();
    }

//    public DistributorEntity toDistributorEntity(ReqProductPriceUpdateDTOApiV1 reqDto) {
//        return DistributorEntity.builder()
//                .email(reqDto.distributor.email)
//                .deposit(reqDto.distributor.deposit)
//                .accountNumber(reqDto.distributor.accountNumber)
//                .bankName(reqDto.distributor.bankName)
//                .memo(reqDto.distributor.memo)
//                .build();
//    }
//
//    public UserEntity toUserEntity(ReqProductPriceUpdateDTOApiV1 reqDto, DistributorEntity distributorEntity) {
//        return UserEntity.builder()
//                .distributorEntity(distributorEntity)
//                .companyName(reqDto.distributor.companyName)
//                .username(reqDto.distributor.userName)
//                .password(reqDto.distributor.password)
//                .tel(reqDto.distributor.tel)
//                .status(UserStatus.COMPLETION)
//                .authority(List.of(UserAuthoritySort.DISTRIBUTOR_MANAGER))
//                .expireDate(LocalDateTime.of(9999, 12, 31, 0, 0, 0))
//                .build();
//    }
}
