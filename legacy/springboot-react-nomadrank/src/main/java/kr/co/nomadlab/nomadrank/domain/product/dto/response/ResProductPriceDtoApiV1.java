package kr.co.nomadlab.nomadrank.domain.product.dto.response;

import kr.co.nomadlab.nomadrank.domain.product.enums.ProductSort;
import kr.co.nomadlab.nomadrank.model.product.entity.ProductEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResProductPriceDtoApiV1 {

    private List<Product> product;

    public static ResProductPriceDtoApiV1 of(List<ProductEntity> productEntityList) {
        return ResProductPriceDtoApiV1.builder()
                .product(Product.fromProductEntityList(productEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Product {
        private String name;
        private String productSort;
        private Integer quantity;
        private Integer price;

        public static List<Product> fromProductEntityList(List<ProductEntity> productEntityList) {
            return Arrays.stream(ProductSort.values())
                    .flatMap(sort -> productEntityList.stream()
                            .filter(productEntity -> productEntity.getProductSort().equals(sort))
                            .sorted(Comparator.comparing(ProductEntity::getQuantity, Comparator.nullsLast(Comparator.naturalOrder())))
                            .map(productEntity -> Product.builder()
                                    .name(productEntity.getProductSort().getValue())
                                    .productSort(productEntity.getProductSort().name())
                                    .quantity(productEntity.getQuantity())
                                    .price(productEntity.getPrice())
                                    .build()))
                    .toList();
        }
    }
}

