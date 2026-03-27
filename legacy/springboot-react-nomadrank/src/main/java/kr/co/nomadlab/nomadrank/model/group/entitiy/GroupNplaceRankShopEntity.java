package kr.co.nomadlab.nomadrank.model.group.entitiy;

import jakarta.persistence.*;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopEntity;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`GROUP_NPLACE_RANK_SHOP`")
@DynamicInsert
@DynamicUpdate
public class GroupNplaceRankShopEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", referencedColumnName = "id")
    private GroupEntity groupEntity;

    @ManyToOne
    @JoinColumn(name = "nplace_rank_shop_id", referencedColumnName = "id")
    private NplaceRankShopEntity nplaceRankShopEntity;

}
