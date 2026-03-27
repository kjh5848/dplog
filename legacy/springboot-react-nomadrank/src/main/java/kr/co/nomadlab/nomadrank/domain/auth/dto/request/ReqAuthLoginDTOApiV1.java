package kr.co.nomadlab.nomadrank.domain.auth.dto.request;

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
public class ReqAuthLoginDTOApiV1 {

    @Valid
    @NotNull(message = "user를 입력하세요.")
    private User user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class User {

        @NotNull(message = "아이디를 입력하세요.")
        private String username;
        @NotNull(message = "비밀번호를 입력하세요.")
        private String password;

    }
}
