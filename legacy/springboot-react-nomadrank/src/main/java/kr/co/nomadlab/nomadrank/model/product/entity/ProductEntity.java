package kr.co.nomadlab.nomadrank.model.product.entity;


import jakarta.persistence.*;
import jakarta.persistence.Table;
import kr.co.nomadlab.nomadrank.domain.product.enums.ProductSort;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import lombok.*;
import org.hibernate.annotations.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`PRODUCT`")
@DynamicInsert
@DynamicUpdate
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "distributor_id", referencedColumnName = "id")
    private DistributorEntity distributorEntity;

    @Comment("서비스가격")
    private Integer price;

    @Comment("수량")
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Comment("서비스 종류")
    @Column(name = "product_sort")
    private ProductSort productSort;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @Column(name = "delete_date")
    private LocalDateTime deleteDate;
}
