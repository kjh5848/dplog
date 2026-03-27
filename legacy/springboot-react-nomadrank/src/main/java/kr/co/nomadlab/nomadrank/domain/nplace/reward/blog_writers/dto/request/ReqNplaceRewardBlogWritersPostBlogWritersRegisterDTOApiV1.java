package kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.enums.NplaceRewardBlogWritersType;
import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceRewardBlogWritersRegisterEntity;
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
public class ReqNplaceRewardBlogWritersPostBlogWritersRegisterDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceRewardBlogWritersRegister를 입력하세요.")
    private NplaceRewardBlogWritersRegister nplaceRewardBlogWritersRegister;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRewardBlogWritersRegister {
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

        @NotNull(message = "startDate를 입력하세요.")
        private String startDate;

        @NotNull(message = "endDate를 입력하세요.")
        private String endDate;

        @NotNull(message = "dailyOpenCount를 입력하세요.")
        private Integer dailyOpenCount;

        @NotNull(message = "imageUrl를 입력하세요.")
        private String imageUrl;
    }

    public NplaceRewardBlogWritersRegisterEntity toNplaceRewardBlogWritersRegisterEntity(UserEntity userEntity) {
        return NplaceRewardBlogWritersRegisterEntity.builder()
                .userEntity(userEntity)
                .writersType(nplaceRewardBlogWritersRegister.writersType)
                .campaignName(nplaceRewardBlogWritersRegister.campaignName)
                .placeAddress(nplaceRewardBlogWritersRegister.placeAddress)
                .contactInfo(nplaceRewardBlogWritersRegister.contactInfo)
                .linkUrl(nplaceRewardBlogWritersRegister.linkUrl)
                .mainKeyword(String.join(",", nplaceRewardBlogWritersRegister.mainKeyword))
                .hashtags(String.join(",", nplaceRewardBlogWritersRegister.hashtags))
                .description(nplaceRewardBlogWritersRegister.description)
                .startDate(nplaceRewardBlogWritersRegister.startDate)
                .endDate(nplaceRewardBlogWritersRegister.endDate)
                .dailyOpenCount(nplaceRewardBlogWritersRegister.dailyOpenCount)
                .imageUrl(nplaceRewardBlogWritersRegister.imageUrl)
                .build();
    }

}
