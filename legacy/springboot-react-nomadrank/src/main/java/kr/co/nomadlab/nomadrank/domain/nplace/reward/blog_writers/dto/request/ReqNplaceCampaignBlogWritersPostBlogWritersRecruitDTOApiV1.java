package kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceCampaignBlogWritersRecruitEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceCampaignBlogWritersPostBlogWritersRecruitDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceCampaignBlogWritersRecruit를 입력하세요.")
    private NplaceCampaignBlogWritersRecruit nplaceCampaignBlogWritersRecruit;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceCampaignBlogWritersRecruit {
        @NotNull(message = "startDate를 입력하세요.")
        private String startDate;

        @NotNull(message = "endDate를 입력하세요.")
        private String endDate;

        @NotNull(message = "registrationDeadlineDays를 입력하세요.")
        private Integer registrationDeadlineDays;

        @NotNull(message = "dailyOpenCount를 입력하세요.")
        private Integer dailyOpenCount;

        @NotNull(message = "imageUrl를 입력하세요.")
        private String imageUrl;
    }

    public NplaceCampaignBlogWritersRecruitEntity toEntity(UserEntity userEntity) {
        return NplaceCampaignBlogWritersRecruitEntity.builder()
                .userEntity(userEntity)
                .startDate(nplaceCampaignBlogWritersRecruit.startDate)
                .endDate(nplaceCampaignBlogWritersRecruit.endDate)
                .registrationDeadlineDays(nplaceCampaignBlogWritersRecruit.registrationDeadlineDays)
                .dailyOpenCount(nplaceCampaignBlogWritersRecruit.dailyOpenCount)
                .imageUrl(nplaceCampaignBlogWritersRecruit.imageUrl)
                .build();
    }
}
