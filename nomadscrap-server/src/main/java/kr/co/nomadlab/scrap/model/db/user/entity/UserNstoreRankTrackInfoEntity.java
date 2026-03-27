package kr.co.nomadlab.scrap.model.db.user.entity;

import jakarta.persistence.*;
import kr.co.nomadlab.scrap.model.db.nstore.rank.entity.NstoreRankTrackInfoEntity;
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
@Table(name = "USER_NSTORE_RANK_TRACK_INFO",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "user_id",
                                "nstore_rank_track_info_id"
                        }
                )
        }
)
@DynamicInsert
@DynamicUpdate
public class UserNstoreRankTrackInfoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", updatable = false, nullable = false)
    private UserEntity userEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nstore_rank_track_info_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NstoreRankTrackInfoEntity nstoreRankTrackInfoEntity;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

}
