package kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity;

import jakarta.persistence.*;
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
@Table(name = "`NPLACE_CAMPAIGN_BLOG_WRITERS_RECRUIT`")
@DynamicInsert
@DynamicUpdate
public class NplaceCampaignBlogWritersRecruitEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private UserEntity userEntity;

    @Column(name = "start_date")
    private String startDate;

    @Column(name = "end_date")
    private String endDate;

    @Column(name = "registration_deadline_days")
    private Integer registrationDeadlineDays;

    @Column(name = "daily_open_count")
    private Integer dailyOpenCount;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "create_date", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createDate;

    @Column(name = "update_date")
    @UpdateTimestamp
    private LocalDateTime updateDate;
}
