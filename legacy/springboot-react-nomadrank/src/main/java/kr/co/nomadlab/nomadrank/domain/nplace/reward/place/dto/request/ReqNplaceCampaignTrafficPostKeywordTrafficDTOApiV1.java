package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficKeywordEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficKeywordTrafficEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceCampaignTrafficPostKeywordTrafficDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceCampaignTrafficKeywordTraffic를 입력하세요.")
    private NplaceCampaignTrafficKeywordTraffic nplaceCampaignTrafficKeywordTraffic;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceCampaignTrafficKeywordTraffic {
        @NotNull(message = "keywordTraffic를 입력하세요.")
        @Length(min = 2, message = "keywordTraffic는 2자 이상 입력해주세요.")
        private String keywordTraffic;
        @NotNull(message = "keywordId를 입력하세요.")
        private Long keywordId;
        @NotNull(message = "shopId를 입력하세요.")
        private String shopId;

        public NplaceCampaignTrafficKeywordTrafficEntity toEntity(NplaceCampaignTrafficKeywordEntity nplaceCampaignTrafficKeywordEntity) {
            return NplaceCampaignTrafficKeywordTrafficEntity.builder()
                    .keywordTraffic(keywordTraffic)
                    .nplaceCampaignTrafficKeywordEntity(nplaceCampaignTrafficKeywordEntity)
                    .build();
        }
    }

}
