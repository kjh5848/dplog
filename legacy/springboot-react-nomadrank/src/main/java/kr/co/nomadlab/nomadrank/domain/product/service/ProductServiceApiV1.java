package kr.co.nomadlab.nomadrank.domain.product.service;

import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.product.dto.request.ReqProductPriceUpdateDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.product.dto.response.ResProductPriceDtoApiV1;
import kr.co.nomadlab.nomadrank.domain.product.enums.ProductSort;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import kr.co.nomadlab.nomadrank.model.distributor.repository.DistributorRepository;
import kr.co.nomadlab.nomadrank.model.product.entity.ProductEntity;
import kr.co.nomadlab.nomadrank.model.product.repository.ProductRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceApiV1 {

    private final ProductRepository productRepository;
    private final DistributorRepository distributorRepository;
    private final UserRepository userRepository;

    @Transactional
    public HttpEntity<?> updatePrice(ReqProductPriceUpdateDTOApiV1 reqDto) {
        DistributorEntity distributorEntity = distributorRepository.findById(reqDto.getDistributor().getId())
                .orElseThrow(() -> new BadRequestException("관리자가 존재하지 않습니다."));

//        ProductEntity nplaceCampaignTrafficEntity = productRepository.findByDistributorEntityAndProductSort(distributorEntity, ProductSort.NPLACE_CAMPAIGN_TRAFFIC)
//                .orElse(ProductEntity.builder()
//                        .distributorEntity(distributorEntity)
//                        .price(request.getProduct().getNplaceCampaignTrafficPoint())
//                        .productSort(ProductSort.NPLACE_CAMPAIGN_TRAFFIC)
//                        .build()
//                );
//
//        nplaceCampaignTrafficEntity.setPrice(request.getProduct().getNplaceCampaignTrafficPoint());

        productRepository.deleteByDistributorEntity(distributorEntity);
        productRepository.saveAll(reqDto.toProductEntityList(distributorEntity));

//        productRepository.save(nplaceCampaignTrafficEntity);

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .build(),
                HttpStatus.OK
        );

    }

    public HttpEntity<?> getProduct(Long userId) {

        UserEntity userEntity = userRepository.findById(userId).orElseThrow(() -> new BadRequestException("관리자가 존재하지 않습니다."));
        List<ProductEntity> productEntityList = productRepository.findByDistributorEntity(userEntity.getDistributorEntity());

        List<ProductSort> productSortList = productEntityList.stream().map(ProductEntity::getProductSort).toList();

        for (ProductSort productSort : ProductSort.values()) {
            if (!productSortList.contains(productSort)) {
                ProductEntity productEntity = ProductEntity.builder()
                        .productSort(productSort)
                        .distributorEntity(userEntity.getDistributorEntity())
                        .price(0)
                        .build();

                productEntityList.add(productEntity);
            }
        }

        return new ResponseEntity<>(
                ResDTO.builder()
                        .code(0)
                        .message("success")
                        .data(ResProductPriceDtoApiV1.of(productEntityList))
                        .build(),
                HttpStatus.OK
        );
    }
}
