package kr.co.nomadlab.nomadrank.domain.user.naver.dto.response;

import kr.co.nomadlab.nomadrank.model.user.naver.entity.UserNaverEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResUserNaverDTOApiV1 {

    private UserNaver userNaver;

    public static ResUserNaverDTOApiV1 of(
            UserNaverEntity userNaverEntity
    ) {
        return ResUserNaverDTOApiV1.builder()
                .userNaver(UserNaver.fromUserNaverEntity(userNaverEntity))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserNaver {
        private Long userId;
        private String naverId;
        private String naverPw;

        public static UserNaver fromUserNaverEntity(UserNaverEntity userNaverEntity) {
            return UserNaver.builder()
                    .userId(userNaverEntity.getUserEntity().getId())
                    .naverId(userNaverEntity.getNaverId())
                    .naverPw(userNaverEntity.getNaverPw())
                    .build();
        }
    }

}
