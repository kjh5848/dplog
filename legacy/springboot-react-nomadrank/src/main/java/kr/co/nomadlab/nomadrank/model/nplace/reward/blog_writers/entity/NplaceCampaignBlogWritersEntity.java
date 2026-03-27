package kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity;

import jakarta.persistence.*;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.enums.NplaceRewardBlogWritersType;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceCampaignBlogWritersCoType;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceCampaignBlogWritersPostingType;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
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
@Table(name = "`NPLACE_CAMPAIGN_BLOG_WRITERS`")
@DynamicInsert
@DynamicUpdate
public class NplaceCampaignBlogWritersEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private UserEntity userEntity;

    @Column(name = "blog_writers")
    @Enumerated(EnumType.STRING)
    private NplaceRewardBlogWritersType writersType;

    @Column(name = "campaign_name")
    private String campaignName;

    @Column(name = "place_address")
    private String placeAddress;

    @Column(name = "contact_info")
    private String contactInfo;

    @Column(name = "link_url")
    private String linkUrl;

    @Column(name = "main_keyword")
    private String mainKeyword;

    @Column(name = "hashtags")
    private String hashtags;

    @Column(name = "description", length = 4000)
    private String description;

    @Column(name = "co_type")
    @Enumerated(EnumType.STRING)
    private NplaceCampaignBlogWritersCoType coType;

    @Column(name = "posting_type")
    @Enumerated(EnumType.STRING)
    private NplaceCampaignBlogWritersPostingType postingType;

    @Column(name = "mosaic_choice")
    private String mosaicChoice;

    @Column(name = "public_text")
    private String publicText;

    @Column(name = "map_attach")
    private String mapAttach;

    @Column(name = "duplicate")
    private String duplicate;

    @Column(name = "extra_details")
    private String extraDetails;

    @OneToOne
    @JoinColumn(name = "nplace_campaign_blog_writers_recruit_id", referencedColumnName = "id")
    private NplaceCampaignBlogWritersRecruitEntity nplaceCampaignBlogWritersRecruitEntity;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;
}
