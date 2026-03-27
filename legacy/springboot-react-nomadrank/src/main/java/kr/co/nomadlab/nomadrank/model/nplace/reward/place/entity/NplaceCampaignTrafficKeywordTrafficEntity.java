package kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`NPLACE_CAMPAIGN_TRAFFIC_KEYWORD_TRAFFIC`")
@DynamicInsert
@DynamicUpdate
public class NplaceCampaignTrafficKeywordTrafficEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @Column(name = "keyword_traffic")
    private String keywordTraffic;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nplace_campaign_traffic_keyword_id", referencedColumnName = "id", updatable = false, nullable = false)
    private NplaceCampaignTrafficKeywordEntity nplaceCampaignTrafficKeywordEntity;

    @OneToOne
    @JoinColumn(name = "nplace_campaign_traffic_register_id", referencedColumnName = "id")
    private NplaceCampaignTrafficRegisterEntity nplaceCampaignTrafficRegisterEntity;
}
