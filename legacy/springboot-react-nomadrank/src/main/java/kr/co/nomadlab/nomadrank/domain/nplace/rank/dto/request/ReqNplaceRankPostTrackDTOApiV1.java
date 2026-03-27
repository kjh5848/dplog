package kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.request.ReqNomadscrapNplaceRankPostTrackDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceRankPostTrackDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceRankTrackInfo를 입력하세요.")
    private NplaceRankTrackInfo nplaceRankTrackInfo;

    public ReqNomadscrapNplaceRankPostTrackDTO toNomadscrapDTO() {
        return ReqNomadscrapNplaceRankPostTrackDTO.builder()
                .nplaceRankTrackInfo(
                        ReqNomadscrapNplaceRankPostTrackDTO.NplaceRankTrackInfo.builder()
                                .keyword(nplaceRankTrackInfo.getKeyword())
                                .province(nplaceRankTrackInfo.getProvince())
                                .shopId(nplaceRankTrackInfo.getShopId())
                                .businessSector(nplaceRankTrackInfo.getBusinessSector())
                                .build()
                )
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRankTrackInfo {
        @NotNull(message = "keyword를 입력하세요.")
        @Length(min = 2, message = "keyword는 2자 이상 입력해주세요.")
        private String keyword;
        @NotNull(message = "province를 입력하세요.")
        private String province;
        @NotNull(message = "shopId를 입력하세요.")
        private String shopId;
        @NotNull(message = "businessSector를 입력하세요.")
        private String businessSector;
    }
}
