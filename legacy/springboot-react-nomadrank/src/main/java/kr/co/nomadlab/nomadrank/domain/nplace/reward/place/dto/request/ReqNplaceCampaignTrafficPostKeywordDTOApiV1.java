package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficKeywordEntity;
import kr.co.nomadlab.nomadrank.model.nplace.reward.place.entity.NplaceCampaignTrafficShopEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

import java.util.ArrayList;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceCampaignTrafficPostKeywordDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceCampaignTrafficKeyword를 입력하세요.")
    private NplaceCampaignTrafficKeyword nplaceCampaignTrafficKeyword;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceCampaignTrafficKeyword {
        @NotNull(message = "keyword를 입력하세요.")
        @Length(min = 2, message = "keyword는 2자 이상 입력해주세요.")
        private String keyword;
        @NotNull(message = "shopId를 입력하세요.")
        private String shopId;

        public NplaceCampaignTrafficKeywordEntity toEntity(NplaceCampaignTrafficShopEntity nplaceCampaignTrafficShop) {
            return NplaceCampaignTrafficKeywordEntity.builder()
                    .keyword(keyword)
                    .nplaceCampaignTrafficShopEntity(nplaceCampaignTrafficShop)
                    .nplaceCampaignTrafficKeywordTrafficEntityList(new ArrayList<>())
                    .build();
        }
    }

}
