package kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.enums.NplaceRankShopTrackInfoStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqNplaceRankChangeTrackInfoStatusDTOApiV1 {

    @Valid
    @NotNull(message = "nplaceRankTrackInfoStatus 입력하세요.")
    private NplaceRankTrackInfoStatus nplaceRankTrackInfoStatus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NplaceRankTrackInfoStatus {
        @NotNull(message = "status를 입력하세요.")
        private NplaceRankShopTrackInfoStatus status;
        @NotNull(message = "id를 입력하세요.")
        private Long id;
    }
}
