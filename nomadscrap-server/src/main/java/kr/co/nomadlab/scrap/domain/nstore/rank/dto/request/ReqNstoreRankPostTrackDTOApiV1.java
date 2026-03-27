package kr.co.nomadlab.scrap.domain.nstore.rank.dto.request;

import jakarta.validation.Valid;
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
public class ReqNstoreRankPostTrackDTOApiV1 {

    @Valid
    @NotNull(message = "nstoreTrackInfo를 입력하세요.")
    private NstoreRankTrackInfo nstoreRankTrackInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NstoreRankTrackInfo {
        @NotNull(message = "keyword를 입력하세요.")
        @Length(min = 2, message = "keyword는 2자 이상 입력해주세요.")
        private String keyword;
        private String mid;
        private String productId;
    }
}
