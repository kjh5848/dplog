package kr.co.nomadlab.nomadrank.domain.user.dto.response;

import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResGetUserMembershipDTOApiV1 {

    private List<Membership> membershipList;

    public static ResGetUserMembershipDTOApiV1 of (List<MembershipUserEntity> membershipUserEntityList) {
        return ResGetUserMembershipDTOApiV1.builder()
                .membershipList(Membership.fromEntityList(membershipUserEntityList))
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Membership {
        private String membershipName;
        private LocalDate startDate;
        private LocalDate endDate;
        private MembershipState membershipState;

        public static List<Membership> fromEntityList(List<MembershipUserEntity> membershipUserEntityList) {
            return membershipUserEntityList.stream()
                    .map(Membership::fromEntity)
                    .toList();
        }

        public static Membership fromEntity(MembershipUserEntity membershipUserEntity) {
            return Membership.builder()
                    .membershipName(membershipUserEntity.getMembershipEntity().getName())
                    .startDate(membershipUserEntity.getStartDate())
                    .endDate(membershipUserEntity.getEndDate())
                    .membershipState(membershipUserEntity.getMembershipState())
                    .build();
        }
    }
}
