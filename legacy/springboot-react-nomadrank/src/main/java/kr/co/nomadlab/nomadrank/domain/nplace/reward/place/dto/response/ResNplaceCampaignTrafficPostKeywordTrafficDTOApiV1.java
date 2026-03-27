package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.response;

import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficKeywordTrafficEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResNplaceCampaignTrafficPostKeywordTrafficDTOApiV1 {

    private List<NplaceCampaignTrafficKeywordTraffic> nplaceCampaignTrafficKeywordTrafficList;

    public static ResNplaceCampaignTrafficPostKeywordTrafficDTOApiV1 of(
            List<NplaceCampaignTrafficKeywordTrafficEntity> nplaceCampaignTrafficKeywordTrafficEntityList
    ) {
        return ResNplaceCampaignTrafficPostKeywordTrafficDTOApiV1.builder()
                .nplaceCampaignTrafficKeywordTrafficList(ResNplaceCampaignTrafficPostKeywordTrafficDTOApiV1.NplaceCampaignTrafficKeywordTraffic.fromEntityList(nplaceCampaignTrafficKeywordTrafficEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceCampaignTrafficKeywordTraffic {

        private String keywordTraffic;
        private LocalDateTime createDate;

        public static List<NplaceCampaignTrafficKeywordTraffic> fromEntityList(
                List<NplaceCampaignTrafficKeywordTrafficEntity> nplaceCampaignTrafficKeywordTrafficEntityList
        ) {
            return nplaceCampaignTrafficKeywordTrafficEntityList.stream()
                    .map(NplaceCampaignTrafficKeywordTraffic::fromEntity)
                    .toList();
        }

        public static NplaceCampaignTrafficKeywordTraffic fromEntity(
                NplaceCampaignTrafficKeywordTrafficEntity nplaceCampaignTrafficKeywordTrafficEntity
        ) {
            return NplaceCampaignTrafficKeywordTraffic.builder()
                    .keywordTraffic(nplaceCampaignTrafficKeywordTrafficEntity.getKeywordTraffic())
                    .createDate(nplaceCampaignTrafficKeywordTrafficEntity.getCreateDate())
                    .build();
        }

    }

}
