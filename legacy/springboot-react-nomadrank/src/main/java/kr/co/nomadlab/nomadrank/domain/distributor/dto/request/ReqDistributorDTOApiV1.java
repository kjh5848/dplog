package kr.co.nomadlab.nomadrank.domain.distributor.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserStatus;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqDistributorDTOApiV1 {

    @Valid
    @NotNull(message = "관리자를 입력하세요.")
    private ReqDistributorDTOApiV1.Distributor distributor;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Distributor {
        @NotNull(message = "관리자명을 입력하세요.")
        private String companyName;
        @NotNull(message = "관리자 아이디를 입력하세요.")
        private String userName;
        @NotNull(message = "관리자 비밀번호를 입력하세요.")
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
        private String memo;

    }

    public DistributorEntity toDistributorEntity(ReqDistributorDTOApiV1 reqDto) {
        return DistributorEntity.builder()
                .email(reqDto.distributor.email)
                .deposit(reqDto.distributor.deposit)
                .accountNumber(reqDto.distributor.accountNumber)
                .bankName(reqDto.distributor.bankName)
                .googleSheetUrl(reqDto.distributor.googleSheetUrl)
                .memo(reqDto.distributor.memo)
                .build();
    }

    public UserEntity toUserEntity(ReqDistributorDTOApiV1 reqDto, DistributorEntity distributorEntity) {
        return UserEntity.builder()
                .distributorEntity(distributorEntity)
                .companyName(reqDto.distributor.companyName)
                .username(reqDto.distributor.userName)
                .password(reqDto.distributor.password)
                .tel(reqDto.distributor.tel)
                .status(UserStatus.COMPLETION)
                .authority(List.of(UserAuthoritySort.DISTRIBUTOR_MANAGER))
                .balance(0)
                .expireDate(LocalDateTime.of(9999, 12, 31, 0, 0, 0))
                .build();
    }
}
