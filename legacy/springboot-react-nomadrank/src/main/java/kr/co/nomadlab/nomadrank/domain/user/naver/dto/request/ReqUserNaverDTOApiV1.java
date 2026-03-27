package kr.co.nomadlab.nomadrank.domain.user.naver.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.naver.entity.UserNaverEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReqUserNaverDTOApiV1 {

    @Valid
    @NotNull(message = "네이버 계정 정보를 입력하세요.")
    private UserNaver userNaver;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserNaver {
        @NotBlank(message = "네이버 계정은 필수입니다.")
        private String naverId;

        @NotBlank(message = "네이버 비밀번호는 필수입니다.")
        private String naverPw;
    }

    public UserNaverEntity toUserNaverEntity(UserEntity userEntity) {
        return UserNaverEntity.builder()
                .userEntity(userEntity)
                .naverId(this.userNaver.getNaverId())
                .naverPw(this.userNaver.getNaverPw())
                .build();
    }

}
