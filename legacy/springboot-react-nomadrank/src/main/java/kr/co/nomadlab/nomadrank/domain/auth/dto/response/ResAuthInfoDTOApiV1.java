package kr.co.nomadlab.nomadrank.domain.auth.dto.response;

import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
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
public class ResAuthInfoDTOApiV1 {

    private User user;

    public static ResAuthInfoDTOApiV1 of(UserEntity userEntity) {
        return ResAuthInfoDTOApiV1.builder()
                .user(User.fromEntity(userEntity))
                .build();
    }

    public static ResAuthInfoDTOApiV1 of(User user) {
        return ResAuthInfoDTOApiV1.builder()
                .user(user)
                .build();
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class User {

        private Long id;
        private String username;
        private List<UserAuthoritySort> authority;
        private LocalDateTime expireDate;
        private DistributorEntity distributorEntity;

        public static User fromEntity(UserEntity userEntity) {
            return User.builder()
                    .id(userEntity.getId())
                    .username(userEntity.getUsername())
                    .authority(userEntity.getAuthority())
                    .expireDate(userEntity.getExpireDate())
                    .distributorEntity(userEntity.getDistributorEntity())
                    .build();
        }

    }

}
