package kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceRankChangeGroupDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceRankShopList을 입력하세요.")
    private List<NplaceRankShop> nplaceRankShopList;

    @Valid
    @NotNull(message = "group을 입력하세요.")
    private Group group;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRankShop {
        @NotNull(message = "id를 입력하세요.")
        private Long id;

    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Group {
        @NotNull(message = "id를 입력하세요.")
        private Long id;
    }
}