package kr.co.nomadlab.nomadrank.domain.user.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqUserUpdateDTOApiV1 {

    @Valid
    @NotNull(message = "유저를 입력하세요.")
    private ReqUserUpdateDTOApiV1.User user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class User {
        @NotNull(message = "유저ID를 입력하세요.")
        private Long userId;
        @NotNull(message = "유저이름을 입력하세요.")
        private String username;
        private String password;
        @NotNull(message = "업체명을 입력하세요.")
        private String companyName;
        @NotNull(message = "연락처를 입력하세요.")
        private String tel;
        @NotNull(message = "상태를 입력하세요.")
        private UserStatus status;

    }

}
