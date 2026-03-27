package kr.co.nomadlab.nomadrank.model.nstore.rank.entity;

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
@Table(name = "NSTORE_RANK_PRODUCT_TRACK_INFO")
@DynamicInsert
@DynamicUpdate
public class NstoreRankProductTrackInfoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nstore_rank_product_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NstoreRankProductEntity nstoreRankProductEntity;

    @Column(name = "nomadscrap_nstore_rank_track_info_id", updatable = false, nullable = false)
    private Long nomadscrapNstoreRankTrackInfoId;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

}