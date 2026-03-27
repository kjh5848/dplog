package kr.co.nomadlab.nomadrank.model.nplace.rank.entity;

import jakarta.persistence.*;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.enums.NplaceRankShopTrackInfoStatus;
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
@Table(name = "NPLACE_RANK_SHOP_TRACK_INFO")
@DynamicInsert
@DynamicUpdate
public class NplaceRankShopTrackInfoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nplace_rank_shop_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NplaceRankShopEntity nplaceRankShopEntity;

    @Column(name = "nomadscrap_nplace_rank_track_info_id", nullable = false)
    private Long nomadscrapNplaceRankTrackInfoId;

    @Enumerated(EnumType.STRING)
    @Column(name = "nplace_rank_shop_track_info_status", nullable = false)
    private NplaceRankShopTrackInfoStatus nplaceRankShopTrackInfoStatus;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

}
