package kr.co.nomadlab.scrap.model.db.nplace.rank.entity;

import com.fasterxml.jackson.databind.JsonNode;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "NPLACE_RANK_SEARCH_SHOP")
@DynamicInsert
@DynamicUpdate
public class NplaceRankSearchShopEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nplace_rank_search_shop_info_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NplaceRankSearchShopInfoEntity nplaceRankSearchShopInfoEntity;

    @Type(JsonType.class)
    @Column(name = "json", nullable = false, columnDefinition = "longtext")
    private JsonNode json;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

}
