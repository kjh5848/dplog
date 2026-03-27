package kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.enums.NplaceRewardBlogWritersType;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceCampaignBlogWritersEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceCampaignBlogWritersRecruitEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceCampaignBlogWritersPostBlogWritersDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceCampaignBlogWriters를 입력하세요.")
    private NplaceCampaignBlogWriters nplaceCampaignBlogWriters;

    @Valid
    @NotNull(message = "nplaceCampaignBlogWritersRecruit를 입력하세요.")
    private NplaceCampaignBlogWritersRecruit nplaceCampaignBlogWritersRecruit;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceCampaignBlogWriters {
        @NotNull(message = "writersType을 입력하세요.")
        private NplaceRewardBlogWritersType writersType;
        
        @NotNull(message = "campaignName을 입력하세요.")
        private String campaignName;

        @NotNull(message = "placeAddress를 입력하세요.")
        private String placeAddress;

        @NotNull(message = "contactInfo를 입력하세요.")
        private String contactInfo;

        @NotNull(message = "linkUrl을 입력하세요.")
        private String linkUrl;

        @NotNull(message = "mainKeyword를 입력하세요.")
        private List<String> mainKeyword;

        @NotNull(message = "hashtags를 입력하세요.")
        private List<String> hashtags;

        @NotNull(message = "description을 입력하세요.")
        private String description;

//        @NotNull(message = "coType을 입력하세요.")
//        private NplaceCampaignBlogWritersCoType coType;
//
//        @NotNull(message = "postingType을 입력하세요.")
//        private NplaceCampaignBlogWritersPostingType postingType;
//
//        @NotNull(message = "mosaicChoice를 입력하세요.")
//        private String mosaicChoice;
//
//        @NotNull(message = "publicText를 입력하세요.")
//        private String publicText;
//
//        @NotNull(message = "mapAttach를 입력하세요.")
//        private String mapAttach;
//
//        @NotNull(message = "duplicate을 입력하세요.")
//        private String duplicate;
//
//        @NotNull(message = "extraDetails을 입력하세요.")
//        private String extraDetails;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceCampaignBlogWritersRecruit {
        @NotNull(message = "startDate를 입력하세요.")
        private String startDate;

        @NotNull(message = "endDate를 입력하세요.")
        private String endDate;

//        @NotNull(message = "registrationDeadlineDays를 입력하세요.")
//        private Integer registrationDeadlineDays;

        @NotNull(message = "dailyOpenCount를 입력하세요.")
        private Integer dailyOpenCount;

        @NotNull(message = "imageUrl를 입력하세요.")
        private String imageUrl;
    }

    public NplaceCampaignBlogWritersEntity toNplaceCampaignBlogWritersEntity(UserEntity userEntity, NplaceCampaignBlogWritersRecruitEntity nplaceCampaignBlogWritersRecruitEntity) {
        return NplaceCampaignBlogWritersEntity.builder()
                .userEntity(userEntity)
                .nplaceCampaignBlogWritersRecruitEntity(nplaceCampaignBlogWritersRecruitEntity)
                .writersType(nplaceCampaignBlogWriters.writersType)
                .campaignName(nplaceCampaignBlogWriters.campaignName)
                .placeAddress(nplaceCampaignBlogWriters.placeAddress)
                .contactInfo(nplaceCampaignBlogWriters.contactInfo)
                .linkUrl(nplaceCampaignBlogWriters.linkUrl)
                .mainKeyword(String.join(",", nplaceCampaignBlogWriters.mainKeyword))
                .hashtags(String.join(",", nplaceCampaignBlogWriters.hashtags))
                .description(nplaceCampaignBlogWriters.description)
//                .coType(nplaceCampaignBlogWriters.coType)
//                .postingType(nplaceCampaignBlogWriters.postingType)
//                .mosaicChoice(nplaceCampaignBlogWriters.mosaicChoice)
//                .publicText(nplaceCampaignBlogWriters.publicText)
//                .mapAttach(nplaceCampaignBlogWriters.mapAttach)
//                .duplicate(nplaceCampaignBlogWriters.duplicate)
//                .extraDetails(nplaceCampaignBlogWriters.extraDetails)
                .build();
    }

    public NplaceCampaignBlogWritersRecruitEntity toNplaceCampaignBlogWritersRecruitEntity(UserEntity userEntity) {
        return NplaceCampaignBlogWritersRecruitEntity.builder()
                .userEntity(userEntity)
                .startDate(nplaceCampaignBlogWritersRecruit.startDate)
                .endDate(nplaceCampaignBlogWritersRecruit.endDate)
//                .registrationDeadlineDays(nplaceCampaignBlogWritersRecruit.registrationDeadlineDays)
                .dailyOpenCount(nplaceCampaignBlogWritersRecruit.dailyOpenCount)
                .imageUrl(nplaceCampaignBlogWritersRecruit.imageUrl)
                .build();
    }
}
