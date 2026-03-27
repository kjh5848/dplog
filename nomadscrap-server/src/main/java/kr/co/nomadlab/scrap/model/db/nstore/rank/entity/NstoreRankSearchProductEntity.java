package kr.co.nomadlab.scrap.model.db.nstore.rank.entity;

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
@Table(name = "NSTORE_RANK_SEARCH_PRODUCT")
@DynamicInsert
@DynamicUpdate
public class NstoreRankSearchProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nstore_rank_search_product_info_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NstoreRankSearchProductInfoEntity nstoreRankSearchProductInfoEntity;

    @Type(JsonType.class)
    @Column(name = "json", nullable = false, columnDefinition = "longtext")
    private JsonNode json;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

}
