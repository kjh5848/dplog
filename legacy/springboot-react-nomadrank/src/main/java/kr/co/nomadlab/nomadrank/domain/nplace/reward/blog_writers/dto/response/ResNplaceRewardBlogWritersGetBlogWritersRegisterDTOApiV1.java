package kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.response;

import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceRewardBlogWritersRegisterEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceRewardBlogWritersGetBlogWritersRegisterDTOApiV1 {

    private List<NplaceRewardBlogWritersRegister> nplaceRewardBlogWritersRegisterList;

    public static ResNplaceRewardBlogWritersGetBlogWritersRegisterDTOApiV1 of(
            List<NplaceRewardBlogWritersRegisterEntity> nplaceRewardBlogWritersRegisterEntityList
    ) {
        return ResNplaceRewardBlogWritersGetBlogWritersRegisterDTOApiV1.builder()
                .nplaceRewardBlogWritersRegisterList(ResNplaceRewardBlogWritersGetBlogWritersRegisterDTOApiV1.NplaceRewardBlogWritersRegister.fromEntityList(nplaceRewardBlogWritersRegisterEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRewardBlogWritersRegister {

        private String writersType;
        private String campaignName;
        private String startDate;
        private String endDate;
        private Integer dailyOpenCount;
        private Long totalOpenCount;

        public static List<NplaceRewardBlogWritersRegister> fromEntityList(
                List<NplaceRewardBlogWritersRegisterEntity> nplaceCampaignBlogWritersEntityList
        ) {
            return nplaceCampaignBlogWritersEntityList.stream()
                    .map(NplaceRewardBlogWritersRegister::fromEntity)
                    .toList();
        }

        public static NplaceRewardBlogWritersRegister fromEntity(
                NplaceRewardBlogWritersRegisterEntity nplaceRewardBlogWritersRegisterEntity
        ) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate start = LocalDate.parse(nplaceRewardBlogWritersRegisterEntity.getStartDate(), formatter);
            LocalDate end = LocalDate.parse(nplaceRewardBlogWritersRegisterEntity.getEndDate(), formatter);

            return NplaceRewardBlogWritersRegister.builder()
                    .writersType(nplaceRewardBlogWritersRegisterEntity.getWritersType().getValue())
                    .campaignName(nplaceRewardBlogWritersRegisterEntity.getCampaignName())
                    .startDate(nplaceRewardBlogWritersRegisterEntity.getStartDate())
                    .endDate(nplaceRewardBlogWritersRegisterEntity.getEndDate())
                    .dailyOpenCount(nplaceRewardBlogWritersRegisterEntity.getDailyOpenCount())
                    .totalOpenCount((ChronoUnit.DAYS.between(start, end) + 1) * nplaceRewardBlogWritersRegisterEntity.getDailyOpenCount())
                    .build();
        }

    }

}
