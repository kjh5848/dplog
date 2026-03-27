package kr.co.nomadlab.nomadrank.domain.user.dto.response;

import kr.co.nomadlab.nomadrank.domain.auth.enums.UserStatus;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResUserDTOApiV1 {

    private User user;

    public static ResUserDTOApiV1 of(
            UserEntity userEntity
    ) {
        return ResUserDTOApiV1.builder()
                .user(User.fromUserEntity(userEntity))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class User {
        private Long userId;
        private String companyName;
        private String companyNumber;
        private String username;
        private String tel;
        private UserStatus status;
        private LocalDateTime lastLoginDate;

        public static User fromUserEntity(UserEntity userEntity) {
            return User.builder()
                    .userId(userEntity.getId())
                    .companyName(userEntity.getCompanyName())
                    .companyNumber(userEntity.getCompanyNumber())
                    .username(userEntity.getUsername())
                    .tel(userEntity.getTel())
                    .status(userEntity.getStatus())
                    .lastLoginDate(userEntity.getLastLoginDate())
                    .build();
        }
    }

}
