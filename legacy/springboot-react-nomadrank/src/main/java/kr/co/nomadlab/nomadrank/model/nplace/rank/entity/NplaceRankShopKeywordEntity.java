package kr.co.nomadlab.nomadrank.model.nplace.rank.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "NPLACE_RANK_KEYWORD")
@DynamicInsert
@DynamicUpdate
public class NplaceRankShopKeywordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "keyword", updatable = false, nullable = false)
    private String keyword;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nplace_rank_shop_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NplaceRankShopEntity nplaceRankShopEntity;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;
}
