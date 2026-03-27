package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficKeywordEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficKeywordTrafficEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceCampaignTrafficSearchKeywordTrafficDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceCampaignTrafficShop 입력하세요.")
    private NplaceCampaignTrafficKeywordTraffic nplaceCampaignTrafficKeywordTraffic;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceCampaignTrafficKeywordTraffic {
        @NotNull(message = "keywordId를 입력하세요.")
        private Long keywordId;
        @NotNull(message = "keywordTraffic를 입력하세요.")
        private String keywordTraffic;

        public NplaceCampaignTrafficKeywordTrafficEntity toEntity(NplaceCampaignTrafficKeywordEntity nplaceCampaignTrafficKeywordEntity) {
            return NplaceCampaignTrafficKeywordTrafficEntity.builder()
                    .nplaceCampaignTrafficKeywordEntity(nplaceCampaignTrafficKeywordEntity)
                    .keywordTraffic(keywordTraffic)
                    .build();
        }
    }
}
