package kr.co.nomadlab.scrap.model.db.nplace.rank.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "NPLACE_RANK_SEARCH_SHOP_INFO", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"province", "keyword"})
})
@DynamicInsert
@DynamicUpdate
public class NplaceRankSearchShopInfoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "keyword", nullable = false)
    private String keyword;

    @Column(name = "province", nullable = false)
    private String province;

    @Column(name = "business_sector")
    private String businessSector;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @OneToMany(mappedBy = "nplaceRankSearchShopInfoEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<NplaceRankSearchShopEntity> nplaceRankSearchShopEntityList;

}
