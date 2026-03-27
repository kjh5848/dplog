package kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.response;

import kr.co.nomadlab.nomadrank.model.nplace.reward.blog_writers.entity.NplaceCampaignBlogWritersEntity;
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
public class ResNplaceCampaignBlogWritersGetBlogWritersDTOApiV1 {

    private List<NplaceCampaignBlogWriters> nplaceCampaignBlogWritersList;

    public static ResNplaceCampaignBlogWritersGetBlogWritersDTOApiV1 of(
            List<NplaceCampaignBlogWritersEntity> nplaceCampaignBlogWritersEntityList
    ) {
        return ResNplaceCampaignBlogWritersGetBlogWritersDTOApiV1.builder()
                .nplaceCampaignBlogWritersList(ResNplaceCampaignBlogWritersGetBlogWritersDTOApiV1.NplaceCampaignBlogWriters.fromEntityList(nplaceCampaignBlogWritersEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceCampaignBlogWriters {

        private String writersType;
        private String campaignName;
        private String startDate;
        private String endDate;
        private Integer dailyOpenCount;
        private Long totalOpenCount;

        public static List<NplaceCampaignBlogWriters> fromEntityList(
                List<NplaceCampaignBlogWritersEntity> nplaceCampaignBlogWritersEntityList
        ) {
            return nplaceCampaignBlogWritersEntityList.stream()
                    .map(NplaceCampaignBlogWriters::fromEntity)
                    .toList();
        }

        public static NplaceCampaignBlogWriters fromEntity(
                NplaceCampaignBlogWritersEntity nplaceCampaignBlogWritersEntity
        ) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            LocalDate start = LocalDate.parse(nplaceCampaignBlogWritersEntity.getNplaceCampaignBlogWritersRecruitEntity().getStartDate(), formatter);
            LocalDate end = LocalDate.parse(nplaceCampaignBlogWritersEntity.getNplaceCampaignBlogWritersRecruitEntity().getEndDate(), formatter);

            return NplaceCampaignBlogWriters.builder()
                    .writersType(nplaceCampaignBlogWritersEntity.getWritersType().getValue())
                    .campaignName(nplaceCampaignBlogWritersEntity.getCampaignName())
                    .startDate(nplaceCampaignBlogWritersEntity.getNplaceCampaignBlogWritersRecruitEntity().getStartDate())
                    .endDate(nplaceCampaignBlogWritersEntity.getNplaceCampaignBlogWritersRecruitEntity().getEndDate())
                    .dailyOpenCount(nplaceCampaignBlogWritersEntity.getNplaceCampaignBlogWritersRecruitEntity().getDailyOpenCount())
                    .totalOpenCount((ChronoUnit.DAYS.between(start, end) + 1) * nplaceCampaignBlogWritersEntity.getNplaceCampaignBlogWritersRecruitEntity().getDailyOpenCount())
                    .build();
        }

    }

}
