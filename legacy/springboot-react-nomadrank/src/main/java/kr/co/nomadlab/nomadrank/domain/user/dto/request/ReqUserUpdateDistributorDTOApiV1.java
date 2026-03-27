package kr.co.nomadlab.nomadrank.domain.user.dto.request;

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
public class ReqUserUpdateDistributorDTOApiV1 {

    @Valid
    @NotNull(message = "유저를 입력하세요.")
    private User user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class User {
        @NotNull(message = "유저ID를 입력하세요.")
        private Long userId;
        @NotNull(message = "distirbutorId을 입력하세요.")
        private Long distirbutorId;

    }

}
