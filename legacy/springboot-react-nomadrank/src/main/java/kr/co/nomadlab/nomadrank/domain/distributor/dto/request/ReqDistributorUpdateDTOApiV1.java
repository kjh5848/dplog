package kr.co.nomadlab.nomadrank.domain.distributor.dto.request;

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
public class ReqDistributorUpdateDTOApiV1 {

    @Valid
    @NotNull(message = "관리자를 입력하세요.")
    private ReqDistributorUpdateDTOApiV1.Distributor distributor;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Distributor {
        @NotNull(message = "유저ID를 입력하세요.")
        private Long userId;
        @NotNull(message = "관리자ID를 입력하세요.")
        private Long distributorId;
        private String password;
        @NotNull(message = "연락처를 입력하세요.")
        private String tel;
        @NotNull(message = "이메일을 입력하세요.")
        private String email;
        @NotNull(message = "예금주를 입력하세요.")
        private String deposit;
        @NotNull(message = "계좌번호를 입력하세요.")
        private String accountNumber;
        @NotNull(message = "은행명을 입력하세요.")
        private String bankName;

        private String googleSheetUrl;
        private String googleCredentialJson;
        private String memo;

    }

}
