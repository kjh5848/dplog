package kr.co.nomadlab.scrap.domain.nplace.rank.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRankTrackInfo {
        @NotNull(message = "keyword를 입력하세요.")
        @Length(min = 2, message = "keyword는 2자 이상 입력해주세요.")
        private String keyword;
        @NotBlank(message = "province를 입력하세요.")
        private String province;
        @NotBlank(message = "businessSector를 입력하세요.")
        private String businessSector;
        @NotBlank(message = "shopId를 입력하세요.")
        private String shopId;
    }
}
