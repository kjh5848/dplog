package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request;

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
public class ReqNplaceRewardUpdatePlaceDTOApiV1 {

    @Valid
    @NotNull(message = "place를 입력하세요.")
    private Place place;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Place {

        @NotNull(message = "id는 필수입니다.")
        private Long id;

        @NotNull(message = "price은 필수입니다.")
        private Integer price;

        @NotNull(message = "accountNumber은 필수입니다.")
        private String accountNumber;

        @NotNull(message = "deposit은 필수입니다.")
        private String deposit;

        @NotNull(message = "bankName은 필수입니다.")
        private String bankName;
    }

}
