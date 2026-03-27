package kr.co.nomadlab.nomadrank.model.product.repository;

import kr.co.nomadlab.nomadrank.domain.product.enums.ProductSort;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import kr.co.nomadlab.nomadrank.model.product.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<ProductEntity, Long> {

    Optional<ProductEntity> findByDistributorEntityAndProductSort(DistributorEntity distributorEntity, ProductSort productSort);

    List<ProductEntity> findByDistributorEntity(DistributorEntity distributorEntity);

    long deleteByDistributorEntity(DistributorEntity distributorEntity);
}
