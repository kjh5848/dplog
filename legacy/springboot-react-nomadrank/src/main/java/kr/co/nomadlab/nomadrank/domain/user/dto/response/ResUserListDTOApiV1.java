package kr.co.nomadlab.nomadrank.domain.user.dto.response;

import kr.co.nomadlab.nomadrank.domain.auth.enums.UserStatus;
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResUserListDTOApiV1 {

    private List<User> userList;

    public static ResUserListDTOApiV1 of(
            List<UserEntity> userEntityList
    ) {
        return ResUserListDTOApiV1.builder()
                .userList(User.fromUserEntityList(userEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class User {
        private Long userId;
        private Long distributorId;
        private String companyName;
        private String username;
        private String tel;
        private UserStatus status;
        private List<Membership> membershipList;
        private LocalDateTime lastLoginDate;

        public static List<User> fromUserEntityList(List<UserEntity> userEntityList) {
            return userEntityList.stream()
                    .map(User::fromUserEntity)
                    .toList();
        }

        public static User fromUserEntity(UserEntity userEntity) {
            return User.builder()
                    .userId(userEntity.getId())
                    .distributorId(userEntity.getDistributorEntity().getId())
                    .companyName(userEntity.getCompanyName())
                    .username(userEntity.getUsername())
                    .tel(userEntity.getTel())
                    .status(userEntity.getStatus())
                    .membershipList(Membership.fromMembershipUserEntityList(userEntity.getMembershipUserEntityList())) // 멤버십 정보 추가
                    .lastLoginDate(userEntity.getLastLoginDate())
                    .build();

        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Membership {
        private String name;
        private Long membershipUserId;
        private LocalDate startDate;
        private LocalDate endDate;
        private MembershipState membershipState;

        public static List<Membership> fromMembershipUserEntityList(List<MembershipUserEntity> membershipUserEntityList) {
            return membershipUserEntityList.stream()
                    .map(Membership::fromMembershipUserEntity)
                    .toList();
        }

        public static Membership fromMembershipUserEntity(MembershipUserEntity membershipUserEntity) {
            return Membership.builder()
                    .name(membershipUserEntity.getMembershipEntity().getName())
                    .membershipUserId(membershipUserEntity.getId())
                    .startDate(membershipUserEntity.getStartDate())
                    .endDate(membershipUserEntity.getEndDate())
                    .membershipState(membershipUserEntity.getMembershipState())
                    .build();
        }
    }

}
