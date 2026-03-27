package kr.co.nomadlab.nomadrank.domain.user.dto.request;

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
public class ReqUserDTOApiV1 {

    @Valid
    @NotNull(message = "유저를 입력하세요.")
    private User user;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class User {
        @NotNull(message = "아이디를 입력하세요.")
        private String userName;
        @NotNull(message = "비밀번호를 입력하세요.")
        private String password;
        @NotNull(message = "업체명을 입력하세요.")
        private String companyName;
        @NotNull(message = "사업자등록번호를 입력하세요.")
        private String companyNumber;
        @NotNull(message = "연락처를 입력하세요.")
        private String tel;
        @NotNull(message = "이메일을 입력하세요.")
        private String email;
        @NotNull(message = "생년월일을 입력하세요.")
        private String birthDate;
        @NotNull(message = "성별을 입력하세요.")
        private String gender;
        
    }

    public UserEntity toUserEntity(ReqUserDTOApiV1 reqDto, DistributorEntity distributorEntity) {
        return UserEntity.builder()
                .distributorEntity(distributorEntity)
                .companyName(reqDto.user.companyName)
                .companyNumber(reqDto.user.companyNumber)
                .username(reqDto.user.userName)
                .password(reqDto.user.password)
                .tel(reqDto.user.tel)
                .balance(0)
                .status(UserStatus.COMPLETION)
                .authority(List.of(UserAuthoritySort.USER))
                .expireDate(LocalDateTime.of(9999, 12, 31, 0, 0, 0))
                .build();
    }
}
