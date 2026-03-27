package kr.co.nomadlab.nomadrank.model.nplace.rank.entity;

import jakarta.persistence.*;
import kr.co.nomadlab.nomadrank.model.point.entity.PointChargeEntity;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "NPLACE_RANK_SHOP_TRACK_INFO_POINT_HISTORY")
@DynamicInsert
@DynamicUpdate
public class NplaceRankShopTrackInfoPointHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nplace_rank_shop_track_info_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NplaceRankShopTrackInfoEntity nplaceRankShopTrackInfoEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "point_charge_id", referencedColumnName = "id", updatable = false, nullable = false)
    private PointChargeEntity pointChargeEntity;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

}
