package kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceRankShopUpdateKeywordDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceRankTrackInfo를 입력하세요.")
    private NplaceRankShop nplaceRankShop;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRankShop {
        @NotNull(message = "id를 입력하세요.")
        private Long id;
    }
}
